import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { Item, MovementType, StockMovement } from '../api/types'
import { listItems, listMovements } from '../api/inventoryApi'

function formatWhen(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function itemLabel(itemsById: Map<number, Item>, itemId: number) {
  const it = itemsById.get(itemId)
  if (!it) return `#${itemId}`
  return `${it.sku} — ${it.name}`
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [items, setItems] = useState<Item[]>([])

  const [itemId, setItemId] = useState<number | ''>('')
  const [type, setType] = useState<MovementType | ''>('')
  const [limit, setLimit] = useState<number>(100)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i] as const)), [items])

  async function refreshMeta() {
    setError(null)
    try {
      const itemsRes = await listItems()
      setItems(itemsRes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load metadata')
    }
  }

  async function refreshMovements() {
    setLoading(true)
    setError(null)
    try {
      const res = await listMovements({
        itemId: itemId === '' ? undefined : Number(itemId),
        type: type === '' ? undefined : type,
        limit,
      })
      setMovements(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load movements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshMeta()
  }, [])

  useEffect(() => {
    void refreshMovements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, type, limit])

  const movementStats = useMemo(() => {
    const total = movements.length
    const inCount = movements.filter((m) => m.type === 'IN').length
    const outCount = movements.filter((m) => m.type === 'OUT').length
    const adjustCount = movements.filter((m) => m.type === 'ADJUST').length
    return { total, inCount, outCount, adjustCount }
  }, [movements])

  return (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(15,118,110,0.10), rgba(11,92,171,0.10) 55%, rgba(255,255,255,0.65))',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
                Movements
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Activity history for stock changes.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip label={`Shown: ${movementStats.total}`} size="small" variant="outlined" />
                <Chip label={`IN: ${movementStats.inCount}`} size="small" color="success" variant="outlined" />
                <Chip label={`OUT: ${movementStats.outCount}`} size="small" color="warning" variant="outlined" />
                <Chip label={`ADJUST: ${movementStats.adjustCount}`} size="small" color="info" variant="outlined" />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => void refreshMovements()}>
                Refresh
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setItemId('')
                  setType('')
                  setLimit(100)
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Item</InputLabel>
            <Select label="Item" value={itemId} onChange={(e) => setItemId(e.target.value as any)}>
              <MenuItem value="">All</MenuItem>
              {items.map((it) => (
                <MenuItem key={it.id} value={it.id}>
                  {it.sku} — {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value as any)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
              <MenuItem value="ADJUST">ADJUST</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Limit</InputLabel>
            <Select label="Limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
              <MenuItem value={500}>500</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((m) => (
              <TableRow
                key={m.id}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'rgba(2,6,23,0.02)',
                  },
                }}
              >
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatWhen(m.occurredAt)}</TableCell>
                <TableCell>{itemLabel(itemsById, m.itemId)}</TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell align="right">{m.quantity}</TableCell>
                <TableCell>{m.note ?? ''}</TableCell>
              </TableRow>
            ))}
            {movements.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No movements
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

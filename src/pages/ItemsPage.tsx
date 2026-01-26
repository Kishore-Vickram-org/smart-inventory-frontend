import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { Item, MovementType } from '../api/types'
import { createItem, createMovement, deleteItem, listItems, updateItem } from '../api/inventoryApi'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [moveItem, setMoveItem] = useState<Item | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const itemsRes = await listItems()
      setItems(itemsRes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => {
      const hay = `${it.sku} ${it.name} ${it.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  const stats = useMemo(() => {
    const totalItems = items.length
    const totalQty = items.reduce((sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0), 0)
    const lowStock = items.filter((it) => (Number.isFinite(it.quantity) ? it.quantity : 0) <= 5).length
    return { totalItems, totalQty, lowStock }
  }, [items])

  return (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(11,92,171,0.12), rgba(15,118,110,0.10) 55%, rgba(255,255,255,0.65))',
        }}
      >
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
            Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create your own items (SKU/name) and track quantity.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              placeholder="Search by SKU, name, description…"
            />
            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ minWidth: 140 }}>
              Add Item
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(11,92,171,0.14), rgba(255,255,255,0.78) 60%)',
          }}
        >
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Total items
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {stats.totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Currently tracked SKUs
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(15,118,110,0.14), rgba(255,255,255,0.78) 60%)',
          }}
        >
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Total quantity
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {stats.totalQty}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sum of all on-hand quantities
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(244,63,94,0.12), rgba(255,255,255,0.78) 60%)',
          }}
        >
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Low stock
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {stats.lowStock}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Items with qty ≤ 5
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      {filteredItems.length === 0 && !loading ? (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              No items yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Click “Add Item” and create your first item (any SKU/name you want).
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Add Item
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {filteredItems.map((it) => (
            <Card
              key={it.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 40px rgba(2,6,23,0.10)' },
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  {it.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {it.sku}
                </Typography>
                {it.description ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {it.description}
                  </Typography>
                ) : null}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Qty: ${it.quantity}${it.unit ? ' ' + it.unit : ''}`}
                    size="small"
                    color={it.quantity <= 5 ? 'warning' : 'default'}
                    variant={it.quantity <= 5 ? 'filled' : 'outlined'}
                  />
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button variant="outlined" onClick={() => setMoveItem(it)}>
                  Adjust Stock
                </Button>
                <Button variant="outlined" onClick={() => setEditItem(it)}>
                  Edit
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={async () => {
                    setError(null)
                    try {
                      await deleteItem(it.id)
                      await refresh()
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Delete failed')
                    }
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <CreateItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false)
          await refresh()
        }}
        onError={(m) => setError(m)}
      />

      <EditItemDialog
        item={editItem}
        onClose={() => setEditItem(null)}
        onSaved={async () => {
          setEditItem(null)
          await refresh()
        }}
        onError={(m) => setError(m)}
      />

      <MoveDialog
        item={moveItem}
        onClose={() => setMoveItem(null)}
        onMoved={async () => {
          setMoveItem(null)
          await refresh()
        }}
        onError={(m) => setError(m)}
      />
    </Stack>
  )
}

function CreateItemDialog(props: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: (m: string) => void
}) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [qty, setQty] = useState(0)
  const [unit, setUnit] = useState('pcs')

  useEffect(() => {
    if (props.open) {
      setSku('')
      setName('')
      setQty(0)
      setUnit('pcs')
    }
  }, [props.open])

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(2,6,23,0.28)' },
        },
      }}
    >
      <DialogTitle>Add Item</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Quantity"
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              fullWidth
            />
            <TextField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await createItem({
                sku,
                name,
                quantity: qty,
                unit,
              })
              props.onCreated()
            } catch (e) {
              props.onError(e instanceof Error ? e.message : 'Create failed')
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function EditItemDialog(props: {
  item: Item | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const open = Boolean(props.item)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (props.item) {
      setName(props.item.name)
      setUnit(props.item.unit ?? '')
      setDescription(props.item.description ?? '')
    }
  }, [props.item])

  return (
    <Dialog
      open={open}
      onClose={props.onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(2,6,23,0.28)' },
        },
      }}
    >
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} fullWidth />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!props.item) return
            try {
              await updateItem(props.item.id, {
                name,
                unit,
                description,
              })
              props.onSaved()
            } catch (e) {
              props.onError(e instanceof Error ? e.message : 'Update failed')
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function MoveDialog(props: {
  item: Item | null
  onClose: () => void
  onMoved: () => void
  onError: (m: string) => void
}) {
  const open = Boolean(props.item)
  const [type, setType] = useState<MovementType>('IN')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (props.item) {
      setType('IN')
      setQty(1)
      setNote('')
    }
  }, [props.item])

  return (
    <Dialog
      open={open}
      onClose={props.onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(2,6,23,0.28)' },
        },
      }}
    >
      <DialogTitle>Adjust Stock</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value as MovementType)}>
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
              <MenuItem value="ADJUST">ADJUST</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={type === 'ADJUST' ? 'Quantity Delta (can be negative)' : 'Quantity'}
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            fullWidth
          />

          <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!props.item) return
            try {
              await createMovement(props.item.id, {
                type,
                quantity: qty,
                note,
              })
              props.onMoved()
            } catch (e) {
              props.onError(e instanceof Error ? e.message : 'Move failed')
            }
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  )
}

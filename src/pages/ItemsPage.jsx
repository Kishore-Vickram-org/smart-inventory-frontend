import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { createItem, deleteItem, listItems, updateItem } from '../api/inventoryApi'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

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

  async function handleCreate() {
    setError(null)
    const cleanSku = sku.trim()
    const cleanName = name.trim()
    if (!cleanSku || !cleanName) {
      setError('SKU and Name are required')
      return
    }

    try {
      await createItem({
        sku: cleanSku,
        name: cleanName,
        description: description.trim() ? description.trim() : undefined,
      })
      setSku('')
      setName('')
      setDescription('')
      await refresh()
      setToast({ open: true, message: 'Item created', severity: 'success' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    }
  }

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
            Simple CRUD: create, list, edit, delete.
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              placeholder="Search by SKU, name, description…"
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              Add Item
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onBlur={() => setSku((s) => s.trim())}
                helperText="Unique value (e.g. STEEL-001)"
                fullWidth
              />
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
            </Stack>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSku('')
                  setName('')
                  setDescription('')
                }}
              >
                Clear
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={loading}>
                Create
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Item List
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredItems.length} item(s)
          </Typography>

          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((it) => (
                  <TableRow key={it.id} hover>
                    <TableCell>{it.sku}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 360,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {it.description ?? ''}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => setEditItem(it)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setDeleteTarget(it)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <EditItemDialog
        item={editItem}
        onClose={() => setEditItem(null)}
        onSaved={async () => {
          setEditItem(null)
          await refresh()
          setToast({ open: true, message: 'Item updated', severity: 'success' })
        }}
        onError={(m) => setError(m)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete item?"
        description={deleteTarget ? `This will permanently delete “${deleteTarget.sku}”.` : ''}
        confirmText="Delete"
        confirmColor="error"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          setError(null)
          try {
            await deleteItem(deleteTarget.id)
            setDeleteTarget(null)
            await refresh()
            setToast({ open: true, message: 'Item deleted', severity: 'success' })
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Delete failed')
          }
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2400}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

function ConfirmDialog({ open, title, description, confirmText, confirmColor, onConfirm, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(2,6,23,0.28)' },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={confirmColor ?? 'primary'} onClick={onConfirm}>
          {confirmText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function EditItemDialog({ item, onClose, onSaved, onError }) {
  const open = Boolean(item)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name)
      setDescription(item.description ?? '')
    }
  }, [item])

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <TextField label="SKU" value={item?.sku ?? ''} fullWidth disabled />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!item) return
            try {
              await updateItem(item.id, {
                name,
                description,
              })
              onSaved()
            } catch (e) {
              onError(e instanceof Error ? e.message : 'Update failed')
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

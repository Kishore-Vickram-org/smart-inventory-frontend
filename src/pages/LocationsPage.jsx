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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { createLocation, deleteLocation, listLocations, updateLocation } from '../api/inventoryApi'

const LOCATION_TYPES = ['DOCK', 'YARD', 'WAREHOUSE', 'ZONE', 'AISLE', 'BIN']

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editLocation, setEditLocation] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      setLocations(await listLocations())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => {
      const hay = `${l.code} ${l.name} ${l.type}`.toLowerCase()
      return hay.includes(q)
    })
  }, [locations, query])

  return (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(11,92,171,0.10) 55%, rgba(255,255,255,0.65))',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0.2 }} noWrap>
                Locations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Simple CRUD: create, list, edit, delete.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Total: {locations.length}
              </Typography>
            </Box>

            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ minWidth: 160 }}>
              Add Location
            </Button>
          </Box>

          <TextField
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            placeholder="Search by code, name, type…"
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Location List
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredLocations.length} location(s)
          </Typography>

          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLocations.map((l) => (
                  <TableRow key={l.id} hover>
                    <TableCell>{l.code}</TableCell>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.type}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => setEditLocation(l)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => setDeleteTarget(l)}>
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

      <CreateLocationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false)
          await refresh()
          setToast({ open: true, message: 'Location created', severity: 'success' })
        }}
        onError={(m) => setError(m)}
      />

      <EditLocationDialog
        location={editLocation}
        onClose={() => setEditLocation(null)}
        onSaved={async () => {
          setEditLocation(null)
          await refresh()
          setToast({ open: true, message: 'Location updated', severity: 'success' })
        }}
        onError={(m) => setError(m)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete location?"
        description={deleteTarget ? `This will permanently delete “${deleteTarget.code}”.` : ''}
        confirmText="Delete"
        confirmColor="error"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          setError(null)
          try {
            await deleteLocation(deleteTarget.id)
            setDeleteTarget(null)
            await refresh()
            setToast({ open: true, message: 'Location deleted', severity: 'success' })
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

function CreateLocationDialog({ open, onClose, onCreated, onError }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('WAREHOUSE')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setCode('')
      setName('')
      setType('WAREHOUSE')
      setSaving(false)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Location</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(String(e.target.value))}>
              {LOCATION_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            const cleanCode = code.trim()
            const cleanName = name.trim()
            if (!cleanCode || !cleanName) {
              onError('Code and Name are required')
              return
            }
            setSaving(true)
            try {
              await createLocation({ code: cleanCode, name: cleanName, type })
              onCreated()
            } catch (e) {
              onError(e instanceof Error ? e.message : 'Create failed')
            } finally {
              setSaving(false)
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function EditLocationDialog({ location, onClose, onSaved, onError }) {
  const open = Boolean(location)
  const [name, setName] = useState('')
  const [type, setType] = useState('WAREHOUSE')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (location) {
      setName(location.name ?? '')
      setType(location.type ?? 'WAREHOUSE')
      setSaving(false)
    }
  }, [location])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Location</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Code" value={location?.code ?? ''} fullWidth disabled />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(String(e.target.value))}>
              {LOCATION_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            if (!location) return
            const cleanName = name.trim()
            if (!cleanName) {
              onError('Name is required')
              return
            }
            setSaving(true)
            try {
              await updateLocation(location.id, { name: cleanName, type })
              onSaved()
            } catch (e) {
              onError(e instanceof Error ? e.message : 'Update failed')
            } finally {
              setSaving(false)
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
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

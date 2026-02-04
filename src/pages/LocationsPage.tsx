import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
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
import type { Location, LocationType } from '../api/types'
import { createLocation, deleteLocation, listLocations, updateLocation } from '../api/inventoryApi'

const locationTypes: LocationType[] = ['DOCK', 'YARD', 'WAREHOUSE', 'ZONE', 'AISLE', 'BIN']

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [edit, setEdit] = useState<Location | null>(null)

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
                Locations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage warehouses, bins, zones, and other storage points.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Total: {locations.length}
              </Typography>
            </Box>

            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ minWidth: 160 }}>
              Add Location
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      {locations.length === 0 && !loading ? (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              No locations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add your first location (e.g. WH-1, DOCK-A, BIN-12).
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Add Location
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {locations.map((l) => (
            <Card
              key={l.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 40px rgba(2,6,23,0.10)' },
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  {l.code} — {l.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {l.type}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button variant="outlined" onClick={() => setEdit(l)}>
                  Edit
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={async () => {
                    setError(null)
                    try {
                      await deleteLocation(l.id)
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

      <CreateLocationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false)
          await refresh()
        }}
        onError={(m: string) => setError(m)}
      />

      <EditLocationDialog
        location={edit}
        onClose={() => setEdit(null)}
        onSaved={async () => {
          setEdit(null)
          await refresh()
        }}
        onError={(m: string) => setError(m)}
      />
    </Stack>
  )
}

function CreateLocationDialog(props: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: (m: string) => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<LocationType>('WAREHOUSE')

  useEffect(() => {
    if (props.open) {
      setCode('')
      setName('')
      setType('WAREHOUSE')
    }
  }, [props.open])

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Location</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value as LocationType)}>
              {locationTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await createLocation({ code, name, type })
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

function EditLocationDialog(props: {
  location: Location | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const open = Boolean(props.location)
  const [name, setName] = useState('')
  const [type, setType] = useState<LocationType>('WAREHOUSE')

  useEffect(() => {
    if (props.location) {
      setName(props.location.name)
      setType(props.location.type)
    }
  }, [props.location])

  return (
    <Dialog open={open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Location</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value as LocationType)}>
              {locationTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!props.location) return
            try {
              await updateLocation(props.location.id, { name, type })
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

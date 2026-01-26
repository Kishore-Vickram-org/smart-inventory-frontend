import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Locations</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add Location
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Alert severity="info">Loading…</Alert>}

      <Stack spacing={1}>
        {locations.map((l) => (
          <Box
            key={l.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {l.code} — {l.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {l.type}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
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
            </Stack>
          </Box>
        ))}
      </Stack>

      <CreateLocationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false)
          await refresh()
        }}
        onError={(m) => setError(m)}
      />

      <EditLocationDialog
        location={edit}
        onClose={() => setEdit(null)}
        onSaved={async () => {
          setEdit(null)
          await refresh()
        }}
        onError={(m) => setError(m)}
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

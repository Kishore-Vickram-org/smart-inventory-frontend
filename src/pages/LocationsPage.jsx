import { useEffect, useMemo, useState } from 'react'
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

  const [toast, setToast] = useState(null)

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
    <div className="page">
      <div className="hero">
        <div>
          <h1 className="hero__title">Locations</h1>
          <p className="hero__subtitle">Create • Read • Update • Delete</p>
        </div>
        <div className="hero__actions">
          <button className="btn" type="button" onClick={() => setCreateOpen(true)}>
            Add Location
          </button>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? <div className="alert">Loading…</div> : null}

      <section className="card">
        <div className="card__head">
          <h2 className="card__title">Location List</h2>
          <div className="card__tools">
            <input
              className="input"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="muted">{filteredLocations.length} location(s)</div>
          </div>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.code}</td>
                  <td>{l.name}</td>
                  <td>
                    <span className="badge">{l.type}</span>
                  </td>
                  <td className="right">
                    <div className="rowActions">
                      <button className="btn btn--small btn--ghost" type="button" onClick={() => setEditLocation(l)}>
                        Edit
                      </button>
                      <button className="btn btn--small btn--danger" type="button" onClick={() => setDeleteTarget(l)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={createOpen} title="Add Location" onClose={() => setCreateOpen(false)}>
        <LocationForm
          mode="create"
          location={null}
          onCancel={() => setCreateOpen(false)}
          onError={setError}
          onSaved={async () => {
            setCreateOpen(false)
            await refresh()
            setToast('Location created')
          }}
        />
      </Modal>

      <Modal open={Boolean(editLocation)} title="Edit Location" onClose={() => setEditLocation(null)}>
        <LocationForm
          mode="edit"
          location={editLocation}
          onCancel={() => setEditLocation(null)}
          onError={setError}
          onSaved={async () => {
            setEditLocation(null)
            await refresh()
            setToast('Location updated')
          }}
        />
      </Modal>

      <Modal open={Boolean(deleteTarget)} title="Delete location?" onClose={() => setDeleteTarget(null)}>
        <p className="muted">This will permanently delete “{deleteTarget?.code}”.</p>
        <div className="actions">
          <button className="btn btn--ghost" type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>
          <button
            className="btn btn--danger"
            type="button"
            onClick={async () => {
              if (!deleteTarget) return
              setError(null)
              try {
                await deleteLocation(deleteTarget.id)
                setDeleteTarget(null)
                await refresh()
                setToast('Location deleted')
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Delete failed')
              }
            }}
          >
            Delete
          </button>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  )
}

function LocationForm({ mode, location, onCancel, onSaved, onError }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('WAREHOUSE')

  useEffect(() => {
    if (mode === 'edit' && location) {
      setCode(location.code ?? '')
      setName(location.name ?? '')
      setType(location.type ?? 'WAREHOUSE')
    }
    if (mode === 'create') {
      setCode('')
      setName('')
      setType('WAREHOUSE')
    }
  }, [mode, location])

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        const cleanCode = code.trim()
        const cleanName = name.trim()
        if (mode === 'create' && (!cleanCode || !cleanName)) {
          onError('Code and Name are required')
          return
        }
        if (mode === 'edit' && !cleanName) {
          onError('Name is required')
          return
        }

        try {
          if (mode === 'create') {
            await createLocation({ code: cleanCode, name: cleanName, type })
          } else {
            await updateLocation(location.id, { name: cleanName, type })
          }
          onSaved()
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Save failed')
        }
      }}
    >
      <div className="form__row">
        <label className="label">
          Code
          <input
            className="input"
            value={mode === 'edit' ? (location?.code ?? '') : code}
            onChange={(e) => setCode(e.target.value)}
            disabled={mode === 'edit'}
            placeholder="e.g. WH-1"
          />
        </label>
        <label className="label">
          Name
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Warehouse 1" />
        </label>
      </div>

      <label className="label">
        Type
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {LOCATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="actions">
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn" type="submit">
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button className="modal__backdrop" type="button" onClick={onClose} aria-label="Close" />
      <div className="modal__panel">
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="btn btn--small btn--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
      <button className="toast__close" type="button" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { createItem, deleteItem, listItems, updateItem } from '../api/inventoryApi'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [toast, setToast] = useState(null)

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
      setToast('Item created')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    }
  }

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1 className="hero__title">Items</h1>
          <p className="hero__subtitle">Create • Read • Update • Delete</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? <div className="alert">Loading…</div> : null}

      <div className="grid">
        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Add Item</h2>
            <div className="card__tools">
              <input
                className="input"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form">
            <div className="form__row">
              <label className="label">
                SKU
                <input
                  className="input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  onBlur={() => setSku((s) => s.trim())}
                  placeholder="e.g. STEEL-001"
                />
              </label>
              <label className="label">
                Name
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
              </label>
            </div>

            <label className="label">
              Description (optional)
              <textarea
                className="input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description…"
              />
            </label>

            <div className="actions">
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => {
                  setSku('')
                  setName('')
                  setDescription('')
                }}
              >
                Clear
              </button>
              <button className="btn" type="button" onClick={handleCreate} disabled={loading}>
                Create
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Item List</h2>
            <div className="muted">{filteredItems.length} item(s)</div>
          </div>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it) => (
                  <tr key={it.id}>
                    <td className="mono">{it.sku}</td>
                    <td>{it.name}</td>
                    <td className="ellipsis" title={it.description ?? ''}>
                      {it.description ?? ''}
                    </td>
                    <td className="right">
                      <div className="rowActions">
                        <button className="btn btn--small btn--ghost" type="button" onClick={() => setEditItem(it)}>
                          Edit
                        </button>
                        <button className="btn btn--small btn--danger" type="button" onClick={() => setDeleteTarget(it)}>
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
      </div>

      <Modal open={Boolean(editItem)} title="Edit Item" onClose={() => setEditItem(null)}>
        <EditItemForm
          item={editItem}
          onCancel={() => setEditItem(null)}
          onError={setError}
          onSaved={async () => {
            setEditItem(null)
            await refresh()
            setToast('Item updated')
          }}
        />
      </Modal>

      <Modal open={Boolean(deleteTarget)} title="Delete item?" onClose={() => setDeleteTarget(null)}>
        <p className="muted">This will permanently delete “{deleteTarget?.sku}”.</p>
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
                await deleteItem(deleteTarget.id)
                setDeleteTarget(null)
                await refresh()
                setToast('Item deleted')
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

function EditItemForm({ item, onCancel, onSaved, onError }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name ?? '')
      setDescription(item.description ?? '')
    }
  }, [item])

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!item) return
        try {
          await updateItem(item.id, { name: name.trim(), description: description.trim() ? description.trim() : undefined })
          onSaved()
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Update failed')
        }
      }}
    >
      <div className="form__row">
        <label className="label">
          SKU
          <input className="input" value={item?.sku ?? ''} disabled />
        </label>
        <label className="label">
          Name
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </div>

      <label className="label">
        Description
        <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div className="actions">
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn" type="submit">
          Save
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

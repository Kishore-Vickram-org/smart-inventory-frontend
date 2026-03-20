import { useEffect, useMemo, useState } from 'react'
import { createItem, deleteItem, listItems, updateItem } from '../api/inventoryApi'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

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

  // 🔄 Fetch Items
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
    refresh()
  }, [])

  // 🔍 Search Filter
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items

    return items.filter((it) => {
      const hay = `${it.sku} ${it.name} ${it.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  // 📥 CSV DOWNLOAD
  function handleDownloadCSV() {
    if (!items.length) return

    const headers = ['SKU', 'Name', 'Description']

    const rows = items.map((it) => [
      it.sku,
      it.name,
      it.description ?? ''
    ])

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(','))
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'items.csv'
    link.click()
  }

  // ➕ Create Item
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
        description: description.trim() || undefined,
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
      {/* HEADER */}
      <div className="hero">
        <h1>Items</h1>
        <p>Create • Read • Update • Delete</p>
      </div>

      {/* ALERTS */}
      {error && <div className="alert alert--error">{error}</div>}
      {loading && <div className="alert">Loading...</div>}

      <div className="grid">
        {/* ADD ITEM */}
        <section className="card">
          <div className="card__head">
            <h2>Add Item</h2>
            <input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="form">
            <input
              placeholder="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button onClick={handleCreate}>Create</button>
          </div>
        </section>

        {/* ITEM LIST */}
        <section className="card">
          <div className="card__head">
            <h2>Item List ({filteredItems.length})</h2>

            {/* ✅ DOWNLOAD BUTTON */}
            <button onClick={handleDownloadCSV}>
              Download CSV
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((it) => (
                <tr key={it.id}>
                  <td>{it.sku}</td>
                  <td>{it.name}</td>
                  <td>{it.description}</td>

                  <td>
                    <button onClick={() => setEditItem(it)}>Edit</button>
                    <button onClick={() => setDeleteTarget(it)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* EDIT MODAL */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)}>
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

      {/* DELETE MODAL */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <p>Delete {deleteTarget?.sku}?</p>

        <button onClick={() => setDeleteTarget(null)}>Cancel</button>

        <button
          onClick={async () => {
            await deleteItem(deleteTarget.id)
            setDeleteTarget(null)
            await refresh()
            setToast('Item deleted')
          }}
        >
          Delete
        </button>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  )
}

// ✏️ EDIT FORM
function EditItemForm({ item, onCancel, onSaved, onError }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setDescription(item.description || '')
    }
  }, [item])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()

        try {
          await updateItem(item.id, {
            name: name.trim(),
            description: description.trim() || undefined,
          })
          onSaved()
        } catch {
          onError('Update failed')
        }
      }}
    >
      <input value={item?.sku} disabled />
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="submit">Save</button>
    </form>
  )
}
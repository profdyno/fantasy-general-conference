import { useState, useEffect } from 'react'
import { getDefaultLists, addDefaultOption, deleteDefaultOption } from '../../api/client'

const styles = {
  intro: { fontSize: '14px', color: '#666', marginBottom: '16px' },
  card: {
    background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '12px' },
  count: { fontSize: '13px', fontWeight: 400, color: '#888', marginLeft: '6px' },
  row: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' },
  input: {
    flex: 1, minWidth: '180px', padding: '8px 10px', borderRadius: '4px',
    border: '1px solid #d1d5db', fontSize: '14px',
  },
  btn: {
    padding: '8px 16px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 500,
    background: '#1e3a5f', color: '#fff',
  },
  list: {
    display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '280px', overflowY: 'auto',
    padding: '4px 0',
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 6px 4px 10px',
    borderRadius: '999px', background: '#eff6ff', border: '1px solid #bfdbfe',
    fontSize: '13px', color: '#1e3a5f',
  },
  removeBtn: {
    border: 'none', background: 'transparent', color: '#dc2626', fontSize: '15px',
    lineHeight: 1, padding: '0 4px', cursor: 'pointer',
  },
  empty: { fontSize: '13px', color: '#888' },
  error: { fontSize: '13px', color: '#dc2626', marginBottom: '8px' },
  message: { fontSize: '14px', color: '#16a34a', marginTop: '8px' },
}

const LISTS = [
  { key: 'topics', title: 'Conference Topics', placeholder: 'Add a topic, e.g. Covenant Path' },
  { key: 'hymns', title: 'Songs', placeholder: 'Add a song, e.g. Come, Thou Fount' },
]

function ListCard({ title, placeholder, items, onAdd, onRemove }) {
  const [value, setValue] = useState('')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!value.trim()) return
    setError(null)
    try {
      await onAdd(value.trim())
      setValue('')
    } catch (err) {
      setError(err.message)
    }
  }

  const shown = filter
    ? items.filter(i => i.value.toLowerCase().includes(filter.toLowerCase()))
    : items

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>
        {title}<span style={styles.count}>({items.length})</span>
      </div>
      <form style={styles.row} onSubmit={handleAdd}>
        <input style={styles.input} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
        <button type="submit" style={styles.btn}>Add</button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.row}>
        <input style={styles.input} value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search this list..." />
      </div>
      <div style={styles.list}>
        {shown.map(item => (
          <span key={item.id} style={styles.chip}>
            {item.value}
            <button style={styles.removeBtn} title={`Remove ${item.value}`} onClick={() => onRemove(item)}>×</button>
          </span>
        ))}
        {shown.length === 0 && <span style={styles.empty}>{filter ? 'No matches' : 'No entries yet'}</span>}
      </div>
    </div>
  )
}

export default function DefaultLists() {
  const [lists, setLists] = useState({ topics: [], hymns: [] })
  const [message, setMessage] = useState(null)

  useEffect(() => { loadLists() }, [])

  async function loadLists() {
    try {
      setLists(await getDefaultLists())
    } catch (e) {
      flash(e.message)
    }
  }

  function flash(msg) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleAdd(list, value) {
    const added = await addDefaultOption(list, value)
    setLists(l => ({
      ...l,
      [list]: [...l[list], added].sort((a, b) => a.value.localeCompare(b.value, undefined, { sensitivity: 'base' })),
    }))
    flash(`Added "${added.value}"`)
  }

  async function handleRemove(list, item) {
    if (!confirm(`Remove "${item.value}" from the default list?`)) return
    try {
      await deleteDefaultOption(list, item.id)
      setLists(l => ({ ...l, [list]: l[list].filter(i => i.id !== item.id) }))
      flash(`Removed "${item.value}"`)
    } catch (e) {
      flash(e.message)
    }
  }

  return (
    <div>
      <div style={styles.intro}>
        These lists fill the topic and song dropdowns when a new conference game is set up.
        Changes here don't affect games that already exist.
      </div>
      {LISTS.map(({ key, title, placeholder }) => (
        <ListCard
          key={key}
          title={title}
          placeholder={placeholder}
          items={lists[key] || []}
          onAdd={value => handleAdd(key, value)}
          onRemove={item => handleRemove(key, item)}
        />
      ))}
      {message && <div style={styles.message}>{message}</div>}
    </div>
  )
}

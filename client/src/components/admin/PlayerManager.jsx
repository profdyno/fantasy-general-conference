import { useState, useEffect } from 'react'
import { getPlayers, createPlayer, deletePlayer } from '../../api/client'

const styles = {
  addRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
  input: {
    flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  addBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
  },
  card: {
    background: '#fff', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px',
    border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '12px',
  },
  name: { fontWeight: 500, fontSize: '15px' },
  url: { fontSize: '12px', color: '#666', marginTop: '2px', fontFamily: 'monospace' },
  actions: { display: 'flex', gap: '8px', flexShrink: 0 },
  copyBtn: {
    background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  removeBtn: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  copied: { fontSize: '11px', color: '#16a34a', fontWeight: 500 },
  count: { fontSize: '13px', color: '#888', marginBottom: '12px' },
}

export default function PlayerManager() {
  const [players, setPlayers] = useState([])
  const [newName, setNewName] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { loadPlayers() }, [])

  async function loadPlayers() {
    const ps = await getPlayers()
    setPlayers(ps)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    await createPlayer(newName.trim())
    setNewName('')
    loadPlayers()
  }

  async function handleRemove(id) {
    if (!confirm('Remove this player?')) return
    await deletePlayer(id)
    loadPlayers()
  }

  function handleCopy(slug) {
    const url = `${window.location.origin}/play/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(slug)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div>
      <div style={styles.addRow}>
        <input
          style={styles.input}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Player name (e.g. John Doe)"
        />
        <button style={styles.addBtn} onClick={handleAdd}>Add Player</button>
      </div>

      <div style={styles.count}>{players.length} players</div>

      {players.map(p => (
        <div key={p.id} style={styles.card}>
          <div>
            <div style={styles.name}>{p.name}</div>
            <div style={styles.url}>/play/{p.slug}</div>
          </div>
          <div style={styles.actions}>
            {copiedId === p.slug ? (
              <span style={styles.copied}>Copied!</span>
            ) : (
              <button style={styles.copyBtn} onClick={() => handleCopy(p.slug)}>Copy URL</button>
            )}
            <button style={styles.removeBtn} onClick={() => handleRemove(p.id)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}

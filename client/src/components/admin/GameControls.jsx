import { useState, useEffect } from 'react'
import { getAllGames, createGame, updateGame, activateGame, deleteGame, lockSubmissions, unlockSubmissions, recomputeScores } from '../../api/client'

const styles = {
  card: {
    background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '12px' },
  row: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' },
  btn: { padding: '8px 16px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 500 },
  lockBtn: { background: '#dc2626', color: '#fff' },
  unlockBtn: { background: '#16a34a', color: '#fff' },
  recomputeBtn: { background: '#d97706', color: '#fff' },
  primaryBtn: { background: '#1e3a5f', color: '#fff' },
  dangerBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  activateBtn: { background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe' },
  info: { fontSize: '13px', color: '#666', marginTop: '8px' },
  status: { fontSize: '14px', fontWeight: 500 },
  locked: { color: '#dc2626' },
  unlocked: { color: '#16a34a' },
  message: { fontSize: '14px', color: '#16a34a', marginTop: '8px' },
  gameRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
    padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '8px',
  },
  activeGame: { background: '#eff6ff', borderColor: '#bfdbfe' },
  gameName: { fontWeight: 500, fontSize: '14px' },
  activeTag: {
    background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700,
    padding: '2px 8px', borderRadius: '3px',
  },
  input: {
    flex: 1, padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  select: {
    padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  editRow: { display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px' },
}

export default function GameControls({ game, onUpdate }) {
  const [games, setGames] = useState([])
  const [message, setMessage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [newSeason, setNewSeason] = useState('april')

  useEffect(() => { loadGames() }, [])

  async function loadGames() {
    try { setGames(await getAllGames()) } catch {}
  }

  function flash(msg) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 2500)
  }

  async function handleLock() {
    await lockSubmissions(); flash('Submissions locked!'); onUpdate()
  }
  async function handleUnlock() {
    await unlockSubmissions(); flash('Submissions unlocked!'); onUpdate()
  }
  async function handleRecompute() {
    await recomputeScores(); flash('All scores recomputed!')
  }

  async function handleActivate(id) {
    await activateGame(id); flash('Game switched!'); loadGames(); onUpdate()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this game and all its questions, answers, and scores?')) return
    try {
      await deleteGame(id); flash('Game deleted!'); loadGames()
    } catch (e) {
      flash(e.message)
    }
  }

  function startRename(g) {
    setEditingId(g.id); setEditName(g.name)
  }

  async function saveRename() {
    await updateGame(editingId, { name: editName })
    setEditingId(null); flash('Game renamed!'); loadGames(); onUpdate()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      await createGame(newName.trim(), newYear, newSeason)
      setShowCreate(false); setNewName(''); flash('Game created!'); loadGames()
    } catch (e) {
      flash(e.message)
    }
  }

  return (
    <div>
      {/* Active game controls */}
      {game && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Active Game: {game.name}</div>
          <div style={styles.status}>
            Submissions: <span style={game.submissions_locked ? styles.locked : styles.unlocked}>
              {game.submissions_locked ? 'LOCKED' : 'OPEN'}
            </span>
          </div>
          <div style={styles.info}>
            Lock submissions when conference starts. Fields marked LIVE (speaker live guesses, topics) remain editable.
          </div>
          <div style={styles.row}>
            {game.submissions_locked ? (
              <button style={{ ...styles.btn, ...styles.unlockBtn }} onClick={handleUnlock}>Unlock Submissions</button>
            ) : (
              <button style={{ ...styles.btn, ...styles.lockBtn }} onClick={handleLock}>Lock Submissions</button>
            )}
            <button style={{ ...styles.btn, ...styles.recomputeBtn }} onClick={handleRecompute}>Recompute Scores</button>
          </div>
        </div>
      )}

      {/* Game list */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>All Games</div>
        {games.map(g => (
          <div key={g.id}>
            <div style={{ ...styles.gameRow, ...(g.is_active ? styles.activeGame : {}) }}>
              <div>
                <span style={styles.gameName}>{g.name}</span>
                {g.is_active ? <span style={{ ...styles.activeTag, marginLeft: '8px' }}>ACTIVE</span> : null}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ ...styles.btn, ...styles.activateBtn, fontSize: '12px', padding: '4px 10px' }} onClick={() => startRename(g)}>Rename</button>
                {!g.is_active && (
                  <>
                    <button style={{ ...styles.btn, ...styles.activateBtn, fontSize: '12px', padding: '4px 10px' }} onClick={() => handleActivate(g.id)}>Set Active</button>
                    <button style={{ ...styles.btn, ...styles.dangerBtn, fontSize: '12px', padding: '4px 10px' }} onClick={() => handleDelete(g.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
            {editingId === g.id && (
              <div style={styles.editRow}>
                <input style={styles.input} value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRename()} autoFocus />
                <button style={{ ...styles.btn, ...styles.primaryBtn, fontSize: '12px' }} onClick={saveRename}>Save</button>
                <button style={{ ...styles.btn, fontSize: '12px', background: '#f3f4f6', color: '#555', border: '1px solid #d1d5db' }} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}

        {showCreate ? (
          <div style={{ ...styles.card, border: '2px solid #1e3a5f', marginTop: '12px' }}>
            <div style={{ ...styles.sectionTitle, marginBottom: '8px' }}>New Game</div>
            <div style={styles.editRow}>
              <input style={styles.input} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Game name" autoFocus />
              <input type="number" style={{ ...styles.input, maxWidth: '80px' }} value={newYear} onChange={e => setNewYear(Number(e.target.value))} />
              <select style={styles.select} value={newSeason} onChange={e => setNewSeason(e.target.value)}>
                <option value="april">April</option>
                <option value="october">October</option>
                <option value="test">Test</option>
              </select>
            </div>
            <div style={{ ...styles.row, marginTop: '8px' }}>
              <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={handleCreate}>Create</button>
              <button style={{ ...styles.btn, background: '#f3f4f6', color: '#555', border: '1px solid #d1d5db' }} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button style={{ ...styles.btn, ...styles.primaryBtn, marginTop: '12px' }} onClick={() => setShowCreate(true)}>+ Create New Game</button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  )
}

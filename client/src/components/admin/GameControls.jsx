import { useState } from 'react'
import { lockSubmissions, unlockSubmissions, recomputeScores } from '../../api/client'

const styles = {
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '12px' },
  card: {
    background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px',
    border: '1px solid #e5e7eb',
  },
  row: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  btn: {
    padding: '10px 20px', borderRadius: '6px', border: 'none',
    fontSize: '14px', fontWeight: 500,
  },
  lockBtn: { background: '#dc2626', color: '#fff' },
  unlockBtn: { background: '#16a34a', color: '#fff' },
  recomputeBtn: { background: '#d97706', color: '#fff' },
  info: { fontSize: '13px', color: '#666', marginTop: '8px' },
  status: { fontSize: '14px', fontWeight: 500 },
  locked: { color: '#dc2626' },
  unlocked: { color: '#16a34a' },
  message: { fontSize: '14px', color: '#16a34a', marginTop: '8px' },
}

export default function GameControls({ game, onUpdate }) {
  const [message, setMessage] = useState(null)

  async function handleLock() {
    await lockSubmissions()
    setMessage('Submissions locked!')
    onUpdate()
    setTimeout(() => setMessage(null), 2000)
  }

  async function handleUnlock() {
    await unlockSubmissions()
    setMessage('Submissions unlocked!')
    onUpdate()
    setTimeout(() => setMessage(null), 2000)
  }

  async function handleRecompute() {
    await recomputeScores()
    setMessage('All scores recomputed!')
    setTimeout(() => setMessage(null), 2000)
  }

  if (!game) return <div>Loading game info...</div>

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Game: {game.name}</div>
        <div style={styles.status}>
          Submissions: <span style={game.submissions_locked ? styles.locked : styles.unlocked}>
            {game.submissions_locked ? 'LOCKED' : 'OPEN'}
          </span>
        </div>
        <div style={styles.info}>
          Lock submissions when conference starts to prevent changes. Unlock to allow players to edit answers.
        </div>
        <div style={{ ...styles.row, marginTop: '12px' }}>
          {game.submissions_locked ? (
            <button style={{ ...styles.btn, ...styles.unlockBtn }} onClick={handleUnlock}>
              Unlock Submissions
            </button>
          ) : (
            <button style={{ ...styles.btn, ...styles.lockBtn }} onClick={handleLock}>
              Lock Submissions
            </button>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Scoring</div>
        <div style={styles.info}>
          Recompute all scores from scratch. Use this if you changed scoring rules on any questions.
        </div>
        <div style={{ ...styles.row, marginTop: '12px' }}>
          <button style={{ ...styles.btn, ...styles.recomputeBtn }} onClick={handleRecompute}>
            Recompute All Scores
          </button>
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  )
}

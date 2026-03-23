import { useState, useEffect } from 'react'
import { adminLogin, getGame } from '../../api/client'
import QuestionManager from './QuestionManager'
import ActualsEntry from './ActualsEntry'
import PlayerManager from './PlayerManager'
import GameControls from './GameControls'

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', marginBottom: '24px' },
  loginBox: {
    maxWidth: '400px', margin: '80px auto', background: '#fff', borderRadius: '12px',
    padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center',
  },
  loginTitle: { fontSize: '22px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db',
    fontSize: '16px', marginBottom: '12px',
  },
  loginBtn: {
    width: '100%', padding: '10px', borderRadius: '6px', border: 'none',
    background: '#1e3a5f', color: '#fff', fontSize: '16px', fontWeight: 600,
  },
  error: { color: '#dc2626', fontSize: '14px', marginTop: '8px' },
  tabs: {
    display: 'flex', gap: '4px', marginBottom: '24px', padding: '4px',
    background: '#e5e7eb', borderRadius: '8px', flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'transparent',
    fontSize: '14px', fontWeight: 500, color: '#555',
  },
  activeTab: {
    background: '#fff', color: '#1e3a5f', fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(!!sessionStorage.getItem('adminKey'))
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('questions')
  const [game, setGame] = useState(null)

  useEffect(() => {
    if (authenticated) loadGame()
  }, [authenticated])

  async function loadGame() {
    try {
      const g = await getGame()
      setGame(g)
    } catch (e) {
      console.error('Failed to load game:', e)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    try {
      await adminLogin(password)
      sessionStorage.setItem('adminKey', password)
      setAuthenticated(true)
    } catch (e) {
      setError(e.message)
    }
  }

  if (!authenticated) {
    return (
      <div style={styles.loginBox}>
        <div style={styles.loginTitle}>Admin Login</div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
          />
          <button type="submit" style={styles.loginBtn}>Login</button>
        </form>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    )
  }

  const tabs = [
    { id: 'questions', label: 'Questions' },
    { id: 'players', label: 'Players' },
    { id: 'actuals', label: 'Enter Actuals' },
    { id: 'settings', label: 'Game Settings' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.title}>Admin Dashboard</div>

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.activeTab : {}) }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'questions' && <QuestionManager />}
      {activeTab === 'players' && <PlayerManager />}
      {activeTab === 'actuals' && <ActualsEntry />}
      {activeTab === 'settings' && <GameControls game={game} onUpdate={loadGame} />}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { getLeaderboard, getSessions, getPlayerScores } from '../../api/client'
import useSSE from '../../hooks/useSSE'
import PlayerScoreRow from './PlayerScoreRow'
import SessionScoreTabs from './SessionScoreTabs'

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', marginBottom: '24px', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { background: '#1e3a5f', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 },
  thRight: { textAlign: 'right' },
  empty: { textAlign: 'center', padding: '48px 16px', color: '#666', fontSize: '16px' },
  liveIndicator: {
    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
    background: '#22c55e', marginRight: '8px', animation: 'pulse 2s infinite',
  },
  liveText: { fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' },
}

export default function ScoreboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [expandedPlayer, setExpandedPlayer] = useState(null)
  const [playerScores, setPlayerScores] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [lb, sess] = await Promise.all([
        getLeaderboard(activeSession),
        getSessions(),
      ])
      setLeaderboard(lb)
      setSessions(sess)
    } catch (e) {
      console.error('Failed to load leaderboard:', e)
    }
  }, [activeSession])

  useEffect(() => { loadData() }, [loadData])

  useSSE('/api/events/scores', () => { loadData() })

  async function handleExpand(playerId) {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null)
      setPlayerScores(null)
      return
    }
    setExpandedPlayer(playerId)
    try {
      const scores = await getPlayerScores(playerId)
      setPlayerScores(scores)
    } catch (e) {
      console.error('Failed to load player scores:', e)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Scoreboard</div>

      <SessionScoreTabs
        sessions={sessions}
        activeSession={activeSession}
        onSelect={setActiveSession}
      />

      {leaderboard.length === 0 ? (
        <div style={styles.empty}>No scores yet. Check back once the game begins!</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Player</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Points</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Correct</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <PlayerScoreRow
                key={entry.id}
                rank={i + 1}
                entry={entry}
                expanded={expandedPlayer === entry.id}
                details={expandedPlayer === entry.id ? playerScores : null}
                onToggle={() => handleExpand(entry.id)}
              />
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.liveText}>
        <span style={styles.liveIndicator}></span>
        Live updates enabled
      </div>
    </div>
  )
}

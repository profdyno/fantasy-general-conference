import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../api/client'
import useSSE from '../../hooks/useSSE'

const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}']

const s = {
  wrapper: {
    maxWidth: '393px', // iPhone 16 width
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2540 100%)',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    padding: '48px 24px 32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.5px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '18px',
    color: '#93c5fd',
    marginTop: '8px',
    fontWeight: 500,
  },
  datetime: {
    fontSize: '13px',
    color: '#7dd3fc',
    marginTop: '6px',
    fontWeight: 400,
  },
  podium: {
    padding: '0 20px 32px',
  },
  placeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 20px',
    borderRadius: '16px',
    marginBottom: '12px',
  },
  first: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '2px solid #f59e0b',
    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
  },
  second: {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    border: '2px solid #94a3b8',
    boxShadow: '0 4px 16px rgba(148, 163, 184, 0.3)',
  },
  third: {
    background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
    border: '2px solid #f97316',
    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.2)',
  },
  medal: {
    fontSize: '50px',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '25px',
    fontWeight: 700,
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tiedNames: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  score: {
    fontSize: '35px',
    fontWeight: 800,
    color: '#1e3a5f',
    flexShrink: 0,
    textAlign: 'right',
  },
  scoreSuffix: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#64748b',
  },
  penalty: {
    fontSize: '11px',
    color: '#dc2626',
    fontWeight: 500,
  },
  tieLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  empty: {
    textAlign: 'center',
    color: '#93c5fd',
    fontSize: '16px',
    padding: '48px 24px',
  },
}

const placeStyles = [s.first, s.second, s.third]

function formatDateTime() {
  const now = new Date()
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const date = now.toLocaleDateString('en-US', opts)
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} ${time}`
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [dateTime, setDateTime] = useState(formatDateTime())

  async function loadData() {
    try {
      const lb = await getLeaderboard()
      setLeaderboard(lb)
    } catch (e) {
      console.error('Failed to load leaderboard:', e)
    }
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => {
    const timer = setInterval(() => setDateTime(formatDateTime()), 30000)
    return () => clearInterval(timer)
  }, [])
  useSSE('/api/events/scores', () => { loadData() })

  if (leaderboard.length === 0) {
    return (
      <div style={s.wrapper}>
        <div style={s.header}>
          <div style={s.title}>Fantasy<br />General Conference</div>
        </div>
        <div style={s.empty}>No scores yet!</div>
      </div>
    )
  }

  // Group by rank, handling ties
  const places = [] // [{ rank, score, players: [...] }]
  let currentRank = 0
  let lastScore = null

  for (const entry of leaderboard) {
    const pts = Math.round(entry.total_points * 10) / 10
    if (pts !== lastScore) {
      currentRank = places.length + 1
      if (currentRank > 3) break
      places.push({ rank: currentRank, score: pts, players: [entry] })
      lastScore = pts
    } else {
      places[places.length - 1].players.push(entry)
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <div style={s.title}>Fantasy<br />General Conference</div>
        <div style={s.subtitle}>Leaderboard</div>
        <div style={s.datetime}>{dateTime}</div>
      </div>
      <div style={s.podium}>
        {places.map(place => {
          const medalIdx = place.rank - 1
          const isTie = place.players.length > 1
          return (
            <div key={place.rank} style={{ ...s.placeCard, ...(placeStyles[medalIdx] || {}) }}>
              <div style={s.medal}>{medals[medalIdx] || ''}</div>
              <div style={s.info}>
                {isTie ? (
                  <>
                    <div style={s.tiedNames}>
                      {place.players.map(p => p.name).join(', ')}
                    </div>
                    <div style={s.tieLabel}>Tied</div>
                  </>
                ) : (
                  <div style={s.name}>{place.players[0].name}</div>
                )}
                {place.players[0].penalty_points > 0 && (
                  <div style={s.penalty}>-{place.players[0].penalty_points} penalties</div>
                )}
              </div>
              <div style={s.score}>
                {place.score}
                <div style={s.scoreSuffix}>pts</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

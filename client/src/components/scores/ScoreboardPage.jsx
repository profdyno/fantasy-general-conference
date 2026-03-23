import { useState, useEffect, useCallback, Fragment } from 'react'
import { getScoreMatrix } from '../../api/client'
import useSSE from '../../hooks/useSSE'
import { formatValue } from '../../utils/format'

const COL_W = 90
const Q_COL_W = 260

const s = {
  container: { padding: '24px 16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px', textAlign: 'center' },
  wrapper: {
    position: 'relative', overflow: 'auto', maxHeight: 'calc(100vh - 120px)',
    border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff',
  },
  table: { borderCollapse: 'separate', borderSpacing: 0, minWidth: '100%' },
  // Frozen header cells (player names)
  thPlayer: {
    position: 'sticky', top: 0, zIndex: 3, background: '#1e3a5f', color: '#fff',
    padding: '10px 6px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
    width: COL_W, minWidth: COL_W, maxWidth: COL_W, borderBottom: '2px solid #0f2540',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  // Frozen top-left corner (intersection)
  thCorner: {
    position: 'sticky', top: 0, left: 0, zIndex: 5, background: '#1e3a5f', color: '#fff',
    padding: '10px 12px', textAlign: 'left', fontSize: '13px', fontWeight: 600,
    width: Q_COL_W, minWidth: Q_COL_W, borderBottom: '2px solid #0f2540',
    borderRight: '2px solid #0f2540',
  },
  // Frozen total row
  totalCorner: {
    position: 'sticky', top: 40, left: 0, zIndex: 5, background: '#eef2ff', color: '#1e3a5f',
    padding: '8px 12px', fontWeight: 700, fontSize: '14px',
    borderBottom: '2px solid #1e3a5f', borderRight: '2px solid #0f2540',
  },
  thTotal: {
    position: 'sticky', top: 40, zIndex: 3, background: '#eef2ff', color: '#1e3a5f',
    padding: '8px 6px', textAlign: 'center', fontWeight: 700, fontSize: '16px',
    borderBottom: '2px solid #1e3a5f',
  },
  // Frozen question column
  tdQuestion: {
    position: 'sticky', left: 0, zIndex: 2, background: '#f8fafc',
    padding: '6px 10px', fontSize: '13px', borderBottom: '1px solid #e5e7eb',
    borderRight: '2px solid #e2e8f0', width: Q_COL_W, minWidth: Q_COL_W,
  },
  qText: { fontWeight: 500, color: '#333', lineHeight: 1.3 },
  qMeta: { fontSize: '11px', color: '#888', marginTop: '2px' },
  // Category header row
  catRow: {
    position: 'sticky', left: 0, zIndex: 2, background: '#1e3a5f', color: '#fff',
    padding: '6px 12px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px',
    borderBottom: '1px solid #0f2540',
  },
  catFill: {
    background: '#1e3a5f', borderBottom: '1px solid #0f2540', padding: 0,
  },
  // Score cells
  td: {
    padding: '6px 4px', textAlign: 'center', fontSize: '14px',
    borderBottom: '1px solid #f1f5f9', width: COL_W, minWidth: COL_W, maxWidth: COL_W,
  },
  scoreCorrect: { color: '#16a34a', fontWeight: 700 },
  scorePartial: { color: '#d97706', fontWeight: 600 },
  scoreZero: { color: '#ccc' },
  scoreNone: { color: '#e5e7eb' },
  penaltyVal: { color: '#dc2626', fontWeight: 700 },
  highlight: { background: '#fffbeb' },
  liveText: {
    fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px',
  },
  liveDot: {
    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
    background: '#22c55e', marginRight: '8px',
  },
  rankBadge: { fontSize: '10px', display: 'block', marginTop: '2px' },
}

export default function ScoreboardPage() {
  const [data, setData] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setData(await getScoreMatrix())
    } catch (e) {
      console.error('Failed to load scores:', e)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useSSE('/api/events/scores', () => { loadData() })

  if (!data) return <div style={s.container}><div style={s.title}>Scoreboard</div><div style={{ textAlign: 'center', color: '#888' }}>Loading...</div></div>

  const { questions, players: rawPlayers, scores, penalties, totals, answers, actuals } = data

  if (rawPlayers.length === 0) {
    return <div style={s.container}><div style={s.title}>Scoreboard</div><div style={{ textAlign: 'center', color: '#888', padding: '48px' }}>No players yet. Check back once the game begins!</div></div>
  }

  // Sort players: current player first, then A-Z
  const currentSlug = sessionStorage.getItem('playerSlug') || ''
  const players = [...rawPlayers].sort((a, b) => {
    if (a.slug === currentSlug) return -1
    if (b.slug === currentSlug) return 1
    return a.name.localeCompare(b.name)
  })

  // Rank players by total score
  const ranked = [...players].sort((a, b) => (totals[b.id]?.total || 0) - (totals[a.id]?.total || 0))
  const rankMap = {}
  ranked.forEach((p, i) => { rankMap[p.id] = i + 1 })
  const medals = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' }

  // Determine which players' answers the current viewer can see
  const currentPlayer = rawPlayers.find(p => p.slug === currentSlug)
  const canSeeAnswers = new Set()
  if (currentPlayer) {
    // Everyone can see their own answers
    canSeeAnswers.add(currentPlayer.id)
    if (currentPlayer.role === 'grandparent') {
      // Grandparents see everyone
      rawPlayers.forEach(p => canSeeAnswers.add(p.id))
    } else if (currentPlayer.role === 'parent') {
      // Parents see their children
      rawPlayers.forEach(p => {
        if (p.parent1_id === currentPlayer.id || p.parent2_id === currentPlayer.id) {
          canSeeAnswers.add(p.id)
        }
      })
    }
  }

  // Group questions by category
  const categoryOrder = []
  const categoryMap = {}
  for (const q of questions) {
    const cat = q.category || 'General'
    if (!categoryMap[cat]) {
      categoryMap[cat] = []
      categoryOrder.push(cat)
    }
    categoryMap[cat].push(q)
  }

  // For speaker groups, collapse 4 questions per speaker into one row
  function getSpeakerLabel(q) {
    if (q.group_key) return `${q.group_key} — ${q.text}`
    return q.text
  }

  // Total points possible per category
  function catPointsPossible(qs) {
    return qs.reduce((sum, q) => sum + q.points, 0)
  }

  function renderScoreCell(qId, playerId) {
    const key = `${qId}-${playerId}`
    const sc = scores[key]
    const answer = answers ? answers[key] : null
    const showAnswer = canSeeAnswers.has(playerId) && answer

    if (!sc) {
      return (
        <td key={playerId} style={s.td}>
          <span style={s.scoreNone}>—</span>
          {showAnswer && <div style={{ fontSize: '10px', color: '#999', marginTop: '2px', lineHeight: 1.2, wordBreak: 'break-word' }}>{formatValue(answer)}</div>}
        </td>
      )
    }

    const pts = Math.round(sc.points_earned * 10) / 10
    let style = s.scoreZero
    if (sc.is_correct) style = s.scoreCorrect
    else if (pts > 0) style = s.scorePartial

    return (
      <td key={playerId} style={{ ...s.td, ...(playerId === players[0]?.id && currentSlug ? s.highlight : {}) }}>
        <span style={style}>{pts}</span>
        {showAnswer && <div style={{ fontSize: '10px', color: '#888', marginTop: '2px', lineHeight: 1.2, wordBreak: 'break-word' }}>{formatValue(answer)}</div>}
      </td>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.title}>Scoreboard</div>
      <div style={s.wrapper}>
        <table style={s.table}>
          <thead>
            {/* Player name row */}
            <tr>
              <th style={s.thCorner}>Question</th>
              {players.map(p => (
                <th key={p.id} style={{ ...s.thPlayer, ...(p.slug === currentSlug ? { background: '#2d5a8e' } : {}) }}>
                  {p.name}
                  {medals[rankMap[p.id]] && <span style={s.rankBadge}>{medals[rankMap[p.id]]}</span>}
                </th>
              ))}
            </tr>
            {/* Total row */}
            <tr>
              <td style={s.totalCorner}>TOTAL SCORE</td>
              {players.map(p => {
                const t = totals[p.id] || { total: 0, penalty: 0 }
                return (
                  <td key={p.id} style={{ ...s.thTotal, ...(p.slug === currentSlug ? { background: '#e0e7ff' } : {}) }}>
                    {Math.round(t.total * 10) / 10}
                    {t.penalty > 0 && <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 500 }}>(-{t.penalty})</div>}
                  </td>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map(cat => {
              const qs = categoryMap[cat]
              const listCategories = ['U.S. Temples', 'Worldwide Temples', 'Topics', 'Songs', 'Other Speakers']
              const showActualsInHeader = listCategories.includes(cat)

              // Collect actuals for this category's header
              let headerActuals = ''
              if (showActualsInHeader && actuals) {
                const vals = new Set()
                for (const q of qs) {
                  if (actuals[q.id]) {
                    // Parse JSON arrays, or use raw value
                    try {
                      const parsed = JSON.parse(actuals[q.id])
                      if (Array.isArray(parsed)) parsed.forEach(v => vals.add(v))
                      else vals.add(actuals[q.id])
                    } catch {
                      vals.add(actuals[q.id])
                    }
                  }
                }
                if (vals.size > 0) headerActuals = [...vals].join('; ')
              }

              return (
                <Fragment key={cat}>
                  {/* Category header */}
                  <tr>
                    <td style={s.catRow}>
                      {cat} ({catPointsPossible(qs)} pts)
                      {headerActuals && <span style={{ fontWeight: 400, opacity: 0.85 }}> | {headerActuals}</span>}
                    </td>
                    {players.map(p => <td key={p.id} style={s.catFill} />)}
                  </tr>
                  {/* Question rows */}
                  {qs.map(q => (
                    <tr key={q.id}>
                      <td style={s.tdQuestion}>
                        <div style={s.qText}>{getSpeakerLabel(q)}</div>
                        <div style={s.qMeta}>
                          {q.points} pts
                          {!showActualsInHeader && actuals && actuals[q.id] && (
                            <span style={{ color: '#16a34a', fontWeight: 600 }}> | {formatValue(actuals[q.id])}</span>
                          )}
                        </div>
                      </td>
                      {players.map(p => renderScoreCell(q.id, p.id))}
                    </tr>
                  ))}
                </Fragment>
              )
            })}
            {/* Penalty row */}
            <tr>
              <td style={{ ...s.tdQuestion, fontWeight: 700, color: '#dc2626', borderTop: '2px solid #dc2626' }}>
                PENALTIES
              </td>
              {players.map(p => {
                const pen = penalties[p.id] || 0
                return (
                  <td key={p.id} style={{ ...s.td, borderTop: '2px solid #dc2626' }}>
                    {pen > 0 ? <span style={s.penaltyVal}>-{pen}</span> : <span style={s.scoreNone}>0</span>}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={s.liveText}>
        <span style={s.liveDot}></span>
        Live updates enabled
      </div>
    </div>
  )
}

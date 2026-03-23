import { useState, useEffect } from 'react'
import { getAllowedPenalties, updatePenaltyAsPlayer } from '../../api/client'

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#666', marginBottom: '24px' },
  info: { fontSize: '13px', color: '#666', marginBottom: '16px' },
  noAccess: { textAlign: 'center', padding: '64px 16px', fontSize: '16px', color: '#888' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' },
  th: { background: '#1e3a5f', color: '#fff', padding: '10px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 600 },
  thName: { textAlign: 'left' },
  td: { padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', fontSize: '14px' },
  tdName: { textAlign: 'left', fontWeight: 500 },
  countCell: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  countBtn: {
    width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db',
    background: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  count: { minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '16px' },
  countNonZero: { color: '#dc2626' },
  totalCell: { fontWeight: 700, color: '#dc2626', fontSize: '15px' },
}

export default function PenaltyPage() {
  const [allowed, setAllowed] = useState([])
  const [types, setTypes] = useState([])
  const [penaltyMap, setPenaltyMap] = useState({})
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const slug = sessionStorage.getItem('playerSlug') || ''

  useEffect(() => { loadData() }, [])

  async function loadData() {
    if (!slug) { setLoading(false); return }
    try {
      const data = await getAllowedPenalties(slug)
      setAllowed(data.allowed)
      setTypes(data.types)
      setRole(data.role)
      const map = {}
      for (const p of data.penalties) {
        map[`${p.player_id}-${p.penalty_type}`] = p.count
      }
      setPenaltyMap(map)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function getCount(playerId, type) {
    return penaltyMap[`${playerId}-${type}`] || 0
  }

  async function adjust(playerId, type, delta) {
    const current = getCount(playerId, type)
    const next = Math.max(0, Math.min(10, current + delta))
    if (next === current) return

    setPenaltyMap(prev => ({ ...prev, [`${playerId}-${type}`]: next }))
    await updatePenaltyAsPlayer(slug, playerId, type, next)
  }

  function playerTotal(playerId) {
    let total = 0
    for (const type of types) {
      total += getCount(playerId, type)
    }
    return total * 5
  }

  if (loading) return <div style={styles.container}>Loading...</div>

  if (!slug) {
    return (
      <div style={styles.container}>
        <div style={styles.noAccess}>
          Open your player link first, then come back to this page.
        </div>
      </div>
    )
  }

  if (role === 'child' || allowed.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Penalties</div>
        <div style={styles.noAccess}>
          {role === 'child' ? 'Only parents and grandparents can assign penalties.' : 'No players available.'}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Penalties</div>
      <div style={styles.subtitle}>
        {role === 'grandparent' ? 'You can assign penalties to everyone.' : 'You can assign penalties to yourself and your children.'}
      </div>
      <div style={styles.info}>
        Subtract 5 points per infraction (max 10 per category). Approved activities don't count.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thName }}>Player</th>
              {types.map(t => <th key={t} style={styles.th}>{t}</th>)}
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {allowed.map(p => (
              <tr key={p.id}>
                <td style={{ ...styles.td, ...styles.tdName }}>{p.name}</td>
                {types.map(t => {
                  const count = getCount(p.id, t)
                  return (
                    <td key={t} style={styles.td}>
                      <div style={styles.countCell}>
                        <button style={styles.countBtn} onClick={() => adjust(p.id, t, -1)}>-</button>
                        <span style={{ ...styles.count, ...(count > 0 ? styles.countNonZero : {}) }}>{count}</span>
                        <button style={styles.countBtn} onClick={() => adjust(p.id, t, 1)}>+</button>
                      </div>
                    </td>
                  )
                })}
                <td style={{ ...styles.td, ...styles.totalCell }}>
                  {playerTotal(p.id) > 0 ? `-${playerTotal(p.id)}` : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

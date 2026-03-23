import { useState, useEffect } from 'react'
import { getPlayers, getPenalties, updatePenalty } from '../../api/client'

const styles = {
  info: { fontSize: '13px', color: '#666', marginBottom: '16px' },
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

export default function PenaltyManager() {
  const [players, setPlayers] = useState([])
  const [penaltyTypes, setPenaltyTypes] = useState([])
  const [penaltyMap, setPenaltyMap] = useState({}) // { "playerId-type": count }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [ps, penData] = await Promise.all([getPlayers(), getPenalties()])
    setPlayers(ps)
    setPenaltyTypes(penData.types)

    const map = {}
    for (const p of penData.penalties) {
      map[`${p.player_id}-${p.penalty_type}`] = p.count
    }
    setPenaltyMap(map)
  }

  function getCount(playerId, type) {
    return penaltyMap[`${playerId}-${type}`] || 0
  }

  async function adjust(playerId, type, delta) {
    const current = getCount(playerId, type)
    const next = Math.max(0, Math.min(10, current + delta))
    if (next === current) return

    setPenaltyMap(prev => ({ ...prev, [`${playerId}-${type}`]: next }))
    await updatePenalty(playerId, type, next)
  }

  function playerTotal(playerId) {
    let total = 0
    for (const type of penaltyTypes) {
      total += getCount(playerId, type)
    }
    return total * 5
  }

  if (players.length === 0) return <div>Add players first to track penalties.</div>

  return (
    <div>
      <div style={styles.info}>
        Subtract 5 points for each infraction (max 10 per category). Click + / - to track.
        Approved activities by Mom or Dad should not be counted.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thName }}>Player</th>
              {penaltyTypes.map(t => <th key={t} style={styles.th}>{t}</th>)}
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td style={{ ...styles.td, ...styles.tdName }}>{p.name}</td>
                {penaltyTypes.map(t => {
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

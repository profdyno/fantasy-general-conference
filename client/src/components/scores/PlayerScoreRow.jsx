const styles = {
  row: {
    cursor: 'pointer', transition: 'background 0.15s',
  },
  td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '15px' },
  tdRight: { textAlign: 'right' },
  rank: { fontWeight: 700, width: '50px' },
  name: { fontWeight: 500 },
  points: { fontWeight: 700, color: '#1e3a5f', fontSize: '18px' },
  medal: { fontSize: '20px', marginRight: '4px' },
  detailRow: { background: '#f8fafc' },
  detailTd: { padding: '8px 16px 8px 60px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#555' },
  detailPoints: { fontWeight: 600 },
  correct: { color: '#16a34a' },
  wrong: { color: '#dc2626' },
  partial: { color: '#d97706' },
}

const medals = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' }

export default function PlayerScoreRow({ rank, entry, expanded, details, onToggle }) {
  return (
    <>
      <tr style={{ ...styles.row, background: expanded ? '#f0f9ff' : 'transparent' }} onClick={onToggle}>
        <td style={{ ...styles.td, ...styles.rank }}>
          {medals[rank] ? <span style={styles.medal}>{medals[rank]}</span> : rank}
        </td>
        <td style={{ ...styles.td, ...styles.name }}>{entry.name}</td>
        <td style={{ ...styles.td, ...styles.tdRight, ...styles.points }}>
          {Math.round(entry.total_points * 10) / 10}
          {entry.penalty_points > 0 && (
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 400 }}>(-{entry.penalty_points} penalties)</div>
          )}
        </td>
        <td style={{ ...styles.td, ...styles.tdRight }}>
          {entry.correct_count}/{entry.answered_count}
        </td>
      </tr>
      {expanded && details && details.map(d => (
        <tr key={d.question_id} style={styles.detailRow}>
          <td style={styles.detailTd}></td>
          <td style={styles.detailTd}>
            {d.session_name && <span style={{ color: '#999', marginRight: '8px' }}>[{d.session_name}]</span>}
            {d.question_text}
          </td>
          <td style={{ ...styles.detailTd, ...styles.tdRight, ...styles.detailPoints }}>
            <span style={d.is_correct ? styles.correct : d.points_earned > 0 ? styles.partial : styles.wrong}>
              {Math.round(d.points_earned * 10) / 10}/{d.max_points}
            </span>
          </td>
          <td style={{ ...styles.detailTd, ...styles.tdRight, fontSize: '12px', color: '#888' }}>
            {d.answer_value || '—'} {d.actual_value ? `(actual: ${d.actual_value})` : ''}
          </td>
        </tr>
      ))}
    </>
  )
}

import { useState, useEffect } from 'react'
import { getQuestions, getSessions, getActuals, submitActual } from '../../api/client'

const styles = {
  sessionLabel: {
    fontSize: '16px', fontWeight: 600, color: '#1e3a5f', marginTop: '20px', marginBottom: '8px',
    borderBottom: '1px solid #e5e7eb', paddingBottom: '4px',
  },
  card: {
    background: '#fff', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px',
    border: '1px solid #e5e7eb',
  },
  question: { fontSize: '14px', fontWeight: 500, marginBottom: '8px' },
  meta: { fontSize: '12px', color: '#888', marginBottom: '8px' },
  inputRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: {
    flex: 1, padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  saveBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px',
    padding: '8px 14px', fontSize: '13px', fontWeight: 500,
  },
  saved: {
    background: '#f0fdf4', borderColor: '#86efac',
  },
  savedBadge: { fontSize: '11px', color: '#16a34a', fontWeight: 600 },
  select: {
    flex: 1, padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
}

export default function ActualsEntry() {
  const [questions, setQuestions] = useState([])
  const [sessions, setSessions] = useState([])
  const [actuals, setActuals] = useState({})
  const [values, setValues] = useState({})
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [qs, sess, acts] = await Promise.all([getQuestions(), getSessions(), getActuals()])
    setQuestions(qs)
    setSessions(sess)

    const actMap = {}
    const valMap = {}
    for (const a of acts) {
      actMap[a.question_id] = a.actual_value
      valMap[a.question_id] = a.actual_value
    }
    setActuals(actMap)
    setValues(v => ({ ...valMap, ...v }))
  }

  async function handleSave(questionId) {
    const val = values[questionId]
    if (val === undefined || val === '') return
    await submitActual(questionId, val)
    setActuals(prev => ({ ...prev, [questionId]: val }))
    setSavedIds(prev => new Set([...prev, questionId]))
    setTimeout(() => setSavedIds(prev => { const next = new Set(prev); next.delete(questionId); return next }), 2000)
  }

  // Group by session
  const grouped = { null: { name: 'Conference-Wide', questions: [] } }
  for (const s of sessions) {
    grouped[s.id] = { name: s.name, questions: [] }
  }
  for (const q of questions) {
    const key = q.session_id || null
    if (!grouped[key]) grouped[key] = { name: 'Unknown', questions: [] }
    grouped[key].questions.push(q)
  }

  function renderInput(q) {
    const options = q.options ? JSON.parse(q.options) : []

    if (q.question_type === 'multiple_choice') {
      return (
        <select
          style={styles.select}
          value={values[q.id] || ''}
          onChange={e => setValues(v => ({ ...v, [q.id]: e.target.value }))}
        >
          <option value="">Select actual answer...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
          <option value="__custom__">Custom value...</option>
        </select>
      )
    }

    if (q.question_type === 'yes_no') {
      return (
        <select
          style={styles.select}
          value={values[q.id] || ''}
          onChange={e => setValues(v => ({ ...v, [q.id]: e.target.value }))}
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      )
    }

    return (
      <input
        type={q.question_type === 'number' ? 'number' : 'text'}
        style={styles.input}
        value={values[q.id] || ''}
        onChange={e => setValues(v => ({ ...v, [q.id]: e.target.value }))}
        placeholder="Enter actual answer..."
      />
    )
  }

  return (
    <div>
      {Object.entries(grouped).map(([key, { name, questions: qs }]) => {
        if (qs.length === 0 && key !== 'null') return null
        return (
          <div key={key}>
            <div style={styles.sessionLabel}>{name}</div>
            {qs.map(q => (
              <div key={q.id} style={{ ...styles.card, ...(actuals[q.id] ? styles.saved : {}) }}>
                <div style={styles.question}>
                  {q.text}
                  {actuals[q.id] && <span style={styles.savedBadge}> (Scored)</span>}
                </div>
                <div style={styles.meta}>{q.question_type} | {q.scoring_type} | {q.points} pts</div>
                <div style={styles.inputRow}>
                  {renderInput(q)}
                  <button
                    style={styles.saveBtn}
                    onClick={() => handleSave(q.id)}
                  >
                    {savedIds.has(q.id) ? 'Saved!' : actuals[q.id] ? 'Update' : 'Save & Score'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

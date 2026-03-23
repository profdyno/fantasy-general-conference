import { useState, useEffect } from 'react'
import { getQuestions, getSessions, createQuestion, updateQuestion, deleteQuestion } from '../../api/client'

const styles = {
  section: { marginBottom: '32px' },
  addBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '14px', fontWeight: 500, marginBottom: '16px',
  },
  card: {
    background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '8px',
    border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '12px',
  },
  cardText: { fontSize: '14px', fontWeight: 500 },
  cardMeta: { fontSize: '12px', color: '#888', marginTop: '4px' },
  actions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: {
    background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  deleteBtn: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  form: {
    background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px',
    border: '2px solid #1e3a5f',
  },
  formRow: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '4px' },
  input: {
    width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  select: {
    width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  formActions: { display: 'flex', gap: '8px', marginTop: '16px' },
  saveBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 20px', fontSize: '14px', fontWeight: 500,
  },
  cancelBtn: {
    background: '#f3f4f6', color: '#555', border: '1px solid #d1d5db', borderRadius: '6px',
    padding: '8px 20px', fontSize: '14px',
  },
  sessionLabel: {
    fontSize: '16px', fontWeight: 600, color: '#1e3a5f', marginTop: '20px', marginBottom: '8px',
    borderBottom: '1px solid #e5e7eb', paddingBottom: '4px',
  },
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
]

const SCORING_TYPES = [
  { value: 'boolean', label: 'Boolean (Yes/No match)' },
  { value: 'exact', label: 'Exact Match' },
  { value: 'closest', label: 'Closest Number' },
  { value: 'contains', label: 'Contains / Partial' },
  { value: 'custom_points', label: 'Manual (Admin scores)' },
]

const emptyForm = {
  session_id: '', text: '', question_type: 'yes_no', options: '',
  scoring_type: 'boolean', points: 10, bonus_points: 0, tolerance: '',
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState([])
  const [sessions, setSessions] = useState([])
  const [editing, setEditing] = useState(null) // null or question id or 'new'
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [qs, sess] = await Promise.all([getQuestions(), getSessions()])
    setQuestions(qs)
    setSessions(sess)
  }

  function startNew() {
    setEditing('new')
    setForm({ ...emptyForm })
  }

  function startEdit(q) {
    setEditing(q.id)
    setForm({
      session_id: q.session_id || '',
      text: q.text,
      question_type: q.question_type,
      options: q.options || '',
      scoring_type: q.scoring_type,
      points: q.points,
      bonus_points: q.bonus_points || 0,
      tolerance: q.tolerance || '',
    })
  }

  async function handleSave() {
    const data = {
      ...form,
      session_id: form.session_id || null,
      options: form.options ? (typeof form.options === 'string' ? JSON.parse(form.options) : form.options) : null,
      tolerance: form.tolerance === '' ? null : Number(form.tolerance),
    }

    if (editing === 'new') {
      await createQuestion(data)
    } else {
      await updateQuestion(editing, data)
    }
    setEditing(null)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return
    await deleteQuestion(id)
    loadData()
  }

  // Group questions by session
  const grouped = { null: { name: 'Conference-Wide', questions: [] } }
  for (const s of sessions) {
    grouped[s.id] = { name: s.name, questions: [] }
  }
  for (const q of questions) {
    const key = q.session_id || null
    if (!grouped[key]) grouped[key] = { name: 'Unknown', questions: [] }
    grouped[key].questions.push(q)
  }

  function renderForm() {
    return (
      <div style={styles.form}>
        <div style={styles.formRow}>
          <label style={styles.label}>Question Text</label>
          <input
            style={styles.input}
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="Enter question..."
          />
        </div>
        <div style={styles.row2}>
          <div style={styles.formRow}>
            <label style={styles.label}>Session</label>
            <select style={styles.select} value={form.session_id} onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}>
              <option value="">Conference-Wide</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={styles.formRow}>
            <label style={styles.label}>Question Type</label>
            <select style={styles.select} value={form.question_type} onChange={e => setForm(f => ({ ...f, question_type: e.target.value }))}>
              {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        {form.question_type === 'multiple_choice' && (
          <div style={styles.formRow}>
            <label style={styles.label}>Options (JSON array, e.g. ["A", "B", "C"])</label>
            <input
              style={styles.input}
              value={form.options}
              onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
              placeholder='["Option 1", "Option 2", "Option 3"]'
            />
          </div>
        )}
        <div style={styles.row2}>
          <div style={styles.formRow}>
            <label style={styles.label}>Scoring Type</label>
            <select style={styles.select} value={form.scoring_type} onChange={e => setForm(f => ({ ...f, scoring_type: e.target.value }))}>
              {SCORING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={styles.formRow}>
            <label style={styles.label}>Points</label>
            <input
              type="number"
              style={styles.input}
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
            />
          </div>
        </div>
        {form.scoring_type === 'closest' && (
          <div style={styles.row2}>
            <div style={styles.formRow}>
              <label style={styles.label}>Bonus Points (exact match)</label>
              <input
                type="number"
                style={styles.input}
                value={form.bonus_points}
                onChange={e => setForm(f => ({ ...f, bonus_points: Number(e.target.value) }))}
              />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Tolerance (within N = full points)</label>
              <input
                type="number"
                style={styles.input}
                value={form.tolerance}
                onChange={e => setForm(f => ({ ...f, tolerance: e.target.value }))}
              />
            </div>
          </div>
        )}
        <div style={styles.formActions}>
          <button style={styles.saveBtn} onClick={handleSave}>Save</button>
          <button style={styles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button style={styles.addBtn} onClick={startNew}>+ Add Question</button>
      {editing === 'new' && renderForm()}

      {Object.entries(grouped).map(([key, { name, questions: qs }]) => {
        if (qs.length === 0 && key !== 'null') return null
        return (
          <div key={key}>
            <div style={styles.sessionLabel}>{name}</div>
            {qs.map(q => (
              <div key={q.id}>
                {editing === q.id ? renderForm() : (
                  <div style={styles.card}>
                    <div>
                      <div style={styles.cardText}>{q.text}</div>
                      <div style={styles.cardMeta}>
                        {q.question_type} | {q.scoring_type} | {q.points} pts
                        {q.bonus_points ? ` (+${q.bonus_points} bonus)` : ''}
                        {q.tolerance ? ` | tol: ${q.tolerance}` : ''}
                      </div>
                    </div>
                    <div style={styles.actions}>
                      <button style={styles.editBtn} onClick={() => startEdit(q)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(q.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getQuestions, getActuals, submitActual, getAllAnswers } from '../../api/client'
import CityAutocomplete from '../play/CityAutocomplete'

const styles = {
  categoryHeader: {
    fontSize: '20px', fontWeight: 700, color: '#1e3a5f', marginTop: '28px', marginBottom: '16px',
    borderBottom: '3px solid #1e3a5f', paddingBottom: '8px',
  },
  card: {
    background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '12px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  cardScored: { background: '#f0fdf4', borderColor: '#86efac' },
  text: { fontSize: '15px', fontWeight: 500, marginBottom: '4px' },
  points: { fontSize: '12px', color: '#666', marginBottom: '8px' },
  scoredBadge: { color: '#16a34a', fontWeight: 600, fontSize: '12px', marginLeft: '8px' },
  inputRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: {
    flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px',
  },
  select: {
    flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', background: '#fff',
  },
  saveBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
  },
  savedBtn: { background: '#16a34a' },
  speakerCard: {
    background: '#fff', borderRadius: '10px', padding: '18px', marginBottom: '14px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  speakerScored: { background: '#f0fdf4', borderColor: '#86efac' },
  speakerName: { fontSize: '17px', fontWeight: 700, color: '#1e3a5f', marginBottom: '12px' },
  speakerField: { marginBottom: '10px' },
  fieldLabel: { fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '4px' },
  fieldInput: {
    width: '100%', padding: '7px 10px', borderRadius: '5px',
    border: '1px solid #d1d5db', fontSize: '14px',
  },
  fieldRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  fieldSaveBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px',
    padding: '6px 12px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
  },
  yesNoGroup: { display: 'flex', gap: '12px', flex: 1 },
  yesNoBtn: {
    flex: 1, padding: '8px', borderRadius: '6px', border: '2px solid #d1d5db',
    background: '#fff', fontSize: '14px', fontWeight: 500, textAlign: 'center', cursor: 'pointer',
  },
  yesNoBtnActive: { borderColor: '#1e3a5f', background: '#eff6ff', color: '#1e3a5f' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 4px 4px 10px',
    borderRadius: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a5f', fontSize: '13px',
  },
  chipRemove: {
    border: 'none', background: 'transparent', color: '#dc2626', fontSize: '15px',
    cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
}

export default function ActualsEntry() {
  const [questions, setQuestions] = useState([])
  const [actuals, setActuals] = useState({})
  const [values, setValues] = useState({})
  const [savedIds, setSavedIds] = useState(new Set())
  const [allAnswers, setAllAnswers] = useState({}) // { questionId: [{ player, value }] }

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [qs, acts, answers] = await Promise.all([getQuestions(), getActuals(), getAllAnswers()])
    setQuestions(qs)
    setAllAnswers(answers)
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

  function setVal(id, v) {
    setValues(prev => ({ ...prev, [id]: v }))
  }

  function renderInput(q) {
    const options = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
    const val = values[q.id] || ''

    switch (q.question_type) {
      case 'yes_no':
        return (
          <div style={styles.yesNoGroup}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                style={{ ...styles.yesNoBtn, ...(val.toLowerCase() === opt.toLowerCase() ? styles.yesNoBtnActive : {}) }}
                onClick={() => setVal(q.id, opt.toLowerCase())}
              >
                {opt}
              </button>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div style={styles.radioGroup}>
            {options.map(opt => (
              <label key={opt} style={styles.radioLabel}>
                <input type="radio" name={`act-${q.id}`} value={opt} checked={val === opt} onChange={() => setVal(q.id, opt)} />
                {opt}
              </label>
            ))}
          </div>
        )

      case 'select': {
        // Actual may have several correct values (e.g. multi-colored choir); stored as JSON array
        let selected = []
        try {
          const parsed = val ? JSON.parse(val) : []
          selected = Array.isArray(parsed) ? parsed : [String(parsed)]
        } catch { selected = val ? [val] : [] }
        function add(opt) {
          if (!opt || selected.includes(opt)) return
          setVal(q.id, JSON.stringify([...selected, opt]))
        }
        function remove(opt) {
          const next = selected.filter(s => s !== opt)
          setVal(q.id, next.length ? JSON.stringify(next) : '')
        }
        return (
          <div style={{ flex: 1 }}>
            {selected.length > 0 && (
              <div style={styles.chipRow}>
                {selected.map(s => (
                  <span key={s} style={styles.chip}>
                    {s}
                    <button type="button" style={styles.chipRemove} onClick={() => remove(s)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <select style={{ ...styles.select, width: '100%' }} value="" onChange={e => add(e.target.value)}>
              <option value="">{selected.length ? '-- Add another --' : '-- Select --'}</option>
              {options.filter(o => !selected.includes(o)).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )
      }

      case 'dropdown':
        return (
          <>
            <input list={`act-dl-${q.id}`} style={styles.input} value={val} onChange={e => setVal(q.id, e.target.value)} placeholder="Select or type..." />
            <datalist id={`act-dl-${q.id}`}>
              {options.map(o => <option key={o} value={o} />)}
            </datalist>
          </>
        )

      case 'multi_select': {
        let selected = []
        try { selected = val ? JSON.parse(val) : [] } catch { selected = [] }
        if (!Array.isArray(selected)) selected = []
        function toggle(opt) {
          const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]
          setVal(q.id, JSON.stringify(next))
        }
        return (
          <div style={styles.checkboxGroup}>
            {options.map(opt => (
              <label key={opt} style={styles.checkboxLabel}>
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
        )
      }

      case 'checkbox_list': {
        // For actuals, admin enters which speakers actually spoke (JSON array)
        let selected = []
        try { selected = val ? JSON.parse(val) : [] } catch { selected = [] }
        if (!Array.isArray(selected)) selected = []
        const isGrouped = options.length > 0 && typeof options[0] === 'object' && options[0].group
        const allNames = isGrouped ? options.flatMap(g => g.names) : options
        function toggleCb(name) {
          const next = selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name]
          setVal(q.id, JSON.stringify(next))
        }
        return (
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Check all who actually spoke:</div>
            {isGrouped ? options.map(grp => (
              <div key={grp.group} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>{grp.group}</div>
                <div style={styles.checkboxGroup}>
                  {grp.names.map(name => (
                    <label key={name} style={styles.checkboxLabel}>
                      <input type="checkbox" checked={selected.includes(name)} onChange={() => toggleCb(name)} />
                      {name}
                    </label>
                  ))}
                </div>
              </div>
            )) : (
              <div style={styles.checkboxGroup}>
                {allNames.map(name => (
                  <label key={name} style={styles.checkboxLabel}>
                    <input type="checkbox" checked={selected.includes(name)} onChange={() => toggleCb(name)} />
                    {name}
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      }

      case 'city_us':
        return <CityAutocomplete value={val} onChange={v => setVal(q.id, v)} disabled={false} country="us" />

      case 'city_world':
        return <CityAutocomplete value={val} onChange={v => setVal(q.id, v)} disabled={false} country="world" />

      case 'text':
      case 'number':
      default:
        return (
          <input
            type={q.question_type === 'number' ? 'number' : 'text'}
            style={styles.input}
            value={val}
            onChange={e => setVal(q.id, e.target.value)}
            placeholder="Enter actual answer..."
          />
        )
    }
  }

  function renderSaveBtn(q) {
    if (savedIds.has(q.id)) return <button style={{ ...styles.fieldSaveBtn, background: '#16a34a' }}>Saved!</button>
    return (
      <button style={styles.fieldSaveBtn} onClick={() => handleSave(q.id)}>
        {actuals[q.id] ? 'Update' : 'Score'}
      </button>
    )
  }

  // Group by category
  const categories = []
  const catMap = {}
  for (const q of questions) {
    const cat = q.category || 'General'
    if (!catMap[cat]) { catMap[cat] = { name: cat, questions: [] }; categories.push(catMap[cat]) }
    catMap[cat].questions.push(q)
  }

  function renderSpeakerCategory(qs) {
    const speakers = []
    const speakerGroups = {}
    for (const q of qs) {
      const key = q.group_key || 'Unknown'
      if (!speakerGroups[key]) { speakerGroups[key] = []; speakers.push(key) }
      speakerGroups[key].push(q)
    }

    return speakers.map(speaker => {
      const speakerQs = speakerGroups[speaker]
      const topicQ = speakerQs.find(q => q.text === 'Topic')

      // Group session pairs: "Predicted Session 1" + "Actual Session 1" share one actual
      // Also handle old format: "Predicted Session" + "Actual Session"
      const sessionPairs = []
      const predictedQs = speakerQs.filter(q => q.text.startsWith('Predicted Session'))
        .sort((a, b) => a.text.localeCompare(b.text))

      for (const pq of predictedQs) {
        const num = pq.text.replace('Predicted Session', '').trim()
        const actualText = num ? `Actual Session ${num}` : 'Actual Session'
        const aq = speakerQs.find(q => q.text === actualText)
        sessionPairs.push({ predicted: pq, actual: aq, label: num ? `Session ${num}` : 'Session' })
      }

      // If no numbered pairs found, fall back to old single pair
      if (sessionPairs.length === 0) {
        const pq = speakerQs.find(q => q.text === 'Predicted Session')
        const aq = speakerQs.find(q => q.text === 'Actual Session')
        if (pq) sessionPairs.push({ predicted: pq, actual: aq, label: 'Session' })
      }

      const firstQ = sessionPairs[0]?.predicted
      const sessionOptions = firstQ?.options ? (typeof firstQ.options === 'string' ? JSON.parse(firstQ.options) : firstQ.options) : []
      const allSessionQs = sessionPairs.flatMap(p => [p.predicted, p.actual].filter(Boolean))
      const anyScored = allSessionQs.some(q => actuals[q.id])

      async function saveSpeaker() {
        for (const pair of sessionPairs) {
          const val = values[pair.predicted?.id] || ''
          if (!val) continue
          // Set same actual for predicted and actual session questions
          if (pair.predicted) {
            await submitActual(pair.predicted.id, val)
            setActuals(prev => ({ ...prev, [pair.predicted.id]: val }))
          }
          if (pair.actual) {
            await submitActual(pair.actual.id, val)
            setActuals(prev => ({ ...prev, [pair.actual.id]: val }))
          }
        }
        // Also score topic
        if (topicQ) {
          const anyVal = values[sessionPairs[0]?.predicted?.id] || 'scored'
          await submitActual(topicQ.id, anyVal)
          setActuals(prev => ({ ...prev, [topicQ.id]: anyVal }))
        }
        setSavedIds(prev => {
          const next = new Set(prev)
          speakerQs.forEach(q => next.add(q.id))
          return next
        })
        setTimeout(() => setSavedIds(prev => {
          const next = new Set(prev)
          speakerQs.forEach(q => next.delete(q.id))
          return next
        }), 2000)
      }

      const allSaved = allSessionQs.every(q => savedIds.has(q.id))

      return (
        <div key={speaker} style={{ ...styles.speakerCard, ...(anyScored ? styles.speakerScored : {}) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div style={styles.speakerName}>{speaker}</div>
            {anyScored && <span style={styles.scoredBadge}>Scored</span>}
          </div>
          {sessionPairs.map((pair, i) => (
            <div key={i} style={{ ...styles.fieldRow, marginBottom: sessionPairs.length > 1 ? '6px' : 0 }}>
              {sessionPairs.length > 1 && (
                <span style={{ fontSize: '12px', color: '#888', minWidth: '65px', flexShrink: 0 }}>{pair.label}</span>
              )}
              <select
                style={styles.fieldInput}
                value={values[pair.predicted?.id] || ''}
                onChange={e => {
                  if (pair.predicted) setVal(pair.predicted.id, e.target.value)
                  if (pair.actual) setVal(pair.actual.id, e.target.value)
                }}
              >
                <option value="">-- Select Session --</option>
                {sessionOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginTop: '8px' }}>
            {allSaved ? (
              <button style={{ ...styles.fieldSaveBtn, background: '#16a34a' }}>Saved!</button>
            ) : (
              <button style={styles.fieldSaveBtn} onClick={saveSpeaker}>
                {anyScored ? 'Update' : 'Score'}
              </button>
            )}
          </div>
        </div>
      )
    })
  }

  function renderChecklistCategory(qs, label) {
    // Collect all unique player-submitted values across all questions in this category
    const allTopics = new Set()
    for (const q of qs) {
      const answers = allAnswers[q.id] || allAnswers[String(q.id)] || []
      for (const a of answers) {
        if (a.value && a.value.trim()) allTopics.add(a.value.trim())
      }
    }
    const topicList = [...allTopics].sort()

    // The actual is a JSON array of topics that were discussed
    // Build current checked list: prefer values state (live edits), fall back to actuals
    let currentChecked = []
    for (const q of qs) {
      if (values[q.id]) {
        try { currentChecked = JSON.parse(values[q.id]) } catch {}
        break
      }
    }
    if (!Array.isArray(currentChecked) || currentChecked.length === 0) {
      for (const q of qs) {
        if (actuals[q.id]) {
          try { currentChecked = JSON.parse(actuals[q.id]) } catch { currentChecked = [actuals[q.id]] }
          break
        }
      }
    }
    if (!Array.isArray(currentChecked)) currentChecked = []

    function toggleTopic(topic) {
      const next = currentChecked.includes(topic) ? currentChecked.filter(t => t !== topic) : [...currentChecked, topic]
      for (const q of qs) {
        setVal(q.id, JSON.stringify(next))
      }
    }

    async function saveAll() {
      for (const q of qs) {
        const val = values[q.id]
        if (val) {
          await submitActual(q.id, val)
          setActuals(prev => ({ ...prev, [q.id]: val }))
        }
      }
      setSavedIds(prev => {
        const next = new Set(prev)
        qs.forEach(q => next.add(q.id))
        return next
      })
      setTimeout(() => setSavedIds(prev => {
        const next = new Set(prev)
        qs.forEach(q => next.delete(q.id))
        return next
      }), 2000)
    }

    const anyScored = qs.some(q => actuals[q.id])
    const allSaved = qs.every(q => savedIds.has(q.id))

    if (topicList.length === 0) {
      return (
        <div style={styles.card}>
          <div style={styles.text}>No {label.toLowerCase()} submitted by players yet. They will appear here once submissions are locked.</div>
        </div>
      )
    }

    return (
      <div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
          {currentChecked.length} of {topicList.length} checked
          {anyScored && <span style={styles.scoredBadge}> Scored</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {topicList.map(topic => (
            <label key={topic} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={currentChecked.includes(topic)}
                onChange={() => toggleTopic(topic)}
              />
              <span style={currentChecked.includes(topic) ? { fontWeight: 600, color: '#16a34a' } : {}}>
                {topic}
              </span>
              <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>
                ({qs.flatMap(q => allAnswers[q.id] || allAnswers[String(q.id)] || []).filter(a => a.value?.trim() === topic).map(a => a.player).filter((v, i, arr) => arr.indexOf(v) === i).join(', ')})
              </span>
            </label>
          ))}
        </div>
        <button
          style={allSaved ? { ...styles.saveBtn, background: '#16a34a' } : styles.saveBtn}
          onClick={saveAll}
        >
          {allSaved ? 'Saved!' : anyScored ? `Update All ${label}` : `Score All ${label}`}
        </button>
      </div>
    )
  }

  function renderCategory(cat) {
    if (cat.name === 'Speakers') {
      return renderSpeakerCategory(cat.questions)
    }
    if (cat.name === 'Topics') {
      return renderChecklistCategory(cat.questions, 'Topics')
    }
    if (cat.name === 'Songs') {
      return renderChecklistCategory(cat.questions, 'Songs')
    }
    if (cat.name === 'U.S. Temples') {
      return renderChecklistCategory(cat.questions, 'U.S. Temple Locations')
    }
    if (cat.name === 'Worldwide Temples') {
      return renderChecklistCategory(cat.questions, 'Worldwide Temple Locations')
    }

    return cat.questions.map(q => {
      const isScored = !!actuals[q.id]
      return (
        <div key={q.id} style={{ ...styles.card, ...(isScored ? styles.cardScored : {}) }}>
          <div style={styles.text}>
            {q.text}
            {isScored && <span style={styles.scoredBadge}>Scored</span>}
          </div>
          <div style={styles.points}>
            {q.points > 0 ? `${q.points} pts` : 'No points'} | {q.scoring_type}
          </div>
          <div style={styles.inputRow}>
            {renderInput(q)}
            {q.scoring_type !== 'none' && renderSaveBtn(q)}
          </div>
        </div>
      )
    })
  }

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.name}>
          <div style={styles.categoryHeader}>{cat.name}</div>
          {renderCategory(cat)}
        </div>
      ))}
    </div>
  )
}

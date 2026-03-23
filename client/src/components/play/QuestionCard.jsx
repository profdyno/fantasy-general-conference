import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { formatValue } from '../../utils/format'

const styles = {
  card: {
    background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '12px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  text: { fontSize: '15px', fontWeight: 500, marginBottom: '10px' },
  points: { fontSize: '12px', color: '#666', marginBottom: '8px' },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '15px',
  },
  select: {
    width: '100%', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '15px', background: '#fff',
  },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer' },
  yesNoGroup: { display: 'flex', gap: '12px' },
  yesNoBtn: {
    flex: 1, padding: '10px', borderRadius: '6px', border: '2px solid #d1d5db',
    background: '#fff', fontSize: '15px', fontWeight: 500, textAlign: 'center',
  },
  yesNoBtnActive: { borderColor: '#1e3a5f', background: '#eff6ff', color: '#1e3a5f' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer' },
}

export default function QuestionCard({ question, value, onChange, disabled, score, actual }) {
  const options = question.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : []

  function renderInput() {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div style={styles.radioGroup}>
            {options.map(opt => (
              <label key={opt} style={styles.radioLabel}>
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  disabled={disabled}
                />
                {opt}
              </label>
            ))}
          </div>
        )

      case 'city_us':
        return <CityAutocomplete value={value} onChange={onChange} disabled={disabled} country="us" />

      case 'city_world':
        return <CityAutocomplete value={value} onChange={onChange} disabled={disabled} country="world" />

      case 'dropdown':
        return (
          <>
            <input
              list={`dl-${question.id}`}
              style={styles.input}
              value={value}
              onChange={e => onChange(e.target.value)}
              disabled={disabled}
              placeholder="Select or type your own..."
            />
            <datalist id={`dl-${question.id}`}>
              {options.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </>
        )

      case 'select':
        return (
          <select
            style={styles.select}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">-- Select --</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )

      case 'multi_select': {
        let selected = []
        try { selected = value ? JSON.parse(value) : [] } catch { selected = [] }
        if (!Array.isArray(selected)) selected = []

        function toggle(opt) {
          const next = selected.includes(opt)
            ? selected.filter(s => s !== opt)
            : [...selected, opt]
          onChange(JSON.stringify(next))
        }

        return (
          <div style={styles.checkboxGroup}>
            {options.map(opt => (
              <label key={opt} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  disabled={disabled}
                />
                {opt}
              </label>
            ))}
          </div>
        )
      }

      case 'checkbox_list': {
        let picked = []
        try { picked = value ? JSON.parse(value) : [] } catch { picked = [] }
        if (!Array.isArray(picked)) picked = []
        const maxPicks = 5

        function togglePick(opt) {
          if (picked.includes(opt)) {
            const next = picked.filter(s => s !== opt)
            onChange(JSON.stringify(next))
          } else if (picked.length < maxPicks) {
            onChange(JSON.stringify([...picked, opt]))
          }
        }

        // Detect grouped vs flat options
        const isGrouped = options.length > 0 && typeof options[0] === 'object' && options[0].group
        const allNames = isGrouped ? options.flatMap(g => g.names) : options

        return (
          <div>
            <div style={{ fontSize: '13px', color: picked.length >= maxPicks ? '#dc2626' : '#666', marginBottom: '10px', fontWeight: 500 }}>
              {picked.length}/{maxPicks} selected
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
              {isGrouped ? options.map(grp => (
                <div key={grp.group} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a5f', marginBottom: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                    {grp.group}
                  </div>
                  <div style={styles.checkboxGroup}>
                    {grp.names.map(name => (
                      <label key={name} style={{ ...styles.checkboxLabel, opacity: !picked.includes(name) && picked.length >= maxPicks ? 0.4 : 1 }}>
                        <input
                          type="checkbox"
                          checked={picked.includes(name)}
                          onChange={() => togglePick(name)}
                          disabled={disabled || (!picked.includes(name) && picked.length >= maxPicks)}
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              )) : (
                <div style={styles.checkboxGroup}>
                  {allNames.map(opt => (
                    <label key={opt} style={{ ...styles.checkboxLabel, opacity: !picked.includes(opt) && picked.length >= maxPicks ? 0.4 : 1 }}>
                      <input
                        type="checkbox"
                        checked={picked.includes(opt)}
                        onChange={() => togglePick(opt)}
                        disabled={disabled || (!picked.includes(opt) && picked.length >= maxPicks)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }

      case 'yes_no':
        return (
          <div style={styles.yesNoGroup}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                style={{
                  ...styles.yesNoBtn,
                  ...(value.toLowerCase() === opt.toLowerCase() ? styles.yesNoBtnActive : {}),
                  ...(disabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}),
                }}
                onClick={() => !disabled && onChange(opt.toLowerCase())}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            style={styles.input}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter a number"
          />
        )

      case 'text':
      default:
        return (
          <input
            type="text"
            style={styles.input}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter your answer"
          />
        )
    }
  }

  let scoringHint = ''
  if (question.scoring_type === 'closest') {
    scoringHint = ` | Closest wins${question.bonus_points ? ` (+${question.bonus_points} bonus for exact)` : ''}`
  } else if (question.scoring_type === 'contains') {
    scoringHint = ' | Partial credit available'
  } else if (question.scoring_type === 'any_value') {
    scoringHint = ' | Points for any answer'
  } else if (question.scoring_type === 'none') {
    scoringHint = ' | Just for fun!'
  }

  // Points display with score coloring
  function renderPoints() {
    if (question.scoring_type === 'none' || question.points === 0) {
      return <span>No points{scoringHint}</span>
    }

    if (actual && score) {
      const earned = Math.round(score.points_earned * 10) / 10
      const color = score.is_correct ? '#16a34a' : score.points_earned > 0 ? '#d97706' : '#dc2626'
      return <span style={{ color, fontWeight: 600 }}>{earned}/{question.points} pts{scoringHint}</span>
    }

    return <span>{question.points} pts{scoringHint}</span>
  }

  // Actual answer display
  function renderActual() {
    if (!actual) return null
    const color = score?.is_correct ? '#16a34a' : score?.points_earned > 0 ? '#d97706' : '#dc2626'
    return (
      <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '6px', color }}>
        Answer: {formatValue(actual.actual_value)}
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.text}>{question.text}</div>
      <div style={styles.points}>{renderPoints()}</div>
      {renderInput()}
      {renderActual()}
    </div>
  )
}

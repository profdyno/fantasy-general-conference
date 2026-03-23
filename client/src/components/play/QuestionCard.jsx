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
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer' },
  yesNoGroup: { display: 'flex', gap: '12px' },
  yesNoBtn: {
    flex: 1, padding: '10px', borderRadius: '6px', border: '2px solid #d1d5db',
    background: '#fff', fontSize: '15px', fontWeight: 500, textAlign: 'center',
  },
  yesNoBtnActive: { borderColor: '#1e3a5f', background: '#eff6ff', color: '#1e3a5f' },
}

export default function QuestionCard({ question, value, onChange, disabled }) {
  const options = question.options ? JSON.parse(question.options) : []

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
  }

  return (
    <div style={styles.card}>
      <div style={styles.text}>{question.text}</div>
      <div style={styles.points}>{question.points} pts{scoringHint}</div>
      {renderInput()}
    </div>
  )
}

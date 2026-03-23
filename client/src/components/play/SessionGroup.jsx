import QuestionCard from './QuestionCard'

const styles = {
  group: { marginBottom: '32px' },
  header: {
    fontSize: '18px', fontWeight: 600, color: '#1e3a5f',
    borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px',
  },
}

export default function SessionGroup({ name, questions, answers, onAnswer, disabled }) {
  return (
    <div style={styles.group}>
      <div style={styles.header}>{name}</div>
      {questions.map(q => (
        <QuestionCard
          key={q.id}
          question={q}
          value={answers[q.id] || ''}
          onChange={(val) => onAnswer(q.id, val)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

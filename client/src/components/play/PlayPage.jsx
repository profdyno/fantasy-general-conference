import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayerBySlug, getQuestions, getAnswers, submitAnswersBulk } from '../../api/client'
import SessionGroup from './SessionGroup'

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px 16px' },
  header: { marginBottom: '24px' },
  playerName: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f' },
  gameName: { fontSize: '14px', color: '#666', marginTop: '4px' },
  locked: {
    background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
    padding: '12px 16px', marginBottom: '16px', color: '#92400e', fontWeight: 500,
  },
  submitBar: {
    position: 'sticky', bottom: 0, background: '#fff', padding: '16px',
    borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '12px',
  },
  submitBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 32px', fontSize: '16px', fontWeight: 600,
  },
  submitBtnDisabled: { background: '#9ca3af', cursor: 'not-allowed' },
  status: { fontSize: '14px', color: '#666' },
  error: { color: '#dc2626', fontSize: '14px', marginTop: '8px' },
  success: { color: '#16a34a', fontSize: '14px', marginTop: '8px' },
  notFound: { textAlign: 'center', padding: '64px 16px', fontSize: '18px', color: '#666' },
}

export default function PlayPage() {
  const { slug } = useParams()
  const [player, setPlayer] = useState(null)
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('playerSlug', slug)
    loadData()
  }, [slug])

  async function loadData() {
    try {
      const { player: p, game: g } = await getPlayerBySlug(slug)
      setPlayer(p)
      setGame(g)

      const qs = await getQuestions()
      setQuestions(qs)

      const ans = await getAnswers()
      const ansMap = {}
      for (const a of ans) {
        ansMap[a.question_id] = a.answer_value
      }
      setAnswers(ansMap)
    } catch (e) {
      if (e.message.includes('not found')) {
        setNotFound(true)
      } else {
        setError(e.message)
      }
    }
  }

  function handleAnswer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const bulk = Object.entries(answers).map(([question_id, answer_value]) => ({
        question_id: Number(question_id),
        answer_value: String(answer_value),
      }))
      await submitAnswersBulk(bulk)
      setMessage('Answers saved!')
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return <div style={styles.notFound}>Player not found. Check your URL and try again.</div>
  }

  if (!player) {
    return <div style={styles.container}>Loading...</div>
  }

  // Group questions by session
  const grouped = {}
  const conferenceWide = []
  for (const q of questions) {
    if (!q.session_id) {
      conferenceWide.push(q)
    } else {
      const key = q.session_id
      if (!grouped[key]) grouped[key] = { name: q.session_name, questions: [] }
      grouped[key].questions.push(q)
    }
  }

  const isLocked = game?.submissions_locked

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.playerName}>{player.name}</div>
        <div style={styles.gameName}>{game?.name}</div>
      </div>

      {isLocked && (
        <div style={styles.locked}>
          Submissions are locked. You can view your answers but cannot make changes.
        </div>
      )}

      {conferenceWide.length > 0 && (
        <SessionGroup
          name="Conference-Wide"
          questions={conferenceWide}
          answers={answers}
          onAnswer={handleAnswer}
          disabled={isLocked}
        />
      )}

      {Object.entries(grouped).map(([sessionId, { name, questions: qs }]) => (
        <SessionGroup
          key={sessionId}
          name={name}
          questions={qs}
          answers={answers}
          onAnswer={handleAnswer}
          disabled={isLocked}
        />
      ))}

      {!isLocked && (
        <div style={styles.submitBar}>
          <div style={styles.status}>
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          <button
            style={{ ...styles.submitBtn, ...(saving ? styles.submitBtnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Answers'}
          </button>
        </div>
      )}

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  )
}

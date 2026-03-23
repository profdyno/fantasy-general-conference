import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayerBySlug, getQuestions, getAnswers, submitAnswersBulk, getPlayerScores, getActuals } from '../../api/client'
import useSSE from '../../hooks/useSSE'
import QuestionCard from './QuestionCard'
import { formatValue } from '../../utils/format'

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px 16px' },
  header: { marginBottom: '24px' },
  playerName: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f' },
  gameName: { fontSize: '14px', color: '#666', marginTop: '4px' },
  locked: {
    background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
    padding: '12px 16px', marginBottom: '16px', color: '#92400e', fontWeight: 500,
  },
  categoryHeader: {
    fontSize: '20px', fontWeight: 700, color: '#1e3a5f', marginTop: '28px', marginBottom: '16px',
    borderBottom: '3px solid #1e3a5f', paddingBottom: '8px',
  },
  speakerCard: {
    background: '#fff', borderRadius: '10px', padding: '18px', marginBottom: '14px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  speakerName: { fontSize: '17px', fontWeight: 700, color: '#1e3a5f', marginBottom: '12px' },
  speakerField: { marginBottom: '10px' },
  fieldLabel: { fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '4px' },
  fieldInput: {
    width: '100%', padding: '7px 10px', borderRadius: '5px',
    border: '1px solid #d1d5db', fontSize: '14px',
  },
  liveTag: {
    display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '10px',
    fontWeight: 700, padding: '2px 6px', borderRadius: '3px', marginLeft: '6px', verticalAlign: 'middle',
  },
  submitBar: {
    position: 'sticky', bottom: 0, background: '#fff', padding: '16px',
    borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '12px', zIndex: 10,
  },
  submitBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 32px', fontSize: '16px', fontWeight: 600,
  },
  submitBtnDisabled: { background: '#9ca3af', cursor: 'not-allowed' },
  status: { fontSize: '14px', color: '#666' },
  notFound: { textAlign: 'center', padding: '64px 16px', fontSize: '18px', color: '#666' },
  // Score result styles
  actualAnswer: { fontSize: '12px', marginTop: '4px', fontWeight: 600 },
  correct: { color: '#16a34a' },
  incorrect: { color: '#dc2626' },
  partial: { color: '#d97706' },
}

function scoreColor(score, maxPts) {
  if (!score) return null
  if (score.is_correct) return 'correct'
  if (score.points_earned > 0) return 'partial'
  return 'incorrect'
}

function ScoreResult({ score, actual, question }) {
  if (!actual) return null

  const color = scoreColor(score, question.points)
  const colorStyle = color ? styles[color] : styles.incorrect
  const earned = score ? Math.round(score.points_earned * 10) / 10 : 0

  return (
    <div style={styles.actualAnswer}>
      <span style={colorStyle}>
        Answer: {formatValue(actual.actual_value)}
      </span>
    </div>
  )
}

function PointsLabel({ question, score, actual }) {
  if (question.scoring_type === 'none') return null
  if (question.points === 0) return null

  // If scored (actual exists)
  if (actual && score) {
    const earned = Math.round(score.points_earned * 10) / 10
    const color = scoreColor(score, question.points)
    const colorStyle = color ? styles[color] : styles.incorrect
    return <span style={{ ...colorStyle, fontWeight: 600 }}> ({earned}/{question.points} pts)</span>
  }

  // For any_value live questions: if answer exists, show as earned
  if (question.scoring_type === 'any_value' && actual) {
    return <span style={{ ...styles.correct, fontWeight: 600 }}> ({question.points}/{question.points} pts)</span>
  }

  return <span style={{ color: '#888', fontWeight: 400 }}> ({question.points} pts)</span>
}

export default function PlayPage() {
  const { slug } = useParams()
  const [player, setPlayer] = useState(null)
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [scoreMap, setScoreMap] = useState({}) // { questionId: { points_earned, is_correct } }
  const [actualMap, setActualMap] = useState({}) // { questionId: { actual_value } }
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('playerSlug', slug)
    loadData()
  }, [slug])

  // SSE: reload scores when actuals are entered
  useSSE('/api/events/scores', () => { loadScores() })

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

      await loadScoresForPlayer(p.id)
      await loadActuals()
    } catch (e) {
      if (e.message.includes('not found')) setNotFound(true)
      else setError(e.message)
    }
  }

  async function loadScores() {
    if (!player) return
    await loadScoresForPlayer(player.id)
    await loadActuals()
  }

  async function loadScoresForPlayer(playerId) {
    try {
      const data = await getPlayerScores(playerId)
      const scores = data.scores || data
      const sMap = {}
      for (const s of scores) {
        sMap[s.question_id] = { points_earned: s.points_earned, is_correct: s.is_correct }
      }
      setScoreMap(sMap)
    } catch {}
  }

  async function loadActuals() {
    try {
      const acts = await getActuals()
      const aMap = {}
      for (const a of acts) {
        aMap[a.question_id] = a
      }
      setActualMap(aMap)
    } catch {}
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
      await loadScores()
      setMessage('Answers saved!')
      setTimeout(() => setMessage(null), 10000)
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

  const isLocked = game?.submissions_locked

  // Group questions by category
  const categories = []
  const catMap = {}
  for (const q of questions) {
    const cat = q.category || 'General'
    if (!catMap[cat]) {
      catMap[cat] = { name: cat, questions: [] }
      categories.push(catMap[cat])
    }
    catMap[cat].questions.push(q)
  }

  function renderSpeakerCategory(qs) {
    const speakers = []
    const speakerGroups = {}
    for (const q of qs) {
      const key = q.group_key || 'Unknown'
      if (!speakerGroups[key]) {
        speakerGroups[key] = []
        speakers.push(key)
      }
      speakerGroups[key].push(q)
    }

    return speakers.map(speaker => (
      <div key={speaker} style={styles.speakerCard}>
        <div style={styles.speakerName}>{speaker}</div>
        {speakerGroups[speaker].map(q => {
          const isDisabled = q.allow_after_lock ? !isLocked : isLocked
          const options = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
          const score = scoreMap[q.id]
          const actual = actualMap[q.id]

          return (
            <div key={q.id} style={styles.speakerField}>
              <div style={styles.fieldLabel}>
                {q.text}
                <PointsLabel question={q} score={score} actual={actual} />
                {q.allow_after_lock ? <span style={styles.liveTag}>LIVE</span> : null}
              </div>
              {q.question_type === 'dropdown' ? (
                <select
                  style={styles.fieldInput}
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswer(q.id, e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">-- Select --</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  style={styles.fieldInput}
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswer(q.id, e.target.value)}
                  disabled={isDisabled}
                  placeholder={q.scoring_type === 'none' ? 'Enter notes...' : 'Enter your answer'}
                />
              )}
              <ScoreResult score={score} actual={actual} question={q} />
            </div>
          )
        })}
      </div>
    ))
  }

  function renderCategory(cat) {
    if (cat.name === 'Speakers') {
      return renderSpeakerCategory(cat.questions)
    }

    return cat.questions.map(q => {
      const isDisabled = q.allow_after_lock ? !isLocked : isLocked
      const score = scoreMap[q.id]
      const actual = actualMap[q.id]
      return (
        <QuestionCard
          key={q.id}
          question={q}
          value={answers[q.id] || ''}
          onChange={val => handleAnswer(q.id, val)}
          disabled={isDisabled}
          score={score}
          actual={actual}
        />
      )
    })
  }

  const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim && answers[k].trim() !== '').length

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.playerName}>{player.name}</div>
        <div style={styles.gameName}>{game?.name}</div>
      </div>

      {isLocked && (
        <div style={styles.locked}>
          Predictions are locked. Fields marked <span style={styles.liveTag}>LIVE</span> are now open for updates during conference.
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.name}>
          <div style={styles.categoryHeader}>{cat.name}</div>
          {renderCategory(cat)}
        </div>
      ))}

      <div style={styles.submitBar}>
        <div style={styles.status}>
          {answeredCount} of {questions.length} answered
          {message && <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: '12px' }}>{message}</span>}
          {error && <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: '12px' }}>{error}</span>}
        </div>
        <button
          style={{ ...styles.submitBtn, ...(saving ? styles.submitBtnDisabled : {}) }}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Answers'}
        </button>
      </div>
    </div>
  )
}

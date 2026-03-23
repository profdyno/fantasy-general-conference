const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { playerFromSlug } = require('../middleware/auth');
const { scoreQuestion } = require('../utils/scoring');
const { broadcastScoreUpdate } = require('./events');

// Get answers for a player
router.get('/', playerFromSlug, (req, res) => {
  const db = getDb();
  const answers = db.prepare('SELECT * FROM answers WHERE player_id = ?').all(req.player.id);
  res.json(answers);
});

// Submit single answer (upsert)
router.post('/', playerFromSlug, (req, res) => {
  const { question_id, answer_value } = req.body;
  const db = getDb();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.player.game_id);

  // Check lock — allow if question has allow_after_lock = 1
  if (game.submissions_locked) {
    const question = db.prepare('SELECT allow_after_lock FROM questions WHERE id = ?').get(question_id);
    if (!question || !question.allow_after_lock) {
      return res.status(403).json({ error: 'Submissions are locked' });
    }
  }

  db.prepare(`
    INSERT INTO answers (question_id, player_id, answer_value)
    VALUES (?, ?, ?)
    ON CONFLICT(question_id, player_id) DO UPDATE SET
      answer_value = excluded.answer_value,
      submitted_at = datetime('now','localtime')
  `).run(question_id, req.player.id, answer_value);

  // Auto-score live questions if an actual exists
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
  if (question && question.allow_after_lock) {
    const actual = db.prepare('SELECT * FROM actuals WHERE question_id = ?').get(question_id);
    if (actual) {
      scoreQuestion(question_id);
      broadcastScoreUpdate({ type: 'score_update', question_id });
    }
  }

  res.json({ success: true });
});

// Bulk submit answers
router.post('/bulk', playerFromSlug, (req, res) => {
  const { answers } = req.body;
  const db = getDb();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.player.game_id);

  // Pre-fetch allow_after_lock flags
  let allowedAfterLock = new Set();
  if (game.submissions_locked) {
    const rows = db.prepare('SELECT id FROM questions WHERE game_id = ? AND allow_after_lock = 1').all(game.id);
    allowedAfterLock = new Set(rows.map(r => r.id));
  }

  const upsert = db.prepare(`
    INSERT INTO answers (question_id, player_id, answer_value)
    VALUES (?, ?, ?)
    ON CONFLICT(question_id, player_id) DO UPDATE SET
      answer_value = excluded.answer_value,
      submitted_at = datetime('now','localtime')
  `);

  const batch = db.transaction(() => {
    for (const a of answers) {
      if (a.answer_value === undefined || a.answer_value === '') continue;
      // Skip locked questions unless allow_after_lock
      if (game.submissions_locked && !allowedAfterLock.has(a.question_id)) continue;
      upsert.run(a.question_id, req.player.id, String(a.answer_value));
    }
  });
  batch();

  // Auto-score any live questions that have actuals
  if (game.submissions_locked && allowedAfterLock.size > 0) {
    const liveIds = answers
      .filter(a => a.answer_value && allowedAfterLock.has(a.question_id))
      .map(a => a.question_id);
    let scored = false;
    for (const qid of liveIds) {
      const actual = db.prepare('SELECT 1 FROM actuals WHERE question_id = ?').get(qid);
      if (actual) {
        scoreQuestion(qid);
        scored = true;
      }
    }
    if (scored) broadcastScoreUpdate({ type: 'score_update' });
  }

  res.json({ success: true });
});

// Admin: get all answers for all questions in active game (no player auth needed, uses admin key)
const { adminAuth } = require('../middleware/auth');
router.get('/all', adminAuth, (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json({});

  const rows = db.prepare(`
    SELECT a.question_id, a.answer_value, p.name as player_name
    FROM answers a
    JOIN players p ON a.player_id = p.id
    JOIN questions q ON a.question_id = q.id
    WHERE q.game_id = ? AND p.is_active = 1
    ORDER BY a.question_id, p.name
  `).all(game.id);

  // Group by question_id
  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.question_id]) grouped[r.question_id] = [];
    grouped[r.question_id].push({ player: r.player_name, value: r.answer_value });
  }
  res.json(grouped);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');
const { scoreQuestion } = require('../utils/scoring');
const { broadcastScoreUpdate } = require('./events');

// Get all actuals for active game
router.get('/', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json([]);

  const actuals = db.prepare(`
    SELECT a.*, q.text as question_text, q.session_id
    FROM actuals a
    JOIN questions q ON a.question_id = q.id
    WHERE q.game_id = ?
  `).all(game.id);

  res.json(actuals);
});

// Enter/update an actual (triggers scoring)
router.post('/', adminAuth, (req, res) => {
  const { question_id, actual_value } = req.body;
  const db = getDb();

  db.prepare(`
    INSERT INTO actuals (question_id, actual_value)
    VALUES (?, ?)
    ON CONFLICT(question_id) DO UPDATE SET
      actual_value = excluded.actual_value,
      entered_at = datetime('now','localtime')
  `).run(question_id, actual_value);

  // Score this question
  scoreQuestion(question_id);

  // Broadcast update
  broadcastScoreUpdate({ type: 'score_update', question_id });

  const actual = db.prepare('SELECT * FROM actuals WHERE question_id = ?').get(question_id);
  res.json(actual);
});

// Bulk enter actuals
router.post('/bulk', adminAuth, (req, res) => {
  const { actuals } = req.body;
  const db = getDb();

  const upsert = db.prepare(`
    INSERT INTO actuals (question_id, actual_value)
    VALUES (?, ?)
    ON CONFLICT(question_id) DO UPDATE SET
      actual_value = excluded.actual_value,
      entered_at = datetime('now','localtime')
  `);

  const batch = db.transaction(() => {
    for (const a of actuals) {
      if (a.actual_value !== undefined && a.actual_value !== '') {
        upsert.run(a.question_id, String(a.actual_value));
      }
    }
  });
  batch();

  // Score all affected questions
  for (const a of actuals) {
    if (a.actual_value !== undefined && a.actual_value !== '') {
      scoreQuestion(a.question_id);
    }
  }

  broadcastScoreUpdate({ type: 'score_update', bulk: true });
  res.json({ success: true });
});

module.exports = router;

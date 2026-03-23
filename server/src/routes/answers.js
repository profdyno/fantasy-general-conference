const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { playerFromSlug } = require('../middleware/auth');

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

  // Check if submissions are locked
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.player.game_id);
  if (game.submissions_locked) {
    return res.status(403).json({ error: 'Submissions are locked' });
  }

  db.prepare(`
    INSERT INTO answers (question_id, player_id, answer_value)
    VALUES (?, ?, ?)
    ON CONFLICT(question_id, player_id) DO UPDATE SET
      answer_value = excluded.answer_value,
      submitted_at = datetime('now','localtime')
  `).run(question_id, req.player.id, answer_value);

  res.json({ success: true });
});

// Bulk submit answers
router.post('/bulk', playerFromSlug, (req, res) => {
  const { answers } = req.body;
  const db = getDb();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.player.game_id);
  if (game.submissions_locked) {
    return res.status(403).json({ error: 'Submissions are locked' });
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
      if (a.answer_value !== undefined && a.answer_value !== '') {
        upsert.run(a.question_id, req.player.id, String(a.answer_value));
      }
    }
  });
  batch();

  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

// Get all questions for active game
router.get('/', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json([]);

  const questions = db.prepare(`
    SELECT q.*, s.name as session_name
    FROM questions q
    LEFT JOIN sessions s ON q.session_id = s.id
    WHERE q.game_id = ?
    ORDER BY q.sort_order
  `).all(game.id);

  res.json(questions);
});

// Get single question
router.get('/:id', (req, res) => {
  const db = getDb();
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json(question);
});

// Create question
router.post('/', adminAuth, (req, res) => {
  const { session_id, sort_order, text, question_type, options, scoring_type, points, bonus_points, tolerance, category, group_key, allow_after_lock } = req.body;
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  const result = db.prepare(`
    INSERT INTO questions (game_id, session_id, sort_order, text, question_type, options, scoring_type, points, bonus_points, tolerance, category, group_key, allow_after_lock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    game.id, session_id || null, sort_order || 0, text, question_type,
    options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null,
    scoring_type, points || 10, bonus_points || 0, tolerance || null,
    category || null, group_key || null, allow_after_lock ? 1 : 0,
  );

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);
  res.json(question);
});

// Update question
router.put('/:id', adminAuth, (req, res) => {
  const { session_id, sort_order, text, question_type, options, scoring_type, points, bonus_points, tolerance, category, group_key, allow_after_lock } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE questions SET
      session_id = ?, sort_order = ?, text = ?, question_type = ?,
      options = ?, scoring_type = ?, points = ?, bonus_points = ?, tolerance = ?,
      category = ?, group_key = ?, allow_after_lock = ?
    WHERE id = ?
  `).run(
    session_id || null, sort_order || 0, text, question_type,
    options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null,
    scoring_type, points || 10, bonus_points || 0, tolerance || null,
    category || null, group_key || null, allow_after_lock ? 1 : 0,
    req.params.id,
  );

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
  res.json(question);
});

// Delete question
router.delete('/:id', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

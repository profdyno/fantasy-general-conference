const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');
const { scoreAllQuestions } = require('../utils/scoring');
const { broadcastScoreUpdate } = require('./events');

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json([]);

  const { session_id } = req.query;

  let query;
  let params;

  if (session_id) {
    query = `
      SELECT p.id, p.name, p.slug,
        COALESCE(SUM(s.points_earned), 0) as total_points,
        COUNT(CASE WHEN s.is_correct = 1 THEN 1 END) as correct_count,
        COUNT(s.id) as answered_count
      FROM players p
      LEFT JOIN scores s ON s.player_id = p.id
        AND s.question_id IN (SELECT id FROM questions WHERE session_id = ?)
      WHERE p.game_id = ? AND p.is_active = 1
      GROUP BY p.id
      ORDER BY total_points DESC, correct_count DESC
    `;
    params = [session_id, game.id];
  } else {
    query = `
      SELECT p.id, p.name, p.slug,
        COALESCE(SUM(s.points_earned), 0) as total_points,
        COUNT(CASE WHEN s.is_correct = 1 THEN 1 END) as correct_count,
        COUNT(s.id) as answered_count
      FROM players p
      LEFT JOIN scores s ON s.player_id = p.id
      WHERE p.game_id = ? AND p.is_active = 1
      GROUP BY p.id
      ORDER BY total_points DESC, correct_count DESC
    `;
    params = [game.id];
  }

  const leaderboard = db.prepare(query).all(...params);
  res.json(leaderboard);
});

// Detailed scores for a player
router.get('/detail/:player_id', (req, res) => {
  const db = getDb();

  const scores = db.prepare(`
    SELECT s.*, q.text as question_text, q.question_type, q.points as max_points,
      q.session_id, se.name as session_name,
      a.answer_value, ac.actual_value
    FROM scores s
    JOIN questions q ON s.question_id = q.id
    LEFT JOIN sessions se ON q.session_id = se.id
    LEFT JOIN answers a ON a.question_id = s.question_id AND a.player_id = s.player_id
    LEFT JOIN actuals ac ON ac.question_id = s.question_id
    WHERE s.player_id = ?
    ORDER BY q.session_id, q.sort_order
  `).all(req.params.player_id);

  res.json(scores);
});

// Admin: manually score a custom_points question
router.post('/custom', adminAuth, (req, res) => {
  const { question_id, player_id, points_earned } = req.body;
  const db = getDb();

  db.prepare(`
    INSERT INTO scores (question_id, player_id, points_earned, is_correct, computed_at)
    VALUES (?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(question_id, player_id) DO UPDATE SET
      points_earned = excluded.points_earned,
      is_correct = excluded.is_correct,
      computed_at = excluded.computed_at
  `).run(question_id, player_id, points_earned, points_earned > 0 ? 1 : 0);

  broadcastScoreUpdate({ type: 'score_update', question_id });
  res.json({ success: true });
});

// Recompute all scores
router.post('/recompute', adminAuth, (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  scoreAllQuestions(game.id);
  broadcastScoreUpdate({ type: 'score_update', recomputed: true });
  res.json({ success: true });
});

module.exports = router;

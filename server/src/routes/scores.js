const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');
const { scoreAllQuestions } = require('../utils/scoring');
const { broadcastScoreUpdate } = require('./events');

// Leaderboard (includes penalty deductions)
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
        COALESCE(SUM(s.points_earned), 0) as earned_points,
        COUNT(CASE WHEN s.is_correct = 1 THEN 1 END) as correct_count,
        COUNT(s.id) as answered_count
      FROM players p
      LEFT JOIN scores s ON s.player_id = p.id
        AND s.question_id IN (SELECT id FROM questions WHERE session_id = ?)
      WHERE p.game_id = ? AND p.is_active = 1
      GROUP BY p.id
    `;
    params = [session_id, game.id];
  } else {
    query = `
      SELECT p.id, p.name, p.slug,
        COALESCE(SUM(s.points_earned), 0) as earned_points,
        COUNT(CASE WHEN s.is_correct = 1 THEN 1 END) as correct_count,
        COUNT(s.id) as answered_count
      FROM players p
      LEFT JOIN scores s ON s.player_id = p.id
      WHERE p.game_id = ? AND p.is_active = 1
      GROUP BY p.id
    `;
    params = [game.id];
  }

  const rows = db.prepare(query).all(...params);

  // Add penalty deductions
  const penaltyStmt = db.prepare(
    'SELECT COALESCE(SUM(count), 0) as total FROM penalties WHERE game_id = ? AND player_id = ?'
  );

  const leaderboard = rows.map(row => {
    const penaltyRow = penaltyStmt.get(game.id, row.id);
    const penalty_points = (penaltyRow.total || 0) * 5;
    return {
      ...row,
      penalty_points,
      total_points: row.earned_points - penalty_points,
    };
  });

  leaderboard.sort((a, b) => b.total_points - a.total_points || b.correct_count - a.correct_count);
  res.json(leaderboard);
});

// Detailed scores for a player
router.get('/detail/:player_id', (req, res) => {
  const db = getDb();

  const scores = db.prepare(`
    SELECT s.*, q.text as question_text, q.question_type, q.points as max_points,
      q.session_id, q.category, q.group_key, se.name as session_name,
      a.answer_value, ac.actual_value
    FROM scores s
    JOIN questions q ON s.question_id = q.id
    LEFT JOIN sessions se ON q.session_id = se.id
    LEFT JOIN answers a ON a.question_id = s.question_id AND a.player_id = s.player_id
    LEFT JOIN actuals ac ON ac.question_id = s.question_id
    WHERE s.player_id = ?
    ORDER BY q.category, q.sort_order
  `).all(req.params.player_id);

  // Also get penalties
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  let penalties = [];
  if (game) {
    penalties = db.prepare('SELECT * FROM penalties WHERE game_id = ? AND player_id = ?').all(game.id, req.params.player_id);
  }

  res.json({ scores, penalties });
});

// Full score matrix: all questions × all players
router.get('/matrix', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT * FROM games WHERE is_active = 1').get();
  if (!game) return res.json({ questions: [], players: [], scores: {}, penalties: {} });

  const questions = db.prepare(`
    SELECT q.id, q.text, q.points, q.category, q.group_key, q.sort_order,
      q.question_type, q.scoring_type
    FROM questions q
    WHERE q.game_id = ? AND q.scoring_type != 'none'
    ORDER BY q.sort_order
  `).all(game.id);

  const players = db.prepare(
    'SELECT id, name, slug FROM players WHERE game_id = ? AND is_active = 1 ORDER BY name'
  ).all(game.id);

  // All scores in one query
  const allScores = db.prepare(`
    SELECT s.question_id, s.player_id, s.points_earned, s.is_correct
    FROM scores s
    JOIN questions q ON s.question_id = q.id
    WHERE q.game_id = ?
  `).all(game.id);

  // Build score map: { "qId-pId": { points_earned, is_correct } }
  const scoreMap = {};
  for (const s of allScores) {
    scoreMap[`${s.question_id}-${s.player_id}`] = {
      points_earned: s.points_earned,
      is_correct: s.is_correct,
    };
  }

  // Penalties per player
  const allPenalties = db.prepare(
    'SELECT player_id, COALESCE(SUM(count), 0) as total FROM penalties WHERE game_id = ? GROUP BY player_id'
  ).all(game.id);
  const penaltyMap = {};
  for (const p of allPenalties) {
    penaltyMap[p.player_id] = p.total * 5;
  }

  // Totals per player
  const totals = {};
  for (const player of players) {
    let earned = 0;
    for (const q of questions) {
      const s = scoreMap[`${q.id}-${player.id}`];
      if (s) earned += s.points_earned;
    }
    const penalty = penaltyMap[player.id] || 0;
    totals[player.id] = { earned, penalty, total: earned - penalty };
  }

  // All answers: { "qId-pId": answer_value }
  const allAnswers = db.prepare(`
    SELECT a.question_id, a.player_id, a.answer_value
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE q.game_id = ?
  `).all(game.id);
  const answerMap = {};
  for (const a of allAnswers) {
    answerMap[`${a.question_id}-${a.player_id}`] = a.answer_value;
  }

  // Actuals: { questionId: actual_value }
  const allActuals = db.prepare(`
    SELECT a.question_id, a.actual_value
    FROM actuals a
    JOIN questions q ON a.question_id = q.id
    WHERE q.game_id = ?
  `).all(game.id);
  const actualMap = {};
  for (const a of allActuals) {
    actualMap[a.question_id] = a.actual_value;
  }

  // Include player roles and parent info for permission checks
  const playersWithRoles = db.prepare(
    'SELECT id, name, slug, role, parent1_id, parent2_id FROM players WHERE game_id = ? AND is_active = 1 ORDER BY name'
  ).all(game.id);

  res.json({ questions, players: playersWithRoles, scores: scoreMap, penalties: penaltyMap, totals, answers: answerMap, actuals: actualMap });
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

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');
const { broadcastScoreUpdate } = require('./events');

const PENALTY_TYPES = ['Fighting', 'Sleeping', 'Phone Use', 'Leaving'];

// Get all penalties for active game
router.get('/', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json({ penalties: [], types: PENALTY_TYPES });

  const penalties = db.prepare(
    'SELECT p.*, pl.name as player_name FROM penalties p JOIN players pl ON p.player_id = pl.id WHERE p.game_id = ? ORDER BY pl.name, p.penalty_type'
  ).all(game.id);

  res.json({ penalties, types: PENALTY_TYPES });
});

// Get penalizable players for a given player (based on role)
router.get('/allowed/:slug', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json({ allowed: [], role: null });

  const player = db.prepare('SELECT * FROM players WHERE game_id = ? AND slug = ? AND is_active = 1').get(game.id, req.params.slug);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  let allowed = [];
  if (player.role === 'grandparent') {
    // Can penalize everyone
    allowed = db.prepare('SELECT id, name FROM players WHERE game_id = ? AND is_active = 1 ORDER BY name').all(game.id);
  } else if (player.role === 'parent') {
    // Can penalize self + their children
    const children = db.prepare(
      'SELECT id, name FROM players WHERE game_id = ? AND is_active = 1 AND (parent1_id = ? OR parent2_id = ?) ORDER BY name'
    ).all(game.id, player.id, player.id);
    allowed = [{ id: player.id, name: player.name }, ...children];
  }
  // Children get empty array (no penalty access)

  const penalties = db.prepare(
    'SELECT * FROM penalties WHERE game_id = ? ORDER BY player_id, penalty_type'
  ).all(game.id);

  res.json({ allowed, role: player.role, types: PENALTY_TYPES, penalties });
});

// Update penalty count (admin)
router.post('/', adminAuth, (req, res) => {
  const { player_id, penalty_type, count } = req.body;
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  const clamped = Math.max(0, Math.min(10, count || 0));

  db.prepare(`
    INSERT INTO penalties (game_id, player_id, penalty_type, count, updated_at)
    VALUES (?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(game_id, player_id, penalty_type) DO UPDATE SET
      count = excluded.count,
      updated_at = excluded.updated_at
  `).run(game.id, player_id, penalty_type, clamped);

  broadcastScoreUpdate({ type: 'score_update', penalty: true });
  res.json({ success: true });
});

// Update penalty count (player-based, role-checked)
router.post('/player', (req, res) => {
  const { slug, target_player_id, penalty_type, count } = req.body;
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  const player = db.prepare('SELECT * FROM players WHERE game_id = ? AND slug = ? AND is_active = 1').get(game.id, slug);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Check permissions
  if (player.role === 'child') {
    return res.status(403).json({ error: 'Children cannot assign penalties' });
  }

  if (player.role === 'parent') {
    // Can only penalize self or own children
    if (target_player_id !== player.id) {
      const target = db.prepare('SELECT * FROM players WHERE id = ?').get(target_player_id);
      if (!target || (target.parent1_id !== player.id && target.parent2_id !== player.id)) {
        return res.status(403).json({ error: 'You can only assign penalties to yourself or your children' });
      }
    }
  }
  // Grandparents can penalize anyone — no check needed

  const clamped = Math.max(0, Math.min(10, count || 0));

  db.prepare(`
    INSERT INTO penalties (game_id, player_id, penalty_type, count, updated_at)
    VALUES (?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(game_id, player_id, penalty_type) DO UPDATE SET
      count = excluded.count,
      updated_at = excluded.updated_at
  `).run(game.id, target_player_id, penalty_type, clamped);

  broadcastScoreUpdate({ type: 'score_update', penalty: true });
  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

function generateSlug() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let slug = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    slug += chars[bytes[i] % chars.length];
  }
  return slug;
}

// Get all players for active game
router.get('/', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json([]);
  const players = db.prepare('SELECT * FROM players WHERE game_id = ? AND is_active = 1 ORDER BY name').all(game.id);
  res.json(players);
});

// Get player by slug
router.get('/:slug', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  const player = db.prepare('SELECT * FROM players WHERE game_id = ? AND slug = ? AND is_active = 1').get(game.id, req.params.slug);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Also return game info
  const fullGame = db.prepare('SELECT * FROM games WHERE id = ?').get(game.id);
  res.json({ player, game: fullGame });
});

// Create player
router.post('/', adminAuth, (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  let slug = generateSlug();
  // Ensure uniqueness (extremely unlikely to collide, but safe)
  while (db.prepare('SELECT 1 FROM players WHERE game_id = ? AND slug = ?').get(game.id, slug)) {
    slug = generateSlug();
  }

  const { role, parent1_id, parent2_id } = req.body;
  const result = db.prepare('INSERT INTO players (game_id, name, slug, email, role, parent1_id, parent2_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    game.id, name, slug, email || null, role || 'parent', parent1_id || null, parent2_id || null
  );
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.json(player);
});

// Update player
router.put('/:id', adminAuth, (req, res) => {
  const { name, email, role, parent1_id, parent2_id } = req.body;
  const db = getDb();

  if (name !== undefined) db.prepare('UPDATE players SET name = ? WHERE id = ?').run(name, req.params.id);
  if (email !== undefined) db.prepare('UPDATE players SET email = ? WHERE id = ?').run(email || null, req.params.id);
  if (role !== undefined) db.prepare('UPDATE players SET role = ? WHERE id = ?').run(role, req.params.id);
  if (parent1_id !== undefined) db.prepare('UPDATE players SET parent1_id = ? WHERE id = ?').run(parent1_id || null, req.params.id);
  if (parent2_id !== undefined) db.prepare('UPDATE players SET parent2_id = ? WHERE id = ?').run(parent2_id || null, req.params.id);

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(player);
});

// Deactivate player
router.delete('/:id', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE players SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

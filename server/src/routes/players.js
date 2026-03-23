const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

function nameToSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  let slug = nameToSlug(name);
  // Handle collisions
  const existing = db.prepare('SELECT slug FROM players WHERE game_id = ? AND slug LIKE ?').all(game.id, slug + '%');
  if (existing.some(p => p.slug === slug)) {
    let counter = 2;
    while (existing.some(p => p.slug === `${slug}-${counter}`)) counter++;
    slug = `${slug}-${counter}`;
  }

  const result = db.prepare('INSERT INTO players (game_id, name, slug) VALUES (?, ?, ?)').run(game.id, name, slug);
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.json(player);
});

// Update player
router.put('/:id', adminAuth, (req, res) => {
  const { name, slug } = req.body;
  const db = getDb();

  if (name) db.prepare('UPDATE players SET name = ? WHERE id = ?').run(name, req.params.id);
  if (slug) db.prepare('UPDATE players SET slug = ? WHERE id = ?').run(slug, req.params.id);

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

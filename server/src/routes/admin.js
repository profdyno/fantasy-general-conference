const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

// Login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash');
  if (!row) return res.status(500).json({ error: 'Admin password not configured' });

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== row.value) return res.status(403).json({ error: 'Invalid password' });

  res.json({ success: true });
});

// Get active game
router.get('/game', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT * FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });
  res.json(game);
});

// List all games
router.get('/games', adminAuth, (req, res) => {
  const db = getDb();
  const games = db.prepare('SELECT * FROM games ORDER BY created_at DESC').all();
  res.json(games);
});

// Create game
router.post('/game', adminAuth, (req, res) => {
  const { name, year, season } = req.body;
  const db = getDb();
  // Check for duplicate year/season
  const existing = db.prepare('SELECT id FROM games WHERE year = ? AND season = ?').get(year, season);
  if (existing) {
    return res.status(400).json({ error: `A game already exists for ${season} ${year}. Use a different season or year.` });
  }
  const result = db.prepare('INSERT INTO games (name, year, season, is_active) VALUES (?, ?, ?, 0)').run(name, year, season);
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid);
  res.json(game);
});

// Update game (rename, lock/unlock)
router.put('/game/:id', adminAuth, (req, res) => {
  const { name, submissions_locked } = req.body;
  const db = getDb();
  if (name !== undefined) {
    db.prepare('UPDATE games SET name = ? WHERE id = ?').run(name, req.params.id);
  }
  if (submissions_locked !== undefined) {
    db.prepare('UPDATE games SET submissions_locked = ? WHERE id = ?').run(submissions_locked ? 1 : 0, req.params.id);
  }
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  res.json(game);
});

// Switch active game
router.post('/game/:id/activate', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE games SET is_active = 0').run();
  db.prepare('UPDATE games SET is_active = 1 WHERE id = ?').run(req.params.id);
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  res.json(game);
});

// Delete game
router.delete('/game/:id', adminAuth, (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.is_active) return res.status(400).json({ error: 'Cannot delete the active game. Switch to another game first.' });

  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Lock / unlock submissions
router.post('/lock', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE games SET submissions_locked = 1 WHERE is_active = 1').run();
  res.json({ success: true });
});

router.post('/unlock', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE games SET submissions_locked = 0 WHERE is_active = 1').run();
  res.json({ success: true });
});

// Get sessions
router.get('/sessions', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.json([]);
  const sessions = db.prepare('SELECT * FROM sessions WHERE game_id = ? ORDER BY sort_order').all(game.id);
  res.json(sessions);
});

// Create/update sessions
router.post('/sessions', adminAuth, (req, res) => {
  const { sessions } = req.body;
  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });

  const upsert = db.prepare(`
    INSERT INTO sessions (id, game_id, name, sort_order) VALUES (?, ?, ?, ?)
    ON CONFLICT(game_id, sort_order) DO UPDATE SET name = excluded.name
  `);

  const batch = db.transaction(() => {
    for (const s of sessions) {
      upsert.run(s.id || null, game.id, s.name, s.sort_order);
    }
  });
  batch();

  const result = db.prepare('SELECT * FROM sessions WHERE game_id = ? ORDER BY sort_order').all(game.id);
  res.json(result);
});

module.exports = router;

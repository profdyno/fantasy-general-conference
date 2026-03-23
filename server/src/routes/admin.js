const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getDb } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

// Login — validate admin password
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash');
  if (!row) return res.status(500).json({ error: 'Admin password not configured' });

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== row.value) {
    return res.status(403).json({ error: 'Invalid password' });
  }

  res.json({ success: true });
});

// Get active game
router.get('/game', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT * FROM games WHERE is_active = 1').get();
  if (!game) return res.status(404).json({ error: 'No active game' });
  res.json(game);
});

// Create game
router.post('/game', adminAuth, (req, res) => {
  const { name, year, season } = req.body;
  const db = getDb();
  // Deactivate any existing active games
  db.prepare('UPDATE games SET is_active = 0 WHERE is_active = 1').run();
  const result = db.prepare('INSERT INTO games (name, year, season) VALUES (?, ?, ?)').run(name, year, season);
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid);
  res.json(game);
});

// Update game
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

// Lock submissions
router.post('/lock', adminAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE games SET submissions_locked = 1 WHERE is_active = 1').run();
  res.json({ success: true });
});

// Unlock submissions
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

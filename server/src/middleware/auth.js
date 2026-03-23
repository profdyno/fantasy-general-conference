const crypto = require('crypto');
const { getDb } = require('../db/database');

function adminAuth(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey) {
    return res.status(401).json({ error: 'Admin key required' });
  }

  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash');
  if (!row) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  const hash = crypto.createHash('sha256').update(adminKey).digest('hex');
  if (hash !== row.value) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  next();
}

function playerFromSlug(req, res, next) {
  const slug = req.headers['x-player-slug'];
  if (!slug) {
    return res.status(401).json({ error: 'Player slug required' });
  }

  const db = getDb();
  const game = db.prepare('SELECT id FROM games WHERE is_active = 1').get();
  if (!game) {
    return res.status(404).json({ error: 'No active game' });
  }

  const player = db.prepare('SELECT * FROM players WHERE game_id = ? AND slug = ? AND is_active = 1').get(game.id, slug);
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  req.player = player;
  req.game = game;
  next();
}

module.exports = { adminAuth, playerFromSlug };

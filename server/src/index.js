const express = require('express');
const path = require('path');
const cors = require('cors');
const { adminAuth, playerFromSlug } = require('./middleware/auth');
const { getDb } = require('./db/database');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Serve built frontend static files
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/players', require('./routes/players'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/actuals', require('./routes/actuals'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/penalties', require('./routes/penalties'));
app.use('/api/events', require('./routes/events').router);

// API error handler
app.use('/api', (err, req, res, next) => {
  console.error('API error:', err.message);
  res.status(500).json({ error: err.message });
});

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Initialize DB on startup
getDb();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fantasy GenConf server running on http://localhost:${PORT}`);
});

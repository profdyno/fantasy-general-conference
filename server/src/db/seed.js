const crypto = require('crypto');
const { getDb } = require('./database');

const db = getDb();

// Create admin password
const adminPassword = 'genconf2026';
const hash = crypto.createHash('sha256').update(adminPassword).digest('hex');
db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_password_hash', hash);

// Create game
const gameResult = db.prepare(`
  INSERT OR IGNORE INTO games (name, year, season) VALUES (?, ?, ?)
`).run('April 2026 General Conference', 2026, 'april');

const game = db.prepare('SELECT * FROM games WHERE year = 2026 AND season = ?').get('april');

// Create 5 sessions
const sessions = [
  { name: 'Saturday Morning', sort_order: 1 },
  { name: 'Saturday Afternoon', sort_order: 2 },
  { name: 'Saturday Evening (Priesthood)', sort_order: 3 },
  { name: 'Sunday Morning', sort_order: 4 },
  { name: 'Sunday Afternoon', sort_order: 5 },
];

const insertSession = db.prepare('INSERT OR IGNORE INTO sessions (game_id, name, sort_order) VALUES (?, ?, ?)');
for (const s of sessions) {
  insertSession.run(game.id, s.name, s.sort_order);
}

const dbSessions = db.prepare('SELECT * FROM sessions WHERE game_id = ? ORDER BY sort_order').all(game.id);

// Sample questions
const sampleQuestions = [
  // Conference-wide questions
  { session_id: null, text: 'How many total speakers will there be across all sessions?', question_type: 'number', scoring_type: 'closest', points: 15, bonus_points: 5, tolerance: 3 },
  { session_id: null, text: 'Will a new temple be announced?', question_type: 'yes_no', scoring_type: 'boolean', points: 10 },
  { session_id: null, text: 'How many new temples will be announced?', question_type: 'number', scoring_type: 'closest', points: 15, bonus_points: 10, tolerance: 2 },
  { session_id: null, text: 'Will President Nelson give a talk?', question_type: 'yes_no', scoring_type: 'boolean', points: 10 },

  // Saturday Morning
  { session_id: dbSessions[0].id, text: 'How many speakers in Saturday Morning session?', question_type: 'number', scoring_type: 'closest', points: 10, bonus_points: 5, tolerance: 1 },
  { session_id: dbSessions[0].id, text: 'Who will be the first speaker?', question_type: 'text', scoring_type: 'exact', points: 20 },
  { session_id: dbSessions[0].id, text: 'Will someone cry during their talk?', question_type: 'yes_no', scoring_type: 'boolean', points: 5 },

  // Saturday Afternoon
  { session_id: dbSessions[1].id, text: 'How many speakers in Saturday Afternoon session?', question_type: 'number', scoring_type: 'closest', points: 10, bonus_points: 5, tolerance: 1 },
  { session_id: dbSessions[1].id, text: 'Will "covenant path" be mentioned in this session?', question_type: 'yes_no', scoring_type: 'boolean', points: 10 },

  // Priesthood
  { session_id: dbSessions[2].id, text: 'How many speakers in the Priesthood session?', question_type: 'number', scoring_type: 'closest', points: 10, bonus_points: 5, tolerance: 1 },

  // Sunday Morning
  { session_id: dbSessions[3].id, text: 'How many speakers in Sunday Morning session?', question_type: 'number', scoring_type: 'closest', points: 10, bonus_points: 5, tolerance: 1 },
  { session_id: dbSessions[3].id, text: 'Name a hymn that will be sung in this session', question_type: 'text', scoring_type: 'contains', points: 15 },

  // Sunday Afternoon
  { session_id: dbSessions[4].id, text: 'How many speakers in Sunday Afternoon session?', question_type: 'number', scoring_type: 'closest', points: 10, bonus_points: 5, tolerance: 1 },
  { session_id: dbSessions[4].id, text: 'Will there be any changes to church leadership announced?', question_type: 'yes_no', scoring_type: 'boolean', points: 10 },
];

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO questions (game_id, session_id, sort_order, text, question_type, scoring_type, points, bonus_points, tolerance)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let order = 0;
for (const q of sampleQuestions) {
  insertQuestion.run(game.id, q.session_id, order++, q.text, q.question_type, q.scoring_type, q.points, q.bonus_points || 0, q.tolerance || null);
}

console.log('Seed complete!');
console.log(`Game: ${game.name} (id: ${game.id})`);
console.log(`Sessions: ${dbSessions.length}`);
console.log(`Sample questions: ${sampleQuestions.length}`);
console.log(`Admin password: ${adminPassword}`);

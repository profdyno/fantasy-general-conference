const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { DEFAULT_OPTIONS } = require('./defaultOptions');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'fantasygenconf.db');

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);

    // Migrations
    const playerCols = db.prepare('PRAGMA table_info(players)').all().map(c => c.name);
    if (!playerCols.includes('role')) db.exec("ALTER TABLE players ADD COLUMN role TEXT DEFAULT 'parent'");
    if (!playerCols.includes('parent1_id')) db.exec('ALTER TABLE players ADD COLUMN parent1_id INTEGER');
    if (!playerCols.includes('parent2_id')) db.exec('ALTER TABLE players ADD COLUMN parent2_id INTEGER');

    // Fill default topic/hymn lists once; afterwards they are managed from the admin dashboard
    const filled = db.prepare("SELECT value FROM settings WHERE key = 'default_options_filled'").get();
    if (!filled) {
      const insert = db.prepare('INSERT OR IGNORE INTO default_options (list, value) VALUES (?, ?)');
      db.transaction(() => {
        for (const [list, values] of Object.entries(DEFAULT_OPTIONS)) {
          for (const value of values) insert.run(list, value);
        }
        db.prepare("INSERT INTO settings (key, value) VALUES ('default_options_filled', '1')").run();
      })();
    }
  }
  return db;
}

module.exports = { getDb };

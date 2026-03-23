-- Conference game instance
CREATE TABLE IF NOT EXISTS games (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    year              INTEGER NOT NULL,
    season            TEXT NOT NULL CHECK(season IN ('april', 'october', 'test')),
    is_active         INTEGER NOT NULL DEFAULT 1,
    submissions_locked INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(year, season)
);

-- Sessions within a conference
CREATE TABLE IF NOT EXISTS sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id         INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    sort_order      INTEGER NOT NULL,
    UNIQUE(game_id, sort_order)
);

-- Players
CREATE TABLE IF NOT EXISTS players (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id         INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    email           TEXT,
    role            TEXT DEFAULT 'parent',
    parent1_id      INTEGER REFERENCES players(id),
    parent2_id      INTEGER REFERENCES players(id),
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(game_id, slug)
);

-- Questions with scoring rules
CREATE TABLE IF NOT EXISTS questions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id         INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    session_id      INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    text            TEXT NOT NULL,
    question_type   TEXT NOT NULL,
    options         TEXT,
    scoring_type    TEXT NOT NULL,
    points          INTEGER NOT NULL DEFAULT 10,
    bonus_points    INTEGER DEFAULT 0,
    tolerance       REAL,
    category        TEXT,
    group_key       TEXT,
    allow_after_lock INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Player answers
CREATE TABLE IF NOT EXISTS answers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    answer_value    TEXT NOT NULL,
    submitted_at    TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(question_id, player_id)
);

-- Actual results
CREATE TABLE IF NOT EXISTS actuals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    actual_value    TEXT NOT NULL,
    entered_at      TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(question_id)
);

-- Computed scores
CREATE TABLE IF NOT EXISTS scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    points_earned   REAL NOT NULL DEFAULT 0,
    is_correct      INTEGER NOT NULL DEFAULT 0,
    computed_at     TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(question_id, player_id)
);

-- Penalties (admin-tracked per player during conference)
CREATE TABLE IF NOT EXISTS penalties (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id         INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    penalty_type    TEXT NOT NULL,
    count           INTEGER NOT NULL DEFAULT 0,
    updated_at      TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(game_id, player_id, penalty_type)
);

-- Settings (admin password, etc.)
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT PRIMARY KEY,
    value           TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_game_slug ON players(game_id, slug);
CREATE INDEX IF NOT EXISTS idx_questions_game ON questions(game_id);
CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(game_id, category);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_player ON answers(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_question ON scores(question_id);
CREATE INDEX IF NOT EXISTS idx_penalties_player ON penalties(game_id, player_id);

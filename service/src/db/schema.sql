-- Athletes/Fighters Table
CREATE TABLE IF NOT EXISTS athletes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tournament TEXT NOT NULL,
  division TEXT,
  country TEXT,
  flag TEXT,
  gender TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  tournament TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT,
  location TEXT,
  venue TEXT,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Matches/Fights Table
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  category TEXT,
  fighter1_id INTEGER,
  fighter1_name TEXT NOT NULL,
  fighter1_country TEXT,
  fighter1_flag TEXT,
  fighter2_id INTEGER,
  fighter2_name TEXT NOT NULL,
  fighter2_country TEXT,
  fighter2_flag TEXT,
  weight_class TEXT,
  winner INTEGER,
  method TEXT,
  round INTEGER,
  time TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (fighter1_id) REFERENCES athletes(id),
  FOREIGN KEY (fighter2_id) REFERENCES athletes(id)
);

-- Rankings Table
CREATE TABLE IF NOT EXISTS rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament TEXT NOT NULL,
  division TEXT NOT NULL,
  rank INTEGER NOT NULL,
  athlete_id INTEGER,
  athlete_name TEXT NOT NULL,
  is_champion BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

-- P4P Rankings Table
CREATE TABLE IF NOT EXISTS p4p_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament TEXT NOT NULL,
  rank INTEGER NOT NULL,
  athlete_id INTEGER,
  athlete_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  theme TEXT NOT NULL,
  color TEXT NOT NULL,
  events TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_athletes_tournament ON athletes(tournament);
CREATE INDEX IF NOT EXISTS idx_athletes_division ON athletes(division);
CREATE INDEX IF NOT EXISTS idx_athletes_gender ON athletes(gender);
CREATE INDEX IF NOT EXISTS idx_events_tournament ON events(tournament);
CREATE INDEX IF NOT EXISTS idx_matches_event ON matches(event_id);
CREATE INDEX IF NOT EXISTS idx_rankings_tournament_division ON rankings(tournament, division);
CREATE INDEX IF NOT EXISTS idx_p4p_tournament ON p4p_rankings(tournament);

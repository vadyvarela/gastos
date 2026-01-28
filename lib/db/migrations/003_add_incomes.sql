-- Migration 003: Add incomes table
CREATE TABLE IF NOT EXISTS incomes (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  category_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_synced ON incomes(synced);

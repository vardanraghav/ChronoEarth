CREATE TABLE IF NOT EXISTS signals (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT,
  type TEXT,
  category TEXT,
  year INTEGER,
  status TEXT
);

CREATE INDEX IF NOT EXISTS idx_signals_year ON signals(year);
CREATE INDEX IF NOT EXISTS idx_signals_category ON signals(category);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  author TEXT,
  city TEXT,
  confidence_score INTEGER,
  initial_votes INTEGER,
  votes INTEGER,
  tags JSONB,
  comments JSONB,
  share_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_predictions_year ON predictions(year);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);
CREATE INDEX IF NOT EXISTS idx_predictions_slug ON predictions(slug);

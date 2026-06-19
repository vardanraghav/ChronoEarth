CREATE TABLE IF NOT EXISTS futurologists (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  role TEXT,
  specialization TEXT,
  avatar TEXT,
  bio TEXT,
  contributions INTEGER,
  influenceScore INTEGER
);

CREATE INDEX IF NOT EXISTS idx_futurologists_slug ON futurologists(slug);
CREATE INDEX IF NOT EXISTS idx_futurologists_specialization ON futurologists(specialization);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  stats JSONB,
  explanation TEXT,
  forecast TEXT,
  risks JSONB,
  opportunities JSONB,
  sources JSONB,
  short_desc TEXT,
  content TEXT,
  readiness_index INTEGER,
  impact_level TEXT,
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_slug ON knowledge_base(slug);

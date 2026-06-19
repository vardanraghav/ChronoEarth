CREATE TABLE IF NOT EXISTS news (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT,
  time TEXT,
  description TEXT,
  image TEXT,
  slug TEXT UNIQUE NOT NULL,
  year INTEGER
);

CREATE INDEX IF NOT EXISTS idx_news_year ON news(year);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

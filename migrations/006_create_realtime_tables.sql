-- 006_create_realtime_tables.sql
-- Migration to create tables for real-time market snapshots, earthquakes, space events, climate snapshots, and semiconductor news.

-- 1. Create market_snapshots table
CREATE TABLE IF NOT EXISTS market_snapshots (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ticker TEXT NOT NULL,
  price NUMERIC NOT NULL,
  change NUMERIC,
  change_percent TEXT,
  volume BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_ticker ON market_snapshots(ticker);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_timestamp ON market_snapshots(timestamp);

ALTER TABLE market_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on market_snapshots" ON market_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert on market_snapshots" ON market_snapshots FOR INSERT WITH CHECK (true);

-- 2. Create earthquakes table
CREATE TABLE IF NOT EXISTS earthquakes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usgs_id TEXT UNIQUE NOT NULL,
  magnitude NUMERIC NOT NULL,
  place TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  lat NUMERIC NOT NULL,
  lon NUMERIC NOT NULL,
  depth NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_earthquakes_time ON earthquakes(time);
CREATE INDEX IF NOT EXISTS idx_earthquakes_magnitude ON earthquakes(magnitude);

ALTER TABLE earthquakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on earthquakes" ON earthquakes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on earthquakes" ON earthquakes FOR INSERT WITH CHECK (true);

-- 3. Create space_events table
CREATE TABLE IF NOT EXISTS space_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT NOT NULL, -- 'APOD', 'NEO', 'EPIC'
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE NOT NULL,
  metadata JSONB,
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_space_events_event_date ON space_events(event_date);
CREATE INDEX IF NOT EXISTS idx_space_events_event_type ON space_events(event_type);
CREATE INDEX IF NOT EXISTS idx_space_events_slug ON space_events(slug);

ALTER TABLE space_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on space_events" ON space_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on space_events" ON space_events FOR INSERT WITH CHECK (true);

-- 4. Create climate_snapshots table
CREATE TABLE IF NOT EXISTS climate_snapshots (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  city_name TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC,
  windspeed NUMERIC,
  rainfall NUMERIC,
  year INTEGER NOT NULL, -- 2030, 2040, 2050
  scenario TEXT, -- 'current', 'projections'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_climate_snapshots_city_name ON climate_snapshots(city_name);
CREATE INDEX IF NOT EXISTS idx_climate_snapshots_year ON climate_snapshots(year);
CREATE INDEX IF NOT EXISTS idx_climate_snapshots_timestamp ON climate_snapshots(timestamp);

ALTER TABLE climate_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on climate_snapshots" ON climate_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert on climate_snapshots" ON climate_snapshots FOR INSERT WITH CHECK (true);

-- 5. Create semiconductor_news table
CREATE TABLE IF NOT EXISTS semiconductor_news (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_semiconductor_news_company ON semiconductor_news(company);
CREATE INDEX IF NOT EXISTS idx_semiconductor_news_published_at ON semiconductor_news(published_at);
CREATE INDEX IF NOT EXISTS idx_semiconductor_news_slug ON semiconductor_news(slug);

ALTER TABLE semiconductor_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on semiconductor_news" ON semiconductor_news FOR SELECT USING (true);
CREATE POLICY "Allow public insert on semiconductor_news" ON semiconductor_news FOR INSERT WITH CHECK (true);

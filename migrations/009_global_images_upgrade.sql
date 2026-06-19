-- 009_global_images_upgrade.sql
-- Add image_url column support across all relevant tables

ALTER TABLE IF EXISTS news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS predictions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS signals ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS knowledge_base ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS futurologists ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS market_snapshots ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS earthquakes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS climate_snapshots ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS cities ADD COLUMN IF NOT EXISTS image_url TEXT;

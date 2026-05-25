-- Add subtitle column to site_config table
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS subtitle TEXT;

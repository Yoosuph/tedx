-- TEDx Dutse Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Site Configuration Table
CREATE TABLE site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_name TEXT NOT NULL DEFAULT 'TEDxDutse',
  event_year INTEGER NOT NULL DEFAULT 2026,
  theme TEXT NOT NULL DEFAULT 'Roots and Wings',
  tagline TEXT,
  date TEXT,
  time TEXT,
  venue TEXT,
  venue_short TEXT,
  dress_code TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speakers Table
CREATE TABLE speakers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  story TEXT,
  duration INTEGER,
  image TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule Table
CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  session_type TEXT NOT NULL, -- 'morning' or 'afternoon'
  session_label TEXT NOT NULL,
  session_time TEXT NOT NULL,
  time TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'talk', 'performance', 'break', 'remarks', 'video', 'award'
  description TEXT,
  speaker_id INTEGER REFERENCES speakers(id),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Tiers Table
CREATE TABLE ticket_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT '₦',
  features JSONB,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Images Table
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT,
  orientation TEXT CHECK (orientation IN ('landscape', 'portrait')),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors Table
CREATE TABLE sponsors (
  id SERIAL PRIMARY KEY,
  tier TEXT NOT NULL, -- 'presenting', 'platinum', 'gold', 'community'
  name TEXT NOT NULL,
  logo TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets Table (for actual purchased tickets)
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tier TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'paid',
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_schedule_session_type ON schedule(session_type);
CREATE INDEX idx_schedule_order ON schedule(session_type, order_index);
CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_order ON sponsors(tier, order_index);
CREATE INDEX idx_gallery_order ON gallery_images(order_index);
CREATE INDEX idx_tickets_reference ON tickets(reference);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Enable Row Level Security (RLS)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read access for speakers" ON speakers FOR SELECT USING (true);
CREATE POLICY "Public read access for schedule" ON schedule FOR SELECT USING (true);
CREATE POLICY "Public read access for ticket_tiers" ON ticket_tiers FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery_images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public read access for sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Public read access for tickets" ON tickets FOR SELECT USING (true);

-- Create policies for admin write access (using service role key)
CREATE POLICY "Service role can insert site_config" ON site_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update site_config" ON site_config FOR UPDATE USING (true);
CREATE POLICY "Service role can insert speakers" ON speakers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update speakers" ON speakers FOR UPDATE USING (true);
CREATE POLICY "Service role can delete speakers" ON speakers FOR DELETE USING (true);
CREATE POLICY "Service role can insert schedule" ON schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update schedule" ON schedule FOR UPDATE USING (true);
CREATE POLICY "Service role can delete schedule" ON schedule FOR DELETE USING (true);
CREATE POLICY "Service role can insert ticket_tiers" ON ticket_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update ticket_tiers" ON ticket_tiers FOR UPDATE USING (true);
CREATE POLICY "Service role can delete ticket_tiers" ON ticket_tiers FOR DELETE USING (true);
CREATE POLICY "Service role can insert gallery_images" ON gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update gallery_images" ON gallery_images FOR UPDATE USING (true);
CREATE POLICY "Service role can delete gallery_images" ON gallery_images FOR DELETE USING (true);
CREATE POLICY "Service role can insert sponsors" ON sponsors FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update sponsors" ON sponsors FOR UPDATE USING (true);
CREATE POLICY "Service role can delete sponsors" ON sponsors FOR DELETE USING (true);
CREATE POLICY "Service role can insert tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update tickets" ON tickets FOR UPDATE USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_speakers_updated_at BEFORE UPDATE ON speakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_tiers_updated_at BEFORE UPDATE ON ticket_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Allow anonymous (anon key) write access for admin operations
-- In production, replace these with proper Supabase Auth-based policies

-- Site Config
DROP POLICY IF EXISTS "Service role can insert site_config" ON site_config;
DROP POLICY IF EXISTS "Service role can update site_config" ON site_config;
CREATE POLICY "Allow anon insert site_config" ON site_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update site_config" ON site_config FOR UPDATE USING (true);

-- Speakers
DROP POLICY IF EXISTS "Service role can insert speakers" ON speakers;
DROP POLICY IF EXISTS "Service role can update speakers" ON speakers;
DROP POLICY IF EXISTS "Service role can delete speakers" ON speakers;
CREATE POLICY "Allow anon insert speakers" ON speakers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update speakers" ON speakers FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete speakers" ON speakers FOR DELETE USING (true);

-- Schedule
DROP POLICY IF EXISTS "Service role can insert schedule" ON schedule;
DROP POLICY IF EXISTS "Service role can update schedule" ON schedule;
DROP POLICY IF EXISTS "Service role can delete schedule" ON schedule;
CREATE POLICY "Allow anon insert schedule" ON schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update schedule" ON schedule FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete schedule" ON schedule FOR DELETE USING (true);

-- Ticket Tiers
DROP POLICY IF EXISTS "Service role can insert ticket_tiers" ON ticket_tiers;
DROP POLICY IF EXISTS "Service role can update ticket_tiers" ON ticket_tiers;
DROP POLICY IF EXISTS "Service role can delete ticket_tiers" ON ticket_tiers;
CREATE POLICY "Allow anon insert ticket_tiers" ON ticket_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update ticket_tiers" ON ticket_tiers FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete ticket_tiers" ON ticket_tiers FOR DELETE USING (true);

-- Gallery Images
DROP POLICY IF EXISTS "Service role can insert gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Service role can update gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Service role can delete gallery_images" ON gallery_images;
CREATE POLICY "Allow anon insert gallery_images" ON gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update gallery_images" ON gallery_images FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete gallery_images" ON gallery_images FOR DELETE USING (true);

-- Sponsors
DROP POLICY IF EXISTS "Service role can insert sponsors" ON sponsors;
DROP POLICY IF EXISTS "Service role can update sponsors" ON sponsors;
DROP POLICY IF EXISTS "Service role can delete sponsors" ON sponsors;
CREATE POLICY "Allow anon insert sponsors" ON sponsors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update sponsors" ON sponsors FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete sponsors" ON sponsors FOR DELETE USING (true);

-- Tickets
DROP POLICY IF EXISTS "Service role can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Service role can update tickets" ON tickets;
CREATE POLICY "Allow anon insert tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update tickets" ON tickets FOR UPDATE USING (true);

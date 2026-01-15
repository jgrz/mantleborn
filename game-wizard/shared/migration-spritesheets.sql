-- =============================================
-- SPRITESHEETS MIGRATION
-- =============================================
-- Run this in Supabase SQL Editor
-- ALSO: Create a storage bucket called "spritesheets" in Supabase Dashboard
--       (Storage > New Bucket > Name: spritesheets, Public: true)

-- =============================================
-- TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS spritesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  frame_width INTEGER,
  frame_height INTEGER,
  columns INTEGER,
  rows INTEGER,
  animations JSONB DEFAULT '{}',
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_spritesheets_project_id ON spritesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_spritesheets_category ON spritesheets(category);
CREATE INDEX IF NOT EXISTS idx_spritesheets_tags ON spritesheets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_spritesheets_is_master ON spritesheets(is_master);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE spritesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spritesheets are publicly readable" ON spritesheets
  FOR SELECT USING (true);

CREATE POLICY "Spritesheets are insertable" ON spritesheets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Spritesheets are updatable" ON spritesheets
  FOR UPDATE USING (true);

CREATE POLICY "Spritesheets are deletable" ON spritesheets
  FOR DELETE USING (true);

-- =============================================
-- TRIGGER
-- =============================================

CREATE TRIGGER spritesheets_updated_at BEFORE UPDATE ON spritesheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- STORAGE BUCKET POLICY (run after creating bucket)
-- =============================================
-- These policies allow public read and authenticated/anon upload
-- Run these AFTER creating the "spritesheets" bucket in the dashboard

-- Allow public read access
CREATE POLICY "Spritesheet files are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'spritesheets');

-- Allow uploads
CREATE POLICY "Spritesheet files are uploadable"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'spritesheets');

-- Allow updates
CREATE POLICY "Spritesheet files are updatable"
ON storage.objects FOR UPDATE
USING (bucket_id = 'spritesheets');

-- Allow deletes
CREATE POLICY "Spritesheet files are deletable"
ON storage.objects FOR DELETE
USING (bucket_id = 'spritesheets');

-- =============================================
-- DONE!
-- =============================================
-- Table created: spritesheets
-- Remember to create the storage bucket manually in Supabase Dashboard!

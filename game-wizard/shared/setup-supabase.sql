-- =============================================
-- CRUCIBLE OF CODE - Supabase Schema Setup
-- =============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Projects: Container for game projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID,
  is_public BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Levels: Individual level definitions within a project
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  level_type VARCHAR(20) DEFAULT 'platformer',
  width INTEGER NOT NULL DEFAULT 32,
  height INTEGER NOT NULL DEFAULT 18,
  tile_size INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(project_id, slug)
);

-- Level Grids: Collision/navigation data from Level Forge
CREATE TABLE IF NOT EXISTS level_grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE UNIQUE,
  grid_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  spawn_point JSONB,
  walkable JSONB DEFAULT '[]'::jsonb,
  obstructions JSONB DEFAULT '[]'::jsonb,
  physics_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level Backgrounds: Parallax background layers
CREATE TABLE IF NOT EXISTS level_backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  layer_name VARCHAR(100) NOT NULL,
  image_path VARCHAR(500),
  depth INTEGER DEFAULT 0,
  scroll_rate DECIMAL(5,2) DEFAULT 1.0,
  offset_x INTEGER DEFAULT 0,
  offset_y INTEGER DEFAULT 0,
  scale DECIMAL(5,2) DEFAULT 1.0,
  visible BOOLEAN DEFAULT true,
  pixelify_config JSONB,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level Tiles: Visual tile placements (sparse encoding)
CREATE TABLE IF NOT EXISTS level_tiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE UNIQUE,
  tile_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_levels_project_id ON levels(project_id);
CREATE INDEX IF NOT EXISTS idx_level_grids_level_id ON level_grids(level_id);
CREATE INDEX IF NOT EXISTS idx_level_backgrounds_level_id ON level_backgrounds(level_id);
CREATE INDEX IF NOT EXISTS idx_level_tiles_level_id ON level_tiles(level_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_tiles ENABLE ROW LEVEL SECURITY;

-- Projects: public projects readable by all, owned projects editable
CREATE POLICY "Projects are publicly readable" ON projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Projects are insertable by anyone" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Projects are updatable by anyone for now" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Projects are deletable by anyone for now" ON projects
  FOR DELETE USING (true);

-- Levels: inherit access from parent project
CREATE POLICY "Levels are publicly readable" ON levels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = levels.project_id AND projects.is_public = true)
  );

CREATE POLICY "Levels are insertable" ON levels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Levels are updatable" ON levels
  FOR UPDATE USING (true);

CREATE POLICY "Levels are deletable" ON levels
  FOR DELETE USING (true);

-- Level Grids
CREATE POLICY "Level grids are publicly readable" ON level_grids
  FOR SELECT USING (true);

CREATE POLICY "Level grids are insertable" ON level_grids
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level grids are updatable" ON level_grids
  FOR UPDATE USING (true);

CREATE POLICY "Level grids are deletable" ON level_grids
  FOR DELETE USING (true);

-- Level Backgrounds
CREATE POLICY "Level backgrounds are publicly readable" ON level_backgrounds
  FOR SELECT USING (true);

CREATE POLICY "Level backgrounds are insertable" ON level_backgrounds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level backgrounds are updatable" ON level_backgrounds
  FOR UPDATE USING (true);

CREATE POLICY "Level backgrounds are deletable" ON level_backgrounds
  FOR DELETE USING (true);

-- Level Tiles
CREATE POLICY "Level tiles are publicly readable" ON level_tiles
  FOR SELECT USING (true);

CREATE POLICY "Level tiles are insertable" ON level_tiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level tiles are updatable" ON level_tiles
  FOR UPDATE USING (true);

CREATE POLICY "Level tiles are deletable" ON level_tiles
  FOR DELETE USING (true);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these separately in Storage settings or SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER levels_updated_at BEFORE UPDATE ON levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER level_grids_updated_at BEFORE UPDATE ON level_grids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER level_backgrounds_updated_at BEFORE UPDATE ON level_backgrounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER level_tiles_updated_at BEFORE UPDATE ON level_tiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DONE!
-- =============================================
-- After running this, go to:
-- 1. Storage > Create new bucket called "backgrounds" (public)
-- 2. Settings > API to get your URL and anon key

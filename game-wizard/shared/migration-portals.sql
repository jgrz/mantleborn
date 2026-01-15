-- =============================================
-- PORTALS MIGRATION - Spawns, Exits, Connections
-- =============================================
-- Run this in Supabase SQL Editor AFTER the initial setup-supabase.sql

-- =============================================
-- NEW TABLES
-- =============================================

-- Level Spawns: Multiple named spawn points per level
CREATE TABLE IF NOT EXISTS level_spawns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  direction VARCHAR(10) DEFAULT 'down',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(level_id, name)
);

-- Level Exits: Exit and return markers with target configuration
CREATE TABLE IF NOT EXISTS level_exits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  direction VARCHAR(10) DEFAULT 'right',
  exit_type VARCHAR(20) DEFAULT 'exit',
  target_level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
  target_spawn_name VARCHAR(100),
  configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(level_id, name)
);

-- Level Connections: For visualizing pathways in Portals node mapper
CREATE TABLE IF NOT EXISTS level_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_exit_id UUID REFERENCES level_exits(id) ON DELETE CASCADE,
  target_spawn_id UUID REFERENCES level_spawns(id) ON DELETE CASCADE,
  bidirectional BOOLEAN DEFAULT false,
  return_exit_id UUID REFERENCES level_exits(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_level_spawns_level_id ON level_spawns(level_id);
CREATE INDEX IF NOT EXISTS idx_level_exits_level_id ON level_exits(level_id);
CREATE INDEX IF NOT EXISTS idx_level_exits_target_level_id ON level_exits(target_level_id);
CREATE INDEX IF NOT EXISTS idx_level_connections_project_id ON level_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_level_connections_source_exit ON level_connections(source_exit_id);
CREATE INDEX IF NOT EXISTS idx_level_connections_target_spawn ON level_connections(target_spawn_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE level_spawns ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_exits ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_connections ENABLE ROW LEVEL SECURITY;

-- Level Spawns
CREATE POLICY "Level spawns are publicly readable" ON level_spawns
  FOR SELECT USING (true);

CREATE POLICY "Level spawns are insertable" ON level_spawns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level spawns are updatable" ON level_spawns
  FOR UPDATE USING (true);

CREATE POLICY "Level spawns are deletable" ON level_spawns
  FOR DELETE USING (true);

-- Level Exits
CREATE POLICY "Level exits are publicly readable" ON level_exits
  FOR SELECT USING (true);

CREATE POLICY "Level exits are insertable" ON level_exits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level exits are updatable" ON level_exits
  FOR UPDATE USING (true);

CREATE POLICY "Level exits are deletable" ON level_exits
  FOR DELETE USING (true);

-- Level Connections
CREATE POLICY "Level connections are publicly readable" ON level_connections
  FOR SELECT USING (true);

CREATE POLICY "Level connections are insertable" ON level_connections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Level connections are updatable" ON level_connections
  FOR UPDATE USING (true);

CREATE POLICY "Level connections are deletable" ON level_connections
  FOR DELETE USING (true);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER level_spawns_updated_at BEFORE UPDATE ON level_spawns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER level_exits_updated_at BEFORE UPDATE ON level_exits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER level_connections_updated_at BEFORE UPDATE ON level_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DONE!
-- =============================================
-- Tables created:
--   level_spawns - Multiple named spawn points per level
--   level_exits - Exit and return markers
--   level_connections - Connections between exits and spawns

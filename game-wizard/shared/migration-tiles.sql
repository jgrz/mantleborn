-- =============================================
-- TILES AND TILE SPECIFICATIONS TABLES
-- =============================================
-- Run this in Supabase SQL Editor
-- Creates tables for Tilesmith tile creation tool

-- Tile specifications (AI-generated guidance)
CREATE TABLE IF NOT EXISTS tile_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    request JSONB NOT NULL,
    specification JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tiles (pixel data and metadata)
CREATE TABLE IF NOT EXISTS tiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL DEFAULT 16,
    height INTEGER NOT NULL DEFAULT 16,
    pixel_data TEXT NOT NULL,
    palette JSONB DEFAULT '[]',
    tile_type VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    spec_id UUID REFERENCES tile_specifications(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tiles_project ON tiles(project_id);
CREATE INDEX IF NOT EXISTS idx_tiles_user ON tiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tiles_type ON tiles(tile_type);
CREATE INDEX IF NOT EXISTS idx_tile_specs_project ON tile_specifications(project_id);

-- =============================================
-- RLS POLICIES FOR TILE_SPECIFICATIONS
-- =============================================

ALTER TABLE tile_specifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tile_specs_public_read" ON tile_specifications;
CREATE POLICY "tile_specs_public_read" ON tile_specifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "tile_specs_user_insert" ON tile_specifications;
CREATE POLICY "tile_specs_user_insert" ON tile_specifications
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

DROP POLICY IF EXISTS "tile_specs_user_update" ON tile_specifications;
CREATE POLICY "tile_specs_user_update" ON tile_specifications
    FOR UPDATE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

DROP POLICY IF EXISTS "tile_specs_user_delete" ON tile_specifications;
CREATE POLICY "tile_specs_user_delete" ON tile_specifications
    FOR DELETE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- =============================================
-- RLS POLICIES FOR TILES
-- =============================================

ALTER TABLE tiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tiles_public_read" ON tiles;
CREATE POLICY "tiles_public_read" ON tiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "tiles_user_insert" ON tiles;
CREATE POLICY "tiles_user_insert" ON tiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

DROP POLICY IF EXISTS "tiles_user_update" ON tiles;
CREATE POLICY "tiles_user_update" ON tiles
    FOR UPDATE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

DROP POLICY IF EXISTS "tiles_user_delete" ON tiles;
CREATE POLICY "tiles_user_delete" ON tiles
    FOR DELETE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- =============================================
-- UPDATE TIMESTAMP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_tiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tiles_updated_at ON tiles;
CREATE TRIGGER tiles_updated_at
    BEFORE UPDATE ON tiles
    FOR EACH ROW
    EXECUTE FUNCTION update_tiles_timestamp();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE tiles IS 'Individual tile assets created in Tilesmith';
COMMENT ON COLUMN tiles.pixel_data IS 'Base64 encoded PNG data or JSON pixel array';
COMMENT ON COLUMN tiles.palette IS 'Array of color definitions [{ name, hex, usage }]';
COMMENT ON COLUMN tiles.metadata IS 'Additional properties like seamless edges, collision info';
COMMENT ON COLUMN tiles.spec_id IS 'Optional link to AI-generated specification used as reference';

COMMENT ON TABLE tile_specifications IS 'AI-generated tile specifications for guidance';
COMMENT ON COLUMN tile_specifications.request IS 'Original parameters sent to AI';
COMMENT ON COLUMN tile_specifications.specification IS 'Generated spec with colors, guidance, variations';

-- =============================================
-- DONE!
-- =============================================

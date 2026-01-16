-- Migration: Tile Groups and Draft Sheet
-- Adds draft tile sheet to projects and creates tile_groups table

-- =============================================
-- ADD DRAFT SHEET COLUMNS TO PROJECTS
-- =============================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS draft_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS draft_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "sprites": {}}',
ADD COLUMN IF NOT EXISTS draft_sheet_updated_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- CREATE TILE GROUPS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS tile_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cols INT NOT NULL DEFAULT 1,
    rows INT NOT NULL DEFAULT 1,
    arrangement JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique group name per project
    UNIQUE(project_id, name)
);

-- Index for faster lookups by project
CREATE INDEX IF NOT EXISTS idx_tile_groups_project_id ON tile_groups(project_id);

-- =============================================
-- ROW LEVEL SECURITY FOR TILE GROUPS
-- =============================================

ALTER TABLE tile_groups ENABLE ROW LEVEL SECURITY;

-- Users can view tile groups for projects they own
CREATE POLICY "Users can view own project tile groups" ON tile_groups
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Users can insert tile groups for projects they own
CREATE POLICY "Users can insert own project tile groups" ON tile_groups
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Users can update tile groups for projects they own
CREATE POLICY "Users can update own project tile groups" ON tile_groups
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Users can delete tile groups for projects they own
CREATE POLICY "Users can delete own project tile groups" ON tile_groups
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- FUNCTION TO UPDATE updated_at TIMESTAMP
-- =============================================

CREATE OR REPLACE FUNCTION update_tile_group_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS tile_groups_updated_at ON tile_groups;
CREATE TRIGGER tile_groups_updated_at
    BEFORE UPDATE ON tile_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_tile_group_updated_at();

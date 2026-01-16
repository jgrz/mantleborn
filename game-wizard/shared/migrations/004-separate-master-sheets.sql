-- Migration: Separate Master Tile Sheet and Master Sprite Sheet
-- Separates tiles and sprites into distinct master sheets for cleaner architecture

-- =============================================
-- ADD MASTER TILE SHEET COLUMNS
-- =============================================
-- Source of truth for tiles (Tilesmith → Level Forge)

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS master_tile_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS master_tile_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "sprites": {}}',
ADD COLUMN IF NOT EXISTS master_tile_sheet_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN projects.master_tile_sheet_png IS 'Base64 encoded PNG of the packed master tile sheet (tiles only)';
COMMENT ON COLUMN projects.master_tile_sheet_atlas IS 'JSON atlas with tile definitions: {size: {w,h}, sprites: {name: {x,y,w,h,source}}}';
COMMENT ON COLUMN projects.master_tile_sheet_updated_at IS 'Last time the master tile sheet was regenerated';

-- =============================================
-- ADD MASTER SPRITE SHEET COLUMNS
-- =============================================
-- Source of truth for sprites (Sprite-Rite → Animancer)

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS master_sprite_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS master_sprite_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "sprites": {}}',
ADD COLUMN IF NOT EXISTS master_sprite_sheet_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN projects.master_sprite_sheet_png IS 'Base64 encoded PNG of the packed master sprite sheet (sprites only)';
COMMENT ON COLUMN projects.master_sprite_sheet_atlas IS 'JSON atlas with sprite definitions: {size: {w,h}, sprites: {name: {x,y,w,h,source}}}';
COMMENT ON COLUMN projects.master_sprite_sheet_updated_at IS 'Last time the master sprite sheet was regenerated';

-- =============================================
-- RENAME DRAFT SHEET COLUMNS (if they exist)
-- =============================================
-- Rename draft_sheet → draft_tile_sheet for clarity

DO $$
BEGIN
    -- Check if old column exists and new column doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'draft_sheet_png')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'draft_tile_sheet_png')
    THEN
        ALTER TABLE projects RENAME COLUMN draft_sheet_png TO draft_tile_sheet_png;
        ALTER TABLE projects RENAME COLUMN draft_sheet_atlas TO draft_tile_sheet_atlas;
        ALTER TABLE projects RENAME COLUMN draft_sheet_updated_at TO draft_tile_sheet_updated_at;
    END IF;
END $$;

-- If draft columns don't exist at all, create them with new names
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS draft_tile_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS draft_tile_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "sprites": {}}',
ADD COLUMN IF NOT EXISTS draft_tile_sheet_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN projects.draft_tile_sheet_png IS 'Base64 encoded PNG of work-in-progress tiles';
COMMENT ON COLUMN projects.draft_tile_sheet_atlas IS 'JSON atlas with draft tile definitions';
COMMENT ON COLUMN projects.draft_tile_sheet_updated_at IS 'Last time the draft tile sheet was updated';

-- =============================================
-- DONE!
-- =============================================
-- After running this migration:
-- 1. Projects will have master_tile_sheet_* columns for tiles
-- 2. Projects will have master_sprite_sheet_* columns for sprites
-- 3. Projects will have draft_tile_sheet_* columns for work-in-progress tiles
-- 4. Existing master_sheet_* columns remain for consolidated export
-- 5. Run data migration to separate existing master_sheet data

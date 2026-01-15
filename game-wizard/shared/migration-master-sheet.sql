-- =============================================
-- MASTER SPRITESHEET COLUMNS
-- =============================================
-- Run this in Supabase SQL Editor
-- Adds master spritesheet support to projects

-- Add master sheet columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS master_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS master_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "sprites": {}}',
ADD COLUMN IF NOT EXISTS master_sheet_updated_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN projects.master_sheet_png IS 'Base64 encoded PNG of the packed master spritesheet';
COMMENT ON COLUMN projects.master_sheet_atlas IS 'JSON atlas with sprite definitions: {size: {w,h}, sprites: {name: {x,y,w,h,source}}}';
COMMENT ON COLUMN projects.master_sheet_updated_at IS 'Last time the master sheet was regenerated';

-- =============================================
-- DONE!
-- =============================================
-- After running this migration:
-- 1. Projects will have master_sheet_png, master_sheet_atlas, master_sheet_updated_at columns
-- 2. Tilesmith can publish tiles to the master sheet
-- 3. Sprite-Rite can add imported sprites to the master sheet
-- 4. Level Forge and Animation-Station can consume from the master sheet

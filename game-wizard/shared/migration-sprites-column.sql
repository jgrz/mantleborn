-- =============================================
-- ADD SPRITES COLUMN TO SPRITESHEETS
-- =============================================
-- Run this in Supabase SQL Editor
-- Adds a sprites JSONB column to store sprite region definitions

ALTER TABLE spritesheets
ADD COLUMN IF NOT EXISTS sprites JSONB DEFAULT '[]';

-- Example sprites format:
-- [
--   { "name": "hero_idle", "x": 0, "y": 0, "width": 32, "height": 32, "description": "Hero idle frame" },
--   { "name": "hero_walk_1", "x": 32, "y": 0, "width": 32, "height": 32 }
-- ]

COMMENT ON COLUMN spritesheets.sprites IS 'Array of sprite region definitions extracted from this sheet';

-- =============================================
-- DONE!
-- =============================================

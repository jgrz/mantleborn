-- Migration: 006-cleanup-legacy-columns.sql
-- Remove legacy columns that are no longer used
--
-- BEFORE RUNNING: Ensure you have backed up any data if needed
-- These columns were replaced by the separated tile/sprite sheet columns

-- =============================================
-- DROP LEGACY MASTER SHEET COLUMNS
-- =============================================
-- These were the old unified master sheet before tile/sprite separation
-- Replaced by: master_tile_sheet_*, master_sprite_sheet_*

ALTER TABLE projects
DROP COLUMN IF EXISTS master_sheet_png,
DROP COLUMN IF EXISTS master_sheet_atlas,
DROP COLUMN IF EXISTS master_sheet_updated_at;

-- =============================================
-- DROP LEGACY DRAFT SHEET COLUMNS
-- =============================================
-- Old column names before rename to draft_tile_sheet_*
-- (Migration 004 may have renamed these, or they may still exist)

ALTER TABLE projects
DROP COLUMN IF EXISTS draft_sheet_png,
DROP COLUMN IF EXISTS draft_sheet_atlas,
DROP COLUMN IF EXISTS draft_sheet_updated_at;

-- =============================================
-- DROP LEGACY SPRITES COLUMN
-- =============================================
-- Ancient JSONB column from before sheet-based approach

ALTER TABLE projects
DROP COLUMN IF EXISTS sprites;

-- =============================================
-- VERIFY CURRENT COLUMNS
-- =============================================
-- After running this migration, projects should have:
-- - master_tile_sheet_png, master_tile_sheet_atlas, master_tile_sheet_updated_at
-- - master_sprite_sheet_png, master_sprite_sheet_atlas, master_sprite_sheet_updated_at
-- - master_background_sheet_png, master_background_sheet_atlas, master_background_sheet_updated_at
-- - draft_tile_sheet_png, draft_tile_sheet_atlas, draft_tile_sheet_updated_at
-- - settings (JSONB with tileDefaults, characterDefaults, artStyle, gameView)

-- =============================================
-- DONE!
-- =============================================

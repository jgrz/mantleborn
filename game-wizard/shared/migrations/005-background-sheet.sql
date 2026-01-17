-- Migration: 005-background-sheet.sql
-- Add master background sheet columns for Frameweft → Level Forge

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS master_background_sheet_png TEXT,
ADD COLUMN IF NOT EXISTS master_background_sheet_atlas JSONB DEFAULT '{"size": {"w": 0, "h": 0}, "backgrounds": {}}',
ADD COLUMN IF NOT EXISTS master_background_sheet_updated_at TIMESTAMP WITH TIME ZONE;

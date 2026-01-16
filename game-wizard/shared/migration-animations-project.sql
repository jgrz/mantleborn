-- =============================================
-- ADD PROJECT_ID TO ANIMATIONS TABLE
-- =============================================
-- Allows animations to be linked directly to a project
-- (for master sheet animations) without requiring a spritesheet

-- Add project_id column
ALTER TABLE animations
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Make spritesheet_id nullable (it wasn't explicitly NOT NULL, but let's be sure)
ALTER TABLE animations
ALTER COLUMN spritesheet_id DROP NOT NULL;

-- Add index for project lookups
CREATE INDEX IF NOT EXISTS idx_animations_project ON animations(project_id);

-- =============================================
-- DONE!
-- =============================================
-- Now animations can be saved with either:
-- - spritesheet_id (for regular spritesheet animations)
-- - project_id (for master sheet animations)
-- - both (if you want to track both)

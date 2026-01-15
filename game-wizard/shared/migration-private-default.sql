-- =============================================
-- MAKE PROJECTS PRIVATE BY DEFAULT
-- =============================================
-- Projects are private during development
-- is_public will be used for "published" games in the future

-- Change default to false (private)
ALTER TABLE projects ALTER COLUMN is_public SET DEFAULT false;

-- Set all existing projects to private
UPDATE projects SET is_public = false WHERE is_public = true;

-- =============================================
-- DONE
-- =============================================
-- All projects are now private by default
-- Only owners can see their own projects
-- Future: Add "Publish" feature to flip is_public = true

-- Migration: 008-expand-image-columns.sql
-- Expand image storage columns from varchar(500) to TEXT
--
-- Background images stored as data URLs can be very large (megabytes).
-- varchar(500) is insufficient for this use case.

-- =============================================
-- EXPAND level_backgrounds.image_path
-- =============================================

ALTER TABLE level_backgrounds
ALTER COLUMN image_path TYPE TEXT;

-- =============================================
-- DONE!
-- =============================================
-- After running this migration, data URL images of any size can be stored.

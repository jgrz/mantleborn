-- Migration: 007-level-locking.sql
-- Add level locking support for concurrent editing protection
--
-- This migration adds columns to track which user/session has a level locked
-- for editing, preventing concurrent modifications and delete conflicts.

-- =============================================
-- ADD LOCKING COLUMNS TO LEVELS TABLE
-- =============================================

-- User who currently holds the lock (NULL if unlocked)
ALTER TABLE levels
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Timestamp when lock was acquired (for expiry calculations)
ALTER TABLE levels
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- Session ID to distinguish between multiple tabs from same user
ALTER TABLE levels
ADD COLUMN IF NOT EXISTS lock_session_id TEXT;

-- =============================================
-- CREATE INDEX FOR LOCK LOOKUPS
-- =============================================

-- Index for finding locked levels by user
CREATE INDEX IF NOT EXISTS idx_levels_locked_by ON levels(locked_by) WHERE locked_by IS NOT NULL;

-- =============================================
-- OPTIONAL: AUTO-EXPIRE OLD LOCKS
-- =============================================
-- This function can be called periodically to release stale locks
-- Locks older than 60 minutes are considered expired

CREATE OR REPLACE FUNCTION expire_stale_level_locks()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE levels
    SET
        locked_by = NULL,
        locked_at = NULL,
        lock_session_id = NULL
    WHERE
        locked_by IS NOT NULL
        AND locked_at < NOW() - INTERVAL '60 minutes';

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- =============================================
-- NOTES
-- =============================================
-- Lock expiry: 60 minutes (client should heartbeat every 5 min)
-- Client generates session_id to handle multiple tabs from same user
-- Lock is released on:
--   1. Explicit release when closing Level Forge
--   2. When another session acquires an expired lock
--   3. Manually via expire_stale_level_locks() function

-- =============================================
-- DONE!
-- =============================================

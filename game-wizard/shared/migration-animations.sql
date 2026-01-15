-- =============================================
-- ANIMATIONS TABLE FOR ANIMATION-STATION
-- =============================================
-- Run this in Supabase SQL Editor
-- Stores animation definitions linked to spritesheets

-- Animations table
CREATE TABLE IF NOT EXISTS animations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spritesheet_id UUID REFERENCES spritesheets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    frames JSONB NOT NULL DEFAULT '[]',
    fps INTEGER DEFAULT 12,
    loop BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_animations_spritesheet ON animations(spritesheet_id);
CREATE INDEX IF NOT EXISTS idx_animations_user ON animations(user_id);

-- RLS Policies
ALTER TABLE animations ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "animations_public_read" ON animations;
CREATE POLICY "animations_public_read" ON animations
    FOR SELECT USING (true);

-- Users can insert their own animations
DROP POLICY IF EXISTS "animations_user_insert" ON animations;
CREATE POLICY "animations_user_insert" ON animations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Users can update their own animations
DROP POLICY IF EXISTS "animations_user_update" ON animations;
CREATE POLICY "animations_user_update" ON animations
    FOR UPDATE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Users can delete their own animations
DROP POLICY IF EXISTS "animations_user_delete" ON animations;
CREATE POLICY "animations_user_delete" ON animations
    FOR DELETE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_animations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS animations_updated_at ON animations;
CREATE TRIGGER animations_updated_at
    BEFORE UPDATE ON animations
    FOR EACH ROW
    EXECUTE FUNCTION update_animations_timestamp();

-- Example frames format:
-- [
--   { "spriteIndex": 0, "duration": 100, "offsetX": 0, "offsetY": 0 },
--   { "spriteIndex": 1, "duration": 100, "offsetX": 0, "offsetY": 0 },
--   { "spriteIndex": 2, "duration": 100, "offsetX": 0, "offsetY": 0 }
-- ]
-- Where spriteIndex refers to the index in the spritesheet's sprites array

COMMENT ON TABLE animations IS 'Animation sequences using sprites from spritesheets';
COMMENT ON COLUMN animations.frames IS 'Array of frame definitions with sprite index, duration, and offsets';
COMMENT ON COLUMN animations.fps IS 'Default frames per second for playback';

-- =============================================
-- DONE!
-- =============================================

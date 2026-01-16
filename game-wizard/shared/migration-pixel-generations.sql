-- =============================================
-- PIXEL GENERATIONS TABLE FOR AI ASSET GENERATION
-- =============================================
-- Tracks PixelLab AI generation jobs and results
-- Run this in Supabase SQL Editor

-- Pixel generations table
CREATE TABLE IF NOT EXISTS pixel_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Job tracking
    pixellab_job_id VARCHAR(100),
    pixellab_asset_id VARCHAR(100), -- Character ID, tileset ID, etc. for animations
    job_type VARCHAR(50) NOT NULL, -- 'character', 'animation', 'tileset_topdown', 'tileset_sidescroller', 'isometric_tile', 'map_object'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

    -- Request data
    prompt TEXT,
    parameters JSONB DEFAULT '{}', -- All generation parameters (size, directions, outline, etc.)
    skeleton_keypoints JSONB, -- For pose-guided character generation

    -- Result data
    result_url TEXT, -- Download URL from PixelLab
    result_data JSONB, -- Full response metadata from PixelLab
    result_preview TEXT, -- Base64 preview image (optional)

    -- Asset linking (after user imports)
    imported_to_type VARCHAR(50), -- 'spritesheet', 'tile', 'character', 'animation'
    imported_to_id UUID,
    imported_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE, -- When processing began
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pixel_generations_project ON pixel_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_pixel_generations_user ON pixel_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_pixel_generations_status ON pixel_generations(status);
CREATE INDEX IF NOT EXISTS idx_pixel_generations_type ON pixel_generations(job_type);
CREATE INDEX IF NOT EXISTS idx_pixel_generations_pixellab_job ON pixel_generations(pixellab_job_id);
CREATE INDEX IF NOT EXISTS idx_pixel_generations_pixellab_asset ON pixel_generations(pixellab_asset_id);

-- RLS Policies
ALTER TABLE pixel_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations and project generations
DROP POLICY IF EXISTS "pixel_generations_select" ON pixel_generations;
CREATE POLICY "pixel_generations_select" ON pixel_generations
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pixel_generations.project_id
            AND (projects.user_id = auth.uid() OR projects.is_public = true)
        )
    );

-- Users can create generations for their projects
DROP POLICY IF EXISTS "pixel_generations_insert" ON pixel_generations;
CREATE POLICY "pixel_generations_insert" ON pixel_generations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update their own generations
DROP POLICY IF EXISTS "pixel_generations_update" ON pixel_generations;
CREATE POLICY "pixel_generations_update" ON pixel_generations
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pixel_generations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can delete their own generations
DROP POLICY IF EXISTS "pixel_generations_delete" ON pixel_generations;
CREATE POLICY "pixel_generations_delete" ON pixel_generations
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pixel_generations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =============================================
-- ADD PIXELLAB SETTINGS TO PROJECTS
-- =============================================
-- Note: projects.settings JSONB column should already exist
-- This comment documents the expected structure:
--
-- settings.pixellab = {
--   "defaultStyle": {
--     "outline": "single color black outline",
--     "shading": "basic shading",
--     "detail": "medium detail",
--     "view": "low top-down"
--   },
--   "characterDefaults": {
--     "proportions": "default",
--     "size": 48,
--     "directions": 8
--   },
--   "tileDefaults": {
--     "size": 16,
--     "transitionSize": 0.25
--   }
-- }

-- =============================================
-- HELPER FUNCTION: Get pending generations for polling
-- =============================================
CREATE OR REPLACE FUNCTION get_pending_generations(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    pixellab_job_id VARCHAR(100),
    job_type VARCHAR(50),
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pg.id,
        pg.pixellab_job_id,
        pg.job_type,
        pg.prompt,
        pg.created_at
    FROM pixel_generations pg
    WHERE pg.user_id = p_user_id
    AND pg.status IN ('pending', 'processing')
    ORDER BY pg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE!
-- =============================================
-- Run this migration in Supabase SQL Editor
-- Then add your PixelLab API token to Supabase secrets:
-- Project Settings → Edge Functions → Secrets
-- Add: PIXELLAB_API_TOKEN = your_token_here

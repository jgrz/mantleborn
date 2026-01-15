-- =============================================
-- PROJECT MEMBERS & NOTIFICATIONS
-- =============================================
-- Enables project collaboration via invites

-- =============================================
-- PROJECT MEMBERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',  -- 'owner' or 'member'
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Members can see other members of projects they belong to
CREATE POLICY "Members can view project members" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id
            AND pm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Only project owner can add members
CREATE POLICY "Owner can add members" ON project_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Only project owner can remove members
CREATE POLICY "Owner can remove members" ON project_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.project_id
            AND projects.user_id = auth.uid()
        )
        OR user_id = auth.uid()  -- Members can remove themselves
    );

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- 'project_invite', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',  -- { project_id, invited_by, etc. }
    read BOOLEAN DEFAULT false,
    acted_on BOOLEAN DEFAULT false,  -- For actionable notifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- System/other users can create notifications for a user
CREATE POLICY "Authenticated can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own notifications (mark read, etc.)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE PROJECT RLS TO INCLUDE MEMBERS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Projects readable by owner or if public" ON projects;

-- Projects readable by owner, members, or if public
CREATE POLICY "Projects readable by owner, members, or public" ON projects
    FOR SELECT USING (
        is_public = true
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
        )
    );

-- Drop and recreate update policy to include members
DROP POLICY IF EXISTS "Users can update own projects" ON projects;

CREATE POLICY "Owner and members can update projects" ON projects
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
        )
    );

-- =============================================
-- UPDATE CHILD TABLE RLS TO INCLUDE MEMBERS
-- =============================================

-- SPRITESHEETS
DROP POLICY IF EXISTS "Spritesheets readable by owner or if project public" ON spritesheets;
CREATE POLICY "Spritesheets readable by owner, members, or public" ON spritesheets
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE p.id = spritesheets.project_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own spritesheets" ON spritesheets;
CREATE POLICY "Owner and members can update spritesheets" ON spritesheets
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM project_members pm
            JOIN spritesheets s ON s.project_id = pm.project_id
            WHERE s.id = spritesheets.id
            AND pm.user_id = auth.uid()
        )
    );

-- CHARACTERS
DROP POLICY IF EXISTS "Characters viewable by owner or public project" ON characters;
CREATE POLICY "Characters viewable by owner, members, or public" ON characters
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE p.id = characters.project_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own characters" ON characters;
CREATE POLICY "Owner and members can update characters" ON characters
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = characters.project_id
            AND pm.user_id = auth.uid()
        )
    );

-- ANIMATIONS
DROP POLICY IF EXISTS "Animations viewable by owner or public project" ON animations;
CREATE POLICY "Animations viewable by owner, members, or public" ON animations
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM spritesheets s
            JOIN projects p ON p.id = s.project_id
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE s.id = animations.spritesheet_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own animations" ON animations;
CREATE POLICY "Owner and members can update animations" ON animations
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM spritesheets s
            JOIN project_members pm ON pm.project_id = s.project_id
            WHERE s.id = animations.spritesheet_id
            AND pm.user_id = auth.uid()
        )
    );

-- TILES
DROP POLICY IF EXISTS "Tiles viewable by owner or public project" ON tiles;
CREATE POLICY "Tiles viewable by owner, members, or public" ON tiles
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE p.id = tiles.project_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own tiles" ON tiles;
CREATE POLICY "Owner and members can update tiles" ON tiles
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = tiles.project_id
            AND pm.user_id = auth.uid()
        )
    );

-- LEVELS
DROP POLICY IF EXISTS "Levels viewable by project owner or public" ON levels;
CREATE POLICY "Levels viewable by owner, members, or public" ON levels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE p.id = levels.project_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update levels in own projects" ON levels;
CREATE POLICY "Owner and members can update levels" ON levels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.id
            WHERE p.id = levels.project_id
            AND (p.user_id = auth.uid() OR pm.user_id = auth.uid())
        )
    );

-- =============================================
-- HELPER FUNCTION: LOOKUP USER BY EMAIL OR NAME
-- =============================================

CREATE OR REPLACE FUNCTION find_user_by_identifier(identifier TEXT)
RETURNS TABLE(id UUID, email TEXT, display_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email::TEXT,
        (u.raw_user_meta_data->>'display_name')::TEXT as display_name
    FROM auth.users u
    WHERE
        u.email ILIKE identifier
        OR u.raw_user_meta_data->>'display_name' ILIKE identifier
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE
-- =============================================
-- project_members table created
-- notifications table created
-- RLS updated to include project members
-- Ready for invite UI implementation

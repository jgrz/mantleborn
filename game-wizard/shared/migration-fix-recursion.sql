-- =============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =============================================
-- The project_members policy was self-referential, causing recursion

-- =============================================
-- FIX PROJECT_MEMBERS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Members can view project members" ON project_members;
DROP POLICY IF EXISTS "Owner can add members" ON project_members;
DROP POLICY IF EXISTS "Owner can remove members" ON project_members;

-- Simple policy: you can see members if you own the project
-- (No self-reference to project_members)
CREATE POLICY "Project owner can view members" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Owner can add members
CREATE POLICY "Project owner can add members" ON project_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Owner can remove members, or members can remove themselves
CREATE POLICY "Owner or self can remove members" ON project_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =============================================
-- FIX PROJECTS POLICY (remove project_members reference)
-- =============================================

DROP POLICY IF EXISTS "Projects readable by owner, members, or public" ON projects;

-- Simplified: owner or public (members check moved to application layer for now)
CREATE POLICY "Projects readable by owner or public" ON projects
    FOR SELECT USING (
        is_public = true
        OR user_id = auth.uid()
    );

-- =============================================
-- FIX OTHER POLICIES THAT REFERENCE PROJECT_MEMBERS
-- =============================================

-- SPRITESHEETS
DROP POLICY IF EXISTS "Spritesheets readable by owner, members, or public" ON spritesheets;
CREATE POLICY "Spritesheets readable by owner or public project" ON spritesheets
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = spritesheets.project_id
            AND (projects.is_public = true OR projects.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Owner and members can update spritesheets" ON spritesheets;
CREATE POLICY "Owner can update spritesheets" ON spritesheets
    FOR UPDATE USING (user_id = auth.uid());

-- CHARACTERS
DROP POLICY IF EXISTS "Characters viewable by owner, members, or public" ON characters;
CREATE POLICY "Characters viewable by owner or public project" ON characters
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = characters.project_id
            AND (projects.is_public = true OR projects.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Owner and members can update characters" ON characters;
CREATE POLICY "Owner can update characters" ON characters
    FOR UPDATE USING (user_id = auth.uid());

-- ANIMATIONS
DROP POLICY IF EXISTS "Animations viewable by owner, members, or public" ON animations;
CREATE POLICY "Animations viewable by owner or public project" ON animations
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM spritesheets s
            JOIN projects p ON p.id = s.project_id
            WHERE s.id = animations.spritesheet_id
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Owner and members can update animations" ON animations;
CREATE POLICY "Owner can update animations" ON animations
    FOR UPDATE USING (user_id = auth.uid());

-- TILES
DROP POLICY IF EXISTS "Tiles viewable by owner, members, or public" ON tiles;
CREATE POLICY "Tiles viewable by owner or public project" ON tiles
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tiles.project_id
            AND (projects.is_public = true OR projects.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Owner and members can update tiles" ON tiles;
CREATE POLICY "Owner can update tiles" ON tiles
    FOR UPDATE USING (user_id = auth.uid());

-- LEVELS
DROP POLICY IF EXISTS "Levels viewable by owner, members, or public" ON levels;
CREATE POLICY "Levels viewable by owner or public project" ON levels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = levels.project_id
            AND (projects.is_public = true OR projects.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Owner and members can update levels" ON levels;
CREATE POLICY "Owner can update levels" ON levels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = levels.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =============================================
-- DONE
-- =============================================
-- Fixed infinite recursion by removing self-referential policies
-- Project members feature will work through project ownership checks
-- Members can be added back with a more careful policy design later

-- =============================================
-- CLEANUP LEGACY DATA & TIGHTEN RLS
-- =============================================
-- Removes all data without user ownership and fixes RLS policies
-- Run this in Supabase SQL Editor

-- =============================================
-- DELETE LEGACY DATA (no user_id)
-- =============================================

-- Delete projects with no owner - cascades to levels, level_grids, etc.
-- Tables with direct user_id: projects, spritesheets, characters, animations, tiles
-- Tables without user_id (cascade from project): levels, level_grids

-- Characters (has user_id)
DELETE FROM characters WHERE user_id IS NULL;

-- Animations (has user_id)
DELETE FROM animations WHERE user_id IS NULL;

-- Tiles (has user_id)
DELETE FROM tiles WHERE user_id IS NULL;

-- Spritesheets (has user_id)
DELETE FROM spritesheets WHERE user_id IS NULL;

-- Projects (has user_id) - cascades to levels, level_grids
DELETE FROM projects WHERE user_id IS NULL;

-- =============================================
-- UPDATE RLS POLICIES - PROJECTS
-- =============================================

DROP POLICY IF EXISTS "Projects readable by owner or if public" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Public projects readable by all, private only by owner
CREATE POLICY "Projects readable by owner or if public" ON projects
  FOR SELECT USING (
    is_public = true
    OR user_id = auth.uid()
  );

-- Only authenticated users can create projects (assigned to them)
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Only owner can update their projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

-- Only owner can delete their projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE RLS POLICIES - SPRITESHEETS
-- =============================================

DROP POLICY IF EXISTS "Spritesheets readable by owner or if project public" ON spritesheets;
DROP POLICY IF EXISTS "Authenticated users can create spritesheets" ON spritesheets;
DROP POLICY IF EXISTS "Users can update own spritesheets" ON spritesheets;
DROP POLICY IF EXISTS "Users can delete own spritesheets" ON spritesheets;

-- Spritesheets readable if project is public or user owns it
CREATE POLICY "Spritesheets readable by owner or if project public" ON spritesheets
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = spritesheets.project_id
      AND projects.is_public = true
    )
  );

-- Only authenticated users can create spritesheets
CREATE POLICY "Authenticated users can create spritesheets" ON spritesheets
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Only owner can update their spritesheets
CREATE POLICY "Users can update own spritesheets" ON spritesheets
  FOR UPDATE USING (user_id = auth.uid());

-- Only owner can delete their spritesheets
CREATE POLICY "Users can delete own spritesheets" ON spritesheets
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE RLS POLICIES - CHARACTERS
-- =============================================

DROP POLICY IF EXISTS "Characters viewable by owner or public project" ON characters;
DROP POLICY IF EXISTS "Authenticated can create characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;

CREATE POLICY "Characters viewable by owner or public project" ON characters
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.is_public = true
    )
  );

CREATE POLICY "Authenticated can create characters" ON characters
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own characters" ON characters
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE RLS POLICIES - ANIMATIONS
-- =============================================

DROP POLICY IF EXISTS "Animations viewable by owner or public project" ON animations;
DROP POLICY IF EXISTS "Authenticated can create animations" ON animations;
DROP POLICY IF EXISTS "Users can update own animations" ON animations;
DROP POLICY IF EXISTS "Users can delete own animations" ON animations;

CREATE POLICY "Animations viewable by owner or public project" ON animations
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM spritesheets s
      JOIN projects p ON p.id = s.project_id
      WHERE s.id = animations.spritesheet_id
      AND p.is_public = true
    )
  );

CREATE POLICY "Authenticated can create animations" ON animations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own animations" ON animations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own animations" ON animations
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE RLS POLICIES - TILES
-- =============================================

DROP POLICY IF EXISTS "Tiles viewable by owner or public project" ON tiles;
DROP POLICY IF EXISTS "Authenticated can create tiles" ON tiles;
DROP POLICY IF EXISTS "Users can update own tiles" ON tiles;
DROP POLICY IF EXISTS "Users can delete own tiles" ON tiles;

CREATE POLICY "Tiles viewable by owner or public project" ON tiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tiles.project_id
      AND projects.is_public = true
    )
  );

CREATE POLICY "Authenticated can create tiles" ON tiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own tiles" ON tiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tiles" ON tiles
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- UPDATE RLS POLICIES - LEVELS
-- =============================================
-- Levels inherit access through project_id (no user_id column)

DROP POLICY IF EXISTS "Levels viewable by owner or public project" ON levels;
DROP POLICY IF EXISTS "Authenticated can create levels" ON levels;
DROP POLICY IF EXISTS "Users can update own levels" ON levels;
DROP POLICY IF EXISTS "Users can delete own levels" ON levels;
DROP POLICY IF EXISTS "Levels are publicly readable" ON levels;
DROP POLICY IF EXISTS "Levels are insertable" ON levels;
DROP POLICY IF EXISTS "Levels are updatable" ON levels;
DROP POLICY IF EXISTS "Levels are deletable" ON levels;

CREATE POLICY "Levels viewable by project owner or public" ON levels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = levels.project_id
      AND (projects.is_public = true OR projects.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated can create levels in own projects" ON levels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update levels in own projects" ON levels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = levels.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete levels in own projects" ON levels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = levels.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- DONE
-- =============================================
-- Deleted all legacy data without user ownership
-- Tightened all RLS policies to require user ownership
-- Public projects are still viewable by all users

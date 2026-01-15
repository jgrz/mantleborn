-- =============================================
-- AUTH MIGRATION - User Profiles & Ownership
-- =============================================
-- Run this in Supabase SQL Editor
-- Adds user ownership to projects and spritesheets

-- =============================================
-- PROFILES TABLE
-- =============================================
-- Extends Supabase auth.users with app-specific data

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADD USER OWNERSHIP TO EXISTING TABLES
-- =============================================

-- Add user_id to projects (nullable for existing data)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to spritesheets (nullable for existing data)
ALTER TABLE spritesheets
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_spritesheets_user_id ON spritesheets(user_id);

-- =============================================
-- ROW LEVEL SECURITY - PROFILES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Profiles are publicly readable" ON profiles
  FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- =============================================
-- ROW LEVEL SECURITY - PROJECTS (Updated)
-- =============================================
-- Drop old permissive policies and add user-scoped ones

DROP POLICY IF EXISTS "Projects are publicly readable" ON projects;
DROP POLICY IF EXISTS "Projects are insertable" ON projects;
DROP POLICY IF EXISTS "Projects are updatable" ON projects;
DROP POLICY IF EXISTS "Projects are deletable" ON projects;

-- Public projects readable by all, private only by owner
CREATE POLICY "Projects readable by owner or if public" ON projects
  FOR SELECT USING (
    is_public = true
    OR user_id = auth.uid()
    OR user_id IS NULL  -- Legacy data without owner
  );

-- Only authenticated users can create projects (assigned to them)
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Only owner can update their projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (
    user_id = auth.uid()
    OR user_id IS NULL  -- Legacy data
  );

-- Only owner can delete their projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (
    user_id = auth.uid()
    OR user_id IS NULL  -- Legacy data
  );

-- =============================================
-- ROW LEVEL SECURITY - SPRITESHEETS (Updated)
-- =============================================

DROP POLICY IF EXISTS "Spritesheets are publicly readable" ON spritesheets;
DROP POLICY IF EXISTS "Spritesheets are insertable" ON spritesheets;
DROP POLICY IF EXISTS "Spritesheets are updatable" ON spritesheets;
DROP POLICY IF EXISTS "Spritesheets are deletable" ON spritesheets;

-- Spritesheets readable if project is public or user owns it
CREATE POLICY "Spritesheets readable by owner or if project public" ON spritesheets
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IS NULL
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
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Only owner can update their spritesheets
CREATE POLICY "Users can update own spritesheets" ON spritesheets
  FOR UPDATE USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- Only owner can delete their spritesheets
CREATE POLICY "Users can delete own spritesheets" ON spritesheets
  FOR DELETE USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- =============================================
-- TRIGGER FOR PROFILE CREATION ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DONE!
-- =============================================
-- Created: profiles table
-- Updated: projects and spritesheets with user_id
-- Updated: RLS policies for user ownership
--
-- Next: Enable Email Auth in Supabase Dashboard
--   Authentication > Providers > Email > Enable

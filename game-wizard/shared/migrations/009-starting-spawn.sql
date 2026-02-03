-- Migration: 009-starting-spawn.sql
-- Add starting spawn point to projects for game start location

-- =============================================
-- ADD STARTING SPAWN TO PROJECTS
-- =============================================

ALTER TABLE projects
ADD COLUMN starting_spawn_id UUID REFERENCES level_spawns(id) ON DELETE SET NULL;

-- =============================================
-- DONE!
-- =============================================
-- The starting_spawn_id indicates which spawn point the player
-- begins at when starting a new game. If null, the game will
-- use the first level's primary spawn or first available spawn.

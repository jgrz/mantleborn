-- Migration: 010-impact-engine.sql
-- Add Impact Engine physics configuration to projects and levels

-- =============================================
-- ADD IMPACT ENGINE CONFIG TO PROJECTS
-- =============================================

-- Store physics presets and global settings as JSONB
ALTER TABLE projects
ADD COLUMN impact_engine_config JSONB DEFAULT '{
  "presets": {
    "platformer": {
      "gravity": 1200,
      "jumpForce": 500,
      "playerSpeed": 200,
      "airControl": 0.8,
      "friction": 0.9,
      "terminalVelocity": 800
    },
    "swimming": {
      "gravity": 200,
      "jumpForce": 300,
      "playerSpeed": 120,
      "drag": 0.85,
      "buoyancy": 0.3,
      "terminalVelocity": 300
    },
    "space": {
      "gravity": 0,
      "thrust": 400,
      "playerSpeed": 150,
      "angularDrag": 0.95,
      "terminalVelocity": 500
    },
    "topDown": {
      "gravity": 0,
      "playerSpeed": 150,
      "friction": 0.85,
      "diagonalDamping": 0.707
    }
  },
  "defaultPreset": "platformer"
}'::jsonb;

-- =============================================
-- ADD PHYSICS PRESET TO LEVELS
-- =============================================

-- Each level can select a physics preset and optionally override values
ALTER TABLE levels
ADD COLUMN physics_preset VARCHAR(50) DEFAULT 'platformer';

ALTER TABLE levels
ADD COLUMN physics_overrides JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- DONE!
-- =============================================
-- Projects now have impact_engine_config with physics presets.
-- Levels can select a preset and optionally override specific values.
-- The game runner should read these values instead of using hardcoded constants.

-- =============================================
-- CHARACTERS TABLE
-- Migration for Character Forge tool
-- =============================================

-- Characters: Character templates scoped to projects
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Identity
    name VARCHAR(100) NOT NULL,
    identifier VARCHAR(100),  -- For scripting/dialogue references
    character_type VARCHAR(50) DEFAULT 'npc',  -- playable, npc, enemy, object

    -- Visual
    default_sprite JSONB,  -- { name, x, y, width, height } from master sheet

    -- Animations (predefined + custom)
    animations JSONB DEFAULT '{}',  -- { idle: animId, walk: animId, custom_attack: animId }

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    properties JSONB DEFAULT '{}',  -- { health: 100, speed: 2.5, loot_table: "common" }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id, name)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(character_type);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Characters viewable by owner or public project" ON characters
    FOR SELECT USING (
        user_id = auth.uid()
        OR user_id IS NULL
        OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND is_public = true)
    );

CREATE POLICY "Authenticated can create characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Trigger for updated_at timestamp
CREATE TRIGGER characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

/**
 * Character Forge Documentation
 * Used by the Help Drawer component and Grimoire
 */

const CHARACTER_FORGE_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Character Forge is your character assembly tool. Define characters by pulling from your sprite library and linking animations. Characters are templates that can be placed in levels via Level Forge.</p>

            <h2>What is Character Forge?</h2>
            <p>Think of it as your character database:</p>
            <ul>
                <li><strong>Assemble</strong> - Pull sprites and animations from your libraries</li>
                <li><strong>Define</strong> - Set character types, tags, and properties</li>
                <li><strong>Organize</strong> - Build a library of characters for your game</li>
                <li><strong>Export</strong> - Characters are included in project exports</li>
            </ul>

            <h2>Getting Started</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose your project from the dropdown. Characters belong to projects.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Create a Character</strong><br>
                    Click "+ New" in the Character Library to create your first character.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Set Basic Info</strong><br>
                    Enter a name, identifier (for scripting), and select the character type.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Choose a Default Sprite</strong><br>
                    Click a sprite from your project's master spritesheet to set the character's appearance.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Link Animations</strong><br>
                    Assign animations from Animation-Station to behaviors like idle, walk, attack, etc.
                </div>
            </div>

            <h2>Key Concept: Assembly, Not Creation</h2>
            <p>Character Forge assembles existing assets:</p>
            <ul>
                <li>Sprites come from <strong>Sprite-Rite</strong> or <strong>Tilesmith</strong></li>
                <li>Animations come from <strong>Animation-Station</strong></li>
                <li>Character Forge pulls them together into a coherent character definition</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Create your sprites and animations first, then assemble characters. The Character Forge shows what's available in your project.
            </div>
        `
    },
    {
        id: 'character-types',
        title: 'Character Types',
        content: `
            <h1>Character Types</h1>
            <p>Characters are categorized by type, which helps organize your library and can be used for game logic.</p>

            <h2>Available Types</h2>

            <h3>Playable</h3>
            <p>Characters the player controls:</p>
            <ul>
                <li>Main character / hero</li>
                <li>Selectable party members</li>
                <li>Multiplayer characters</li>
            </ul>

            <h3>NPC</h3>
            <p>Non-player characters for interaction:</p>
            <ul>
                <li>Quest givers</li>
                <li>Shopkeepers</li>
                <li>Villagers and townspeople</li>
                <li>Allies and companions</li>
            </ul>

            <h3>Enemy</h3>
            <p>Hostile characters:</p>
            <ul>
                <li>Common enemies</li>
                <li>Bosses</li>
                <li>Traps and hazards</li>
            </ul>

            <h3>Object</h3>
            <p>Interactive objects that aren't characters:</p>
            <ul>
                <li>Treasure chests</li>
                <li>Doors and switches</li>
                <li>Collectibles</li>
                <li>Destructible objects</li>
            </ul>

            <h2>Filtering by Type</h2>
            <p>Use the type dropdown in the Character Library section to filter:</p>
            <ul>
                <li><strong>All</strong> - Show all characters</li>
                <li><strong>Playable</strong> - Only playable characters</li>
                <li><strong>NPC</strong> - Only NPCs</li>
                <li><strong>Enemy</strong> - Only enemies</li>
                <li><strong>Object</strong> - Only objects</li>
            </ul>

            <h2>Using Types in Your Game</h2>
            <p>The character type is included in exports:</p>
            <pre><code>{
    "name": "Goblin",
    "type": "enemy",
    "properties": { "health": 30 }
}</code></pre>
            <p>Use this to apply type-specific logic:</p>
            <pre><code>if (character.type === 'enemy') {
    enableAI(character);
    setHostile(character);
}</code></pre>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Choose the right type from the start. While you can change it later, consistent categorization makes your game code cleaner.
            </div>
        `
    },
    {
        id: 'sprites-animations',
        title: 'Sprites & Animations',
        content: `
            <h1>Sprites & Animations</h1>
            <p>Characters are visual. Here's how to set their appearance and movement.</p>

            <h2>Default Sprite</h2>
            <p>The default sprite is your character's base appearance. It's used when:</p>
            <ul>
                <li>No animation is playing</li>
                <li>Displaying the character in menus/UI</li>
                <li>As a fallback if animations aren't loaded</li>
            </ul>

            <h3>Selecting a Default Sprite</h3>
            <ol>
                <li>Look at the <strong>Default Sprite</strong> section</li>
                <li>Browse the sprite grid (from your master spritesheet)</li>
                <li>Click a sprite to select it</li>
                <li>The character preview updates immediately</li>
            </ol>

            <h2>Predefined Animation Slots</h2>
            <p>Seven standard behaviors are built in:</p>

            <ul>
                <li><strong>Idle</strong> - Standing still, breathing, blinking</li>
                <li><strong>Walk</strong> - Normal movement</li>
                <li><strong>Run</strong> - Fast movement</li>
                <li><strong>Jump</strong> - Jumping or falling</li>
                <li><strong>Attack</strong> - Primary attack action</li>
                <li><strong>Hurt</strong> - Taking damage</li>
                <li><strong>Death</strong> - Dying sequence</li>
            </ul>

            <h3>Linking Animations</h3>
            <ol>
                <li>Find the animation slot you want to fill</li>
                <li>Click the dropdown</li>
                <li>Select an animation from Animation-Station</li>
                <li>The preview will play that animation</li>
            </ol>

            <h2>Custom Animation Slots</h2>
            <p>Add game-specific animations beyond the predefined ones:</p>
            <ol>
                <li>Click <strong>+ Add Custom Animation</strong></li>
                <li>Enter a name (e.g., "cast_spell", "climb", "interact")</li>
                <li>Select an animation from the dropdown</li>
            </ol>

            <h3>Custom Slot Ideas</h3>
            <ul>
                <li><code>cast_spell</code> - Magic attacks</li>
                <li><code>climb</code> - Climbing ladders/walls</li>
                <li><code>swim</code> - Water movement</li>
                <li><code>interact</code> - Using objects</li>
                <li><code>victory</code> - Win pose</li>
                <li><code>talk</code> - Conversation animation</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Note</div>
                Animations must exist in Animation-Station first. If you don't see an animation in the dropdown, create it there.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Not every character needs every animation. An NPC might only need idle and talk. A treasure chest might only need idle and open.
            </div>
        `
    },
    {
        id: 'tags-properties',
        title: 'Tags & Properties',
        content: `
            <h1>Tags & Properties</h1>
            <p>Tags and properties add metadata to your characters for filtering and game logic.</p>

            <h2>Tags</h2>
            <p>Tags are labels for categorization and filtering:</p>

            <h3>Adding Tags</h3>
            <ol>
                <li>Find the <strong>Tags</strong> section</li>
                <li>Type a tag name in the input</li>
                <li>Press Enter or click + to add</li>
                <li>Tags appear as chips</li>
            </ol>

            <h3>Removing Tags</h3>
            <p>Click the x on any tag chip to remove it.</p>

            <h3>Tag Ideas</h3>
            <ul>
                <li><code>boss</code> - Boss enemies</li>
                <li><code>flying</code> - Airborne characters</li>
                <li><code>quest_giver</code> - NPCs with quests</li>
                <li><code>merchant</code> - Shopkeepers</li>
                <li><code>undead</code> - Monster category</li>
                <li><code>fire_element</code> - Elemental affinity</li>
            </ul>

            <h3>Using Tags in Your Game</h3>
            <pre><code>// Filter characters by tag
const bosses = characters.filter(c =>
    c.tags.includes('boss')
);

// Check for tag
if (enemy.tags.includes('undead')) {
    applyHolyDamageBonus();
}</code></pre>

            <h2>Properties</h2>
            <p>Properties are key-value pairs for game data:</p>

            <h3>Adding Properties</h3>
            <ol>
                <li>Click <strong>+ Add Property</strong></li>
                <li>Enter a property name (e.g., "health")</li>
                <li>Select the type: Number, String, or Boolean</li>
                <li>Enter the value</li>
            </ol>

            <h3>Property Types</h3>
            <ul>
                <li><strong>Number</strong> - Stats like health, damage, speed</li>
                <li><strong>String</strong> - Text like dialogue_id, loot_table</li>
                <li><strong>Boolean</strong> - Flags like is_boss, can_fly</li>
            </ul>

            <h3>Common Properties</h3>
            <table>
                <tr><td><code>health</code></td><td>Number</td><td>100</td></tr>
                <tr><td><code>damage</code></td><td>Number</td><td>10</td></tr>
                <tr><td><code>speed</code></td><td>Number</td><td>2.5</td></tr>
                <tr><td><code>dialogue_id</code></td><td>String</td><td>"intro_npc"</td></tr>
                <tr><td><code>loot_table</code></td><td>String</td><td>"common_drops"</td></tr>
                <tr><td><code>is_boss</code></td><td>Boolean</td><td>true</td></tr>
            </table>

            <h3>Using Properties in Your Game</h3>
            <pre><code>// Access properties
const maxHealth = character.properties.health;
const moveSpeed = character.properties.speed;

// Use for game logic
if (character.properties.is_boss) {
    showBossHealthBar();
}</code></pre>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use tags for categorization (what IS this character?) and properties for data (what ARE its values?).
            </div>
        `
    },
    {
        id: 'identifiers',
        title: 'Identifiers',
        content: `
            <h1>Character Identifiers</h1>
            <p>Each character has a name and an identifier. Understanding both helps with game integration.</p>

            <h2>Name vs Identifier</h2>

            <h3>Name</h3>
            <ul>
                <li>Human-readable display name</li>
                <li>Can contain spaces and special characters</li>
                <li>Shown in UI, dialogue, menus</li>
                <li>Example: "Old Wizard", "Forest Goblin", "Treasure Chest"</li>
            </ul>

            <h3>Identifier</h3>
            <ul>
                <li>Code-friendly reference string</li>
                <li>Auto-generated from name (lowercase, underscores)</li>
                <li>Used in scripts, dialogue systems, events</li>
                <li>Example: "old_wizard", "forest_goblin", "treasure_chest"</li>
            </ul>

            <h2>Auto-Generation</h2>
            <p>When you enter a name, the identifier is auto-generated:</p>
            <ul>
                <li>"Forest Guardian" → <code>forest_guardian</code></li>
                <li>"NPC - Shopkeeper" → <code>npc_-_shopkeeper</code></li>
                <li>"Slime (Green)" → <code>slime_(green)</code></li>
            </ul>

            <h2>Custom Identifiers</h2>
            <p>You can override the auto-generated identifier:</p>
            <ol>
                <li>Clear the identifier field</li>
                <li>Type your own identifier</li>
                <li>Use lowercase letters, numbers, and underscores</li>
            </ol>

            <h2>Using Identifiers</h2>

            <h3>In Dialogue Systems</h3>
            <pre><code>// Reference character by identifier
dialogue.show("old_wizard", "Welcome, traveler!");

// In a dialogue file
{
    "speaker": "old_wizard",
    "text": "The forest is dangerous..."
}</code></pre>

            <h3>In Event Systems</h3>
            <pre><code>// Spawn by identifier
game.spawn("forest_goblin", x, y);

// Check interactions
if (trigger.target === "treasure_chest") {
    openChest();
}</code></pre>

            <h3>In Save Systems</h3>
            <pre><code>// Save defeated enemies
defeatedEnemies.push(enemy.identifier);

// Check if already defeated
if (defeatedEnemies.includes("boss_dragon")) {
    skipBossFight();
}</code></pre>

            <div class="warning">
                <div class="warning-label">Important</div>
                Identifiers should be unique within a project. Two characters with the same identifier will conflict in your game code.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Keep identifiers short and descriptive. <code>goblin_01</code> is better than <code>forest_zone_common_enemy_goblin_variant_1</code>.
            </div>
        `
    },
    {
        id: 'workflow',
        title: 'Workflow',
        content: `
            <h1>Recommended Workflow</h1>
            <p>Here's the typical workflow for creating characters in your game.</p>

            <h2>Before Character Forge</h2>
            <ol>
                <li><strong>Crucible</strong>: Create your project</li>
                <li><strong>Tilesmith/Sprite-Rite</strong>: Create or import sprites</li>
                <li><strong>Animation-Station</strong>: Create animations for characters</li>
            </ol>

            <h2>In Character Forge</h2>
            <ol>
                <li>Select your project</li>
                <li>Create a new character</li>
                <li>Set name, identifier, and type</li>
                <li>Choose default sprite from master sheet</li>
                <li>Link animations to behavior slots</li>
                <li>Add tags for categorization</li>
                <li>Add properties for game data</li>
                <li>Repeat for each character</li>
            </ol>

            <h2>After Character Forge</h2>
            <ol>
                <li><strong>Level Forge</strong>: Place characters in levels (coming soon)</li>
                <li><strong>Crucible</strong>: Export full project with characters</li>
                <li><strong>Your Game</strong>: Load and use character data</li>
            </ol>

            <h2>Batch Character Creation</h2>
            <p>For games with many characters:</p>
            <ol>
                <li>Create all sprites first (consistent sizes help)</li>
                <li>Create reusable animations (walk cycles, idle loops)</li>
                <li>Create characters in batches by type</li>
                <li>Copy properties between similar characters</li>
            </ol>

            <h2>Iteration Tips</h2>
            <ul>
                <li>Start with placeholder sprites, refine later</li>
                <li>Use consistent naming conventions</li>
                <li>Test exports early and often</li>
                <li>Add properties as your game needs them</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Create a "template" character for each type (template_enemy, template_npc). Use their properties as a starting point for similar characters.
            </div>
        `
    },
    {
        id: 'exporting',
        title: 'Exporting',
        content: `
            <h1>Exporting Characters</h1>
            <p>Characters are included when you export a project from Crucible.</p>

            <h2>Export Format</h2>
            <p>Each character exports as a JSON object:</p>
            <pre><code>{
    "id": "uuid-here",
    "name": "Forest Goblin",
    "identifier": "forest_goblin",
    "type": "enemy",
    "defaultSprite": {
        "name": "goblin_idle",
        "x": 0,
        "y": 48,
        "width": 24,
        "height": 24
    },
    "animations": {
        "idle": "anim-uuid-1",
        "walk": "anim-uuid-2",
        "attack": "anim-uuid-3",
        "hurt": "anim-uuid-4",
        "death": "anim-uuid-5"
    },
    "tags": ["forest", "common", "melee"],
    "properties": {
        "health": 30,
        "damage": 5,
        "speed": 1.5,
        "loot_table": "goblin_drops"
    }
}</code></pre>

            <h2>Project Export Structure</h2>
            <p>When you export from Crucible, characters are in the <code>characters</code> array:</p>
            <pre><code>{
    "name": "My Game",
    "levels": [...],
    "characters": [
        { "name": "Hero", ... },
        { "name": "Goblin", ... },
        { "name": "Wizard NPC", ... }
    ],
    "meta": {
        "projectId": "...",
        "exportedAt": "..."
    }
}</code></pre>

            <h2>Loading in Your Game</h2>
            <pre><code>// Load project export
const gameData = await fetch('project.json')
    .then(r => r.json());

// Access characters
const characters = gameData.characters;

// Find by identifier
const hero = characters.find(c =>
    c.identifier === 'hero'
);

// Find by type
const enemies = characters.filter(c =>
    c.type === 'enemy'
);

// Find by tag
const bosses = characters.filter(c =>
    c.tags.includes('boss')
);</code></pre>

            <h2>Spawning Characters</h2>
            <pre><code>function spawnCharacter(identifier, x, y) {
    const template = characters.find(c =>
        c.identifier === identifier
    );

    if (!template) return null;

    return {
        ...template,
        x, y,
        currentHealth: template.properties.health,
        currentAnimation: template.animations.idle
    };
}</code></pre>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Export your project frequently during development. Keep backups of working exports before making major changes.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Work faster in Character Forge with these shortcuts.</p>

            <h2>General</h2>
            <ul>
                <li><kbd>Escape</kbd> - Close any open modal</li>
            </ul>

            <h2>Tags</h2>
            <ul>
                <li><kbd>Enter</kbd> - Add tag (when tag input is focused)</li>
            </ul>

            <h2>Properties</h2>
            <ul>
                <li><kbd>Tab</kbd> - Move between property fields</li>
                <li><kbd>Enter</kbd> - Confirm property value</li>
            </ul>

            <h2>Tips for Speed</h2>
            <ul>
                <li>Use Tab to navigate between fields quickly</li>
                <li>Type identifiers directly (faster than editing auto-generated ones)</li>
                <li>Add common tags to similar characters in batches</li>
                <li>Use copy/paste for property values</li>
            </ul>

            <h2>Auto-Save</h2>
            <p>Character Forge auto-saves your changes after 3 seconds of inactivity. Look for the "Saved" indicator in the header.</p>
            <ul>
                <li><strong>Unsaved</strong> - Changes pending</li>
                <li><strong>Saving...</strong> - Save in progress</li>
                <li><strong>Saved</strong> - All changes saved</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Open Character Forge and Animation-Station in separate tabs. Create animations in one, refresh and link them in the other.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHARACTER_FORGE_DOCS;
}

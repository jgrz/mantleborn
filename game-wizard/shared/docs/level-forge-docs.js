/**
 * Level-Forge Documentation
 * Used by the Help Drawer component and Grimoire
 */

const LEVEL_FORGE_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Level Forge is your complete level design tool. Build collision grids, add background art, paint visual tiles, and test your levels with the built-in demo mode.</p>

            <h2>Creating Your First Level</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose your project from the header dropdown. This loads the project's master spritesheet for the Tiles tab.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Name Your Level</strong><br>
                    Enter a name in the "Level Name" field. This is required before placing portal markers (spawns, exits).
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Set Grid Size</strong><br>
                    Adjust width and height in tiles. Default is 32x18 (768x432 pixels at 24px tiles).
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Define Collision Areas</strong><br>
                    Use the Grid tab to mark tiles as Open (walkable), Obstruction (solid), or place spawn/exit points.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Add Backgrounds</strong><br>
                    Switch to the BG tab to upload and arrange background images. Use Pixelify to give them a retro look.
                </div>
            </div>

            <div class="step">
                <div class="step-num">6</div>
                <div class="step-text">
                    <strong>Paint Visual Tiles</strong><br>
                    Use the Tiles tab to paint sprites from the project's master spritesheet onto the level grid.
                </div>
            </div>

            <div class="step">
                <div class="step-num">7</div>
                <div class="step-text">
                    <strong>Test & Export</strong><br>
                    Click "Play Demo" to test your level, then copy the JSON or send it to the Crucible.
                </div>
            </div>

            <h2>The Three Tabs</h2>
            <ul>
                <li><strong>Grid</strong> - Define collision and walkable areas</li>
                <li><strong>BG</strong> - Manage background image layers</li>
                <li><strong>Tiles</strong> - Paint visual sprites onto the grid</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Choose "Platformer" or "Top-Down" level type to set appropriate physics for demo mode testing.
            </div>
        `
    },
    {
        id: 'grid-editor',
        title: 'Grid Editor',
        content: `
            <h1>Grid Editor</h1>
            <p>The Grid tab is where you define the collision map - which tiles players can walk on and which block movement.</p>

            <h2>Tile States</h2>
            <table>
                <tr>
                    <th>State</th>
                    <th>Color</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><strong>Undefined</strong></td>
                    <td>Checkered</td>
                    <td>Not yet defined. Often treated as empty space.</td>
                </tr>
                <tr>
                    <td><strong>Open</strong></td>
                    <td>Green</td>
                    <td>Walkable area where players can move freely.</td>
                </tr>
                <tr>
                    <td><strong>Obstruction</strong></td>
                    <td>Red</td>
                    <td>Solid walls/platforms that block movement.</td>
                </tr>
                <tr>
                    <td><strong>Spawn</strong></td>
                    <td>Blue</td>
                    <td>Player spawn point. First spawn is primary.</td>
                </tr>
                <tr>
                    <td><strong>Exit</strong></td>
                    <td>Purple</td>
                    <td>Level exit - transitions to another level.</td>
                </tr>
                <tr>
                    <td><strong>Return</strong></td>
                    <td>Teal</td>
                    <td>Return point - where player arrives from another level.</td>
                </tr>
            </table>

            <h2>Drawing Tools</h2>

            <h3>Paint Tool (P)</h3>
            <p>Click to cycle through tile states. Click and drag to paint with the currently selected state.</p>

            <h3>Fill Tool (F)</h3>
            <p>Click to flood-fill an area with the selected state. Fills all connected tiles of the same type.</p>

            <h3>Select Tool (S)</h3>
            <p>Click and drag to select a rectangular region. Release to fill the entire selection with the current state.</p>

            <h2>State Selection</h2>
            <p>Use the state buttons in the toolbar or press number keys:</p>
            <ul>
                <li><kbd>1</kbd> - Undefined</li>
                <li><kbd>2</kbd> - Open</li>
                <li><kbd>3</kbd> - Obstruction</li>
                <li><kbd>4</kbd> - Spawn</li>
                <li><kbd>5</kbd> - Exit</li>
                <li><kbd>6</kbd> - Return</li>
            </ul>

            <h2>Grid Settings</h2>
            <p>Adjust the grid dimensions in the right panel:</p>
            <ul>
                <li><strong>Width/Height</strong> - Number of tiles (4-100 each)</li>
                <li><strong>Resize Grid</strong> - Apply new dimensions (preserves existing tiles where possible)</li>
                <li><strong>Clear All</strong> - Reset all tiles to undefined</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the Select tool for quickly filling large rectangular areas like floors or walls.
            </div>
        `
    },
    {
        id: 'background-editor',
        title: 'Background Editor',
        content: `
            <h1>Background Editor</h1>
            <p>The BG tab lets you add, arrange, and stylize background images for your level.</p>

            <h2>Adding Background Layers</h2>
            <ol>
                <li>Click the "+ Add Layer" button</li>
                <li>Select an image file (PNG, JPG, WebP)</li>
                <li>The image appears in the layer list</li>
            </ol>

            <h2>Layer Properties</h2>
            <p>Select a layer to edit its properties:</p>
            <ul>
                <li><strong>Layer Name</strong> - Identifier for the layer</li>
                <li><strong>Depth</strong> - Z-order (-100 to 100, lower = further back)</li>
                <li><strong>Scroll Rate</strong> - Parallax multiplier (0 = static, 1 = normal, 0.5 = half speed)</li>
                <li><strong>X/Y Offset</strong> - Position adjustment in pixels</li>
                <li><strong>Scale</strong> - Size multiplier (0.25x to 4x)</li>
            </ul>

            <h2>Pixelify - Retro Effect</h2>
            <p>Transform high-resolution images into pixel art style backgrounds.</p>

            <h3>Target Resolution</h3>
            <p>Preset resolutions based on classic systems:</p>
            <ul>
                <li><strong>320x180</strong> - Mantleborn (16:9)</li>
                <li><strong>320x224</strong> - Sega Genesis</li>
                <li><strong>256x224</strong> - SNES</li>
                <li><strong>160x144</strong> - Game Boy</li>
                <li><strong>256x192</strong> - Master System</li>
                <li><strong>Custom</strong> - Set your own dimensions</li>
            </ul>

            <h3>Palette Colors</h3>
            <p>Reduce the color palette (4-64 colors). Fewer colors = more retro look.</p>

            <h3>Dithering</h3>
            <p>Simulate color gradients with limited palettes:</p>
            <ul>
                <li><strong>None</strong> - Hard color boundaries</li>
                <li><strong>Bayer 2x2</strong> - Subtle ordered dither</li>
                <li><strong>Bayer 4x4</strong> - Classic pixel art dither</li>
                <li><strong>Bayer 8x8</strong> - Strong pattern dither</li>
                <li><strong>Floyd-Steinberg</strong> - Error diffusion (smoother)</li>
            </ul>

            <h3>Dither Strength</h3>
            <p>Controls how pronounced the dithering effect appears (8-64).</p>

            <div class="warning">
                <div class="warning-label">Note</div>
                Pixelify transforms the image in-place. Use "Reset to Original" to undo the effect.
            </div>

            <h2>Recommended Image Size</h2>
            <p>For a 32x18 tile grid at 24px per tile: <strong>768x432 pixels</strong></p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use multiple layers with different scroll rates to create a parallax scrolling effect.
            </div>
        `
    },
    {
        id: 'tile-painter',
        title: 'Tile Painter',
        content: `
            <h1>Tile Painter</h1>
            <p>The Tiles tab lets you paint visual sprites onto your level grid, adding visual detail on top of your collision map.</p>

            <h2>Getting Started</h2>
            <ol>
                <li>Select a spritesheet from the dropdown (or use Master Sheet)</li>
                <li>Click a sprite in the palette to select it</li>
                <li>Click on the canvas to paint the sprite</li>
            </ol>

            <h2>Sprite Palette</h2>
            <p>The right panel shows available sprites from the selected sheet:</p>
            <ul>
                <li><strong>Master Sheet</strong> - Combined sprites from Tilesmith and Sprite-Rite</li>
                <li><strong>Project Sheets</strong> - Individual spritesheets in your project</li>
            </ul>
            <p>Click any sprite to select it. The selected sprite appears in the preview above.</p>

            <h2>Painting Tools</h2>

            <h3>Paint Tool (P)</h3>
            <p>Click to place the selected sprite. Click and drag to paint multiple tiles.</p>

            <h3>Erase Tool (E)</h3>
            <p>Click to remove sprites from tiles. Does not affect the collision grid.</p>

            <h3>Fill Tool (F)</h3>
            <p>Click to flood-fill an area with the selected sprite. Fills all connected empty tiles.</p>

            <h2>How Visual Tiles Work</h2>
            <ul>
                <li>Visual tiles are separate from collision tiles</li>
                <li>You can paint sprites on any tile, regardless of its collision state</li>
                <li>The tile canvas shows your painted sprites at actual size</li>
                <li>Visual tiles are stored with spritesheet references for game rendering</li>
            </ul>

            <h2>Clear Tiles</h2>
            <p>Click "Clear Tiles" to remove all painted sprites. This does not affect the collision grid in the Grid tab.</p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the Master Sheet to access sprites from all your project's tools in one place.
            </div>

            <div class="warning">
                <div class="warning-label">Note</div>
                Visual tiles are independent of collision. An obstruction tile can have any sprite (or none), and an open tile can show a wall sprite for visual variety.
            </div>
        `
    },
    {
        id: 'demo-mode',
        title: 'Demo Mode',
        content: `
            <h1>Demo Mode</h1>
            <p>Test your level design with the built-in demo mode. Play as a simple character to verify collision, spawns, and level flow.</p>

            <h2>Starting Demo Mode</h2>
            <ol>
                <li>Design your level with open areas and obstructions</li>
                <li>Place at least one spawn point (or have open tiles)</li>
                <li>Click the green "Play Demo" button</li>
            </ol>

            <h2>Level Types</h2>

            <h3>Platformer Mode</h3>
            <p>Side-scrolling physics with gravity:</p>
            <ul>
                <li><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> or <kbd>A</kbd> <kbd>D</kbd> - Move left/right</li>
                <li><kbd>Space</kbd> or <kbd>&#8593;</kbd> or <kbd>W</kbd> - Jump</li>
                <li>Gravity pulls the player down</li>
                <li>Player lands on obstruction tiles</li>
                <li>Horizontal collision with walls</li>
            </ul>

            <h3>Top-Down Mode</h3>
            <p>Free 8-directional movement (no gravity):</p>
            <ul>
                <li><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> or <kbd>WASD</kbd> - Move in any direction</li>
                <li>Diagonal movement is normalized (same speed)</li>
                <li>Obstructions block movement from all sides</li>
            </ul>

            <h2>Spawn Behavior</h2>
            <p>The player spawns at:</p>
            <ol>
                <li>First spawn point tile (if placed)</li>
                <li>First open tile with ground below (platformer)</li>
                <li>First open tile (top-down)</li>
            </ol>

            <h2>What Demo Tests</h2>
            <ul>
                <li><strong>Collision</strong> - Verify walls and platforms work correctly</li>
                <li><strong>Accessibility</strong> - Can the player reach all areas?</li>
                <li><strong>Spawn Position</strong> - Does the player start in a good spot?</li>
                <li><strong>Jump Height</strong> - Can platforms be reached? (platformer)</li>
            </ul>

            <h2>Exiting Demo</h2>
            <p>Press <kbd>Esc</kbd> or click the "Exit Demo" button to return to the editor.</p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Demo mode uses simplified physics. Your actual game may have different jump heights, speeds, and mechanics.
            </div>

            <div class="warning">
                <div class="warning-label">Note</div>
                Background images and visual tiles are not rendered in demo mode - only the collision grid is shown.
            </div>
        `
    },
    {
        id: 'portals',
        title: 'Portals & Markers',
        content: `
            <h1>Portals & Markers</h1>
            <p>Portal markers define how players enter and exit levels. Use spawns, exits, and returns to create connected level flows.</p>

            <h2>Spawn Points</h2>
            <p>Where players appear when entering a level.</p>
            <ul>
                <li>The first spawn placed becomes the <strong>primary spawn</strong></li>
                <li>Multiple spawns allow different entry points</li>
                <li>Named automatically: <code>levelname_spawn_1</code>, etc.</li>
                <li>Direction indicates which way player faces on spawn</li>
            </ul>

            <h2>Exit Points</h2>
            <p>Trigger transitions to other levels when the player steps on them.</p>
            <ul>
                <li>Configure destinations in the Portals tool</li>
                <li>Named automatically: <code>levelname_exit_1</code>, etc.</li>
                <li>Shown with an arrow indicating exit direction</li>
            </ul>

            <h2>Return Points</h2>
            <p>Where players arrive when returning from another level.</p>
            <ul>
                <li>Linked to specific exits in other levels</li>
                <li>Named automatically: <code>levelname_return_1</code>, etc.</li>
                <li>Shown with a bidirectional arrow</li>
            </ul>

            <h2>Setting Directions</h2>
            <p><strong>Right-click</strong> on any portal marker to cycle through directions:</p>
            <ul>
                <li>Down (default)</li>
                <li>Right</li>
                <li>Up</li>
                <li>Left</li>
            </ul>
            <p>Direction affects which way the player faces when using the portal.</p>

            <h2>Portal Markers Panel</h2>
            <p>The right panel shows a summary of all markers:</p>
            <ul>
                <li>Count of spawns, exits, and returns</li>
                <li>List of unconfigured markers</li>
                <li>Click a marker to scroll to it on the grid</li>
            </ul>

            <h2>Configuration Workflow</h2>
            <ol>
                <li>Place exit and return markers in Level Forge</li>
                <li>Export your level to the Crucible</li>
                <li>Open the Portals tool to link exits to destinations</li>
            </ol>

            <div class="warning">
                <div class="warning-label">Important</div>
                You must name your level before placing portal markers. The level name is used to generate marker IDs.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use return points to create two-way connections between levels. An exit in Level A leads to a return in Level B, and vice versa.
            </div>
        `
    },
    {
        id: 'ai-tilesets',
        title: 'AI Tileset Generation',
        content: `
            <h1>AI Tileset Generation</h1>
            <p>Generate complete Wang tilesets using PixelLab AI. Create terrain transitions, platform sets, and decorative tiles with a single prompt.</p>

            <h2>Opening the Generator</h2>
            <p>In the Tiles tab, click the <strong>+ Generate</strong> button next to the tile palette header.</p>

            <h2>Tileset Types</h2>

            <h3>Top-Down Terrain</h3>
            <p>For top-down/overhead games. Creates 16 Wang tiles for terrain transitions:</p>
            <ul>
                <li><strong>Lower Material</strong> - The base terrain ("grass", "water", "stone")</li>
                <li><strong>Upper Material</strong> - The overlapping terrain ("dirt path", "sand", "snow")</li>
            </ul>

            <h3>Sidescroller Platforms</h3>
            <p>For platformer games. Creates platform pieces with proper edges:</p>
            <ul>
                <li><strong>Material</strong> - Platform material ("stone brick", "wood plank", "metal")</li>
                <li><strong>Decoration</strong> - Surface details ("mossy", "cracked", "rusted")</li>
            </ul>

            <h2>Generation Workflow</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select Tileset Type</strong><br>
                    Choose Top-Down or Sidescroller based on your game perspective.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Describe Materials</strong><br>
                    Enter descriptions for lower/upper (top-down) or material/decoration (sidescroller).
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Set Options</strong><br>
                    Tile size, transition style (sharp/medium/wide), and visual style settings.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Queue Generation</strong><br>
                    Click Generate. Tileset generation takes 2-5 minutes.
                </div>
            </div>

            <h2>Chaining Tilesets</h2>
            <p>Create seamless multi-terrain transitions by chaining tilesets:</p>
            <ol>
                <li>Generate grass → dirt transition</li>
                <li>Generate dirt → water using the dirt tileset as base</li>
                <li>The AI maintains material consistency across sets</li>
            </ol>

            <h2>Generation Queue</h2>
            <p>Track jobs in the queue panel (bottom-right):</p>
            <ul>
                <li><strong>⏳ Processing</strong> - Tileset is being generated</li>
                <li><strong>✅ Complete</strong> - Ready to import to palette</li>
                <li><strong>❌ Failed</strong> - Click Retry</li>
            </ul>

            <h2>Importing Tilesets</h2>
            <p>When generation completes:</p>
            <ol>
                <li>Click <strong>Import</strong> on the completed job</li>
                <li>All 16 Wang tiles are added to the palette</li>
                <li>Autotile rules are pre-configured</li>
                <li>Start painting with automatic tile selection</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use consistent style settings across all tilesets in a project for visual coherence. Set defaults in Crucible.
            </div>

            <div class="warning">
                <div class="warning-label">Note</div>
                Wang tilesets use the "blob" autotile pattern with 16 tiles covering all corner and edge combinations.
            </div>
        `
    },
    {
        id: 'export',
        title: 'Export & Integration',
        content: `
            <h1>Export & Integration</h1>
            <p>Level Forge exports comprehensive JSON data that includes collision, backgrounds, visual tiles, and portal markers.</p>

            <h2>JSON Output</h2>
            <p>The JSON preview panel shows your level data in real-time. It includes:</p>
            <ul>
                <li><strong>name</strong> - Level identifier</li>
                <li><strong>type</strong> - "platformer" or "topdown"</li>
                <li><strong>width/height</strong> - Grid dimensions in tiles</li>
                <li><strong>tileSize</strong> - Pixels per tile (24)</li>
                <li><strong>physics</strong> - Gravity and collision settings</li>
                <li><strong>grid</strong> - 2D array of tile states (0-5)</li>
                <li><strong>walkable</strong> - List of walkable coordinates</li>
                <li><strong>obstructions</strong> - List of solid tile coordinates</li>
                <li><strong>spawns</strong> - Spawn point data with directions</li>
                <li><strong>exits</strong> - Exit and return point data</li>
                <li><strong>backgrounds</strong> - Background layer configuration</li>
                <li><strong>visualTiles</strong> - Painted sprite data</li>
            </ul>

            <h2>Copy JSON</h2>
            <p>Click "Copy JSON" to copy the level data to your clipboard. Paste it into your game code or save it to a file.</p>

            <h2>Load JSON</h2>
            <p>Click "Load JSON" to import a previously exported level. Paste the JSON when prompted.</p>

            <h2>Send to Crucible</h2>
            <p>The Crucible of Code integration lets you save levels directly to your project:</p>
            <ol>
                <li>Select your project from the header dropdown (required first)</li>
                <li>Click the "Send to Crucible" button</li>
                <li>Choose an existing level to update</li>
                <li>Click "Send Data" to save</li>
            </ol>
            <p>The project must be selected before sending because visual tiles reference sprites from that project's master spritesheet.</p>

            <h2>Grid Encoding</h2>
            <p>Tile states are encoded as numbers for compact storage:</p>
            <ul>
                <li><code>0</code> - Undefined</li>
                <li><code>1</code> - Open</li>
                <li><code>2</code> - Obstruction</li>
                <li><code>3</code> - Spawn</li>
                <li><code>4</code> - Exit</li>
                <li><code>5</code> - Return</li>
            </ul>

            <h2>Using in Your Game</h2>
            <pre><code>// Load level data
const level = await fetch('level_01.json').then(r => r.json());

// Access collision grid
const isWalkable = level.grid[y][x] === 1;

// Get spawn position
const spawn = level.spawn; // { x, y }

// Check physics type
if (level.physics.gravity) {
    // Apply gravity
}</code></pre>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the "walkable" and "obstructions" arrays for simpler collision checks instead of parsing the full grid.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Speed up your level design workflow with these shortcuts.</p>

            <h2>Grid Editor Tools</h2>
            <ul>
                <li><kbd>P</kbd> - Paint tool (click to cycle states)</li>
                <li><kbd>F</kbd> - Fill tool (flood fill)</li>
                <li><kbd>S</kbd> - Select tool (rectangle selection)</li>
            </ul>

            <h2>Tile States</h2>
            <ul>
                <li><kbd>1</kbd> - Undefined</li>
                <li><kbd>2</kbd> - Open</li>
                <li><kbd>3</kbd> - Obstruction</li>
                <li><kbd>4</kbd> - Spawn</li>
                <li><kbd>5</kbd> - Exit</li>
                <li><kbd>6</kbd> - Return</li>
            </ul>

            <h2>Portal Markers</h2>
            <ul>
                <li><kbd>Right-click</kbd> on portal tile - Cycle direction</li>
            </ul>

            <h2>Tile Painter Tools</h2>
            <ul>
                <li><kbd>P</kbd> - Paint sprite</li>
                <li><kbd>E</kbd> - Erase sprite</li>
                <li><kbd>F</kbd> - Fill with sprite</li>
            </ul>

            <h2>General</h2>
            <ul>
                <li><kbd>Escape</kbd> - Cancel selection / Exit demo mode</li>
            </ul>

            <h2>Demo Mode Controls</h2>

            <h3>Platformer</h3>
            <ul>
                <li><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> or <kbd>A</kbd> <kbd>D</kbd> - Move</li>
                <li><kbd>Space</kbd> / <kbd>&#8593;</kbd> / <kbd>W</kbd> - Jump</li>
                <li><kbd>Escape</kbd> - Exit demo</li>
            </ul>

            <h3>Top-Down</h3>
            <ul>
                <li><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> or <kbd>WASD</kbd> - Move</li>
                <li><kbd>Escape</kbd> - Exit demo</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Use number keys to quickly switch states while painting for efficient level layout.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LEVEL_FORGE_DOCS;
}

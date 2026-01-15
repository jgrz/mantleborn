/**
 * Crucible of Code Documentation
 * Used by the Help Drawer component and Grimoire
 */

const CRUCIBLE_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>The Crucible of Code is your project command center. It's where all the pieces from Game Wizard tools come together into playable game levels.</p>

            <h2>What is the Crucible?</h2>
            <p>Think of it as your game's database and assembly point:</p>
            <ul>
                <li><strong>Organize</strong> - Group levels into projects</li>
                <li><strong>Collect</strong> - Gather data from Level Forge, Tilesmith, and other tools</li>
                <li><strong>Compile</strong> - Merge collision, backgrounds, and tiles into single level files</li>
                <li><strong>Export</strong> - Output JSON ready for your game engine</li>
            </ul>

            <h2>Getting Started</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Create a Project</strong><br>
                    Click "+ New Project" and give your game a name. Projects contain all your levels.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Create a Level</strong><br>
                    Click "+ New Level" to add your first level. Set the name, type (platformer or top-down), and dimensions.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Design in Level Forge</strong><br>
                    Use the "Open in Level Forge" links to design collision, backgrounds, and visual tiles.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Send Data Back</strong><br>
                    In Level Forge, click "Send to Crucible" to save your work back to the project.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Export for Your Game</strong><br>
                    Copy the JSON or export as a file to use in your game engine.
                </div>
            </div>

            <h2>The Big Picture</h2>
            <p>The Crucible connects all Game Wizard tools:</p>
            <ul>
                <li><strong>Tilesmith</strong> creates sprites → Master Spritesheet</li>
                <li><strong>Sprite-Rite</strong> imports sprites → Master Spritesheet</li>
                <li><strong>Animancer</strong> animates sprites → Animation data</li>
                <li><strong>Level Forge</strong> designs levels → Crucible</li>
                <li><strong>Crucible</strong> compiles everything → Game-ready JSON</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                The Crucible remembers your last project and level. When you return, it picks up where you left off.
            </div>
        `
    },
    {
        id: 'projects',
        title: 'Projects',
        content: `
            <h1>Projects</h1>
            <p>Projects are containers for your game. Each project has its own levels, master spritesheet, and settings.</p>

            <h2>Creating a Project</h2>
            <ol>
                <li>Click the <strong>+ New Project</strong> button in the header</li>
                <li>Enter a project name (e.g., "My Platformer")</li>
                <li>Optionally add a description</li>
                <li>Click <strong>Create Project</strong></li>
            </ol>
            <p>Your new project is automatically selected and ready for levels.</p>

            <h2>Switching Projects</h2>
            <p>Use the project dropdown in the header to switch between projects. Each project has:</p>
            <ul>
                <li>Its own set of levels</li>
                <li>Its own master spritesheet</li>
                <li>Independent settings and data</li>
            </ul>

            <h2>Project Info</h2>
            <p>The sidebar shows current project info:</p>
            <ul>
                <li>Project name</li>
                <li>Number of levels</li>
            </ul>

            <h2>When to Use Multiple Projects</h2>
            <ul>
                <li><strong>Different games</strong> - Each game should be its own project</li>
                <li><strong>Major prototypes</strong> - Experiment with a new project, keep your main game safe</li>
                <li><strong>Asset libraries</strong> - Create a project just for reusable sprites/tiles</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Important</div>
                Sprites and tiles belong to projects. If you create sprites in Project A, they won't appear in Project B's master spritesheet.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Give projects descriptive names. "Platformer_v2" is better than "test" when you have multiple projects.
            </div>
        `
    },
    {
        id: 'levels',
        title: 'Levels',
        content: `
            <h1>Levels</h1>
            <p>Levels are the playable areas of your game. Each level has collision data, backgrounds, visual tiles, and spawn points.</p>

            <h2>Creating a Level</h2>
            <ol>
                <li>Select a project first</li>
                <li>Click <strong>+ New Level</strong> in the sidebar</li>
                <li>Enter a level name (e.g., "Forest_01")</li>
                <li>Choose the level type:
                    <ul>
                        <li><strong>Platformer</strong> - Side-scrolling with gravity</li>
                        <li><strong>Top-Down</strong> - Free movement, no gravity</li>
                    </ul>
                </li>
                <li>Set dimensions in tiles (width × height)</li>
                <li>Click <strong>Create Level</strong></li>
            </ol>

            <h2>Level Types</h2>

            <h3>Platformer</h3>
            <p>For side-scrolling games with gravity:</p>
            <ul>
                <li>Players fall and land on platforms</li>
                <li>Obstructions are solid from all sides</li>
                <li>Physics include gravity, jumping</li>
            </ul>

            <h3>Top-Down</h3>
            <p>For overhead view games without gravity:</p>
            <ul>
                <li>Players move freely in 8 directions</li>
                <li>Obstructions block movement</li>
                <li>Good for RPGs, puzzle games, adventure games</li>
            </ul>

            <h2>Level Dimensions</h2>
            <ul>
                <li><strong>Width</strong>: 8-128 tiles</li>
                <li><strong>Height</strong>: 8-72 tiles</li>
                <li><strong>Tile size</strong>: 24×24 pixels</li>
            </ul>
            <p>A 32×18 level is 768×432 pixels (good for 16:9 screens).</p>

            <h2>Level Slugs</h2>
            <p>Each level gets a URL-friendly "slug" based on its name:</p>
            <ul>
                <li>"Forest Stage 1" → <code>forest-stage-1</code></li>
                <li>"Level_01" → <code>level-01</code></li>
            </ul>
            <p>Slugs are used for file names and URLs.</p>

            <h2>Deleting Levels</h2>
            <p>Hover over a level in the sidebar and click the × button. This permanently deletes all level data.</p>

            <div class="warning">
                <div class="warning-label">Warning</div>
                Deleting a level cannot be undone. All collision, background, and tile data will be lost.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Name levels descriptively: <code>forest_01</code>, <code>cave_boss</code>, <code>tutorial</code>. Your future self will thank you.
            </div>
        `
    },
    {
        id: 'dashboard',
        title: 'Level Dashboard',
        content: `
            <h1>Level Dashboard</h1>
            <p>When you select a level, the dashboard shows its current state and provides quick access to editing tools.</p>

            <h2>Status Cards</h2>
            <p>Four cards show the completion status of each level component:</p>

            <h3>Collision Grid</h3>
            <ul>
                <li><strong>Progress bar</strong> - Percentage of tiles defined</li>
                <li><strong>Obstruction count</strong> - Solid tiles blocking movement</li>
                <li><strong>Walkable count</strong> - Tiles players can traverse</li>
                <li><strong>Link</strong> - Opens Level Forge's Grid tab</li>
            </ul>

            <h3>Backgrounds</h3>
            <ul>
                <li><strong>Layer count</strong> - Number of background images</li>
                <li><strong>Link</strong> - Opens Level Forge's BG tab</li>
            </ul>

            <h3>Visual Tiles</h3>
            <ul>
                <li><strong>Tile count</strong> - Number of sprites painted on the grid</li>
                <li><strong>Link</strong> - Opens Level Forge's Tiles tab</li>
            </ul>

            <h3>Spawn Point</h3>
            <ul>
                <li><strong>Coordinates</strong> - Where the player starts</li>
                <li><strong>Status</strong> - "Not set" if no spawn defined</li>
            </ul>

            <h2>Understanding Progress</h2>
            <p>The progress bars help you track level completion:</p>
            <ul>
                <li><strong>Empty</strong> - No data yet (card appears dimmed)</li>
                <li><strong>Partial</strong> - Some work done</li>
                <li><strong>Full</strong> - Component complete</li>
            </ul>

            <h2>Opening Level Forge</h2>
            <p>Each status card has an "Open in Level Forge →" link that:</p>
            <ul>
                <li>Opens Level Forge with your project pre-selected</li>
                <li>Loads the current level</li>
                <li>Switches to the relevant tab</li>
            </ul>

            <h2>Header Actions</h2>
            <ul>
                <li><strong>Copy JSON</strong> - Copy level data to clipboard</li>
                <li><strong>Export Level</strong> - Download as .json file</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the status cards to see what's missing. A level needs at least some collision data and a spawn point to be playable.
            </div>
        `
    },
    {
        id: 'data-tabs',
        title: 'Data Previews',
        content: `
            <h1>Data Previews</h1>
            <p>Below the status cards, tabs let you preview different aspects of your level data.</p>

            <h2>Grid Tab</h2>
            <p>Shows a visual preview of your collision grid:</p>
            <ul>
                <li><strong>Dark cells</strong> - Undefined/empty tiles</li>
                <li><strong>Light cells</strong> - Open/walkable tiles</li>
                <li><strong>Bronze cells</strong> - Obstructions</li>
                <li><strong>Green cells</strong> - Spawn points</li>
            </ul>
            <p>The grid preview scales to fit, showing the overall layout at a glance.</p>

            <h2>Backgrounds Tab</h2>
            <p>Shows cards for each background layer:</p>
            <ul>
                <li><strong>Thumbnail</strong> - Preview of the background image</li>
                <li><strong>Layer name</strong> - Identifier</li>
                <li><strong>Depth</strong> - Z-order (lower = further back)</li>
                <li><strong>Scroll rate</strong> - Parallax multiplier</li>
            </ul>

            <h2>Tiles Tab</h2>
            <p>Shows a summary of visual tiles:</p>
            <ul>
                <li><strong>Tile count</strong> - How many sprites are placed</li>
                <li>Note: Full tile preview is available in Level Forge</li>
            </ul>

            <h2>JSON Tab</h2>
            <p>Shows the complete compiled level data in JSON format:</p>
            <ul>
                <li>Full level structure visible</li>
                <li>Copy button for easy clipboard access</li>
                <li>Scrollable for large levels</li>
            </ul>

            <h2>What's in the JSON?</h2>
            <p>The compiled JSON includes:</p>
            <ul>
                <li><strong>name</strong> - Level identifier</li>
                <li><strong>type</strong> - "platformer" or "topdown"</li>
                <li><strong>width/height</strong> - Dimensions in tiles</li>
                <li><strong>tileSize</strong> - Pixel size (24)</li>
                <li><strong>physics</strong> - Gravity and collision settings</li>
                <li><strong>grid</strong> - 2D array of tile states</li>
                <li><strong>spawn</strong> - Player start coordinates</li>
                <li><strong>walkable</strong> - List of walkable positions</li>
                <li><strong>obstructions</strong> - List of solid positions</li>
                <li><strong>backgrounds</strong> - Background layer configs</li>
                <li><strong>visualTiles</strong> - Painted sprite data</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                The JSON tab is great for debugging. If something looks wrong in your game, check the raw data here.
            </div>
        `
    },
    {
        id: 'exporting',
        title: 'Exporting',
        content: `
            <h1>Exporting</h1>
            <p>The Crucible compiles all level data into a single JSON file ready for your game engine.</p>

            <h2>Copy to Clipboard</h2>
            <p>Click <strong>Copy JSON</strong> to copy the entire level data. Useful for:</p>
            <ul>
                <li>Pasting directly into code</li>
                <li>Quick testing in console</li>
                <li>Sharing via chat/email</li>
            </ul>

            <h2>Export as File</h2>
            <p>Click <strong>Export Level</strong> to download a .json file:</p>
            <ul>
                <li>File named after level slug (e.g., <code>forest-01.json</code>)</li>
                <li>Ready to include in your game assets</li>
                <li>Standard JSON format</li>
            </ul>

            <h2>Using in Game Engines</h2>

            <h3>Loading the JSON</h3>
            <pre><code>// Fetch and parse
const level = await fetch('levels/forest-01.json')
  .then(r => r.json());

// Access properties
console.log(level.name);         // "Forest 01"
console.log(level.width);        // 32
console.log(level.spawn);        // { x: 5, y: 10 }
console.log(level.grid[0][0]);   // 0, 1, or 2</code></pre>

            <h3>Collision Detection</h3>
            <pre><code>// Check if tile is walkable
function isWalkable(x, y) {
    const tile = level.grid[y]?.[x];
    return tile === 1 || tile === 3; // open or spawn
}

// Or use the walkable array
const canWalk = level.walkable.some(
    pos => pos.x === x && pos.y === y
);</code></pre>

            <h3>Spawning the Player</h3>
            <pre><code>// Position player at spawn
player.x = level.spawn.x * level.tileSize;
player.y = level.spawn.y * level.tileSize;</code></pre>

            <h2>Grid Encoding</h2>
            <p>Tile states in the grid array:</p>
            <ul>
                <li><code>0</code> - Undefined (treat as empty)</li>
                <li><code>1</code> - Open (walkable)</li>
                <li><code>2</code> - Obstruction (solid)</li>
                <li><code>3</code> - Spawn point (walkable)</li>
                <li><code>4</code> - Exit (walkable, triggers transition)</li>
                <li><code>5</code> - Return point (walkable, entry from other level)</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the <code>walkable</code> and <code>obstructions</code> arrays for simpler collision code. They list coordinates directly instead of requiring grid iteration.
            </div>
        `
    },
    {
        id: 'integration',
        title: 'Tool Integration',
        content: `
            <h1>Tool Integration</h1>
            <p>The Crucible is the hub that connects all Game Wizard tools. Here's how they work together.</p>

            <h2>Data Flow</h2>
            <pre><code>Tilesmith ──────┐
                ├──→ Master Spritesheet ──→ Level Forge
Sprite-Rite ───┘                                │
                                                │
Animancer ←── Master Spritesheet        │
                                                ▼
                                           Crucible
                                                │
                                                ▼
                                         Game JSON</code></pre>

            <h2>From Tilesmith</h2>
            <p>Tiles you create in Tilesmith:</p>
            <ol>
                <li>Get saved to the project's master spritesheet</li>
                <li>Become available in Level Forge's Tile Painter</li>
                <li>Can be painted onto your level grid</li>
            </ol>

            <h2>From Sprite-Rite</h2>
            <p>Sprites you import in Sprite-Rite:</p>
            <ol>
                <li>Get published to the master spritesheet</li>
                <li>Become available in Level Forge and Animancer</li>
            </ol>

            <h2>From Level Forge</h2>
            <p>Level Forge sends data to Crucible via "Send to Crucible":</p>
            <ul>
                <li><strong>Grid data</strong> - Collision, walkable, obstructions</li>
                <li><strong>Spawn points</strong> - Player start locations</li>
                <li><strong>Exits/returns</strong> - Level transition points</li>
                <li><strong>Backgrounds</strong> - Parallax layer configurations</li>
                <li><strong>Visual tiles</strong> - Painted sprite positions</li>
            </ul>

            <h2>Context Persistence</h2>
            <p>The Crucible saves your context:</p>
            <ul>
                <li>Last selected project</li>
                <li>Last selected level</li>
            </ul>
            <p>When you open Level Forge from Crucible links, it inherits this context. When you "Send to Crucible" from Level Forge, it knows where to save.</p>

            <h2>Recommended Workflow</h2>
            <ol>
                <li><strong>Crucible</strong>: Create project and level</li>
                <li><strong>Tilesmith</strong>: Create terrain tiles</li>
                <li><strong>Sprite-Rite</strong>: Import character sprites</li>
                <li><strong>Level Forge</strong>: Design collision and paint tiles</li>
                <li><strong>Level Forge</strong>: Send to Crucible</li>
                <li><strong>Crucible</strong>: Export JSON</li>
                <li><strong>Your Game</strong>: Load and play!</li>
            </ol>

            <div class="warning">
                <div class="warning-label">Important</div>
                Always select the same project across tools. Sprites from Project A won't appear when you're working on Project B.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the "Open in Level Forge" links from Crucible to ensure you're editing the right level with the right project context.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Navigate the Crucible quickly with these shortcuts.</p>

            <h2>General</h2>
            <ul>
                <li><kbd>Escape</kbd> - Close any open modal</li>
            </ul>

            <h2>Modal Shortcuts</h2>
            <p>When creating projects or levels:</p>
            <ul>
                <li><kbd>Enter</kbd> - Submit form (when input focused)</li>
                <li><kbd>Escape</kbd> - Cancel and close modal</li>
            </ul>

            <h2>Tips for Efficiency</h2>
            <ul>
                <li>Use the project dropdown to quickly switch contexts</li>
                <li>Click level names in sidebar to switch levels</li>
                <li>Use "Open in Level Forge" links to jump directly to editing</li>
                <li>Use browser back button to return from Level Forge</li>
            </ul>

            <h2>Browser Shortcuts</h2>
            <ul>
                <li><kbd>Ctrl</kbd>+<kbd>C</kbd> - Copy selected text (use after selecting JSON)</li>
                <li><kbd>F5</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd> - Refresh to reload latest data</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Open Crucible and Level Forge in separate browser tabs. Edit in Level Forge, send to Crucible, then switch tabs and refresh to see updates.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CRUCIBLE_DOCS;
}

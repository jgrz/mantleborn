/**
 * Portals Documentation
 * Used by the Help Drawer component and Grimoire
 */

const PORTALS_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Portals is where you connect your game's levels together. Define how players travel from one level to another by linking exits to spawn points.</p>

            <h2>What Portals Does</h2>
            <ul>
                <li><strong>Visualize</strong> - See all levels as draggable nodes on a canvas</li>
                <li><strong>Connect</strong> - Link exit points to spawn points in other levels</li>
                <li><strong>Validate</strong> - Check for missing connections or configuration issues</li>
            </ul>

            <h2>Before Using Portals</h2>
            <p>You need levels with exits and spawns already placed:</p>
            <ol>
                <li>Create levels in the <strong>Crucible</strong></li>
                <li>Add spawn points in <strong>Level Forge</strong> (tile state: Spawn)</li>
                <li>Add exit points in <strong>Level Forge</strong> (tile state: Exit)</li>
                <li>Send data to Crucible</li>
                <li>Then use <strong>Portals</strong> to connect them</li>
            </ol>

            <h2>Getting Started</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose your project from the dropdown. Levels with portal markers appear as nodes.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Click a Level Node</strong><br>
                    Select a level that has unconfigured exits to open the connection modal.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Choose Destination</strong><br>
                    Select the target level and spawn point where players should arrive.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Create Connection</strong><br>
                    Click "Create Connection" to link the exit to the spawn.
                </div>
            </div>

            <h2>Interface Overview</h2>
            <ul>
                <li><strong>Node Mapper</strong> - Main canvas with draggable level nodes</li>
                <li><strong>Connections Sidebar</strong> - List of all level connections</li>
                <li><strong>Validation Panel</strong> - Shows configuration issues</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Drag level nodes around the canvas to organize your game's level flow visually.
            </div>
        `
    },
    {
        id: 'node-mapper',
        title: 'Node Mapper',
        content: `
            <h1>Node Mapper</h1>
            <p>The node mapper is a visual canvas where each level appears as a draggable card. Connections between levels are shown as pathway lines.</p>

            <h2>Level Nodes</h2>
            <p>Each level is represented by a node card showing:</p>
            <ul>
                <li><strong>Level Name</strong> - The level's identifier</li>
                <li><strong>Spawn Count</strong> - Number of spawn points (blue dot)</li>
                <li><strong>Exit Count</strong> - Number of exit points (purple arrow)</li>
                <li><strong>Status</strong> - "All exits linked" or "X unconfigured"</li>
            </ul>

            <h2>Node Status</h2>
            <table>
                <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                </tr>
                <tr>
                    <td><strong>All exits linked</strong> (green)</td>
                    <td>Every exit has a destination configured</td>
                </tr>
                <tr>
                    <td><strong>X unconfigured</strong> (red)</td>
                    <td>X exits still need destinations</td>
                </tr>
                <tr>
                    <td><strong>No status shown</strong></td>
                    <td>Level has no exits</td>
                </tr>
            </table>

            <h2>Dragging Nodes</h2>
            <p>Click and drag any level node to reposition it on the canvas:</p>
            <ul>
                <li>Pathways update in real-time as you drag</li>
                <li>Positions are remembered during your session</li>
                <li>Organize nodes to match your game's level progression</li>
            </ul>

            <h2>Selecting Nodes</h2>
            <p>Click a node (without dragging) to select it:</p>
            <ul>
                <li>Selected nodes have a purple glow</li>
                <li>If the level has unconfigured exits, the connection modal opens</li>
                <li>If all exits are configured, a message is shown</li>
            </ul>

            <h2>Pathways</h2>
            <p>Lines between nodes show established connections:</p>
            <ul>
                <li><strong>Purple lines</strong> - One-way connections (exit → spawn)</li>
                <li><strong>Teal lines</strong> - Bidirectional connections</li>
                <li>Toggle pathways with the "Show Pathways" checkbox</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Arrange nodes left-to-right or top-to-bottom to visualize game progression from start to end.
            </div>
        `
    },
    {
        id: 'connections',
        title: 'Creating Connections',
        content: `
            <h1>Creating Connections</h1>
            <p>Connections link an exit in one level to a spawn point in another level. When a player steps on the exit, they appear at the connected spawn.</p>

            <h2>Opening the Connection Modal</h2>
            <ol>
                <li>Click a level node that has unconfigured exits</li>
                <li>The modal opens showing the first unconfigured exit</li>
                <li>Exit info shows: name and grid coordinates</li>
            </ol>

            <h2>Configuring the Connection</h2>

            <h3>1. Select Target Level</h3>
            <p>Choose which level the player should travel to. Only other levels in the project are shown (can't connect to the same level).</p>

            <h3>2. Select Target Spawn</h3>
            <p>Choose which spawn point the player arrives at. The dropdown shows:</p>
            <ul>
                <li>Spawn name</li>
                <li>Grid coordinates (x, y)</li>
            </ul>
            <p>If the target level has no spawns, you'll see a message to add some in Level Forge first.</p>

            <h3>3. Create Connection</h3>
            <p>Click "Create Connection" to save. The exit is now configured.</p>

            <h2>Connection Rules</h2>
            <ul>
                <li>Each exit can only connect to <strong>one</strong> spawn</li>
                <li>Multiple exits can connect to the <strong>same</strong> spawn</li>
                <li>Can't connect an exit to a spawn in the same level</li>
            </ul>

            <h2>Viewing Connections</h2>
            <p>The sidebar shows all connections:</p>
            <ul>
                <li><strong>Source</strong> - Level and exit name</li>
                <li><strong>Arrow</strong> - Direction (→ one-way, ↔ bidirectional)</li>
                <li><strong>Target</strong> - Level and spawn name</li>
            </ul>

            <h2>Deleting Connections</h2>
            <p>Click the "Delete" button on any connection to remove it. The exit becomes unconfigured again.</p>

            <div class="warning">
                <div class="warning-label">Important</div>
                Deleting a connection doesn't remove the exit tile from the level. It just unconfigures the destination.
            </div>
        `
    },
    {
        id: 'bidirectional',
        title: 'Bidirectional Connections',
        content: `
            <h1>Bidirectional Connections</h1>
            <p>Bidirectional connections create two-way travel between levels. Players can go from Level A to Level B, and return from Level B to Level A.</p>

            <h2>What is Bidirectional?</h2>
            <p>A standard connection is one-way:</p>
            <pre><code>Level A (Exit) → Level B (Spawn)</code></pre>
            <p>A bidirectional connection is two-way:</p>
            <pre><code>Level A (Exit) ↔ Level B (Spawn)
Level B (Return) → Level A (Spawn)</code></pre>

            <h2>When to Use Bidirectional</h2>
            <ul>
                <li><strong>Explorable areas</strong> - Player can freely travel back and forth</li>
                <li><strong>Hub worlds</strong> - Central area connecting to multiple levels</li>
                <li><strong>Backtracking</strong> - Player needs to return for items or quests</li>
            </ul>

            <h2>Creating Bidirectional Connections</h2>
            <ol>
                <li>Open the connection modal (click a level node)</li>
                <li>Select target level and spawn</li>
                <li>Check <strong>"Create bi-directional (return) connection"</strong></li>
                <li>Select a <strong>Return Exit</strong> on the target level</li>
                <li>Click "Create Connection"</li>
            </ol>

            <h2>Return Exits</h2>
            <p>Bidirectional connections require a "Return" type exit on the target level:</p>
            <ul>
                <li>Place return tiles in Level Forge (tile state: Return)</li>
                <li>Only unconfigured return exits are shown in the dropdown</li>
                <li>The return exit connects back to a spawn in the source level</li>
            </ul>

            <h2>Visual Indicators</h2>
            <ul>
                <li>Bidirectional connections show <strong>↔</strong> in the sidebar</li>
                <li>Pathway lines are <strong>teal</strong> instead of purple</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Plan your return exits when designing levels. Place them near where players arrive so they can easily find their way back.
            </div>
        `
    },
    {
        id: 'validation',
        title: 'Validation',
        content: `
            <h1>Validation</h1>
            <p>The validation feature checks your level connections for common issues that could break gameplay.</p>

            <h2>Running Validation</h2>
            <p>Click the <strong>Validate</strong> button in the header to check all levels in the current project.</p>

            <h2>Validation Checks</h2>

            <h3>Unconfigured Exits (Warning)</h3>
            <p>Levels with exits that don't have destinations configured.</p>
            <ul>
                <li><strong>Issue:</strong> Players step on exit but nothing happens</li>
                <li><strong>Fix:</strong> Create connections for all exits</li>
            </ul>

            <h3>Exits Without Spawns (Error)</h3>
            <p>Levels that have exits but no spawn points.</p>
            <ul>
                <li><strong>Issue:</strong> Other levels can't connect back to this level</li>
                <li><strong>Fix:</strong> Add spawn points in Level Forge</li>
            </ul>

            <h2>Validation Results</h2>
            <table>
                <tr>
                    <th>Icon</th>
                    <th>Meaning</th>
                </tr>
                <tr>
                    <td>&#10003; (green)</td>
                    <td>All connections valid - no issues found</td>
                </tr>
                <tr>
                    <td>&#9888; (yellow)</td>
                    <td>Warning - should fix but game may work</td>
                </tr>
                <tr>
                    <td>&#10060; (red)</td>
                    <td>Error - will likely break gameplay</td>
                </tr>
            </table>

            <h2>Best Practices</h2>
            <ul>
                <li>Run validation before exporting your game</li>
                <li>Fix all errors (red) before testing</li>
                <li>Warnings (yellow) may be intentional (dead-end levels)</li>
                <li>Use "Refresh" to reload data after making changes in Level Forge</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                After fixing issues in Level Forge, click "Refresh" in Portals to reload the latest data before validating again.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts & Tips',
        content: `
            <h1>Shortcuts & Tips</h1>
            <p>Work efficiently in Portals with these interactions and tips.</p>

            <h2>Mouse Interactions</h2>
            <ul>
                <li><strong>Click node</strong> - Select level, open connection modal if exits available</li>
                <li><strong>Drag node</strong> - Reposition on canvas</li>
                <li><strong>Click outside modal</strong> - Close modal</li>
            </ul>

            <h2>Keyboard Shortcuts</h2>
            <ul>
                <li><kbd>Escape</kbd> - Close connection modal</li>
            </ul>

            <h2>Toolbar Actions</h2>
            <ul>
                <li><strong>Refresh</strong> - Reload levels and connections from database</li>
                <li><strong>Validate</strong> - Check for configuration issues</li>
                <li><strong>Show Pathways</strong> - Toggle connection lines on/off</li>
            </ul>

            <h2>Workflow Tips</h2>

            <h3>Planning Level Flow</h3>
            <ol>
                <li>Sketch your game's level progression on paper first</li>
                <li>Create all levels in Crucible</li>
                <li>Add exits/spawns in Level Forge based on your plan</li>
                <li>Use Portals to make it official</li>
            </ol>

            <h3>Organizing the Canvas</h3>
            <ul>
                <li>Put the starting level on the left</li>
                <li>Arrange levels left-to-right for linear games</li>
                <li>Put hub levels in the center for non-linear games</li>
                <li>Group related levels together (e.g., all forest levels)</li>
            </ul>

            <h3>Naming Conventions</h3>
            <p>Good exit/spawn names make connections clearer:</p>
            <ul>
                <li><code>forest_01_exit_cave</code> - Exit leading to cave</li>
                <li><code>cave_spawn_from_forest</code> - Spawn for arrivals from forest</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Keep Portals and Level Forge open in separate tabs. Design in Level Forge, then switch to Portals and click Refresh to see new exits/spawns immediately.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PORTALS_DOCS;
}

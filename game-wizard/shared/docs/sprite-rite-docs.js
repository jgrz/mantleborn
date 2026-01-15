/**
 * Sprite-Rite Documentation
 * Used by the Help Drawer component and Grimoire
 */

const SPRITE_RITE_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Get started with Sprite-Rite to manage your game's sprites and spritesheets. This guide covers the basics of importing and defining sprites.</p>

            <h2>Getting Started</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose your project from the dropdown in the header. If you don't have one, create it in the Crucible of Code first.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Upload a Spritesheet</strong><br>
                    Click "Upload" or drag-and-drop an image file onto the canvas area. Supported formats: PNG, JPG, GIF, WebP.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Define Sprites</strong><br>
                    Click and drag on the canvas to create a selection box around a sprite. This defines the sprite's boundaries.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Name and Save</strong><br>
                    Give your sprite a name in the panel that appears, then click "Save Sprite". Repeat for each sprite in the sheet.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Publish to Master Sheet</strong><br>
                    Once sprites are defined, they can be published to your project's master spritesheet for use in Level Forge and Animancer.
                </div>
            </div>

            <h2>Interface Overview</h2>
            <ul>
                <li><strong>Canvas</strong> - Main area showing your spritesheet with grid overlay</li>
                <li><strong>Sprite List</strong> - Right panel showing all defined sprites</li>
                <li><strong>Selection Panel</strong> - Appears when creating/editing a sprite</li>
                <li><strong>JSON Preview</strong> - Shows the atlas data for your sprites</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use the grid overlay toggle to help align your selections with pixel boundaries.
            </div>
        `
    },
    {
        id: 'importing',
        title: 'Importing Spritesheets',
        content: `
            <h1>Importing Spritesheets</h1>
            <p>Sprite-Rite is designed for working with existing spritesheet images. Learn how to import and manage your sprite assets.</p>

            <h2>Supported Formats</h2>
            <ul>
                <li><strong>PNG</strong> - Recommended. Supports transparency.</li>
                <li><strong>JPG/JPEG</strong> - Good for photographic sprites</li>
                <li><strong>GIF</strong> - Single frame only (not animated)</li>
                <li><strong>WebP</strong> - Modern format with good compression</li>
            </ul>

            <h2>How to Import</h2>

            <h3>Drag and Drop</h3>
            <p>Simply drag an image file from your file explorer and drop it onto the canvas area. The spritesheet will load automatically.</p>

            <h3>Upload Button</h3>
            <p>Click the "Upload" button in the header to open a file picker. Select your spritesheet image.</p>

            <h2>Image Requirements</h2>
            <ul>
                <li><strong>Size</strong> - No strict limit, but very large images may affect performance</li>
                <li><strong>Resolution</strong> - Use pixel-perfect images for best results</li>
                <li><strong>Background</strong> - Transparent backgrounds work best for game sprites</li>
            </ul>

            <h2>Working with Existing Spritesheets</h2>
            <p>If you have an existing spritesheet from another tool or asset pack:</p>
            <ol>
                <li>Upload the image to Sprite-Rite</li>
                <li>Define sprite regions using the selection tool</li>
                <li>Export the JSON atlas for use in your game</li>
                <li>Publish to the master sheet for use in other Game Wizard tools</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Tip</div>
                If your spritesheet has a consistent grid (e.g., 32x32 tiles), use the grid overlay to quickly align selections.
            </div>

            <div class="warning">
                <div class="warning-label">Note</div>
                Sprite-Rite doesn't modify the original image. It only stores the coordinates and metadata for each sprite region.
            </div>
        `
    },
    {
        id: 'defining-sprites',
        title: 'Defining Sprites',
        content: `
            <h1>Defining Sprites</h1>
            <p>Learn how to create precise sprite definitions from your spritesheet image.</p>

            <h2>Creating a Selection</h2>

            <h3>Basic Selection</h3>
            <ol>
                <li>Click on the canvas where you want to start</li>
                <li>Drag to the opposite corner of the sprite</li>
                <li>Release to confirm the selection</li>
            </ol>

            <h3>Adjusting Selections</h3>
            <p>After creating a selection, you can fine-tune it:</p>
            <ul>
                <li><strong>Move</strong> - Click inside the selection and drag</li>
                <li><strong>Resize</strong> - Drag the corner or edge handles</li>
                <li><strong>Cancel</strong> - Press Escape or click "Cancel"</li>
            </ul>

            <h2>Naming Sprites</h2>
            <p>Good naming conventions make sprites easier to find and use:</p>
            <ul>
                <li>Use descriptive names: <code>player_idle</code>, <code>enemy_walk_1</code></li>
                <li>Include frame numbers for animations: <code>hero_run_01</code>, <code>hero_run_02</code></li>
                <li>Group related sprites with prefixes: <code>ui_button_normal</code>, <code>ui_button_hover</code></li>
            </ul>

            <h3>Auto-Naming</h3>
            <p>If you don't provide a name, Sprite-Rite generates one based on the spritesheet name and a sequential number.</p>

            <h2>Sprite Metadata</h2>
            <p>Each sprite definition includes:</p>
            <ul>
                <li><strong>Name</strong> - Unique identifier</li>
                <li><strong>X, Y</strong> - Position in the spritesheet (top-left corner)</li>
                <li><strong>Width, Height</strong> - Dimensions in pixels</li>
            </ul>

            <h2>Editing Existing Sprites</h2>
            <p>To modify a sprite you've already saved:</p>
            <ol>
                <li>Click the sprite in the Sprite List panel</li>
                <li>The selection will appear on the canvas</li>
                <li>Adjust position, size, or name as needed</li>
                <li>Click "Save Sprite" to update</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Hold Shift while dragging to constrain the selection to a square.
            </div>
        `
    },
    {
        id: 'master-sheet',
        title: 'Master Sheet Integration',
        content: `
            <h1>Master Sheet Integration</h1>
            <p>Understand how Sprite-Rite connects with the project's master spritesheet system.</p>

            <h2>What is the Master Sheet?</h2>
            <p>Each Game Wizard project has a single master spritesheet that combines all sprites from different sources:</p>
            <ul>
                <li><strong>Tilesmith</strong> - Tiles you create pixel-by-pixel</li>
                <li><strong>Sprite-Rite</strong> - Sprites imported from external images</li>
            </ul>

            <h2>Why Use the Master Sheet?</h2>
            <ul>
                <li>Single texture atlas for better game performance</li>
                <li>Automatic sprite packing (no wasted space)</li>
                <li>Consistent atlas format across all tools</li>
                <li>Level Forge and Animancer automatically use it</li>
            </ul>

            <h2>Publishing to Master Sheet</h2>
            <p>After defining sprites in Sprite-Rite:</p>
            <ol>
                <li>Select the sprites you want to publish</li>
                <li>Click "Publish to Master" (or similar action)</li>
                <li>The sprites are added to your project's master sheet</li>
                <li>They become available in Level Forge and Animancer</li>
            </ol>

            <h2>Tilesmith vs Sprite-Rite</h2>
            <table>
                <tr>
                    <th>Use Tilesmith When...</th>
                    <th>Use Sprite-Rite When...</th>
                </tr>
                <tr>
                    <td>Creating new tiles from scratch</td>
                    <td>Importing existing sprite assets</td>
                </tr>
                <tr>
                    <td>Using AI to generate tiles</td>
                    <td>Slicing up a downloaded spritesheet</td>
                </tr>
                <tr>
                    <td>Editing pixel-by-pixel</td>
                    <td>Defining regions in an image</td>
                </tr>
            </table>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Both tools publish to the same master sheet, so you can mix hand-drawn tiles with imported sprites in your game.
            </div>
        `
    },
    {
        id: 'exporting',
        title: 'Exporting & JSON',
        content: `
            <h1>Exporting & JSON</h1>
            <p>Export your sprite definitions for use in game engines or other tools.</p>

            <h2>Atlas JSON Format</h2>
            <p>Sprite-Rite generates a JSON atlas that describes all sprite positions:</p>

            <pre><code>{
  "frames": {
    "player_idle": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "player_run_1": {
      "frame": { "x": 32, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    }
  },
  "meta": {
    "image": "spritesheet.png",
    "size": { "w": 256, "h": 256 }
  }
}</code></pre>

            <h2>Export Options</h2>

            <h3>Copy to Clipboard</h3>
            <p>Click "Copy JSON" to copy the atlas data to your clipboard. Paste it into your game's asset configuration.</p>

            <h3>Download JSON File</h3>
            <p>Click "Export JSON" to download a <code>.json</code> file you can include in your game project.</p>

            <h3>Index Entry</h3>
            <p>Generate an index entry for static asset systems. Useful when organizing multiple spritesheets.</p>

            <h2>Using in Game Engines</h2>

            <h3>Phaser</h3>
            <pre><code>this.load.atlas('sprites', 'spritesheet.png', 'atlas.json');</code></pre>

            <h3>PixiJS</h3>
            <pre><code>await PIXI.Assets.load('atlas.json');</code></pre>

            <h3>Custom Engines</h3>
            <p>Parse the JSON and use the frame coordinates to render sprite regions from the source image.</p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                The JSON preview panel updates in real-time as you define sprites, so you can see exactly what will be exported.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Speed up your sprite definition workflow with these shortcuts.</p>

            <h2>Selection</h2>
            <ul>
                <li><kbd>Escape</kbd> - Cancel current selection</li>
                <li><kbd>Delete</kbd> - Delete selected sprite</li>
                <li><kbd>Enter</kbd> - Confirm and save selection</li>
            </ul>

            <h2>Navigation</h2>
            <ul>
                <li><kbd>+</kbd> / <kbd>-</kbd> - Zoom in/out</li>
                <li><kbd>0</kbd> - Reset zoom to fit</li>
                <li><kbd>G</kbd> - Toggle grid overlay</li>
            </ul>

            <h2>Actions</h2>
            <ul>
                <li><kbd>Ctrl</kbd>+<kbd>S</kbd> - Save current work</li>
                <li><kbd>Ctrl</kbd>+<kbd>C</kbd> - Copy JSON to clipboard</li>
                <li><kbd>?</kbd> - Toggle help panel</li>
            </ul>

            <h2>Selection Tips</h2>
            <ul>
                <li><strong>Shift + Drag</strong> - Constrain to square</li>
                <li><strong>Arrow Keys</strong> - Nudge selection by 1 pixel</li>
                <li><strong>Shift + Arrow</strong> - Nudge by 10 pixels</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Use the grid overlay with a size matching your sprite dimensions for quick, accurate selections.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPRITE_RITE_DOCS;
}

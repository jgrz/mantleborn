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
                    <strong>Log In & Select a Project</strong><br>
                    Log in to save your work to the cloud. Choose your project from the dropdown in the header.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Upload a Spritesheet</strong><br>
                    Select an existing spritesheet from the dropdown, or upload a new one. Supported formats: PNG, JPG, GIF, WebP.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Clean Up (Optional)</strong><br>
                    Use the Background Remover tool to remove solid backgrounds with one click.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Define Sprites</strong><br>
                    Use Auto-Detect to click on sprites and auto-select their bounds, or manually drag to create selections.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Name and Save</strong><br>
                    Give each sprite a name and click "Save Sprite". The sprite is automatically added to your project's master sheet.
                </div>
            </div>

            <h2>Interface Overview</h2>
            <ul>
                <li><strong>Canvas</strong> - Main area showing your spritesheet with zoom controls</li>
                <li><strong>Toolbar</strong> - Background Remover, Flip H, and Auto-Detect tools</li>
                <li><strong>Saved Sprites</strong> - Right panel showing sprites saved from this sheet</li>
                <li><strong>Selection Panel</strong> - Appears when creating a new sprite</li>
                <li><strong>Master Sheet Preview</strong> - Shows the combined master sheet with all sprites</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use Auto-Detect mode for quick sprite selection - just click on any sprite and it will automatically find its boundaries.
            </div>
        `
    },
    {
        id: 'tools',
        title: 'Tools',
        content: `
            <h1>Sprite-Rite Tools</h1>
            <p>Sprite-Rite includes powerful tools to speed up your workflow.</p>

            <h2>Background Remover</h2>
            <p>One-click background removal for spritesheets with solid color backgrounds.</p>

            <h3>How It Works</h3>
            <ol>
                <li>Click the <strong>Background Remover</strong> button in the toolbar</li>
                <li>The tool automatically detects the background color from the image corners</li>
                <li>All pixels matching that color become transparent</li>
                <li>The modified image is saved to the cloud automatically</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Best For</div>
                Spritesheets with solid color backgrounds (pink, green, white, etc.) commonly found in asset packs.
            </div>

            <h2>Flip Horizontal</h2>
            <p>Mirror your entire spritesheet horizontally. Essential for correcting sprite direction.</p>

            <h3>Why Flip?</h3>
            <p>Game development convention: <strong>all sprites should face right</strong>. Games flip sprites at runtime to show left-facing movement. If your sprites face left, use this tool to correct them.</p>

            <h3>How It Works</h3>
            <ol>
                <li>Click the <strong>Flip H</strong> button in the toolbar</li>
                <li>The entire spritesheet is mirrored horizontally</li>
                <li>If you have existing sprite definitions, you'll be asked to clear them (positions become invalid after flip)</li>
                <li>The modified image is saved to the cloud automatically</li>
            </ol>

            <div class="warning">
                <div class="warning-label">Note</div>
                Flipping invalidates any existing sprite definitions since their X positions are reversed. You'll need to redefine sprites after flipping.
            </div>

            <h2>Auto-Detect Sprites</h2>
            <p>Click on any sprite to automatically detect its boundaries using flood-fill detection.</p>

            <h3>How It Works</h3>
            <ol>
                <li>Click the <strong>Auto-Detect</strong> button to enter detection mode</li>
                <li>Click anywhere on a sprite in your spritesheet</li>
                <li>The tool finds all connected non-transparent pixels (the "island")</li>
                <li>A selection box is created around the detected sprite</li>
                <li>Name it and save!</li>
            </ol>

            <h3>Tips for Best Results</h3>
            <ul>
                <li>Run Background Remover first to ensure clean transparency</li>
                <li>Works best when sprites don't touch each other</li>
                <li>Click near the center of the sprite for best detection</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Note</div>
                If sprites are touching, they'll be detected as one island. Use manual selection for overlapping sprites.
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

            <h3>From Your Project</h3>
            <p>If you've previously uploaded spritesheets to this project, select them from the spritesheet dropdown.</p>

            <h3>Upload New</h3>
            <p>Click "Upload" to add a new spritesheet to your project. The image is stored in the cloud and linked to your project.</p>

            <h2>Image Recommendations</h2>
            <ul>
                <li><strong>Size</strong> - Recommended max: 2048x2048 for best performance</li>
                <li><strong>Resolution</strong> - Use pixel-perfect images for best results</li>
                <li><strong>Background</strong> - Solid colors work well with Background Remover</li>
            </ul>

            <h2>Working with Asset Packs</h2>
            <p>Many asset packs come with solid color backgrounds. Here's the workflow:</p>
            <ol>
                <li>Upload the spritesheet image</li>
                <li>Click Background Remover to make the background transparent</li>
                <li>Use Auto-Detect to quickly select each sprite</li>
                <li>Name and save each sprite definition</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Tip</div>
                The Background Remover saves the modified image, so you only need to remove the background once per spritesheet.
            </div>
        `
    },
    {
        id: 'defining-sprites',
        title: 'Defining Sprites',
        content: `
            <h1>Defining Sprites</h1>
            <p>Learn how to create precise sprite definitions from your spritesheet image.</p>

            <h2>Two Ways to Select</h2>

            <h3>Auto-Detect (Recommended)</h3>
            <ol>
                <li>Click the Auto-Detect button in the toolbar</li>
                <li>Click on any sprite in the image</li>
                <li>The selection automatically wraps the sprite</li>
            </ol>

            <h3>Manual Selection</h3>
            <ol>
                <li>Make sure Auto-Detect is off</li>
                <li>Click and drag on the canvas to create a selection</li>
                <li>Adjust the selection by dragging corners or edges</li>
            </ol>

            <h2>Naming Sprites</h2>
            <p>Good naming conventions make sprites easier to find and use:</p>
            <ul>
                <li>Use descriptive names: <code>player_idle</code>, <code>enemy_walk_1</code></li>
                <li>Include frame numbers for animations: <code>hero_run_01</code>, <code>hero_run_02</code></li>
                <li>Group related sprites with prefixes: <code>ui_button_normal</code>, <code>ui_button_hover</code></li>
            </ul>

            <h3>Auto-Naming</h3>
            <p>If you don't provide a name, Sprite-Rite generates one based on the spritesheet name and a sequential number.</p>

            <h2>Sprite Data</h2>
            <p>Each sprite definition stores:</p>
            <ul>
                <li><strong>Name</strong> - Unique identifier</li>
                <li><strong>X, Y</strong> - Position in the spritesheet (top-left corner)</li>
                <li><strong>Width, Height</strong> - Dimensions in pixels</li>
            </ul>

            <h2>Editing Existing Sprites</h2>
            <p>To modify a saved sprite:</p>
            <ol>
                <li>Click the sprite in the Sprite List panel</li>
                <li>The selection appears on the canvas</li>
                <li>Adjust position, size, or name</li>
                <li>Click "Save Sprite" to update</li>
            </ol>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Sprites defined here can be used in Incarnum for character creation.
            </div>
        `
    },
    {
        id: 'cloud-saving',
        title: 'Cloud Saving',
        content: `
            <h1>Cloud Saving</h1>
            <p>Your work is automatically saved to the cloud when you're logged in.</p>

            <h2>What Gets Saved</h2>
            <ul>
                <li><strong>Spritesheet Images</strong> - Uploaded to secure cloud storage</li>
                <li><strong>Sprite Definitions</strong> - Names, positions, and dimensions</li>
                <li><strong>Image Modifications</strong> - Background removal is saved to the image</li>
            </ul>

            <h2>Auto-Save</h2>
            <p>When logged in, changes are automatically saved after a short delay. You'll see a save indicator in the header.</p>

            <h2>Guest Mode</h2>
            <p>If you're not logged in:</p>
            <ul>
                <li>You can still use all tools</li>
                <li>Work is saved to browser local storage</li>
                <li>Data may be lost if you clear browser data</li>
                <li>Cannot access spritesheets across devices</li>
            </ul>

            <h2>Project Organization</h2>
            <p>Spritesheets are organized by project:</p>
            <ul>
                <li>Select a project to see its spritesheets</li>
                <li>Upload new sheets to add them to the current project</li>
                <li>Each project has its own collection of sprites</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Create your project in Crucible first, then select it in Sprite-Rite to start adding sprites.
            </div>
        `
    },
    {
        id: 'master-sheet',
        title: 'Master Sheet',
        content: `
            <h1>Master Sheet</h1>
            <p>Every project has a master spritesheet—a single combined image containing all your game's sprites.</p>

            <h2>How It Works</h2>
            <p>When you save a sprite in Sprite-Rite, it's automatically:</p>
            <ul>
                <li>Extracted from your source spritesheet</li>
                <li>Packed into the project's master sheet</li>
                <li>Added to the master sheet atlas (JSON data)</li>
            </ul>

            <h2>Master Sheet Preview</h2>
            <p>The right sidebar shows a preview of your master sheet with a count of total sprites. This updates in real-time as you save sprites.</p>

            <h2>Saved Sprites</h2>
            <p>When you select a spritesheet, any sprites you've already saved from it appear with green outlines. This prevents duplicate saves and shows your progress.</p>

            <h2>Atlas JSON Format</h2>
            <p>Click "Copy Atlas JSON" to copy the master sheet data:</p>

            <pre><code>{
  "size": { "w": 256, "h": 256 },
  "sprites": {
    "player_idle": { "x": 0, "y": 0, "w": 32, "h": 32 },
    "player_run_1": { "x": 33, "y": 0, "w": 32, "h": 32 }
  }
}</code></pre>

            <h2>Using in Other Tools</h2>
            <p>The master sheet is automatically available in:</p>
            <ul>
                <li><strong>Animancer</strong> - Create animations from master sheet sprites</li>
                <li><strong>Level Forge</strong> - Paint levels with master sheet sprites</li>
                <li><strong>Incarnum</strong> - Assign sprites to characters</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                You don't need to export anything—the master sheet is shared automatically across all Game Wizard tools.
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
                <li><kbd>Enter</kbd> - Confirm and save selection</li>
            </ul>

            <h2>Navigation</h2>
            <ul>
                <li><kbd>+</kbd> / <kbd>-</kbd> - Zoom in/out</li>
                <li><kbd>Scroll</kbd> - Pan around the canvas</li>
            </ul>

            <h2>Tools</h2>
            <ul>
                <li><kbd>A</kbd> - Toggle Auto-Detect mode</li>
            </ul>

            <h2>Actions</h2>
            <ul>
                <li><kbd>Ctrl/Cmd</kbd>+<kbd>S</kbd> - Save current work</li>
                <li><kbd>Ctrl/Cmd</kbd>+<kbd>C</kbd> - Copy JSON to clipboard</li>
                <li><kbd>?</kbd> - Toggle help panel</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Use Auto-Detect mode (A) for the fastest workflow when defining multiple sprites.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPRITE_RITE_DOCS;
}

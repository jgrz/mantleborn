/**
 * Tilesmith Documentation
 * Used by the Help Drawer component
 */

const TILESMITH_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Get up and running with Tilesmith in minutes. This guide covers the basics of creating your first tile.</p>

            <h2>Your First Tile</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose an existing project from the dropdown in the header, or create one in the Crucible of Code first.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Choose a Tool</strong><br>
                    The toolbar has your drawing tools: Pencil, Eraser, Fill, Color Picker, Line, and Rectangle.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Pick a Color</strong><br>
                    Click a color in the Palette panel or use the color picker to select your own.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Draw!</strong><br>
                    Click and drag on the canvas to draw. Use zoom controls to get closer to your work.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Save Your Tile</strong><br>
                    Give it a name in Tile Settings, then click "Save Tile" to store it in your project.
                </div>
            </div>

            <h2>Drawing Tools</h2>
            <ul>
                <li><strong>Pencil</strong> - Draw individual pixels</li>
                <li><strong>Eraser</strong> - Remove pixels (make transparent)</li>
                <li><strong>Fill</strong> - Fill an area with color</li>
                <li><strong>Picker</strong> - Sample a color from the canvas</li>
                <li><strong>Line</strong> - Draw straight lines</li>
                <li><strong>Rectangle</strong> - Draw rectangle outlines</li>
            </ul>

            <h2>Navigation</h2>
            <ul>
                <li><strong>Zoom</strong> - Use 1x to 16x buttons below the canvas</li>
                <li><strong>Grid</strong> - Toggle pixel grid visibility</li>
                <li><strong>Tile Borders</strong> - Show/hide tile boundaries (for multi-tile)</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use <kbd>Ctrl</kbd>+<kbd>Z</kbd> to undo and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> to redo.
            </div>
        `
    },
    {
        id: 'multi-tile',
        title: 'Multi-Tile',
        content: `
            <h1>Multi-Tile Tilesets</h1>
            <p>Create larger assets that span multiple tiles - perfect for trees, buildings, characters, and other objects that don't fit in a single tile.</p>

            <h2>When to Use Multi-Tile</h2>
            <p>Use the grid feature when creating:</p>
            <ul>
                <li>Trees (2x3 or 2x4 for tall trees)</li>
                <li>Buildings (3x3, 4x4, etc.)</li>
                <li>Large characters or bosses</li>
                <li>Vehicles or machines</li>
                <li>Any object larger than your base tile size</li>
            </ul>

            <h2>Setting Up a Grid</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Set Grid Dimensions</strong><br>
                    In the toolbar, find the "GRID" section. Enter your columns and rows (e.g., 2×2 for a 4-tile object).
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>View Tile Boundaries</strong><br>
                    Orange lines show where each tile begins and ends. The currently selected tile has a green border.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Select a Tile</strong><br>
                    Click the numbered buttons in the "TILE" section to switch between tiles, or click directly on the canvas area of the tile you want to edit.
                </div>
            </div>

            <h2>Working with Multiple Tiles</h2>

            <h3>Drawing Across Tiles</h3>
            <p>You can draw freely across the entire canvas - your strokes will affect whichever tile your cursor is over. This makes it easy to create seamless transitions between tiles.</p>

            <h3>Clearing Tiles</h3>
            <p>The trash icon clears only the <em>currently selected</em> tile, not the entire canvas. This lets you redo individual tiles without losing work on others.</p>

            <h3>Using AI Generation</h3>
            <p>When you generate a tile with AI, it will be applied to the currently selected tile position. You can generate different tiles for each position in your grid.</p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                For a tree: Set grid to 2×3, generate or draw the trunk in tiles 5-6 (bottom row), then the canopy in tiles 1-4 (top two rows).
            </div>

            <h2>Saving and Exporting</h2>
            <p>When you save a multi-tile tileset:</p>
            <ul>
                <li>The entire grid is saved as one asset</li>
                <li>Grid dimensions are stored in metadata</li>
                <li>Loading it later will restore the grid layout</li>
                <li>PNG export includes all tiles as one image</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Note</div>
                Changing the grid dimensions of an existing tileset may crop or expand your work. Consider saving before making grid changes.
            </div>
        `
    },
    {
        id: 'ai-generation',
        title: 'AI Generation',
        content: `
            <h1>AI Tile Generation</h1>
            <p>Tilesmith uses AI to generate actual pixel art tiles based on your parameters. The AI outputs pixel-by-pixel color data that you can apply directly to your canvas.</p>

            <h2>How It Works</h2>
            <p>When you click "Generate Tile":</p>
            <ol>
                <li>Your parameters are sent to our AI backend</li>
                <li>The AI generates a complete tile as pixel data</li>
                <li>A preview appears in the AI panel</li>
                <li>Click "Apply to Canvas" to use it</li>
            </ol>

            <h2>Parameters Explained</h2>

            <h3>Tile Type</h3>
            <p>The category of tile you're creating:</p>
            <ul>
                <li><strong>Terrain</strong> - Ground surfaces (grass, dirt, stone)</li>
                <li><strong>Structure</strong> - Buildings, walls, floors</li>
                <li><strong>Vegetation</strong> - Plants, trees, flowers</li>
                <li><strong>Water</strong> - Rivers, lakes, ocean</li>
                <li><strong>Path</strong> - Roads, trails, bridges</li>
                <li><strong>Decoration</strong> - Props, objects, details</li>
            </ul>

            <h3>Description</h3>
            <p>Be specific about what you want. Good examples:</p>
            <ul>
                <li>"lush green grass with small flowers"</li>
                <li>"cobblestone path with moss between stones"</li>
                <li>"wooden barrel with metal bands"</li>
            </ul>

            <h3>Art Style</h3>
            <ul>
                <li><strong>8-bit</strong> - Simple, limited colors (NES-like)</li>
                <li><strong>16-bit</strong> - More detail, richer colors (SNES-like)</li>
                <li><strong>32-bit</strong> - High detail, smooth gradients</li>
            </ul>

            <h3>Perspective</h3>
            <ul>
                <li><strong>Top-down</strong> - Looking straight down (RPGs, strategy)</li>
                <li><strong>Side view</strong> - Looking from the side (platformers)</li>
                <li><strong>Isometric</strong> - Angled 3/4 view</li>
            </ul>

            <h3>Shading Style</h3>
            <ul>
                <li><strong>Flat</strong> - Solid colors, no gradients</li>
                <li><strong>Dithered</strong> - Classic pixel art dithering</li>
                <li><strong>Soft gradient</strong> - Smooth color transitions</li>
            </ul>

            <h2>Tips for Good Results</h2>

            <div class="tip">
                <div class="tip-label">Be Specific</div>
                "Medieval stone wall with ivy" works better than just "wall".
            </div>

            <div class="tip">
                <div class="tip-label">Match Your Game</div>
                Use consistent art style, perspective, and biome settings across all tiles.
            </div>

            <div class="tip">
                <div class="tip-label">Apply the Palette</div>
                After generating, click "Apply Palette" to add the AI's colors to your palette for manual touch-ups.
            </div>

            <h2>Generation Queue</h2>
            <p>Track all your AI generation jobs in the queue panel (bottom-right corner):</p>
            <ul>
                <li><strong>⏳ Processing</strong> - Generation in progress</li>
                <li><strong>✅ Complete</strong> - Ready to apply</li>
                <li><strong>❌ Failed</strong> - Click Retry</li>
            </ul>

            <p>The queue is shared across all Game Wizard tools. Jobs started in other tools (Sprite-Rite, Incarnum, Level Forge) appear here too, so you can monitor all your generations from anywhere.</p>

            <h2>Limitations</h2>
            <ul>
                <li>Maximum size is 32×32 pixels per tile</li>
                <li>Results may need manual refinement</li>
                <li>Complex scenes work better as multi-tile</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Heads Up</div>
                AI generation requires an internet connection and may take a few seconds. The generated tile replaces only the currently selected tile in a multi-tile grid.
            </div>
        `
    },
    {
        id: 'palettes',
        title: 'Palettes',
        content: `
            <h1>Color Palettes</h1>
            <p>A cohesive color palette is essential for pixel art. Tilesmith includes preset palettes and lets you create custom ones.</p>

            <h2>Preset Palettes</h2>
            <p>Select from the dropdown in the Palette panel:</p>

            <h3>Game Boy (4 colors)</h3>
            <p>The classic green-tinted palette from the original Game Boy. Great for retro aesthetics and practicing with limited colors.</p>

            <h3>NES (16 colors)</h3>
            <p>Based on the Nintendo Entertainment System's color capabilities. Authentic 8-bit feel.</p>

            <h3>PICO-8 (16 colors)</h3>
            <p>The popular fantasy console palette. Well-balanced and versatile for any game style.</p>

            <h3>Lospec 16</h3>
            <p>A community-favorite general-purpose palette with good range.</p>

            <h3>ENDESGA 32 (32 colors)</h3>
            <p>A larger palette with excellent color variety. Good for detailed work.</p>

            <h2>Using Colors</h2>

            <h3>Selecting Colors</h3>
            <ul>
                <li>Click any swatch in the palette grid</li>
                <li>Use the color picker (large square) for custom colors</li>
                <li>Use the Picker tool <kbd>I</kbd> to sample from canvas</li>
            </ul>

            <h3>Managing Colors</h3>
            <ul>
                <li><strong>+ Add</strong> - Add your current color to the palette</li>
                <li><strong>- Remove</strong> - Remove the current color from palette</li>
            </ul>

            <h2>Custom Palettes</h2>
            <p>To create your own palette:</p>
            <ol>
                <li>Select "Custom Palette" from the dropdown</li>
                <li>Use the color picker to choose colors</li>
                <li>Click "+ Add" to add each color</li>
                <li>Your custom palette is saved with the tile</li>
            </ol>

            <h2>AI-Generated Palettes</h2>
            <p>When you generate a tile with AI, it includes a palette. Click "Apply Palette" to use those colors for your work.</p>

            <div class="tip">
                <div class="tip-label">Consistency Tip</div>
                Use the same palette across all tiles in your game for a cohesive look. Generate one tile, apply its palette, then use those colors for everything.
            </div>

            <h2>Palette Best Practices</h2>
            <ul>
                <li><strong>Limit yourself</strong> - Fewer colors often look better</li>
                <li><strong>Include darks and lights</strong> - You need both for shading</li>
                <li><strong>Test on multiple tiles</strong> - Make sure colors work together</li>
                <li><strong>Consider your biome</strong> - Forest? Use greens. Desert? Tans and oranges.</li>
            </ul>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Speed up your workflow with these keyboard shortcuts.</p>

            <h2>Tools</h2>
            <ul>
                <li><kbd>P</kbd> - Pencil</li>
                <li><kbd>E</kbd> - Eraser</li>
                <li><kbd>F</kbd> - Fill</li>
                <li><kbd>I</kbd> - Color Picker</li>
                <li><kbd>L</kbd> - Line</li>
                <li><kbd>R</kbd> - Rectangle</li>
            </ul>

            <h2>Actions</h2>
            <ul>
                <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> - Undo</li>
                <li><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> - Redo</li>
                <li><kbd>?</kbd> - Toggle this help panel</li>
                <li><kbd>Esc</kbd> - Close help panel</li>
            </ul>

            <h2>Drawing Tips</h2>
            <ul>
                <li><strong>Line tool</strong> - Click start point, drag to end</li>
                <li><strong>Rectangle</strong> - Click corner, drag to opposite corner</li>
                <li><strong>Fill</strong> - Fills connected pixels of the same color</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Right-click while drawing to erase, regardless of which tool is selected.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TILESMITH_DOCS;
}

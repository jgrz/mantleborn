/**
 * Mantleborn - Main Entry Point
 *
 * Initializes the game and handles the canvas setup.
 * Uses ES6 modules for clean separation of concerns.
 */

import { Game } from './game.js';

// Target resolution for the game (16:9 aspect ratio)
const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 180;

/**
 * Scales the canvas to fit the viewport while maintaining aspect ratio.
 * Uses integer scaling when possible for crisp pixel art.
 */
function resizeCanvas(canvas) {
    const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;
    const windowAspect = window.innerWidth / window.innerHeight;

    let scale;

    if (windowAspect > targetAspect) {
        // Window is wider than target - fit to height
        scale = window.innerHeight / TARGET_HEIGHT;
    } else {
        // Window is taller than target - fit to width
        scale = window.innerWidth / TARGET_WIDTH;
    }

    // Use integer scaling for crispest pixels when scale > 1
    if (scale > 1) {
        scale = Math.floor(scale);
    }

    canvas.style.width = `${TARGET_WIDTH * scale}px`;
    canvas.style.height = `${TARGET_HEIGHT * scale}px`;
}

/**
 * Main initialization function.
 * Sets up the canvas and starts the game.
 */
function init() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Set the internal resolution of the canvas
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    // Disable image smoothing for pixelated rendering
    ctx.imageSmoothingEnabled = false;

    // Initial resize and listen for window changes
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));

    // Create and start the game
    const game = new Game(canvas, ctx);
    game.start();
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

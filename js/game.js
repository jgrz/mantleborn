/**
 * Mantleborn - Game Core
 *
 * Handles the main game loop, state management, and screen transitions.
 * Uses requestAnimationFrame with delta time for consistent updates.
 */

import { StartScreen } from './screens/startScreen.js';
import { StoryScreen } from './screens/storyScreen.js';
import { PlayingScreen } from './screens/playingScreen.js';
import { Transition } from './utils/transition.js';

// Game states enum
export const GameState = {
    START: 'start',
    STORY: 'story',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

/**
 * Main Game class - orchestrates the game loop and state machine.
 */
export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;

        // State machine
        this.currentState = GameState.START;
        this.screens = {};

        // Timing
        this.lastTime = 0;
        this.running = false;

        // Input tracking
        this.inputEnabled = true;

        // Transition system for smooth screen changes
        this.transition = new Transition(this);

        this.initScreens();
        this.setupInput();
    }

    /**
     * Initialize all game screens.
     * Each screen handles its own update and render logic.
     */
    initScreens() {
        this.screens[GameState.START] = new StartScreen(this);
        this.screens[GameState.STORY] = new StoryScreen(this);
        this.screens[GameState.PLAYING] = new PlayingScreen(this);
        // Future screens will be added here:
        // this.screens[GameState.PAUSED] = new PausedScreen(this);
        // this.screens[GameState.GAME_OVER] = new GameOverScreen(this);
    }

    /**
     * Set up global input handlers.
     * Individual screens can also have their own input handling.
     */
    setupInput() {
        // Keyboard input - keydown
        window.addEventListener('keydown', (e) => {
            if (!this.inputEnabled) return;

            // Prevent default for game keys (arrows, space)
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
                e.preventDefault();
            }

            this.handleInput('keydown', e);

            // Route to screen's continuous input handler if available
            const currentScreen = this.screens[this.currentState];
            if (currentScreen && currentScreen.handleKeyDown) {
                currentScreen.handleKeyDown(e.key);
            }
        });

        // Keyboard input - keyup (for continuous movement)
        window.addEventListener('keyup', (e) => {
            const currentScreen = this.screens[this.currentState];
            if (currentScreen && currentScreen.handleKeyUp) {
                currentScreen.handleKeyUp(e.key);
            }
        });

        // Mouse/touch input
        this.canvas.addEventListener('click', (e) => {
            if (!this.inputEnabled) return;
            this.handleInput('click', e);
        });

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.inputEnabled) return;
            e.preventDefault();
            this.handleInput('click', e);
        });
    }

    /**
     * Route input events to the current screen.
     */
    handleInput(type, event) {
        const currentScreen = this.screens[this.currentState];
        if (currentScreen && currentScreen.handleInput) {
            currentScreen.handleInput(type, event);
        }
    }

    /**
     * Transition to a new game state.
     */
    setState(newState) {
        const oldScreen = this.screens[this.currentState];
        if (oldScreen && oldScreen.onExit) {
            oldScreen.onExit();
        }

        this.currentState = newState;

        const newScreen = this.screens[newState];
        if (newScreen && newScreen.onEnter) {
            newScreen.onEnter();
        }
    }

    /**
     * Start the game loop.
     */
    start() {
        this.running = true;
        this.lastTime = performance.now();

        // Enter the initial screen
        const startScreen = this.screens[this.currentState];
        if (startScreen && startScreen.onEnter) {
            startScreen.onEnter();
        }

        requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Main game loop using requestAnimationFrame.
     * Calculates delta time for frame-independent updates.
     */
    loop(currentTime) {
        if (!this.running) return;

        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, 0.1);

        this.update(cappedDelta);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Update the current screen and transitions.
     */
    update(dt) {
        // Update transition
        this.transition.update(dt);

        const currentScreen = this.screens[this.currentState];
        if (currentScreen && currentScreen.update) {
            currentScreen.update(dt);
        }
    }

    /**
     * Render the current screen and transition overlay.
     */
    render() {
        // Clear the canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const currentScreen = this.screens[this.currentState];
        if (currentScreen && currentScreen.render) {
            currentScreen.render(this.ctx);
        }

        // Render transition overlay last (on top of everything)
        this.transition.render(this.ctx);
    }

    /**
     * Stop the game loop.
     */
    stop() {
        this.running = false;
    }
}

/**
 * Mantleborn - Start Screen
 *
 * Displays the game title with atmospheric animations including:
 * - Flickering torchlight effect on the title
 * - Floating ember particles
 * - Pulsing "Press any key" prompt
 */

import { GameState } from '../game.js';

// Color palette - dark atmospheric tones
const COLORS = {
    background: '#0a0a0f',
    titleBase: '#ff6b35',      // Warm orange
    titleGlow: '#ffa366',      // Lighter orange for glow
    titleShadow: '#8b2500',    // Deep red-brown shadow
    particle: '#ff9f43',       // Ember orange
    particleGlow: '#ffcc80',   // Bright ember
    prompt: '#9d8cff',         // Soft purple
    promptDim: '#4a4070',      // Dimmed purple
    stone: '#2d2d3a',          // Stone gray
    stoneLight: '#3d3d4a'      // Lighter stone
};

/**
 * Particle class for floating ember effects.
 */
class Particle {
    constructor(x, y, width, height) {
        this.reset(x, y, width, height);
    }

    reset(x, y, width, height) {
        this.x = x || Math.random() * width;
        this.y = y || height + 5;
        this.width = width;
        this.height = height;
        this.size = Math.random() * 2 + 1;
        this.speedY = -(Math.random() * 15 + 10);
        this.speedX = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.3 + 0.2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 3 + 1;
    }

    update(dt) {
        this.wobble += this.wobbleSpeed * dt;
        this.x += this.speedX * dt + Math.sin(this.wobble) * 0.5;
        this.y += this.speedY * dt;
        this.life -= this.decay * dt;

        // Reset when dead or off screen
        if (this.life <= 0 || this.y < -10) {
            this.reset(null, null, this.width, this.height);
        }
    }

    render(ctx) {
        const alpha = this.life * 0.8;
        const glowSize = this.size * 2;

        // Outer glow
        ctx.fillStyle = `rgba(255, 159, 67, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 204, 128, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * StartScreen - The main menu screen.
 */
export class StartScreen {
    constructor(game) {
        this.game = game;
        this.width = game.width;
        this.height = game.height;

        // Animation timers
        this.time = 0;
        this.flickerTimer = 0;
        this.flickerIntensity = 1;

        // Prompt animation
        this.promptAlpha = 0;
        this.promptFadeIn = true;

        // Particles
        this.particles = [];
        this.initParticles();

        // Title position
        this.titleY = this.height * 0.35;

        // Prevent immediate input after entering screen
        this.inputCooldown = 0.5;
    }

    /**
     * Initialize the particle system.
     */
    initParticles() {
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle(
                Math.random() * this.width,
                Math.random() * this.height,
                this.width,
                this.height
            );
            // Randomize initial life for variety
            particle.life = Math.random();
            this.particles.push(particle);
        }
    }

    /**
     * Called when entering this screen.
     */
    onEnter() {
        this.time = 0;
        this.inputCooldown = 0.5;
    }

    /**
     * Called when exiting this screen.
     */
    onExit() {
        // Cleanup if needed
    }

    /**
     * Handle input events.
     */
    handleInput(type, event) {
        if (this.inputCooldown > 0) return;

        if (type === 'keydown' || type === 'click') {
            // Transition to playing state (placeholder for now)
            // this.game.setState(GameState.PLAYING);
            console.log('Game starting... (Playing screen not yet implemented)');
        }
    }

    /**
     * Update animations.
     */
    update(dt) {
        this.time += dt;

        // Input cooldown
        if (this.inputCooldown > 0) {
            this.inputCooldown -= dt;
        }

        // Torchlight flicker effect
        this.flickerTimer += dt;
        if (this.flickerTimer > 0.05) {
            this.flickerTimer = 0;
            // Random flicker with occasional brighter flashes
            this.flickerIntensity = 0.85 + Math.random() * 0.15;
            if (Math.random() < 0.1) {
                this.flickerIntensity = 1.1;
            }
        }

        // Prompt fade animation
        const fadeSpeed = 1.5;
        if (this.promptFadeIn) {
            this.promptAlpha += fadeSpeed * dt;
            if (this.promptAlpha >= 1) {
                this.promptAlpha = 1;
                this.promptFadeIn = false;
            }
        } else {
            this.promptAlpha -= fadeSpeed * dt;
            if (this.promptAlpha <= 0.3) {
                this.promptAlpha = 0.3;
                this.promptFadeIn = true;
            }
        }

        // Update particles
        for (const particle of this.particles) {
            particle.update(dt);
        }
    }

    /**
     * Render the start screen.
     */
    render(ctx) {
        // Background gradient (subtle vignette effect)
        this.renderBackground(ctx);

        // Render particles behind title
        for (const particle of this.particles) {
            particle.render(ctx);
        }

        // Render title with effects
        this.renderTitle(ctx);

        // Render prompt
        this.renderPrompt(ctx);

        // Subtle stone floor hint at bottom
        this.renderFloorHint(ctx);
    }

    /**
     * Render the background with vignette effect.
     */
    renderBackground(ctx) {
        // Base fill
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, this.width, this.height);

        // Subtle radial gradient for vignette
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(30, 20, 40, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Render the game title with torchlight flicker.
     */
    renderTitle(ctx) {
        const title = 'MANTLEBORN';
        const titleX = this.width / 2;
        const titleY = this.titleY;

        // Configure font - pixel-style
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px monospace';

        // Calculate flicker-adjusted colors
        const flicker = this.flickerIntensity;

        // Outer glow (larger, more diffuse)
        ctx.shadowColor = `rgba(255, 107, 53, ${0.6 * flicker})`;
        ctx.shadowBlur = 20 * flicker;
        ctx.fillStyle = COLORS.titleShadow;
        ctx.fillText(title, titleX, titleY + 2);

        // Main title with glow
        ctx.shadowColor = `rgba(255, 163, 102, ${0.8 * flicker})`;
        ctx.shadowBlur = 10 * flicker;
        ctx.fillStyle = COLORS.titleBase;
        ctx.fillText(title, titleX, titleY);

        // Bright overlay for highlight effect
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 200, 150, ${0.3 * flicker})`;
        ctx.fillText(title, titleX, titleY - 1);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = '8px monospace';
        ctx.fillStyle = COLORS.stone;
        const pulse = 0.5 + Math.sin(this.time * 2) * 0.2;
        ctx.fillStyle = `rgba(100, 90, 120, ${pulse})`;
        ctx.fillText('From the depths, a hero rises', titleX, titleY + 20);
    }

    /**
     * Render the "Press any key" prompt.
     */
    renderPrompt(ctx) {
        const promptY = this.height * 0.75;

        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Interpolate color based on alpha
        const r = Math.round(157 * this.promptAlpha + 74 * (1 - this.promptAlpha));
        const g = Math.round(140 * this.promptAlpha + 64 * (1 - this.promptAlpha));
        const b = Math.round(255 * this.promptAlpha + 112 * (1 - this.promptAlpha));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillText('- Press any key to start -', this.width / 2, promptY);
    }

    /**
     * Render a subtle stone floor hint at the bottom.
     */
    renderFloorHint(ctx) {
        const y = this.height - 8;

        // Simple stone pattern
        ctx.fillStyle = COLORS.stone;
        for (let x = 0; x < this.width; x += 16) {
            const offset = (x / 16) % 2 === 0 ? 0 : 4;
            ctx.fillRect(x, y + offset, 14, 2);
        }

        // Slight highlight on top edge
        ctx.fillStyle = COLORS.stoneLight;
        for (let x = 0; x < this.width; x += 16) {
            const offset = (x / 16) % 2 === 0 ? 0 : 4;
            ctx.fillRect(x, y + offset, 14, 1);
        }
    }
}

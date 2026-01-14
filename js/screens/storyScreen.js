/**
 * Mantleborn - Story Screen
 *
 * Displays narrative text with a typewriter effect.
 * Transitions from start screen with atmospheric presentation.
 */

import { GameState } from '../game.js';

// Color palette - matching the atmospheric theme
const COLORS = {
    background: '#0a0a0f',
    textPrimary: '#c9b8a0',     // Warm parchment color
    textGlow: '#e8d9c0',        // Lighter for emphasis
    textShadow: '#2a2520',      // Subtle shadow
    prompt: '#9d8cff',          // Soft purple (matching start screen)
    promptDim: '#4a4070'        // Dimmed purple
};

/**
 * StoryScreen - Displays narrative text with typewriter effect.
 */
export class StoryScreen {
    constructor(game) {
        this.game = game;
        this.width = game.width;
        this.height = game.height;

        // Story text to display
        this.storyText = 'Many grains have been pulled from the future. The sands of time never stop.';

        // Typewriter state
        this.displayedChars = 0;
        this.charTimer = 0;
        this.charDelay = 0.05;  // Seconds between characters
        this.textComplete = false;

        // Continue prompt
        this.promptVisible = false;
        this.promptAlpha = 0;
        this.promptFadeIn = true;
        this.promptDelay = 0.5;  // Delay after text completes before showing prompt
        this.promptTimer = 0;

        // Animation
        this.time = 0;

        // Input cooldown
        this.inputCooldown = 0;

        // Ambient particles (subtle dust motes)
        this.particles = [];
        this.initParticles();
    }

    /**
     * Initialize subtle ambient particles.
     */
    initParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1 + 0.5,
                speedX: (Math.random() - 0.5) * 3,
                speedY: (Math.random() - 0.5) * 2,
                alpha: Math.random() * 0.3 + 0.1,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Called when entering this screen.
     */
    onEnter() {
        this.time = 0;
        this.displayedChars = 0;
        this.charTimer = 0;
        this.textComplete = false;
        this.promptVisible = false;
        this.promptAlpha = 0;
        this.promptTimer = 0;
        this.inputCooldown = 0.3;
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
            if (!this.textComplete) {
                // Skip to end of text
                this.displayedChars = this.storyText.length;
                this.textComplete = true;
            } else if (this.promptVisible) {
                // Transition to next state (placeholder - will be playing state)
                this.game.transition.start(GameState.PLAYING, {
                    fadeOut: 0.5,
                    hold: 0.3,
                    fadeIn: 0.5
                });
            }
        }
    }

    /**
     * Update animations and typewriter effect.
     */
    update(dt) {
        this.time += dt;

        // Input cooldown
        if (this.inputCooldown > 0) {
            this.inputCooldown -= dt;
        }

        // Typewriter effect
        if (!this.textComplete) {
            this.charTimer += dt;
            if (this.charTimer >= this.charDelay) {
                this.charTimer = 0;
                this.displayedChars++;

                if (this.displayedChars >= this.storyText.length) {
                    this.textComplete = true;
                    this.promptTimer = 0;
                }
            }
        }

        // Show prompt after delay once text is complete
        if (this.textComplete && !this.promptVisible) {
            this.promptTimer += dt;
            if (this.promptTimer >= this.promptDelay) {
                this.promptVisible = true;
            }
        }

        // Animate prompt
        if (this.promptVisible) {
            const fadeSpeed = 2;
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
        }

        // Update ambient particles
        for (const p of this.particles) {
            p.wobble += dt;
            p.x += p.speedX * dt + Math.sin(p.wobble) * 0.2;
            p.y += p.speedY * dt;

            // Wrap around screen
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
        }
    }

    /**
     * Render the story screen.
     */
    render(ctx) {
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.renderText(ctx);
        this.renderPrompt(ctx);
    }

    /**
     * Render the background with subtle vignette.
     */
    renderBackground(ctx) {
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, this.width, this.height);

        // Vignette
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width * 0.8
        );
        gradient.addColorStop(0, 'rgba(20, 15, 25, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Render ambient dust particles.
     */
    renderParticles(ctx) {
        for (const p of this.particles) {
            ctx.fillStyle = `rgba(200, 180, 160, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Render the story text with typewriter effect.
     */
    renderText(ctx) {
        const text = this.storyText.substring(0, this.displayedChars);

        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap the text
        const maxWidth = this.width - 40;
        const lines = this.wrapText(ctx, text, maxWidth);
        const lineHeight = 12;
        const startY = this.height / 2 - (lines.length * lineHeight) / 2;

        // Subtle glow effect
        ctx.shadowColor = 'rgba(200, 180, 160, 0.5)';
        ctx.shadowBlur = 4;

        // Render each line
        ctx.fillStyle = COLORS.textPrimary;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], this.width / 2, startY + i * lineHeight);
        }

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Blinking cursor at end
        if (!this.textComplete && Math.floor(this.time * 3) % 2 === 0) {
            const lastLine = lines[lines.length - 1] || '';
            const cursorX = this.width / 2 + ctx.measureText(lastLine).width / 2 + 2;
            const cursorY = startY + (lines.length - 1) * lineHeight;
            ctx.fillStyle = COLORS.textGlow;
            ctx.fillRect(cursorX, cursorY - 3, 1, 6);
        }
    }

    /**
     * Word wrap text to fit within maxWidth.
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * Render the continue prompt.
     */
    renderPrompt(ctx) {
        if (!this.promptVisible) return;

        const promptY = this.height * 0.85;

        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Interpolate color based on alpha
        const r = Math.round(157 * this.promptAlpha + 74 * (1 - this.promptAlpha));
        const g = Math.round(140 * this.promptAlpha + 64 * (1 - this.promptAlpha));
        const b = Math.round(255 * this.promptAlpha + 112 * (1 - this.promptAlpha));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillText('- Continue -', this.width / 2, promptY);
    }
}

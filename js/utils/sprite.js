/**
 * Mantleborn - Sprite System
 *
 * Handles sprite sheet loading, frame management, and animations.
 */

/**
 * SpriteSheet class - loads and manages a sprite sheet with frame data
 */
export class SpriteSheet {
    constructor() {
        this.image = null;
        this.frames = {};
        this.animations = {};
        this.scale = 1;
        this.loaded = false;
    }

    /**
     * Load sprite sheet from JSON definition
     * @param {string} jsonPath - Path to the JSON sprite definition
     * @returns {Promise} Resolves when loaded
     */
    async load(jsonPath) {
        const response = await fetch(jsonPath);
        const data = await response.json();

        // Load the image
        const basePath = jsonPath.substring(0, jsonPath.lastIndexOf('/') + 1);
        this.image = new Image();

        return new Promise((resolve, reject) => {
            this.image.onload = () => {
                this.frames = data.frames;
                this.animations = data.animations || {};
                this.scale = data.scale || 1;
                this.loaded = true;
                resolve(this);
            };
            this.image.onerror = reject;
            this.image.src = basePath + data.image;
        });
    }

    /**
     * Get a frame by name
     */
    getFrame(name) {
        return this.frames[name] || null;
    }

    /**
     * Get scaled dimensions of a frame
     */
    getScaledSize(frameName) {
        const frame = this.frames[frameName];
        if (!frame) return { w: 0, h: 0 };
        return {
            w: Math.round(frame.w * this.scale),
            h: Math.round(frame.h * this.scale)
        };
    }
}

/**
 * Animator class - handles sprite animation playback
 */
export class Animator {
    constructor(spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.currentAnimation = null;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
        this.playing = true;
    }

    /**
     * Play an animation by name
     */
    play(animationName) {
        if (this.currentAnimation === animationName) return;

        const anim = this.spriteSheet.animations[animationName];
        if (!anim) {
            console.warn(`Animation '${animationName}' not found`);
            return;
        }

        this.currentAnimation = animationName;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
        this.playing = true;
    }

    /**
     * Update the animation
     */
    update(dt) {
        if (!this.playing || !this.currentAnimation) return;

        const anim = this.spriteSheet.animations[this.currentAnimation];
        if (!anim) return;

        this.frameTimer += dt;

        if (this.frameTimer >= anim.frameDuration) {
            this.frameTimer = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % anim.frames.length;
        }
    }

    /**
     * Get the current frame data
     */
    getCurrentFrame() {
        if (!this.currentAnimation) return null;

        const anim = this.spriteSheet.animations[this.currentAnimation];
        if (!anim) return null;

        const frameName = anim.frames[this.currentFrameIndex];
        return this.spriteSheet.getFrame(frameName);
    }

    /**
     * Draw the current frame
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - Destination X
     * @param {number} y - Destination Y
     * @param {boolean} flipX - Flip horizontally
     * @param {number} scaleX - Additional X scale (for squash/stretch)
     * @param {number} scaleY - Additional Y scale (for squash/stretch)
     */
    draw(ctx, x, y, flipX = false, scaleX = 1, scaleY = 1) {
        if (!this.spriteSheet.loaded) return;

        const frame = this.getCurrentFrame();
        if (!frame) return;

        const scale = this.spriteSheet.scale;
        const destW = Math.round(frame.w * scale);
        const destH = Math.round(frame.h * scale);

        // Round to whole pixels to prevent jitter
        x = Math.round(x);
        y = Math.round(y);

        ctx.save();

        if (flipX) {
            ctx.translate(x + destW, y);
            ctx.scale(-1, 1);
            x = 0;
            y = 0;
        }

        // Apply squash/stretch from center-bottom
        if (scaleX !== 1 || scaleY !== 1) {
            const centerX = flipX ? destW / 2 : x + destW / 2;
            const bottomY = flipX ? destH : y + destH;
            ctx.translate(centerX, bottomY);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-centerX, -bottomY);
        }

        ctx.drawImage(
            this.spriteSheet.image,
            frame.x, frame.y, frame.w, frame.h,  // Source
            flipX ? 0 : x, flipX ? 0 : y, frame.w * scale, frame.h * scale  // Dest
        );

        ctx.restore();
    }
}

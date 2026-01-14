/**
 * Mantleborn - Playing Screen
 *
 * Side-scrolling room with advanced platforming mechanics.
 *
 * Controls:
 * - Left/Right: Move
 * - Space/Up/W: Jump (press again in air for Double Jump)
 * - Shift: Dash
 * - Down (in air): Ground Pound
 * - Touch wall while airborne: Wall Slide, then Jump to Wall Jump
 * - Approach ledge from below: Auto Mantle
 */

import { GameState } from '../game.js';
import { SpriteSheet, Animator } from '../utils/sprite.js';

// Color palette
const COLORS = {
    background: '#0a0a0f',
    backgroundMid: '#12121a',
    player: '#e8a840',
    playerOutline: '#b87820',
    playerDash: '#ffcc66',
    floor: '#2d2d3a',
    floorHighlight: '#3d3d4a',
    floorDark: '#1d1d2a',
    wall: '#252530',
    wallHighlight: '#353545',
    platform: '#2a2a38',
    platformHighlight: '#3a3a48',
    tutorial: '#9d8cff',
    tutorialDim: '#6a5aaa',
    vine: '#3d6b3d',
    vineLight: '#4a8a4a',
    vineDark: '#2d4a2d',
    vineLeaf: '#5a9a5a',
    pogo: '#7a5c3a',
    pogoLight: '#9a7c5a',
    pogoDark: '#5a3c2a',
    pogoSpring: '#aaaaaa',
    pogoTip: '#cc4444',
    particle: '#ffaa44',
    particleGlow: '#ffdd88'
};

// Physics constants
const GRAVITY = 600;
const PLAYER_SPEED = 80;
const JUMP_FORCE = -200;
const FRICTION = 0.85;

// Mechanic constants
const DASH_SPEED = 250;
const DASH_DURATION = 0.15;
const DASH_COOLDOWN = 0.4;
const WALL_SLIDE_SPEED = 40;
const WALL_JUMP_FORCE_X = 120;
const WALL_JUMP_FORCE_Y = -180;
const DOUBLE_JUMP_FORCE = -180;
const GROUND_POUND_SPEED = 350;
const MANTLE_DURATION = 0.2;

// Pogo constants
const POGO_BOUNCE_FORCE = -180;
const POGO_COMBO_WINDOW = 0.15;  // Seconds to time the jump
const POGO_COMBO_BONUS = 0.10;   // 10% boost per combo
const POGO_MAX_COMBO = 5;        // Max combo multiplier (50% bonus)
const POGO_IDLE_BOUNCE_INTERVAL = 0.6;  // Auto-bounce when idle

/**
 * Particle class for impact effects
 */
class Particle {
    constructor(x, y, vx, vy, life, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 200 * dt; // Gravity on particles
        this.life -= dt;
        return this.life > 0;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

/**
 * ParticleSystem - manages particle effects
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, config = {}) {
        const {
            speedMin = 30,
            speedMax = 80,
            angleMin = -Math.PI,
            angleMax = 0,
            lifeMin = 0.3,
            lifeMax = 0.6,
            sizeMin = 1,
            sizeMax = 3,
            colors = [COLORS.particle, COLORS.particleGlow]
        } = config;

        for (let i = 0; i < count; i++) {
            const angle = angleMin + Math.random() * (angleMax - angleMin);
            const speed = speedMin + Math.random() * (speedMax - speedMin);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = lifeMin + Math.random() * (lifeMax - lifeMin);
            const size = sizeMin + Math.random() * (sizeMax - sizeMin);
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(x, y, vx, vy, life, size, color));
        }
    }

    update(dt) {
        this.particles = this.particles.filter(p => p.update(dt));
    }

    render(ctx, cameraX) {
        ctx.save();
        ctx.translate(-cameraX, 0);
        for (const p of this.particles) {
            p.render(ctx);
        }
        ctx.restore();
    }
}

/**
 * Player class - handles movement, physics, and rendering.
 */
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 16;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;

        // Animation
        this.facing = 1; // 1 = right, -1 = left
        this.animTime = 0;
        this.isMoving = false;

        // Mechanic states
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;

        this.isWallSliding = false;
        this.wallDirection = 0; // -1 left wall, 1 right wall

        this.isGroundPounding = false;
        this.groundPoundLanding = false;
        this.groundPoundTimer = 0;

        this.isMantling = false;
        this.mantleTimer = 0;
        this.mantleTargetY = 0;
        this.mantleStartY = 0;

        // Track which mechanics have been used (for tutorial)
        this.usedMechanics = {
            move: false,
            jump: false,
            doubleJump: false,
            dash: false,
            wallSlide: false,
            wallJump: false,
            groundPound: false,
            mantle: false,
            pogo: false,
            pogoCombo: false
        };

        // Pogo stick state
        this.hasPogo = false;
        this.onPogo = false;
        this.pogoCombo = 0;
        this.pogoIdleTimer = 0;
        this.pogoJumpWindow = 0;      // Time window to press jump for combo
        this.pogoWaitingForInput = false;
        this.pogoSquash = 0;          // Visual squash on landing (0-1)

        // Reference to particle system (set by PlayingScreen)
        this.particles = null;

        // Sprite animation (set by PlayingScreen after sprite loads)
        this.animator = null;
        // Offset to center 54px wide sprite on 12px collision box: (12-54)/2 = -21
        // Offset to align 90px tall sprite bottom with 16px collision box bottom: 16-90 = -74
        this.spriteOffsetX = -21;
        this.spriteOffsetY = -74;
    }

    /**
     * Set the animator for sprite rendering
     */
    setAnimator(animator) {
        this.animator = animator;
    }

    /**
     * Determine which animation to play based on state
     */
    updateAnimation() {
        if (!this.animator) return;

        if (this.isGroundPounding || this.groundPoundLanding) {
            this.animator.play('duck');
        } else if (!this.onGround) {
            if (this.vy < 0) {
                this.animator.play('jump');
            } else {
                this.animator.play('fall');
            }
        } else if (this.isMoving) {
            this.animator.play('walk');
        } else {
            this.animator.play('idle');
        }
    }

    mountPogo() {
        if (this.hasPogo && !this.onPogo) {
            this.onPogo = true;
            this.pogoCombo = 0;
            this.pogoIdleTimer = 0;
            this.usedMechanics.pogo = true;
        }
    }

    dismountPogo() {
        this.onPogo = false;
        this.pogoCombo = 0;
    }

    update(dt, input, room) {
        // Handle mantling (locks out other movement)
        if (this.isMantling) {
            this.updateMantle(dt);
            return;
        }

        // Handle ground pound landing freeze
        if (this.groundPoundLanding) {
            this.groundPoundTimer -= dt;
            if (this.groundPoundTimer <= 0) {
                this.groundPoundLanding = false;
            }
            return;
        }

        // Dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
        }

        // Pogo squash animation decay
        if (this.pogoSquash > 0) {
            this.pogoSquash -= dt * 8;
            if (this.pogoSquash < 0) this.pogoSquash = 0;
        }

        // Pogo jump window countdown
        if (this.pogoJumpWindow > 0) {
            this.pogoJumpWindow -= dt;
            if (this.pogoJumpWindow <= 0) {
                // Missed the combo window - auto bounce with reset combo
                if (this.onPogo && this.onGround && !this.isMoving) {
                    this.pogoCombo = 0;
                    this.doPogoBounce();
                }
                this.pogoWaitingForInput = false;
            }
        }

        // Pogo idle bounce timer (when standing still on pogo)
        if (this.onPogo && this.onGround && !this.pogoWaitingForInput) {
            if (!this.isMoving && !input.left && !input.right) {
                this.pogoIdleTimer += dt;
                if (this.pogoIdleTimer >= POGO_IDLE_BOUNCE_INTERVAL) {
                    this.pogoIdleTimer = 0;
                    this.doPogoBounce();
                }
            } else {
                this.pogoIdleTimer = 0;
            }
        }

        // Handle dashing
        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
            // During dash, just move horizontally
            this.x += this.vx * dt;
            this.collideHorizontal(room);
            return;
        }

        // Check for wall sliding
        this.isWallSliding = false;
        if (!this.onGround && (input.left || input.right)) {
            const touchingWall = this.checkWallTouch(room);
            if (touchingWall !== 0 && this.vy > 0) {
                this.isWallSliding = true;
                this.wallDirection = touchingWall;
                this.vy = WALL_SLIDE_SPEED;
                this.usedMechanics.wallSlide = true;
            }
        }

        // Horizontal movement (disabled during ground pound)
        this.isMoving = false;
        if (!this.isGroundPounding) {
            if (input.left) {
                this.vx = -PLAYER_SPEED;
                this.facing = -1;
                this.isMoving = true;
                this.usedMechanics.move = true;
            } else if (input.right) {
                this.vx = PLAYER_SPEED;
                this.facing = 1;
                this.isMoving = true;
                this.usedMechanics.move = true;
            } else {
                this.vx *= FRICTION;
                if (Math.abs(this.vx) < 1) this.vx = 0;
            }
        }

        // Dash initiation
        if (input.dash && this.dashCooldown <= 0 && !this.isGroundPounding) {
            this.isDashing = true;
            this.dashTimer = DASH_DURATION;
            this.dashCooldown = DASH_COOLDOWN;
            this.vx = DASH_SPEED * this.facing;
            this.vy = 0;
            this.usedMechanics.dash = true;
            return;
        }

        // Jump / Double Jump / Wall Jump / Pogo Bounce
        if (input.jump) {
            if (this.isWallSliding) {
                // Wall jump
                this.vx = WALL_JUMP_FORCE_X * -this.wallDirection;
                this.vy = WALL_JUMP_FORCE_Y;
                this.facing = -this.wallDirection;
                this.isWallSliding = false;
                this.hasDoubleJumped = false; // Wall jump resets double jump
                this.usedMechanics.wallJump = true;
                if (this.onPogo) this.dismountPogo(); // Dismount on wall jump
            } else if (this.onPogo && this.onGround) {
                // Pogo bounce with combo timing
                if (this.pogoWaitingForInput && this.pogoJumpWindow > 0) {
                    // Perfect timing! Increase combo
                    this.pogoCombo = Math.min(this.pogoCombo + 1, POGO_MAX_COMBO);
                    if (this.pogoCombo >= 2) {
                        this.usedMechanics.pogoCombo = true;
                    }
                }
                this.doPogoBounce();
                this.pogoWaitingForInput = false;
                this.pogoJumpWindow = 0;
            } else if (this.onGround) {
                // Normal jump
                this.vy = JUMP_FORCE;
                this.onGround = false;
                this.canDoubleJump = true;
                this.hasDoubleJumped = false;
                this.usedMechanics.jump = true;
            } else if (this.canDoubleJump && !this.hasDoubleJumped && !this.isGroundPounding) {
                // Double jump
                this.vy = DOUBLE_JUMP_FORCE;
                this.hasDoubleJumped = true;
                this.usedMechanics.doubleJump = true;
            }
        }

        // Toggle pogo mount/dismount with down key when on ground
        if (input.down && this.onGround && this.hasPogo && !this.isGroundPounding) {
            if (this.onPogo) {
                this.dismountPogo();
            } else {
                this.mountPogo();
            }
        }

        // Ground pound initiation
        if (input.down && !this.onGround && !this.isGroundPounding && !this.isWallSliding) {
            this.isGroundPounding = true;
            this.vy = GROUND_POUND_SPEED;
            this.vx = 0;
            this.usedMechanics.groundPound = true;
        }

        // Apply gravity (reduced during wall slide)
        if (!this.isGroundPounding) {
            if (this.isWallSliding) {
                // Gravity already handled by wall slide speed
            } else {
                this.vy += GRAVITY * dt;
            }
        }

        // Move and collide
        this.x += this.vx * dt;
        this.collideHorizontal(room);

        this.y += this.vy * dt;
        this.collideVertical(room);

        // Check for mantle opportunity
        if (!this.onGround && this.vy > 0) {
            this.checkMantle(room);
        }

        // Animation timer (legacy, for non-sprite rendering)
        if (this.isMoving) {
            this.animTime += dt * 8;
        } else {
            this.animTime = 0;
        }

        // Update sprite animation
        this.updateAnimation();
        if (this.animator) {
            this.animator.update(dt);
        }
    }

    checkWallTouch(room) {
        // Only allow wall slide on vines, not regular walls
        const checkBox = {
            x: this.x - 2,
            y: this.y + 2,
            width: this.width + 4,
            height: this.height - 4
        };

        for (const vine of room.vines) {
            if (this.rectIntersects(checkBox, vine)) {
                // Determine which side of player the vine is on
                const playerCenter = this.x + this.width / 2;
                const vineCenter = vine.x + vine.width / 2;
                return vineCenter < playerCenter ? -1 : 1;
            }
        }

        return 0;
    }

    checkMantle(room) {
        // Look for a ledge we can grab
        const grabRange = 6;
        const headY = this.y;

        for (const platform of room.platforms) {
            // Skip walls
            if (platform.height > 50) continue;

            // Check if we're beside the platform and our head is near the top
            const platformTop = platform.y;
            const nearTop = headY > platformTop - grabRange && headY < platformTop + grabRange;

            if (nearTop) {
                // Check if we're approaching from the side
                const approachingFromLeft = this.x + this.width > platform.x - 4 &&
                                           this.x + this.width < platform.x + 8 &&
                                           this.facing > 0;
                const approachingFromRight = this.x < platform.x + platform.width + 4 &&
                                            this.x > platform.x + platform.width - 8 &&
                                            this.facing < 0;

                if (approachingFromLeft || approachingFromRight) {
                    this.startMantle(platform, approachingFromLeft);
                    return;
                }
            }
        }
    }

    startMantle(platform, fromLeft) {
        this.isMantling = true;
        this.mantleTimer = MANTLE_DURATION;
        this.mantleStartY = this.y;
        this.mantleTargetY = platform.y - this.height;
        this.vy = 0;
        this.vx = 0;

        // Snap x to platform edge
        if (fromLeft) {
            this.x = platform.x - this.width + 4;
        } else {
            this.x = platform.x + platform.width - 4;
        }

        this.usedMechanics.mantle = true;
    }

    updateMantle(dt) {
        this.mantleTimer -= dt;
        const progress = 1 - (this.mantleTimer / MANTLE_DURATION);

        // Smooth ease-out
        const eased = 1 - Math.pow(1 - progress, 2);
        this.y = this.mantleStartY + (this.mantleTargetY - this.mantleStartY) * eased;

        if (this.mantleTimer <= 0) {
            this.isMantling = false;
            this.y = this.mantleTargetY;
            this.onGround = true;
            this.canDoubleJump = false;
            this.hasDoubleJumped = false;
        }
    }

    rectIntersects(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    collideHorizontal(room) {
        for (const platform of room.platforms) {
            if (this.intersects(platform)) {
                if (this.vx > 0) {
                    this.x = platform.x - this.width;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                }
                this.vx = 0;
            }
        }

        // Room bounds
        if (this.x < room.bounds.left) {
            this.x = room.bounds.left;
            this.vx = 0;
        }
        if (this.x + this.width > room.bounds.right) {
            this.x = room.bounds.right - this.width;
            this.vx = 0;
        }
    }

    collideVertical(room) {
        const wasInAir = !this.onGround;
        this.onGround = false;

        for (const platform of room.platforms) {
            if (this.intersects(platform)) {
                if (this.vy > 0) {
                    // Landing on top
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.handleLanding(wasInAir);
                } else if (this.vy < 0) {
                    // Hitting from below
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
            }
        }

        // Floor collision
        if (this.y + this.height > room.floorY) {
            this.y = room.floorY - this.height;
            this.vy = 0;
            this.onGround = true;
            this.handleLanding(wasInAir);
        }
    }

    handleLanding(wasInAir) {
        if (this.isGroundPounding && wasInAir) {
            this.isGroundPounding = false;
            this.groundPoundLanding = true;
            this.groundPoundTimer = 0.15; // Brief pause on landing
        }
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.isWallSliding = false;

        // Pogo landing - set up combo window and emit particles
        if (this.onPogo && wasInAir) {
            this.pogoWaitingForInput = true;
            this.pogoJumpWindow = POGO_COMBO_WINDOW;
            this.pogoSquash = 1;
            this.pogoIdleTimer = 0;

            // Emit impact particles
            if (this.particles) {
                const particleCount = 4 + this.pogoCombo * 2;
                this.particles.emit(
                    this.x + this.width / 2,
                    this.y + this.height,
                    particleCount,
                    {
                        speedMin: 20 + this.pogoCombo * 10,
                        speedMax: 60 + this.pogoCombo * 15,
                        angleMin: -Math.PI * 0.9,
                        angleMax: -Math.PI * 0.1,
                        colors: [COLORS.particle, COLORS.particleGlow, '#ffffff']
                    }
                );
            }
        }
    }

    doPogoBounce() {
        // Calculate bounce force with combo bonus
        const comboMultiplier = 1 + (this.pogoCombo * POGO_COMBO_BONUS);
        this.vy = POGO_BOUNCE_FORCE * comboMultiplier;
        this.onGround = false;
        this.canDoubleJump = true;
        this.hasDoubleJumped = false;
        this.pogoIdleTimer = 0;
    }

    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    render(ctx) {
        // Squash/stretch values for animation
        let scaleY = 1;
        let scaleX = 1;
        if (this.groundPoundLanding) {
            scaleY = 0.6;
            scaleX = 1.3;
        } else if (this.isGroundPounding) {
            scaleY = 0.8;
            scaleX = 0.9;
        } else if (this.isMantling) {
            scaleY = 1.1;
            scaleX = 0.9;
        } else if (this.onPogo && this.pogoSquash > 0) {
            scaleY = 1 - this.pogoSquash * 0.3;
            scaleX = 1 + this.pogoSquash * 0.2;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 1, this.y + this.height - 2, this.width - 2, 2);

        // Use sprite if available
        if (this.animator && this.animator.spriteSheet.loaded) {
            const spriteX = Math.round(this.x) + this.spriteOffsetX;
            const spriteY = Math.round(this.y) + this.spriteOffsetY;
            const flipX = this.facing < 0;

            // Dash trail effect with sprite
            if (this.isDashing) {
                ctx.globalAlpha = 0.3;
                this.animator.draw(ctx, spriteX - this.facing * 6, spriteY, flipX, scaleX, scaleY);
                ctx.globalAlpha = 0.15;
                this.animator.draw(ctx, spriteX - this.facing * 12, spriteY, flipX, scaleX, scaleY);
                ctx.globalAlpha = 1;
            }

            this.animator.draw(ctx, spriteX, spriteY, flipX, scaleX, scaleY);
        } else {
            // Fallback rectangle rendering
            let color = COLORS.player;
            if (this.isDashing) {
                color = COLORS.playerDash;
            }

            const bob = this.isMoving && !this.isDashing ? Math.sin(this.animTime) * 1 : 0;
            let drawY = this.y + bob;

            ctx.save();
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;
            ctx.translate(centerX, bottomY);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-centerX, -bottomY);

            ctx.fillStyle = color;
            ctx.fillRect(this.x + 2, drawY + 4, this.width - 4, this.height - 4);
            ctx.fillStyle = color;
            ctx.fillRect(this.x + 1, drawY, this.width - 2, 8);

            const eyeX = this.facing > 0 ? this.x + 7 : this.x + 3;
            ctx.fillStyle = '#1a1a24';
            ctx.fillRect(eyeX, drawY + 3, 2, 2);

            if (this.isWallSliding) {
                ctx.fillStyle = color;
                const armX = this.wallDirection < 0 ? this.x - 3 : this.x + this.width;
                ctx.fillRect(armX, drawY + 5, 3, 2);
            }

            if (this.isDashing) {
                ctx.globalAlpha = 0.3;
                ctx.fillRect(this.x - this.facing * 6, drawY + 2, this.width - 2, this.height - 4);
                ctx.globalAlpha = 0.15;
                ctx.fillRect(this.x - this.facing * 12, drawY + 4, this.width - 4, this.height - 8);
                ctx.globalAlpha = 1;
            }

            ctx.fillStyle = COLORS.playerOutline;
            ctx.fillRect(this.x + 1, drawY + this.height - 4, this.width - 2, 1);
            ctx.restore();
        }

        // Pogo stick rendering
        if (this.onPogo) {
            const pogoX = this.x + this.width / 2;
            const pogoTopY = drawY + this.height - 2;
            const springCompression = this.pogoSquash * 4;
            const pogoLength = 10 - springCompression;

            // Pogo handle (player holds this)
            ctx.fillStyle = COLORS.pogoLight;
            ctx.fillRect(pogoX - 3, pogoTopY - 2, 6, 3);

            // Pogo shaft
            ctx.fillStyle = COLORS.pogo;
            ctx.fillRect(pogoX - 1, pogoTopY, 2, pogoLength);

            // Spring coil
            ctx.fillStyle = COLORS.pogoSpring;
            const springY = pogoTopY + pogoLength;
            const springHeight = 4 - springCompression * 0.3;
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(pogoX - 2 + (i % 2), springY + i * (springHeight / 3), 3, 1);
            }

            // Pogo tip
            ctx.fillStyle = COLORS.pogoTip;
            ctx.fillRect(pogoX - 2, springY + springHeight, 4, 2);

            // Combo indicator (stars above player)
            if (this.pogoCombo > 0) {
                ctx.fillStyle = COLORS.particleGlow;
                for (let i = 0; i < this.pogoCombo; i++) {
                    const starX = this.x + 2 + i * 3;
                    const starY = drawY - 4;
                    ctx.fillRect(starX, starY, 2, 2);
                }
            }
        }

        ctx.restore();
    }
}

/**
 * Room class - defines the level geometry.
 */
class Room {
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // Room is wider than screen for scrolling
        this.width = screenWidth * 2.5;
        this.height = screenHeight;

        // Floor position
        this.floorY = screenHeight - 16;
        this.floorHeight = 16;

        // Room bounds (walls)
        this.bounds = {
            left: 16,
            right: this.width - 16
        };

        // Platforms - designed to encourage using all mechanics
        this.platforms = [
            // Left wall
            { x: 0, y: 0, width: 16, height: this.height },
            // Right wall
            { x: this.width - 16, y: 0, width: 16, height: this.height },

            // Starting area - basic platforms
            { x: 80, y: 130, width: 48, height: 8 },
            { x: 150, y: 105, width: 40, height: 8 },

            // Gap that needs dash or double jump
            { x: 260, y: 110, width: 44, height: 8 },

            // Vine climb section - two walls with vines
            { x: 330, y: 20, width: 12, height: 144 },
            { x: 400, y: 20, width: 12, height: 144 },
            { x: 350, y: 30, width: 44, height: 8 }, // Reward platform at top

            // High platform for mantle practice
            { x: 480, y: 90, width: 50, height: 8 },

            // More platforms
            { x: 560, y: 120, width: 40, height: 8 },
            { x: 640, y: 95, width: 52, height: 8 },
            { x: 720, y: 115, width: 44, height: 8 },
        ];

        // Vines - climbable surfaces on walls (only these allow wall slide)
        this.vines = [
            // Vine climb challenge - alternating vines force wall-to-wall jumping
            // Left wall vines
            { x: 330, y: 110, width: 6, height: 30, side: 'right' },  // Bottom left
            { x: 330, y: 50, width: 6, height: 25, side: 'right' },   // Top left

            // Right wall vines
            { x: 406, y: 80, width: 6, height: 30, side: 'left' },    // Middle right
            { x: 406, y: 30, width: 6, height: 25, side: 'left' },    // Top right
        ];

        // Collectible items
        this.items = [
            { x: 200, y: this.floorY - 20, width: 10, height: 14, type: 'pogo', collected: false }
        ];

        // Decorative elements (background stones)
        this.bgStones = [];
        for (let x = 20; x < this.width - 20; x += 30 + Math.random() * 40) {
            this.bgStones.push({
                x: x,
                y: this.floorY - 8 - Math.random() * 60,
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 6,
                shade: Math.random() * 0.3
            });
        }
    }

    render(ctx, cameraX) {
        // Background layers for parallax feel
        this.renderBackground(ctx, cameraX);

        // Background decorations
        ctx.fillStyle = COLORS.backgroundMid;
        for (const stone of this.bgStones) {
            const screenX = stone.x - cameraX * 0.5; // Parallax
            if (screenX > -20 && screenX < this.screenWidth + 20) {
                ctx.globalAlpha = 0.3 + stone.shade;
                ctx.fillRect(screenX, stone.y, stone.width, stone.height);
            }
        }
        ctx.globalAlpha = 1;

        // Platforms
        for (const plat of this.platforms) {
            const screenX = plat.x - cameraX;
            if (screenX > -plat.width && screenX < this.screenWidth) {
                // Skip full-height walls, render them separately
                if (plat.height === this.height) continue;

                // Vertical walls (for wall jumping)
                if (plat.height > 50) {
                    ctx.fillStyle = COLORS.wall;
                    ctx.fillRect(screenX, plat.y, plat.width, plat.height);
                    ctx.fillStyle = COLORS.wallHighlight;
                    ctx.fillRect(screenX, plat.y, 2, plat.height);
                    continue;
                }

                // Platform top highlight
                ctx.fillStyle = COLORS.platformHighlight;
                ctx.fillRect(screenX, plat.y, plat.width, 2);

                // Platform body
                ctx.fillStyle = COLORS.platform;
                ctx.fillRect(screenX, plat.y + 2, plat.width, plat.height - 2);
            }
        }

        // Vines (rendered on top of walls)
        this.renderVines(ctx, cameraX);

        // Floor
        this.renderFloor(ctx, cameraX);

        // Walls
        this.renderWalls(ctx, cameraX);

        // Items
        this.renderItems(ctx, cameraX);
    }

    renderItems(ctx, cameraX) {
        for (const item of this.items) {
            if (item.collected) continue;

            const screenX = item.x - cameraX;
            if (screenX > -item.width && screenX < this.screenWidth) {
                if (item.type === 'pogo') {
                    // Floating animation
                    const floatOffset = Math.sin(Date.now() / 300) * 2;
                    const itemY = item.y + floatOffset;

                    // Glow effect
                    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
                    ctx.beginPath();
                    ctx.arc(screenX + item.width / 2, itemY + item.height / 2, 10, 0, Math.PI * 2);
                    ctx.fill();

                    // Pogo handle
                    ctx.fillStyle = COLORS.pogoLight;
                    ctx.fillRect(screenX + 2, itemY, 6, 3);

                    // Pogo shaft
                    ctx.fillStyle = COLORS.pogo;
                    ctx.fillRect(screenX + 4, itemY + 3, 2, 6);

                    // Spring
                    ctx.fillStyle = COLORS.pogoSpring;
                    ctx.fillRect(screenX + 3, itemY + 9, 4, 2);

                    // Tip
                    ctx.fillStyle = COLORS.pogoTip;
                    ctx.fillRect(screenX + 3, itemY + 11, 4, 3);
                }
            }
        }
    }

    renderVines(ctx, cameraX) {
        for (const vine of this.vines) {
            const screenX = vine.x - cameraX;
            if (screenX > -vine.width - 10 && screenX < this.screenWidth + 10) {
                // Main vine stem
                ctx.fillStyle = COLORS.vine;
                ctx.fillRect(screenX + 1, vine.y, vine.width - 2, vine.height);

                // Lighter edge (toward light)
                ctx.fillStyle = COLORS.vineLight;
                ctx.fillRect(screenX + vine.width - 2, vine.y, 1, vine.height);

                // Darker edge
                ctx.fillStyle = COLORS.vineDark;
                ctx.fillRect(screenX + 1, vine.y, 1, vine.height);

                // Leaves/fronds along the vine
                const leafCount = Math.floor(vine.height / 10);
                for (let i = 0; i < leafCount; i++) {
                    const leafY = vine.y + 5 + i * 10 + (i % 2) * 3;
                    const leafSide = (i % 2 === 0) ? -1 : 1;
                    const leafX = screenX + (leafSide > 0 ? vine.width - 1 : 1);

                    ctx.fillStyle = COLORS.vineLeaf;
                    // Small leaf shape
                    ctx.fillRect(leafX + leafSide * 1, leafY, 2, 1);
                    ctx.fillRect(leafX + leafSide * 2, leafY + 1, 2, 1);
                    ctx.fillRect(leafX + leafSide * 2, leafY + 2, 1, 1);
                }

                // Top tendril
                ctx.fillStyle = COLORS.vineLight;
                ctx.fillRect(screenX + 2, vine.y - 2, 1, 3);
                ctx.fillRect(screenX + 3, vine.y - 3, 1, 2);
            }
        }
    }

    renderBackground(ctx, cameraX) {
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // Subtle gradient at top
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.screenWidth, 60);
    }

    renderFloor(ctx, cameraX) {
        const startX = Math.floor(cameraX / 16) * 16;

        for (let x = startX - 16; x < cameraX + this.screenWidth + 16; x += 16) {
            const screenX = x - cameraX;
            const tileOffset = (Math.floor(x / 16) % 2) * 2;

            // Floor highlight
            ctx.fillStyle = COLORS.floorHighlight;
            ctx.fillRect(screenX, this.floorY + tileOffset, 14, 2);

            // Floor body
            ctx.fillStyle = COLORS.floor;
            ctx.fillRect(screenX, this.floorY + 2 + tileOffset, 14, this.floorHeight - 2);

            // Floor dark bottom
            ctx.fillStyle = COLORS.floorDark;
            ctx.fillRect(screenX, this.floorY + this.floorHeight - 2 + tileOffset, 14, 2);
        }
    }

    renderWalls(ctx, cameraX) {
        // Left wall
        const leftWallX = 0 - cameraX;
        if (leftWallX > -16) {
            ctx.fillStyle = COLORS.wall;
            ctx.fillRect(leftWallX, 0, 16, this.height);
            ctx.fillStyle = COLORS.wallHighlight;
            ctx.fillRect(leftWallX + 14, 0, 2, this.height);
        }

        // Right wall
        const rightWallX = this.width - 16 - cameraX;
        if (rightWallX < this.screenWidth) {
            ctx.fillStyle = COLORS.wall;
            ctx.fillRect(rightWallX, 0, 16, this.height);
            ctx.fillStyle = COLORS.wallHighlight;
            ctx.fillRect(rightWallX, 0, 2, this.height);
        }
    }
}

/**
 * Camera class - follows the player with smooth scrolling.
 */
class Camera {
    constructor(screenWidth, screenHeight, roomWidth) {
        this.x = 0;
        this.targetX = 0;
        this.screenWidth = screenWidth;
        this.roomWidth = roomWidth;
        this.deadZone = screenWidth * 0.3;
        this.smoothSpeed = 8;
    }

    follow(player, dt) {
        const playerCenterX = player.x + player.width / 2;
        const screenCenterX = this.targetX + this.screenWidth / 2;

        const diff = playerCenterX - screenCenterX;
        if (Math.abs(diff) > this.deadZone) {
            if (diff > 0) {
                this.targetX = playerCenterX - this.screenWidth / 2 - this.deadZone;
            } else {
                this.targetX = playerCenterX - this.screenWidth / 2 + this.deadZone;
            }
        }

        this.targetX = Math.max(0, Math.min(this.targetX, this.roomWidth - this.screenWidth));

        const lerp = 1 - Math.exp(-this.smoothSpeed * dt);
        this.x += (this.targetX - this.x) * lerp;
        this.x = Math.round(this.x);
    }
}

/**
 * Tutorial system - shows contextual hints
 */
class Tutorial {
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.hints = [
            { key: 'move', text: '[<][>] or [A][D] to Move', shown: false },
            { key: 'jump', text: '[SPACE] to Jump', shown: false },
            { key: 'doubleJump', text: '[SPACE] again for Double Jump!', shown: false },
            { key: 'dash', text: '[SHIFT] to Dash', shown: false },
            { key: 'wallSlide', text: 'Vines let you Wall Slide!', shown: false },
            { key: 'wallJump', text: '[SPACE] off wall to Wall Jump!', shown: false },
            { key: 'groundPound', text: '[DOWN] in air for Ground Pound', shown: false },
            { key: 'mantle', text: 'Approach ledges to auto-Mantle', shown: false },
            { key: 'pogo', text: 'Pogo stick! Bounce automatically', shown: false },
            { key: 'pogoCombo', text: 'Time [SPACE] on landing for +10% height!', shown: false },
        ];

        this.activeHints = [];
        this.completedHints = new Set();
        this.hintDuration = 3;
    }

    update(dt, usedMechanics) {
        // Check for newly used mechanics
        for (const hint of this.hints) {
            if (usedMechanics[hint.key] && !hint.shown && !this.completedHints.has(hint.key)) {
                hint.shown = true;
                this.activeHints.push({
                    text: hint.text,
                    timer: this.hintDuration,
                    alpha: 0,
                    key: hint.key
                });
            }
        }

        // Update active hints
        for (let i = this.activeHints.length - 1; i >= 0; i--) {
            const hint = this.activeHints[i];
            hint.timer -= dt;

            // Fade in/out
            if (hint.timer > this.hintDuration - 0.3) {
                hint.alpha = Math.min(1, hint.alpha + dt * 5);
            } else if (hint.timer < 0.5) {
                hint.alpha = Math.max(0, hint.alpha - dt * 3);
            } else {
                hint.alpha = 1;
            }

            if (hint.timer <= 0) {
                this.completedHints.add(hint.key);
                this.activeHints.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let y = 20;
        for (const hint of this.activeHints) {
            // Background
            const textWidth = ctx.measureText(hint.text).width;
            ctx.fillStyle = `rgba(10, 10, 15, ${hint.alpha * 0.8})`;
            ctx.fillRect(
                this.screenWidth / 2 - textWidth / 2 - 8,
                y - 6,
                textWidth + 16,
                12
            );

            // Text
            ctx.fillStyle = `rgba(157, 140, 255, ${hint.alpha})`;
            ctx.fillText(hint.text, this.screenWidth / 2, y);

            y += 16;
        }

        // Always show controls hint at bottom
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = COLORS.tutorialDim;
        ctx.font = '6px monospace';
        ctx.fillText(
            'Move: Arrows/WASD | Jump: Space | Dash: Shift | Pound: Down',
            this.screenWidth / 2,
            this.screenHeight - 6
        );
        ctx.globalAlpha = 1;
    }
}

/**
 * PlayingScreen - The main gameplay screen.
 */
export class PlayingScreen {
    constructor(game) {
        this.game = game;
        this.width = game.width;
        this.height = game.height;

        // Create room
        this.room = new Room(this.width, this.height);

        // Create player at starting position
        this.player = new Player(40, this.room.floorY - 20);

        // Create camera
        this.camera = new Camera(this.width, this.height, this.room.width);

        // Create tutorial
        this.tutorial = new Tutorial(this.width, this.height);

        // Create particle system
        this.particles = new ParticleSystem();

        // Link particle system to player
        this.player.particles = this.particles;

        // Load player sprite sheet
        this.playerSpriteSheet = new SpriteSheet();
        this.loadSprites();

        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false,
            dash: false,
            down: false
        };

        // Track held keys
        this.jumpHeld = false;
        this.dashHeld = false;
    }

    /**
     * Load sprite sheets asynchronously
     */
    async loadSprites() {
        try {
            await this.playerSpriteSheet.load('assets/sprites/player.json');
            const animator = new Animator(this.playerSpriteSheet);
            animator.play('idle');
            this.player.setAnimator(animator);
            console.log('Player sprites loaded');
        } catch (e) {
            console.warn('Could not load player sprites, using fallback:', e);
        }
    }

    onEnter() {
        // Reset player position
        this.player.x = 40;
        this.player.y = this.room.floorY - 20;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.hasPogo = false;
        this.player.onPogo = false;
        this.player.pogoCombo = 0;
        this.camera.x = 0;
        this.camera.targetX = 0;

        // Reset items
        for (const item of this.room.items) {
            item.collected = false;
        }

        // Clear particles
        this.particles.particles = [];
    }

    onExit() {
        // Cleanup
    }

    handleInput(type, event) {
        // Keyboard handled separately via keydown/keyup tracking
    }

    handleKeyDown(key) {
        if (key === 'ArrowLeft' || key === 'a') {
            this.input.left = true;
        }
        if (key === 'ArrowRight' || key === 'd') {
            this.input.right = true;
        }
        if (key === ' ' || key === 'ArrowUp' || key === 'w') {
            if (!this.jumpHeld) {
                this.input.jump = true;
                this.jumpHeld = true;
            }
        }
        if (key === 'Shift') {
            if (!this.dashHeld) {
                this.input.dash = true;
                this.dashHeld = true;
            }
        }
        if (key === 'ArrowDown' || key === 's') {
            this.input.down = true;
        }
    }

    handleKeyUp(key) {
        if (key === 'ArrowLeft' || key === 'a') {
            this.input.left = false;
        }
        if (key === 'ArrowRight' || key === 'd') {
            this.input.right = false;
        }
        if (key === ' ' || key === 'ArrowUp' || key === 'w') {
            this.input.jump = false;
            this.jumpHeld = false;
        }
        if (key === 'Shift') {
            this.input.dash = false;
            this.dashHeld = false;
        }
        if (key === 'ArrowDown' || key === 's') {
            this.input.down = false;
        }
    }

    update(dt) {
        // Update player
        this.player.update(dt, this.input, this.room);

        // Clear single-press inputs after processing
        this.input.jump = false;
        this.input.dash = false;

        // Check item collection
        this.checkItemCollection();

        // Update particles
        this.particles.update(dt);

        // Update camera
        this.camera.follow(this.player, dt);

        // Update tutorial
        this.tutorial.update(dt, this.player.usedMechanics);
    }

    checkItemCollection() {
        const player = this.player;
        for (const item of this.room.items) {
            if (item.collected) continue;

            // Simple AABB collision
            if (player.x < item.x + item.width &&
                player.x + player.width > item.x &&
                player.y < item.y + item.height &&
                player.y + player.height > item.y) {

                item.collected = true;

                if (item.type === 'pogo') {
                    player.hasPogo = true;
                    player.mountPogo(); // Auto-mount on pickup

                    // Celebration particles
                    this.particles.emit(
                        item.x + item.width / 2,
                        item.y + item.height / 2,
                        12,
                        {
                            speedMin: 40,
                            speedMax: 100,
                            angleMin: 0,
                            angleMax: Math.PI * 2,
                            colors: [COLORS.particleGlow, '#ffffff', COLORS.pogoLight]
                        }
                    );
                }
            }
        }
    }

    render(ctx) {
        // Render room (handles its own camera offset)
        this.room.render(ctx, this.camera.x);

        // Render particles
        this.particles.render(ctx, this.camera.x);

        // Render player (offset by camera)
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        this.player.render(ctx);
        ctx.restore();

        // Render tutorial (screen-space, no camera offset)
        this.tutorial.render(ctx);
    }
}

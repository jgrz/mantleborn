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
    tutorialDim: '#6a5aaa'
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
            mantle: false
        };
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

        // Jump / Double Jump / Wall Jump
        if (input.jump) {
            if (this.isWallSliding) {
                // Wall jump
                this.vx = WALL_JUMP_FORCE_X * -this.wallDirection;
                this.vy = WALL_JUMP_FORCE_Y;
                this.facing = -this.wallDirection;
                this.isWallSliding = false;
                this.hasDoubleJumped = false; // Wall jump resets double jump
                this.usedMechanics.wallJump = true;
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

        // Animation timer
        if (this.isMoving) {
            this.animTime += dt * 8;
        } else {
            this.animTime = 0;
        }
    }

    checkWallTouch(room) {
        // Check left
        const leftCheck = { x: this.x - 2, y: this.y + 4, width: 2, height: this.height - 8 };
        for (const platform of room.platforms) {
            if (this.rectIntersects(leftCheck, platform)) {
                return -1;
            }
        }
        if (this.x <= room.bounds.left + 2) return -1;

        // Check right
        const rightCheck = { x: this.x + this.width, y: this.y + 4, width: 2, height: this.height - 8 };
        for (const platform of room.platforms) {
            if (this.rectIntersects(rightCheck, platform)) {
                return 1;
            }
        }
        if (this.x + this.width >= room.bounds.right - 2) return 1;

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
    }

    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    render(ctx) {
        // Determine color based on state
        let color = COLORS.player;
        if (this.isDashing) {
            color = COLORS.playerDash;
        }

        // Bob animation when moving
        const bob = this.isMoving && !this.isDashing ? Math.sin(this.animTime) * 1 : 0;
        let drawY = this.y + bob;

        // Squash during ground pound landing
        let scaleY = 1;
        let scaleX = 1;
        if (this.groundPoundLanding) {
            scaleY = 0.6;
            scaleX = 1.3;
        } else if (this.isGroundPounding) {
            scaleY = 0.8;
            scaleX = 0.9;
        } else if (this.isMantling) {
            // Stretch during mantle
            scaleY = 1.1;
            scaleX = 0.9;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 1, this.y + this.height - 2, this.width - 2, 2);

        // Draw with scaling
        ctx.save();
        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height;
        ctx.translate(centerX, bottomY);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-centerX, -bottomY);

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 2, drawY + 4, this.width - 4, this.height - 4);

        // Head
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 1, drawY, this.width - 2, 8);

        // Eye
        const eyeX = this.facing > 0 ? this.x + 7 : this.x + 3;
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(eyeX, drawY + 3, 2, 2);

        // Wall slide indicator (arms out)
        if (this.isWallSliding) {
            ctx.fillStyle = color;
            const armX = this.wallDirection < 0 ? this.x - 3 : this.x + this.width;
            ctx.fillRect(armX, drawY + 5, 3, 2);
        }

        // Dash trail effect
        if (this.isDashing) {
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.x - this.facing * 6, drawY + 2, this.width - 2, this.height - 4);
            ctx.globalAlpha = 0.15;
            ctx.fillRect(this.x - this.facing * 12, drawY + 4, this.width - 4, this.height - 8);
            ctx.globalAlpha = 1;
        }

        // Outline accents
        ctx.fillStyle = COLORS.playerOutline;
        ctx.fillRect(this.x + 1, drawY + this.height - 4, this.width - 2, 1);

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

            // Wall jump section - two walls close together
            { x: 340, y: 40, width: 12, height: 100 },
            { x: 390, y: 40, width: 12, height: 100 },
            { x: 355, y: 50, width: 32, height: 8 }, // Reward platform at top

            // High platform for mantle practice
            { x: 460, y: 90, width: 50, height: 8 },

            // More platforms
            { x: 540, y: 120, width: 40, height: 8 },
            { x: 620, y: 95, width: 52, height: 8 },
            { x: 700, y: 115, width: 44, height: 8 },
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

        // Floor
        this.renderFloor(ctx, cameraX);

        // Walls
        this.renderWalls(ctx, cameraX);
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
            { key: 'wallSlide', text: 'Hold toward wall to Wall Slide', shown: false },
            { key: 'wallJump', text: '[SPACE] off wall to Wall Jump!', shown: false },
            { key: 'groundPound', text: '[DOWN] in air for Ground Pound', shown: false },
            { key: 'mantle', text: 'Approach ledges to auto-Mantle', shown: false },
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

    onEnter() {
        // Reset player position
        this.player.x = 40;
        this.player.y = this.room.floorY - 20;
        this.player.vx = 0;
        this.player.vy = 0;
        this.camera.x = 0;
        this.camera.targetX = 0;
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

        // Update camera
        this.camera.follow(this.player, dt);

        // Update tutorial
        this.tutorial.update(dt, this.player.usedMechanics);
    }

    render(ctx) {
        // Render room (handles its own camera offset)
        this.room.render(ctx, this.camera.x);

        // Render player (offset by camera)
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        this.player.render(ctx);
        ctx.restore();

        // Render tutorial (screen-space, no camera offset)
        this.tutorial.render(ctx);
    }
}

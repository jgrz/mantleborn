/**
 * Mantleborn - Playing Screen
 *
 * Side-scrolling room with player movement and platforming.
 * Controls: Left/Right arrows to move, Space to jump.
 */

import { GameState } from '../game.js';

// Color palette
const COLORS = {
    background: '#0a0a0f',
    backgroundMid: '#12121a',
    player: '#e8a840',
    playerOutline: '#b87820',
    floor: '#2d2d3a',
    floorHighlight: '#3d3d4a',
    floorDark: '#1d1d2a',
    wall: '#252530',
    wallHighlight: '#353545',
    platform: '#2a2a38',
    platformHighlight: '#3a3a48'
};

// Physics constants
const GRAVITY = 600;
const PLAYER_SPEED = 80;
const JUMP_FORCE = -200;
const FRICTION = 0.85;

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
    }

    update(dt, input, room) {
        // Horizontal movement
        this.isMoving = false;
        if (input.left) {
            this.vx = -PLAYER_SPEED;
            this.facing = -1;
            this.isMoving = true;
        } else if (input.right) {
            this.vx = PLAYER_SPEED;
            this.facing = 1;
            this.isMoving = true;
        } else {
            this.vx *= FRICTION;
            if (Math.abs(this.vx) < 1) this.vx = 0;
        }

        // Jump
        if (input.jump && this.onGround) {
            this.vy = JUMP_FORCE;
            this.onGround = false;
        }

        // Apply gravity
        this.vy += GRAVITY * dt;

        // Move and collide
        this.x += this.vx * dt;
        this.collideHorizontal(room);

        this.y += this.vy * dt;
        this.collideVertical(room);

        // Animation timer
        if (this.isMoving) {
            this.animTime += dt * 8;
        } else {
            this.animTime = 0;
        }
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
        this.onGround = false;

        for (const platform of room.platforms) {
            if (this.intersects(platform)) {
                if (this.vy > 0) {
                    // Landing on top
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
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
        }
    }

    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    render(ctx) {
        // Bob animation when moving
        const bob = this.isMoving ? Math.sin(this.animTime) * 1 : 0;
        const drawY = this.y + bob;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 1, this.y + this.height - 2, this.width - 2, 2);

        // Body
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(this.x + 2, drawY + 4, this.width - 4, this.height - 4);

        // Head
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(this.x + 1, drawY, this.width - 2, 8);

        // Eye
        const eyeX = this.facing > 0 ? this.x + 7 : this.x + 3;
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(eyeX, drawY + 3, 2, 2);

        // Outline accents
        ctx.fillStyle = COLORS.playerOutline;
        ctx.fillRect(this.x + 1, drawY + this.height - 4, this.width - 2, 1);
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

        // Platforms
        this.platforms = [
            // Left wall
            { x: 0, y: 0, width: 16, height: this.height },
            // Right wall
            { x: this.width - 16, y: 0, width: 16, height: this.height },

            // Floating platforms
            { x: 80, y: 130, width: 48, height: 8 },
            { x: 160, y: 100, width: 40, height: 8 },
            { x: 240, y: 120, width: 56, height: 8 },
            { x: 340, y: 90, width: 44, height: 8 },
            { x: 420, y: 110, width: 48, height: 8 },
            { x: 520, y: 130, width: 40, height: 8 },
            { x: 600, y: 100, width: 52, height: 8 },
            { x: 700, y: 120, width: 44, height: 8 },
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
                // Skip walls, render them separately
                if (plat.width === 16 && plat.height === this.height) continue;

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
        this.screenWidth = screenWidth;
        this.roomWidth = roomWidth;
        this.deadZone = screenWidth * 0.3; // Player can move this far before camera follows
    }

    follow(player) {
        const playerCenterX = player.x + player.width / 2;
        const screenCenterX = this.x + this.screenWidth / 2;

        // Only scroll if player moves outside dead zone
        const diff = playerCenterX - screenCenterX;
        if (Math.abs(diff) > this.deadZone) {
            const target = playerCenterX - this.screenWidth / 2;
            this.x += (target - this.x) * 0.1;
        }

        // Clamp to room bounds
        this.x = Math.max(0, Math.min(this.x, this.roomWidth - this.screenWidth));
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

        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false
        };

        // Track held keys to prevent jump repeat
        this.jumpHeld = false;
    }

    onEnter() {
        // Reset player position
        this.player.x = 40;
        this.player.y = this.room.floorY - 20;
        this.player.vx = 0;
        this.player.vy = 0;
        this.camera.x = 0;
    }

    onExit() {
        // Cleanup
    }

    handleInput(type, event) {
        // Keyboard handled separately via keydown/keyup tracking
    }

    /**
     * Track key states for continuous input.
     */
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
    }

    update(dt) {
        // Update player
        this.player.update(dt, this.input, this.room);

        // Clear jump input after processing (single press)
        this.input.jump = false;

        // Update camera
        this.camera.follow(this.player);
    }

    render(ctx) {
        // Render room (handles its own camera offset)
        this.room.render(ctx, this.camera.x);

        // Render player (offset by camera)
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        this.player.render(ctx);
        ctx.restore();
    }
}

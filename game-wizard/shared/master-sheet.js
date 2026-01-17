/**
 * Master Spritesheet Manager
 *
 * Handles packing sprites into a single master sheet using MaxRects bin packing.
 * Used by Tilesmith (publish tiles) and Sprite-Rite (import sprites).
 * Consumed by Level Forge and Animancer.
 */

// =============================================
// MAXRECTS BIN PACKING ALGORITHM
// =============================================

class MaxRectsBinPack {
    constructor(width, height, padding = 1) {
        this.binWidth = width;
        this.binHeight = height;
        this.padding = padding;
        this.usedRectangles = [];
        this.freeRectangles = [{ x: 0, y: 0, width, height }];
    }

    /**
     * Insert a rectangle into the bin
     * @returns {Object|null} Placed rectangle with x,y or null if doesn't fit
     */
    insert(width, height) {
        // Add padding
        const paddedWidth = width + this.padding;
        const paddedHeight = height + this.padding;

        // Find the best position using Best Short Side Fit
        let bestNode = this.findPositionForNewNodeBSSF(paddedWidth, paddedHeight);

        if (bestNode.height === 0) {
            return null; // Doesn't fit
        }

        // Place the rectangle
        this.placeRectangle(bestNode);

        // Return position without padding offset
        return {
            x: bestNode.x,
            y: bestNode.y,
            width: width,
            height: height
        };
    }

    findPositionForNewNodeBSSF(width, height) {
        let bestNode = { x: 0, y: 0, width: 0, height: 0 };
        let bestShortSideFit = Infinity;
        let bestLongSideFit = Infinity;

        for (const rect of this.freeRectangles) {
            // Try placing the rectangle in upright orientation
            if (rect.width >= width && rect.height >= height) {
                const leftoverHoriz = Math.abs(rect.width - width);
                const leftoverVert = Math.abs(rect.height - height);
                const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                const longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < bestShortSideFit ||
                    (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                    bestNode = { x: rect.x, y: rect.y, width, height };
                    bestShortSideFit = shortSideFit;
                    bestLongSideFit = longSideFit;
                }
            }
        }

        return bestNode;
    }

    placeRectangle(node) {
        let numRectanglesToProcess = this.freeRectangles.length;

        for (let i = 0; i < numRectanglesToProcess; i++) {
            if (this.splitFreeNode(this.freeRectangles[i], node)) {
                this.freeRectangles.splice(i, 1);
                i--;
                numRectanglesToProcess--;
            }
        }

        this.pruneFreeList();
        this.usedRectangles.push(node);
    }

    splitFreeNode(freeNode, usedNode) {
        // Test if the rectangles even intersect
        if (usedNode.x >= freeNode.x + freeNode.width ||
            usedNode.x + usedNode.width <= freeNode.x ||
            usedNode.y >= freeNode.y + freeNode.height ||
            usedNode.y + usedNode.height <= freeNode.y) {
            return false;
        }

        // Split horizontally
        if (usedNode.x < freeNode.x + freeNode.width && usedNode.x + usedNode.width > freeNode.x) {
            // New node at the top side of the used node
            if (usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.height) {
                const newNode = { ...freeNode };
                newNode.height = usedNode.y - newNode.y;
                this.freeRectangles.push(newNode);
            }

            // New node at the bottom side of the used node
            if (usedNode.y + usedNode.height < freeNode.y + freeNode.height) {
                const newNode = { ...freeNode };
                newNode.y = usedNode.y + usedNode.height;
                newNode.height = freeNode.y + freeNode.height - (usedNode.y + usedNode.height);
                this.freeRectangles.push(newNode);
            }
        }

        // Split vertically
        if (usedNode.y < freeNode.y + freeNode.height && usedNode.y + usedNode.height > freeNode.y) {
            // New node at the left side of the used node
            if (usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.width) {
                const newNode = { ...freeNode };
                newNode.width = usedNode.x - newNode.x;
                this.freeRectangles.push(newNode);
            }

            // New node at the right side of the used node
            if (usedNode.x + usedNode.width < freeNode.x + freeNode.width) {
                const newNode = { ...freeNode };
                newNode.x = usedNode.x + usedNode.width;
                newNode.width = freeNode.x + freeNode.width - (usedNode.x + usedNode.width);
                this.freeRectangles.push(newNode);
            }
        }

        return true;
    }

    pruneFreeList() {
        // Remove redundant free rectangles that are contained within another
        for (let i = 0; i < this.freeRectangles.length; i++) {
            for (let j = i + 1; j < this.freeRectangles.length; j++) {
                if (this.isContainedIn(this.freeRectangles[i], this.freeRectangles[j])) {
                    this.freeRectangles.splice(i, 1);
                    i--;
                    break;
                }
                if (this.isContainedIn(this.freeRectangles[j], this.freeRectangles[i])) {
                    this.freeRectangles.splice(j, 1);
                    j--;
                }
            }
        }
    }

    isContainedIn(a, b) {
        return a.x >= b.x && a.y >= b.y &&
            a.x + a.width <= b.x + b.width &&
            a.y + a.height <= b.y + b.height;
    }

    /**
     * Get the occupancy ratio (0-1)
     */
    getOccupancy() {
        let usedArea = 0;
        for (const rect of this.usedRectangles) {
            usedArea += rect.width * rect.height;
        }
        return usedArea / (this.binWidth * this.binHeight);
    }
}

// =============================================
// MASTER SHEET MANAGER
// =============================================

class MasterSheetManager {
    constructor() {
        this.maxSize = 2048; // Max texture size
        this.padding = 1;    // Pixels between sprites
    }

    /**
     * Pack sprites into a master sheet
     * @param {Array} sprites - Array of {name, imageData, width, height, source}
     * @returns {Object} {png: base64, atlas: {size, sprites}}
     */
    async packSprites(sprites) {
        if (!sprites || sprites.length === 0) {
            return {
                png: null,
                atlas: { size: { w: 0, h: 0 }, sprites: {} }
            };
        }

        // Sort sprites by height (descending) for better packing
        const sorted = [...sprites].sort((a, b) => b.height - a.height);

        // Try increasingly larger sizes until everything fits
        let size = 256;
        let packer = null;
        let placements = null;

        while (size <= this.maxSize) {
            packer = new MaxRectsBinPack(size, size, this.padding);
            placements = [];
            let allFit = true;

            for (const sprite of sorted) {
                const placement = packer.insert(sprite.width, sprite.height);
                if (placement) {
                    placements.push({
                        name: sprite.name,
                        ...placement,
                        source: sprite.source || 'unknown',
                        imageData: sprite.imageData
                    });
                } else {
                    allFit = false;
                    break;
                }
            }

            if (allFit) break;
            size *= 2;
        }

        if (size > this.maxSize) {
            throw new Error(`Sprites don't fit in ${this.maxSize}x${this.maxSize} sheet`);
        }

        // Create the packed canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Build atlas
        const atlas = {
            size: { w: size, h: size },
            sprites: {}
        };

        // Draw each sprite and add to atlas
        for (const p of placements) {
            // Draw the sprite
            if (p.imageData instanceof ImageData) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = p.width;
                tempCanvas.height = p.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(p.imageData, 0, 0);
                ctx.drawImage(tempCanvas, p.x, p.y);
            } else if (p.imageData instanceof HTMLImageElement || p.imageData instanceof HTMLCanvasElement) {
                ctx.drawImage(p.imageData, p.x, p.y, p.width, p.height);
            }

            // Add to atlas
            atlas.sprites[p.name] = {
                x: p.x,
                y: p.y,
                w: p.width,
                h: p.height,
                source: p.source
            };
        }

        // Export as PNG
        const png = canvas.toDataURL('image/png');

        return { png, atlas };
    }

    /**
     * Add a sprite to an existing master sheet (LEGACY - does full repack)
     * @deprecated Use appendSprite() instead for stable coordinates
     */
    async addSprite(existingAtlas, existingPng, newSprite) {
        // Load existing sprites from the sheet
        const sprites = await this.extractSpritesFromSheet(existingAtlas, existingPng);

        // Add the new sprite
        sprites.push(newSprite);

        // Repack everything
        return this.packSprites(sprites);
    }

    /**
     * Append a sprite to an existing master sheet WITHOUT repacking
     * Finds empty space or expands canvas. Existing sprite coordinates stay stable.
     * @param {Object} existingAtlas - Current atlas
     * @param {string} existingPng - Current PNG (base64)
     * @param {Object} newSprite - {name, imageData, width, height, source}
     * @returns {Object} {png, atlas}
     */
    async appendSprite(existingAtlas, existingPng, newSprite) {
        // Handle empty/new sheet case
        if (!existingPng || !existingAtlas || !existingAtlas.sprites || Object.keys(existingAtlas.sprites).length === 0) {
            // First sprite - create new sheet
            return this.packSprites([newSprite]);
        }

        // Load existing canvas
        const existingImg = await this.loadImage(existingPng);
        let canvasWidth = existingImg.width;
        let canvasHeight = existingImg.height;

        // Build packer from existing placements to track free space
        let packer = this.buildPackerFromAtlas(existingAtlas, canvasWidth, canvasHeight);

        // Try to insert new sprite
        let placement = packer.insert(newSprite.width, newSprite.height);

        // If doesn't fit, expand canvas and try again
        let expandAttempts = 0;
        while (!placement && expandAttempts < 4) {
            // Expand canvas (alternate between width and height)
            if (expandAttempts % 2 === 0) {
                canvasWidth = Math.min(canvasWidth * 2, this.maxSize);
            } else {
                canvasHeight = Math.min(canvasHeight * 2, this.maxSize);
            }

            if (canvasWidth > this.maxSize && canvasHeight > this.maxSize) {
                throw new Error(`Cannot fit sprite - sheet would exceed ${this.maxSize}x${this.maxSize}`);
            }

            // Rebuild packer with new size
            packer = this.buildPackerFromAtlas(existingAtlas, canvasWidth, canvasHeight);
            placement = packer.insert(newSprite.width, newSprite.height);
            expandAttempts++;
        }

        if (!placement) {
            throw new Error('Could not find space for new sprite');
        }

        // Create new canvas (possibly expanded)
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Draw existing image
        ctx.drawImage(existingImg, 0, 0);

        // Draw new sprite at found position
        if (newSprite.imageData instanceof ImageData) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newSprite.width;
            tempCanvas.height = newSprite.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(newSprite.imageData, 0, 0);
            ctx.drawImage(tempCanvas, placement.x, placement.y);
        } else if (newSprite.imageData instanceof HTMLImageElement || newSprite.imageData instanceof HTMLCanvasElement) {
            ctx.drawImage(newSprite.imageData, placement.x, placement.y, newSprite.width, newSprite.height);
        }

        // Update atlas (copy existing, add new)
        const atlas = {
            size: { w: canvasWidth, h: canvasHeight },
            sprites: { ...existingAtlas.sprites }
        };

        atlas.sprites[newSprite.name] = {
            x: placement.x,
            y: placement.y,
            w: newSprite.width,
            h: newSprite.height,
            source: newSprite.source
        };

        // Preserve animations
        if (existingAtlas.animations) {
            atlas.animations = existingAtlas.animations;
        }

        const png = canvas.toDataURL('image/png');
        return { png, atlas };
    }

    /**
     * Build a MaxRectsBinPack with existing sprite placements marked as used
     */
    buildPackerFromAtlas(atlas, width, height) {
        const packer = new MaxRectsBinPack(width, height, this.padding);

        // Mark all existing sprites as used rectangles
        for (const [name, def] of Object.entries(atlas.sprites)) {
            const node = {
                x: def.x,
                y: def.y,
                width: def.w + this.padding,
                height: def.h + this.padding
            };
            packer.placeRectangle(node);
        }

        return packer;
    }

    /**
     * Remove a sprite from the master sheet (LEGACY - does full repack)
     * @deprecated Use softRemoveSprite() instead for stable coordinates
     */
    async removeSprite(existingAtlas, existingPng, spriteName) {
        // Load existing sprites
        const sprites = await this.extractSpritesFromSheet(existingAtlas, existingPng);

        // Filter out the removed sprite
        const filtered = sprites.filter(s => s.name !== spriteName);

        // Repack
        return this.packSprites(filtered);
    }

    /**
     * Remove a sprite from atlas WITHOUT repacking the image
     * Leaves a "hole" in the PNG but coordinates stay stable for other sprites.
     * @param {Object} existingAtlas - Current atlas
     * @param {string} existingPng - Current PNG (base64)
     * @param {string} spriteName - Name of sprite to remove
     * @returns {Object} {png, atlas}
     */
    async softRemoveSprite(existingAtlas, existingPng, spriteName) {
        if (!existingAtlas || !existingAtlas.sprites || !existingAtlas.sprites[spriteName]) {
            return { png: existingPng, atlas: existingAtlas };
        }

        // Get sprite location to clear
        const spriteToRemove = existingAtlas.sprites[spriteName];

        // Load and modify canvas to clear the sprite area (optional - makes holes transparent)
        const existingImg = await this.loadImage(existingPng);
        const canvas = document.createElement('canvas');
        canvas.width = existingImg.width;
        canvas.height = existingImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(existingImg, 0, 0);

        // Clear the removed sprite's area
        ctx.clearRect(spriteToRemove.x, spriteToRemove.y, spriteToRemove.w, spriteToRemove.h);

        // Remove from atlas
        const atlas = {
            size: existingAtlas.size,
            sprites: { ...existingAtlas.sprites }
        };
        delete atlas.sprites[spriteName];

        // Preserve animations
        if (existingAtlas.animations) {
            atlas.animations = existingAtlas.animations;
        }

        const png = canvas.toDataURL('image/png');
        return { png, atlas };
    }

    /**
     * Optimize/repack a sheet for export
     * Creates a tightly packed version - use for final game export
     * @param {Object} existingAtlas - Current atlas (sprawling)
     * @param {string} existingPng - Current PNG (base64)
     * @returns {Object} {png, atlas, stats: {beforeSize, afterSize, savings}}
     */
    async optimizePack(existingAtlas, existingPng) {
        // Extract all sprites
        const sprites = await this.extractSpritesFromSheet(existingAtlas, existingPng);

        if (sprites.length === 0) {
            return {
                png: null,
                atlas: { size: { w: 0, h: 0 }, sprites: {} },
                stats: { beforeSize: 0, afterSize: 0, savingsPercent: 0 }
            };
        }

        // Calculate before size
        const beforeSize = existingAtlas.size.w * existingAtlas.size.h;

        // Full repack for optimal layout
        const result = await this.packSprites(sprites);

        // Calculate after size
        const afterSize = result.atlas.size.w * result.atlas.size.h;
        const savingsPercent = Math.round((1 - afterSize / beforeSize) * 100);

        // Preserve animations from original
        if (existingAtlas.animations) {
            result.atlas.animations = existingAtlas.animations;
        }

        return {
            png: result.png,
            atlas: result.atlas,
            stats: {
                beforeSize: `${existingAtlas.size.w}x${existingAtlas.size.h}`,
                afterSize: `${result.atlas.size.w}x${result.atlas.size.h}`,
                savingsPercent
            }
        };
    }

    /**
     * Extract sprite image data from an existing sheet
     */
    async extractSpritesFromSheet(atlas, pngBase64) {
        if (!atlas || !atlas.sprites || !pngBase64) {
            return [];
        }

        // Load the PNG
        const img = await this.loadImage(pngBase64);

        // Create a canvas to extract regions
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Extract each sprite
        const sprites = [];
        for (const [name, def] of Object.entries(atlas.sprites)) {
            const imageData = ctx.getImageData(def.x, def.y, def.w, def.h);
            sprites.push({
                name,
                imageData,
                width: def.w,
                height: def.h,
                source: def.source || 'unknown'
            });
        }

        return sprites;
    }

    /**
     * Load an image from base64
     */
    loadImage(base64) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = base64;
        });
    }

    /**
     * Create ImageData from a base64 PNG
     */
    async imageDataFromBase64(base64, width, height) {
        const img = await this.loadImage(base64);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, width, height);
    }

    /**
     * Convert ImageData to base64 PNG
     */
    imageDataToBase64(imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    }
}

// =============================================
// INTEGRATION WITH SUPABASE CLIENT
// =============================================

// Extend crucibleClient with master sheet methods
if (typeof crucibleClient !== 'undefined') {
    const masterSheetManager = new MasterSheetManager();

    /**
     * Get the master sheet for a project
     */
    crucibleClient.getMasterSheet = async function(projectId) {
        const { data, error } = await this.client
            .from('projects')
            .select('master_sheet_png, master_sheet_atlas, master_sheet_updated_at')
            .eq('id', projectId)
            .single();

        if (error) throw error;
        return {
            png: data.master_sheet_png,
            atlas: data.master_sheet_atlas || { size: { w: 0, h: 0 }, sprites: {} },
            updatedAt: data.master_sheet_updated_at
        };
    };

    /**
     * Save the master sheet for a project
     */
    crucibleClient.saveMasterSheet = async function(projectId, png, atlas) {
        const { error } = await this.client
            .from('projects')
            .update({
                master_sheet_png: png,
                master_sheet_atlas: atlas,
                master_sheet_updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (error) throw error;
    };

    /**
     * Publish a tile/sprite to the master sheet
     * @param {string} projectId
     * @param {string} name - Unique sprite name
     * @param {ImageData|HTMLCanvasElement|HTMLImageElement} imageData
     * @param {number} width
     * @param {number} height
     * @param {Object|string} source - Source info object or legacy string
     *   For sprite-rite: { type: 'sprite-rite', spritesheetId, originalX, originalY, originalW, originalH }
     *   For tilesmith: { type: 'tilesmith' } or just 'tilesmith'
     */
    crucibleClient.publishToMasterSheet = async function(projectId, name, imageData, width, height, source) {
        // Get existing master sheet
        const existing = await this.getMasterSheet(projectId);

        // Add the new sprite
        const newSprite = { name, imageData, width, height, source };
        const result = await masterSheetManager.addSprite(
            existing.atlas,
            existing.png,
            newSprite
        );

        // Save updated master sheet
        await this.saveMasterSheet(projectId, result.png, result.atlas);

        return result;
    };

    /**
     * Get sprites from master sheet that originated from a specific spritesheet
     * @param {string} projectId
     * @param {string} spritesheetId
     * @returns {Array} Array of sprite definitions that came from this spritesheet
     */
    crucibleClient.getMasterSheetSpritesFromSource = async function(projectId, spritesheetId) {
        const masterSheet = await this.getMasterSheet(projectId);
        if (!masterSheet.atlas || !masterSheet.atlas.sprites) {
            return [];
        }

        const sprites = [];
        for (const [name, def] of Object.entries(masterSheet.atlas.sprites)) {
            // Check if source is an object with spritesheetId
            if (def.source && typeof def.source === 'object' && def.source.spritesheetId === spritesheetId) {
                sprites.push({
                    name,
                    masterX: def.x,
                    masterY: def.y,
                    masterW: def.w,
                    masterH: def.h,
                    // Original position on source spritesheet
                    x: def.source.originalX,
                    y: def.source.originalY,
                    width: def.source.originalW,
                    height: def.source.originalH
                });
            }
        }

        return sprites;
    };

    /**
     * Remove a sprite from the master sheet
     */
    crucibleClient.removeFromMasterSheet = async function(projectId, spriteName) {
        const existing = await this.getMasterSheet(projectId);

        const result = await masterSheetManager.removeSprite(
            existing.atlas,
            existing.png,
            spriteName
        );

        await this.saveMasterSheet(projectId, result.png, result.atlas);

        return result;
    };

    /**
     * Rebuild the entire master sheet from tiles
     * Useful for initial setup or fixing corruption
     */
    crucibleClient.rebuildMasterSheet = async function(projectId) {
        // Get all tiles for this project
        const tiles = await this.getTiles(projectId);

        // Convert tiles to sprite format
        const sprites = [];
        for (const tile of tiles) {
            if (tile.pixel_data) {
                try {
                    const img = await masterSheetManager.loadImage(tile.pixel_data);
                    sprites.push({
                        name: tile.name,
                        imageData: img,
                        width: tile.width,
                        height: tile.height,
                        source: 'tilesmith'
                    });
                } catch (e) {
                    console.warn(`Failed to load tile ${tile.name}:`, e);
                }
            }
        }

        // Pack all sprites
        const result = await masterSheetManager.packSprites(sprites);

        // Save
        await this.saveMasterSheet(projectId, result.png, result.atlas);

        return result;
    };
}

// Export for module use
window.MasterSheetManager = MasterSheetManager;
window.MaxRectsBinPack = MaxRectsBinPack;

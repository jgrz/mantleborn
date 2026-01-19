/**
 * PixelLab Client
 * Wrapper for PixelLab AI pixel art generation API
 * Calls through Supabase edge function proxy for secure token handling
 */

class PixelLabClient {
    constructor() {
        this.proxyUrl = null;
        this.supabaseClient = null;
        this.initialized = false;
    }

    /**
     * Initialize with Supabase client
     * @param {Object} supabaseClient - Initialized Supabase client
     */
    init(supabaseClient) {
        this.supabaseClient = supabaseClient;
        // Edge function URL will be: {supabase_url}/functions/v1/pixellab-proxy
        const supabaseUrl = supabaseClient.supabaseUrl ||
            (supabaseClient.client && supabaseClient.client.supabaseUrl);

        if (supabaseUrl) {
            this.proxyUrl = `${supabaseUrl}/functions/v1/pixellab-proxy`;
        }
        this.initialized = true;
    }

    /**
     * Make authenticated request to edge function proxy
     */
    async _request(endpoint, method = 'POST', body = null) {
        if (!this.initialized || !this.proxyUrl) {
            throw new Error('PixelLab client not initialized. Call init() first.');
        }

        const session = await this.supabaseClient.client.auth.getSession();
        const accessToken = session?.data?.session?.access_token;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseClient.anonKey || ''
            }
        };

        // Add auth token if available
        if (accessToken) {
            options.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        if (body) {
            options.body = JSON.stringify({
                endpoint,
                ...body
            });
        }

        const response = await fetch(this.proxyUrl, options);
        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error || data.message || `Request failed: ${response.status}`;
            const details = data.details ? ` - ${JSON.stringify(data.details)}` : '';
            console.error('PixelLab error details:', data);
            throw new Error(errorMsg + details);
        }

        return data;
    }

    // =============================================
    // CHARACTER GENERATION
    // =============================================

    /**
     * Create a new character with directional sprites
     * @param {Object} options - Generation options
     * @param {string} options.description - Character description
     * @param {number} options.directions - 4 or 8 directions
     * @param {number} options.size - Canvas size (16-128)
     * @param {string} options.proportions - Preset: default, chibi, heroic, etc.
     * @param {Object} options.style - outline, shading, detail settings
     * @param {Array} options.skeletonKeypoints - Optional pose keypoints
     * @param {number} options.skeletonGuidance - How closely to follow skeleton (0-5)
     * @returns {Promise<{characterId: string, jobId: string}>}
     */
    async createCharacter(options = {}) {
        const {
            description = 'pixel art character',
            directions = 8,
            size = 48,
            proportions = 'default',
            style = {},
            skeletonKeypoints = null,
            skeletonGuidance = 1.0,
            view = 'low top-down'
        } = options;

        const body = {
            action: 'create_character',
            description,
            n_directions: directions,  // Used by proxy to pick endpoint, stripped before sending
            image_size: { width: size, height: size },
            proportions: { type: 'preset', name: proportions },
            view,
            outline: style.outline || 'single_color_black_outline',
            shading: style.shading || 'basic_shading',
            detail: style.detail || 'medium_detail'
        };

        if (skeletonKeypoints) {
            body.skeleton_keypoints = skeletonKeypoints;
            body.skeleton_guidance_scale = skeletonGuidance;
        }

        const result = await this._request('create-character', 'POST', body);

        return {
            characterId: result.data?.character_id,
            jobId: result.data?.background_job_id || result.data?.job_id,
            raw: result
        };
    }

    /**
     * Animate an existing character
     * @param {string} characterId - ID of character to animate
     * @param {string} templateAnimation - Animation template (walk, idle, run, jump, attack, etc.)
     * @param {Object} options - Additional options
     * @returns {Promise<{jobId: string}>}
     */
    async animateCharacter(characterId, templateAnimation, options = {}) {
        const {
            actionDescription = null,
            animationName = null
        } = options;

        const body = {
            action: 'animate_character',
            character_id: characterId,
            template_animation_id: templateAnimation
        };

        if (actionDescription) {
            body.action_description = actionDescription;
        }
        if (animationName) {
            body.animation_name = animationName;
        }

        const result = await this._request('animate-character', 'POST', body);

        return {
            jobId: result.data?.job_id || result.data?.background_job_id,
            raw: result
        };
    }

    /**
     * Get character details and status
     * @param {string} characterId - Character ID
     * @returns {Promise<Object>}
     */
    async getCharacter(characterId) {
        const result = await this._request('get-character', 'POST', {
            action: 'get_character',
            character_id: characterId,
            include_preview: true
        });

        return result.data;
    }

    // =============================================
    // TILESET GENERATION
    // =============================================

    /**
     * Create a top-down Wang tileset
     * @param {Object} options - Generation options
     * @returns {Promise<{tilesetId: string, jobId: string}>}
     */
    async createTopdownTileset(options = {}) {
        const {
            lowerDescription,
            upperDescription,
            transitionDescription = null,
            transitionSize = 0.25,
            tileSize = 16,
            view = 'high top-down',
            style = {},
            lowerBaseTileId = null,
            upperBaseTileId = null
        } = options;

        const body = {
            action: 'create_topdown_tileset',
            lower_description: lowerDescription,
            upper_description: upperDescription,
            transition_size: transitionSize,
            tile_size: { width: tileSize, height: tileSize },
            view,
            outline: style.outline,
            shading: style.shading,
            detail: style.detail
        };

        if (transitionDescription) {
            body.transition_description = transitionDescription;
        }
        if (lowerBaseTileId) {
            body.lower_base_tile_id = lowerBaseTileId;
        }
        if (upperBaseTileId) {
            body.upper_base_tile_id = upperBaseTileId;
        }

        const result = await this._request('create-tileset', 'POST', body);

        return {
            tilesetId: result.data?.tileset_id,
            jobId: result.data?.job_id || result.data?.background_job_id,
            lowerBaseTileId: result.data?.lower_base_tile_id,
            upperBaseTileId: result.data?.upper_base_tile_id,
            raw: result
        };
    }

    /**
     * Create a sidescroller platform tileset
     * @param {Object} options - Generation options
     * @returns {Promise<{tilesetId: string, jobId: string}>}
     */
    async createSidescrollerTileset(options = {}) {
        const {
            lowerDescription,
            transitionDescription = null,
            transitionSize = 0.25,
            tileSize = 16,
            style = {},
            baseTileId = null
        } = options;

        const body = {
            action: 'create_sidescroller_tileset',
            lower_description: lowerDescription,
            transition_description: transitionDescription || '',
            transition_size: transitionSize,
            tile_size: { width: tileSize, height: tileSize },
            outline: style.outline,
            shading: style.shading,
            detail: style.detail
        };

        if (baseTileId) {
            body.base_tile_id = baseTileId;
        }

        const result = await this._request('create-sidescroller-tileset', 'POST', body);

        return {
            tilesetId: result.data?.tileset_id,
            jobId: result.data?.job_id || result.data?.background_job_id,
            baseTileId: result.data?.base_tile_id,
            raw: result
        };
    }

    /**
     * Get tileset details and status
     * @param {string} tilesetId - Tileset ID
     * @param {string} type - 'topdown' or 'sidescroller'
     * @returns {Promise<Object>}
     */
    async getTileset(tilesetId, type = 'topdown') {
        const action = type === 'sidescroller'
            ? 'get_sidescroller_tileset'
            : 'get_topdown_tileset';

        const result = await this._request(`get-${type}-tileset`, 'POST', {
            action,
            tileset_id: tilesetId
        });

        return result.data;
    }

    // =============================================
    // ISOMETRIC TILE GENERATION
    // =============================================

    /**
     * Create a single isometric tile
     * @param {Object} options - Generation options
     * @returns {Promise<{tileId: string, jobId: string}>}
     */
    async createIsometricTile(options = {}) {
        const {
            description,
            size = 32,
            tileShape = 'block', // 'thin', 'thick', 'block'
            style = {}
        } = options;

        const body = {
            action: 'create_isometric_tile',
            description,
            size,
            tile_shape: tileShape,
            outline: style.outline || 'lineless',
            shading: style.shading || 'basic shading',
            detail: style.detail || 'medium detail'
        };

        const result = await this._request('create-isometric-tile', 'POST', body);

        return {
            tileId: result.data?.tile_id,
            jobId: result.data?.job_id || result.data?.background_job_id,
            raw: result
        };
    }

    /**
     * Get isometric tile details
     * @param {string} tileId - Tile ID
     * @returns {Promise<Object>}
     */
    async getIsometricTile(tileId) {
        const result = await this._request('get-isometric-tile', 'POST', {
            action: 'get_isometric_tile',
            tile_id: tileId
        });

        return result.data;
    }

    // =============================================
    // MAP OBJECTS
    // =============================================

    /**
     * Create a map object with transparent background
     * @param {Object} options - Generation options
     * @returns {Promise<{objectId: string, jobId: string}>}
     */
    async createMapObject(options = {}) {
        const {
            description,
            width = 32,
            height = 32,
            view = 'high top-down',
            style = {}
        } = options;

        const body = {
            action: 'create_map_object',
            description,
            width,
            height,
            view,
            outline: style.outline || 'single color outline',
            shading: style.shading || 'medium shading',
            detail: style.detail || 'medium detail'
        };

        const result = await this._request('create-map-object', 'POST', body);

        return {
            objectId: result.data?.object_id,
            jobId: result.data?.job_id || result.data?.background_job_id,
            raw: result
        };
    }

    /**
     * Get map object details
     * @param {string} objectId - Object ID
     * @returns {Promise<Object>}
     */
    async getMapObject(objectId) {
        const result = await this._request('get-map-object', 'POST', {
            action: 'get_map_object',
            object_id: objectId
        });

        return result.data;
    }

    // =============================================
    // SKELETON / POSE
    // =============================================

    /**
     * Estimate skeleton keypoints from an existing sprite image
     * @param {string} imageBase64 - Base64 encoded PNG image
     * @returns {Promise<Array>} - Array of keypoints
     */
    async estimateSkeleton(imageBase64) {
        const result = await this._request('estimate-skeleton', 'POST', {
            action: 'estimate_skeleton',
            image: imageBase64
        });

        return result.data?.keypoints || [];
    }

    // =============================================
    // JOB STATUS
    // =============================================

    /**
     * Get status of a background job
     * @param {string} jobId - Job ID
     * @returns {Promise<{status: string, result: Object}>}
     */
    async getJobStatus(jobId) {
        const result = await this._request('job-status', 'POST', {
            action: 'get_job_status',
            job_id: jobId
        });

        return {
            status: result.data?.status || 'unknown',
            result: result.data?.result,
            progress: result.data?.progress,
            eta: result.data?.eta_seconds,
            raw: result
        };
    }

    /**
     * Poll job until complete or failed
     * @param {string} jobId - Job ID
     * @param {Object} options - Polling options
     * @returns {Promise<Object>} - Final result
     */
    async pollJob(jobId, options = {}) {
        const {
            interval = 10000, // 10 seconds
            timeout = 600000, // 10 minutes
            onProgress = null
        } = options;

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const status = await this.getJobStatus(jobId);

            if (onProgress) {
                onProgress(status);
            }

            if (status.status === 'completed') {
                return status.result;
            }

            if (status.status === 'failed') {
                throw new Error(`Job failed: ${status.result?.error || 'Unknown error'}`);
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error('Job polling timeout');
    }

    // =============================================
    // DOWNLOAD HELPERS
    // =============================================

    /**
     * Download asset as blob
     * @param {string} url - Download URL
     * @returns {Promise<Blob>}
     */
    async downloadAsset(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }
        return response.blob();
    }

    /**
     * Download asset as base64 data URL
     * @param {string} url - Download URL
     * @returns {Promise<string>}
     */
    async downloadAsBase64(url) {
        const blob = await this.downloadAsset(url);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Download asset as Image element
     * @param {string} url - Download URL
     * @returns {Promise<HTMLImageElement>}
     */
    async downloadAsImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}

// =============================================
// SKELETON KEYPOINT PRESETS
// =============================================

const SKELETON_PRESETS = {
    idle: {
        name: 'Idle',
        keypoints: [
            { name: 'head', x: 0.5, y: 0.15 },
            { name: 'neck', x: 0.5, y: 0.22 },
            { name: 'left_shoulder', x: 0.35, y: 0.25 },
            { name: 'right_shoulder', x: 0.65, y: 0.25 },
            { name: 'left_elbow', x: 0.3, y: 0.38 },
            { name: 'right_elbow', x: 0.7, y: 0.38 },
            { name: 'left_hand', x: 0.28, y: 0.52 },
            { name: 'right_hand', x: 0.72, y: 0.52 },
            { name: 'torso', x: 0.5, y: 0.4 },
            { name: 'left_hip', x: 0.42, y: 0.55 },
            { name: 'right_hip', x: 0.58, y: 0.55 },
            { name: 'left_knee', x: 0.4, y: 0.72 },
            { name: 'right_knee', x: 0.6, y: 0.72 },
            { name: 'left_foot', x: 0.38, y: 0.9 },
            { name: 'right_foot', x: 0.62, y: 0.9 }
        ]
    },
    walk1: {
        name: 'Walk Frame 1',
        keypoints: [
            { name: 'head', x: 0.5, y: 0.15 },
            { name: 'neck', x: 0.5, y: 0.22 },
            { name: 'left_shoulder', x: 0.35, y: 0.25 },
            { name: 'right_shoulder', x: 0.65, y: 0.25 },
            { name: 'left_elbow', x: 0.25, y: 0.35 },
            { name: 'right_elbow', x: 0.75, y: 0.4 },
            { name: 'left_hand', x: 0.2, y: 0.48 },
            { name: 'right_hand', x: 0.78, y: 0.55 },
            { name: 'torso', x: 0.5, y: 0.4 },
            { name: 'left_hip', x: 0.42, y: 0.55 },
            { name: 'right_hip', x: 0.58, y: 0.55 },
            { name: 'left_knee', x: 0.35, y: 0.7 },
            { name: 'right_knee', x: 0.65, y: 0.75 },
            { name: 'left_foot', x: 0.3, y: 0.88 },
            { name: 'right_foot', x: 0.68, y: 0.92 }
        ]
    },
    walk2: {
        name: 'Walk Frame 2',
        keypoints: [
            { name: 'head', x: 0.5, y: 0.15 },
            { name: 'neck', x: 0.5, y: 0.22 },
            { name: 'left_shoulder', x: 0.35, y: 0.25 },
            { name: 'right_shoulder', x: 0.65, y: 0.25 },
            { name: 'left_elbow', x: 0.28, y: 0.4 },
            { name: 'right_elbow', x: 0.72, y: 0.35 },
            { name: 'left_hand', x: 0.25, y: 0.55 },
            { name: 'right_hand', x: 0.75, y: 0.48 },
            { name: 'torso', x: 0.5, y: 0.4 },
            { name: 'left_hip', x: 0.42, y: 0.55 },
            { name: 'right_hip', x: 0.58, y: 0.55 },
            { name: 'left_knee', x: 0.48, y: 0.75 },
            { name: 'right_knee', x: 0.52, y: 0.7 },
            { name: 'left_foot', x: 0.52, y: 0.92 },
            { name: 'right_foot', x: 0.48, y: 0.88 }
        ]
    },
    attack: {
        name: 'Attack',
        keypoints: [
            { name: 'head', x: 0.45, y: 0.15 },
            { name: 'neck', x: 0.45, y: 0.22 },
            { name: 'left_shoulder', x: 0.3, y: 0.25 },
            { name: 'right_shoulder', x: 0.6, y: 0.23 },
            { name: 'left_elbow', x: 0.2, y: 0.35 },
            { name: 'right_elbow', x: 0.8, y: 0.2 },
            { name: 'left_hand', x: 0.15, y: 0.48 },
            { name: 'right_hand', x: 0.95, y: 0.15 },
            { name: 'torso', x: 0.45, y: 0.4 },
            { name: 'left_hip', x: 0.38, y: 0.55 },
            { name: 'right_hip', x: 0.55, y: 0.55 },
            { name: 'left_knee', x: 0.35, y: 0.72 },
            { name: 'right_knee', x: 0.6, y: 0.7 },
            { name: 'left_foot', x: 0.3, y: 0.9 },
            { name: 'right_foot', x: 0.65, y: 0.88 }
        ]
    },
    jump: {
        name: 'Jump',
        keypoints: [
            { name: 'head', x: 0.5, y: 0.1 },
            { name: 'neck', x: 0.5, y: 0.18 },
            { name: 'left_shoulder', x: 0.32, y: 0.2 },
            { name: 'right_shoulder', x: 0.68, y: 0.2 },
            { name: 'left_elbow', x: 0.2, y: 0.15 },
            { name: 'right_elbow', x: 0.8, y: 0.15 },
            { name: 'left_hand', x: 0.12, y: 0.08 },
            { name: 'right_hand', x: 0.88, y: 0.08 },
            { name: 'torso', x: 0.5, y: 0.35 },
            { name: 'left_hip', x: 0.42, y: 0.5 },
            { name: 'right_hip', x: 0.58, y: 0.5 },
            { name: 'left_knee', x: 0.35, y: 0.62 },
            { name: 'right_knee', x: 0.65, y: 0.62 },
            { name: 'left_foot', x: 0.32, y: 0.75 },
            { name: 'right_foot', x: 0.68, y: 0.75 }
        ]
    }
};

// =============================================
// ANIMATION TEMPLATES
// =============================================

const ANIMATION_TEMPLATES = [
    { id: 'idle', name: 'Idle', description: 'Standing still, breathing animation' },
    { id: 'walk', name: 'Walk', description: 'Walking forward cycle' },
    { id: 'run', name: 'Run', description: 'Running forward cycle' },
    { id: 'jump', name: 'Jump', description: 'Jump up animation' },
    { id: 'fall', name: 'Fall', description: 'Falling down animation' },
    { id: 'attack', name: 'Attack', description: 'Basic attack swing' },
    { id: 'hurt', name: 'Hurt', description: 'Taking damage reaction' },
    { id: 'death', name: 'Death', description: 'Death/defeat animation' },
    { id: 'cast', name: 'Cast', description: 'Magic casting animation' },
    { id: 'interact', name: 'Interact', description: 'Interaction/pickup animation' }
];

// =============================================
// STYLE PRESETS
// =============================================

const STYLE_PRESETS = {
    retro: {
        name: 'Retro',
        outline: 'single color black outline',
        shading: 'basic shading',
        detail: 'low detail'
    },
    modern: {
        name: 'Modern',
        outline: 'lineless',
        shading: 'detailed shading',
        detail: 'high detail'
    },
    standard: {
        name: 'Standard',
        outline: 'single color black outline',
        shading: 'basic shading',
        detail: 'medium detail'
    },
    soft: {
        name: 'Soft',
        outline: 'colored outline',
        shading: 'soft shading',
        detail: 'medium detail'
    }
};

// =============================================
// EXPORTS
// =============================================

// Create singleton instance
const pixelLabClient = new PixelLabClient();

// Export for browser use
if (typeof window !== 'undefined') {
    window.PixelLabClient = PixelLabClient;
    window.pixelLabClient = pixelLabClient;
    window.SKELETON_PRESETS = SKELETON_PRESETS;
    window.ANIMATION_TEMPLATES = ANIMATION_TEMPLATES;
    window.STYLE_PRESETS = STYLE_PRESETS;
}

// Export for CommonJS/Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PixelLabClient,
        pixelLabClient,
        SKELETON_PRESETS,
        ANIMATION_TEMPLATES,
        STYLE_PRESETS
    };
}

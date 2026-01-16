/**
 * CRUCIBLE OF CODE - Shared Supabase Client
 *
 * This module provides a singleton client for all Game Wizard tools
 * to communicate with the Supabase backend.
 */

// =============================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================
const SUPABASE_URL = 'https://qcubqjuhwqukjdjamczp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdWJxanVod3F1a2pkamFtY3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTk1NzMsImV4cCI6MjA4NDAzNTU3M30.ljFdf-AtxQkT_RTf6bnMd7VFtxinUgDSJVA-iS1b0rg';

// =============================================
// CRUCIBLE CLIENT CLASS
// =============================================
class CrucibleClient {
    constructor() {
        this.client = null;
        this.initialized = false;
        this.context = {
            projectId: null,
            projectName: null,
            levelId: null,
            levelSlug: null
        };
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    async init() {
        if (this.initialized) return this;

        // Check configuration
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Crucible: Supabase not configured. Edit game-wizard/shared/supabase-client.js');
            return this;
        }

        // Load Supabase from CDN if not already loaded
        if (!window.supabase) {
            await this.loadSupabaseScript();
        }

        // Create client
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.initialized = true;

        // Load context from URL params or localStorage
        this.loadContext();

        return this;
    }

    async loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    isConfigured() {
        return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    }

    // =============================================
    // AUTHENTICATION
    // =============================================

    async signUp(email, password, displayName = null) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName || email.split('@')[0]
                }
            }
        });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client.auth.signOut();
        if (error) throw error;
        return true;
    }

    async getUser() {
        if (!this.client) return null;

        const { data: { user }, error } = await this.client.auth.getUser();
        if (error) return null;
        return user;
    }

    async getSession() {
        if (!this.client) return null;

        const { data: { session }, error } = await this.client.auth.getSession();
        if (error) return null;
        return session;
    }

    onAuthStateChange(callback) {
        if (!this.client) return null;

        return this.client.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    async getProfile(userId = null) {
        if (!this.client) throw new Error('Crucible not initialized');

        // If no userId, get current user's profile
        if (!userId) {
            const user = await this.getUser();
            if (!user) return null;
            userId = user.id;
        }

        const { data, error } = await this.client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data;
    }

    async updateProfile(updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.client
            .from('profiles')
            .update({
                username: updates.username,
                display_name: updates.displayName,
                avatar_url: updates.avatarUrl
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async resetPassword(email) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/game-wizard/auth/reset-password.html`
        });

        if (error) throw error;
        return true;
    }

    async updatePassword(newPassword) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return true;
    }

    // =============================================
    // CONTEXT MANAGEMENT
    // =============================================

    loadContext() {
        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        const levelSlug = params.get('level');

        if (projectId) {
            this.context.projectId = projectId;
            localStorage.setItem('crucible_project_id', projectId);
        } else {
            this.context.projectId = localStorage.getItem('crucible_project_id');
        }

        if (levelSlug) {
            this.context.levelSlug = levelSlug;
            localStorage.setItem('crucible_level_slug', levelSlug);
        } else {
            this.context.levelSlug = localStorage.getItem('crucible_level_slug');
        }
    }

    setContext(projectId, levelId, levelSlug) {
        this.context.projectId = projectId;
        this.context.levelId = levelId;
        this.context.levelSlug = levelSlug;

        if (projectId) localStorage.setItem('crucible_project_id', projectId);
        if (levelSlug) localStorage.setItem('crucible_level_slug', levelSlug);
    }

    getContext() {
        return { ...this.context };
    }

    clearContext() {
        this.context = { projectId: null, projectName: null, levelId: null, levelSlug: null };
        localStorage.removeItem('crucible_project_id');
        localStorage.removeItem('crucible_level_slug');
    }

    // =============================================
    // PROJECT OPERATIONS
    // =============================================

    async createProject(name, description = '', isPublic = false) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Require authentication to create projects
        const user = await this.getUser();
        if (!user) {
            throw new Error('You must be logged in to create a project');
        }

        const { data, error } = await this.client
            .from('projects')
            .insert({
                name,
                description,
                is_public: isPublic,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;

        this.setContext(data.id, null, null);
        this.context.projectName = name;

        return data;
    }

    async getProjects() {
        if (!this.client) throw new Error('Crucible not initialized');

        // Returns projects user can see (their own + public)
        const { data, error } = await this.client
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getMyProjects() {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();
        if (!user) return [];

        const { data, error } = await this.client
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getPublicProjects() {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('projects')
            .select('*')
            .eq('is_public', true)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getProject(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;
        return data;
    }

    async deleteProject(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;

        if (this.context.projectId === projectId) {
            this.clearContext();
        }
    }

    async updateProject(projectId, updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('projects')
            .update(updates)
            .eq('id', projectId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async hasProjects() {
        if (!this.client) return false;

        const user = await this.getUser();
        if (!user) return false;

        const { data, error } = await this.client
            .from('projects')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        if (error) return false;
        return data && data.length > 0;
    }

    async getProjectSettings(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('projects')
            .select('settings')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        // Return settings with sensible defaults
        // Support both new (characterStyle/tileStyle) and old (defaultStyle) formats
        const settings = data?.settings || {};
        const pl = settings.pixellab || {};

        // For backwards compatibility, fall back to defaultStyle if new format not present
        const charStyle = pl.characterStyle || pl.defaultStyle || {};
        const tileStyle = pl.tileStyle || pl.defaultStyle || {};

        return {
            gameView: settings.gameView || 'top-down',
            pixellab: {
                characterStyle: {
                    outline: charStyle.outline || 'single_color_black',
                    shading: charStyle.shading || 'basic',
                    detail: charStyle.detail || 'medium',
                    view: charStyle.view || 'low_top_down'
                },
                tileStyle: {
                    outline: tileStyle.outline || 'no_outline',
                    shading: tileStyle.shading || 'basic',
                    detail: tileStyle.detail || 'medium',
                    view: tileStyle.view || 'low_top_down'
                },
                tileDefaults: {
                    size: pl.tileDefaults?.size || 16,
                    transitionSize: pl.tileDefaults?.transitionSize || 'medium'
                },
                characterDefaults: {
                    size: pl.characterDefaults?.size || 32,
                    directions: pl.characterDefaults?.directions || 4
                }
            }
        };
    }

    // =============================================
    // LEVEL OPERATIONS
    // =============================================

    async createLevel(projectId, name, levelType = 'platformer', width = 32, height = 18) {
        if (!this.client) throw new Error('Crucible not initialized');

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

        const { data, error } = await this.client
            .from('levels')
            .insert({
                project_id: projectId,
                name,
                slug,
                level_type: levelType,
                width,
                height
            })
            .select()
            .single();

        if (error) throw error;

        this.setContext(projectId, data.id, slug);

        return data;
    }

    async getLevels(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('levels')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getLevel(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('levels')
            .select(`
                *,
                level_grids (*),
                level_backgrounds (*),
                level_tiles (*)
            `)
            .eq('id', levelId)
            .single();

        if (error) throw error;
        return data;
    }

    async getLevelBySlug(projectId, slug) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('levels')
            .select(`
                *,
                level_grids (*),
                level_backgrounds (*),
                level_tiles (*)
            `)
            .eq('project_id', projectId)
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    }

    async deleteLevel(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('levels')
            .delete()
            .eq('id', levelId);

        if (error) throw error;

        if (this.context.levelId === levelId) {
            this.context.levelId = null;
            this.context.levelSlug = null;
        }
    }

    // =============================================
    // GRID DATA OPERATIONS
    // =============================================

    async saveGridData(levelId, gridData, spawnPoint, walkable, obstructions, physicsConfig) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Check if grid exists
        const { data: existing } = await this.client
            .from('level_grids')
            .select('id')
            .eq('level_id', levelId)
            .single();

        const payload = {
            level_id: levelId,
            grid_data: gridData,
            spawn_point: spawnPoint,
            walkable: walkable,
            obstructions: obstructions,
            physics_config: physicsConfig
        };

        let result;
        if (existing) {
            result = await this.client
                .from('level_grids')
                .update(payload)
                .eq('level_id', levelId)
                .select()
                .single();
        } else {
            result = await this.client
                .from('level_grids')
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return result.data;
    }

    async getGridData(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_grids')
            .select('*')
            .eq('level_id', levelId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
        return data;
    }

    // =============================================
    // BACKGROUND OPERATIONS
    // =============================================

    async saveBackgroundLayers(levelId, layers) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Delete existing layers for this level
        await this.client
            .from('level_backgrounds')
            .delete()
            .eq('level_id', levelId);

        if (layers.length === 0) return [];

        // Insert new layers
        const payload = layers.map((layer, index) => ({
            level_id: levelId,
            layer_name: layer.name,
            image_path: layer.imageSrc, // Data URL for now, could be storage path
            depth: layer.depth,
            scroll_rate: layer.scrollRate,
            offset_x: layer.offsetX,
            offset_y: layer.offsetY,
            scale: layer.scale,
            visible: layer.visible,
            pixelify_config: layer.pixelifyConfig || null,
            sort_order: index
        }));

        const { data, error } = await this.client
            .from('level_backgrounds')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    }

    async getBackgroundLayers(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_backgrounds')
            .select('*')
            .eq('level_id', levelId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // =============================================
    // TILE DATA OPERATIONS
    // =============================================

    async saveTileData(levelId, tileData) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Check if tiles exist
        const { data: existing } = await this.client
            .from('level_tiles')
            .select('id')
            .eq('level_id', levelId)
            .single();

        const payload = {
            level_id: levelId,
            tile_data: tileData
        };

        let result;
        if (existing) {
            result = await this.client
                .from('level_tiles')
                .update(payload)
                .eq('level_id', levelId)
                .select()
                .single();
        } else {
            result = await this.client
                .from('level_tiles')
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return result.data;
    }

    async getTileData(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_tiles')
            .select('*')
            .eq('level_id', levelId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // =============================================
    // IMAGE UPLOAD (Storage Bucket)
    // =============================================

    async uploadBackgroundImage(projectId, levelSlug, layerName, file) {
        if (!this.client) throw new Error('Crucible not initialized');

        const path = `${projectId}/${levelSlug}/${layerName}_${Date.now()}.png`;

        const { data, error } = await this.client.storage
            .from('backgrounds')
            .upload(path, file, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = this.client.storage
            .from('backgrounds')
            .getPublicUrl(path);

        return urlData.publicUrl;
    }

    // =============================================
    // EXPORT: Compile Level to Game-Ready JSON
    // =============================================

    async compileLevel(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const level = await this.getLevel(levelId);
        if (!level) throw new Error('Level not found');

        const grid = level.level_grids;
        const backgrounds = level.level_backgrounds || [];
        const tiles = level.level_tiles;

        return {
            name: level.name,
            type: level.level_type,
            width: level.width,
            height: level.height,
            tileSize: level.tile_size,
            physics: grid?.physics_config || {
                gravity: level.level_type === 'platformer',
                gravityStrength: level.level_type === 'platformer' ? 1800 : 0,
                collisionMode: level.level_type === 'platformer' ? 'solid' : 'blocking'
            },
            spawn: grid?.spawn_point || null,
            grid: grid?.grid_data || [],
            walkable: grid?.walkable || [],
            obstructions: grid?.obstructions || [],
            backgrounds: backgrounds.map(bg => ({
                name: bg.layer_name,
                imageSrc: bg.image_path,
                depth: bg.depth,
                scrollRate: parseFloat(bg.scroll_rate),
                offsetX: bg.offset_x,
                offsetY: bg.offset_y,
                scale: parseFloat(bg.scale),
                visible: bg.visible
            })),
            visualTiles: tiles?.tile_data || [],
            meta: {
                levelId: level.id,
                projectId: level.project_id,
                compiledAt: new Date().toISOString()
            }
        };
    }

    // =============================================
    // SPAWN OPERATIONS
    // =============================================

    async saveSpawns(levelId, spawns) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Delete existing spawns for this level
        await this.client
            .from('level_spawns')
            .delete()
            .eq('level_id', levelId);

        if (spawns.length === 0) return [];

        const payload = spawns.map(spawn => ({
            level_id: levelId,
            name: spawn.name,
            grid_x: spawn.x,
            grid_y: spawn.y,
            direction: spawn.direction || 'down',
            is_primary: spawn.isPrimary || false
        }));

        const { data, error } = await this.client
            .from('level_spawns')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    }

    async getSpawns(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_spawns')
            .select('*')
            .eq('level_id', levelId)
            .order('is_primary', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // =============================================
    // EXIT OPERATIONS
    // =============================================

    async saveExits(levelId, exits) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Delete existing exits for this level
        await this.client
            .from('level_exits')
            .delete()
            .eq('level_id', levelId);

        if (exits.length === 0) return [];

        const payload = exits.map(exit => ({
            level_id: levelId,
            name: exit.name,
            grid_x: exit.x,
            grid_y: exit.y,
            direction: exit.direction || 'right',
            exit_type: exit.type || 'exit',
            target_level_id: exit.targetLevelId || null,
            target_spawn_name: exit.targetSpawnName || null,
            configured: exit.configured || false
        }));

        const { data, error } = await this.client
            .from('level_exits')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    }

    async getExits(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_exits')
            .select('*')
            .eq('level_id', levelId);

        if (error) throw error;
        return data || [];
    }

    async configureExit(exitId, targetLevelId, targetSpawnName) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_exits')
            .update({
                target_level_id: targetLevelId,
                target_spawn_name: targetSpawnName,
                configured: true
            })
            .eq('id', exitId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async unconfigureExit(exitId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_exits')
            .update({
                target_level_id: null,
                target_spawn_name: null,
                configured: false
            })
            .eq('id', exitId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =============================================
    // CONNECTION OPERATIONS (for Portals)
    // =============================================

    async createConnection(projectId, sourceExitId, targetSpawnId, bidirectional = false, returnExitId = null) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_connections')
            .insert({
                project_id: projectId,
                source_exit_id: sourceExitId,
                target_spawn_id: targetSpawnId,
                bidirectional: bidirectional,
                return_exit_id: returnExitId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getProjectConnections(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('level_connections')
            .select(`
                *,
                source_exit:level_exits!source_exit_id (
                    *,
                    level:levels!level_id (id, name, slug)
                ),
                target_spawn:level_spawns!target_spawn_id (
                    *,
                    level:levels!level_id (id, name, slug)
                )
            `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data || [];
    }

    async deleteConnection(connectionId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('level_connections')
            .delete()
            .eq('id', connectionId);

        if (error) throw error;
    }

    // =============================================
    // ENHANCED LEVEL QUERY (with spawns/exits)
    // =============================================

    async getLevelWithPortals(levelId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('levels')
            .select(`
                *,
                level_grids (*),
                level_backgrounds (*),
                level_tiles (*),
                level_spawns (*),
                level_exits (*)
            `)
            .eq('id', levelId)
            .single();

        if (error) throw error;
        return data;
    }

    async getProjectLevelsWithPortalCounts(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('levels')
            .select(`
                *,
                level_spawns (id),
                level_exits (id, configured)
            `)
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Transform to include counts
        return (data || []).map(level => ({
            ...level,
            spawnCount: level.level_spawns?.length || 0,
            exitCount: level.level_exits?.length || 0,
            unconfiguredExitCount: level.level_exits?.filter(e => !e.configured).length || 0
        }));
    }

    // =============================================
    // SPRITESHEETS
    // =============================================

    async uploadSpritesheet(projectId, file, metadata = {}) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Get current user for ownership
        const user = await this.getUser();

        // Generate unique file path
        const ext = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}-${file.name}`;

        // Upload to storage
        const { data: uploadData, error: uploadError } = await this.client.storage
            .from('spritesheets')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = this.client.storage
            .from('spritesheets')
            .getPublicUrl(fileName);

        // Create metadata record
        const { data, error } = await this.client
            .from('spritesheets')
            .insert({
                project_id: projectId,
                user_id: user?.id || null,
                name: metadata.name || file.name.replace(/\.[^/.]+$/, ''),
                file_path: fileName,
                category: metadata.category || null,
                tags: metadata.tags || [],
                frame_width: metadata.frameWidth || null,
                frame_height: metadata.frameHeight || null,
                columns: metadata.columns || null,
                rows: metadata.rows || null,
                animations: metadata.animations || {},
                is_master: metadata.isMaster || false
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, publicUrl };
    }

    async createSpritesheet(projectId, name, options = {}) {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();

        const { data, error } = await this.client
            .from('spritesheets')
            .insert({
                project_id: projectId,
                user_id: user?.id || null,
                name: name,
                category: options.category || 'characters',
                tags: options.tags || [],
                frame_width: options.frameWidth || 32,
                frame_height: options.frameHeight || 32,
                columns: options.columns || 1,
                rows: options.rows || 1,
                sprites: options.sprites || [],
                is_master: false
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getSpritesheets(projectId, filters = {}) {
        if (!this.client) throw new Error('Crucible not initialized');

        let query = this.client
            .from('spritesheets')
            .select('*')
            .eq('project_id', projectId);

        // Apply filters
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.tag) {
            query = query.contains('tags', [filters.tag]);
        }
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        if (typeof filters.isMaster === 'boolean') {
            query = query.eq('is_master', filters.isMaster);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        // Add public URLs
        return (data || []).map(sheet => ({
            ...sheet,
            publicUrl: this.client.storage.from('spritesheets').getPublicUrl(sheet.file_path).data.publicUrl
        }));
    }

    async getSpritesheet(spritesheetId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('spritesheets')
            .select('*')
            .eq('id', spritesheetId)
            .single();

        if (error) throw error;
        return {
            ...data,
            publicUrl: this.client.storage.from('spritesheets').getPublicUrl(data.file_path).data.publicUrl
        };
    }

    async updateSpritesheet(spritesheetId, updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.tags !== undefined) updateData.tags = updates.tags;
        if (updates.frameWidth !== undefined) updateData.frame_width = updates.frameWidth;
        if (updates.frameHeight !== undefined) updateData.frame_height = updates.frameHeight;
        if (updates.columns !== undefined) updateData.columns = updates.columns;
        if (updates.rows !== undefined) updateData.rows = updates.rows;
        if (updates.animations !== undefined) updateData.animations = updates.animations;
        if (updates.isMaster !== undefined) updateData.is_master = updates.isMaster;
        if (updates.sprites !== undefined) updateData.sprites = updates.sprites;

        const { data, error } = await this.client
            .from('spritesheets')
            .update(updateData)
            .eq('id', spritesheetId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateSpritesheetImage(spritesheetId, imageBlob) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Get current file path
        const { data: sheet, error: fetchError } = await this.client
            .from('spritesheets')
            .select('file_path, project_id')
            .eq('id', spritesheetId)
            .single();

        if (fetchError) throw fetchError;

        // Upload new image with same path (overwrites using upsert)
        const { error: uploadError } = await this.client.storage
            .from('spritesheets')
            .upload(sheet.file_path, imageBlob, {
                contentType: 'image/png',
                upsert: true,
                cacheControl: '0'
            });

        if (uploadError) throw uploadError;

        // Get new public URL (with cache-busting timestamp)
        const { data: { publicUrl } } = this.client.storage
            .from('spritesheets')
            .getPublicUrl(sheet.file_path);

        return publicUrl + '?t=' + Date.now();
    }

    async deleteSpritesheet(spritesheetId) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Get file path first
        const { data: sheet, error: fetchError } = await this.client
            .from('spritesheets')
            .select('file_path')
            .eq('id', spritesheetId)
            .single();

        if (fetchError) throw fetchError;

        // Delete from storage
        const { error: storageError } = await this.client.storage
            .from('spritesheets')
            .remove([sheet.file_path]);

        if (storageError) throw storageError;

        // Delete metadata record
        const { error } = await this.client
            .from('spritesheets')
            .delete()
            .eq('id', spritesheetId);

        if (error) throw error;
        return true;
    }

    async searchSpritesheetsByTags(projectId, tags) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('spritesheets')
            .select('*')
            .eq('project_id', projectId)
            .overlaps('tags', tags);

        if (error) throw error;

        return (data || []).map(sheet => ({
            ...sheet,
            publicUrl: this.client.storage.from('spritesheets').getPublicUrl(sheet.file_path).data.publicUrl
        }));
    }

    async getSpritesheetCategories(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('spritesheets')
            .select('category')
            .eq('project_id', projectId)
            .not('category', 'is', null);

        if (error) throw error;

        // Return unique categories
        return [...new Set(data.map(d => d.category))];
    }

    async getAllSpritesheetTags(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('spritesheets')
            .select('tags')
            .eq('project_id', projectId);

        if (error) throw error;

        // Flatten and dedupe all tags
        const allTags = data.flatMap(d => d.tags || []);
        return [...new Set(allTags)].sort();
    }

    // =============================================
    // ANIMATIONS
    // =============================================

    async createAnimation(spritesheetId, name, frames = [], options = {}) {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();

        const insertData = {
            user_id: user?.id || null,
            name: name,
            frames: frames,
            fps: options.fps || 12,
            loop: options.loop !== undefined ? options.loop : true
        };

        // Support either spritesheet_id or project_id (for master sheet animations)
        if (options.projectId) {
            insertData.project_id = options.projectId;
        }
        if (spritesheetId && spritesheetId !== '__master__') {
            insertData.spritesheet_id = spritesheetId;
        }

        const { data, error } = await this.client
            .from('animations')
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAnimations(spritesheetId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('animations')
            .select('*')
            .eq('spritesheet_id', spritesheetId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getProjectAnimations(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('animations')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getAnimation(animationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('animations')
            .select('*')
            .eq('id', animationId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateAnimation(animationId, updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.frames !== undefined) updateData.frames = updates.frames;
        if (updates.fps !== undefined) updateData.fps = updates.fps;
        if (updates.loop !== undefined) updateData.loop = updates.loop;

        const { data, error } = await this.client
            .from('animations')
            .update(updateData)
            .eq('id', animationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteAnimation(animationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('animations')
            .delete()
            .eq('id', animationId);

        if (error) throw error;
        return true;
    }

    async getSpritesheetWithAnimations(spritesheetId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('spritesheets')
            .select(`
                *,
                animations (*)
            `)
            .eq('id', spritesheetId)
            .single();

        if (error) throw error;
        return {
            ...data,
            publicUrl: this.client.storage.from('spritesheets').getPublicUrl(data.file_path).data.publicUrl
        };
    }

    // =============================================
    // TILES (Tilesmith)
    // =============================================

    async createTile(projectId, tileData) {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();

        const { data, error } = await this.client
            .from('tiles')
            .insert({
                project_id: projectId,
                user_id: user?.id || null,
                name: tileData.name,
                width: tileData.width || 16,
                height: tileData.height || 16,
                pixel_data: tileData.pixelData,
                palette: tileData.palette || [],
                tile_type: tileData.tileType || null,
                tags: tileData.tags || [],
                metadata: tileData.metadata || {},
                spec_id: tileData.specId || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getTiles(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('tiles')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async getTile(tileId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('tiles')
            .select('*')
            .eq('id', tileId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateTile(tileId, updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.width !== undefined) updateData.width = updates.width;
        if (updates.height !== undefined) updateData.height = updates.height;
        if (updates.pixelData !== undefined) updateData.pixel_data = updates.pixelData;
        if (updates.palette !== undefined) updateData.palette = updates.palette;
        if (updates.tileType !== undefined) updateData.tile_type = updates.tileType;
        if (updates.tags !== undefined) updateData.tags = updates.tags;
        if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
        if (updates.specId !== undefined) updateData.spec_id = updates.specId;

        const { data, error } = await this.client
            .from('tiles')
            .update(updateData)
            .eq('id', tileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTile(tileId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('tiles')
            .delete()
            .eq('id', tileId);

        if (error) throw error;
        return true;
    }

    // =============================================
    // TILE SPECIFICATIONS (AI-generated)
    // =============================================

    async generateTileSpec(request) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Call the edge function
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/generate-tile-spec`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate tile specification');
        }

        return response.json();
    }

    async saveTileSpec(projectId, request, specification) {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();

        const { data, error } = await this.client
            .from('tile_specifications')
            .insert({
                project_id: projectId,
                user_id: user?.id || null,
                name: specification.tileName || 'Untitled Spec',
                request: request,
                specification: specification
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getTileSpecs(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('tile_specifications')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async getTileSpec(specId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('tile_specifications')
            .select('*')
            .eq('id', specId)
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTileSpec(specId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('tile_specifications')
            .delete()
            .eq('id', specId);

        if (error) throw error;
        return true;
    }

    // =============================================
    // CHARACTER SPRITE GENERATION (AI)
    // =============================================

    async generateCharacterSprites(request) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Call the edge function
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/generate-character-sprites`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate character sprites');
        }

        return response.json();
    }

    // =============================================
    // CHARACTERS (Incarnum)
    // =============================================

    async createCharacter(projectId, name, characterType = 'npc') {
        if (!this.client) throw new Error('Crucible not initialized');

        const user = await this.getUser();
        const identifier = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

        const { data, error } = await this.client
            .from('characters')
            .insert({
                project_id: projectId,
                user_id: user?.id || null,
                name,
                identifier,
                character_type: characterType
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getCharacters(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('characters')
            .select('*')
            .eq('project_id', projectId)
            .order('name');

        if (error) throw error;
        return data || [];
    }

    async getCharacter(characterId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateCharacter(characterId, updates) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('characters')
            .update(updates)
            .eq('id', characterId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCharacter(characterId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('characters')
            .delete()
            .eq('id', characterId);

        if (error) throw error;
        return true;
    }

    // =============================================
    // PROJECT EXPORT (includes characters)
    // =============================================

    async compileProject(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const project = await this.getProject(projectId);
        const levels = await this.getLevels(projectId);
        const characters = await this.getCharacters(projectId);

        // Compile each level
        const compiledLevels = await Promise.all(
            levels.map(l => this.compileLevel(l.id))
        );

        return {
            name: project.name,
            levels: compiledLevels,
            characters: characters.map(c => ({
                id: c.id,
                name: c.name,
                identifier: c.identifier,
                type: c.character_type,
                defaultSprite: c.default_sprite,
                animations: c.animations,
                tags: c.tags,
                properties: c.properties
            })),
            meta: {
                projectId,
                exportedAt: new Date().toISOString()
            }
        };
    }

    // =============================================
    // PROJECT MEMBERS & INVITES
    // =============================================

    async findUserByIdentifier(identifier) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .rpc('find_user_by_identifier', { identifier });

        if (error) throw error;
        return data?.[0] || null;
    }

    async inviteToProject(projectId, identifier) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Find the user
        const targetUser = await this.findUserByIdentifier(identifier);
        if (!targetUser) {
            throw new Error('User not found');
        }

        // Get current user and project
        const currentUser = await this.getUser();
        if (!currentUser) throw new Error('Must be logged in to invite');

        const project = await this.getProject(projectId);
        if (!project) throw new Error('Project not found');

        // Check if already a member
        const { data: existing } = await this.client
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', targetUser.id)
            .single();

        if (existing) {
            throw new Error('User is already a member of this project');
        }

        // Create notification for the invitee
        const { data: notification, error } = await this.client
            .from('notifications')
            .insert({
                user_id: targetUser.id,
                type: 'project_invite',
                title: 'Project Invitation',
                message: `${currentUser.user_metadata?.display_name || currentUser.email} has invited you to help with "${project.name}". Join?`,
                data: {
                    project_id: projectId,
                    project_name: project.name,
                    invited_by: currentUser.id,
                    invited_by_name: currentUser.user_metadata?.display_name || currentUser.email
                }
            })
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    async getProjectMembers(projectId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('project_members')
            .select('*')
            .eq('project_id', projectId);

        if (error) throw error;
        return data || [];
    }

    async removeProjectMember(projectId, userId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    // =============================================
    // NOTIFICATIONS
    // =============================================

    async getNotifications(unreadOnly = false) {
        if (!this.client) throw new Error('Crucible not initialized');

        let query = this.client
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async getUnreadNotificationCount() {
        if (!this.client) throw new Error('Crucible not initialized');

        const { count, error } = await this.client
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    }

    async markNotificationRead(notificationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { data, error } = await this.client
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async markAllNotificationsRead() {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('notifications')
            .update({ read: true })
            .eq('read', false);

        if (error) throw error;
    }

    async acceptProjectInvite(notificationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Get the notification
        const { data: notification, error: fetchError } = await this.client
            .from('notifications')
            .select('*')
            .eq('id', notificationId)
            .single();

        if (fetchError) throw fetchError;
        if (!notification || notification.type !== 'project_invite') {
            throw new Error('Invalid invite notification');
        }

        const currentUser = await this.getUser();
        if (!currentUser) throw new Error('Must be logged in');

        // Add to project members
        const { error: memberError } = await this.client
            .from('project_members')
            .insert({
                project_id: notification.data.project_id,
                user_id: currentUser.id,
                role: 'member',
                invited_by: notification.data.invited_by
            });

        if (memberError) throw memberError;

        // Mark notification as acted on
        await this.client
            .from('notifications')
            .update({ read: true, acted_on: true })
            .eq('id', notificationId);

        return notification.data;
    }

    async declineProjectInvite(notificationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Just mark as acted on
        const { error } = await this.client
            .from('notifications')
            .update({ read: true, acted_on: true })
            .eq('id', notificationId);

        if (error) throw error;
    }

    async deleteNotification(notificationId) {
        if (!this.client) throw new Error('Crucible not initialized');

        const { error } = await this.client
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;
    }
}

// =============================================
// SINGLETON INSTANCE
// =============================================
const crucibleClient = new CrucibleClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CrucibleClient, crucibleClient };
}

// Global access for vanilla JS
window.CrucibleClient = CrucibleClient;
window.crucibleClient = crucibleClient;

// =============================================
// HELPER: Get or initialize client
// =============================================
async function getCrucible() {
    if (!crucibleClient.initialized) {
        await crucibleClient.init();
    }
    return crucibleClient;
}

window.getCrucible = getCrucible;

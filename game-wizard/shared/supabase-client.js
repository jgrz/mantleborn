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

    async createProject(name, description = '', isPublic = true) {
        if (!this.client) throw new Error('Crucible not initialized');

        // Get current user for ownership
        const user = await this.getUser();

        const { data, error } = await this.client
            .from('projects')
            .insert({
                name,
                description,
                is_public: isPublic,
                user_id: user?.id || null
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

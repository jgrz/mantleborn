/**
 * GAME WIZARD - Route Utilities
 *
 * Centralized URL construction for all Game Wizard tools.
 * Ensures consistent URL formatting and parameter handling.
 */

class GameWizardRoutes {
    constructor() {
        this.basePath = '/game-wizard';
    }

    // =============================================
    // LEVEL FORGE ROUTES
    // =============================================

    /**
     * Get Level Forge URL for grid editing
     * @param {string} projectId - Project UUID
     * @param {string} levelSlug - Level slug
     * @returns {string} Full URL path
     */
    levelForgeGrid(projectId, levelSlug) {
        return `${this.basePath}/level-forge/?project=${projectId}&level=${levelSlug}&tab=grid`;
    }

    /**
     * Get Level Forge URL for background editing
     * @param {string} projectId - Project UUID
     * @param {string} levelSlug - Level slug
     * @returns {string} Full URL path
     */
    levelForgeBackground(projectId, levelSlug) {
        return `${this.basePath}/level-forge/?project=${projectId}&level=${levelSlug}&tab=background`;
    }

    /**
     * Get Level Forge URL for tile painting
     * @param {string} projectId - Project UUID
     * @param {string} levelSlug - Level slug
     * @returns {string} Full URL path
     */
    levelForgeTiles(projectId, levelSlug) {
        return `${this.basePath}/level-forge/?project=${projectId}&level=${levelSlug}&tab=tiles`;
    }

    /**
     * Get Level Forge base URL (no tab specified)
     * @param {string} projectId - Project UUID
     * @param {string} levelSlug - Level slug
     * @returns {string} Full URL path
     */
    levelForge(projectId, levelSlug) {
        return `${this.basePath}/level-forge/?project=${projectId}&level=${levelSlug}`;
    }

    // =============================================
    // CRUCIBLE ROUTES
    // =============================================

    /**
     * Get Crucible URL for a specific project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    crucibleProject(projectId) {
        return `${this.basePath}/crucible/?project=${projectId}`;
    }

    /**
     * Get Crucible URL for a specific level
     * @param {string} projectId - Project UUID
     * @param {string} levelSlug - Level slug
     * @returns {string} Full URL path
     */
    crucibleLevel(projectId, levelSlug) {
        return `${this.basePath}/crucible/?project=${projectId}&level=${levelSlug}`;
    }

    /**
     * Get Crucible base URL
     * @returns {string} Full URL path
     */
    crucible() {
        return `${this.basePath}/crucible/`;
    }

    // =============================================
    // OTHER TOOL ROUTES
    // =============================================

    /**
     * Get Tilesmith URL for a project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    tilesmith(projectId) {
        return `${this.basePath}/tilesmith/?project=${projectId}`;
    }

    /**
     * Get Sprite-Rite URL for a project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    spriteRite(projectId) {
        return `${this.basePath}/sprite-rite/?project=${projectId}`;
    }

    /**
     * Get Animancer URL for a project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    animancer(projectId) {
        return `${this.basePath}/animancer/?project=${projectId}`;
    }

    /**
     * Get Frameweft URL for a project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    frameweft(projectId) {
        return `${this.basePath}/frameweft/?project=${projectId}`;
    }

    /**
     * Get Incarnum URL for a project
     * @param {string} projectId - Project UUID
     * @returns {string} Full URL path
     */
    incarnum(projectId) {
        return `${this.basePath}/incarnum/?project=${projectId}`;
    }

    // =============================================
    // URL PARSING UTILITIES
    // =============================================

    /**
     * Parse the current URL to extract project, level, and tab parameters
     * @returns {Object} { projectId, levelSlug, tab }
     */
    parseCurrentUrl() {
        const params = new URLSearchParams(window.location.search);
        return {
            projectId: params.get('project'),
            levelSlug: params.get('level'),
            tab: params.get('tab')
        };
    }

    /**
     * Parse any URL to extract query parameters
     * @param {string} url - URL to parse
     * @returns {Object} Parsed parameters
     */
    parseUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            const params = new URLSearchParams(urlObj.search);
            return {
                projectId: params.get('project'),
                levelSlug: params.get('level'),
                tab: params.get('tab'),
                path: urlObj.pathname
            };
        } catch (e) {
            console.error('Failed to parse URL:', e);
            return { projectId: null, levelSlug: null, tab: null, path: null };
        }
    }

    /**
     * Update the current URL without page reload
     * @param {Object} params - Parameters to update { projectId, levelSlug, tab }
     */
    updateCurrentUrl(params) {
        const current = this.parseCurrentUrl();
        const merged = { ...current, ...params };

        const searchParams = new URLSearchParams();
        if (merged.projectId) searchParams.set('project', merged.projectId);
        if (merged.levelSlug) searchParams.set('level', merged.levelSlug);
        if (merged.tab) searchParams.set('tab', merged.tab);

        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    /**
     * Build a URL with custom parameters
     * @param {string} basePath - Base path (e.g., '/game-wizard/level-forge/')
     * @param {Object} params - Parameters to include
     * @returns {string} Full URL path
     */
    buildUrl(basePath, params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                searchParams.set(key, value);
            }
        });
        const queryString = searchParams.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    }
}

// =============================================
// SINGLETON INSTANCE
// =============================================
const gwRoutes = new GameWizardRoutes();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameWizardRoutes, gwRoutes };
}

// Global access for vanilla JS
window.GameWizardRoutes = GameWizardRoutes;
window.gwRoutes = gwRoutes;

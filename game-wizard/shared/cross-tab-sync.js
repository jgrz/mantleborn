/**
 * GAME WIZARD - Cross-Tab Synchronization
 *
 * Uses the BroadcastChannel API to enable real-time communication
 * between different Game Wizard tools open in separate browser tabs.
 */

class CrossTabSync {
    constructor(channelName = 'game-wizard-sync') {
        this.channelName = channelName;
        this.channel = null;
        this.listeners = new Map();
        this.enabled = typeof BroadcastChannel !== 'undefined';

        if (this.enabled) {
            this._initChannel();
        } else {
            console.warn('CrossTabSync: BroadcastChannel API not available');
        }
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    _initChannel() {
        try {
            this.channel = new BroadcastChannel(this.channelName);
            this.channel.onmessage = (event) => this._handleMessage(event);
            this.channel.onmessageerror = (error) => {
                console.error('CrossTabSync message error:', error);
            };
        } catch (e) {
            console.error('CrossTabSync: Failed to create channel:', e);
            this.enabled = false;
        }
    }

    _handleMessage(event) {
        const { type, payload, timestamp, source } = event.data;

        // Don't process messages from self (optional - can be removed if self-messages are desired)
        if (source === this._sourceId) return;

        // Call registered listeners for this message type
        const typeListeners = this.listeners.get(type);
        if (typeListeners) {
            typeListeners.forEach(callback => {
                try {
                    callback(payload, { type, timestamp, source });
                } catch (e) {
                    console.error(`CrossTabSync: Error in listener for "${type}":`, e);
                }
            });
        }

        // Also call wildcard listeners
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(callback => {
                try {
                    callback(payload, { type, timestamp, source });
                } catch (e) {
                    console.error('CrossTabSync: Error in wildcard listener:', e);
                }
            });
        }
    }

    // Generate a unique source ID for this tab
    get _sourceId() {
        if (!this._tabId) {
            this._tabId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        return this._tabId;
    }

    // =============================================
    // PUBLIC API
    // =============================================

    /**
     * Broadcast a message to all other tabs
     * @param {string} type - Message type identifier
     * @param {*} payload - Data to send (must be cloneable)
     */
    broadcast(type, payload) {
        if (!this.enabled || !this.channel) {
            console.warn('CrossTabSync: Cannot broadcast, channel not available');
            return false;
        }

        try {
            this.channel.postMessage({
                type,
                payload,
                timestamp: Date.now(),
                source: this._sourceId
            });
            return true;
        } catch (e) {
            console.error('CrossTabSync: Failed to broadcast:', e);
            return false;
        }
    }

    /**
     * Subscribe to messages of a specific type
     * @param {string} type - Message type to listen for (or '*' for all)
     * @param {Function} callback - Function to call with (payload, meta)
     * @returns {Function} Unsubscribe function
     */
    on(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type).add(callback);

        // Return unsubscribe function
        return () => this.off(type, callback);
    }

    /**
     * Unsubscribe from messages
     * @param {string} type - Message type
     * @param {Function} callback - Callback to remove
     */
    off(type, callback) {
        const typeListeners = this.listeners.get(type);
        if (typeListeners) {
            typeListeners.delete(callback);
            if (typeListeners.size === 0) {
                this.listeners.delete(type);
            }
        }
    }

    /**
     * Subscribe to a message type for a single occurrence
     * @param {string} type - Message type to listen for
     * @param {Function} callback - Function to call once
     */
    once(type, callback) {
        const wrapper = (payload, meta) => {
            this.off(type, wrapper);
            callback(payload, meta);
        };
        this.on(type, wrapper);
    }

    /**
     * Close the channel and clean up
     */
    destroy() {
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
        this.listeners.clear();
        this.enabled = false;
    }

    // =============================================
    // CONVENIENCE METHODS - LEVEL EVENTS
    // =============================================

    /**
     * Notify other tabs that a level was updated
     * @param {string} projectId - Project UUID
     * @param {string} levelId - Level UUID
     * @param {string} levelSlug - Level slug
     * @param {Object} changes - Optional details about what changed
     */
    notifyLevelUpdated(projectId, levelId, levelSlug, changes = {}) {
        return this.broadcast('level_updated', {
            projectId,
            levelId,
            levelSlug,
            changes,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that a level was deleted
     * @param {string} projectId - Project UUID
     * @param {string} levelId - Level UUID
     */
    notifyLevelDeleted(projectId, levelId) {
        return this.broadcast('level_deleted', {
            projectId,
            levelId,
            deletedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that a level was created
     * @param {string} projectId - Project UUID
     * @param {string} levelId - Level UUID
     * @param {string} levelSlug - Level slug
     * @param {string} levelName - Level display name
     */
    notifyLevelCreated(projectId, levelId, levelSlug, levelName) {
        return this.broadcast('level_created', {
            projectId,
            levelId,
            levelSlug,
            levelName,
            createdAt: new Date().toISOString()
        });
    }

    // =============================================
    // CONVENIENCE METHODS - LOCK EVENTS
    // =============================================

    /**
     * Notify other tabs that a level was locked
     * @param {string} projectId - Project UUID
     * @param {string} levelId - Level UUID
     * @param {string} lockedBy - User ID who locked
     * @param {string} sessionId - Session ID for the lock
     */
    notifyLevelLocked(projectId, levelId, lockedBy, sessionId) {
        return this.broadcast('level_locked', {
            projectId,
            levelId,
            lockedBy,
            sessionId,
            lockedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that a level was unlocked
     * @param {string} projectId - Project UUID
     * @param {string} levelId - Level UUID
     */
    notifyLevelUnlocked(projectId, levelId) {
        return this.broadcast('level_unlocked', {
            projectId,
            levelId,
            unlockedAt: new Date().toISOString()
        });
    }

    // =============================================
    // CONVENIENCE METHODS - PROJECT EVENTS
    // =============================================

    /**
     * Notify other tabs that a project was selected
     * @param {string} projectId - Project UUID
     * @param {string} projectName - Project name
     */
    notifyProjectSelected(projectId, projectName) {
        return this.broadcast('project_selected', {
            projectId,
            projectName,
            selectedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that project data changed
     * @param {string} projectId - Project UUID
     * @param {string} changeType - Type of change (e.g., 'tiles_updated', 'sprites_updated')
     */
    notifyProjectDataChanged(projectId, changeType) {
        return this.broadcast('project_data_changed', {
            projectId,
            changeType,
            changedAt: new Date().toISOString()
        });
    }

    // =============================================
    // CONVENIENCE METHODS - ASSET EVENTS
    // =============================================

    /**
     * Notify other tabs that the master tile sheet was updated
     * @param {string} projectId - Project UUID
     */
    notifyTileSheetUpdated(projectId) {
        return this.broadcast('tile_sheet_updated', {
            projectId,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that the master sprite sheet was updated
     * @param {string} projectId - Project UUID
     */
    notifySpriteSheetUpdated(projectId) {
        return this.broadcast('sprite_sheet_updated', {
            projectId,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Notify other tabs that a background was added/updated
     * @param {string} projectId - Project UUID
     * @param {string} backgroundName - Name of the background
     */
    notifyBackgroundUpdated(projectId, backgroundName) {
        return this.broadcast('background_updated', {
            projectId,
            backgroundName,
            updatedAt: new Date().toISOString()
        });
    }
}

// =============================================
// SINGLETON INSTANCE
// =============================================
const crossTabSync = new CrossTabSync();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CrossTabSync, crossTabSync };
}

// Global access for vanilla JS
window.CrossTabSync = CrossTabSync;
window.crossTabSync = crossTabSync;

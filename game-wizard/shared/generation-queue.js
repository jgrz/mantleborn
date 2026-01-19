/**
 * Generation Queue Component
 * UI component for displaying and managing AI generation jobs
 * Polls for status updates and allows importing completed assets
 */

class GenerationQueue {
    constructor(options = {}) {
        this.container = null;
        this.crucibleClient = null;
        this.pixelLabClient = null;
        this.projectId = null;

        // Callbacks
        this.onImport = options.onImport || null;
        this.onRetry = options.onRetry || null;
        this.onJobsChange = options.onJobsChange || null;

        // State
        this.jobs = [];
        this.isPolling = false;
        this.pollInterval = options.pollInterval || 30000; // 30 seconds
        this.pollTimer = null;

        // UI state
        this.isMinimized = false;
        this.isVisible = false;
    }

    /**
     * Initialize the queue with required clients
     */
    init(crucibleClient, pixelLabClient, projectId) {
        this.crucibleClient = crucibleClient;
        this.pixelLabClient = pixelLabClient;
        this.projectId = projectId;
    }

    /**
     * Create and inject the queue UI
     */
    createUI(parentElement) {
        this.container = document.createElement('div');
        this.container.className = 'generation-queue';
        this.container.innerHTML = `
            <div class="gq-header">
                <span class="gq-title">
                    <span class="gq-icon">✨</span>
                    <span class="gq-title-text">Generation Queue</span>
                    <span class="gq-badge" style="display: none;">0</span>
                </span>
                <div class="gq-actions">
                    <button class="gq-btn gq-minimize" title="Minimize">−</button>
                    <button class="gq-btn gq-close" title="Close">×</button>
                </div>
            </div>
            <div class="gq-body">
                <div class="gq-empty">No generation jobs</div>
                <div class="gq-list"></div>
            </div>
        `;

        // Add styles
        this.injectStyles();

        // Bind events
        this.container.querySelector('.gq-minimize').addEventListener('click', () => this.toggleMinimize());
        this.container.querySelector('.gq-close').addEventListener('click', () => this.hide());

        parentElement.appendChild(this.container);
        return this.container;
    }

    /**
     * Inject component styles
     */
    injectStyles() {
        if (document.getElementById('generation-queue-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'generation-queue-styles';
        styles.textContent = `
            .generation-queue {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                max-height: 400px;
                background: var(--bg-mid, #1a1a2e);
                border: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                z-index: 10001;
                display: none;
                flex-direction: column;
                font-family: 'JetBrains Mono', monospace;
            }

            .generation-queue.visible {
                display: flex;
            }

            .generation-queue.minimized .gq-body {
                display: none;
            }

            .generation-queue.minimized {
                max-height: none;
            }

            .gq-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                background: var(--bg-surface, #252542);
                border-bottom: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 8px 8px 0 0;
                cursor: pointer;
            }

            .gq-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                color: var(--stone-light, #9a9abe);
            }

            .gq-icon {
                font-size: 14px;
            }

            .gq-badge {
                background: var(--accent-ember, #e07020);
                color: var(--bg-deep, #0d0d14);
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }

            .gq-actions {
                display: flex;
                gap: 4px;
            }

            .gq-btn {
                background: transparent;
                border: none;
                color: var(--stone-mid, #6a6a8e);
                font-size: 16px;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .gq-btn:hover {
                background: var(--stone-dark, #3a3a5c);
                color: var(--stone-light, #9a9abe);
            }

            .gq-body {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }

            .gq-empty {
                text-align: center;
                padding: 20px;
                color: var(--stone-mid, #6a6a8e);
                font-size: 12px;
            }

            .gq-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .gq-job {
                background: var(--bg-surface, #252542);
                border: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 6px;
                padding: 10px;
            }

            .gq-job-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 8px;
                margin-bottom: 6px;
            }

            .gq-job-status {
                font-size: 14px;
                flex-shrink: 0;
            }

            .gq-job-prompt {
                font-size: 11px;
                color: var(--stone-bright, #d0d0e8);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .gq-job-type {
                font-size: 10px;
                color: var(--stone-mid, #6a6a8e);
                text-transform: uppercase;
                margin-bottom: 4px;
            }

            .gq-job-info {
                font-size: 10px;
                color: var(--stone-mid, #6a6a8e);
                margin-bottom: 8px;
            }

            .gq-job-actions {
                display: flex;
                gap: 6px;
            }

            .gq-job-btn {
                font-family: inherit;
                font-size: 10px;
                padding: 4px 10px;
                border-radius: 4px;
                border: 1px solid var(--stone-dark, #3a3a5c);
                background: var(--bg-mid, #1a1a2e);
                color: var(--stone-light, #9a9abe);
                cursor: pointer;
            }

            .gq-job-btn:hover {
                background: var(--stone-dark, #3a3a5c);
            }

            .gq-job-btn.primary {
                background: var(--accent-ember, #e07020);
                border-color: var(--accent-ember, #e07020);
                color: var(--bg-deep, #0d0d14);
            }

            .gq-job-btn.primary:hover {
                background: var(--accent-ember-glow, #ff9040);
            }

            .gq-job.pending .gq-job-status::after {
                content: '⏳';
            }

            .gq-job.processing .gq-job-status::after {
                content: '⚙️';
                animation: spin 2s linear infinite;
            }

            .gq-job.completed .gq-job-status::after {
                content: '✅';
            }

            .gq-job.failed .gq-job-status::after {
                content: '❌';
            }

            .gq-job.imported .gq-job-status::after {
                content: '📥';
            }

            .gq-progress {
                height: 3px;
                background: var(--stone-dark, #3a3a5c);
                border-radius: 2px;
                margin: 6px 0;
                overflow: hidden;
            }

            .gq-progress-bar {
                height: 100%;
                background: var(--accent-ember, #e07020);
                border-radius: 2px;
                transition: width 0.3s ease;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Scrollbar styling */
            .gq-body::-webkit-scrollbar {
                width: 6px;
            }

            .gq-body::-webkit-scrollbar-track {
                background: var(--bg-mid, #1a1a2e);
            }

            .gq-body::-webkit-scrollbar-thumb {
                background: var(--stone-dark, #3a3a5c);
                border-radius: 3px;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Show the queue panel
     */
    show() {
        if (!this.container) return;
        this.container.classList.add('visible');
        this.isVisible = true;
        this.startPolling();
    }

    /**
     * Hide the queue panel
     */
    hide() {
        if (!this.container) return;
        this.container.classList.remove('visible');
        this.isVisible = false;
        this.stopPolling();
    }

    /**
     * Toggle visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Toggle minimized state
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.container.classList.toggle('minimized', this.isMinimized);
        this.container.querySelector('.gq-minimize').textContent = this.isMinimized ? '+' : '−';
    }

    /**
     * Add a new job to the queue
     */
    async addJob(job) {
        console.log('=== GenerationQueue.addJob called ===');
        console.log('Job:', job);
        console.log('this.crucibleClient:', this.crucibleClient);
        console.log('this.projectId:', this.projectId);

        // Save to database
        if (this.crucibleClient && this.projectId) {
            try {
                const user = await this.crucibleClient.getUser();
                const { data, error } = await this.crucibleClient.client
                    .from('pixel_generations')
                    .insert({
                        project_id: this.projectId,
                        user_id: user?.id,
                        pixellab_job_id: job.jobId,
                        pixellab_asset_id: job.assetId,
                        job_type: job.type,
                        status: 'pending',
                        prompt: job.prompt,
                        parameters: job.parameters || {},
                        skeleton_keypoints: job.skeletonKeypoints
                    })
                    .select()
                    .single();

                if (!error && data) {
                    job.id = data.id;
                }
            } catch (e) {
                console.warn('Failed to save job to database:', e);
            }
        }

        this.jobs.unshift({
            ...job,
            status: 'pending',
            createdAt: new Date()
        });
        console.log('Job added to this.jobs, count:', this.jobs.length);

        this.render();
        console.log('render() called');
        this.updateBadge();

        // Show queue if hidden
        console.log('isVisible before show:', this.isVisible);
        if (!this.isVisible) {
            this.show();
            console.log('show() called');
        }

        // Start polling if not already
        if (!this.isPolling) {
            this.startPolling();
        }
    }

    /**
     * Load jobs from database
     */
    async loadJobs() {
        if (!this.crucibleClient || !this.projectId) return;

        try {
            const { data, error } = await this.crucibleClient.client
                .from('pixel_generations')
                .select('*')
                .eq('project_id', this.projectId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                this.jobs = data.map(row => ({
                    id: row.id,
                    jobId: row.pixellab_job_id,
                    assetId: row.pixellab_asset_id,
                    type: row.job_type,
                    status: row.status,
                    prompt: row.prompt,
                    parameters: row.parameters,
                    skeletonKeypoints: row.skeleton_keypoints,
                    resultUrl: row.result_url,
                    resultData: row.result_data,
                    importedToType: row.imported_to_type,
                    importedToId: row.imported_to_id,
                    errorMessage: row.error_message,
                    createdAt: new Date(row.created_at),
                    completedAt: row.completed_at ? new Date(row.completed_at) : null
                }));

                this.render();
                this.updateBadge();
            }
        } catch (e) {
            console.error('Failed to load jobs:', e);
        }
    }

    /**
     * Start polling for status updates
     */
    startPolling() {
        if (this.isPolling) return;

        this.isPolling = true;
        this.poll();
    }

    /**
     * Stop polling
     */
    stopPolling() {
        this.isPolling = false;
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    /**
     * Poll for status updates
     */
    async poll() {
        if (!this.isPolling) return;

        // Find jobs that need status updates
        const pendingJobs = this.jobs.filter(j =>
            j.status === 'pending' || j.status === 'processing'
        );

        for (const job of pendingJobs) {
            try {
                await this.checkJobStatus(job);
            } catch (e) {
                console.error('Failed to check job status:', e);
            }
        }

        // Schedule next poll
        if (pendingJobs.length > 0) {
            this.pollTimer = setTimeout(() => this.poll(), this.pollInterval);
        } else {
            this.isPolling = false;
        }
    }

    /**
     * Check status of a single job
     */
    async checkJobStatus(job) {
        if (!this.pixelLabClient || !job.jobId) return;

        try {
            const status = await this.pixelLabClient.getJobStatus(job.jobId);

            // Update job status
            const oldStatus = job.status;
            job.status = status.status === 'completed' ? 'completed' :
                         status.status === 'failed' ? 'failed' :
                         status.status === 'processing' ? 'processing' : job.status;

            // When job completes, fetch the actual asset to get URLs
            if (job.status === 'completed' && oldStatus !== 'completed') {
                console.log('Job completed, status.result:', status.result, 'status.raw:', status.raw);

                // For map_object and variants, the API doesn't have a GET endpoint - use job result directly
                if (job.type === 'map_object' || job.type === 'map_object_variant') {
                    // The result is in status.raw.data, with image in last_response
                    const rawData = status.raw?.data || {};
                    const lastResponse = rawData.last_response || {};

                    // Store the full result with last_response at top level for easier access
                    job.resultData = { ...rawData, image: lastResponse.image };

                    // Handle base64 image data - convert to data URL
                    const imageData = lastResponse.image || rawData.image;
                    if (imageData?.type === 'base64' && imageData?.base64) {
                        const format = imageData.format || 'png';
                        job.resultUrl = `data:image/${format};base64,${imageData.base64}`;
                    } else {
                        job.resultUrl = lastResponse.download_url || lastResponse.url || rawData.download_url || rawData.url;
                    }
                    console.log('Map object last_response:', lastResponse, 'URL type:', job.resultUrl?.substring(0, 50));
                } else if (job.assetId) {
                    // For other types, fetch the asset via dedicated endpoint
                    try {
                        const assetData = await this.fetchCompletedAsset(job);
                        if (assetData) {
                            job.resultData = assetData;
                            // For characters, use south-facing sprite as preview URL
                            job.resultUrl = assetData.rotation_urls?.south ||
                                           assetData.preview_url ||
                                           assetData.download_url;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch completed asset:', e);
                    }
                }
            }

            if (status.status === 'failed') {
                job.errorMessage = status.result?.error || 'Generation failed';
            }

            // Update database if status changed
            if (oldStatus !== job.status && this.crucibleClient && job.id) {
                await this.crucibleClient.client
                    .from('pixel_generations')
                    .update({
                        status: job.status,
                        result_url: job.resultUrl,
                        result_data: job.resultData,
                        error_message: job.errorMessage,
                        completed_at: job.status === 'completed' || job.status === 'failed'
                            ? new Date().toISOString() : null
                    })
                    .eq('id', job.id);
            }

            this.render();
            this.updateBadge();

        } catch (e) {
            console.error('Failed to check job status:', e);
        }
    }

    /**
     * Fetch the completed asset based on job type
     */
    async fetchCompletedAsset(job) {
        if (!this.pixelLabClient || !job.assetId) return null;

        switch (job.type) {
            case 'character':
                return await this.pixelLabClient.getCharacter(job.assetId);
            case 'tileset_topdown':
                return await this.pixelLabClient.getTileset(job.assetId, 'topdown');
            case 'tileset_sidescroller':
                return await this.pixelLabClient.getTileset(job.assetId, 'sidescroller');
            case 'isometric_tile':
                return await this.pixelLabClient.getIsometricTile(job.assetId);
            case 'map_object':
                return await this.pixelLabClient.getMapObject(job.assetId);
            default:
                console.warn('Unknown job type for asset fetch:', job.type);
                return null;
        }
    }

    /**
     * Render the queue list
     */
    render() {
        if (!this.container) return;

        const list = this.container.querySelector('.gq-list');
        const empty = this.container.querySelector('.gq-empty');

        if (this.jobs.length === 0) {
            empty.style.display = 'block';
            list.innerHTML = '';
            return;
        }

        empty.style.display = 'none';
        list.innerHTML = this.jobs.map(job => this.renderJob(job)).join('');

        // Bind action buttons
        list.querySelectorAll('.gq-import-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const jobId = btn.dataset.jobId;
                const job = this.jobs.find(j => j.id === jobId || j.jobId === jobId);
                if (job && this.onImport) {
                    this.onImport(job);
                }
            });
        });

        list.querySelectorAll('.gq-retry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const jobId = btn.dataset.jobId;
                const job = this.jobs.find(j => j.id === jobId || j.jobId === jobId);
                if (job && this.onRetry) {
                    this.onRetry(job);
                }
            });
        });

        list.querySelectorAll('.gq-dismiss-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const jobId = btn.dataset.jobId;
                this.dismissJob(jobId);
            });
        });
    }

    /**
     * Render a single job item
     */
    renderJob(job) {
        const typeLabels = {
            'character': 'Character',
            'animation': 'Animation',
            'tileset_topdown': 'Top-Down Tileset',
            'tileset_sidescroller': 'Sidescroller Tileset',
            'isometric_tile': 'Isometric Tile',
            'map_object': 'Map Object'
        };

        const statusInfo = this.getStatusInfo(job);
        const jobId = job.id || job.jobId;

        return `
            <div class="gq-job ${job.status}">
                <div class="gq-job-type">${typeLabels[job.type] || job.type}</div>
                <div class="gq-job-header">
                    <span class="gq-job-status"></span>
                    <span class="gq-job-prompt">"${this.truncate(job.prompt, 35)}"</span>
                </div>
                <div class="gq-job-info">${statusInfo}</div>
                ${job.status === 'processing' ? `
                    <div class="gq-progress">
                        <div class="gq-progress-bar" style="width: 50%"></div>
                    </div>
                ` : ''}
                <div class="gq-job-actions">
                    ${job.status === 'completed' && !job.importedToId ? `
                        <button class="gq-job-btn primary gq-import-btn" data-job-id="${jobId}">Import</button>
                    ` : ''}
                    ${job.status === 'failed' ? `
                        <button class="gq-job-btn gq-retry-btn" data-job-id="${jobId}">Retry</button>
                    ` : ''}
                    ${job.status === 'completed' || job.status === 'failed' ? `
                        <button class="gq-job-btn gq-dismiss-btn" data-job-id="${jobId}">Dismiss</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get status info text
     */
    getStatusInfo(job) {
        switch (job.status) {
            case 'pending':
                return 'Queued...';
            case 'processing':
                return 'Processing... ~2-5 min';
            case 'completed':
                return job.importedToId ? 'Imported' : 'Ready to import';
            case 'failed':
                return job.errorMessage || 'Generation failed';
            default:
                return job.status;
        }
    }

    /**
     * Update badge count
     */
    updateBadge() {
        const badge = this.container?.querySelector('.gq-badge');
        if (badge) {
            const activeCount = this.jobs.filter(j =>
                j.status === 'pending' || j.status === 'processing' || j.status === 'completed'
            ).length;

            badge.textContent = activeCount;
            badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
        }

        // Notify external listeners
        if (this.onJobsChange) {
            this.onJobsChange();
        }
    }

    /**
     * Mark job as imported
     */
    async markImported(job, importedToType, importedToId) {
        job.importedToType = importedToType;
        job.importedToId = importedToId;
        job.status = 'imported';

        if (this.crucibleClient && job.id) {
            await this.crucibleClient.client
                .from('pixel_generations')
                .update({
                    imported_to_type: importedToType,
                    imported_to_id: importedToId,
                    imported_at: new Date().toISOString()
                })
                .eq('id', job.id);
        }

        this.render();
        this.updateBadge();
    }

    /**
     * Dismiss a job (remove from UI)
     */
    async dismissJob(jobId) {
        const index = this.jobs.findIndex(j => j.id === jobId || j.jobId === jobId);
        if (index >= 0) {
            this.jobs.splice(index, 1);
            this.render();
            this.updateBadge();
        }
    }

    /**
     * Truncate text
     */
    truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.GenerationQueue = GenerationQueue;
}

// Export for CommonJS/Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GenerationQueue };
}

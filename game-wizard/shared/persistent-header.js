/**
 * Persistent Header Component
 * Adds a shared header bar with project selection across all Game Wizard tools.
 * Include this script on any page to add the header.
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'gameWizard_selectedProject';

    // Header HTML
    const headerHTML = `
        <div class="gw-persistent-header">
            <div class="gw-header-brand">
                <a href="/game-wizard/" class="gw-header-home" title="Game Wizard Home">&#128302;</a>
                <span class="gw-header-title">GAME WIZARD</span>
            </div>
            <div class="gw-header-controls">
                <div class="gw-header-project">
                    <select id="gwProjectSelect">
                        <option value="">-- Select Project --</option>
                    </select>
                </div>
                <div class="gw-header-auth" id="gwAuthIndicator">
                    <span class="gw-auth-dot"></span>
                    <span class="gw-auth-text">...</span>
                </div>
            </div>
        </div>
    `;

    // Header CSS
    const headerCSS = `
        .gw-persistent-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(180deg, var(--bg-mid, #1a1a2e) 0%, var(--bg-deep, #0d0d14) 100%);
            border-bottom: 1px solid var(--stone-dark, #3a3a5c);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 9999;
            font-family: 'JetBrains Mono', monospace;
        }

        .gw-header-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .gw-header-home {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            font-size: 18px;
            text-decoration: none;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            transition: all 0.2s;
        }

        .gw-header-home:hover {
            background: var(--stone-dark, #3a3a5c);
            border-color: var(--accent-ember, #e07020);
        }

        .gw-header-title {
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            color: var(--accent-ember, #e07020);
            text-shadow: 0 0 10px rgba(224, 112, 32, 0.5);
        }

        .gw-header-controls {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .gw-header-project select {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            padding: 8px 12px;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            color: var(--stone-light, #9a9abe);
            cursor: pointer;
            min-width: 180px;
        }

        .gw-header-project select:focus {
            outline: none;
            border-color: var(--accent-ember, #e07020);
        }

        .gw-header-auth {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            font-size: 11px;
            color: var(--stone-mid, #6a6a8e);
        }

        .gw-header-auth.logged-in {
            border-color: #3a7a40;
            color: var(--stone-light, #9a9abe);
        }

        .gw-auth-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--stone-dark, #3a3a5c);
        }

        .gw-header-auth.logged-in .gw-auth-dot {
            background: #3a7a40;
        }

        /* Push page content down to make room for fixed header */
        body {
            padding-top: 50px !important;
        }

        /* Adjust any existing fixed headers on the page */
        .header {
            top: 50px !important;
        }
    `;

    // State
    let projects = [];
    let selectedProjectId = null;

    // Initialize
    function init() {
        injectStyles();
        injectHeader();
        loadSavedProject();
        setupEventListeners();

        // Wait for crucibleClient to be ready
        if (typeof crucibleClient !== 'undefined') {
            initWithClient();
        } else {
            // Wait a bit for the client to load
            setTimeout(() => {
                if (typeof crucibleClient !== 'undefined') {
                    initWithClient();
                }
            }, 500);
        }
    }

    async function initWithClient() {
        await crucibleClient.init();

        const user = await crucibleClient.getUser();
        updateAuthIndicator(user);

        if (user) {
            await loadProjects();
        }

        // Listen for auth changes
        crucibleClient.onAuthStateChange((event, session) => {
            updateAuthIndicator(session?.user);
            if (session?.user) {
                loadProjects();
            } else {
                projects = [];
                updateProjectSelect();
            }
        });
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'gw-persistent-header-styles';
        style.textContent = headerCSS;
        document.head.appendChild(style);
    }

    function injectHeader() {
        const headerContainer = document.createElement('div');
        headerContainer.innerHTML = headerHTML;
        document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
    }

    function loadSavedProject() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                selectedProjectId = data.projectId;
                // Notify the page of the saved project
                notifyProjectChange(data.projectId, data.projectName);
            } catch (e) {
                console.warn('Failed to load saved project:', e);
            }
        }
    }

    function saveProject(projectId, projectName) {
        if (projectId) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectId, projectName }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    async function loadProjects() {
        try {
            projects = await crucibleClient.getMyProjects();
            updateProjectSelect();
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    function updateProjectSelect() {
        const select = document.getElementById('gwProjectSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Select Project --</option>';

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });

        // Restore selection
        if (selectedProjectId) {
            select.value = selectedProjectId;
        }
    }

    function updateAuthIndicator(user) {
        const indicator = document.getElementById('gwAuthIndicator');
        if (!indicator) return;

        const textEl = indicator.querySelector('.gw-auth-text');

        if (user) {
            const name = user.user_metadata?.display_name ||
                        user.email?.split('@')[0] || 'User';
            indicator.classList.add('logged-in');
            textEl.textContent = name;
        } else {
            indicator.classList.remove('logged-in');
            textEl.textContent = 'Guest';
        }
    }

    function setupEventListeners() {
        const select = document.getElementById('gwProjectSelect');
        if (select) {
            select.addEventListener('change', (e) => {
                const projectId = e.target.value;
                const projectName = e.target.options[e.target.selectedIndex]?.text || '';

                selectedProjectId = projectId;
                saveProject(projectId, projectName);
                notifyProjectChange(projectId, projectName);
            });
        }
    }

    function notifyProjectChange(projectId, projectName) {
        // Dispatch custom event that pages can listen to
        window.dispatchEvent(new CustomEvent('gw:projectChange', {
            detail: { projectId, projectName }
        }));

        // Also update crucibleClient context if available
        if (typeof crucibleClient !== 'undefined' && projectId) {
            crucibleClient.setContext(projectId, null, null);
        }
    }

    // Public API
    window.gwPersistentHeader = {
        getSelectedProject: () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        },
        setProject: (projectId, projectName) => {
            selectedProjectId = projectId;
            saveProject(projectId, projectName);
            const select = document.getElementById('gwProjectSelect');
            if (select) select.value = projectId || '';
            notifyProjectChange(projectId, projectName);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

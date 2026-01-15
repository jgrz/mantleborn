/**
 * Help Drawer Component for Game Wizard
 *
 * Usage:
 * 1. Include this script in your tool page
 * 2. Call HelpDrawer.init({ toolId: 'tilesmith', docs: [...] })
 * 3. The drawer will be added to the page automatically
 */

const HelpDrawer = (function() {
    // Default configuration
    const config = {
        toolId: 'unknown',
        toolName: 'Tool',
        toolIcon: '&#128214;',
        accentColor: '#9b6dff',
        docs: [],
        position: 'right' // 'left' or 'right'
    };

    // State
    let isOpen = false;
    let currentDocIndex = 0;
    let drawerEl = null;
    let overlayEl = null;

    // CSS styles for the drawer
    const styles = `
        .help-drawer-toggle {
            position: fixed;
            top: 50%;
            transform: translateY(-50%);
            width: 32px;
            height: 64px;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            color: var(--stone-light, #9a9abe);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s;
            z-index: 999;
        }

        .help-drawer-toggle:hover {
            background: var(--stone-dark, #3a3a5c);
            color: var(--stone-bright, #d0d0e8);
        }

        .help-drawer-toggle.right {
            right: 0;
            border-radius: 8px 0 0 8px;
            border-right: none;
        }

        .help-drawer-toggle.left {
            left: 0;
            border-radius: 0 8px 8px 0;
            border-left: none;
        }

        .help-drawer-toggle.open {
            background: var(--help-accent, #9b6dff);
            border-color: var(--help-accent, #9b6dff);
            color: var(--bg-deep, #0d0d14);
        }

        .help-drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            z-index: 1000;
        }

        .help-drawer-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        .help-drawer {
            position: fixed;
            top: 0;
            bottom: 0;
            width: 400px;
            max-width: 90vw;
            background: var(--bg-mid, #1a1a2e);
            border: 1px solid var(--stone-dark, #3a3a5c);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1001;
            display: flex;
            flex-direction: column;
        }

        .help-drawer.right {
            right: 0;
            border-right: none;
        }

        .help-drawer.left {
            left: 0;
            border-left: none;
            transform: translateX(-100%);
        }

        .help-drawer.open {
            transform: translateX(0);
        }

        .help-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: var(--bg-surface, #252542);
            border-bottom: 1px solid var(--stone-dark, #3a3a5c);
        }

        .help-drawer-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            color: var(--help-accent, #9b6dff);
        }

        .help-drawer-title-icon {
            font-size: 16px;
        }

        .help-drawer-actions {
            display: flex;
            gap: 8px;
        }

        .help-drawer-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-mid, #1a1a2e);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            color: var(--stone-light, #9a9abe);
            cursor: pointer;
            font-size: 14px;
            transition: all 0.15s;
        }

        .help-drawer-btn:hover {
            background: var(--stone-dark, #3a3a5c);
            color: var(--stone-bright, #d0d0e8);
        }

        .help-drawer-btn.active {
            background: var(--help-accent, #9b6dff);
            border-color: var(--help-accent, #9b6dff);
            color: var(--bg-deep, #0d0d14);
        }

        .help-drawer-nav {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: var(--bg-deep, #0d0d14);
            border-bottom: 1px solid var(--stone-dark, #3a3a5c);
            overflow-x: auto;
        }

        .help-drawer-nav-btn {
            padding: 8px 12px;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            color: var(--stone-light, #9a9abe);
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s;
        }

        .help-drawer-nav-btn:hover {
            background: var(--stone-dark, #3a3a5c);
            color: var(--stone-bright, #d0d0e8);
        }

        .help-drawer-nav-btn.active {
            background: var(--help-accent, #9b6dff);
            border-color: var(--help-accent, #9b6dff);
            color: var(--bg-deep, #0d0d14);
        }

        .help-drawer-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .help-drawer-content h1 {
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            color: var(--stone-bright, #d0d0e8);
            margin-bottom: 16px;
        }

        .help-drawer-content h2 {
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            color: var(--stone-bright, #d0d0e8);
            margin: 24px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--stone-dark, #3a3a5c);
        }

        .help-drawer-content h3 {
            font-size: 13px;
            font-weight: 600;
            color: var(--stone-bright, #d0d0e8);
            margin: 20px 0 8px 0;
        }

        .help-drawer-content p {
            font-size: 13px;
            line-height: 1.7;
            color: var(--stone-light, #9a9abe);
            margin-bottom: 12px;
        }

        .help-drawer-content ul, .help-drawer-content ol {
            margin: 0 0 12px 20px;
            font-size: 13px;
            line-height: 1.7;
            color: var(--stone-light, #9a9abe);
        }

        .help-drawer-content li {
            margin-bottom: 6px;
        }

        .help-drawer-content code {
            background: var(--bg-deep, #0d0d14);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            color: var(--help-accent, #9b6dff);
        }

        .help-drawer-content kbd {
            display: inline-block;
            padding: 3px 8px;
            background: var(--bg-surface, #252542);
            border: 1px solid var(--stone-dark, #3a3a5c);
            border-radius: 4px;
            font-family: inherit;
            font-size: 11px;
            color: var(--stone-bright, #d0d0e8);
            box-shadow: 0 2px 0 var(--stone-dark, #3a3a5c);
        }

        .help-drawer-content .tip {
            background: rgba(155, 109, 255, 0.1);
            border-left: 3px solid var(--help-accent, #9b6dff);
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 0 6px 6px 0;
            font-size: 12px;
        }

        .help-drawer-content .tip-label {
            font-weight: 600;
            color: var(--help-accent, #9b6dff);
            margin-bottom: 4px;
        }

        .help-drawer-content .warning {
            background: rgba(251, 191, 36, 0.1);
            border-left: 3px solid #fbbf24;
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 0 6px 6px 0;
            font-size: 12px;
        }

        .help-drawer-content .warning-label {
            font-weight: 600;
            color: #fbbf24;
            margin-bottom: 4px;
        }

        .help-drawer-content .step {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }

        .help-drawer-content .step-num {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--help-accent, #9b6dff);
            border-radius: 50%;
            font-size: 12px;
            font-weight: 600;
            color: var(--bg-deep, #0d0d14);
            flex-shrink: 0;
        }

        .help-drawer-content .step-text {
            flex: 1;
            padding-top: 4px;
        }

        .help-drawer-footer {
            padding: 12px 16px;
            background: var(--bg-surface, #252542);
            border-top: 1px solid var(--stone-dark, #3a3a5c);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .help-drawer-footer-link {
            font-size: 11px;
            color: var(--help-accent, #9b6dff);
            text-decoration: none;
        }

        .help-drawer-footer-link:hover {
            text-decoration: underline;
        }

        .help-drawer-position-toggle {
            display: flex;
            gap: 4px;
        }

        /* Scrollbar */
        .help-drawer-content::-webkit-scrollbar {
            width: 6px;
        }

        .help-drawer-content::-webkit-scrollbar-thumb {
            background: var(--stone-dark, #3a3a5c);
            border-radius: 3px;
        }

        .help-drawer-content::-webkit-scrollbar-track {
            background: var(--bg-deep, #0d0d14);
        }
    `;

    function injectStyles() {
        if (document.getElementById('help-drawer-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'help-drawer-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    function createDrawerHTML() {
        const position = config.position;

        return `
            <button class="help-drawer-toggle ${position}" id="helpDrawerToggle" title="Help">
                &#10067;
            </button>
            <div class="help-drawer-overlay" id="helpDrawerOverlay"></div>
            <div class="help-drawer ${position}" id="helpDrawer">
                <div class="help-drawer-header">
                    <div class="help-drawer-title">
                        <span class="help-drawer-title-icon">${config.toolIcon}</span>
                        ${config.toolName} Help
                    </div>
                    <div class="help-drawer-actions">
                        <button class="help-drawer-btn" id="helpDrawerClose" title="Close">&#10005;</button>
                    </div>
                </div>
                <div class="help-drawer-nav" id="helpDrawerNav">
                    ${config.docs.map((doc, i) => `
                        <button class="help-drawer-nav-btn ${i === 0 ? 'active' : ''}" data-doc="${i}">
                            ${doc.title}
                        </button>
                    `).join('')}
                </div>
                <div class="help-drawer-content" id="helpDrawerContent">
                    ${config.docs.length > 0 ? config.docs[0].content : '<p>No documentation available.</p>'}
                </div>
                <div class="help-drawer-footer">
                    <a href="/game-wizard/grimoire/" class="help-drawer-footer-link">
                        &#128214; View full documentation
                    </a>
                    <div class="help-drawer-position-toggle">
                        <button class="help-drawer-btn ${position === 'left' ? 'active' : ''}" id="helpPosLeft" title="Dock left">&#9664;</button>
                        <button class="help-drawer-btn ${position === 'right' ? 'active' : ''}" id="helpPosRight" title="Dock right">&#9654;</button>
                    </div>
                </div>
            </div>
        `;
    }

    function open() {
        isOpen = true;
        drawerEl.classList.add('open');
        overlayEl.classList.add('open');
        document.getElementById('helpDrawerToggle').classList.add('open');
    }

    function close() {
        isOpen = false;
        drawerEl.classList.remove('open');
        overlayEl.classList.remove('open');
        document.getElementById('helpDrawerToggle').classList.remove('open');
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    function showDoc(index) {
        if (index < 0 || index >= config.docs.length) return;

        currentDocIndex = index;

        // Update nav buttons
        document.querySelectorAll('.help-drawer-nav-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update content
        document.getElementById('helpDrawerContent').innerHTML = config.docs[index].content;
    }

    function setPosition(position) {
        if (position !== 'left' && position !== 'right') return;

        config.position = position;
        localStorage.setItem('helpDrawerPosition', position);

        // Update elements
        const toggle = document.getElementById('helpDrawerToggle');
        const drawer = document.getElementById('helpDrawer');

        toggle.classList.remove('left', 'right');
        toggle.classList.add(position);

        drawer.classList.remove('left', 'right');
        drawer.classList.add(position);

        // Update position buttons
        document.getElementById('helpPosLeft').classList.toggle('active', position === 'left');
        document.getElementById('helpPosRight').classList.toggle('active', position === 'right');
    }

    function setupEventListeners() {
        // Toggle button
        document.getElementById('helpDrawerToggle').addEventListener('click', toggle);

        // Close button
        document.getElementById('helpDrawerClose').addEventListener('click', close);

        // Overlay click to close
        overlayEl.addEventListener('click', close);

        // Nav buttons
        document.querySelectorAll('.help-drawer-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const docIndex = parseInt(btn.dataset.doc);
                showDoc(docIndex);
            });
        });

        // Position buttons
        document.getElementById('helpPosLeft').addEventListener('click', () => setPosition('left'));
        document.getElementById('helpPosRight').addEventListener('click', () => setPosition('right'));

        // Keyboard shortcut (?)
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });
    }

    function init(options = {}) {
        // Merge options
        Object.assign(config, options);

        // Load saved position preference
        const savedPosition = localStorage.getItem('helpDrawerPosition');
        if (savedPosition) {
            config.position = savedPosition;
        }

        // Set accent color CSS variable
        document.documentElement.style.setProperty('--help-accent', config.accentColor);

        // Inject styles
        injectStyles();

        // Create drawer container
        const container = document.createElement('div');
        container.id = 'helpDrawerContainer';
        container.innerHTML = createDrawerHTML();
        document.body.appendChild(container);

        // Cache elements
        drawerEl = document.getElementById('helpDrawer');
        overlayEl = document.getElementById('helpDrawerOverlay');

        // Setup events
        setupEventListeners();
    }

    // Public API
    return {
        init,
        open,
        close,
        toggle,
        showDoc,
        setPosition
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpDrawer;
}

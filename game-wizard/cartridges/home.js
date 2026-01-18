/**
 * HOME CARTRIDGE
 * The main menu showing all available Game Wizard tools
 */

export const styles = `
    /* ============================================
       HOME CARTRIDGE - Cartridge Menu
       ============================================ */

    .home-cartridge {
        min-height: 100%;
        padding: 40px 20px;
        overflow-y: auto;
    }

    .home-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .home-title {
        font-family: 'Press Start 2P', cursive;
        font-size: 14px;
        color: var(--stone-bright);
        margin-bottom: 8px;
    }

    .home-subtitle {
        font-size: 12px;
        color: var(--stone-mid);
    }

    /* Cartridge Grid */
    .cartridge-shelf {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 240px));
        gap: 24px;
        justify-content: center;
        max-width: 1400px;
        margin: 0 auto;
        padding-bottom: 40px;
    }

    /* Cartridge Card */
    .cartridge {
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.2s ease;
        position: relative;
    }

    .cartridge:hover {
        transform: translateY(-4px);
    }

    .cartridge-body {
        background: var(--cart-color, #2a2a4a);
        border-radius: 8px 8px 4px 4px;
        padding: 12px;
        box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        position: relative;
    }

    /* Top grip ridges */
    .cartridge-body::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 8px;
        background: repeating-linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.3) 0px,
            rgba(0, 0, 0, 0.3) 3px,
            transparent 3px,
            transparent 6px
        );
        border-radius: 0 0 4px 4px;
    }

    /* Label Area */
    .cart-label {
        background: linear-gradient(180deg, #1a1a2e 0%, #0d0d14 100%);
        border: 3px solid var(--cart-accent);
        border-radius: 4px;
        padding: 20px 16px;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
    }

    .cart-label::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--cart-pattern);
        opacity: 0.15;
    }

    .cart-label-content {
        position: relative;
        z-index: 1;
    }

    .cart-rating {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--bg-deep);
        border: 1px solid var(--stone-dark);
        padding: 2px 6px;
        font-size: 8px;
        color: var(--stone-mid);
        border-radius: 2px;
    }

    .cart-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 12px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    }

    .cart-title {
        font-family: 'Press Start 2P', cursive;
        font-size: 11px;
        color: var(--cart-accent);
        text-align: center;
        margin-bottom: 8px;
        text-shadow: 0 0 10px var(--cart-glow);
        line-height: 1.5;
    }

    .cart-tagline {
        font-size: 9px;
        color: var(--stone-mid);
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
    }

    .cart-desc {
        font-size: 10px;
        color: var(--stone-light);
        text-align: center;
        line-height: 1.6;
    }

    .cart-label-light {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background: var(--cart-accent);
        border-radius: 50%;
        opacity: 0.4;
        box-shadow: 0 0 8px var(--cart-glow);
        transition: opacity 0.3s ease;
    }

    .cartridge:hover .cart-label-light {
        opacity: 1;
    }

    /* Bottom connector pins */
    .cart-pins {
        display: flex;
        justify-content: center;
        gap: 2px;
        margin-top: 8px;
    }

    .cart-pin {
        width: 12px;
        height: 16px;
        background: linear-gradient(180deg, #c4a868 0%, #8a7848 100%);
        border-radius: 0 0 2px 2px;
    }

    /* Individual cartridge colors */
    .cartridge--sprite-rite {
        --cart-color: #2a4a6a;
        --cart-accent: #5ac8fa;
        --cart-glow: rgba(90, 200, 250, 0.5);
        --cart-pattern: repeating-linear-gradient(45deg, transparent 0px, transparent 10px, rgba(90, 200, 250, 0.1) 10px, rgba(90, 200, 250, 0.1) 20px);
    }

    .cartridge--animancer {
        --cart-color: #4a2a6a;
        --cart-accent: #bf5af2;
        --cart-glow: rgba(191, 90, 242, 0.5);
        --cart-pattern: repeating-linear-gradient(-45deg, transparent 0px, transparent 10px, rgba(191, 90, 242, 0.1) 10px, rgba(191, 90, 242, 0.1) 20px);
    }

    .cartridge--level-forge {
        --cart-color: #6a4a2a;
        --cart-accent: #ff9f0a;
        --cart-glow: rgba(255, 159, 10, 0.5);
        --cart-pattern: repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(255, 159, 10, 0.1) 10px, rgba(255, 159, 10, 0.1) 20px);
    }

    .cartridge--tilesmith {
        --cart-color: #2a6a4a;
        --cart-accent: #30d158;
        --cart-glow: rgba(48, 209, 88, 0.5);
        --cart-pattern: repeating-conic-gradient(transparent 0deg, transparent 10deg, rgba(48, 209, 88, 0.1) 10deg, rgba(48, 209, 88, 0.1) 20deg);
    }

    .cartridge--crucible {
        --cart-color: #5a4a2a;
        --cart-accent: #ffa500;
        --cart-glow: rgba(255, 165, 0, 0.5);
        --cart-pattern: radial-gradient(circle at 50% 50%, rgba(255, 200, 0, 0.2) 0%, transparent 60%);
    }

    .cartridge--frameweft {
        --cart-color: #3a2a5a;
        --cart-accent: #a855f7;
        --cart-glow: rgba(168, 85, 247, 0.5);
        --cart-pattern: repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(168, 85, 247, 0.1) 8px, rgba(168, 85, 247, 0.1) 16px);
    }

    .cartridge--incarnum {
        --cart-color: #3a2a4a;
        --cart-accent: #ff6b9d;
        --cart-glow: rgba(255, 107, 157, 0.5);
        --cart-pattern: radial-gradient(circle at 50% 50%, rgba(255, 107, 157, 0.2) 0%, transparent 60%);
    }

    .cartridge--portals {
        --cart-color: #4a2a5a;
        --cart-accent: #bf60ff;
        --cart-glow: rgba(191, 96, 255, 0.5);
        --cart-pattern: radial-gradient(circle at 50% 50%, rgba(191, 96, 255, 0.2) 0%, transparent 60%);
    }

    .cartridge--grimoire {
        --cart-color: #3a2a5a;
        --cart-accent: #9b6dff;
        --cart-glow: rgba(155, 109, 255, 0.5);
        --cart-pattern: radial-gradient(circle at 50% 30%, rgba(155, 109, 255, 0.2) 0%, transparent 50%);
    }

    /* Requires project indicator */
    .cartridge--requires-project::after {
        content: 'Project Required';
        position: absolute;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 8px;
        color: var(--stone-mid);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .cartridge--requires-project:hover::after {
        opacity: 1;
    }

    /* Footer */
    .home-footer {
        text-align: center;
        padding: 20px;
        color: var(--stone-dark);
        font-size: 10px;
    }
`;

export const template = `
<div class="home-cartridge">
    <header class="home-header">
        <h1 class="home-title">Select Your Cartridge</h1>
        <p class="home-subtitle">Choose a tool to begin</p>
    </header>

    <main class="cartridge-shelf">
        <!-- Crucible -->
        <div class="cartridge cartridge--crucible" data-cartridge="crucible">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">HUB</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#129516;</div>
                        <div class="cart-title">CRUCIBLE</div>
                        <div class="cart-tagline">Project Hub</div>
                        <div class="cart-desc">
                            Central hub for all tools. Manage projects, compile levels, and export game-ready data.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Tilesmith -->
        <div class="cartridge cartridge--tilesmith cartridge--requires-project" data-cartridge="tilesmith">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">ART</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#129513;</div>
                        <div class="cart-title">TILESMITH</div>
                        <div class="cart-tagline">Craft Tiles</div>
                        <div class="cart-desc">
                            Pixel-based tile creation with AI assist. Draw tiles, manage palettes, export to sheets.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Sprite-Rite -->
        <div class="cartridge cartridge--sprite-rite cartridge--requires-project" data-cartridge="sprite-rite">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">ART</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#127912;</div>
                        <div class="cart-title">SPRITE-RITE</div>
                        <div class="cart-tagline">Slice & Define</div>
                        <div class="cart-desc">
                            Extract sprite regions from sheets. Define hitboxes, anchors, build your atlas.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Frameweft -->
        <div class="cartridge cartridge--frameweft cartridge--requires-project" data-cartridge="frameweft">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">ART</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#128444;</div>
                        <div class="cart-title">FRAMEWEFT</div>
                        <div class="cart-tagline">Import & Resample</div>
                        <div class="cart-desc">
                            Convert any image to pixel art. Resample to tile grids, create backgrounds.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Animancer -->
        <div class="cartridge cartridge--animancer cartridge--requires-project" data-cartridge="animancer">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">ART</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#127916;</div>
                        <div class="cart-title">ANIMANCER</div>
                        <div class="cart-tagline">Bring Pixels to Life</div>
                        <div class="cart-desc">
                            Timeline-based frame sequencing. Tween effects, easing, real-time preview.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Level Forge -->
        <div class="cartridge cartridge--level-forge cartridge--requires-project" data-cartridge="level-forge">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">LEVEL</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#128506;</div>
                        <div class="cart-title">LEVEL FORGE</div>
                        <div class="cart-tagline">Build Your World</div>
                        <div class="cart-desc">
                            Grid-based level design. Collision mapping, parallax backgrounds, tile painting.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Incarnum -->
        <div class="cartridge cartridge--incarnum cartridge--requires-project" data-cartridge="incarnum">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">CHAR</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#129497;</div>
                        <div class="cart-title">INCARNUM</div>
                        <div class="cart-tagline">Build Heroes</div>
                        <div class="cart-desc">
                            Define characters with sprites, animations, and properties. Heroes, NPCs, enemies.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Portals -->
        <div class="cartridge cartridge--portals cartridge--requires-project" data-cartridge="portals">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">LEVEL</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#128279;</div>
                        <div class="cart-title">PORTALS</div>
                        <div class="cart-tagline">Connect Worlds</div>
                        <div class="cart-desc">
                            Visual node mapper for level connections. Link exits to spawns, build game flow.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>

        <!-- Grimoire -->
        <div class="cartridge cartridge--grimoire" data-cartridge="grimoire">
            <div class="cartridge-body">
                <div class="cart-label">
                    <div class="cart-rating">DOCS</div>
                    <div class="cart-label-content">
                        <div class="cart-icon">&#128214;</div>
                        <div class="cart-title">GRIMOIRE</div>
                        <div class="cart-tagline">Knowledge</div>
                        <div class="cart-desc">
                            Your guide to all Game Wizard tools. Tutorials, reference docs, and tips.
                        </div>
                    </div>
                    <div class="cart-label-light"></div>
                </div>
                <div class="cart-pins">
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                    <div class="cart-pin"></div>
                </div>
            </div>
        </div>
    </main>

    <footer class="home-footer">
        <p>GAME WIZARD v2.0 - SPA Edition</p>
    </footer>
</div>
`;

// Event cleanup reference
let clickHandler = null;

export function init(config) {
    const container = config.container;

    // Setup click handlers for cartridge cards
    clickHandler = (e) => {
        const cartridge = e.target.closest('.cartridge');
        if (cartridge) {
            const cartridgeName = cartridge.dataset.cartridge;
            if (cartridgeName) {
                // Check if project is required but none selected
                if (cartridge.classList.contains('cartridge--requires-project') && !config.projectId) {
                    window.dispatchEvent(new CustomEvent('shell:toast', {
                        detail: { message: 'Please select a project first', type: 'error' }
                    }));
                    return;
                }

                // Navigate to cartridge
                window.location.hash = cartridgeName;
            }
        }
    };

    container.addEventListener('click', clickHandler);

    return {
        setProject(projectId, projectName) {
            // Update config for project requirement checks
            config.projectId = projectId;
            config.projectName = projectName;
        },

        destroy() {
            if (clickHandler) {
                container.removeEventListener('click', clickHandler);
                clickHandler = null;
            }
        }
    };
}

export function destroy() {
    // Cleanup handled by instance destroy
}

/**
 * Project Gate Component
 *
 * Displays a locked state when user has no projects.
 * Cartridges that require a project should call checkProjectGate() on init.
 *
 * Usage:
 *   <script src="../shared/project-gate.js"></script>
 *
 *   // In init function:
 *   const hasProject = await checkProjectGate();
 *   if (!hasProject) return; // Gate is displayed, stop init
 */

// Inject CSS for project gate
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .project-gate {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: gateAppear 0.3s ease-out;
        }

        @keyframes gateAppear {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .project-gate-content {
            text-align: center;
            max-width: 420px;
            padding: 40px;
        }

        .project-gate-lock {
            width: 120px;
            height: 120px;
            margin: 0 auto 32px;
            position: relative;
        }

        .project-gate-lock-body {
            width: 80px;
            height: 60px;
            background: linear-gradient(180deg, #3a3a5c 0%, #252542 100%);
            border: 2px solid #4a4a6c;
            border-radius: 8px;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            box-shadow:
                inset 0 -10px 20px rgba(0,0,0,0.3),
                0 4px 16px rgba(0,0,0,0.4);
        }

        .project-gate-lock-keyhole {
            width: 12px;
            height: 20px;
            background: #1a1a2e;
            border-radius: 50% 50% 0 0;
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
        }

        .project-gate-lock-keyhole::after {
            content: '';
            width: 8px;
            height: 12px;
            background: #1a1a2e;
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .project-gate-lock-shackle {
            width: 50px;
            height: 40px;
            border: 6px solid #6a6a8e;
            border-bottom: none;
            border-radius: 30px 30px 0 0;
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            animation: shackleGlow 2s ease-in-out infinite;
        }

        @keyframes shackleGlow {
            0%, 100% { border-color: #6a6a8e; }
            50% { border-color: #ffa500; }
        }

        .project-gate-title {
            font-family: 'Press Start 2P', cursive;
            font-size: 16px;
            color: #d0d0e8;
            margin-bottom: 16px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .project-gate-text {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            color: #9a9abe;
            line-height: 1.7;
            margin-bottom: 32px;
        }

        .project-gate-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            background: linear-gradient(180deg, #7a5a3a 0%, #5a3a2a 100%);
            border: 2px solid #9a7a5a;
            border-radius: 8px;
            color: #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .project-gate-btn:hover {
            background: linear-gradient(180deg, #9a7a5a 0%, #7a5a3a 100%);
            border-color: #ffa500;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,165,0,0.2);
        }

        .project-gate-btn-icon {
            font-size: 16px;
        }

        .project-gate-footer {
            margin-top: 40px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #6a6a8e;
        }

        .project-gate-footer a {
            color: #ffa500;
            text-decoration: none;
        }

        .project-gate-footer a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
})();

/**
 * Check if user has projects and display gate if not
 * @returns {Promise<boolean>} true if user has projects, false if gate is displayed
 */
async function checkProjectGate() {
    // Wait for crucibleClient to be available
    if (typeof crucibleClient === 'undefined') {
        console.error('Project gate: crucibleClient not found');
        return true; // Allow access if client not available
    }

    await crucibleClient.init();

    // Check if user is logged in
    const user = await crucibleClient.getUser();
    if (!user) {
        // Guest users can browse but will see login prompts elsewhere
        return true;
    }

    // Check if user has any projects
    const hasProjects = await crucibleClient.hasProjects();

    if (!hasProjects) {
        displayProjectGate();
        return false;
    }

    return true;
}

/**
 * Display the project gate overlay
 */
function displayProjectGate() {
    const gate = document.createElement('div');
    gate.className = 'project-gate';
    gate.innerHTML = `
        <div class="project-gate-content">
            <div class="project-gate-lock">
                <div class="project-gate-lock-shackle"></div>
                <div class="project-gate-lock-body">
                    <div class="project-gate-lock-keyhole"></div>
                </div>
            </div>
            <div class="project-gate-title">PROJECT REQUIRED</div>
            <div class="project-gate-text">
                This tool requires a project to store your work.<br>
                Create your first project in the Crucible to unlock all Game Wizard cartridges.
            </div>
            <a href="/game-wizard/crucible/" class="project-gate-btn">
                <span class="project-gate-btn-icon">&#129516;</span>
                Open Crucible
            </a>
            <div class="project-gate-footer">
                Or <a href="/game-wizard/">return to Game Wizard</a>
            </div>
        </div>
    `;
    document.body.appendChild(gate);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkProjectGate, displayProjectGate };
}

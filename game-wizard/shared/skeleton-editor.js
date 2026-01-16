/**
 * Skeleton Editor Component
 * Canvas-based pose editor for character generation
 * Allows dragging joints to define skeleton keypoints
 */

class SkeletonEditor {
    constructor(options = {}) {
        this.container = null;
        this.canvas = null;
        this.ctx = null;

        // Dimensions
        this.width = options.width || 200;
        this.height = options.height || 280;

        // Joint definitions
        this.joints = this.createDefaultJoints();

        // Connections between joints (bones)
        this.bones = [
            ['head', 'neck'],
            ['neck', 'left_shoulder'],
            ['neck', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['right_shoulder', 'right_elbow'],
            ['left_elbow', 'left_hand'],
            ['right_elbow', 'right_hand'],
            ['neck', 'torso'],
            ['torso', 'left_hip'],
            ['torso', 'right_hip'],
            ['left_hip', 'left_knee'],
            ['right_hip', 'right_knee'],
            ['left_knee', 'left_foot'],
            ['right_knee', 'right_foot']
        ];

        // Interaction state
        this.selectedJoint = null;
        this.hoveredJoint = null;
        this.isDragging = false;

        // Settings
        this.guidanceScale = options.guidanceScale || 1.0;
        this.showLabels = options.showLabels !== false;

        // Callbacks
        this.onChange = options.onChange || null;
    }

    /**
     * Create default joint positions (idle pose)
     */
    createDefaultJoints() {
        return {
            head: { x: 0.5, y: 0.1, radius: 12, color: '#e07020' },
            neck: { x: 0.5, y: 0.18, radius: 6, color: '#9a9abe' },
            left_shoulder: { x: 0.35, y: 0.22, radius: 8, color: '#8060c0' },
            right_shoulder: { x: 0.65, y: 0.22, radius: 8, color: '#8060c0' },
            left_elbow: { x: 0.28, y: 0.35, radius: 7, color: '#6a6a8e' },
            right_elbow: { x: 0.72, y: 0.35, radius: 7, color: '#6a6a8e' },
            left_hand: { x: 0.25, y: 0.48, radius: 6, color: '#d0d0e8' },
            right_hand: { x: 0.75, y: 0.48, radius: 6, color: '#d0d0e8' },
            torso: { x: 0.5, y: 0.38, radius: 10, color: '#e07020' },
            left_hip: { x: 0.42, y: 0.52, radius: 8, color: '#8060c0' },
            right_hip: { x: 0.58, y: 0.52, radius: 8, color: '#8060c0' },
            left_knee: { x: 0.4, y: 0.7, radius: 7, color: '#6a6a8e' },
            right_knee: { x: 0.6, y: 0.7, radius: 7, color: '#6a6a8e' },
            left_foot: { x: 0.38, y: 0.88, radius: 6, color: '#d0d0e8' },
            right_foot: { x: 0.62, y: 0.88, radius: 6, color: '#d0d0e8' }
        };
    }

    /**
     * Create the editor UI
     */
    createUI(parentElement) {
        this.container = document.createElement('div');
        this.container.className = 'skeleton-editor';
        this.container.innerHTML = `
            <div class="se-toolbar">
                <select class="se-preset-select">
                    <option value="">-- Preset Poses --</option>
                    <option value="idle">Idle</option>
                    <option value="walk1">Walk Frame 1</option>
                    <option value="walk2">Walk Frame 2</option>
                    <option value="attack">Attack</option>
                    <option value="jump">Jump</option>
                </select>
                <button class="se-btn se-reset" title="Reset to default">Reset</button>
            </div>
            <div class="se-canvas-wrap">
                <canvas class="se-canvas"></canvas>
            </div>
            <div class="se-guidance">
                <label class="se-guidance-label">
                    <span>Guidance Strength</span>
                    <input type="range" class="se-guidance-slider" min="0" max="5" step="0.1" value="${this.guidanceScale}">
                    <span class="se-guidance-value">${this.guidanceScale.toFixed(1)}</span>
                </label>
            </div>
            <div class="se-hint">Drag joints to adjust pose</div>
        `;

        // Add styles
        this.injectStyles();

        // Setup canvas
        this.canvas = this.container.querySelector('.se-canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Bind events
        this.bindEvents();

        parentElement.appendChild(this.container);
        this.render();

        return this.container;
    }

    /**
     * Inject component styles
     */
    injectStyles() {
        if (document.getElementById('skeleton-editor-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'skeleton-editor-styles';
        styles.textContent = `
            .skeleton-editor {
                display: flex;
                flex-direction: column;
                gap: 10px;
                font-family: 'JetBrains Mono', monospace;
            }

            .se-toolbar {
                display: flex;
                gap: 8px;
            }

            .se-preset-select {
                flex: 1;
                font-family: inherit;
                font-size: 11px;
                padding: 6px 8px;
                background: var(--bg-surface, #252542);
                border: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 4px;
                color: var(--stone-light, #9a9abe);
                cursor: pointer;
            }

            .se-preset-select:focus {
                outline: none;
                border-color: var(--mystic-glow, #8060c0);
            }

            .se-btn {
                font-family: inherit;
                font-size: 11px;
                padding: 6px 12px;
                background: var(--bg-surface, #252542);
                border: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 4px;
                color: var(--stone-light, #9a9abe);
                cursor: pointer;
            }

            .se-btn:hover {
                background: var(--stone-dark, #3a3a5c);
            }

            .se-canvas-wrap {
                background: var(--bg-deep, #0d0d14);
                border: 1px solid var(--stone-dark, #3a3a5c);
                border-radius: 6px;
                padding: 10px;
                display: flex;
                justify-content: center;
            }

            .se-canvas {
                cursor: pointer;
                background: linear-gradient(180deg,
                    rgba(128, 96, 192, 0.05) 0%,
                    rgba(128, 96, 192, 0.02) 100%
                );
                border-radius: 4px;
            }

            .se-guidance {
                padding: 8px 0;
            }

            .se-guidance-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 11px;
                color: var(--stone-mid, #6a6a8e);
            }

            .se-guidance-slider {
                flex: 1;
                height: 4px;
                -webkit-appearance: none;
                appearance: none;
                background: var(--stone-dark, #3a3a5c);
                border-radius: 2px;
                cursor: pointer;
            }

            .se-guidance-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px;
                height: 14px;
                background: var(--accent-ember, #e07020);
                border-radius: 50%;
                cursor: pointer;
            }

            .se-guidance-value {
                min-width: 28px;
                text-align: right;
                color: var(--accent-ember, #e07020);
            }

            .se-hint {
                text-align: center;
                font-size: 10px;
                color: var(--stone-mid, #6a6a8e);
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());

        // Preset selector
        this.container.querySelector('.se-preset-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPreset(e.target.value);
                e.target.value = '';
            }
        });

        // Reset button
        this.container.querySelector('.se-reset').addEventListener('click', () => {
            this.reset();
        });

        // Guidance slider
        this.container.querySelector('.se-guidance-slider').addEventListener('input', (e) => {
            this.guidanceScale = parseFloat(e.target.value);
            this.container.querySelector('.se-guidance-value').textContent =
                this.guidanceScale.toFixed(1);
            this.notifyChange();
        });
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const joint = this.findJointAt(pos);

        if (joint) {
            this.selectedJoint = joint;
            this.isDragging = true;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.isDragging && this.selectedJoint) {
            // Move the joint
            this.joints[this.selectedJoint].x = Math.max(0.05, Math.min(0.95, pos.x / this.width));
            this.joints[this.selectedJoint].y = Math.max(0.05, Math.min(0.95, pos.y / this.height));
            this.render();
            this.notifyChange();
        } else {
            // Check for hover
            const joint = this.findJointAt(pos);
            if (joint !== this.hoveredJoint) {
                this.hoveredJoint = joint;
                this.canvas.style.cursor = joint ? 'grab' : 'pointer';
                this.render();
            }
        }
    }

    /**
     * Handle mouse up
     */
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.selectedJoint = null;
            this.canvas.style.cursor = this.hoveredJoint ? 'grab' : 'pointer';
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseDown(mouseEvent);
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseMove(mouseEvent);
    }

    /**
     * Get mouse position relative to canvas
     */
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Find joint at position
     */
    findJointAt(pos) {
        for (const [name, joint] of Object.entries(this.joints)) {
            const jx = joint.x * this.width;
            const jy = joint.y * this.height;
            const dist = Math.sqrt(Math.pow(pos.x - jx, 2) + Math.pow(pos.y - jy, 2));

            if (dist <= joint.radius + 5) {
                return name;
            }
        }
        return null;
    }

    /**
     * Render the skeleton
     */
    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw guide lines (center line, shoulders, hips)
        ctx.strokeStyle = 'rgba(106, 106, 142, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Center line
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();

        // Horizontal guides
        ctx.beginPath();
        ctx.moveTo(0, h * 0.22);
        ctx.lineTo(w, h * 0.22);
        ctx.moveTo(0, h * 0.52);
        ctx.lineTo(w, h * 0.52);
        ctx.stroke();

        ctx.setLineDash([]);

        // Draw bones
        ctx.strokeStyle = 'rgba(154, 154, 190, 0.6)';
        ctx.lineWidth = 3;

        for (const [joint1, joint2] of this.bones) {
            const j1 = this.joints[joint1];
            const j2 = this.joints[joint2];

            ctx.beginPath();
            ctx.moveTo(j1.x * w, j1.y * h);
            ctx.lineTo(j2.x * w, j2.y * h);
            ctx.stroke();
        }

        // Draw joints
        for (const [name, joint] of Object.entries(this.joints)) {
            const jx = joint.x * w;
            const jy = joint.y * h;
            const isHovered = name === this.hoveredJoint;
            const isSelected = name === this.selectedJoint;

            // Outer ring for hovered/selected
            if (isHovered || isSelected) {
                ctx.beginPath();
                ctx.arc(jx, jy, joint.radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = isSelected ? '#ff9040' : 'rgba(224, 112, 32, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Joint circle
            ctx.beginPath();
            ctx.arc(jx, jy, joint.radius, 0, Math.PI * 2);
            ctx.fillStyle = joint.color;
            ctx.fill();

            // Joint border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw labels if enabled
        if (this.showLabels && this.hoveredJoint) {
            const joint = this.joints[this.hoveredJoint];
            const label = this.hoveredJoint.replace(/_/g, ' ');

            ctx.font = '10px JetBrains Mono, monospace';
            ctx.fillStyle = '#d0d0e8';
            ctx.textAlign = 'center';
            ctx.fillText(label, joint.x * w, joint.y * h - joint.radius - 8);
        }
    }

    /**
     * Load a preset pose
     */
    loadPreset(presetName) {
        const presets = SKELETON_PRESETS || {};
        const preset = presets[presetName];

        if (!preset) return;

        // Apply preset keypoints
        for (const kp of preset.keypoints) {
            if (this.joints[kp.name]) {
                this.joints[kp.name].x = kp.x;
                this.joints[kp.name].y = kp.y;
            }
        }

        this.render();
        this.notifyChange();
    }

    /**
     * Reset to default pose
     */
    reset() {
        this.joints = this.createDefaultJoints();
        this.render();
        this.notifyChange();
    }

    /**
     * Set pose from keypoints array
     */
    setKeypoints(keypoints) {
        for (const kp of keypoints) {
            if (this.joints[kp.name]) {
                this.joints[kp.name].x = kp.x;
                this.joints[kp.name].y = kp.y;
            }
        }
        this.render();
    }

    /**
     * Get keypoints array for API
     */
    getKeypoints() {
        return Object.entries(this.joints).map(([name, joint]) => ({
            name,
            x: joint.x,
            y: joint.y
        }));
    }

    /**
     * Get guidance scale
     */
    getGuidanceScale() {
        return this.guidanceScale;
    }

    /**
     * Notify change callback
     */
    notifyChange() {
        if (this.onChange) {
            this.onChange({
                keypoints: this.getKeypoints(),
                guidanceScale: this.guidanceScale
            });
        }
    }

    /**
     * Import skeleton from image using PixelLab estimation
     */
    async importFromImage(pixelLabClient, imageBase64) {
        try {
            const keypoints = await pixelLabClient.estimateSkeleton(imageBase64);
            if (keypoints && keypoints.length > 0) {
                this.setKeypoints(keypoints);
                return true;
            }
        } catch (e) {
            console.error('Failed to estimate skeleton:', e);
        }
        return false;
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
        this.canvas = null;
        this.ctx = null;
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.SkeletonEditor = SkeletonEditor;
}

// Export for CommonJS/Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkeletonEditor };
}

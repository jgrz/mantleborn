/**
 * Animancer Documentation
 * Used by the Help Drawer component and Grimoire
 */

const ANIMANCER_DOCS = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
            <h1>Quick Start</h1>
            <p>Get started creating sprite animations in Animancer. This guide covers the basics of building your first animation.</p>

            <h2>Creating Your First Animation</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                    <strong>Select a Project</strong><br>
                    Choose your project from the dropdown. Your project's master spritesheet will be available automatically.
                </div>
            </div>

            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                    <strong>Choose a Spritesheet</strong><br>
                    Select "Master Sheet" to use sprites from Tilesmith and Sprite-Rite, or choose a specific spritesheet.
                </div>
            </div>

            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                    <strong>Add Frames</strong><br>
                    Click sprites in the palette to add them as frames to your animation timeline.
                </div>
            </div>

            <div class="step">
                <div class="step-num">4</div>
                <div class="step-text">
                    <strong>Set Timing</strong><br>
                    Adjust frame durations using the default duration or per-frame overrides.
                </div>
            </div>

            <div class="step">
                <div class="step-num">5</div>
                <div class="step-text">
                    <strong>Preview & Save</strong><br>
                    Hit Play to preview your animation, then save it to your project.
                </div>
            </div>

            <h2>Interface Overview</h2>
            <ul>
                <li><strong>Sprite Palette</strong> - Left panel showing available sprites</li>
                <li><strong>Preview Canvas</strong> - Center area showing current frame</li>
                <li><strong>Timeline</strong> - Bottom strip showing all frames in sequence</li>
                <li><strong>Animation List</strong> - Right panel with saved animations</li>
                <li><strong>Playback Controls</strong> - Play, pause, and speed controls</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Name your animations descriptively: <code>player_run</code>, <code>enemy_idle</code>, <code>coin_spin</code>.
            </div>
        `
    },
    {
        id: 'timeline',
        title: 'Timeline Editor',
        content: `
            <h1>Timeline Editor</h1>
            <p>The timeline is where you arrange and manage your animation frames. Learn how to build smooth animations.</p>

            <h2>Adding Frames</h2>
            <p>There are several ways to add frames to your timeline:</p>
            <ul>
                <li><strong>Click a sprite</strong> - Click any sprite in the palette to append it to the timeline</li>
                <li><strong>Drag and drop</strong> - Drag sprites from the palette onto the timeline</li>
                <li><strong>Duplicate</strong> - Copy existing frames to repeat them</li>
            </ul>

            <h2>Selecting Frames</h2>
            <ul>
                <li><strong>Click</strong> - Select a single frame</li>
                <li><strong>Arrow keys</strong> - Navigate between frames</li>
            </ul>
            <p>The selected frame appears in the preview canvas and its properties show in the settings panel.</p>

            <h2>Reordering Frames</h2>
            <p>Drag frames left or right on the timeline to change their order. The preview updates in real-time as you rearrange.</p>

            <h2>Removing Frames</h2>
            <ul>
                <li>Select a frame and press <kbd>Delete</kbd></li>
                <li>Click the remove button on the frame</li>
            </ul>

            <h2>Frame Durations</h2>
            <p>Each frame has a duration (in seconds) that controls how long it displays:</p>
            <ul>
                <li><strong>Default Duration</strong> - Applied to all new frames</li>
                <li><strong>Per-Frame Override</strong> - Set custom duration for specific frames</li>
            </ul>
            <p>Common durations:</p>
            <ul>
                <li><code>0.1s</code> - Fast action (10 FPS)</li>
                <li><code>0.15s</code> - Standard animation (~7 FPS)</li>
                <li><code>0.25s</code> - Slow, deliberate motion (4 FPS)</li>
                <li><code>0.5s</code> - Hold frames, emphasis</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use longer durations on key poses and shorter durations on in-between frames for more dynamic animations.
            </div>
        `
    },
    {
        id: 'playback',
        title: 'Playback Controls',
        content: `
            <h1>Playback Controls</h1>
            <p>Preview your animations in real-time with the playback controls.</p>

            <h2>Basic Controls</h2>
            <ul>
                <li><strong>Play/Pause</strong> - Start or pause animation playback</li>
                <li><strong>Stop</strong> - Stop and return to first frame</li>
            </ul>

            <h2>Speed Multiplier</h2>
            <p>Adjust playback speed without changing frame durations:</p>
            <ul>
                <li><strong>0.25x</strong> - Quarter speed (slow motion)</li>
                <li><strong>0.5x</strong> - Half speed</li>
                <li><strong>1x</strong> - Normal speed</li>
                <li><strong>2x</strong> - Double speed</li>
                <li><strong>4x</strong> - Fast preview</li>
            </ul>

            <h2>Frame-by-Frame</h2>
            <p>Step through your animation one frame at a time:</p>
            <ul>
                <li><kbd>←</kbd> - Previous frame</li>
                <li><kbd>→</kbd> - Next frame</li>
            </ul>

            <h2>Looping</h2>
            <p>Animations loop automatically during playback. This is standard behavior for game animations like walk cycles and idle states.</p>

            <h2>Preview Canvas</h2>
            <p>The preview canvas shows:</p>
            <ul>
                <li>Current frame at actual pixel size</li>
                <li>Transparent checker background</li>
                <li>Pixel-perfect rendering (no smoothing)</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Use slow motion (0.5x or 0.25x) to check timing and spot issues in your animation flow.
            </div>
        `
    },
    {
        id: 'tweening',
        title: 'Tweening',
        content: `
            <h1>Tweening</h1>
            <p>Tweening (in-betweening) adds smooth transitions between frames. Use it for fluid animations or disable it for classic pixel art snappiness.</p>

            <h2>What is Tweening?</h2>
            <p>In traditional animation, tweening refers to the frames drawn between key poses. In Animancer, tweening creates a crossfade effect between frames, making transitions smoother.</p>

            <h2>Enabling Tweening</h2>
            <ol>
                <li>Check the "Enable Tween" checkbox in settings</li>
                <li>Set the tween duration (how long the crossfade takes)</li>
            </ol>

            <h2>Tween Duration</h2>
            <p>The tween duration controls the crossfade length:</p>
            <ul>
                <li><strong>0.05s</strong> - Subtle smoothing</li>
                <li><strong>0.1s</strong> - Noticeable blend</li>
                <li><strong>0.2s+</strong> - Dreamy, morphing effect</li>
            </ul>

            <h2>When to Use Tweening</h2>

            <h3>Good for:</h3>
            <ul>
                <li>UI animations and transitions</li>
                <li>Smooth scaling or fading effects</li>
                <li>High-resolution sprite animations</li>
                <li>Ambient effects (flickering, pulsing)</li>
            </ul>

            <h3>Avoid for:</h3>
            <ul>
                <li>Classic pixel art (looks blurry)</li>
                <li>Fast action animations</li>
                <li>Animations with large sprite changes</li>
                <li>When you want crisp, snappy motion</li>
            </ul>

            <div class="warning">
                <div class="warning-label">Note</div>
                Tweening works best when consecutive frames are similar in size and position. Large differences between frames may look strange when blended.
            </div>

            <div class="tip">
                <div class="tip-label">Tip</div>
                For retro pixel art games, keep tweening disabled. For modern games with high-res sprites, experiment with subtle tween values.
            </div>
        `
    },
    {
        id: 'managing',
        title: 'Managing Animations',
        content: `
            <h1>Managing Animations</h1>
            <p>Organize your animations within your project. Create, save, load, and manage multiple animations.</p>

            <h2>Creating New Animations</h2>
            <ol>
                <li>Click "New Animation" or clear the current timeline</li>
                <li>Add frames from the sprite palette</li>
                <li>Set timing and tweening options</li>
                <li>Give it a descriptive name</li>
                <li>Click "Save" to store it</li>
            </ol>

            <h2>Naming Conventions</h2>
            <p>Good animation names make your game code cleaner:</p>
            <ul>
                <li><code>player_idle</code> - Character standing still</li>
                <li><code>player_run</code> - Character running</li>
                <li><code>player_jump</code> - Jump animation</li>
                <li><code>enemy_attack</code> - Enemy attack sequence</li>
                <li><code>coin_spin</code> - Collectible animation</li>
                <li><code>explosion_small</code> - Effect animation</li>
            </ul>

            <h2>Animation List</h2>
            <p>The right panel shows all animations saved to the current spritesheet:</p>
            <ul>
                <li>Click an animation to load it into the editor</li>
                <li>See frame count and duration at a glance</li>
                <li>Delete animations you no longer need</li>
            </ul>

            <h2>Loading Animations</h2>
            <p>Click any animation in the list to load it. This replaces your current timeline, so save first if you have unsaved changes.</p>

            <h2>Duplicating Animations</h2>
            <p>To create a variation of an existing animation:</p>
            <ol>
                <li>Load the animation you want to copy</li>
                <li>Make your changes</li>
                <li>Change the name</li>
                <li>Save as a new animation</li>
            </ol>

            <h2>Deleting Animations</h2>
            <p>Remove animations you no longer need by clicking the delete button. This action cannot be undone.</p>

            <div class="tip">
                <div class="tip-label">Tip</div>
                Create animation variations with suffixes: <code>player_idle</code>, <code>player_idle_tired</code>, <code>player_idle_alert</code>.
            </div>
        `
    },
    {
        id: 'shortcuts',
        title: 'Shortcuts',
        content: `
            <h1>Keyboard Shortcuts</h1>
            <p>Speed up your animation workflow with these keyboard shortcuts.</p>

            <h2>Playback</h2>
            <ul>
                <li><kbd>Space</kbd> - Play/Pause</li>
                <li><kbd>Enter</kbd> - Stop and reset</li>
                <li><kbd>←</kbd> - Previous frame</li>
                <li><kbd>→</kbd> - Next frame</li>
            </ul>

            <h2>Timeline</h2>
            <ul>
                <li><kbd>Delete</kbd> - Remove selected frame</li>
                <li><kbd>Home</kbd> - Go to first frame</li>
                <li><kbd>End</kbd> - Go to last frame</li>
            </ul>

            <h2>General</h2>
            <ul>
                <li><kbd>Ctrl</kbd>+<kbd>S</kbd> - Save animation</li>
                <li><kbd>Ctrl</kbd>+<kbd>N</kbd> - New animation</li>
                <li><kbd>?</kbd> - Toggle help panel</li>
                <li><kbd>Esc</kbd> - Close panels/dialogs</li>
            </ul>

            <h2>Speed Controls</h2>
            <ul>
                <li><kbd>1</kbd> - Normal speed (1x)</li>
                <li><kbd>2</kbd> - Double speed (2x)</li>
                <li><kbd>Shift</kbd>+<kbd>1</kbd> - Half speed (0.5x)</li>
            </ul>

            <div class="tip">
                <div class="tip-label">Pro Tip</div>
                Use <kbd>Space</kbd> to quickly play/pause while adjusting frame durations to dial in the perfect timing.
            </div>
        `
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ANIMANCER_DOCS;
}

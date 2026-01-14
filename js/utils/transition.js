/**
 * Mantleborn - Screen Transition Utility
 *
 * Provides reusable fade transitions between game screens.
 * Supports fade-out, hold, and fade-in with configurable durations.
 */

// Transition states
const TransitionState = {
    IDLE: 'idle',
    FADING_OUT: 'fadingOut',
    HOLDING: 'holding',
    FADING_IN: 'fadingIn'
};

/**
 * Manages smooth fade transitions between screens.
 */
export class Transition {
    constructor(game) {
        this.game = game;
        this.state = TransitionState.IDLE;

        // Transition timing (in seconds)
        this.fadeOutDuration = 0.5;
        this.holdDuration = 0.2;
        this.fadeInDuration = 0.5;

        // Current state
        this.alpha = 0;
        this.timer = 0;

        // Callback for when transition reaches midpoint (screen swap)
        this.onMidpoint = null;
        // Callback for when transition completes
        this.onComplete = null;

        // Target state to transition to
        this.targetState = null;
    }

    /**
     * Check if a transition is currently active.
     */
    isActive() {
        return this.state !== TransitionState.IDLE;
    }

    /**
     * Start a fade transition to a new game state.
     * @param {string} targetState - The GameState to transition to
     * @param {object} options - Optional timing overrides
     */
    start(targetState, options = {}) {
        if (this.isActive()) return;

        this.targetState = targetState;
        this.fadeOutDuration = options.fadeOut ?? 0.5;
        this.holdDuration = options.hold ?? 0.2;
        this.fadeInDuration = options.fadeIn ?? 0.5;
        this.onMidpoint = options.onMidpoint ?? null;
        this.onComplete = options.onComplete ?? null;

        this.state = TransitionState.FADING_OUT;
        this.timer = 0;
        this.alpha = 0;

        // Disable input during transition
        this.game.inputEnabled = false;
    }

    /**
     * Update the transition state.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (!this.isActive()) return;

        this.timer += dt;

        switch (this.state) {
            case TransitionState.FADING_OUT:
                this.alpha = Math.min(1, this.timer / this.fadeOutDuration);
                if (this.timer >= this.fadeOutDuration) {
                    this.state = TransitionState.HOLDING;
                    this.timer = 0;

                    // Swap screens at midpoint
                    if (this.targetState) {
                        this.game.setState(this.targetState);
                    }
                    if (this.onMidpoint) {
                        this.onMidpoint();
                    }
                }
                break;

            case TransitionState.HOLDING:
                this.alpha = 1;
                if (this.timer >= this.holdDuration) {
                    this.state = TransitionState.FADING_IN;
                    this.timer = 0;
                }
                break;

            case TransitionState.FADING_IN:
                this.alpha = 1 - Math.min(1, this.timer / this.fadeInDuration);
                if (this.timer >= this.fadeInDuration) {
                    this.complete();
                }
                break;
        }
    }

    /**
     * Complete the transition and reset state.
     */
    complete() {
        this.state = TransitionState.IDLE;
        this.alpha = 0;
        this.timer = 0;
        this.targetState = null;

        // Re-enable input
        this.game.inputEnabled = true;

        if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
        this.onMidpoint = null;
    }

    /**
     * Render the fade overlay.
     * Should be called last in the render pipeline.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (!this.isActive() && this.alpha <= 0) return;

        ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
    }
}

/**
 * GAME WIZARD - Notifications Component
 *
 * Magical notification bell for project invites and other alerts.
 * Include after supabase-client.js in any tool.
 */

// =============================================
// NOTIFICATION STYLES (injected into page)
// =============================================
const notificationStyles = `
    .notification-bell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--bg-surface);
        border: 1px solid var(--stone-dark);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 18px;
    }

    .notification-bell:hover {
        background: var(--stone-dark);
        border-color: var(--stone-mid);
    }

    .notification-bell.has-unread {
        border-color: var(--accent-gold, #ffa500);
        animation: bell-glow 2s ease-in-out infinite;
    }

    @keyframes bell-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.3); }
        50% { box-shadow: 0 0 15px rgba(255, 165, 0, 0.6); }
    }

    .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        background: linear-gradient(135deg, #e07020, #ff9040);
        border: 1px solid #ffa500;
        border-radius: 8px;
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        box-shadow: 0 0 8px rgba(255, 165, 0, 0.5);
    }

    .notification-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 320px;
        max-height: 400px;
        background: var(--bg-mid, #1a1a2e);
        border: 1px solid var(--stone-dark, #3a3a5c);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        z-index: 1000;
        display: none;
    }

    .notification-dropdown.open {
        display: block;
    }

    .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--bg-surface, #252542);
        border-bottom: 1px solid var(--stone-dark, #3a3a5c);
    }

    .notification-title {
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: var(--stone-light, #9a9abe);
        letter-spacing: 1px;
    }

    .notification-mark-read {
        font-size: 10px;
        color: var(--stone-mid, #6a6a8e);
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: underline;
    }

    .notification-mark-read:hover {
        color: var(--accent-gold, #ffa500);
    }

    .notification-list {
        max-height: 340px;
        overflow-y: auto;
    }

    .notification-empty {
        padding: 32px 16px;
        text-align: center;
        color: var(--stone-mid, #6a6a8e);
        font-size: 12px;
    }

    .notification-empty-icon {
        font-size: 32px;
        margin-bottom: 12px;
        opacity: 0.5;
    }

    .notification-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--stone-dark, #3a3a5c);
        transition: background 0.2s;
    }

    .notification-item:hover {
        background: var(--bg-surface, #252542);
    }

    .notification-item.unread {
        background: rgba(255, 165, 0, 0.05);
        border-left: 3px solid var(--accent-gold, #ffa500);
    }

    .notification-item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .notification-item-icon {
        font-size: 16px;
    }

    .notification-item-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--stone-light, #9a9abe);
    }

    .notification-item-time {
        margin-left: auto;
        font-size: 9px;
        color: var(--stone-mid, #6a6a8e);
    }

    .notification-item-message {
        font-size: 12px;
        color: var(--stone-mid, #6a6a8e);
        line-height: 1.4;
        margin-bottom: 10px;
    }

    .notification-item-actions {
        display: flex;
        gap: 8px;
    }

    .notification-btn {
        flex: 1;
        padding: 6px 12px;
        font-family: inherit;
        font-size: 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .notification-btn-accept {
        background: linear-gradient(135deg, #2a6a2a, #3a8a3a);
        border: 1px solid #4a9a4a;
        color: #fff;
    }

    .notification-btn-accept:hover {
        background: linear-gradient(135deg, #3a8a3a, #4a9a4a);
        box-shadow: 0 0 8px rgba(74, 154, 74, 0.5);
    }

    .notification-btn-decline {
        background: var(--bg-surface, #252542);
        border: 1px solid var(--stone-dark, #3a3a5c);
        color: var(--stone-mid, #6a6a8e);
    }

    .notification-btn-decline:hover {
        background: var(--stone-dark, #3a3a5c);
        color: var(--stone-light, #9a9abe);
    }

    .notification-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// =============================================
// NOTIFICATION COMPONENT
// =============================================
class NotificationComponent {
    constructor() {
        this.container = null;
        this.dropdown = null;
        this.badge = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.pollInterval = null;
    }

    // Inject styles into page
    injectStyles() {
        if (document.getElementById('notification-styles')) return;
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = notificationStyles;
        document.head.appendChild(style);
    }

    // Create the bell HTML
    createBellHTML() {
        return `
            <div class="notification-bell" id="notificationBell" title="Notifications">
                <span class="bell-icon">&#128276;</span>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </div>
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="notification-header">
                    <span class="notification-title">NOTIFICATIONS</span>
                    <button class="notification-mark-read" id="markAllRead">Mark all read</button>
                </div>
                <div class="notification-list" id="notificationList">
                    <div class="notification-empty">
                        <div class="notification-empty-icon">&#128276;</div>
                        <div>No notifications yet</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize component
    async init(containerSelector) {
        this.injectStyles();

        // Find or create container
        const targetContainer = document.querySelector(containerSelector);
        if (!targetContainer) {
            console.warn('Notification container not found:', containerSelector);
            return;
        }

        // Create wrapper
        this.container = document.createElement('div');
        this.container.style.position = 'relative';
        this.container.innerHTML = this.createBellHTML();

        // Insert before auth indicator if it exists, or at end
        const authIndicator = targetContainer.querySelector('.auth-indicator');
        if (authIndicator) {
            targetContainer.insertBefore(this.container, authIndicator);
        } else {
            targetContainer.appendChild(this.container);
        }

        // Get references
        this.bell = this.container.querySelector('#notificationBell');
        this.dropdown = this.container.querySelector('#notificationDropdown');
        this.badge = this.container.querySelector('#notificationBadge');
        this.list = this.container.querySelector('#notificationList');

        // Event listeners
        this.bell.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });

        this.container.querySelector('#markAllRead').addEventListener('click', () => {
            this.markAllRead();
        });

        // Initial load
        await this.refresh();

        // Start polling every 30 seconds
        this.pollInterval = setInterval(() => this.refresh(), 30000);
    }

    // Toggle dropdown
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.dropdown.classList.add('open');
        this.refresh();
    }

    close() {
        this.isOpen = false;
        this.dropdown.classList.remove('open');
    }

    // Refresh notifications
    async refresh() {
        try {
            const crucible = await getCrucible();
            if (!crucible.client) return;

            const user = await crucible.getUser();
            if (!user) {
                this.updateBadge(0);
                return;
            }

            this.notifications = await crucible.getNotifications();
            this.unreadCount = this.notifications.filter(n => !n.read).length;

            this.updateBadge(this.unreadCount);
            this.renderList();
        } catch (err) {
            console.error('Failed to refresh notifications:', err);
        }
    }

    // Update badge
    updateBadge(count) {
        if (count > 0) {
            this.badge.textContent = count > 9 ? '9+' : count;
            this.badge.style.display = 'flex';
            this.bell.classList.add('has-unread');
        } else {
            this.badge.style.display = 'none';
            this.bell.classList.remove('has-unread');
        }
    }

    // Format time ago
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    // Get icon for notification type
    getIcon(type) {
        switch (type) {
            case 'project_invite': return '&#128231;'; // Scroll/letter
            default: return '&#128276;'; // Bell
        }
    }

    // Render notification list
    renderList() {
        if (this.notifications.length === 0) {
            this.list.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">&#128276;</div>
                    <div>No notifications yet</div>
                </div>
            `;
            return;
        }

        this.list.innerHTML = this.notifications.map(n => {
            const isInvite = n.type === 'project_invite' && !n.acted_on;
            return `
                <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                    <div class="notification-item-header">
                        <span class="notification-item-icon">${this.getIcon(n.type)}</span>
                        <span class="notification-item-title">${n.title}</span>
                        <span class="notification-item-time">${this.timeAgo(n.created_at)}</span>
                    </div>
                    <div class="notification-item-message">${n.message}</div>
                    ${isInvite ? `
                        <div class="notification-item-actions">
                            <button class="notification-btn notification-btn-accept" data-action="accept" data-id="${n.id}">
                                Accept
                            </button>
                            <button class="notification-btn notification-btn-decline" data-action="decline" data-id="${n.id}">
                                Decline
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers for invite actions
        this.list.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (action === 'accept') this.acceptInvite(id, btn);
                if (action === 'decline') this.declineInvite(id, btn);
            });
        });
    }

    // Accept invite
    async acceptInvite(notificationId, btn) {
        const buttons = btn.parentElement.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);
        btn.textContent = 'Joining...';

        try {
            const crucible = await getCrucible();
            await crucible.acceptProjectInvite(notificationId);

            // Show success
            btn.textContent = 'Joined!';
            btn.parentElement.innerHTML = '<span style="color: var(--success); font-size: 11px;">You\'ve joined the project!</span>';

            // Refresh after delay
            setTimeout(() => this.refresh(), 1500);

            // Trigger refresh of project list if available
            if (typeof loadProjects === 'function') {
                loadProjects();
            }
        } catch (err) {
            console.error('Failed to accept invite:', err);
            btn.textContent = 'Error';
            buttons.forEach(b => b.disabled = false);
        }
    }

    // Decline invite
    async declineInvite(notificationId, btn) {
        const buttons = btn.parentElement.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        try {
            const crucible = await getCrucible();
            await crucible.declineProjectInvite(notificationId);

            // Remove from UI
            const item = btn.closest('.notification-item');
            item.style.opacity = '0.5';
            setTimeout(() => this.refresh(), 500);
        } catch (err) {
            console.error('Failed to decline invite:', err);
            buttons.forEach(b => b.disabled = false);
        }
    }

    // Mark all as read
    async markAllRead() {
        try {
            const crucible = await getCrucible();
            await crucible.markAllNotificationsRead();
            this.refresh();
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    }

    // Cleanup
    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}

// =============================================
// AUTO-INITIALIZE
// =============================================
const notificationComponent = new NotificationComponent();

// Export for manual init if needed
window.NotificationComponent = NotificationComponent;
window.notificationComponent = notificationComponent;

// Helper to init notifications in any tool
window.initNotifications = async function(containerSelector = '.header-actions') {
    await notificationComponent.init(containerSelector);
};

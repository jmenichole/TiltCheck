/**
 * 🎵 AIM-Style Instant Messenger with .wav Sound Notifications
 * Classic AOL Instant Messenger experience for TiltCheck overlay
 */

class AIMMessenger {
    constructor() {
        this.isInitialized = false;
        this.buddyList = new Map();
        this.conversations = new Map();
        this.sounds = {
            message: new Audio('55817__sergenious__bloop2.wav'),
            buddyOnline: new Audio('sounds/buddy-online.wav'),
            buddyOffline: new Audio('sounds/buddy-offline.wav'),
            buddyMessage: new Audio('sounds/buddy-message.wav')
        };
        this.settings = {
            soundEnabled: true,
            volume: 0.7,
            showTimestamps: true,
            awayMessage: "I'm away from my computer right now."
        };
        this.status = 'online'; // online, away, idle, invisible
        this.init();
    }

    init() {
        this.setupAudio();
        this.createAIMInterface();
        this.loadBuddyList();
        this.connectToServer();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🎯 AIM Messenger initialized');
    }

    setupAudio() {
        // Configure all audio files
        Object.values(this.sounds).forEach(audio => {
            audio.volume = this.settings.volume;
            audio.preload = 'auto';
        });

        // Test primary notification sound
        this.sounds.message.addEventListener('canplaythrough', () => {
            console.log('🔊 AIM notification sound loaded');
        });

        this.sounds.message.addEventListener('error', (e) => {
            console.warn('⚠️ Could not load notification sound:', e);
        });
    }

    createAIMInterface() {
        // Create AIM-style buddy list window
        const aimContainer = document.createElement('div');
        aimContainer.className = 'aim-container';
        aimContainer.innerHTML = `
            <div class="aim-buddy-list">
                <div class="aim-header">
                    <div class="aim-title">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMkM0LjY4NjI5IDIgMiA0LjY4NjI5IDIgOEMyIDExLjMxMzcgNC42ODYyOSAxNCA4IDE0QzExLjMxMzcgMTQgMTQgMTEuMzEzNyAxNCA4QzE0IDQuNjg2MjkgMTEuMzEzNyAyIDggMloiIGZpbGw9IiMwMEZGNTgiLz4KPC9zdmc+" alt="AIM">
                        TiltCheck AIM
                    </div>
                    <div class="aim-status">
                        <select id="aim-status-select">
                            <option value="online">🟢 Online</option>
                            <option value="away">🟡 Away</option>
                            <option value="idle">🟠 Idle</option>
                            <option value="invisible">⚫ Invisible</option>
                        </select>
                    </div>
                </div>
                
                <div class="aim-toolbar">
                    <button id="aim-setup" title="Setup">⚙️</button>
                    <button id="aim-find-buddy" title="Find Buddy">🔍</button>
                    <button id="aim-preferences" title="Preferences">📝</button>
                    <button id="aim-help" title="Help">❓</button>
                </div>

                <div class="aim-buddy-groups">
                    <div class="buddy-group" data-group="online">
                        <div class="group-header" onclick="this.parentElement.classList.toggle('collapsed')">
                            <span class="group-icon">▼</span>
                            <span class="group-name">Buddies (0/0)</span>
                        </div>
                        <div class="buddy-list" id="online-buddies"></div>
                    </div>
                    
                    <div class="buddy-group" data-group="gambling">
                        <div class="group-header" onclick="this.parentElement.classList.toggle('collapsed')">
                            <span class="group-icon">▼</span>
                            <span class="group-name">Gambling Buddies (0/0)</span>
                        </div>
                        <div class="buddy-list" id="gambling-buddies"></div>
                    </div>
                    
                    <div class="buddy-group collapsed" data-group="offline">
                        <div class="group-header" onclick="this.parentElement.classList.toggle('collapsed')">
                            <span class="group-icon">▶</span>
                            <span class="group-name">Offline (0)</span>
                        </div>
                        <div class="buddy-list" id="offline-buddies"></div>
                    </div>
                </div>

                <div class="aim-footer">
                    <div class="aim-username">TiltCheckUser</div>
                    <div class="aim-connection">Connected</div>
                </div>
            </div>

            <div class="aim-conversations" id="aim-conversations"></div>
        `;

        // Add AIM-specific styles
        const aimStyles = document.createElement('style');
        aimStyles.textContent = `
            .aim-container {
                font-family: 'MS Sans Serif', sans-serif;
                font-size: 11px;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
            }

            .aim-buddy-list {
                width: 200px;
                background: #c0c0c0;
                border: 2px outset #c0c0c0;
                border-radius: 0;
                box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .aim-header {
                background: linear-gradient(90deg, #0000ff, #008080);
                color: white;
                padding: 2px 4px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .aim-title {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
            }

            .aim-status select {
                font-size: 10px;
                background: white;
                border: 1px inset #c0c0c0;
            }

            .aim-toolbar {
                background: #e0e0e0;
                padding: 2px;
                border-bottom: 1px solid #808080;
                display: flex;
                gap: 2px;
            }

            .aim-toolbar button {
                background: #c0c0c0;
                border: 1px outset #c0c0c0;
                padding: 2px 4px;
                font-size: 10px;
                cursor: pointer;
            }

            .aim-toolbar button:active {
                border: 1px inset #c0c0c0;
            }

            .buddy-group {
                border-bottom: 1px solid #808080;
            }

            .group-header {
                background: #e0e0e0;
                padding: 2px 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: bold;
            }

            .group-header:hover {
                background: #f0f0f0;
            }

            .buddy-group.collapsed .group-icon::before {
                content: "▶";
            }

            .buddy-group.collapsed .buddy-list {
                display: none;
            }

            .buddy-list {
                max-height: 200px;
                overflow-y: auto;
                background: white;
            }

            .buddy-item {
                padding: 2px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                border-bottom: 1px dotted #e0e0e0;
            }

            .buddy-item:hover {
                background: #316ac5;
                color: white;
            }

            .buddy-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .buddy-status.online { background: #00ff00; }
            .buddy-status.away { background: #ffff00; }
            .buddy-status.idle { background: #ffa500; }
            .buddy-status.offline { background: #808080; }

            .buddy-name {
                flex: 1;
                font-size: 11px;
            }

            .buddy-item.new-message {
                background: #ffff99;
                font-weight: bold;
            }

            .aim-footer {
                background: #e0e0e0;
                padding: 2px 4px;
                border-top: 1px solid #808080;
                font-size: 10px;
            }

            .aim-connection {
                color: #008000;
            }

            /* Message Window Styles */
            .aim-message-window {
                width: 400px;
                height: 300px;
                background: #c0c0c0;
                border: 2px outset #c0c0c0;
                position: fixed;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .aim-message-header {
                background: linear-gradient(90deg, #0000ff, #008080);
                color: white;
                padding: 2px 4px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }

            .aim-message-close {
                background: #ff0000;
                color: white;
                border: none;
                width: 16px;
                height: 14px;
                font-size: 10px;
                cursor: pointer;
            }

            .aim-message-toolbar {
                background: #e0e0e0;
                padding: 2px;
                border-bottom: 1px solid #808080;
            }

            .aim-message-content {
                flex: 1;
                background: white;
                padding: 4px;
                overflow-y: auto;
                font-family: 'Times New Roman', serif;
                font-size: 12px;
            }

            .aim-message-input {
                height: 60px;
                border-top: 1px solid #808080;
                display: flex;
                flex-direction: column;
            }

            .aim-input-area {
                flex: 1;
                border: 1px inset #c0c0c0;
                margin: 2px;
                padding: 2px;
                font-family: 'Times New Roman', serif;
                font-size: 12px;
                resize: none;
            }

            .aim-input-buttons {
                background: #e0e0e0;
                padding: 2px;
                display: flex;
                justify-content: flex-end;
                gap: 4px;
            }

            .aim-send-button {
                background: #c0c0c0;
                border: 1px outset #c0c0c0;
                padding: 2px 8px;
                font-size: 11px;
                cursor: pointer;
            }

            .aim-send-button:active {
                border: 1px inset #c0c0c0;
            }

            .message-line {
                margin: 2px 0;
                word-wrap: break-word;
            }

            .message-timestamp {
                color: #808080;
                font-size: 10px;
            }

            .message-sender {
                font-weight: bold;
            }

            .message-text {
                margin-left: 8px;
            }

            .system-message {
                color: #0000ff;
                font-style: italic;
                font-size: 10px;
            }
        `;

        document.head.appendChild(aimStyles);
        document.body.appendChild(aimContainer);

        this.aimContainer = aimContainer;
        this.buddyListElement = aimContainer.querySelector('.aim-buddy-list');
    }

    loadBuddyList() {
        // Sample buddy list - in real implementation, load from server
        const sampleBuddies = [
            { username: 'TiltMaster', status: 'online', group: 'gambling', lastMessage: null },
            { username: 'PokerPro2024', status: 'away', group: 'gambling', lastMessage: 'Hey, wanna play?' },
            { username: 'SlotQueen', status: 'online', group: 'gambling', lastMessage: null },
            { username: 'BettingBuddy', status: 'idle', group: 'gambling', lastMessage: null },
            { username: 'CasinoKing', status: 'offline', group: 'gambling', lastMessage: 'Last seen: 2 hours ago' },
            { username: 'ResponsibleGamer', status: 'online', group: 'online', lastMessage: null }
        ];

        sampleBuddies.forEach(buddy => {
            this.buddyList.set(buddy.username, buddy);
        });

        this.updateBuddyListDisplay();
    }

    updateBuddyListDisplay() {
        const onlineList = document.getElementById('online-buddies');
        const gamblingList = document.getElementById('gambling-buddies');
        const offlineList = document.getElementById('offline-buddies');

        // Clear existing lists
        [onlineList, gamblingList, offlineList].forEach(list => {
            if (list) list.innerHTML = '';
        });

        let onlineCount = 0;
        let gamblingCount = 0;
        let offlineCount = 0;

        this.buddyList.forEach((buddy, username) => {
            const buddyElement = this.createBuddyElement(username, buddy);
            
            if (buddy.status === 'offline') {
                offlineList?.appendChild(buddyElement);
                offlineCount++;
            } else if (buddy.group === 'gambling') {
                gamblingList?.appendChild(buddyElement);
                gamblingCount++;
            } else {
                onlineList?.appendChild(buddyElement);
                onlineCount++;
            }
        });

        // Update group headers
        this.updateGroupHeader('online', onlineCount, onlineCount);
        this.updateGroupHeader('gambling', gamblingCount, gamblingCount);
        this.updateGroupHeader('offline', offlineCount, 0);
    }

    createBuddyElement(username, buddy) {
        const element = document.createElement('div');
        element.className = 'buddy-item';
        element.dataset.username = username;
        
        if (buddy.lastMessage) {
            element.classList.add('new-message');
        }

        element.innerHTML = `
            <div class="buddy-status ${buddy.status}"></div>
            <div class="buddy-name">${username}</div>
        `;

        element.addEventListener('dblclick', () => {
            this.openConversation(username);
        });

        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showBuddyContextMenu(username, e.clientX, e.clientY);
        });

        return element;
    }

    updateGroupHeader(group, onlineCount, totalCount) {
        const groupElement = document.querySelector(`[data-group="${group}"] .group-name`);
        if (groupElement) {
            if (group === 'offline') {
                groupElement.textContent = `Offline (${onlineCount})`;
            } else {
                const displayName = group.charAt(0).toUpperCase() + group.slice(1);
                groupElement.textContent = `${displayName} Buddies (${onlineCount}/${totalCount})`;
            }
        }
    }

    openConversation(username) {
        if (this.conversations.has(username)) {
            // Focus existing conversation
            const window = this.conversations.get(username);
            window.element.style.zIndex = '10002';
            return;
        }

        const buddy = this.buddyList.get(username);
        if (!buddy) return;

        const conversation = this.createConversationWindow(username, buddy);
        this.conversations.set(username, conversation);

        // Clear new message indicator
        buddy.lastMessage = null;
        this.updateBuddyListDisplay();
    }

    createConversationWindow(username, buddy) {
        const windowElement = document.createElement('div');
        windowElement.className = 'aim-message-window';
        windowElement.style.left = `${100 + this.conversations.size * 30}px`;
        windowElement.style.top = `${100 + this.conversations.size * 30}px`;

        windowElement.innerHTML = `
            <div class="aim-message-header">
                <span>Instant Message with ${username}</span>
                <button class="aim-message-close">×</button>
            </div>
            <div class="aim-message-toolbar">
                <span style="font-size: 10px;">Font: Arial | Size: 10 | 🅱️ 𝐼 𝑈</span>
            </div>
            <div class="aim-message-content" id="messages-${username}"></div>
            <div class="aim-message-input">
                <textarea class="aim-input-area" placeholder="Type your message here..."></textarea>
                <div class="aim-input-buttons">
                    <button class="aim-send-button">Send</button>
                </div>
            </div>
        `;

        // Make window draggable
        this.makeDraggable(windowElement, windowElement.querySelector('.aim-message-header'));

        // Event listeners
        const closeButton = windowElement.querySelector('.aim-message-close');
        const sendButton = windowElement.querySelector('.aim-send-button');
        const textArea = windowElement.querySelector('.aim-input-area');

        closeButton.addEventListener('click', () => {
            this.closeConversation(username);
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage(username, textArea.value);
            textArea.value = '';
        });

        textArea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(username, textArea.value);
                textArea.value = '';
            }
        });

        document.body.appendChild(windowElement);

        const conversation = {
            element: windowElement,
            messages: [],
            messagesContainer: windowElement.querySelector(`#messages-${username}`),
            inputArea: textArea
        };

        // Add system message
        this.addSystemMessage(conversation, `Starting conversation with ${username}`);

        return conversation;
    }

    sendMessage(username, message) {
        if (!message.trim()) return;

        const conversation = this.conversations.get(username);
        if (!conversation) return;

        // Add message to conversation
        this.addMessage(conversation, 'You', message, new Date());

        // Play message send sound (quieter)
        if (this.settings.soundEnabled) {
            const sendSound = this.sounds.message.cloneNode();
            sendSound.volume = this.settings.volume * 0.5;
            sendSound.play().catch(e => console.warn('Could not play send sound:', e));
        }

        // Simulate buddy response (in real implementation, send to server)
        setTimeout(() => {
            this.simulateBuddyResponse(username, message);
        }, 1000 + Math.random() * 3000);
    }

    simulateBuddyResponse(username, originalMessage) {
        const conversation = this.conversations.get(username);
        if (!conversation) return;

        // Generate contextual responses based on gambling/tilt themes
        const responses = [
            "Yeah, I feel you on that bet",
            "Been there, that's rough",
            "Maybe take a break? That sounds tilted",
            "What's your bankroll looking like?",
            "I'm on a heater right now, up 3 units",
            "That variance is brutal",
            "Remember, it's +EV in the long run",
            "Want to rail my session?",
            "Just lost a flip for $500, ugh",
            "This game is so rigged lol",
            "Tilt protection activated for me",
            "Going to cash out and call it a night",
            "One more hand then I'm done... famous last words"
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.receiveMessage(username, response);
    }

    receiveMessage(username, message) {
        const conversation = this.conversations.get(username);
        
        if (conversation) {
            // Add to open conversation
            this.addMessage(conversation, username, message, new Date());
        } else {
            // Update buddy list with new message indicator
            const buddy = this.buddyList.get(username);
            if (buddy) {
                buddy.lastMessage = message;
                this.updateBuddyListDisplay();
            }
        }

        // Play notification sound
        this.playNotificationSound();

        // Show desktop notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Message from ${username}`, {
                body: message,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDRDOC4yNjg2MiA0IDQgOC4yNjg2MiA0IDE2QzQgMjMuNzMxNCA4LjI2ODYyIDI4IDE2IDI4QzIzLjczMTQgMjggMjggMjMuNzMxNCAyOCAxNkMyOCA4LjI2ODYyIDIzLjczMTQgNCAxNiA0WiIgZmlsbD0iIzAwRkY1OCIvPgo8L3N2Zz4=',
                tag: username
            });
        }
    }

    addMessage(conversation, sender, message, timestamp) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-line';

        const timeStr = this.settings.showTimestamps ? 
            `<span class="message-timestamp">(${timestamp.toLocaleTimeString()})</span> ` : '';

        messageElement.innerHTML = `
            ${timeStr}<span class="message-sender">${sender}:</span>
            <span class="message-text">${this.escapeHtml(message)}</span>
        `;

        conversation.messagesContainer.appendChild(messageElement);
        conversation.messagesContainer.scrollTop = conversation.messagesContainer.scrollHeight;
        conversation.messages.push({ sender, message, timestamp });
    }

    addSystemMessage(conversation, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-line system-message';
        messageElement.textContent = message;

        conversation.messagesContainer.appendChild(messageElement);
        conversation.messagesContainer.scrollTop = conversation.messagesContainer.scrollHeight;
    }

    playNotificationSound() {
        if (!this.settings.soundEnabled) return;

        this.sounds.message.currentTime = 0;
        this.sounds.message.play().catch(e => {
            console.warn('Could not play notification sound:', e);
        });
    }

    closeConversation(username) {
        const conversation = this.conversations.get(username);
        if (!conversation) return;

        conversation.element.remove();
        this.conversations.delete(username);
    }

    makeDraggable(element, handle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        handle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === handle) {
                isDragging = true;
            }
        }

        function dragMove(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }

    setupEventListeners() {
        // Status change
        const statusSelect = document.getElementById('aim-status-select');
        statusSelect?.addEventListener('change', (e) => {
            this.status = e.target.value;
            this.updateStatus(this.status);
        });

        // Toolbar buttons
        document.getElementById('aim-setup')?.addEventListener('click', () => {
            this.showSetupDialog();
        });

        document.getElementById('aim-preferences')?.addEventListener('click', () => {
            this.showPreferencesDialog();
        });

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showPreferencesDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'aim-preferences-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #c0c0c0;
            border: 2px outset #c0c0c0;
            padding: 10px;
            z-index: 10003;
            font-family: 'MS Sans Serif', sans-serif;
            font-size: 11px;
        `;

        dialog.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">AIM Preferences</div>
            <label>
                <input type="checkbox" ${this.settings.soundEnabled ? 'checked' : ''}> 
                Enable sounds
            </label><br>
            <label>
                <input type="checkbox" ${this.settings.showTimestamps ? 'checked' : ''}> 
                Show timestamps
            </label><br>
            <label>
                Volume: <input type="range" min="0" max="1" step="0.1" value="${this.settings.volume}">
            </label><br><br>
            <button onclick="this.parentElement.remove()">OK</button>
            <button onclick="this.parentElement.remove()">Cancel</button>
        `;

        document.body.appendChild(dialog);
    }

    connectToServer() {
        // Simulate connection - in real implementation, connect to WebSocket
        setTimeout(() => {
            console.log('🌐 Connected to AIM server');
            this.addSystemMessage({ messagesContainer: document.createElement('div') }, 'Connected to TiltCheck AIM Network');
        }, 1000);
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        console.log(`📡 Status changed to: ${newStatus}`);
        
        // Update UI
        const connection = document.querySelector('.aim-connection');
        if (connection) {
            connection.textContent = `Connected - ${newStatus}`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods
    addBuddy(username, group = 'online') {
        if (!this.buddyList.has(username)) {
            this.buddyList.set(username, {
                username,
                status: 'offline',
                group,
                lastMessage: null
            });
            this.updateBuddyListDisplay();
        }
    }

    removeBuddy(username) {
        this.buddyList.delete(username);
        this.closeConversation(username);
        this.updateBuddyListDisplay();
    }

    setBuddyStatus(username, status) {
        const buddy = this.buddyList.get(username);
        if (buddy) {
            buddy.status = status;
            this.updateBuddyListDisplay();
        }
    }

    sendMessageToBuddy(username, message) {
        this.receiveMessage(username, message);
    }
}

// Auto-initialize AIM Messenger
let aimMessenger;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        aimMessenger = new AIMMessenger();
    });
} else {
    aimMessenger = new AIMMessenger();
}

// Export for global access
window.AIMMessenger = AIMMessenger;
window.aimMessenger = aimMessenger;

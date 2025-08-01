/**
 * 🔔 TiltCheck AIM Notification Integration
 * Handles AIM-style notifications for gambling events, tilt alerts, and social features
 */

class TiltCheckAIMNotifications {
    constructor(aimMessenger) {
        this.aimMessenger = aimMessenger;
        this.notificationQueue = [];
        this.isProcessing = false;
        this.sounds = {
            tiltAlert: new Audio('55817__sergenious__bloop2.wav'),
            bigWin: new Audio('sounds/win-notification.wav'),
            bigLoss: new Audio('sounds/loss-alert.wav'),
            buddyMessage: new Audio('sounds/buddy-message.wav'),
            systemAlert: new Audio('sounds/system-alert.wav')
        };
        
        this.setupEventListeners();
        this.initializeNotificationSystem();
    }

    initializeNotificationSystem() {
        // Configure audio settings
        Object.values(this.sounds).forEach(audio => {
            audio.volume = 0.6;
            audio.preload = 'auto';
        });

        // Start notification processor
        this.startNotificationProcessor();
        
        console.log('🔔 TiltCheck AIM Notifications initialized');
    }

    setupEventListeners() {
        // Listen for TiltCheck events
        if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.on('tilt-alert', (event, data) => {
                this.handleTiltAlert(data);
            });

            ipcRenderer.on('betting-event', (event, data) => {
                this.handleBettingEvent(data);
            });

            ipcRenderer.on('social-event', (event, data) => {
                this.handleSocialEvent(data);
            });

            ipcRenderer.on('system-notification', (event, data) => {
                this.handleSystemNotification(data);
            });
        }

        // Listen for AIM messenger events
        document.addEventListener('aim-buddy-online', (event) => {
            this.handleBuddyStatusChange(event.detail, 'online');
        });

        document.addEventListener('aim-buddy-offline', (event) => {
            this.handleBuddyStatusChange(event.detail, 'offline');
        });
    }

    handleTiltAlert(data) {
        const alertMessages = {
            low: "Hey, just checking in. How's your session going?",
            medium: "I noticed some pattern changes in your betting. Take a breather?",
            high: "🚨 TILT ALERT! Time to step away, buddy. You've got this under control.",
            critical: "INTERVENTION NEEDED! Your account has been temporarily restricted for your protection."
        };

        const message = alertMessages[data.level] || "Tilt protection activated.";
        
        // Send message from TiltCheck system buddy
        this.sendSystemMessage('TiltProtection', message, 'tilt');
        
        // Play appropriate sound
        this.playNotificationSound('tiltAlert');
        
        // Add to notification queue
        this.queueNotification({
            type: 'tilt-alert',
            level: data.level,
            message: message,
            timestamp: new Date(),
            urgent: data.level === 'critical'
        });
    }

    handleBettingEvent(data) {
        const { type, amount, result, streak } = data;
        
        let message = '';
        let soundType = 'systemAlert';
        
        switch (type) {
            case 'big-win':
                message = `🎉 Huge win! $${amount}! Remember to set some aside for tomorrow.`;
                soundType = 'bigWin';
                break;
                
            case 'big-loss':
                message = `💔 Tough loss of $${amount}. Remember, it's just variance. Stay strong!`;
                soundType = 'bigLoss';
                break;
                
            case 'win-streak':
                message = `🔥 ${streak} wins in a row! You're on fire! Consider banking some profits.`;
                break;
                
            case 'loss-streak':
                message = `📉 ${streak} losses... Time for a break? Variance can be brutal.`;
                break;
                
            case 'session-milestone':
                message = `⏰ You've been playing for ${data.duration} hours. How about a stretch?`;
                break;
        }

        if (message) {
            this.sendSystemMessage('BettingBuddy', message, 'betting');
            this.playNotificationSound(soundType);
        }
    }

    handleSocialEvent(data) {
        const { type, user, details } = data;
        
        let message = '';
        
        switch (type) {
            case 'tip-received':
                message = `💰 You received a $${details.amount} tip from ${user}!`;
                if (details.message) {
                    message += ` Message: "${details.message}"`;
                }
                break;
                
            case 'challenge-received':
                message = `⚔️ ${user} challenged you to a ${details.battleType}! Stakes: ${details.stakes} respect points.`;
                break;
                
            case 'loan-approved':
                message = `✅ Your loan application for $${details.amount} was approved! Funds available now.`;
                break;
                
            case 'hangar-invite':
                message = `🏢 ${user} invited you to join "${details.hangarName}" battle hangar!`;
                break;
                
            case 'respect-milestone':
                message = `👑 Congratulations! You reached ${details.points} respect points!`;
                break;
        }

        if (message) {
            this.sendSystemMessage(user || 'TiltCheck', message, 'social');
            this.playNotificationSound('buddyMessage');
        }
    }

    handleSystemNotification(data) {
        const { type, message, priority } = data;
        
        this.sendSystemMessage('TiltCheck System', message, 'system');
        
        if (priority === 'high') {
            this.playNotificationSound('systemAlert');
            
            // Show desktop notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('TiltCheck Alert', {
                    body: message,
                    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDRDOC4yNjg2MiA0IDQgOC4yNjg2MiA0IDE2QzQgMjMuNzMxNCA4LjI2ODYyIDI4IDE2IDI4QzIzLjczMTQgMjggMjggMjMuNzMxNCAyOCAxNkMyOCA4LjI2ODYyIDIzLjczMTQgNCAxNiA0WiIgZmlsbD0iI0ZGNDQ0NCIvPgo8L3N2Zz4=',
                    requireInteraction: true
                });
            }
        }
    }

    handleBuddyStatusChange(username, status) {
        if (!this.aimMessenger.buddyList.has(username)) return;
        
        const buddy = this.aimMessenger.buddyList.get(username);
        const wasOnline = buddy.status !== 'offline';
        const isOnline = status !== 'offline';
        
        if (!wasOnline && isOnline) {
            // Buddy came online
            this.playNotificationSound('buddyMessage');
            
            // Send contextual greeting based on gambling behavior
            const greetings = [
                "Ready for another session?",
                "How'd yesterday go?",
                "Feeling lucky today?",
                "Remember to set limits!",
                "Let's chase some wins responsibly!"
            ];
            
            const greeting = greetings[Math.floor(Math.random() * greetings.length)];
            
            setTimeout(() => {
                this.aimMessenger.receiveMessage(username, greeting);
            }, 2000 + Math.random() * 3000);
            
        } else if (wasOnline && !isOnline) {
            // Buddy went offline
            this.playNotificationSound('systemAlert');
        }
    }

    sendSystemMessage(sender, message, category) {
        if (!this.aimMessenger) return;
        
        // Add sender to buddy list if not exists
        if (!this.aimMessenger.buddyList.has(sender)) {
            this.aimMessenger.addBuddy(sender, category === 'gambling' ? 'gambling' : 'online');
            this.aimMessenger.setBuddyStatus(sender, 'online');
        }
        
        // Send the message
        this.aimMessenger.receiveMessage(sender, message);
    }

    playNotificationSound(soundType) {
        const sound = this.sounds[soundType];
        if (sound && this.aimMessenger.settings.soundEnabled) {
            sound.currentTime = 0;
            sound.volume = this.aimMessenger.settings.volume;
            sound.play().catch(e => {
                console.warn(`Could not play ${soundType} sound:`, e);
                
                // Fallback to default sound
                if (soundType !== 'tiltAlert') {
                    this.playNotificationSound('tiltAlert');
                }
            });
        }
    }

    queueNotification(notification) {
        this.notificationQueue.push(notification);
        
        if (!this.isProcessing) {
            this.processNotificationQueue();
        }
    }

    startNotificationProcessor() {
        setInterval(() => {
            if (this.notificationQueue.length > 0 && !this.isProcessing) {
                this.processNotificationQueue();
            }
        }, 1000);
    }

    processNotificationQueue() {
        if (this.notificationQueue.length === 0) return;
        
        this.isProcessing = true;
        const notification = this.notificationQueue.shift();
        
        // Process notification based on type
        this.displayNotification(notification);
        
        // Delay before processing next notification
        setTimeout(() => {
            this.isProcessing = false;
        }, notification.urgent ? 500 : 2000);
    }

    displayNotification(notification) {
        // Add to overlay notification widget
        const notificationsWidget = document.getElementById('notificationsList');
        if (notificationsWidget) {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item ${this.getNotificationClass(notification.type)}`;
            
            const timeStr = notification.timestamp.toLocaleTimeString();
            notificationElement.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 2px;">
                    ${this.getNotificationTitle(notification.type)} 
                    <span style="float: right; font-size: 8px;">${timeStr}</span>
                </div>
                <div>${notification.message}</div>
            `;
            
            // Add to top of notifications
            notificationsWidget.insertBefore(notificationElement, notificationsWidget.firstChild);
            
            // Limit to 5 notifications
            while (notificationsWidget.children.length > 5) {
                notificationsWidget.removeChild(notificationsWidget.lastChild);
            }
            
            // Update notification count
            const countElement = document.getElementById('notificationCount');
            if (countElement) {
                countElement.textContent = notificationsWidget.children.length;
            }
        }
        
        // Flash the notification widget
        const widget = document.getElementById('notificationsWidget');
        if (widget) {
            widget.classList.add('data-updated');
            setTimeout(() => {
                widget.classList.remove('data-updated');
            }, 1000);
        }
    }

    getNotificationClass(type) {
        const classMap = {
            'tilt-alert': 'danger',
            'betting': 'warning',
            'social': 'success',
            'system': 'info'
        };
        return classMap[type] || 'info';
    }

    getNotificationTitle(type) {
        const titleMap = {
            'tilt-alert': '🛡️ Tilt Alert',
            'betting': '🎲 Betting Update',
            'social': '👥 Social',
            'system': '⚙️ System'
        };
        return titleMap[type] || '📢 Notification';
    }

    // Simulate some events for testing
    simulateEvents() {
        // Simulate tilt alert
        setTimeout(() => {
            this.handleTiltAlert({ level: 'medium' });
        }, 5000);
        
        // Simulate betting event
        setTimeout(() => {
            this.handleBettingEvent({
                type: 'big-win',
                amount: 150,
                result: 'win'
            });
        }, 10000);
        
        // Simulate social event
        setTimeout(() => {
            this.handleSocialEvent({
                type: 'tip-received',
                user: 'PokerPro2024',
                details: { amount: 25, message: 'Nice session!' }
            });
        }, 15000);
        
        // Simulate buddy coming online
        setTimeout(() => {
            this.handleBuddyStatusChange('BettingBuddy', 'online');
        }, 20000);
    }
}

// Auto-initialize when AIM Messenger is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for AIM Messenger to initialize
    const checkAIMReady = setInterval(() => {
        if (window.aimMessenger && window.aimMessenger.isInitialized) {
            clearInterval(checkAIMReady);
            
            // Initialize TiltCheck AIM Notifications
            window.tiltCheckNotifications = new TiltCheckAIMNotifications(window.aimMessenger);
            
            // Enable simulation for demo purposes
            if (window.location.search.includes('demo=true')) {
                window.tiltCheckNotifications.simulateEvents();
            }
            
            console.log('🎯 TiltCheck AIM Notifications ready!');
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkAIMReady);
    }, 10000);
});

// Export for global access
window.TiltCheckAIMNotifications = TiltCheckAIMNotifications;

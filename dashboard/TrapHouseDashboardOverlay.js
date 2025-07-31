const { app, BrowserWindow, ipcMain, screen, globalShortcut, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const MischiefManagerCollectClockIntegration = require('./MischiefManagerCollectClockIntegration');

/**
 * 🎯 TrapHouse Dashboard Overlay - Where Degens Become Legends �
 * 
 * Real Talk:
 * This ain't your mama's monitoring software. We get it - you're gonna degen anyway,
 * so why not do it with style? Think of this as your gambling wingman who actually
 * knows when to tell you to chill vs when to send it to the moon.
 * 
 * Features That Actually Matter:
 * - Always-on-top overlay that doesn't judge your life choices
 * - Resizable because we respect your screen real estate
 * - Transparency controls for when you need to hide your shame
 * - Smart notifications that roast you just enough to wake you up
 * - Instant messaging for coordinating with your fellow degenerates
 * - JustTheTip wallet integration because "just the tip" never stops there
 * - TrapHouse bot integration for when shit gets too real
 */
class TrapHouseDashboardOverlay {
    constructor() {
        this.mainWindow = null;
        this.overlayWindow = null;
        this.tray = null;
        this.isOverlayVisible = true;
        this.mischiefManager = new MischiefManagerCollectClockIntegration();
        
        // 🎯 Dashboard customization for actual degenerates
        this.overlaySettings = {
            size: { width: 340, height: 680 },
            transparency: 0.95, // Because stealth mode matters
            position: { x: null, y: null }, // Auto-calculate like a boss
            resizable: true,
            notifications: {
                enabled: true,
                roastLevel: 'medium', // light, medium, savage
                popups: true,
                sounds: false, // Silent but deadly
                tiltDetection: true,
                antiTiltMode: 'witty' // witty, brutal, supportive
            },
            theme: {
                degenMode: true, // � Full degen aesthetic
                colors: {
                    primary: '#ff0066', // Hot pink for attention
                    secondary: '#00ff88', // Green for the money
                    danger: '#ff3333',  // Red for when you're fucked
                    warning: '#ffaa00', // Orange for "maybe chill"
                    success: '#00ff00'  // Green for rare wins
                },
                style: 'cyberpunk' // cyberpunk, neon, matrix, classic
            },
            encryption: {
                enabled: true,
                level: 'paranoid', // basic, secure, paranoid
                keyRotation: 'weekly',
                dataObfuscation: true
            }
        };
        this.dashboardData = {
            user: { trustLevel: 'Recovering Degen �', username: 'User' },
            tiltCheck: {
                currentRisk: 'low',
                sessionTime: 45,
                todayLosses: 23.50,
                limits: { daily: 100 },
                roastMessages: [
                    "Bro... maybe touch some grass? 🌱",
                    "Your ancestors didn't survive famines for this 💀",
                    "Even WSB would tell you to slow down",
                    "Sir, this is a Wendy's... oh wait, wrong app",
                    "Your future self is crying rn ngl",
                    "Tilt level: Italian mother discovering your browser history"
                ],
                antiTiltStrategies: [
                    "Go get a snack and contemplate your life choices",
                    "Take a cold shower (seriously)",
                    "Call your mom, she misses you",
                    "Do 20 pushups and remember you have a body",
                    "Look at your bank account... yeah, that should do it"
                ]
            },
            wallet: {
                balance: 156.73,
                todayTips: 3,
                todayTipAmount: 15.50,
                smartSpending: {
                    enabled: true,
                    pauseBeforeYolo: 10, // seconds to think about your life
                    interventionThreshold: 50, // Dollar amount that triggers "are you sure?"
                    lastMinuteClarity: true // That moment of "wait, what am I doing?"
                },
                historicalFuckUps: [
                    { amount: 500, reason: "Thought I was Neo", date: "2024-01-15" },
                    { amount: 200, reason: "Revenge trading like an idiot", date: "2024-02-03" },
                    { amount: 75, reason: "Drunk at 3AM", date: "2024-02-28" }
                ]
            },
            verification: {
                score: 92,
                verified: true,
                journey: "Level 3: Not Completely Hopeless 🎯",
                credStreet: "Known for paying debts and not being a complete tool"
            },
            notifications: [
                { 
                    title: '🎯 Reality Check', 
                    message: 'You stopped yourself before that last YOLO - character development!', 
                    severity: 'success',
                    roastLevel: 'light'
                },
                { 
                    title: '🤝 Degen Network', 
                    message: '@DegenMike shared how he lost his car keys AND his car', 
                    severity: 'info',
                    roastLevel: 'medium'
                },
                { 
                    title: '⚔️ Battle Request', 
                    message: '@TiltMaster wants to see who can lose money faster!', 
                    severity: 'warning',
                    roastLevel: 'light'
                }
            ],
            // Enhanced features for professional degenerates
            cardGame: {
                skillPoints: 247, // Earned through not being terrible
                activeBattles: 2,
                recentWins: 5,
                availableBattles: 3,
                degenJourney: {
                    lessonsLearned: 12,
                    patternsRecognized: 8,
                    rageMoments: 23, // Times you wanted to throw your device
                    comebacks: 7     // Epic recovery stories
                },
                pendingChallenges: [
                    { from: '@TiltKing', type: 'Ego Death Match', stakes: '50 skill points', tone: 'savage' },
                    { from: '@RiskMaster', type: 'Bankroll Destroyer', stakes: '100 SP + street cred', tone: 'ruthless' }
                ],
                multiplayerStats: {
                    totalBattles: 47,
                    winRate: 68,
                    favoriteVictims: ['@TiltKing', '@RiskMaster', '@DegenSlayer'],
                    nemesis: '@UnbeatableBot', // That one player who always wins
                    hall_of_shame: 15 // Times you got completely rekt
                },
                currentMeta: {
                    popularStrategy: 'Calculated Chaos',
                    counterStrategy: 'Pure Spite',
                    communityMood: 'Aggressively Optimistic'
                }
            },
            collectClock: {
                verificationLevel: 'Step 3 - Growing Together 💜',
                connectedPlatforms: ['discord', 'justthetip', 'stake_api'],
                nextUpgrade: 'Community Wisdom (Share experiences to help others)',
                hangarAccess: ['supportive_hangars', 'learning_circles'],
                cardGamePermissions: ['educational_tournaments', 'peer_mentoring', 'story_sharing']
            },
            loanFront: {
                approvedLoans: [
                    { id: 'LF001', amount: 250, rate: 0.12, status: 'active', verifiedBy: 'community_love', purpose: 'learning_opportunity' },
                    { id: 'LF002', amount: 100, rate: 0.15, status: 'paid', verifiedBy: 'peer_support', growthStory: 'Used responsibly, paid back early' }
                ],
                pendingApplications: 1,
                vouchingRequests: [
                    { from: '@NewJourney', amount: 150, incentive: '$5 + good karma', story: 'Starting their mindful gambling journey' }
                ],
                eligibilityScore: 85,
                communityTrust: 'High - Known for helping others 💜'
            },
            hangars: {
                activeHangars: [
                    { name: 'Mindful Degens Circle 💜', type: 'supportive', members: 47, activeBattles: 3, vibe: 'compassionate' },
                    { name: 'Growth & Learning Club', type: 'educational', members: 12, activeBattles: 1, vibe: 'encouraging' }
                ],
                invitations: [
                    { hangar: 'Wisdom Seekers Arena 💜', from: '@MentorMaster', expires: '2 hours', message: 'Come share your journey!' }
                ],
                ownedHangars: 0
            },
            revenueEmpire: {
                totalEarnings: 587.25,
                activeLoans: 5,
                nextFundingThreshold: 50,
                vouchingEarnings: 45.00,
                hangarRevenue: 23.50,
                karmaPoints: 156, // Earned through helping others
                givingBack: 89.50 // Amount given to support others
            },
            portal: {
                securityLevel: 'HEART 💜',
                connectedPlatforms: ['discord', 'justthetip', 'custom'],
                customPatterns: 5,
                stakeApiStatus: 'connected',
                compassionateAI: {
                    enabled: true,
                    understandingLevel: 'high',
                    interventionStyle: 'educational'
                }
            },
            instantMessaging: {
                enabled: true,
                supportNetwork: [
                    { name: '@WisdomSeeker', status: 'online', relationship: 'mentor' },
                    { name: '@MindfulMaster', status: 'online', relationship: 'peer' },
                    { name: '@GrowthGuru', status: 'away', relationship: 'friend' }
                ],
                recentMessages: [
                    { from: '@WisdomSeeker', message: 'How was your session today? 💜', time: '5m ago' },
                    { from: '@MindfulMaster', message: 'Great job on that mindful pause!', time: '15m ago' }
                ],
                groupChats: [
                    { name: 'Daily Check-ins 💜', members: 8, lastMessage: 'Remember, progress not perfection!' },
                    { name: 'Learning Together', members: 15, lastMessage: 'Anyone want to share a pattern they noticed?' }
                ]
            },
            lastUpdated: new Date().toISOString()
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        await app.whenReady();
        
        // 💜 Load saved settings with love
        this.loadOverlaySettings();
        
        this.createSystemTray();
        this.createMainWindow();
        this.createOverlayWindow();
        this.setupGlobalShortcuts();
        this.setupIPCHandlers();
        this.startDataPolling();
        
        app.on('window-all-closed', () => {
            // Keep running in system tray with love 💜
        });

        app.on('activate', () => {
            if (this.mainWindow === null) {
                this.createMainWindow();
            }
        });

        // 💜 Show welcome notification
        setTimeout(() => {
            this.showCompassionateNotification({
                title: '💜 Welcome Back!',
                message: 'Your mindful gambling companion is here to support your journey.',
                tone: 'welcoming'
            });
        }, 2000);
    }

    createSystemTray() {
        const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
        
        let trayIcon;
        if (fs.existsSync(iconPath)) {
            trayIcon = nativeImage.createFromPath(iconPath);
        } else {
            trayIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        }

        this.tray = new Tray(trayIcon);
        this.tray.setToolTip('TrapHouse Dashboard - Degeneracy vs Decency');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show Overlay',
                type: 'checkbox',
                checked: this.isOverlayVisible,
                click: () => this.toggleOverlay()
            },
            {
                label: 'Show Dashboard',
                click: () => this.showMainWindow()
            },
            { type: 'separator' },
            {
                label: '⚔️ Start Card Battle',
                click: () => this.triggerCardBattle()
            },
            {
                label: '🎯 Challenge Player',
                click: () => this.showPlayerChallenge()
            },
            {
                label: '🏢 Join Hangar Battle',
                click: () => this.showHangarList()
            },
            { type: 'separator' },
            {
                label: '💰 Revenue Empire',
                click: () => this.showQuickPanel('revenue')
            },
            {
                label: '💎 Loan Front Status',
                click: () => this.showQuickPanel('loanfront')
            },
            {
                label: '🔐 CollectClock Verification',
                click: () => this.showQuickPanel('collectclock')
            },
            {
                label: '🌐 Portal Status',
                click: () => this.showQuickPanel('portal')
            },
            { type: 'separator' },
            {
                label: 'TiltCheck Quick View',
                click: () => this.showQuickPanel('tiltcheck')
            },
            {
                label: 'Wallet Balance',
                click: () => this.showQuickPanel('wallet')
            },
            { type: 'separator' },
            {
                label: 'Settings',
                click: () => this.showSettings()
            },
            {
                label: 'Exit',
                click: () => app.quit()
            }
        ]);

        this.tray.setContextMenu(contextMenu);
        this.tray.on('click', () => {
            this.toggleOverlay();
        });
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
            icon: path.join(__dirname, 'assets', 'icon.png'),
            title: 'TrapHouse Dashboard - Revenue Empire'
        });

        this.mainWindow.loadFile(path.join(__dirname, 'main-dashboard.html')).catch(() => {
            this.mainWindow.loadURL('data:text/html,<h1>TrapHouse Revenue Empire Dashboard</h1><p>Full dashboard interface with card game, loan management, and portal controls coming soon...</p>');
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.on('minimize', () => {
            this.mainWindow.hide();
        });
    }

    createOverlayWindow() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        // 💜 Calculate position with love (right side, centered vertically)
        const overlayWidth = this.overlaySettings.size.width;
        const overlayHeight = this.overlaySettings.size.height;
        const xPos = this.overlaySettings.position.x || (width - overlayWidth - 20);
        const yPos = this.overlaySettings.position.y || ((height - overlayHeight) / 2);

        this.overlayWindow = new BrowserWindow({
            width: overlayWidth,
            height: overlayHeight,
            x: xPos,
            y: yPos,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: this.overlaySettings.resizable, // 💜 Allow resizing with love
            transparent: true,
            opacity: this.overlaySettings.transparency, // 💜 Adjustable transparency
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
            type: process.platform === 'darwin' ? 'panel' : 'toolbar',
            titleBarStyle: 'hidden',
            movable: true, // 💜 Allow moving the overlay
            minimizable: true,
            maximizable: false,
            closable: true
        });

        // 💜 Enable window controls with love
        this.overlayWindow.setIgnoreMouseEvents(false);
        this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

        // 💜 Handle window events with compassion
        this.overlayWindow.on('closed', () => {
            this.overlayWindow = null;
            this.isOverlayVisible = false;
        });

        this.overlayWindow.on('resize', () => {
            const bounds = this.overlayWindow.getBounds();
            this.overlaySettings.size.width = bounds.width;
            this.overlaySettings.size.height = bounds.height;
            this.saveOverlaySettings(); // 💜 Remember user preferences
        });

        this.overlayWindow.on('move', () => {
            const bounds = this.overlayWindow.getBounds();
            this.overlaySettings.position.x = bounds.x;
            this.overlaySettings.position.y = bounds.y;
            this.saveOverlaySettings(); // 💜 Remember position with love
        });

        this.overlayWindow.loadFile(path.join(__dirname, 'overlay-love.html'));

        this.overlayWindow.webContents.once('did-finish-load', () => {
            this.sendDataToOverlay();
            this.sendOverlaySettings(); // 💜 Share settings with overlay
        });
    }

    setupGlobalShortcuts() {
        globalShortcut.register('CommandOrControl+Shift+T', () => {
            this.toggleOverlay();
        });

        globalShortcut.register('CommandOrControl+Shift+D', () => {
            this.showMainWindow();
        });

        globalShortcut.register('CommandOrControl+Shift+B', () => {
            this.triggerCardBattle();
        });

        globalShortcut.register('CommandOrControl+Shift+R', () => {
            this.showQuickPanel('revenue');
        });

        globalShortcut.register('CommandOrControl+Shift+P', () => {
            this.showQuickPanel('portal');
        });

        globalShortcut.register('CommandOrControl+Shift+L', () => {
            this.showQuickPanel('loanfront');
        });

        globalShortcut.register('CommandOrControl+Shift+H', () => {
            this.showHangarList();
        });

        globalShortcut.register('CommandOrControl+Shift+C', () => {
            this.showPlayerChallenge();
        });

        globalShortcut.register('CommandOrControl+Shift+V', () => {
            this.showQuickPanel('collectclock');
        });
    }

    setupIPCHandlers() {
        ipcMain.handle('toggle-overlay-visibility', () => {
            this.toggleOverlay();
        });

        ipcMain.handle('toggle-overlay-interaction', (event, enabled) => {
            if (this.overlayWindow) {
                this.overlayWindow.setIgnoreMouseEvents(!enabled);
                return enabled;
            }
            return false;
        });

        ipcMain.handle('send-tip', async (event, tipData) => {
            try {
                console.log('Sending tip:', tipData);
                
                this.dashboardData.wallet.balance -= tipData.amount;
                this.dashboardData.wallet.todayTips += 1;
                this.dashboardData.wallet.todayTipAmount += tipData.amount;
                
                // Award respect points for tipping
                this.dashboardData.cardGame.respectPoints += 5;
                
                this.dashboardData.notifications.unshift({
                    title: 'Tip Sent + Respect Earned',
                    message: `Sent $${tipData.amount} to ${tipData.toUser} (+5 Respect)`,
                    severity: 'success'
                });

                this.sendDataToOverlay();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        // New IPC handlers for enhanced features
        ipcMain.handle('trigger-card-battle', () => {
            this.triggerCardBattle();
        });

        ipcMain.handle('resolve-card-battle', (event, battleResult) => {
            this.resolveCardBattle(battleResult);
        });

        ipcMain.handle('check-funding-eligibility', () => {
            return this.checkFundingEligibility();
        });

        ipcMain.handle('apply-for-loan', (event, loanData) => {
            return this.processLoanApplication(loanData);
        });

        // New IPC handlers for integrated features
        ipcMain.handle('challenge-player', async (event, challengeData) => {
            return await this.mischiefManager.sendPlayerChallenge(challengeData);
        });

        ipcMain.handle('accept-challenge', async (event, challengeId) => {
            return await this.mischiefManager.acceptChallenge(challengeId);
        });

        ipcMain.handle('join-hangar', async (event, hangarId) => {
            return await this.mischiefManager.joinHangar(event.sender.userId, hangarId);
        });

        ipcMain.handle('apply-loan-front', async (event, applicationData) => {
            return await this.mischiefManager.applyForLoanFront(applicationData);
        });

        ipcMain.handle('vouch-for-user', async (event, vouchData) => {
            return await this.mischiefManager.provideVouching(vouchData);
        });

        ipcMain.handle('upgrade-verification', async (event, upgradeData) => {
            return await this.mischiefManager.upgradeVerification(upgradeData);
        });

        ipcMain.handle('start-hangar-battle', async (event, battleConfig) => {
            return await this.mischiefManager.startHangarBattle(battleConfig);
        });

        // 💜 Love-driven overlay customization handlers
        ipcMain.handle('resize-overlay', (event, dimensions) => {
            if (this.overlayWindow) {
                this.overlayWindow.setSize(dimensions.width, dimensions.height);
                this.overlaySettings.size = dimensions;
                this.saveOverlaySettings();
                return { success: true, message: 'Overlay resized with love 💜' };
            }
            return { success: false };
        });

        ipcMain.handle('adjust-transparency', (event, opacity) => {
            if (this.overlayWindow && opacity >= 0.1 && opacity <= 1.0) {
                this.overlayWindow.setOpacity(opacity);
                this.overlaySettings.transparency = opacity;
                this.saveOverlaySettings();
                return { success: true, message: `Transparency set to ${Math.round(opacity * 100)}% 💜` };
            }
            return { success: false };
        });

        ipcMain.handle('toggle-notifications', (event, enabled) => {
            this.overlaySettings.notifications.enabled = enabled;
            this.saveOverlaySettings();
            return { success: true, message: `Notifications ${enabled ? 'enabled' : 'disabled'} with love 💜` };
        });

        ipcMain.handle('toggle-popups', (event, enabled) => {
            this.overlaySettings.notifications.popups = enabled;
            this.saveOverlaySettings();
            return { success: true, message: `Pop-ups ${enabled ? 'enabled' : 'disabled'} 💜` };
        });

        ipcMain.handle('send-instant-message', async (event, messageData) => {
            // 💜 Send compassionate instant message
            const message = {
                to: messageData.recipient,
                from: messageData.sender || 'You',
                content: messageData.message,
                timestamp: Date.now(),
                tone: messageData.tone || 'supportive',
                type: messageData.type || 'peer_support'
            };

            // Add to instant messaging history
            this.dashboardData.instantMessaging.recentMessages.unshift(message);
            this.dashboardData.instantMessaging.recentMessages = 
                this.dashboardData.instantMessaging.recentMessages.slice(0, 10);

            this.sendDataToOverlay();
            return { success: true, message: 'Message sent with love 💜' };
        });

        ipcMain.handle('resync-data', async (event) => {
            await this.forceDataResync();
            return { success: true, message: 'Data resynced with love 💜' };
        });

        ipcMain.handle('get-overlay-settings', () => {
            return this.overlaySettings;
        });

        ipcMain.handle('update-overlay-settings', (event, newSettings) => {
            Object.assign(this.overlaySettings, newSettings);
            this.saveOverlaySettings();
            return { success: true, message: 'Settings updated with love 💜' };
        });

        ipcMain.on('show-main-window', () => {
            this.showMainWindow();
        });
    }

    startDataPolling() {
        setInterval(() => {
            this.updateDashboardData();
        }, 30000);

        setInterval(() => {
            this.updateCriticalData();
        }, 5000);
    }

    updateDashboardData() {
        this.dashboardData.tiltCheck.sessionTime += 1;
        
        if (Math.random() > 0.7) {
            const change = (Math.random() - 0.5) * 10;
            this.dashboardData.wallet.balance += change;
        }

        // Simulate multiplayer card game activity
        if (Math.random() > 0.85) {
            const challengeTypes = ['Quick Duel', 'Hangar Battle', 'Tournament Entry'];
            const players = ['@DegenSlayer', '@CardMaster', '@WisdomSeeker', '@ProGamer'];
            
            this.dashboardData.cardGame.pendingChallenges.push({
                from: players[Math.floor(Math.random() * players.length)],
                type: challengeTypes[Math.floor(Math.random() * challengeTypes.length)],
                stakes: `${Math.floor(Math.random() * 100 + 20)} respect`,
                timestamp: Date.now()
            });
            
            // Limit to 3 pending challenges
            this.dashboardData.cardGame.pendingChallenges = 
                this.dashboardData.cardGame.pendingChallenges.slice(-3);
        }

        // Simulate loan front activity
        if (Math.random() > 0.9) {
            const earnings = Math.random() * 10;
            this.dashboardData.revenueEmpire.vouchingEarnings += earnings;
            this.dashboardData.revenueEmpire.totalEarnings += earnings;
        }

        // Simulate hangar invitations
        if (Math.random() > 0.95) {
            this.dashboardData.hangars.invitations.push({
                hangar: 'New Battle Arena',
                from: '@HangarMaster',
                expires: '2 hours',
                timestamp: Date.now()
            });
            
            // Limit to 2 invitations
            this.dashboardData.hangars.invitations = 
                this.dashboardData.hangars.invitations.slice(-2);
        }

        // Check for card battle triggers
        if (this.dashboardData.tiltCheck.currentRisk === 'high' && Math.random() > 0.6) {
            this.dashboardData.cardGame.availableBattles = Math.max(1, this.dashboardData.cardGame.availableBattles);
        }

        this.dashboardData.lastUpdated = new Date().toISOString();
        this.sendDataToOverlay();
    }

    updateCriticalData() {
        const currentTime = this.dashboardData.tiltCheck.sessionTime;
        
        if (currentTime > 120) {
            this.dashboardData.tiltCheck.currentRisk = 'high';
        } else if (currentTime > 60) {
            this.dashboardData.tiltCheck.currentRisk = 'medium';
        } else {
            this.dashboardData.tiltCheck.currentRisk = 'low';
        }

        if (this.dashboardData.tiltCheck.currentRisk === 'high') {
            const hasWarning = this.dashboardData.notifications.some(n => 
                n.title === 'High Risk - Battle Available');
            
            if (!hasWarning) {
                this.dashboardData.notifications.unshift({
                    title: 'High Risk - Battle Available',
                    message: 'Tilt detected! Fight the degeneracy with a card battle.',
                    severity: 'danger'
                });
                this.dashboardData.cardGame.availableBattles += 1;
            }
        }

        // Check for new challenges and add notifications
        const newChallenges = this.dashboardData.cardGame.pendingChallenges.filter(
            challenge => Date.now() - challenge.timestamp < 60000 // New in last minute
        );
        
        newChallenges.forEach(challenge => {
            const hasNotification = this.dashboardData.notifications.some(n => 
                n.message.includes(challenge.from));
            
            if (!hasNotification) {
                this.dashboardData.notifications.unshift({
                    title: '⚔️ Battle Challenge!',
                    message: `${challenge.from} challenges you to ${challenge.type}`,
                    severity: 'warning'
                });
            }
        });

        // Check for loan front updates
        if (this.dashboardData.loanFront.pendingApplications > 0 && Math.random() > 0.7) {
            this.dashboardData.notifications.unshift({
                title: '💎 Loan Front Update',
                message: 'TrapHouse bot is verifying your payment...',
                severity: 'info'
            });
        }

        // Check for vouching requests
        if (this.dashboardData.loanFront.vouchingRequests.length > 0 && Math.random() > 0.8) {
            const request = this.dashboardData.loanFront.vouchingRequests[0];
            this.dashboardData.notifications.unshift({
                title: '🤝 Vouching Request',
                message: `${request.from} needs vouching for $${request.amount} loan`,
                severity: 'info'
            });
        }

        this.dashboardData.notifications = this.dashboardData.notifications.slice(0, 5);
    }

    triggerCardBattle() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('trigger-card-battle');
            this.isOverlayVisible = true;
        }
    }

    resolveCardBattle(battleResult) {
        if (battleResult.winner === 'decency') {
            this.dashboardData.cardGame.respectPoints += battleResult.respectChange;
            this.dashboardData.cardGame.recentWins += 1;
            this.dashboardData.tiltCheck.currentRisk = 'low'; // Battle success reduces tilt
        } else {
            this.dashboardData.cardGame.respectPoints = Math.max(0, this.dashboardData.cardGame.respectPoints + battleResult.respectChange);
        }
        
        this.dashboardData.cardGame.availableBattles = Math.max(0, this.dashboardData.cardGame.availableBattles - 1);
        this.sendDataToOverlay();
    }

    checkFundingEligibility() {
        const balance = this.dashboardData.wallet.balance;
        const respectPoints = this.dashboardData.cardGame.respectPoints;
        
        const eligibility = [];
        
        if (balance >= 100 && respectPoints >= 50) {
            eligibility.push({ tier: 'Starter', amount: 25, rate: 0.15, term: '1 week' });
        }
        if (balance >= 500 && respectPoints >= 150) {
            eligibility.push({ tier: 'Bronze', amount: 100, rate: 0.12, term: '2 weeks' });
        }
        if (balance >= 1000 && respectPoints >= 300) {
            eligibility.push({ tier: 'Silver', amount: 250, rate: 0.10, term: '1 month' });
        }
        if (balance >= 5000 && respectPoints >= 500) {
            eligibility.push({ tier: 'Gold', amount: 1000, rate: 0.08, term: '3 months' });
        }
        
        return eligibility;
    }

    processLoanApplication(loanData) {
        // Simulate loan processing
        this.dashboardData.revenueEmpire.activeLoans += 1;
        this.dashboardData.wallet.balance += loanData.amount;
        
        this.dashboardData.notifications.unshift({
            title: 'Loan Approved!',
            message: `$${loanData.amount} ${loanData.tier} loan funded`,
            severity: 'success'
        });
        
        this.sendDataToOverlay();
        return { success: true, loanId: Date.now() };
    }

    async showPlayerChallenge() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('show-player-challenge-modal');
            this.isOverlayVisible = true;
        }
    }

    async showHangarList() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('show-hangar-list-modal');
            this.isOverlayVisible = true;
        }
    }

    // 💜 Love-driven helper methods
    saveOverlaySettings() {
        try {
            const settingsPath = path.join(__dirname, 'overlay-settings.json');
            fs.writeFileSync(settingsPath, JSON.stringify(this.overlaySettings, null, 2));
        } catch (error) {
            console.error('💜 Error saving overlay settings with love:', error.message);
        }
    }

    loadOverlaySettings() {
        try {
            const settingsPath = path.join(__dirname, 'overlay-settings.json');
            if (fs.existsSync(settingsPath)) {
                const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                Object.assign(this.overlaySettings, savedSettings);
            }
        } catch (error) {
            console.error('💜 Error loading overlay settings, using defaults with love:', error.message);
        }
    }

    sendOverlaySettings() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.webContents.send('overlay-settings-update', this.overlaySettings);
        }
    }

    async forceDataResync() {
        // 💜 Force resync all data with love
        console.log('💜 Resyncing data with compassionate understanding...');
        
        // Update all dashboard data
        this.updateDashboardData();
        
        // Sync with mischief manager
        if (this.mischiefManager && this.mischiefManager.syncDataAcrossSystems) {
            await this.mischiefManager.syncDataAcrossSystems();
        }
        
        // Send updated data to overlay
        this.sendDataToOverlay();
        this.sendOverlaySettings();
        
        // Show compassionate notification
        this.showCompassionateNotification({
            title: '💜 Data Refreshed',
            message: 'Everything is up to date! Your journey continues.',
            tone: 'supportive'
        });
    }

    showCompassionateNotification(notification) {
        if (!this.overlaySettings.notifications.enabled) return;

        // Add compassionate tone to notification
        const compassionateNotification = {
            ...notification,
            severity: notification.severity || 'love',
            timestamp: Date.now(),
            compassionate: true
        };

        this.dashboardData.notifications.unshift(compassionateNotification);
        this.dashboardData.notifications = this.dashboardData.notifications.slice(0, 10);

        this.sendDataToOverlay();

        // Show popup if enabled
        if (this.overlaySettings.notifications.popups && this.overlayWindow) {
            this.overlayWindow.webContents.send('show-compassionate-popup', compassionateNotification);
        }
    }

    async showInstantMessageModal() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('show-instant-message-modal');
            this.isOverlayVisible = true;
        }
    }

    async showOverlayCustomization() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('show-overlay-customization-modal');
            this.isOverlayVisible = true;
        }
    }

    sendDataToOverlay() {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.webContents.send('overlay-data-update', this.dashboardData);
        }
    }

    toggleOverlay() {
        if (this.overlayWindow) {
            if (this.isOverlayVisible) {
                this.overlayWindow.hide();
            } else {
                this.overlayWindow.show();
            }
            this.isOverlayVisible = !this.isOverlayVisible;
        } else {
            this.createOverlayWindow();
            this.isOverlayVisible = true;
        }

        if (this.tray) {
            const menu = this.tray.getContextMenu();
            menu.items[0].checked = this.isOverlayVisible;
            this.tray.setContextMenu(menu);
        }
    }

    showMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        } else {
            this.createMainWindow();
        }
    }

    showQuickPanel(panelType) {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.show();
            this.overlayWindow.webContents.send('show-quick-panel', panelType);
            this.isOverlayVisible = true;
        }
    }

    showSettings() {
        const settingsWindow = new BrowserWindow({
            width: 600,
            height: 400,
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        settingsWindow.loadURL('data:text/html,<h1>Enhanced Settings</h1><p>Card game preferences, tilt patterns, revenue empire configuration coming soon...</p>');
    }
}

// Initialize the enhanced application
let dashboardApp;

const initializeApp = async () => {
    dashboardApp = new TrapHouseDashboardOverlay();
};

// Start when Electron is ready
if (app && app.whenReady) {
    app.whenReady().then(() => {
        initializeApp();
    });

    app.on('before-quit', () => {
        if (globalShortcut && globalShortcut.unregisterAll) {
            globalShortcut.unregisterAll();
        }
    });
} else {
    // Fallback for direct execution
    setTimeout(initializeApp, 1000);
}

module.exports = TrapHouseDashboardOverlay;

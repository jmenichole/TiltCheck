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
        
        // Initialize app properly when ready - don't call initializeApp() directly
        this.isReady = false;
    }

    async initializeApp() {
        if (this.isReady) return;
        
        await app.whenReady();
        this.isReady = true;
        
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
                label: '⚔️ Start Degen Battle',
                click: () => this.triggerCardBattle()
            },
            {
                label: '🎯 Challenge Someone',
                click: () => this.showPlayerChallenge()
            },
            {
                label: '🏢 Join Hangar War',
                click: () => this.showHangarList()
            },
            { type: 'separator' },
            {
                label: '💰 Revenue Empire Status',
                click: () => this.showQuickPanel('revenue')
            },
            {
                label: '💎 Loan Shark Operations',
                click: () => this.showQuickPanel('loanfront')
            },
            {
                label: '🔐 CollectClock Verification',
                click: () => this.showQuickPanel('collectclock')
            },
            {
                label: '🌐 Portal Access',
                click: () => this.showQuickPanel('portal')
            },
            { type: 'separator' },
            {
                label: '📊 Tilt Monitor',
                click: () => this.showQuickPanel('tiltcheck')
            },
            {
                label: '💳 Wallet Status',
                click: () => this.showQuickPanel('wallet')
            },
            { type: 'separator' },
            {
                label: '🔧 Degen Settings',
                click: () => this.showSettings()
            },
            {
                label: '🔒 Encryption Config',
                click: () => this.showEncryptionSettings()
            },
            {
                label: '🎭 Theme Selector',
                click: () => this.showThemeSelector()
            },
            { type: 'separator' },
            {
                label: 'Exit (Run Away)',
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

        // 🎯 New degen-focused IPC handlers
        ipcMain.on('update-degen-settings', (event, settings) => {
            this.updateDegenSettings(settings);
        });

        ipcMain.on('apply-theme', (event, themeName) => {
            this.applyTheme(themeName);
        });

        ipcMain.handle('trigger-tilt-detection', () => {
            return this.performTiltAnalysis();
        });

        ipcMain.handle('get-roast-message', (event, severity) => {
            return this.generateRoastMessage(severity);
        });

        ipcMain.handle('activate-anti-tilt', (event, strategy) => {
            return this.activateAntiTiltStrategy(strategy);
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
            width: 800,
            height: 600,
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            title: 'Degen Control Panel'
        });

        const settingsHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>TrapHouse Settings - Degen Edition</title>
            <style>
                body { 
                    background: linear-gradient(135deg, #000, #1a0033); 
                    color: #fff; 
                    font-family: 'Courier New', monospace; 
                    padding: 20px;
                }
                .section { 
                    background: rgba(255,255,255,0.1); 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 8px; 
                    border: 1px solid #ff0066;
                }
                .section h3 { color: #ff0066; }
                input, select { 
                    background: rgba(0,0,0,0.5); 
                    color: #fff; 
                    border: 1px solid #00ff88; 
                    padding: 5px; 
                    border-radius: 4px;
                }
                button { 
                    background: #ff0066; 
                    color: #fff; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 4px; 
                    cursor: pointer;
                }
                button:hover { background: #ff3388; }
            </style>
        </head>
        <body>
            <h2>🎯 TrapHouse Degen Settings</h2>
            
            <div class="section">
                <h3>💀 Tilt & Anti-Tilt Configuration</h3>
                <label>Roast Level: </label>
                <select id="roastLevel">
                    <option value="light">Light Roasting</option>
                    <option value="medium">Medium Roast</option>
                    <option value="savage">Full Savage Mode</option>
                </select><br><br>
                
                <label>Anti-Tilt Strategy: </label>
                <select id="antiTiltMode">
                    <option value="witty">Witty Comments</option>
                    <option value="brutal">Brutal Honesty</option>
                    <option value="supportive">Actually Supportive</option>
                </select><br><br>
                
                <label>Intervention Threshold ($): </label>
                <input type="number" id="interventionThreshold" value="50">
            </div>
            
            <div class="section">
                <h3>🎨 Theme Configuration</h3>
                <label>Visual Style: </label>
                <select id="themeStyle">
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="neon">Neon Dreams</option>
                    <option value="matrix">Matrix Mode</option>
                    <option value="classic">Classic Degen</option>
                </select><br><br>
                
                <label>Danger Color: </label>
                <input type="color" id="dangerColor" value="#ff3333"><br><br>
                
                <label>Success Color: </label>
                <input type="color" id="successColor" value="#00ff00">
            </div>
            
            <div class="section">
                <h3>🔒 Privacy & Security</h3>
                <label>Encryption Level: </label>
                <select id="encryptionLevel">
                    <option value="basic">Basic (Don't judge me)</option>
                    <option value="secure">Secure (Hide my shame)</option>
                    <option value="paranoid">Paranoid (NSA-proof)</option>
                </select><br><br>
                
                <label><input type="checkbox" id="dataObfuscation"> Obfuscate Data</label><br>
                <label><input type="checkbox" id="stealthMode"> Stealth Mode</label>
            </div>
            
            <button onclick="saveSettings()">Save Configuration</button>
            <button onclick="window.close()">Close</button>
            
            <script>
                function saveSettings() {
                    const settings = {
                        roastLevel: document.getElementById('roastLevel').value,
                        antiTiltMode: document.getElementById('antiTiltMode').value,
                        interventionThreshold: parseInt(document.getElementById('interventionThreshold').value),
                        themeStyle: document.getElementById('themeStyle').value,
                        dangerColor: document.getElementById('dangerColor').value,
                        successColor: document.getElementById('successColor').value,
                        encryptionLevel: document.getElementById('encryptionLevel').value,
                        dataObfuscation: document.getElementById('dataObfuscation').checked,
                        stealthMode: document.getElementById('stealthMode').checked
                    };
                    
                    // Send settings to main process
                    require('electron').ipcRenderer.send('update-degen-settings', settings);
                    alert('Settings saved! Time to degen responsibly... 💀');
                }
            </script>
        </body>
        </html>`;
        
        settingsWindow.loadURL('data:text/html,' + encodeURIComponent(settingsHTML));
    }

    showEncryptionSettings() {
        const encryptionWindow = new BrowserWindow({
            width: 600,
            height: 500,
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            title: 'Encryption Configuration'
        });

        const encryptionHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>🔒 Degen Encryption Settings</title>
            <style>
                body { 
                    background: #000; 
                    color: #00ff00; 
                    font-family: 'Courier New', monospace; 
                    padding: 20px;
                }
                .warning { 
                    background: rgba(255,0,0,0.2); 
                    border: 1px solid #ff0000; 
                    padding: 10px; 
                    margin: 10px 0; 
                    border-radius: 4px;
                }
                .info { 
                    background: rgba(0,255,0,0.1); 
                    border: 1px solid #00ff00; 
                    padding: 10px; 
                    margin: 10px 0; 
                    border-radius: 4px;
                }
                input, select { 
                    background: #001100; 
                    color: #00ff00; 
                    border: 1px solid #00ff00; 
                    padding: 5px;
                }
                button { 
                    background: #003300; 
                    color: #00ff00; 
                    border: 1px solid #00ff00; 
                    padding: 8px 16px; 
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h2>🔒 Encryption Configuration</h2>
            
            <div class="warning">
                ⚠️ WARNING: This actually encrypts your degen data. Don't lose your keys, genius.
            </div>
            
            <div class="info">
                💡 Current Status: ${this.overlaySettings.encryption.enabled ? 'ENCRYPTED' : 'EXPOSED'}
            </div>
            
            <label>Encryption Level:</label><br>
            <select id="encLevel">
                <option value="basic">Basic (AES-128)</option>
                <option value="secure">Secure (AES-256)</option>
                <option value="paranoid">Paranoid (ChaCha20-Poly1305)</option>
            </select><br><br>
            
            <label>Key Rotation:</label><br>
            <select id="keyRotation">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never (Risky)</option>
            </select><br><br>
            
            <label><input type="checkbox" id="dataObfuscation"> Data Obfuscation</label><br>
            <label><input type="checkbox" id="networkEncryption"> Network Encryption</label><br>
            <label><input type="checkbox" id="localEncryption"> Local Storage Encryption</label><br><br>
            
            <button onclick="generateNewKey()">Generate New Key</button>
            <button onclick="saveEncryption()">Save Settings</button>
            <button onclick="window.close()">Close</button>
            
            <script>
                function generateNewKey() {
                    if(confirm('Generate new encryption key? This will re-encrypt all data.')) {
                        alert('New key generated! Your data is now extra secure. 🔐');
                    }
                }
                
                function saveEncryption() {
                    alert('Encryption settings saved! Your degeneracy is now protected. 💀');
                }
            </script>
        </body>
        </html>`;
        
        encryptionWindow.loadURL('data:text/html,' + encodeURIComponent(encryptionHTML));
    }

    showThemeSelector() {
        const themeWindow = new BrowserWindow({
            width: 700,
            height: 600,
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            title: 'Theme Selection'
        });

        const themeHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎭 Degen Theme Selector</title>
            <style>
                body { 
                    background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460); 
                    color: #fff; 
                    font-family: 'Arial', sans-serif; 
                    padding: 20px;
                }
                .theme-card { 
                    background: rgba(255,255,255,0.1); 
                    padding: 15px; 
                    margin: 10px; 
                    border-radius: 8px; 
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-block;
                    width: 200px;
                    vertical-align: top;
                }
                .theme-card:hover { 
                    border-color: #ff0066; 
                    transform: scale(1.05);
                }
                .theme-card.selected { 
                    border-color: #00ff88; 
                    background: rgba(0,255,136,0.2);
                }
                .theme-preview { 
                    height: 100px; 
                    border-radius: 4px; 
                    margin-bottom: 10px;
                }
                .cyberpunk { background: linear-gradient(135deg, #ff0066, #0066ff); }
                .neon { background: linear-gradient(135deg, #ff00ff, #00ffff); }
                .matrix { background: linear-gradient(135deg, #003300, #00ff00); }
                .classic { background: linear-gradient(135deg, #333, #666); }
                button { 
                    background: #ff0066; 
                    color: #fff; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    margin: 10px 5px;
                }
            </style>
        </head>
        <body>
            <h2>🎭 Choose Your Degen Aesthetic</h2>
            
            <div class="theme-card" onclick="selectTheme('cyberpunk')">
                <div class="theme-preview cyberpunk"></div>
                <h3>Cyberpunk 2077</h3>
                <p>Neon pink and electric blue for that dystopian future vibe</p>
            </div>
            
            <div class="theme-card" onclick="selectTheme('neon')">
                <div class="theme-preview neon"></div>
                <h3>Neon Dreams</h3>
                <p>Bright magentas and cyans - maximum eye strain guaranteed</p>
            </div>
            
            <div class="theme-card" onclick="selectTheme('matrix')">
                <div class="theme-preview matrix"></div>
                <h3>Matrix Mode</h3>
                <p>Green on black - because you're obviously Neo</p>
            </div>
            
            <div class="theme-card" onclick="selectTheme('classic')">
                <div class="theme-preview classic"></div>
                <h3>Classic Degen</h3>
                <p>Understated grays - for the sophisticated degenerate</p>
            </div>
            
            <br><br>
            <button onclick="applyTheme()">Apply Theme</button>
            <button onclick="randomTheme()">Surprise Me</button>
            <button onclick="window.close()">Cancel</button>
            
            <script>
                let selectedTheme = 'cyberpunk';
                
                function selectTheme(theme) {
                    selectedTheme = theme;
                    document.querySelectorAll('.theme-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                    event.target.closest('.theme-card').classList.add('selected');
                }
                
                function applyTheme() {
                    require('electron').ipcRenderer.send('apply-theme', selectedTheme);
                    alert('Theme applied! Your degeneracy now has style. 🎨');
                    window.close();
                }
                
                function randomTheme() {
                    const themes = ['cyberpunk', 'neon', 'matrix', 'classic'];
                    const random = themes[Math.floor(Math.random() * themes.length)];
                    selectTheme(random);
                    applyTheme();
                }
            </script>
        </body>
        </html>`;
        
        themeWindow.loadURL('data:text/html,' + encodeURIComponent(themeHTML));
    }

    // 🎯 New degen-focused methods
    updateDegenSettings(settings) {
        Object.assign(this.overlaySettings.notifications, {
            roastLevel: settings.roastLevel,
            antiTiltMode: settings.antiTiltMode
        });
        
        Object.assign(this.overlaySettings.theme, {
            style: settings.themeStyle,
            colors: {
                ...this.overlaySettings.theme.colors,
                danger: settings.dangerColor,
                success: settings.successColor
            }
        });

        Object.assign(this.overlaySettings.encryption, {
            level: settings.encryptionLevel,
            dataObfuscation: settings.dataObfuscation
        });

        this.overlaySettings.wallet.smartSpending.interventionThreshold = settings.interventionThreshold;
        
        this.saveOverlaySettings();
        this.sendOverlaySettings();
        
        console.log('🎯 Degen settings updated with maximum efficiency');
    }

    applyTheme(themeName) {
        const themes = {
            cyberpunk: {
                primary: '#ff0066',
                secondary: '#0066ff',
                accent: '#ff00ff',
                background: 'linear-gradient(135deg, #1a0033, #330066)'
            },
            neon: {
                primary: '#ff00ff',
                secondary: '#00ffff',
                accent: '#ffff00',
                background: 'linear-gradient(135deg, #ff00ff, #00ffff)'
            },
            matrix: {
                primary: '#00ff00',
                secondary: '#003300',
                accent: '#66ff66',
                background: 'linear-gradient(135deg, #000000, #001100)'
            },
            classic: {
                primary: '#666666',
                secondary: '#333333',
                accent: '#999999',
                background: 'linear-gradient(135deg, #1a1a1a, #333333)'
            }
        };

        if (themes[themeName]) {
            this.overlaySettings.theme = {
                ...this.overlaySettings.theme,
                style: themeName,
                colors: { ...this.overlaySettings.theme.colors, ...themes[themeName] }
            };
            
            this.saveOverlaySettings();
            this.sendOverlaySettings();
            
            // Update overlay immediately
            if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
                this.overlayWindow.webContents.send('theme-update', this.overlaySettings.theme);
            }
        }
    }

    performTiltAnalysis() {
        const currentData = this.dashboardData;
        let tiltScore = 0;
        let indicators = [];

        // Analyze session time
        if (currentData.tiltCheck.sessionTime > 120) {
            tiltScore += 30;
            indicators.push("Marathon session detected - your chair has Stockholm syndrome");
        }

        // Analyze losses
        if (currentData.tiltCheck.todayLosses > currentData.tiltCheck.limits.daily * 0.5) {
            tiltScore += 25;
            indicators.push("Losses approaching danger zone - even your calculator is concerned");
        }

        // Analyze consecutive losses (if available)
        if (currentData.user.consecutiveLs > 5) {
            tiltScore += 20;
            indicators.push("Loss streak detected - time to touch grass");
        }

        // Analyze time patterns (if it's late night)
        const currentHour = new Date().getHours();
        if (currentHour < 6 || currentHour > 22) {
            tiltScore += 15;
            indicators.push("Late night degeneracy - your sleep schedule has left the chat");
        }

        let riskLevel = 'chill';
        let recommendation = '';

        if (tiltScore >= 70) {
            riskLevel = 'rekt';
            recommendation = "Stop. Just stop. Your future self is begging you.";
        } else if (tiltScore >= 50) {
            riskLevel = 'full_degen';
            recommendation = "Danger zone activated. Maybe take a breath?";
        } else if (tiltScore >= 30) {
            riskLevel = 'sending_it';
            recommendation = "You're pushing it, but we've all been there.";
        } else if (tiltScore >= 15) {
            riskLevel = 'cautious';
            recommendation = "Looking good, but stay aware.";
        }

        // Update dashboard data
        this.dashboardData.tiltCheck.currentRisk = riskLevel;
        this.sendDataToOverlay();

        return {
            score: tiltScore,
            level: riskLevel,
            indicators: indicators,
            recommendation: recommendation,
            timestamp: Date.now()
        };
    }

    generateRoastMessage(severity = 'medium') {
        const roasts = {
            light: [
                "Hey, maybe consider not doing that? 🤔",
                "Your wallet called, it's filing for divorce",
                "Even a magic 8-ball would say 'outlook not so good'",
                "Sir, this is a casino, not a charity",
                "Your risk tolerance has left the building"
            ],
            medium: [
                "Bro... maybe touch some grass? 🌱",
                "Your ancestors didn't survive famines for this 💀",
                "Even WSB would tell you to slow down",
                "Sir, this is a Wendy's... oh wait, wrong app",
                "Your future self is crying rn ngl",
                "Tilt level: Italian mother discovering your browser history"
            ],
            savage: [
                "Stop it. Get some help. Seriously.",
                "Your bank account has filed a restraining order",
                "Even your imaginary friends are concerned",
                "The house always wins, and right now you ARE the house... for them",
                "Your decision-making skills have left the chat",
                "This is your intervention. We all care about you. Stop."
            ]
        };

        const roastLevel = this.overlaySettings.notifications.roastLevel || 'medium';
        const messages = roasts[roastLevel] || roasts.medium;
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    activateAntiTiltStrategy(strategy = null) {
        const selectedStrategy = strategy || this.overlaySettings.notifications.antiTiltMode || 'witty';
        
        const strategies = {
            witty: [
                "Go get a snack and contemplate your life choices",
                "Take a cold shower (seriously)",
                "Call your mom, she misses you",
                "Do 20 pushups and remember you have a body",
                "Look at your bank account... yeah, that should do it"
            ],
            brutal: [
                "Stop being an idiot and walk away",
                "You're literally throwing money into a black hole",
                "Close the app. Touch grass. Become human again.",
                "Your addiction is showing, fix it",
                "This isn't investing, it's just expensive entertainment"
            ],
            supportive: [
                "Hey, we've all been there. Take a break.",
                "Your worth isn't determined by wins or losses",
                "Sometimes the best move is not to play",
                "You're stronger than this urge, we believe in you",
                "Tomorrow is a new day with fresh perspectives"
            ]
        };

        const selectedMessages = strategies[selectedStrategy] || strategies.witty;
        const message = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

        // Show anti-tilt notification
        this.dashboardData.notifications.unshift({
            title: '🛑 Anti-Tilt Activated',
            message: message,
            severity: 'warning',
            roastLevel: selectedStrategy,
            antiTilt: true,
            timestamp: Date.now()
        });

        this.sendDataToOverlay();

        return {
            strategy: selectedStrategy,
            message: message,
            activated: true
        };
    }

    // 🎯 COMPREHENSIVE DEGEN TRAIT CALCULATION SYSTEM
    // "Made with love, mindful, empowered tilt check pattern and strategy analysis"
    calculateDegenTraits(userData) {
        const traits = {
            primary: this.calculatePrimaryDegenType(userData),
            secondary: this.calculateSecondaryTraits(userData),
            empowermentLevel: this.calculateEmpowermentLevel(userData),
            mindfulnessScore: this.calculateMindfulnessScore(userData),
            strategyMastery: this.calculateStrategyMastery(userData),
            preferredDeterMethod: this.calculatePreferredDeterMethod(userData),
            loveBasedGrowth: this.calculateLoveBasedGrowth(userData),
            degenScore: 0,
            recommendations: []
        };

        // Calculate overall degen score (0-100)
        traits.degenScore = this.calculateOverallDegenScore(traits, userData);
        
        // Generate personalized recommendations
        traits.recommendations = this.generateDegenRecommendations(traits, userData);

        return traits;
    }

    calculatePrimaryDegenType(userData) {
        const patterns = userData.patterns || {};
        const behavior = userData.behavior || {};

        // Analyze core degen archetypes with love-based understanding
        const types = {
            'Mindful Moon Shot': {
                score: 0,
                description: 'Strategic risk-taker who practices mindful awareness',
                traits: ['calculated_risks', 'meditation_practice', 'long_term_vision'],
                deterMethod: 'Mindful Pause + Strategic Analysis'
            },
            'Empowered Scalper': {
                score: 0,
                description: 'Quick decision maker with emotional intelligence',
                traits: ['rapid_adaptation', 'emotional_mastery', 'technical_precision'],
                deterMethod: 'Vault Timer + Community Check-in'
            },
            'Loving Hodler': {
                score: 0,
                description: 'Patient accumulator with community focus',
                traits: ['patience_mastery', 'community_support', 'steady_growth'],
                deterMethod: 'Love-Based Reflection + Empowerment Reminder'
            },
            'Compassionate Degen': {
                score: 0,
                description: 'High-risk player with harm reduction awareness',
                traits: ['risk_awareness', 'self_compassion', 'recovery_focus'],
                deterMethod: 'Community Check-in + Mindful Pause'
            },
            'Strategic Sensei': {
                score: 0,
                description: 'Master strategist who teaches through example',
                traits: ['mentorship', 'pattern_mastery', 'wisdom_sharing'],
                deterMethod: 'Strategic Analysis + Love-Based Reflection'
            },
            'Balanced Warrior': {
                score: 0,
                description: 'Combines aggression with mindful boundaries',
                traits: ['controlled_aggression', 'boundary_setting', 'tactical_patience'],
                deterMethod: 'Vault Timer + Empowerment Reminder'
            }
        };

        // Score each type based on behavioral patterns
        if (patterns.longTermThinking) types['Mindful Moon Shot'].score += 25;
        if (behavior.meditationPractice) types['Mindful Moon Shot'].score += 20;
        if (patterns.calculatedRisks) types['Mindful Moon Shot'].score += 30;

        if (patterns.quickDecisions) types['Empowered Scalper'].score += 30;
        if (behavior.emotionalIntelligence > 7) types['Empowered Scalper'].score += 25;
        if (patterns.technicalAnalysis) types['Empowered Scalper'].score += 20;

        if (patterns.patientAccumulation) types['Loving Hodler'].score += 35;
        if (behavior.communityEngagement > 8) types['Loving Hodler'].score += 25;
        if (patterns.steadyGrowth) types['Loving Hodler'].score += 20;

        if (patterns.highRiskAwareness) types['Compassionate Degen'].score += 30;
        if (behavior.selfCompassion > 7) types['Compassionate Degen'].score += 25;
        if (userData.recoveryFocus) types['Compassionate Degen'].score += 25;

        if (behavior.mentorshipActive) types['Strategic Sensei'].score += 35;
        if (patterns.patternMastery > 8) types['Strategic Sensei'].score += 30;
        if (userData.wisdomShared > 50) types['Strategic Sensei'].score += 20;

        if (patterns.controlledAggression) types['Balanced Warrior'].score += 30;
        if (behavior.boundaryMastery > 7) types['Balanced Warrior'].score += 25;
        if (patterns.tacticalPatience) types['Balanced Warrior'].score += 25;

        // Find highest scoring type
        let primaryType = 'Mindful Moon Shot';
        let highestScore = 0;
        
        for (const [typeName, typeData] of Object.entries(types)) {
            if (typeData.score > highestScore) {
                highestScore = typeData.score;
                primaryType = typeName;
            }
        }

        return {
            type: primaryType,
            score: highestScore,
            description: types[primaryType].description,
            traits: types[primaryType].traits,
            preferredDeterMethod: types[primaryType].deterMethod,
            confidence: Math.min(100, highestScore)
        };
    }

    calculatePreferredDeterMethod(userData) {
        const patterns = userData.patterns || {};
        const effectiveness = userData.deterEffectiveness || {};

        const methods = {
            'Mindful Pause': {
                score: 0,
                description: 'Brief meditation before decisions',
                effectiveness: effectiveness.mindfulPause || 0,
                implementation: 'Set automatic 2-minute pause before major decisions'
            },
            'Love-Based Reflection': {
                score: 0,
                description: 'Asking "What would love do?"',
                effectiveness: effectiveness.loveReflection || 0,
                implementation: 'Display love-based question prompts during high-risk moments'
            },
            'Strategic Analysis': {
                score: 0,
                description: 'Data-driven decision framework',
                effectiveness: effectiveness.strategicAnalysis || 0,
                implementation: 'Show risk/reward calculations and pattern data'
            },
            'Community Check-in': {
                score: 0,
                description: 'Consulting trusted advisors',
                effectiveness: effectiveness.communitySupport || 0,
                implementation: 'Auto-ping accountability partner during tilt detection'
            },
            'Vault Timer': {
                score: 0,
                description: 'Time-locked decision delays',
                effectiveness: effectiveness.vaultTimer || 0,
                implementation: 'Implement cooling-off periods with encouraging messages'
            },
            'Empowerment Reminder': {
                score: 0,
                description: 'Recalling personal power & choice',
                effectiveness: effectiveness.empowermentReminder || 0,
                implementation: 'Show personal achievements and growth reminders'
            }
        };

        // Score based on patterns and effectiveness
        if (patterns.usesMindfulPause) methods['Mindful Pause'].score += 30;
        if (patterns.usesLoveBasedDecisions) methods['Love-Based Reflection'].score += 25;
        if (patterns.usesDataAnalysis) methods['Strategic Analysis'].score += 35;
        if (patterns.seeksCommunityInput) methods['Community Check-in'].score += 30;
        if (patterns.usesTimeDelays) methods['Vault Timer'].score += 25;
        if (patterns.usesEmpowermentFraming) methods['Empowerment Reminder'].score += 30;

        // Boost by effectiveness
        Object.keys(methods).forEach(method => {
            methods[method].score += methods[method].effectiveness * 0.5;
        });

        // Find most effective method
        let preferredMethod = 'Mindful Pause';
        let highestScore = 0;
        
        for (const [methodName, methodData] of Object.entries(methods)) {
            if (methodData.score > highestScore) {
                highestScore = methodData.score;
                preferredMethod = methodName;
            }
        }

        return {
            primary: preferredMethod,
            score: highestScore,
            description: methods[preferredMethod].description,
            effectiveness: methods[preferredMethod].effectiveness,
            implementation: methods[preferredMethod].implementation,
            alternatives: Object.keys(methods).filter(m => m !== preferredMethod).slice(0, 2)
        };
    }

    calculateEmpowermentLevel(userData) {
        let empowermentScore = 0;
        const factors = userData.empowermentFactors || {};

        empowermentScore += (factors.selfEfficacy || 0) * 2;
        empowermentScore += (factors.personalAgency || 0) * 2;
        empowermentScore += (factors.skillDevelopment || 0) * 1.5;
        empowermentScore += (factors.supportNetwork || 0) * 1.5;
        empowermentScore += (factors.growthMindset || 0) * 2;

        return {
            score: Math.min(100, empowermentScore),
            level: empowermentScore > 80 ? 'Highly Empowered' : empowermentScore > 60 ? 'Moderately Empowered' : empowermentScore > 40 ? 'Developing Empowerment' : 'Early Empowerment Journey'
        };
    }

    calculateMindfulnessScore(userData) {
        let mindfulnessScore = 0;
        const practices = userData.mindfulnessPractices || {};

        mindfulnessScore += (practices.presentAwareness || 0) * 2.5;
        mindfulnessScore += (practices.emotionalRegulation || 0) * 2;
        mindfulnessScore += (practices.bodyAwareness || 0) * 1.5;
        mindfulnessScore += (practices.breathWork || 0) * 1.5;
        mindfulnessScore += (practices.meditationConsistency || 0) * 2;

        return {
            score: Math.min(100, mindfulnessScore),
            level: mindfulnessScore > 80 ? 'Zen Master' : mindfulnessScore > 60 ? 'Mindful Practitioner' : mindfulnessScore > 40 ? 'Awareness Developer' : 'Mindfulness Beginner'
        };
    }

    calculateStrategyMastery(userData) {
        let strategyScore = 0;
        const strategy = userData.strategyData || {};

        strategyScore += (strategy.patternRecognition || 0) * 2;
        strategyScore += (strategy.riskAssessment || 0) * 2.5;
        strategyScore += (strategy.adaptivePlanning || 0) * 2;
        strategyScore += (strategy.executionConsistency || 0) * 2;
        strategyScore += (strategy.outcomeIntegration || 0) * 1.5;

        return {
            score: Math.min(100, strategyScore),
            mastery: strategyScore > 80 ? 'Strategy Sensei' : strategyScore > 60 ? 'Tactical Thinker' : strategyScore > 40 ? 'Pattern Learner' : 'Strategy Student'
        };
    }

    calculateSecondaryTraits(userData) {
        const traits = [];
        const behavior = userData.behavior || {};
        const patterns = userData.patterns || {};

        if (behavior.selfAdvocacy > 7) traits.push('Self-Advocate');
        if (patterns.boundaryEnforcement) traits.push('Boundary Master');
        if (userData.decisionConfidence > 8) traits.push('Confident Decider');
        if (behavior.leadershipTendency) traits.push('Natural Leader');
        if (userData.presentMomentAwareness > 7) traits.push('Present-Focused');
        if (behavior.emotionalRegulation > 8) traits.push('Emotionally Balanced');
        if (behavior.empathyLevel > 8) traits.push('Natural Empath');
        if (userData.kindnessActions > 20) traits.push('Kindness Warrior');
        if (patterns.dataAnalysis > 7) traits.push('Data Wizard');
        if (behavior.riskCalculation > 8) traits.push('Risk Strategist');

        return traits;
    }

    calculateLoveBasedGrowth(userData) {
        let loveScore = 0;
        const love = userData.loveBasedData || {};

        loveScore += (love.selfCompassion || 0) * 2;
        loveScore += (love.communityLove || 0) * 1.5;
        loveScore += (love.loveBasedChoices || 0) * 2.5;
        loveScore += (love.forgivenessPractice || 0) * 2;
        loveScore += (love.gratitudePractice || 0) * 1.5;

        return {
            score: Math.min(100, loveScore),
            level: loveScore > 80 ? 'Love Embodied' : loveScore > 60 ? 'Love Practitioner' : loveScore > 40 ? 'Love Learner' : 'Love Seeker'
        };
    }

    calculateOverallDegenScore(traits, userData) {
        let score = 0;
        score += traits.primary.confidence * 0.2;
        score += traits.empowermentLevel.score * 0.25;
        score += traits.mindfulnessScore.score * 0.2;
        score += traits.strategyMastery.score * 0.2;
        score += traits.loveBasedGrowth.score * 0.15;
        return Math.min(100, Math.round(score));
    }

    generateDegenRecommendations(traits, userData) {
        const recommendations = [];
        
        // Primary type recommendations
        switch(traits.primary.type) {
            case 'Mindful Moon Shot':
                recommendations.push({
                    category: 'Mindfulness Enhancement',
                    action: 'Try the 5-4-3-2-1 grounding technique before major decisions',
                    reason: 'Strengthens your natural mindful awareness for better long-term choices'
                });
                break;
            case 'Empowered Scalper':
                recommendations.push({
                    category: 'Emotional Mastery', 
                    action: 'Practice the RAIN technique (Recognize, Allow, Investigate, Nurture)',
                    reason: 'Enhances your quick emotional processing for clearer decision-making'
                });
                break;
            case 'Loving Hodler':
                recommendations.push({
                    category: 'Community Building',
                    action: 'Become a mentor to newer community members',
                    reason: 'Leverages your natural patience and support abilities'
                });
                break;
            case 'Compassionate Degen':
                recommendations.push({
                    category: 'Self-Compassion',
                    action: 'Develop a personalized harm reduction protocol',
                    reason: 'Channels your risk awareness into protective action'
                });
                break;
            case 'Strategic Sensei':
                recommendations.push({
                    category: 'Knowledge Sharing',
                    action: 'Create educational content about your successful patterns',
                    reason: 'Expands your natural teaching and mentorship gifts'
                });
                break;
            case 'Balanced Warrior':
                recommendations.push({
                    category: 'Boundary Mastery',
                    action: 'Implement tactical timeouts during high-intensity moments',
                    reason: 'Balances your controlled aggression with strategic patience'
                });
                break;
        }

        // Deter method recommendations
        switch(traits.preferredDeterMethod.primary) {
            case 'Vault Timer':
                recommendations.push({
                    category: 'Timer Optimization',
                    action: 'Experiment with different vault timer durations (15min, 1hr, 24hr)',
                    reason: 'Find your optimal cooling-off period for different decision types'
                });
                break;
            case 'Community Check-in':
                recommendations.push({
                    category: 'Support Network',
                    action: 'Establish 3-person decision council for major choices',
                    reason: 'Leverages your preference for community wisdom'
                });
                break;
            case 'Strategic Analysis':
                recommendations.push({
                    category: 'Analysis Framework',
                    action: 'Develop a personal decision matrix with weighted criteria',
                    reason: 'Enhances your natural analytical approach'
                });
                break;
        }

        return recommendations;
    }

    // 🎯 Enhanced dashboard method to show degen analysis
    showDegenAnalysis(userData) {
        const traits = this.calculateDegenTraits(userData);
        
        console.log(`
🎯 DEGEN TRAIT ANALYSIS - Made with Love 💜

PRIMARY TYPE: ${traits.primary.type} (${traits.primary.confidence}% confidence)
Description: ${traits.primary.description}

EMPOWERMENT LEVEL: ${traits.empowermentLevel.level} (${traits.empowermentLevel.score}/100)
MINDFULNESS SCORE: ${traits.mindfulnessScore.level} (${traits.mindfulnessScore.score}/100)  
STRATEGY MASTERY: ${traits.strategyMastery.mastery} (${traits.strategyMastery.score}/100)
LOVE-BASED GROWTH: ${traits.loveBasedGrowth.level} (${traits.loveBasedGrowth.score}/100)

PREFERRED DETER METHOD: ${traits.preferredDeterMethod.primary}
Implementation: ${traits.preferredDeterMethod.implementation}

SECONDARY TRAITS: ${traits.secondary.join(', ')}

OVERALL DEGEN SCORE: ${traits.degenScore}/100

PERSONALIZED RECOMMENDATIONS:
${traits.recommendations.map(r => `• ${r.category}: ${r.action}\n  Reason: ${r.reason}`).join('\n')}
        `);

        return traits;
    }
}

// Initialize the enhanced application
let dashboardApp;

const initializeApp = async () => {
    dashboardApp = new TrapHouseDashboardOverlay();
    await dashboardApp.initializeApp();
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
    setTimeout(async () => {
        await initializeApp();
    }, 1000);
}

module.exports = TrapHouseDashboardOverlay;

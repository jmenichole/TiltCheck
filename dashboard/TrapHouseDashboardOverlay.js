const { app, BrowserWindow, ipcMain, screen, globalShortcut, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const MischiefManagerCollectClockIntegration = require('./MischiefManagerCollectClockIntegration');

/**
 * 💜 TrapHouse Dashboard Overlay - Made by Degens, for Degens, with Love 💜
 * 
 * The Heart of It:
 * This dashboard understands that every degen has been where you are. It's not about 
 * stopping the mischief - it's about managing it mindfully, learning from it, and 
 * growing stronger through compassionate technology.
 * 
 * Features:
 * - Always-on-top overlay with love-driven design
 * - Resizable dashboard that adapts to your needs
 * - Adjustable transparency for non-intrusive monitoring
 * - Compassionate notifications that educate, don't judge
 * - Instant messaging for peer support and battles
 * - JustTheTip wallet integration for mindful spending
 * - TrapHouse bot integration for understanding intervention
 */
class TrapHouseDashboardOverlay {
    constructor() {
        this.mainWindow = null;
        this.overlayWindow = null;
        this.tray = null;
        this.isOverlayVisible = true;
        this.mischiefManager = new MischiefManagerCollectClockIntegration();
        
        // 💜 Dashboard customization with love
        this.overlaySettings = {
            size: { width: 340, height: 680 },
            transparency: 0.95, // Default transparency
            position: { x: null, y: null }, // Auto-calculate
            resizable: true,
            notifications: {
                enabled: true,
                compassionate: true, // Educational tone
                popups: true,
                sounds: false // Gentle by default
            },
            theme: {
                heartMode: true, // 💜 Compassionate design
                colors: {
                    primary: '#9932cc', // Purple for the heart
                    secondary: '#00ff88', // Green for growth
                    accent: '#ff69b4'  // Pink for love
                }
            }
        };
        this.dashboardData = {
            user: { trustLevel: 'Elite Degen 👑', username: 'User' },
            tiltCheck: {
                currentRisk: 'low',
                sessionTime: 45,
                todayLosses: 23.50,
                limits: { daily: 100 }
            },
            wallet: {
                balance: 156.73,
                todayTips: 3,
                todayTipAmount: 15.50
            },
            verification: {
                score: 92,
                verified: true
            },
            notifications: [
                { title: 'Tip Received', message: 'Got $5.00 from @DegenerateGambler', severity: 'success' },
                { title: 'Card Battle Challenge', message: '@ProGamer wants to battle!', severity: 'warning' },
                { title: 'Loan Front Approved', message: 'Your $250 loan has been verified and approved', severity: 'success' }
            ],
            // Enhanced features with full integration
            cardGame: {
                respectPoints: 247,
                activeBattles: 2,
                recentWins: 5,
                availableBattles: 3,
                pendingChallenges: [
                    { from: '@DegenSlayer', type: 'Quick Duel', stakes: '50 respect' },
                    { from: '@CardMaster', type: 'Hangar Battle', stakes: '100 respect + $5 tip' }
                ],
                multiplayerStats: {
                    totalBattles: 47,
                    winRate: 68,
                    favoriteOpponents: ['@DegenSlayer', '@CardMaster', '@WisdomSeeker']
                }
            },
            collectClock: {
                verificationLevel: 'Step 3 - Financial Verified',
                connectedPlatforms: ['discord', 'justthetip', 'stake_api'],
                nextUpgrade: 'Community Standing (200+ respect needed)',
                hangarAccess: ['public_hangars', 'private_hangars'],
                cardGamePermissions: ['tournaments', 'betting', 'hosting']
            },
            loanFront: {
                approvedLoans: [
                    { id: 'LF001', amount: 250, rate: 0.12, status: 'active', verifiedBy: 'traphouse_bot' },
                    { id: 'LF002', amount: 100, rate: 0.15, status: 'paid', verifiedBy: 'user_vouching' }
                ],
                pendingApplications: 1,
                vouchingRequests: [
                    { from: '@NewPlayer', amount: 150, incentive: '$5 vouching reward' }
                ],
                eligibilityScore: 85
            },
            hangars: {
                activeHangars: [
                    { name: 'Degen\'s Den', type: 'public', members: 47, activeBattles: 3 },
                    { name: 'High Rollers Club', type: 'private', members: 12, activeBattles: 1 }
                ],
                invitations: [
                    { hangar: 'Elite Battle Arena', from: '@HangarMaster', expires: '2 hours' }
                ],
                ownedHangars: 0
            },
            revenueEmpire: {
                totalEarnings: 587.25,
                activeLoans: 5,
                nextFundingThreshold: 50,
                vouchingEarnings: 45.00,
                hangarRevenue: 23.50
            },
            portal: {
                securityLevel: 'GOLD',
                connectedPlatforms: ['discord', 'justthetip', 'custom'],
                customPatterns: 5,
                stakeApiStatus: 'connected'
            },
            lastUpdated: new Date().toISOString()
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        await app.whenReady();
        
        this.createSystemTray();
        this.createMainWindow();
        this.createOverlayWindow();
        this.setupGlobalShortcuts();
        this.setupIPCHandlers();
        this.startDataPolling();
        
        app.on('window-all-closed', () => {
            // Keep running in system tray
        });

        app.on('activate', () => {
            if (this.mainWindow === null) {
                this.createMainWindow();
            }
        });
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

        this.overlayWindow = new BrowserWindow({
            width: 340,
            height: 680, // Increased height for additional widgets
            x: width - 360,
            y: 20,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
            type: process.platform === 'darwin' ? 'panel' : 'toolbar'
        });

        this.overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

        this.overlayWindow.setIgnoreMouseEvents(false);
        this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

        this.overlayWindow.on('closed', () => {
            this.overlayWindow = null;
            this.isOverlayVisible = false;
        });

        this.overlayWindow.webContents.once('did-finish-load', () => {
            this.sendDataToOverlay();
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

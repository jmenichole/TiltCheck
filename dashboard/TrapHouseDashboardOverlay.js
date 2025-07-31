const { app, BrowserWindow, ipcMain, screen, globalShortcut, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * TrapHouse Dashboard Overlay - Installable Desktop Application
 * Features:
 * - Always-on-top overlay dashboard
 * - Transparent background with AIM-style interface
 * - Real-time TiltCheck monitoring
 * - JustTheTip wallet integration
 * - Live verification status
 * - Quick access to all tools
 */
class TrapHouseDashboardOverlay {
    constructor() {
        this.mainWindow = null;
        this.overlayWindow = null;
        this.tray = null;
        this.isOverlayVisible = true;
        this.dashboardData = {
            user: null,
            tiltCheck: null,
            wallet: null,
            verification: null,
            notifications: []
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        // Wait for Electron to be ready
        await app.whenReady();
        
        // Create system tray
        this.createSystemTray();
        
        // Create main dashboard window
        this.createMainWindow();
        
        // Create overlay window
        this.createOverlayWindow();
        
        // Set up global shortcuts
        this.setupGlobalShortcuts();
        
        // Start data polling
        this.startDataPolling();
        
        console.log('🎮 TrapHouse Dashboard Overlay initialized');
    }

    createSystemTray() {
        // Create tray icon
        const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
        this.tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
        
        // Create context menu
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'TrapHouse Dashboard',
                type: 'normal',
                click: () => this.showMainWindow()
            },
            { type: 'separator' },
            {
                label: 'Toggle Overlay',
                type: 'checkbox',
                checked: this.isOverlayVisible,
                click: () => this.toggleOverlay()
            },
            {
                label: 'TiltCheck Status',
                type: 'normal',
                click: () => this.showTiltCheckStatus()
            },
            {
                label: 'Wallet Balance',
                type: 'normal',
                click: () => this.showWalletBalance()
            },
            { type: 'separator' },
            {
                label: 'Settings',
                type: 'normal',
                click: () => this.showSettings()
            },
            {
                label: 'Quit',
                type: 'normal',
                click: () => app.quit()
            }
        ]);
        
        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip('TrapHouse Dashboard - Verified Degen Tools');
        
        // Handle tray click
        this.tray.on('click', () => {
            this.toggleOverlay();
        });
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: path.join(__dirname, 'assets', 'app-icon.png'),
            title: 'TrapHouse Dashboard - Verified Degen Control Center',
            show: false, // Start hidden
            frame: true,
            resizable: true,
            minimizable: true,
            maximizable: true
        });

        // Load main dashboard HTML
        this.mainWindow.loadFile(path.join(__dirname, 'dashboard', 'main.html'));

        // Handle window events
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.on('minimize', (event) => {
            event.preventDefault();
            this.mainWindow.hide();
        });

        this.mainWindow.on('close', (event) => {
            if (!app.isQuiting) {
                event.preventDefault();
                this.mainWindow.hide();
            }
        });
    }

    createOverlayWindow() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        
        this.overlayWindow = new BrowserWindow({
            width: 320,
            height: 480,
            x: width - 340, // Position on right side
            y: 20, // Top margin
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            frame: false, // Frameless for overlay effect
            alwaysOnTop: true, // Always stay on top
            skipTaskbar: true, // Don't show in taskbar
            resizable: false,
            movable: true,
            transparent: true, // Transparent background
            backgroundColor: '#00000000', // Fully transparent
            hasShadow: false,
            focusable: false, // Don't steal focus
            show: true
        });

        // Load overlay HTML
        this.overlayWindow.loadFile(path.join(__dirname, 'dashboard', 'overlay.html'));

        // Handle overlay events
        this.overlayWindow.on('closed', () => {
            this.overlayWindow = null;
        });

        // Set overlay to ignore mouse events initially
        this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });
        
        // Toggle mouse events on hover
        this.overlayWindow.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'F12') {
                this.overlayWindow.setIgnoreMouseEvents(false);
                setTimeout(() => {
                    this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });
                }, 5000);
            }
        });
    }

    setupGlobalShortcuts() {
        // Toggle overlay visibility
        globalShortcut.register('CommandOrControl+Shift+T', () => {
            this.toggleOverlay();
        });

        // Show main dashboard
        globalShortcut.register('CommandOrControl+Shift+D', () => {
            this.showMainWindow();
        });

        // Quick TiltCheck status
        globalShortcut.register('CommandOrControl+Shift+H', () => {
            this.showTiltCheckQuick();
        });

        // Quick wallet balance
        globalShortcut.register('CommandOrControl+Shift+W', () => {
            this.showWalletQuick();
        });

        console.log('🎮 Global shortcuts registered:');
        console.log('  Ctrl+Shift+T - Toggle overlay');
        console.log('  Ctrl+Shift+D - Show dashboard');
        console.log('  Ctrl+Shift+H - TiltCheck status');
        console.log('  Ctrl+Shift+W - Wallet balance');
    }

    toggleOverlay() {
        if (this.overlayWindow) {
            if (this.isOverlayVisible) {
                this.overlayWindow.hide();
                this.isOverlayVisible = false;
            } else {
                this.overlayWindow.show();
                this.isOverlayVisible = true;
            }
        }
    }

    showMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    startDataPolling() {
        // Poll data every 5 seconds
        setInterval(async () => {
            await this.updateDashboardData();
        }, 5000);

        // Initial data load
        this.updateDashboardData();
    }

    async updateDashboardData() {
        try {
            // Fetch data from Discord bot APIs
            const userData = await this.fetchUserData();
            const tiltCheckData = await this.fetchTiltCheckData();
            const walletData = await this.fetchWalletData();
            const verificationData = await this.fetchVerificationData();

            this.dashboardData = {
                user: userData,
                tiltCheck: tiltCheckData,
                wallet: walletData,
                verification: verificationData,
                notifications: await this.fetchNotifications(),
                lastUpdated: new Date()
            };

            // Send data to windows
            if (this.mainWindow) {
                this.mainWindow.webContents.send('dashboard-data-update', this.dashboardData);
            }
            
            if (this.overlayWindow) {
                this.overlayWindow.webContents.send('overlay-data-update', this.dashboardData);
            }

        } catch (error) {
            console.error('Failed to update dashboard data:', error);
        }
    }

    async fetchUserData() {
        // Mock user data - replace with actual API calls
        return {
            id: 'user123',
            username: 'DegenKing',
            verificationStatus: 'verified',
            trustLevel: 'Elite Degen 👑',
            onlineStatus: 'online',
            lastActive: new Date()
        };
    }

    async fetchTiltCheckData() {
        // Mock TiltCheck data - replace with actual API calls
        return {
            status: 'active',
            currentRisk: 'low',
            sessionTime: 45,
            todayLosses: 23.50,
            weeklyLosses: 127.80,
            limits: {
                daily: 100,
                session: 120
            },
            alerts: []
        };
    }

    async fetchWalletData() {
        // Mock wallet data - replace with actual API calls
        return {
            balance: 156.73,
            currency: 'USD',
            status: 'active',
            pendingTransactions: 0,
            todayTips: 3,
            todayTipAmount: 15.50,
            recentTransactions: [
                { type: 'tip_sent', amount: 5.00, to: 'GamblerPro', time: '2 min ago' },
                { type: 'tip_received', amount: 10.50, from: 'CasinoKing', time: '15 min ago' }
            ]
        };
    }

    async fetchVerificationData() {
        // Mock verification data - replace with actual API calls
        return {
            score: 92,
            level: 'Elite',
            steps: {
                discord: true,
                tiltcheck: true,
                wallet: true,
                device: true,
                behavioral: true
            },
            verifiedAt: '2024-01-15',
            badges: ['Early Adopter', 'Responsible Gambler', 'Trusted Tipper']
        };
    }

    async fetchNotifications() {
        // Mock notifications - replace with actual API calls
        return [
            {
                id: '1',
                type: 'tilt_alert',
                title: 'Session Limit Warning',
                message: 'You\'ve been active for 90 minutes',
                severity: 'warning',
                timestamp: new Date(Date.now() - 300000)
            },
            {
                id: '2',
                type: 'tip_received',
                title: 'Tip Received',
                message: 'Received $10.50 from CasinoKing',
                severity: 'success',
                timestamp: new Date(Date.now() - 900000)
            }
        ];
    }

    showTiltCheckStatus() {
        const { tiltCheck } = this.dashboardData;
        if (tiltCheck) {
            this.showNotification('TiltCheck Status', 
                `Risk: ${tiltCheck.currentRisk} | Session: ${tiltCheck.sessionTime}min | Today: $${tiltCheck.todayLosses}`);
        }
    }

    showWalletBalance() {
        const { wallet } = this.dashboardData;
        if (wallet) {
            this.showNotification('Wallet Balance', 
                `Balance: $${wallet.balance} | Tips Today: ${wallet.todayTips} ($${wallet.todayTipAmount})`);
        }
    }

    showTiltCheckQuick() {
        // Show quick TiltCheck overlay
        if (this.overlayWindow) {
            this.overlayWindow.webContents.send('show-quick-panel', 'tiltcheck');
        }
    }

    showWalletQuick() {
        // Show quick wallet overlay
        if (this.overlayWindow) {
            this.overlayWindow.webContents.send('show-quick-panel', 'wallet');
        }
    }

    showSettings() {
        // Show settings window
        this.showMainWindow();
        if (this.mainWindow) {
            this.mainWindow.webContents.send('navigate-to', 'settings');
        }
    }

    showNotification(title, message) {
        // Show system notification
        if (Notification.isSupported()) {
            new Notification({
                title: `TrapHouse - ${title}`,
                body: message,
                icon: path.join(__dirname, 'assets', 'notification-icon.png')
            }).show();
        }
    }

    // IPC handlers
    setupIPCHandlers() {
        ipcMain.handle('get-dashboard-data', () => {
            return this.dashboardData;
        });

        ipcMain.handle('send-tip', async (event, { toUser, amount, message }) => {
            // Handle tip sending
            return await this.sendTip(toUser, amount, message);
        });

        ipcMain.handle('update-tilt-settings', async (event, settings) => {
            // Handle TiltCheck settings update
            return await this.updateTiltSettings(settings);
        });

        ipcMain.handle('toggle-overlay-interaction', (event, enabled) => {
            if (this.overlayWindow) {
                this.overlayWindow.setIgnoreMouseEvents(!enabled, { forward: true });
            }
        });
    }

    async sendTip(toUser, amount, message) {
        // Mock tip sending - replace with actual API call
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add to recent transactions
            this.dashboardData.wallet.recentTransactions.unshift({
                type: 'tip_sent',
                amount: amount,
                to: toUser,
                time: 'Just now'
            });

            // Update balance
            this.dashboardData.wallet.balance -= amount;
            this.dashboardData.wallet.todayTips++;
            this.dashboardData.wallet.todayTipAmount += amount;

            return { success: true, txId: 'tx_' + Date.now() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateTiltSettings(settings) {
        // Mock settings update - replace with actual API call
        try {
            this.dashboardData.tiltCheck.limits = { ...this.dashboardData.tiltCheck.limits, ...settings };
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Handle app events
app.on('window-all-closed', () => {
    // Keep app running even when all windows are closed (for overlay)
    if (process.platform !== 'darwin') {
        // Don't quit on macOS
    }
});

app.on('activate', () => {
    // Recreate window on macOS when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        const dashboard = new TrapHouseDashboardOverlay();
    }
});

app.on('before-quit', () => {
    app.isQuiting = true;
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Focus main window if someone tries to open another instance
        if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) this.mainWindow.restore();
            this.mainWindow.focus();
        }
    });
}

// Start the application
if (require.main === module) {
    const dashboard = new TrapHouseDashboardOverlay();
}

module.exports = TrapHouseDashboardOverlay;

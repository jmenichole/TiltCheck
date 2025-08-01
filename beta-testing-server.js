#!/usr/bin/env node

/**
 * TrapHouse Beta Testing Server
 * Dedicated testing environment with bypassed payment/role requirements
 * Only requires crypto wallet funding for JustTheTip functionality
 */

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const path = require('path');
const { BetaFeedbackManager, BetaMetricsCollector } = require('./beta-feedback-system');
const { 
    PORT_CONFIG, 
    VERIFIED_BETA_TESTERS, 
    desktopOnlyMiddleware, 
    validateDesktopAgreements,
    getLocalIP 
} = require('./port-forwarding-config');

// Beta Testing Configuration

// Import core systems for testing
const CryptoTipManager = require('./cryptoTipManager');
const CryptoWalletManager = require('./cryptoWalletManager');
const TiltCheckMischiefManager = require('./tiltCheckMischiefManager');
const EnhancedTiltCheckIntegration = require('./enhancedTiltCheckIntegration');

class BetaTestingServer {
    constructor() {
        // Server configuration
        this.port = process.env.BETA_PORT || 3335;
        this.analyticsPort = process.env.ANALYTICS_PORT || 3336;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageReactions
            ]
        });

        // Verified beta testers
        this.verifiedBetaUsers = [
            '115681066538237953', // Original verified user
            '228742205018210304', // Additional verified user 1
            '1077399941951012864', // Additional verified user 2
            '261235347038535682', // Additional verified user 3
            '898170764447072336'  // Additional verified user 4
        ];

        // Owner/Admin users for dev tools access
        this.ownerAdminUsers = [
            '115681066538237953', // Primary owner
            '228742205018210304'  // Admin access
        ];

        // Beta testing configuration
        this.betaConfig = {
            bypassPayments: true,
            bypassRoleChecks: true,
            allowAllCommands: true,
            testingChannelOnly: false, // Set to true to limit to specific channel
            testingChannelId: null, // Set specific channel ID if needed
            maxBetaUsers: 50, // Limit concurrent beta testers
            sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
            loggingEnabled: true,
            analyticsEnabled: true
        };

        // Track beta testers
        this.betaTesters = new Map();
        this.activeSessions = new Map();
        
        // Initialize feedback and UX system
        this.feedbackManager = new BetaFeedbackManager(this.client);
        
        // Analytics and logging system
        this.analyticsData = {
            commands: new Map(),
            sessions: [],
            errors: [],
            performance: [],
            userActivity: new Map(),
            systemStats: {
                startTime: Date.now(),
                totalCommands: 0,
                totalSessions: 0,
                totalErrors: 0,
                uptime: 0
            }
        };

        this.initializeBetaServer();
    }

    async initializeBetaServer() {
        console.log('🧪 Initializing TrapHouse Beta Testing Server...');
        console.log(`📍 Beta Port: ${this.port}`);
        console.log(`📊 Analytics Port: ${this.analyticsPort}`);
        console.log('🔓 Payment bypass: ENABLED');
        console.log('🔓 Role bypass: ENABLED');
        console.log('💰 Crypto wallet funding: REQUIRED');
        console.log(`⏰ Session Duration: 7 days`);
        console.log(`👥 Verified Beta Users: ${this.verifiedBetaUsers.length}`);
        console.log(`🔧 Owner/Admin Users: ${this.ownerAdminUsers.length}`);
        console.log('');
        console.log('🎮 Bot Ecosystem:');
        console.log('   🃏 Degens Bot (port 3333): Card game functionality');
        console.log(`   🧪 Beta Testing (port ${this.port}): All TrapHouse features with bypasses`);
        console.log(`   📊 Analytics (port ${this.analyticsPort}): Monitoring and dev tools`);
        console.log('');

        // Initialize core systems with beta overrides
        await this.initializeCryptoSystems();
        await this.initializeTiltCheckSystems();
        await this.setupExpressServer();
        await this.setupAnalyticsServer();
        await this.setupDiscordBot();
        
        // Start analytics logging
        this.startAnalyticsLogging();
    }

    async initializeCryptoSystems() {
        console.log('💎 Initializing crypto systems for beta testing...');
        
        this.cryptoTipManager = new CryptoTipManager();
        this.cryptoWalletManager = new CryptoWalletManager();
        
        // Override payment requirements for beta
        this.cryptoTipManager.betaMode = true;
        this.cryptoWalletManager.betaMode = true;
        
        console.log('✅ Crypto systems ready with beta overrides');
    }

    async initializeTiltCheckSystems() {
        console.log('🎰 Initializing TiltCheck systems for beta testing...');
        
        this.tiltCheckManager = new TiltCheckMischiefManager();
        this.enhancedTiltCheck = new EnhancedTiltCheckIntegration();
        
        // Beta overrides for TiltCheck
        this.tiltCheckManager.betaMode = true;
        this.enhancedTiltCheck.betaMode = true;
        
        console.log('✅ TiltCheck systems ready with beta overrides');
    }

    async setupExpressServer() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.static('public'));

        // Beta testing dashboard endpoint
        this.app.get('/beta', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard', 'beta-testing-dashboard.html'));
        });

        // AIM Overlay Dashboard endpoint
        this.app.get('/aim-overlay', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard', 'overlay.html'));
        });

        // Beta tester registration endpoint
        this.app.post('/api/beta/register', async (req, res) => {
            try {
                const { discordId, discordTag } = req.body;
                
                if (this.betaTesters.size >= this.betaConfig.maxBetaUsers) {
                    return res.status(429).json({ 
                        error: 'Beta testing limit reached',
                        waitlist: true
                    });
                }

                const betaSession = {
                    discordId,
                    discordTag,
                    startTime: Date.now(),
                    expiresAt: Date.now() + this.betaConfig.sessionDuration,
                    permissions: ['all_commands', 'crypto_access', 'tiltcheck_access'],
                    bypassPayments: true,
                    bypassRoles: true
                };

                this.betaTesters.set(discordId, betaSession);
                this.activeSessions.set(discordId, betaSession);

                res.json({
                    success: true,
                    sessionId: discordId,
                    expiresAt: betaSession.expiresAt,
                    permissions: betaSession.permissions
                });

                console.log(`✅ Beta tester registered: ${discordTag} (${discordId})`);
            } catch (error) {
                console.error('❌ Beta registration error:', error);
                res.status(500).json({ error: 'Registration failed' });
            }
        });

        // Health check for beta server
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                mode: 'beta-testing',
                port: this.port,
                betaTesters: this.betaTesters.size,
                maxBetaUsers: this.betaConfig.maxBetaUsers,
                features: {
                    paymentBypass: this.betaConfig.bypassPayments,
                    roleBypass: this.betaConfig.bypassRoleChecks,
                    cryptoWallets: true,
                    tiltCheck: true,
                    aimOverlay: true
                }
            });
        });

        this.app.listen(this.port, () => {
            console.log(`🌐 Beta testing server running on port ${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}/beta`);
            console.log(`🎯 AIM Overlay: http://localhost:${this.port}/aim-overlay`);
        });
    }

    async setupAnalyticsServer() {
        this.analyticsApp = express();
        this.analyticsApp.use(express.json());
        this.analyticsApp.use(express.static('analytics'));

        // Analytics dashboard endpoint
        this.analyticsApp.get('/analytics', (req, res) => {
            res.sendFile(path.join(__dirname, 'analytics', 'dashboard.html'));
        });

        // Owner/Admin dev tools endpoint
        this.analyticsApp.get('/dev-tools', (req, res) => {
            res.sendFile(path.join(__dirname, 'analytics', 'dev-tools.html'));
        });

        // API endpoints for analytics data
        this.analyticsApp.get('/api/analytics/overview', (req, res) => {
            const { userId } = req.query;
            
            // Verify user has access
            if (!this.verifiedBetaUsers.includes(userId) && !this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Unauthorized access' });
            }

            res.json({
                systemStats: this.analyticsData.systemStats,
                activeSessions: this.betaTesters.size,
                totalCommands: this.analyticsData.systemStats.totalCommands,
                recentActivity: Array.from(this.analyticsData.userActivity.entries()).slice(-20)
            });
        });

        this.analyticsApp.get('/api/analytics/commands', (req, res) => {
            const { userId } = req.query;
            
            if (!this.verifiedBetaUsers.includes(userId) && !this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Unauthorized access' });
            }

            const commandStats = {};
            for (const [command, count] of this.analyticsData.commands.entries()) {
                commandStats[command] = count;
            }

            res.json(commandStats);
        });

        this.analyticsApp.get('/api/analytics/sessions', (req, res) => {
            const { userId } = req.query;
            
            if (!this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            res.json({
                sessions: this.analyticsData.sessions,
                activeSessions: Array.from(this.betaTesters.values())
            });
        });

        this.analyticsApp.get('/api/analytics/errors', (req, res) => {
            const { userId } = req.query;
            
            if (!this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            res.json({
                errors: this.analyticsData.errors.slice(-100),
                errorCount: this.analyticsData.errors.length
            });
        });

        this.analyticsApp.get('/api/analytics/feedback', (req, res) => {
            const { userId } = req.query;
            
            if (!this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const feedbackMetrics = this.feedbackManager.generateMetricsReport();
            const allFeedback = Array.from(this.feedbackManager.feedbackData.values());

            res.json({
                metrics: feedbackMetrics,
                recentFeedback: allFeedback.slice(-50),
                totalFeedback: allFeedback.length
            });
        });

        this.analyticsApp.get('/api/analytics/performance', (req, res) => {
            const { userId } = req.query;
            
            if (!this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            res.json({
                performance: this.analyticsData.performance.slice(-100),
                averageResponseTime: this.calculateAverageResponseTime()
            });
        });

        // Export data endpoints
        this.analyticsApp.get('/api/analytics/export', (req, res) => {
            const { userId, format } = req.query;
            
            if (!this.ownerAdminUsers.includes(userId)) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const exportData = {
                timestamp: new Date().toISOString(),
                systemStats: this.analyticsData.systemStats,
                commands: Object.fromEntries(this.analyticsData.commands),
                sessions: this.analyticsData.sessions,
                errors: this.analyticsData.errors,
                performance: this.analyticsData.performance,
                userActivity: Object.fromEntries(this.analyticsData.userActivity)
            };

            if (format === 'json') {
                res.json(exportData);
            } else {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=beta-analytics.csv');
                res.send(this.convertToCSV(exportData));
            }
        });

        this.analyticsApp.listen(this.analyticsPort, () => {
            console.log(`📊 Analytics server running on port ${this.analyticsPort}`);
            console.log(`📈 Analytics Dashboard: http://localhost:${this.analyticsPort}/analytics`);
        });
    }

    startAnalyticsLogging() {
        console.log('� Starting analytics logging system...');

        // Log system stats every minute
        setInterval(() => {
            this.analyticsData.systemStats.uptime = process.uptime();
            this.analyticsData.systemStats.activeSessions = this.betaTesters.size;
            this.analyticsData.systemStats.totalCommands = Array.from(this.analyticsData.commands.values()).reduce((a, b) => a + b, 0);
            this.analyticsData.systemStats.totalErrors = this.analyticsData.errors.length;
            
            this.logSystemActivity('SYSTEM_STATS_UPDATE', {
                uptime: this.analyticsData.systemStats.uptime,
                activeSessions: this.analyticsData.systemStats.activeSessions,
                totalCommands: this.analyticsData.systemStats.totalCommands
            });
        }, 60000);

        // Session cleanup every hour
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 3600000);

        // Analytics data export every 6 hours
        setInterval(() => {
            this.exportAnalyticsData();
        }, 21600000);

        console.log('✅ Analytics logging system active');
    }

    logCommand(command, userId, params = {}) {
        const commandCount = this.analyticsData.commands.get(command) || 0;
        this.analyticsData.commands.set(command, commandCount + 1);

        this.logUserActivity(userId, `COMMAND_${command.toUpperCase()}`, params);
        
        console.log(`📊 Command logged: ${command} by ${userId}`);
    }

    logError(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            error: error.message || error,
            stack: error.stack || 'No stack trace',
            context: context,
            id: Date.now()
        };

        this.analyticsData.errors.push(errorEntry);
        
        // Keep only last 1000 errors
        if (this.analyticsData.errors.length > 1000) {
            this.analyticsData.errors = this.analyticsData.errors.slice(-1000);
        }

        console.error(`❌ Error logged: ${errorEntry.error}`);
    }

    logPerformance(operation, duration, details = {}) {
        const performanceEntry = {
            timestamp: new Date().toISOString(),
            operation: operation,
            duration: duration,
            details: details,
            id: Date.now()
        };

        this.analyticsData.performance.push(performanceEntry);
        
        // Keep only last 1000 performance entries
        if (this.analyticsData.performance.length > 1000) {
            this.analyticsData.performance = this.analyticsData.performance.slice(-1000);
        }

        console.log(`⚡ Performance logged: ${operation} took ${duration}ms`);
    }

    logUserActivity(userId, action, data = {}) {
        if (!this.analyticsData.userActivity.has(userId)) {
            this.analyticsData.userActivity.set(userId, []);
        }

        const userActivity = this.analyticsData.userActivity.get(userId);
        userActivity.push({
            timestamp: new Date().toISOString(),
            action: action,
            data: data
        });

        // Keep only last 100 activities per user
        if (userActivity.length > 100) {
            this.analyticsData.userActivity.set(userId, userActivity.slice(-100));
        }

        console.log(`👤 User activity logged: ${userId} - ${action}`);
    }

    logSystemActivity(event, data = {}) {
        const systemEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data
        };

        console.log(`🔧 System event: ${event}`, data);
    }

    cleanupExpiredSessions() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [userId, session] of this.betaTesters.entries()) {
            if (now - session.startTime > this.sessionDuration) {
                this.betaTesters.delete(userId);
                cleanedCount++;
                
                this.logUserActivity(userId, 'SESSION_EXPIRED', {
                    duration: now - session.startTime,
                    autoCleanup: true
                });
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
        }
    }

    calculateAverageResponseTime() {
        if (this.analyticsData.performance.length === 0) return 0;
        
        const total = this.analyticsData.performance.reduce((sum, entry) => sum + entry.duration, 0);
        return Math.round(total / this.analyticsData.performance.length);
    }

    convertToCSV(data) {
        const headers = ['Timestamp', 'Type', 'Data'];
        const rows = [headers.join(',')];

        // Add system stats
        rows.push(`${new Date().toISOString()},SystemStats,"${JSON.stringify(data.systemStats).replace(/"/g, '""')}"`);

        // Add command data
        for (const [command, count] of Object.entries(data.commands)) {
            rows.push(`${new Date().toISOString()},Command,"${command},${count}"`);
        }

        // Add recent errors
        data.errors.slice(-50).forEach(error => {
            rows.push(`${error.timestamp},Error,"${error.error.replace(/"/g, '""')}"`);
        });

        return rows.join('\n');
    }

    exportAnalyticsData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            systemStats: this.analyticsData.systemStats,
            commands: Object.fromEntries(this.analyticsData.commands),
            sessions: this.analyticsData.sessions,
            errors: this.analyticsData.errors.slice(-100),
            performance: this.analyticsData.performance.slice(-100),
            userActivity: Object.fromEntries(this.analyticsData.userActivity)
        };

        // Save to file
        const filename = `analytics-export-${Date.now()}.json`;
        require('fs').writeFileSync(filename, JSON.stringify(exportData, null, 2));
        
        console.log(`💾 Analytics data exported to ${filename}`);
    }

    async setupDiscordBot() {
        this.client.on('ready', () => {
            console.log(`🤖 Beta testing bot logged in as ${this.client.user.tag}`);
            this.client.user.setActivity('Beta Testing Mode | All Features Unlocked', { type: 'WATCHING' });
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            await this.handleBetaCommand(message);
        });

        // Use the same bot token but with beta identification
        await this.client.login(process.env.DISCORD_BOT_TOKEN);
    }

    async handleBetaCommand(message) {
        const content = message.content.toLowerCase().trim();
        const userId = message.author.id;

        // Beta tester registration
        if (content.startsWith('!beta-register') || content.startsWith('!join-beta')) {
            await this.handleBetaRegistration(message);
            return;
        }

        // Check if user is registered beta tester
        const betaSession = this.betaTesters.get(userId);
        if (!betaSession) {
            if (content.startsWith('!')) {
                return message.reply('🧪 **Beta Testing Required**\n\nUse `!beta-register` to join the beta program and access all features without payment/role restrictions!');
            }
            return;
        }

        // Check session expiry
        if (Date.now() > betaSession.expiresAt) {
            this.betaTesters.delete(userId);
            this.activeSessions.delete(userId);
            return message.reply('⏰ Your beta testing session has expired. Use `!beta-register` to renew.');
        }

        // Handle beta commands with full access
        await this.processBetaCommand(message, betaSession);
    }

    async handleBetaRegistration(message) {
        const userId = message.author.id;
        const userTag = message.author.tag;

        if (this.betaTesters.has(userId)) {
            const session = this.betaTesters.get(userId);
            const timeLeft = Math.ceil((session.expiresAt - Date.now()) / (1000 * 60 * 60));
            
            return message.reply(`✅ You're already registered for beta testing!\n⏰ Time remaining: ${timeLeft} hours`);
        }

        if (this.betaTesters.size >= this.betaConfig.maxBetaUsers) {
            return message.reply('🔒 Beta testing is currently full. You\'ve been added to the waitlist.');
        }

        const betaSession = {
            discordId: userId,
            discordTag: userTag,
            startTime: Date.now(),
            expiresAt: Date.now() + this.betaConfig.sessionDuration,
            permissions: ['all_commands', 'crypto_access', 'tiltcheck_access'],
            bypassPayments: true,
            bypassRoles: true
        };

        this.betaTesters.set(userId, betaSession);
        this.activeSessions.set(userId, betaSession);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🧪 Beta Testing Access Granted!')
            .setDescription('Welcome to the TrapHouse Beta Testing Program')
            .addFields(
                {
                    name: '✅ Unlocked Features',
                    value: '• All commands available\n• Payment requirements bypassed\n• Role restrictions removed\n• Full crypto wallet access\n• Complete TiltCheck functionality\n• AIM overlay dashboard',
                    inline: false
                },
                {
                    name: '💰 Crypto Wallet Funding',
                    value: '**REQUIRED:** You still need to fund your JustTheTip crypto wallets for crypto functionality. Use `!crypto-wallet create` to get started.',
                    inline: false
                },
                {
                    name: '📊 Available Commands',
                    value: '`!beta-help` - Full command list\n`!crypto-wallet` - Wallet management\n`!tiltcheck` - Monitoring features\n`!aim-overlay` - Dashboard access',
                    inline: false
                },
                {
                    name: '⏰ Session Duration',
                    value: '24 hours (renewable)',
                    inline: true
                },
                {
                    name: '🎯 Dashboard Access',
                    value: `[Beta Dashboard](http://localhost:${this.port}/beta)\n[AIM Overlay](http://localhost:${this.port}/aim-overlay)`,
                    inline: true
                }
            )
            .setFooter({ text: 'Beta Testing Mode - All restrictions bypassed except crypto wallet funding' });

        await message.reply({ embeds: [embed] });
        console.log(`✅ Beta tester registered: ${userTag} (${userId})`);
    }

    async processBetaCommand(message, betaSession) {
        const content = message.content.toLowerCase().trim();
        const args = content.slice(1).split(' ');
        const command = args[0];
        const startTime = Date.now();

        try {
            // Track user interaction
            this.feedbackManager.trackUserInteraction(message.author.id, command);
            
            switch (command) {
                case 'beta-help':
                    await this.showBetaHelp(message);
                    break;

                case 'beta-status':
                    await this.showBetaStatus(message, betaSession);
                    break;

                case 'beta-feedback':
                    await this.handleFeedbackCommand(message, args.slice(1));
                    break;

                case 'crypto-wallet':
                case 'wallet':
                    // Show helper for first-time crypto users
                    const isFirstCrypto = !this.hasUsedCryptoBefore(message.author.id);
                    if (isFirstCrypto) {
                        await this.feedbackManager.showHelpPopup(message, 'crypto-first-time');
                    }
                    await this.cryptoWalletManager.handleCreateWallet(message, args.slice(1));
                    break;

                case 'crypto-tip':
                case 'tip':
                    await this.cryptoTipManager.handleTipCommand(message, args.slice(1));
                    break;

                case 'tiltcheck':
                    // Show helper for first-time TiltCheck users
                    const isFirstTiltCheck = !this.hasUsedTiltCheckBefore(message.author.id);
                    if (isFirstTiltCheck) {
                        await this.feedbackManager.showHelpPopup(message, 'tiltcheck-intro');
                    }
                    await this.enhancedTiltCheck.handleTiltCheckCommand(message, args.slice(1));
                    break;

                case 'aim-overlay':
                    await this.showAimOverlayInfo(message);
                    break;

                case 'crypto-chains':
                    await this.showCryptoChains(message);
                    break;

                case 'beta-degens':
                    await this.showDegensIntegration(message);
                    break;

                default:
                    // Show contextual help for unknown commands
                    await this.feedbackManager.provideContextualHelp(message, 'command-not-found');
                    await this.forwardCommandWithBypass(message, command, args.slice(1));
            }

            // Track command completion time
            const duration = Date.now() - startTime;
            this.feedbackManager.trackUserInteraction(message.author.id, command, duration);
            
            // Show feedback prompt if appropriate
            await this.feedbackManager.showFeedbackPrompt(message, { command, duration });
            
        } catch (error) {
            console.error('❌ Beta command error:', error);
            
            // Provide contextual help based on error type
            if (error.message.includes('wallet')) {
                await this.feedbackManager.provideContextualHelp(message, 'wallet-not-found');
            } else if (error.message.includes('balance')) {
                await this.feedbackManager.provideContextualHelp(message, 'insufficient-balance');
            }
            
            message.reply('❌ Command failed in beta mode. Please try again or contact support.');
            
            // Track error for metrics
            this.logError(error, { command, userId: message.author.id });
        }
    }

    async showBetaHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#00aaff')
            .setTitle('🧪 TrapHouse Beta Testing - Command Reference')
            .setDescription('All features unlocked for testing (except crypto wallet funding requirement)')
            .addFields(
                {
                    name: '🧪 Beta Commands',
                    value: '`!beta-help` - This help message\n`!beta-status` - Your beta session info\n`!beta-register` - Register for beta (if not already)\n`!beta-degens` - Degens bot integration info\n`!beta-feedback` - Submit feedback and ratings',
                    inline: false
                },
                {
                    name: '💰 Crypto Features (Funding Required)',
                    value: '`!crypto-wallet create [chain]` - Create wallet\n`!crypto-wallet balance` - Check balance\n`!crypto-tip @user [amount]` - Send crypto tips\n`!crypto-chains` - Supported blockchains',
                    inline: false
                },
                {
                    name: '🎰 TiltCheck Features (No Verification Required)',
                    value: '`!tiltcheck start` - Begin monitoring\n`!tiltcheck status` - View dashboard\n`!tiltcheck patterns` - Pattern analysis\n`!tiltcheck help` - Full TiltCheck guide',
                    inline: false
                },
                {
                    name: '🎯 Dashboard & Overlay',
                    value: '`!aim-overlay` - AIM dashboard info\n`!dashboard` - Main dashboard access',
                    inline: false
                },
                {
                    name: '🔗 Web Access',
                    value: `[Beta Dashboard](http://localhost:${this.port}/beta)\n[AIM Overlay](http://localhost:${this.port}/aim-overlay)\n[Health Check](http://localhost:${this.port}/health)`,
                    inline: false
                }
            )
            .setFooter({ text: 'Beta Mode: Payment/Role requirements bypassed • Crypto funding still required' });

        await message.reply({ embeds: [embed] });
    }

    async showBetaStatus(message, betaSession) {
        const timeLeft = Math.ceil((betaSession.expiresAt - Date.now()) / (1000 * 60 * 60));
        const totalBetaTesters = this.betaTesters.size;

        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('📊 Your Beta Testing Session')
            .addFields(
                {
                    name: '⏰ Time Remaining',
                    value: `${timeLeft} hours`,
                    inline: true
                },
                {
                    name: '🧪 Beta Testers Active',
                    value: `${totalBetaTesters}/${this.betaConfig.maxBetaUsers}`,
                    inline: true
                },
                {
                    name: '✅ Active Permissions',
                    value: betaSession.permissions.join('\n• '),
                    inline: false
                },
                {
                    name: '🔓 Bypassed Requirements',
                    value: '• Payment verification\n• Role requirements\n• Access restrictions',
                    inline: true
                },
                {
                    name: '💰 Still Required',
                    value: '• Crypto wallet funding\n• Valid Discord account',
                    inline: true
                }
            )
            .setFooter({ text: `Session started: ${new Date(betaSession.startTime).toLocaleString()}` });

        await message.reply({ embeds: [embed] });
    }

    async showAimOverlayInfo(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6600')
            .setTitle('🎯 AIM-Style Overlay Dashboard')
            .setDescription('Real-time monitoring dashboard with gaming-inspired design')
            .addFields(
                {
                    name: '🎮 Features',
                    value: '• Real-time TiltCheck monitoring\n• Crypto wallet status\n• Live transaction feeds\n• Risk level indicators\n• Gaming-style HUD',
                    inline: false
                },
                {
                    name: '🔗 Access URLs',
                    value: `**Direct Access:** http://localhost:${this.port}/aim-overlay\n**Beta Dashboard:** http://localhost:${this.port}/beta`,
                    inline: false
                },
                {
                    name: '💡 Usage Tips',
                    value: '• Keep overlay open while gambling\n• Monitor risk levels in real-time\n• Use for testing TiltCheck accuracy\n• Perfect for beta testing sessions',
                    inline: false
                }
            )
            .setFooter({ text: 'Beta Mode: Overlay available without restrictions' });

        await message.reply({ embeds: [embed] });
    }

    async showCryptoChains(message) {
        const chains = [
            '🔹 Ethereum (ETH)',
            '🔹 Polygon (MATIC)',
            '🔹 Binance Smart Chain (BNB)',
            '🔹 Arbitrum (ARB)',
            '🔹 Avalanche (AVAX)',
            '🔹 Solana (SOL)',
            '🔹 Tron (TRX)'
        ];

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('💎 Supported Crypto Chains (Beta)')
            .setDescription('All chains available for beta testing')
            .addFields(
                {
                    name: '🌐 Available Networks',
                    value: chains.join('\n'),
                    inline: false
                },
                {
                    name: '💰 Funding Required',
                    value: 'You must fund your wallets with real crypto for tip functionality. Use `!crypto-wallet create [chain]` to generate wallet addresses.',
                    inline: false
                },
                {
                    name: '🧪 Beta Benefits',
                    value: '• No minimum balance requirements\n• No transaction fees (for testing)\n• All chains unlocked\n• Advanced features enabled',
                    inline: false
                }
            )
            .setFooter({ text: 'Beta Mode: Enhanced crypto features unlocked' });

        await message.reply({ embeds: [embed] });
    }

    async showDegensIntegration(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎮 Degens Bot Integration')
            .setDescription('Card game functionality running on separate port for ecosystem separation')
            .addFields(
                {
                    name: '🃏 Degens Bot (Port 3333)',
                    value: '• Card game functionality\n• Separate from TrapHouse features\n• Independent operation\n• Gaming-focused commands',
                    inline: false
                },
                {
                    name: '🧪 Beta Testing (Port 3335)',
                    value: '• Full TrapHouse features\n• Payment/role bypasses\n• All crypto integrations\n• 7-day testing sessions',
                    inline: false
                },
                {
                    name: '📊 Analytics (Port 3336)',
                    value: '• Real-time monitoring\n• Performance metrics\n• Session management\n• Admin dev tools',
                    inline: false
                },
                {
                    name: '🔗 Integration Notes',
                    value: '• Bots can communicate if needed\n• Shared Discord guild access\n• Separate command spaces\n• Independent user management',
                    inline: false
                }
            )
            .setFooter({ text: 'Both bots can run simultaneously on different ports' });

        await message.reply({ embeds: [embed] });
    }

    async handleFeedbackCommand(message, args) {
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('💬 Beta Feedback System')
                .setDescription('Help us improve the beta experience!')
                .addFields(
                    {
                        name: '📝 Quick Feedback',
                        value: '`!beta-feedback rate [command] [1-5]` - Rate a specific command\n`!beta-feedback suggest [your suggestion]` - Submit a suggestion',
                        inline: false
                    },
                    {
                        name: '🔍 Feedback Options',
                        value: '`!beta-feedback report [issue]` - Report a bug or issue\n`!beta-feedback experience` - Share your overall experience',
                        inline: false
                    },
                    {
                        name: '📊 Your Stats',
                        value: 'React with 📊 to see your beta testing statistics',
                        inline: false
                    }
                )
                .setFooter({ text: 'Your feedback helps shape the final release!' });

            const feedbackMsg = await message.reply({ embeds: [embed] });
            await feedbackMsg.react('📊');

            // Setup stats reaction collector
            const filter = (reaction, user) => reaction.emoji.name === '📊' && user.id === message.author.id;
            const collector = feedbackMsg.createReactionCollector({ filter, time: 60000 });
            
            collector.on('collect', async () => {
                await this.showUserBetaStats(message);
            });

            return;
        }

        const subCommand = args[0];
        const content = args.slice(1).join(' ');

        switch (subCommand) {
            case 'rate':
                await this.handleRatingFeedback(message, content);
                break;
            case 'suggest':
                await this.handleSuggestionFeedback(message, content);
                break;
            case 'report':
                await this.handleBugReport(message, content);
                break;
            case 'experience':
                await this.handleExperienceFeedback(message);
                break;
            default:
                message.reply('❓ Unknown feedback command. Use `!beta-feedback` to see options.');
        }
    }

    async handleRatingFeedback(message, content) {
        const parts = content.split(' ');
        if (parts.length < 2) {
            return message.reply('📝 Usage: `!beta-feedback rate [command] [1-5]`\nExample: `!beta-feedback rate crypto-wallet 4`');
        }

        const command = parts[0];
        const rating = parseInt(parts[1]);

        if (rating < 1 || rating > 5 || isNaN(rating)) {
            return message.reply('⚠️ Rating must be between 1-5');
        }

        const experienceMap = {
            5: 'excellent',
            4: 'good',
            3: 'neutral', 
            2: 'poor',
            1: 'broken'
        };

        await this.feedbackManager.collectFeedback(
            message.author.id,
            command,
            experienceMap[rating],
            { type: 'rating', rating, manual: true }
        );

        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('⭐ Rating Submitted!')
            .setDescription(`Thank you for rating **${command}** with ${rating}/5 stars!`)
            .setFooter({ text: 'Your feedback helps us prioritize improvements' });

        await message.reply({ embeds: [embed] });
    }

    async handleSuggestionFeedback(message, suggestion) {
        if (!suggestion) {
            return message.reply('💡 Usage: `!beta-feedback suggest [your suggestion]`\nExample: `!beta-feedback suggest Add more crypto chains`');
        }

        await this.feedbackManager.collectFeedback(
            message.author.id,
            'suggestion',
            'neutral',
            { type: 'suggestion', content: suggestion, manual: true }
        );

        const embed = new EmbedBuilder()
            .setColor('#2196F3')
            .setTitle('💡 Suggestion Received!')
            .setDescription('Thank you for your suggestion!')
            .addFields({
                name: '📝 Your Suggestion',
                value: suggestion.length > 200 ? suggestion.substring(0, 200) + '...' : suggestion,
                inline: false
            })
            .setFooter({ text: 'We review all suggestions for the final release' });

        await message.reply({ embeds: [embed] });
    }

    async handleBugReport(message, issue) {
        if (!issue) {
            return message.reply('🐛 Usage: `!beta-feedback report [issue description]`\nExample: `!beta-feedback report Wallet creation fails on Polygon`');
        }

        await this.feedbackManager.collectFeedback(
            message.author.id,
            'bug-report',
            'poor',
            { type: 'bug', content: issue, priority: 'high', manual: true }
        );

        const embed = new EmbedBuilder()
            .setColor('#FF5722')
            .setTitle('🐛 Bug Report Submitted!')
            .setDescription('Thank you for reporting this issue!')
            .addFields({
                name: '🔍 Issue Description',
                value: issue.length > 200 ? issue.substring(0, 200) + '...' : issue,
                inline: false
            })
            .setFooter({ text: 'Our team will investigate this issue promptly' });

        await message.reply({ embeds: [embed] });
    }

    async handleExperienceFeedback(message) {
        const embed = new EmbedBuilder()
            .setColor('#9C27B0')
            .setTitle('🌟 Share Your Experience')
            .setDescription('How has your overall beta testing experience been?')
            .addFields({
                name: '😍 Amazing Experience',
                value: 'React with 😍 if you\'re loving the beta!',
                inline: true
            }, {
                name: '😊 Good Experience', 
                value: 'React with 😊 if it\'s been mostly positive',
                inline: true
            }, {
                name: '😐 Mixed Experience',
                value: 'React with 😐 if it\'s been okay',
                inline: true
            }, {
                name: '😕 Poor Experience',
                value: 'React with 😕 if you\'ve had issues',
                inline: true
            }, {
                name: '💬 Additional Feedback',
                value: 'Reply to this message with any additional thoughts!',
                inline: false
            })
            .setFooter({ text: 'Your overall experience feedback is valuable to us!' });

        const expMsg = await message.reply({ embeds: [embed] });
        
        const reactions = ['😍', '😊', '😐', '😕'];
        for (const reaction of reactions) {
            await expMsg.react(reaction);
        }

        this.feedbackManager.setupReactionCollector(expMsg, message.author, { command: 'overall-experience' });
    }

    async showUserBetaStats(message) {
        const userId = message.author.id;
        const userStats = this.feedbackManager.userInteractions.get(userId);
        const userFeedback = Array.from(this.feedbackManager.feedbackData.values())
            .filter(f => f.userId === userId);

        if (!userStats) {
            return message.reply('📊 No beta testing data found for your account.');
        }

        const sessionDuration = Date.now() - userStats.sessionStart;
        const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
        const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));

        const topCommands = userStats.commandHistory
            .reduce((acc, cmd) => {
                acc[cmd.command] = (acc[cmd.command] || 0) + 1;
                return acc;
            }, {});

        const sortedCommands = Object.entries(topCommands)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const embed = new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle('📊 Your Beta Testing Stats')
            .addFields(
                {
                    name: '⏱️ Session Info',
                    value: `**Duration:** ${hours}h ${minutes}m\n**Commands Used:** ${userStats.commands}\n**Feedback Given:** ${userFeedback.length}`,
                    inline: true
                },
                {
                    name: '⚡ Performance',
                    value: `**Avg Response:** ${Math.round(userStats.averageCommandTime)}ms\n**Most Active:** ${sortedCommands[0]?.[0] || 'None'}\n**Success Rate:** ${Math.round((1 - (userFeedback.filter(f => f.experience === 'broken').length / Math.max(userStats.commands, 1))) * 100)}%`,
                    inline: true
                },
                {
                    name: '🏆 Top Commands',
                    value: sortedCommands.length > 0 
                        ? sortedCommands.map(([cmd, count]) => `**${cmd}:** ${count}x`).join('\n')
                        : 'No commands used yet',
                    inline: false
                }
            )
            .setFooter({ text: 'Thank you for being a beta tester!' });

        await message.reply({ embeds: [embed] });
    }

    hasUsedCryptoBefore(userId) {
        const userStats = this.feedbackManager.userInteractions.get(userId);
        if (!userStats) return false;
        
        return userStats.commandHistory.some(cmd => 
            cmd.command.includes('crypto') || cmd.command.includes('wallet')
        );
    }

    hasUsedTiltCheckBefore(userId) {
        const userStats = this.feedbackManager.userInteractions.get(userId);
        if (!userStats) return false;
        
        return userStats.commandHistory.some(cmd => 
            cmd.command.includes('tiltcheck')
        );
    }

    async forwardCommandWithBypass(message, command, args) {
        // Forward any other commands to the main system with beta bypass enabled
        message.betaMode = true;
        message.bypassPayments = true;
        message.bypassRoles = true;

        // This would integrate with your existing command handlers
        console.log(`🧪 Beta command forwarded: ${command} with bypass enabled`);
        
        await message.reply(`🧪 **Beta Mode:** Command \`${command}\` processed with all restrictions bypassed.\n\n*Note: Some commands may require actual implementation in your main bot handlers.*`);
    }

    // Cleanup expired sessions
    startSessionCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [userId, session] of this.betaTesters.entries()) {
                if (now > session.expiresAt) {
                    this.betaTesters.delete(userId);
                    this.activeSessions.delete(userId);
                    console.log(`🧹 Cleaned up expired beta session: ${session.discordTag}`);
                }
            }
        }, 60 * 60 * 1000); // Check every hour
    }
}

// Start the beta testing server
if (require.main === module) {
    const betaServer = new BetaTestingServer();
    betaServer.startSessionCleanup();
    
    console.log('🧪 TrapHouse Beta Testing Server Initialized');
    console.log('📋 Features: Payment bypass, Role bypass, Full crypto access');
    console.log('💰 Requirement: Crypto wallet funding for JustTheTip functionality');
}

module.exports = BetaTestingServer;

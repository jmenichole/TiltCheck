/**
 * Bot Role Configuration System
 * Defines specific responsibilities for each bot in the TrapHouse ecosystem
 */

class BotRoleManager {
    constructor() {
        this.botRoles = {
            // TrapHouse Bot - Enterprise Command Center
            TRAPHOUSE: {
                id: '1354450590813655142',
                name: 'TrapHouse Bot',
                description: 'Enterprise command center for street operations',
                allowedCommands: [
                    '!street',           // Enterprise starter commands
                    '!front',           // Loan system commands
                    '!respect',         // Respect management
                    // Casino trust system (new)
                    '/casino-verify',
                    '/casino-profile', 
                    '/casino-ranking',
                    '/trust-score',
                    '/enhanced-loan'
                ],
                features: [
                    'LOANS',            // Loan management system
                    'RESPECT',          // Respect point system
                    'CASINO_TRUST',     // Casino trust verification
                    'ENTERPRISE_OPS'    // Enterprise operations
                ],
                landingPage: 'https://traphouse.tiltcheck.it.com',
                dashboards: [
                    'enterprise-command-center',
                    'loan-management',
                    'casino-trust-dashboard'
                ]
            },

            // JustTheTip Bot - Financial Operations & Monitoring
            JUSTTHETIP: {
                id: '1373784722718720090', 
                name: 'JustTheTip Bot',
                description: 'Financial operations with tilt monitoring',
                allowedCommands: [
                    '!tip',             // Crypto tipping system
                    '!balance',         // Wallet balance checks
                    '!withdraw',        // Crypto withdrawals
                    '!deposit',         // Crypto deposits
                    '!tiltcheck',       // TiltCheck monitoring
                    '!collectclock',    // Daily bonus tracking
                    '/payment',         // Payment processing
                    '/tilt-check'       // Enhanced tilt monitoring
                ],
                features: [
                    'CRYPTO_PAYMENTS',  // Stripe + Crypto integration
                    'TILTCHECK',        // Tilt monitoring system
                    'COLLECTCLOCK',     // Daily bonus tracking
                    'PAYMENT_PROCESSING' // Financial operations
                ],
                landingPage: 'https://tiltcheck.it.com',
                dashboards: [
                    'tiltcheck-dashboard',
                    'crypto-payment-hub',
                    'collectclock-tracker'
                ]
            },

            // Degens Bot - Gaming Community Hub
            DEGENS: {
                id: '1376113587025739807',
                name: 'Degens Bot', 
                description: 'Gaming community and card game hub',
                allowedCommands: [
                    '!degens',          // Card game commands
                    '!play',            // Game initiation
                    '!leaderboard',     // Gaming leaderboards
                    '!tournament',      // Tournament management
                    '!stats'            // Gaming statistics
                ],
                features: [
                    'DEGENS_CARDS',     // Card game system
                    'TOURNAMENTS',      // Tournament management
                    'GAMING_STATS',     // Statistics tracking
                    'COMMUNITY_HUB'     // Gaming community features
                ],
                landingPage: 'https://degens.tiltcheck.it.com',
                dashboards: [
                    'degens-card-dashboard',
                    'tournament-management',
                    'gaming-leaderboards'
                ]
            }
        };

        this.currentBot = this.detectCurrentBot();
    }

    detectCurrentBot() {
        // Detect which bot is currently running based on environment
        const botToken = process.env.DISCORD_BOT_TOKEN;
        
        if (botToken === process.env.JUSTTHETIP_BOT_TOKEN) {
            return 'JUSTTHETIP';
        } else if (botToken === process.env.DEGENS_BOT_TOKEN) {
            return 'DEGENS';
        } else {
            return 'TRAPHOUSE'; // Default to TrapHouse
        }
    }

    getCurrentBotConfig() {
        return this.botRoles[this.currentBot];
    }

    isCommandAllowed(command) {
        const config = this.getCurrentBotConfig();
        return config.allowedCommands.includes(command);
    }

    isFeatureEnabled(feature) {
        const config = this.getCurrentBotConfig();
        return config.features.includes(feature);
    }

    getUnauthorizedMessage(command) {
        const currentConfig = this.getCurrentBotConfig();
        
        // Find which bot should handle this command
        let correctBot = null;
        for (const [botType, config] of Object.entries(this.botRoles)) {
            if (config.allowedCommands.includes(command)) {
                correctBot = config;
                break;
            }
        }

        if (correctBot) {
            return `❌ **${currentConfig.name}** doesn't handle \`${command}\`\n\n` +
                   `✅ Use **${correctBot.name}** for this command:\n` +
                   `🔗 ${correctBot.landingPage}\n\n` +
                   `*Each bot specializes in different features for optimal performance.*`;
        } else {
            return `❌ Command \`${command}\` not recognized by any bot.`;
        }
    }

    getLandingPageRedirect() {
        const config = this.getCurrentBotConfig();
        return {
            url: config.landingPage,
            dashboards: config.dashboards,
            description: config.description
        };
    }

    getBotRolesList() {
        let rolesList = '🤖 **TrapHouse Ecosystem Bot Roles**\n\n';
        
        for (const [botType, config] of Object.entries(this.botRoles)) {
            const isCurrentBot = botType === this.currentBot;
            rolesList += `${isCurrentBot ? '🟢' : '⚫'} **${config.name}**\n`;
            rolesList += `   📝 ${config.description}\n`;
            rolesList += `   🔗 ${config.landingPage}\n`;
            rolesList += `   🎯 Features: ${config.features.join(', ')}\n\n`;
        }

        rolesList += `*Currently running: **${this.botRoles[this.currentBot].name}***`;
        return rolesList;
    }

    getFeatureRestrictionMessage(feature) {
        const currentConfig = this.getCurrentBotConfig();
        
        // Find which bot handles this feature
        let correctBot = null;
        for (const [botType, config] of Object.entries(this.botRoles)) {
            if (config.features.includes(feature)) {
                correctBot = config;
                break;
            }
        }

        if (correctBot && correctBot.name !== currentConfig.name) {
            return `${feature} is handled by **${correctBot.name}**. Visit: ${correctBot.landingPage}`;
        } else {
            return `${feature} is not available in the current configuration.`;
        }
    }
}

module.exports = BotRoleManager;

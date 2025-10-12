/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

/**
 * 🌐 OAuth Integration for TrapHouse Bot
 * 
 * Integrates OAuth redirect handler with main bot
 */

const OAuthRedirectHandler = require('./oauthRedirect');

class OAuthIntegration {
    constructor(bot, unicodeSafeStorage) {
        this.bot = bot;
        this.storage = unicodeSafeStorage;
        this.oauthHandler = null;
        
        // Make storage available globally for OAuth routes
        global.unicodeSafeStorage = unicodeSafeStorage;
    }
    
    /**
     * Initialize OAuth system
     */
    async initialize() {
        try {
            // Validate required environment variables
            this.validateEnvironment();
            
            // Create OAuth handler
            this.oauthHandler = new OAuthRedirectHandler();
            
            // Start OAuth server
            const port = process.env.OAUTH_PORT || 3001;
            this.oauthHandler.start(port);
            
            // Setup bot commands for OAuth
            this.setupBotCommands();
            
            console.log('✅ OAuth Integration initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ OAuth Integration failed to initialize:', error);
            return false;
        }
    }
    
    /**
     * Validate required environment variables
     */
    validateEnvironment() {
        const required = [
            'DISCORD_CLIENT_ID',
            'DISCORD_CLIENT_SECRET'
        ];
        
        const missing = required.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        
        // Set defaults for optional variables
        process.env.OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/auth/callback';
        process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
        process.env.JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
        
        console.log('🔐 OAuth Environment validated');
    }
    
    /**
     * Setup bot commands for OAuth
     */
    setupBotCommands() {
        // Add login command
        this.bot.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            const content = message.content.toLowerCase();
            
            if (content === '!login' || content === '!auth') {
                await this.handleLoginCommand(message);
            }
            
            if (content === '!dashboard') {
                await this.handleDashboardCommand(message);
            }
            
            if (content === '!payment' && message.content.includes(' ')) {
                await this.handlePaymentCommand(message);
            }
        });
    }
    
    /**
     * Handle login command
     */
    async handleLoginCommand(message) {
        try {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            const loginUrl = `${baseUrl}/auth/discord`;
            
            const embed = {
                color: 0x7289DA,
                title: '🔐 TrapHouse Authentication',
                description: 'Click the link below to authenticate with Discord:',
                fields: [
                    {
                        name: '🔗 Login URL',
                        value: `[Click here to authenticate](${loginUrl})`,
                        inline: false
                    },
                    {
                        name: '📋 Instructions',
                        value: '1. Click the link above\n2. Authorize the application\n3. You\'ll be redirected to your dashboard',
                        inline: false
                    }
                ],
                footer: {
                    text: 'This link is secure and encrypted'
                },
                timestamp: new Date().toISOString()
            };
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Login command error:', error);
            await message.reply('❌ Failed to generate login link. Please try again later.');
        }
    }
    
    /**
     * Handle dashboard command
     */
    async handleDashboardCommand(message) {
        try {
            const userData = await this.storage.getUserData(message.author.id);
            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            
            const embed = {
                color: 0x00FF00,
                title: '📊 TrapHouse Dashboard',
                description: 'Access your personal dashboard:',
                fields: [
                    {
                        name: '👤 Your Stats',
                        value: `Respect: ${userData.respect}\nRank: ${userData.rank}\nLoans: ${userData.loansCount}`,
                        inline: true
                    },
                    {
                        name: '🔗 Dashboard Link',
                        value: `[Open Dashboard](${baseUrl}/auth/discord?scope=identify%20email%20guilds)`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Login required to access full dashboard'
                },
                timestamp: new Date().toISOString()
            };
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Dashboard command error:', error);
            await message.reply('❌ Failed to access dashboard. Please try again later.');
        }
    }
    
    /**
     * Handle payment verification command
     */
    async handlePaymentCommand(message) {
        try {
            const args = message.content.split(' ');
            const paymentId = args[1];
            
            if (!paymentId) {
                await message.reply('❌ Please provide a payment ID: `!payment <payment_id>`');
                return;
            }
            
            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            const verifyUrl = `${baseUrl}/auth/discord?scope=identify%20email`;
            
            const embed = {
                color: 0xFFD700,
                title: '💳 Payment Verification',
                description: 'Verify your payment status:',
                fields: [
                    {
                        name: '🆔 Payment ID',
                        value: paymentId,
                        inline: true
                    },
                    {
                        name: '🔗 Verify Payment',
                        value: `[Click to verify](${verifyUrl})`,
                        inline: false
                    },
                    {
                        name: '📋 Instructions',
                        value: 'After authentication, you can check your payment status in the dashboard.',
                        inline: false
                    }
                ],
                footer: {
                    text: 'Secure payment verification'
                },
                timestamp: new Date().toISOString()
            };
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Payment command error:', error);
            await message.reply('❌ Failed to verify payment. Please try again later.');
        }
    }
    
    /**
     * Generate OAuth URLs for different purposes
     */
    generateOAuthUrl(scope = 'identify email', state = null) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        const url = new URL(`${baseUrl}/auth/discord`);
        
        if (scope) url.searchParams.set('scope', scope);
        if (state) url.searchParams.set('state', state);
        
        return url.toString();
    }
    
    /**
     * Get OAuth status
     */
    getStatus() {
        return {
            initialized: !!this.oauthHandler,
            baseUrl: process.env.BASE_URL || 'http://localhost:3001',
            redirectUri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/auth/callback',
            clientId: process.env.DISCORD_CLIENT_ID || 'Not configured'
        };
    }
    
    /**
     * Shutdown OAuth system
     */
    shutdown() {
        if (this.oauthHandler) {
            this.oauthHandler.stop();
            this.oauthHandler = null;
            console.log('🔐 OAuth Integration shutdown complete');
        }
    }
}

module.exports = OAuthIntegration;

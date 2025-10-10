/**
 * 🌐 Webhook Server for TrapHouse Bot
 * 
 * Handles incoming webhooks from:
 * - GitHub organization events
 * - JustTheTip crypto payments
 * - Stripe payment processing & Connect
 * - CollectClock OAuth callbacks
 * - General webhook endpoints
 */

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const GitHubIntegration = require('./githubIntegration');
const JustTheTipIntegration = require('./justTheTipIntegration');
const CollectClockOAuthHandler = require('./collectClockOAuthHandler');

class WebhookServer {
    constructor(unicodeSafeStorage) {
        this.app = express();
        this.storage = unicodeSafeStorage;
        
        // Initialize integrations
        this.githubIntegration = new GitHubIntegration(unicodeSafeStorage);
        this.justTheTipIntegration = new JustTheTipIntegration(unicodeSafeStorage);
        
        // Initialize CollectClock handler
        try {
            this.collectClockHandler = new CollectClockOAuthHandler();
            console.log('✅ CollectClock OAuth handler initialized');
        } catch (error) {
            console.error('⚠️ CollectClock handler failed to initialize:', error.message);
            this.collectClockHandler = null;
        }
        
        // Initialize Stripe if configured
        this.initializeStripe();
        
        // Initialize the integrations
        this.initializeIntegrations();
        
        this.setupMiddleware();
        this.setupRoutes();
        
        console.log('🌐 Webhook Server initialized with Stripe Connect');
    }

    /**
     * Initialize Stripe Connect integration
     */
    initializeStripe() {
        try {
            if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')) {
                this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
                    apiVersion: '2024-06-20'
                });
                this.stripeEnabled = true;
                console.log('✅ Stripe Connect integration enabled');
            } else {
                this.stripeEnabled = false;
                console.log('⚠️ Stripe Connect disabled - configure STRIPE_SECRET_KEY');
            }
        } catch (error) {
            console.error('❌ Error initializing Stripe:', error);
            this.stripeEnabled = false;
        }
    }
    
    /**
     * Initialize all integrations
     */
    async initializeIntegrations() {
        try {
            // Initialize GitHub integration
            if (this.githubIntegration && typeof this.githubIntegration.initialize === 'function') {
                await this.githubIntegration.initialize();
            }
            
            // Initialize JustTheTip integration
            if (this.justTheTipIntegration && typeof this.justTheTipIntegration.initialize === 'function') {
                await this.justTheTipIntegration.initialize();
            }
            
            console.log('✅ All integrations initialized');
        } catch (error) {
            console.error('❌ Integration initialization failed:', error);
        }
    }
    
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Raw body parser for webhook signature verification
        this.app.use('/webhook', express.raw({ type: 'application/json' }));
        
        // JSON parser for other routes
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-GitHub-Event, X-Hub-Signature-256');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`📡 ${req.method} ${req.path} - ${req.get('User-Agent') || 'Unknown'}`);
            next();
        });
        
        // Security headers
        this.app.use((req, res, next) => {
            res.header('X-Content-Type-Options', 'nosniff');
            res.header('X-Frame-Options', 'DENY');
            res.header('X-XSS-Protection', '1; mode=block');
            next();
        });
    }
    
    /**
     * Setup webhook routes
     */
    setupRoutes() {
        // GitHub webhook endpoint
        this.app.post('/webhook/github', this.handleGitHubWebhook.bind(this));
        
        // JustTheTip webhook endpoint
        this.app.post('/webhook/justthetip', this.handleJustTheTipWebhook.bind(this));
        
        // Ko-fi webhook endpoint
        this.app.post('/webhook/kofi', this.handleKofiWebhook.bind(this));
        
        // Stripe webhook endpoint
        this.app.post('/webhook/stripe', this.handleStripeWebhook.bind(this));
        
        // Stripe Connect API routes
        this.setupStripeConnectRoutes();
        
        // Testing dashboard
        this.app.get('/test', (req, res) => {
            res.sendFile(__dirname + '/public/test-dashboard.html');
        });
        
        // Serve static files from public directory
        this.app.use('/public', require('express').static(__dirname + '/public'));
        
        // CollectClock OAuth callback
        if (this.collectClockHandler) {
            this.app.get('/auth/collectclock/callback', this.handleCollectClockCallback.bind(this));
            this.app.post('/webhook/collectclock', this.handleCollectClockWebhook.bind(this));
        }
        
        // Generic webhook endpoint
        this.app.post('/webhook/generic', this.handleGenericWebhook.bind(this));
        
        // Health check endpoint
        this.app.get('/webhook/health', this.healthCheck.bind(this));
        
        // Webhook status endpoint
        this.app.get('/webhook/status', this.getWebhookStatus.bind(this));
        
        // Test endpoint
        this.app.get('/webhook/test', this.testWebhook.bind(this));
        
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'TrapHouse Bot Webhook Server',
                status: 'active',
                endpoints: [
                    '/webhook/github',
                    '/webhook/justthetip',
                    '/webhook/kofi',
                    '/webhook/stripe',
                    // '/webhook/collectclock',
                    // '/auth/collectclock/callback',
                    '/webhook/health',
                    '/webhook/status'
                ],
                timestamp: new Date().toISOString()
            });
        });
        
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ 
                error: 'Endpoint not found',
                path: req.originalUrl,
                method: req.method
            });
        });
        
        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('❌ Webhook server error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message
            });
        });
    }
    
    /**
     * Handle GitHub webhook events
     */
    async handleGitHubWebhook(req, res) {
        try {
            const signature = req.get('X-Hub-Signature-256');
            const event = req.get('X-GitHub-Event');
            const payload = req.body.toString();
            
            console.log(`🐙 GitHub webhook: ${event}`);
            
            // Process the webhook
            const result = await this.githubIntegration.handleGitHubWebhook(event, payload, signature);
            
            if (result.success) {
                res.status(200).json({ 
                    success: true, 
                    event,
                    message: 'Webhook processed successfully'
                });
            } else {
                res.status(400).json({ 
                    success: false, 
                    error: result.error
                });
            }
            
        } catch (error) {
            console.error('GitHub webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Webhook processing failed'
            });
        }
    }
    
    /**
     * Handle JustTheTip webhook events
     */
    async handleJustTheTipWebhook(req, res) {
        try {
            const signature = req.get('X-JustTheTip-Signature') || req.get('X-Signature');
            const payload = req.body.toString();
            
            console.log('💰 JustTheTip webhook received');
            
            // Process the webhook
            const result = await this.justTheTipIntegration.handleWebhook(payload, signature);
            
            if (result.success) {
                res.status(200).json({ 
                    success: true, 
                    message: 'Crypto payment processed successfully'
                });
            } else {
                res.status(400).json({ 
                    success: false, 
                    error: result.error
                });
            }
            
        } catch (error) {
            console.error('JustTheTip webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Webhook processing failed'
            });
        }
    }

    /**
     * Handle Ko-fi webhook events
     */
    async handleKofiWebhook(req, res) {
        try {
            const payload = req.body;
            const verificationToken = process.env.KOFI_VERIFICATION_TOKEN || '02740ccf-8e39-4dce-b095-995f8d94bdbb';
            
            console.log('☕ Ko-fi webhook received');
            
            // Parse Ko-fi data (Ko-fi sends data as form-encoded)
            let kofiData;
            if (typeof payload === 'string') {
                // If it's form-encoded, parse it
                const urlParams = new URLSearchParams(payload);
                kofiData = JSON.parse(urlParams.get('data') || '{}');
            } else if (payload.data) {
                // If it's already parsed JSON
                kofiData = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
            } else {
                kofiData = payload;
            }
            
            // Verify the verification token
            if (kofiData.verification_token !== verificationToken) {
                console.error('Ko-fi webhook verification failed - invalid token');
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid verification token'
                });
            }
            
            // Process the Ko-fi donation
            const result = await this.processKofiDonation(kofiData);
            
            if (result.success) {
                res.status(200).json({ 
                    success: true, 
                    message: 'Ko-fi donation processed successfully'
                });
            } else {
                res.status(400).json({ 
                    success: false, 
                    error: result.error
                });
            }
            
        } catch (error) {
            console.error('Ko-fi webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Ko-fi webhook processing failed'
            });
        }
    }
    
    /**
     * Handle Stripe webhook events
     */
    async handleStripeWebhook(req, res) {
        try {
            const signature = req.get('Stripe-Signature');
            const payload = req.body.toString();
            
            console.log('💳 Stripe webhook received');
            
            // TODO: Implement Stripe webhook processing
            // const result = await this.stripeIntegration.handleWebhook(payload, signature);
            
            res.status(200).json({ 
                success: true, 
                message: 'Stripe webhook received (processing not implemented yet)'
            });
            
        } catch (error) {
            console.error('Stripe webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Webhook processing failed'
            });
        }
    }

    /**
     * Handle CollectClock OAuth callback
     */
    async handleCollectClockCallback(req, res) {
        try {
            const { code, state } = req.query;

            if (!code) {
                return res.status(400).json({ 
                    error: 'Missing authorization code',
                    redirect: 'https://jmenichole.github.io/CollectClock/?error=missing_code'
                });
            }

            console.log('🕒 CollectClock OAuth callback received');
            
            // Use the CollectClock handler to process OAuth
            const result = await this.collectClockHandler.exchangeCodeForToken(code);
            
            if (!result.access_token) {
                return res.redirect('https://jmenichole.github.io/CollectClock/?error=token_exchange_failed');
            }

            // Get user information
            const userInfo = await this.collectClockHandler.getUserInfo(result.access_token);
            
            // Store user session
            await this.collectClockHandler.storeUserSession(userInfo, result);

            // Redirect back to CollectClock with success
            const redirectUrl = `https://jmenichole.github.io/CollectClock/?success=true&user=${encodeURIComponent(userInfo.username)}&id=${userInfo.id}`;
            
            res.redirect(redirectUrl);

        } catch (error) {
            console.error('CollectClock OAuth callback error:', error);
            res.redirect(`https://jmenichole.github.io/CollectClock/?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
        }
    }

    /**
     * Handle CollectClock webhook events
     */
    async handleCollectClockWebhook(req, res) {
        try {
            const { event, data } = req.body;

            console.log('🕒 CollectClock webhook received:', { event, data });

            // Process different event types
            switch (event) {
                case 'clock_in':
                    await this.collectClockHandler.handleClockInEvent(data);
                    break;
                case 'clock_out':
                    await this.collectClockHandler.handleClockOutEvent(data);
                    break;
                case 'productivity_goal_met':
                    await this.collectClockHandler.handleGoalMetEvent(data);
                    break;
                case 'timesheet_summary':
                    await this.collectClockHandler.handleTimesheetSummary(data);
                    break;
                default:
                    console.log('Unknown CollectClock event:', event);
            }

            res.status(200).json({ 
                success: true, 
                event, 
                processed: true,
                message: 'CollectClock webhook processed successfully'
            });

        } catch (error) {
            console.error('CollectClock webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'CollectClock webhook processing failed'
            });
        }
    }
    
    /**
     * Handle generic webhook events
     */
    async handleGenericWebhook(req, res) {
        try {
            const headers = req.headers;
            const payload = req.body;
            
            console.log('📡 Generic webhook received:', headers);
            
            // Log the webhook for debugging
            await this.logWebhook('generic', headers, payload);
            
            res.status(200).json({ 
                success: true, 
                message: 'Generic webhook received and logged'
            });
            
        } catch (error) {
            console.error('Generic webhook error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Webhook processing failed'
            });
        }
    }
    
    /**
     * Health check endpoint
     */
    async healthCheck(req, res) {
        try {
            const status = {
                server: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                integrations: {
                    github: await this.testGitHubIntegration(),
                    justTheTip: await this.testJustTheTipIntegration(),
                    storage: await this.testStorageIntegration()
                }
            };
            
            res.status(200).json(status);
            
        } catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({ 
                server: 'unhealthy', 
                error: error.message
            });
        }
    }
    
    /**
     * Get webhook status
     */
    async getWebhookStatus(req, res) {
        try {
            const status = {
                server: {
                    uptime: process.uptime(),
                    memory: Math.floor(process.memoryUsage().used / 1024 / 1024) + ' MB',
                    environment: process.env.NODE_ENV || 'development'
                },
                integrations: {
                    github: this.githubIntegration.getStatus(),
                    justTheTip: this.justTheTipIntegration.getStatus()
                },
                webhooks: {
                    github: process.env.GITHUB_WEBHOOK_URL ? 'configured' : 'not configured',
                    justTheTip: process.env.JUSTTHETIP_WEBHOOK_URL ? 'configured' : 'not configured',
                    kofi: process.env.KOFI_VERIFICATION_TOKEN ? 'configured' : 'not configured',
                    stripe: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not configured'
                }
            };
            
            res.status(200).json(status);
            
        } catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({ 
                error: 'Status check failed'
            });
        }
    }
    
    /**
     * Test webhook endpoint
     */
    async testWebhook(req, res) {
        try {
            const testData = {
                message: 'Webhook server test successful',
                timestamp: new Date().toISOString(),
                server: 'TrapHouse Bot Webhook Server',
                integrations: ['GitHub', 'JustTheTip', 'Stripe'],
                status: 'operational'
            };
            
            // Send test notification to Discord
            if (process.env.WEBHOOK_URL) {
                const embed = {
                    color: 0x00FF00,
                    title: '🧪 Webhook Test',
                    description: 'Webhook server test completed successfully!',
                    fields: [
                        {
                            name: '🕐 Timestamp',
                            value: testData.timestamp,
                            inline: true
                        },
                        {
                            name: '⚡ Status',
                            value: 'Operational',
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'TrapHouse Bot Webhook Server'
                    }
                };
                
                await this.sendToDiscord(embed);
            }
            
            res.status(200).json(testData);
            
        } catch (error) {
            console.error('Test webhook error:', error);
            res.status(500).json({ 
                error: 'Test failed'
            });
        }
    }
    
    /**
     * Test GitHub integration
     */
    async testGitHubIntegration() {
        try {
            return {
                status: 'healthy',
                configured: !!process.env.GITHUB_WEBHOOK_URL,
                organization: process.env.GITHUB_ORGANIZATION || 'not set'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    
    /**
     * Test JustTheTip integration
     */
    async testJustTheTipIntegration() {
        try {
            return {
                status: 'healthy',
                configured: !!process.env.JUSTTHETIP_WEBHOOK_URL,
                enabled: process.env.JUSTTHETIP_API_ENABLED === 'true'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    
    /**
     * Test storage integration
     */
    async testStorageIntegration() {
        try {
            await this.storage.loadData('webhook_test', {});
            return { status: 'healthy', type: 'unicode-safe' };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    
    /**
     * Log webhook for debugging
     */
    async logWebhook(type, headers, payload) {
        try {
            const webhookLog = {
                type,
                timestamp: new Date().toISOString(),
                headers: headers,
                payload: typeof payload === 'string' ? payload.substring(0, 1000) : payload,
                size: typeof payload === 'string' ? payload.length : JSON.stringify(payload).length
            };
            
            const logData = await this.storage.loadData('webhook_logs', { logs: [] });
            logData.logs.push(webhookLog);
            
            // Keep only last 100 webhook logs
            if (logData.logs.length > 100) {
                logData.logs = logData.logs.slice(-100);
            }
            
            await this.storage.saveData('webhook_logs', logData);
            
        } catch (error) {
            console.error('Error logging webhook:', error);
        }
    }
    
    /**
     * Send notification to Discord
     */
    async sendToDiscord(embed) {
        try {
            if (!process.env.WEBHOOK_URL) return;
            
            const axios = require('axios');
            await axios.post(process.env.WEBHOOK_URL, { embeds: [embed] });
            
        } catch (error) {
            console.error('Error sending to Discord:', error);
        }
    }

    /**
     * Process Ko-fi donation
     */
    async processKofiDonation(kofiData) {
        try {
            console.log('☕ Processing Ko-fi donation:', {
                type: kofiData.type,
                amount: kofiData.amount,
                currency: kofiData.currency,
                from_name: kofiData.from_name,
                message: kofiData.message?.substring(0, 100)
            });

            // Store donation data
            const donationData = await this.storage.loadData('kofi_donations', { donations: [] });
            
            const donation = {
                id: kofiData.kofi_transaction_id || crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: kofiData.type, // 'Donation', 'Subscription', 'Commission', 'Shop Order'
                amount: kofiData.amount,
                currency: kofiData.currency,
                from_name: kofiData.from_name,
                message: kofiData.message,
                email: kofiData.email,
                url: kofiData.url,
                is_public: kofiData.is_public,
                is_subscription_payment: kofiData.is_subscription_payment,
                is_first_subscription_payment: kofiData.is_first_subscription_payment,
                tier_name: kofiData.tier_name,
                shop_items: kofiData.shop_items,
                shipping: kofiData.shipping,
                raw_data: kofiData
            };

            donationData.donations.push(donation);
            
            // Keep only last 1000 donations
            if (donationData.donations.length > 1000) {
                donationData.donations = donationData.donations.slice(-1000);
            }

            await this.storage.saveData('kofi_donations', donationData);

            // Create Discord notification
            const embed = {
                color: 0x13C3FF, // Ko-fi blue color
                title: '☕ Ko-fi Support Received!',
                description: this.formatKofiMessage(donation),
                thumbnail: {
                    url: 'https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/5cbed8a4ae2b88347c862f77_kofi_s_logo_nolabel.png'
                },
                fields: [
                    {
                        name: '💰 Amount',
                        value: `${donation.currency} ${donation.amount}`,
                        inline: true
                    },
                    {
                        name: '👤 From',
                        value: donation.from_name || 'Anonymous',
                        inline: true
                    },
                    {
                        name: '📝 Type',
                        value: donation.type,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Thank you for supporting TrapHouse Bot! ☕',
                    icon_url: 'https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/5cbed8a4ae2b88347c862f77_kofi_s_logo_nolabel.png'
                },
                timestamp: donation.timestamp
            };

            // Add message field if provided
            if (donation.message && donation.message.trim()) {
                embed.fields.push({
                    name: '💬 Message',
                    value: donation.message.substring(0, 1024), // Discord field limit
                    inline: false
                });
            }

            // Add subscription info if applicable
            if (donation.is_subscription_payment) {
                embed.fields.push({
                    name: '🔄 Subscription',
                    value: donation.is_first_subscription_payment ? 'First payment' : 'Recurring payment',
                    inline: true
                });
                
                if (donation.tier_name) {
                    embed.fields.push({
                        name: '🎯 Tier',
                        value: donation.tier_name,
                        inline: true
                    });
                }
            }

            // Send to Discord
            await this.sendToDiscord(embed);

            // Log the successful processing
            await this.logWebhook('kofi', { 'Ko-fi-Type': donation.type }, donation);

            return {
                success: true,
                donation: donation,
                message: 'Ko-fi donation processed and logged successfully'
            };

        } catch (error) {
            console.error('Error processing Ko-fi donation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Format Ko-fi message for Discord
     */
    formatKofiMessage(donation) {
        let message = '';
        
        if (donation.type === 'Donation') {
            message = `🎉 **${donation.from_name || 'Anonymous'}** bought you a coffee!`;
        } else if (donation.type === 'Subscription') {
            if (donation.is_first_subscription_payment) {
                message = `🌟 **${donation.from_name || 'Anonymous'}** started a monthly subscription!`;
            } else {
                message = `🔄 **${donation.from_name || 'Anonymous'}** renewed their monthly subscription!`;
            }
        } else if (donation.type === 'Commission') {
            message = `🎨 **${donation.from_name || 'Anonymous'}** commissioned work!`;
        } else if (donation.type === 'Shop Order') {
            message = `🛒 **${donation.from_name || 'Anonymous'}** placed a shop order!`;
        } else {
            message = `☕ **${donation.from_name || 'Anonymous'}** sent support via Ko-fi!`;
        }

        return message;
    }
    
    /**
     * Initialize integrations
     */
    async initialize() {
        try {
            console.log('🔧 Initializing webhook integrations...');
            
            // Initialize GitHub integration
            await this.githubIntegration.initialize();
            
            // Initialize JustTheTip integration
            await this.justTheTipIntegration.initialize();
            
            console.log('✅ Webhook integrations initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Webhook integration initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Start the webhook server
     */
    start(port = process.env.WEBHOOK_PORT || 3002) {
        this.server = this.app.listen(port, () => {
            console.log(`🌐 Webhook Server running on port ${port}`);
            console.log(`🔗 GitHub webhook: http://localhost:${port}/webhook/github`);
            console.log(`💰 JustTheTip webhook: http://localhost:${port}/webhook/justthetip`);
            console.log(`☕ Ko-fi webhook: http://localhost:${port}/webhook/kofi`);
            console.log(`💳 Stripe webhook: http://localhost:${port}/webhook/stripe`);
            console.log(`🕒 CollectClock OAuth: http://localhost:${port}/auth/collectclock/callback`);
            console.log(`🕒 CollectClock webhook: http://localhost:${port}/webhook/collectclock`);
            console.log(`📊 Health check: http://localhost:${port}/webhook/health`);
        });
        
        return this.server;
    }

    // ============ STRIPE CONNECT ROUTES ============

    /**
     * Setup Stripe Connect API routes
     */
    setupStripeConnectRoutes() {
        if (!this.stripeEnabled) {
            // Add disabled routes that return helpful errors
            this.app.all('/stripe/*', (req, res) => {
                res.status(503).json({
                    error: 'Stripe Connect not configured',
                    message: 'Please configure STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in your environment'
                });
            });
            return;
        }

        // Account management routes
        this.app.post('/stripe/accounts/create', this.createConnectedAccount.bind(this));
        this.app.post('/stripe/accounts/:accountId/onboard', this.createOnboardingLink.bind(this));
        this.app.get('/stripe/accounts/:accountId/status', this.getAccountStatus.bind(this));

        // Product management routes
        this.app.post('/stripe/products/create', this.createProduct.bind(this));
        this.app.get('/stripe/products', this.getAllProducts.bind(this));

        // Checkout routes
        this.app.post('/stripe/checkout/create', this.createCheckout.bind(this));
        this.app.get('/stripe/success', this.handleCheckoutSuccess.bind(this));

        // Onboarding flow routes
        this.app.get('/stripe/connect/refresh', this.handleOnboardingRefresh.bind(this));
        this.app.get('/stripe/connect/return', this.handleOnboardingReturn.bind(this));

        // Storefront UI routes
        this.app.get('/stripe/marketplace', this.serveMarketplace.bind(this));
        this.app.get('/stripe/seller-dashboard', this.serveSellerDashboard.bind(this));

        console.log('✅ Stripe Connect routes configured');
    }

    /**
     * Create connected account
     */
    async createConnectedAccount(req, res) {
        try {
            const { discordUserId, email, businessInfo } = req.body;

            if (!discordUserId || !email) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'discordUserId and email are required'
                });
            }

            const account = await this.stripe.accounts.create({
                controller: {
                    fees: { payer: 'application' },
                    losses: { payments: 'application' },
                    stripe_dashboard: { type: 'express' }
                },
                metadata: {
                    discord_user_id: discordUserId,
                    platform: 'traphouse_discord_bot'
                },
                email: email
            });

            res.json({
                success: true,
                accountId: account.id,
                email: account.email,
                created: account.created
            });

        } catch (error) {
            console.error('Error creating connected account:', error);
            res.status(500).json({
                error: 'Failed to create account',
                message: error.message
            });
        }
    }

    /**
     * Create onboarding link
     */
    async createOnboardingLink(req, res) {
        try {
            const { accountId } = req.params;

            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/connect/refresh`,
                return_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/connect/return`,
                type: 'account_onboarding'
            });

            res.json({
                success: true,
                onboardingUrl: accountLink.url,
                expiresAt: accountLink.expires_at
            });

        } catch (error) {
            console.error('Error creating onboarding link:', error);
            res.status(500).json({
                error: 'Failed to create onboarding link',
                message: error.message
            });
        }
    }

    /**
     * Get account status
     */
    async getAccountStatus(req, res) {
        try {
            const { accountId } = req.params;
            const account = await this.stripe.accounts.retrieve(accountId);

            res.json({
                success: true,
                account: {
                    id: account.id,
                    detailsSubmitted: account.details_submitted,
                    chargesEnabled: account.charges_enabled,
                    payoutsEnabled: account.payouts_enabled,
                    requirements: account.requirements || {},
                    canAcceptPayments: account.charges_enabled && account.payouts_enabled
                }
            });

        } catch (error) {
            console.error('Error getting account status:', error);
            res.status(500).json({
                error: 'Failed to get account status',
                message: error.message
            });
        }
    }

    /**
     * Create product
     */
    async createProduct(req, res) {
        try {
            const { connectedAccountId, name, description, priceInCents, currency = 'usd' } = req.body;

            if (!connectedAccountId || !name || !priceInCents) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'connectedAccountId, name, and priceInCents are required'
                });
            }

            const product = await this.stripe.products.create({
                name: name,
                description: description,
                default_price_data: {
                    unit_amount: priceInCents,
                    currency: currency
                },
                metadata: {
                    connected_account_id: connectedAccountId,
                    platform: 'traphouse_discord_bot'
                }
            });

            res.json({
                success: true,
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    defaultPriceId: product.default_price
                }
            });

        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                error: 'Failed to create product',
                message: error.message
            });
        }
    }

    /**
     * Get all products (simplified version)
     */
    async getAllProducts(req, res) {
        try {
            // In a real implementation, you'd fetch from your database
            // For now, return a simple response
            res.json({
                success: true,
                products: [],
                message: 'Product listing requires database integration'
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                error: 'Failed to fetch products',
                message: error.message
            });
        }
    }

    /**
     * Create checkout session
     */
    async createCheckout(req, res) {
        try {
            const { productId, connectedAccountId, priceInCents, productName, quantity = 1, testMode } = req.body;

            if (!connectedAccountId || !priceInCents || !productName) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'connectedAccountId, priceInCents, and productName are required'
                });
            }

            const totalAmount = priceInCents * quantity;
            const applicationFeeAmount = Math.round((totalAmount * 0.10) + 30); // 10% + $0.30

            // Development test mode - create session without destination account
            if (testMode === true || process.env.NODE_ENV === 'development') {
                const session = await this.stripe.checkout.sessions.create({
                    line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `${productName} (TEST MODE)`
                            },
                            unit_amount: priceInCents,
                        },
                        quantity: quantity,
                    }],
                    mode: 'payment',
                    success_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/success?session_id={CHECKOUT_SESSION_ID}&test_mode=true`,
                    cancel_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/marketplace`,
                    metadata: {
                        test_mode: 'true',
                        connected_account_id: connectedAccountId,
                        application_fee_amount: applicationFeeAmount.toString()
                    }
                });

                return res.json({
                    success: true,
                    checkoutUrl: session.url,
                    sessionId: session.id,
                    testMode: true,
                    note: 'This is a test checkout without marketplace fees'
                });
            }

            // Production mode - full marketplace checkout with connected account
            const session = await this.stripe.checkout.sessions.create({
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productName
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: quantity,
                }],
                payment_intent_data: {
                    application_fee_amount: Math.round((priceInCents * quantity * 0.10) + 30),
                    transfer_data: {
                        destination: connectedAccountId,
                    }
                },
                mode: 'payment',
                success_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/marketplace`
            });

            res.json({
                success: true,
                checkoutUrl: session.url,
                sessionId: session.id
            });

        } catch (error) {
            console.error('Error creating checkout:', error);
            res.status(500).json({
                error: 'Failed to create checkout',
                message: error.message
            });
        }
    }

    /**
     * Handle checkout success
     */
    async handleCheckoutSuccess(req, res) {
        try {
            const { session_id } = req.query;

            if (!session_id) {
                return res.status(400).send('Missing session ID');
            }

            const session = await this.stripe.checkout.sessions.retrieve(session_id);

            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Successful - TrapHouse Marketplace</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            max-width: 600px;
                            margin: 50px auto;
                            padding: 20px;
                            text-align: center;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        }
                        .container {
                            background: rgba(255, 255, 255, 0.1);
                            padding: 40px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                        }
                        .success-icon { font-size: 64px; margin-bottom: 20px; }
                        .amount { font-size: 32px; font-weight: bold; color: #4CAF50; }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background: #4CAF50;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            margin: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">🎉</div>
                        <h1>Payment Successful!</h1>
                        <div class="amount">$${(session.amount_total / 100).toFixed(2)}</div>
                        <p>Session: ${session_id}</p>
                        <a href="/stripe/marketplace" class="button">Continue Shopping</a>
                    </div>
                </body>
                </html>
            `);

        } catch (error) {
            console.error('Error handling checkout success:', error);
            res.status(500).send('Error processing payment confirmation');
        }
    }

    /**
     * Handle onboarding refresh
     */
    handleOnboardingRefresh(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Onboarding Refresh - TrapHouse</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                        background: #f5f5f5;
                    }
                    .container { background: white; padding: 40px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚠️ Onboarding Incomplete</h1>
                    <p>There was an issue with your account setup. Please try again.</p>
                    <a href="/" style="color: #007cba;">Return to Dashboard</a>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Handle onboarding return
     */
    handleOnboardingReturn(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Onboarding Complete - TrapHouse</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                        background: #f5f5f5;
                    }
                    .container { background: white; padding: 40px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Onboarding Complete!</h1>
                    <p>Your seller account has been successfully set up.</p>
                    <a href="/" style="color: #007cba;">Return to Dashboard</a>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve marketplace UI
     */
    serveMarketplace(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>TrapHouse Marketplace</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    .coming-soon {
                        text-align: center;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 60px;
                        border-radius: 15px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        margin: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏠 TrapHouse Marketplace</h1>
                        <p>Crypto-powered Discord marketplace</p>
                    </div>
                    <div class="coming-soon">
                        <h2>🛍️ Marketplace Coming Soon</h2>
                        <p>The TrapHouse marketplace is being built with Stripe Connect integration.</p>
                        <p>Features include:</p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Multi-vendor marketplace</li>
                            <li>Crypto payment integration</li>
                            <li>Discord user accounts</li>
                            <li>Automated fee collection</li>
                        </ul>
                        <br>
                        <a href="/" class="button">Return to Bot</a>
                        <a href="/stripe/seller-dashboard" class="button">Become a Seller</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve seller dashboard UI
     */
    serveSellerDashboard(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>TrapHouse Seller Dashboard</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .dashboard-section {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 30px;
                        margin-bottom: 30px;
                        border-radius: 15px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        margin: 10px 0;
                        border: none;
                        cursor: pointer;
                    }
                    input, textarea, select {
                        width: 100%;
                        padding: 10px;
                        margin: 5px 0;
                        border: none;
                        border-radius: 5px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                    }
                    input::placeholder, textarea::placeholder {
                        color: rgba(255, 255, 255, 0.7);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🔧 Seller Dashboard</h1>
                    
                    <div class="dashboard-section">
                        <h2>🚀 Get Started</h2>
                        <p>Create your seller account to start selling in the TrapHouse marketplace.</p>
                        <button class="button" onclick="createAccount()">Create Seller Account</button>
                        <div id="status"></div>
                    </div>

                    <div class="dashboard-section">
                        <h2>📦 Create Product</h2>
                        <input type="text" id="productName" placeholder="Product Name" />
                        <textarea id="productDescription" placeholder="Product Description"></textarea>
                        <input type="number" id="productPrice" placeholder="Price in cents (e.g., 1000 = $10.00)" />
                        <button class="button" onclick="createProduct()">Create Product</button>
                    </div>

                    <div class="dashboard-section">
                        <h2>🔗 Quick Links</h2>
                        <a href="/stripe/marketplace" class="button">View Marketplace</a>
                        <a href="/" class="button">Return to Bot</a>
                    </div>
                </div>

                <script>
                    async function createAccount() {
                        try {
                            const response = await fetch('/stripe/accounts/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    discordUserId: 'demo_user_' + Date.now(),
                                    email: 'demo@example.com'
                                })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                document.getElementById('status').innerHTML = 
                                    '<p>✅ Account created! ID: ' + data.accountId + '</p>';
                            } else {
                                document.getElementById('status').innerHTML = 
                                    '<p>❌ Error: ' + data.message + '</p>';
                            }
                        } catch (error) {
                            document.getElementById('status').innerHTML = 
                                '<p>❌ Error: ' + error.message + '</p>';
                        }
                    }

                    async function createProduct() {
                        const name = document.getElementById('productName').value;
                        const description = document.getElementById('productDescription').value;
                        const price = parseInt(document.getElementById('productPrice').value);

                        if (!name || !price) {
                            alert('Please fill in product name and price');
                            return;
                        }

                        try {
                            const response = await fetch('/stripe/products/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    connectedAccountId: 'demo_account',
                                    name: name,
                                    description: description,
                                    priceInCents: price
                                })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                alert('✅ Product created successfully!');
                                // Clear form
                                document.getElementById('productName').value = '';
                                document.getElementById('productDescription').value = '';
                                document.getElementById('productPrice').value = '';
                            } else {
                                alert('❌ Error: ' + data.message);
                            }
                        } catch (error) {
                            alert('❌ Error: ' + error.message);
                        }
                    }
                </script>
            </body>
            </html>
        `);
    }
    
    /**
     * Stop the webhook server
     */
    stop() {
        if (this.server) {
            this.server.close();
            console.log('🌐 Webhook Server stopped');
        }
    }
}

module.exports = WebhookServer;

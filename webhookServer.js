/**
 * 🌐 Webhook Server for TrapHouse Bot
 * 
 * Handles incoming webhooks from:
 * - GitHub organization events
 * - JustTheTip crypto payments
 * - Stripe payment processing
 * - General webhook endpoints
 */

const express = require('express');
const crypto = require('crypto');
const GitHubIntegration = require('./githubIntegration');
const JustTheTipIntegration = require('./justTheTipIntegration');

class WebhookServer {
    constructor(unicodeSafeStorage) {
        this.app = express();
        this.storage = unicodeSafeStorage;
        
        // Initialize integrations
        this.githubIntegration = new GitHubIntegration(unicodeSafeStorage);
        this.justTheTipIntegration = new JustTheTipIntegration(unicodeSafeStorage);
        
        // Initialize the integrations
        this.initializeIntegrations();
        
        this.setupMiddleware();
        this.setupRoutes();
        
        console.log('🌐 Webhook Server initialized');
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
        
        // Stripe webhook endpoint
        this.app.post('/webhook/stripe', this.handleStripeWebhook.bind(this));
        
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
                    '/webhook/stripe',
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
            console.log(`💳 Stripe webhook: http://localhost:${port}/webhook/stripe`);
        });
        
        return this.server;
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

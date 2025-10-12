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

const express = require('express');
const GitHubIntegration = require('./github-integration');

// Initialize Express app for GitHub webhooks
const app = express();
let port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add ngrok-skip-browser-warning header for all responses
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// Initialize GitHub integration (you'll need to pass the Discord client)
let githubIntegration;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'JustTheTip GitHub Integration',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint for ngrok verification
app.get('/test', (req, res) => {
    res.json({
        message: '🎯 TrapHouse Mischief Manager - Tunnel Active!',
        status: 'Ngrok tunnel working perfectly',
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        headers: Object.keys(req.headers)
    });
});

// Ngrok bypass page for browser testing
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎯 TrapHouse Mischief Manager - Ngrok Bypass</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(0,0,0,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                .btn {
                    background: #00ff88;
                    color: #000;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 10px;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn:hover { background: #00cc77; }
                .status { color: #00ff88; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎯 TrapHouse Mischief Manager</h1>
                <div class="status">✅ Ngrok Tunnel Active</div>
                <p>This bypasses the ngrok browser warning for development testing.</p>
                
                <h3>Available Endpoints:</h3>
                <a href="/test" class="btn">🧪 Test API</a>
                <a href="/health" class="btn">💚 Health Check</a>
                <a href="/github/webhook" class="btn">🐙 GitHub Webhook</a>
                <a href="/stripe/webhook" class="btn">💳 Stripe Webhook</a>
                <a href="/github/oauth/authorize" class="btn">🔐 GitHub OAuth</a>
                
                <div style="margin-top: 30px;">
                    <small>Tunnel URL: ${req.get('host')}</small><br>
                    <small>Timestamp: ${new Date().toISOString()}</small>
                </div>
            </div>
            
            <script>
                // Auto-refresh every 30 seconds to keep tunnel active
                setTimeout(() => window.location.reload(), 30000);
            </script>
        </body>
        </html>
    `);
});

// GitHub webhook endpoint
app.post('/github/webhook', async (req, res) => {
    if (!githubIntegration) {
        return res.status(503).json({ error: 'GitHub integration not initialized' });
    }
    
    await githubIntegration.handleWebhook(req, res);
});

// Stripe webhook endpoint for payment processing
app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    console.log('📥 Stripe webhook received');
    
    try {
        // Get payment manager from the Discord client
        const PaymentManager = require('./paymentManager');
        
        // For webhook validation, we need the payment manager instance
        // In a real application, you'd have a better way to access this
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
            return res.status(400).send('Webhook secret not configured');
        }

        // Basic webhook processing
        let event;
        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('⚠️ Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`🎯 Processing Stripe event: ${event.type}`);

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
                
                // In a real implementation, you'd process this payment
                // For now, just log it
                console.log(`💰 Amount: $${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
                console.log(`👤 User: ${paymentIntent.metadata.discord_username || 'Unknown'}`);
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`❌ Payment failed: ${failedPayment.id}`);
                break;
                
            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
        
    } catch (error) {
        console.error('❌ Stripe webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// GitHub OAuth endpoints
app.get('/github/oauth/authorize', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI;
    const scope = process.env.GITHUB_OAUTH_SCOPE || 'repo,workflow,write:repo_hook';
    const state = generateRandomState();
    
    // Store state temporarily (in production, use Redis or database)
    req.session = req.session || {};
    req.session.oauthState = state;
    
    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
    
    res.redirect(authUrl);
});

app.get('/github/oauth/callback', async (req, res) => {
    const { code, state } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!code) {
        return res.status(400).send('OAuth authorization code is required');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
            // Get user info
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });
            
            const userData = await userResponse.json();
            
            res.send(`
                <html>
                    <head>
                        <title>🎯 TrapHouse GitHub OAuth - Success!</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                text-align: center;
                                padding: 50px;
                                margin: 0;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: rgba(0,0,0,0.1);
                                padding: 40px;
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                            }
                            .success { color: #00ff88; font-size: 1.2em; margin: 20px 0; }
                            .token { 
                                background: rgba(0,0,0,0.3); 
                                padding: 15px; 
                                border-radius: 10px; 
                                font-family: monospace; 
                                word-break: break-all;
                                margin: 20px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🎯 GitHub OAuth Successful!</h1>
                            <div class="success">✅ Authorization completed for ${userData.login}</div>
                            <p>Your GitHub account is now connected to TrapHouse Mischief Manager!</p>
                            
                            <h3>📋 Your Access Token:</h3>
                            <div class="token">${tokenData.access_token}</div>
                            
                            <h3>🔐 Account Details:</h3>
                            <p><strong>Username:</strong> ${userData.login}</p>
                            <p><strong>Name:</strong> ${userData.name || 'Not provided'}</p>
                            <p><strong>Public Repos:</strong> ${userData.public_repos}</p>
                            
                            <div style="margin-top: 30px;">
                                <small>⚠️ Save this token securely - you won't see it again!</small><br>
                                <small>🔄 Token expires: ${tokenData.expires_in ? 'In ' + tokenData.expires_in + ' seconds' : 'Never'}</small>
                            </div>
                            
                            <div style="margin-top: 20px;">
                                <a href="/" style="color: #00ff88; text-decoration: none;">← Back to Dashboard</a>
                            </div>
                        </div>
                    </body>
                </html>
            `);
        } else {
            res.status(400).send(`OAuth Error: ${tokenData.error_description || 'Failed to get access token'}`);
        }
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('Internal server error during OAuth callback');
    }
});

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Discord OAuth endpoints for custom bot install flow
app.get('/auth/discord', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;
    const scope = req.query.scope || 'bot identify';
    const state = generateRandomState();
    
    // Store state for CSRF protection
    req.session = req.session || {};
    req.session.discordOAuthState = state;
    
    const authUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
    
    console.log('🔐 Discord OAuth initiated:', { clientId, scope, redirectUri });
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    const { code, state, error } = req.query;
    
    if (error) {
        console.error('Discord OAuth error:', error);
        return res.status(400).send(`
            <html>
                <head>
                    <title>OAuth Error - TrapHouse Bot</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 50px;
                        }
                        .container { 
                            max-width: 500px; 
                            margin: 0 auto; 
                            background: rgba(0,0,0,0.2); 
                            padding: 40px; 
                            border-radius: 15px; 
                        }
                        .error { color: #ff6b6b; font-size: 18px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Authorization Cancelled</h1>
                        <div class="error">User denied bot authorization</div>
                        <p>The bot installation was cancelled. You can try again anytime!</p>
                        <a href="/" style="color: #00ff88;">← Back to Home</a>
                    </div>
                </body>
            </html>
        `);
    }
    
    if (!code) {
        return res.status(400).send('Missing authorization code');
    }
    
    // Verify state (CSRF protection)
    if (req.session?.discordOAuthState !== state) {
        return res.status(400).send('Invalid state parameter');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.OAUTH_REDIRECT_URI,
            }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
            // Get user information
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            });
            
            const userData = await userResponse.json();
            
            console.log('✅ Discord OAuth success:', { userId: userData.id, username: userData.username });
            
            // Success page with custom branding
            res.send(`
                <html>
                    <head>
                        <title>🎉 Bot Added Successfully - TrapHouse Ecosystem</title>
                        <style>
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                text-align: center;
                                padding: 50px;
                                margin: 0;
                            }
                            .container { 
                                max-width: 600px; 
                                margin: 0 auto; 
                                background: rgba(0,0,0,0.1); 
                                padding: 40px; 
                                border-radius: 20px; 
                                backdrop-filter: blur(10px);
                            }
                            .success { color: #00ff88; font-size: 24px; margin: 20px 0; }
                            .btn { 
                                background: #00ff88; 
                                color: #000; 
                                padding: 15px 30px; 
                                border: none; 
                                border-radius: 10px; 
                                font-size: 16px; 
                                font-weight: bold; 
                                cursor: pointer; 
                                margin: 10px; 
                                text-decoration: none; 
                                display: inline-block; 
                            }
                            .btn:hover { background: #00cc77; }
                            .features { text-align: left; margin: 30px 0; }
                            .features ul { list-style: none; padding: 0; }
                            .features li { margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🏠 Welcome to TrapHouse!</h1>
                            <div class="success">✅ Bot successfully added to your server!</div>
                            <p>Hello <strong>${userData.username}</strong>! Your TrapHouse bot is ready to go.</p>
                            
                            <div class="features">
                                <h3>🎉 What's enabled:</h3>
                                <ul>
                                    <li>💰 <strong>Payment System</strong> - Crypto & fiat deposits with real wallets</li>
                                    <li>🎰 <strong>TiltCheck</strong> - Gambling accountability and protection</li>
                                    <li>🏦 <strong>JustTheTip Vaults</strong> - Secure fund management</li>
                                    <li>👑 <strong>Respect System</strong> - Community ranking and rewards</li>
                                    <li>💸 <strong>Lending System</strong> - Community-based loans</li>
                                    <li>📊 <strong>Analytics</strong> - Track your progress and stats</li>
                                </ul>
                            </div>
                            
                            <h3>🚀 Quick Start Commands:</h3>
                            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <code style="color: #00ff88;">!ping</code> - Test bot connection<br>
                                <code style="color: #00ff88;">!help</code> - See all available commands<br>
                                <code style="color: #00ff88;">!deposit crypto ETH</code> - Generate crypto wallet<br>
                                <code style="color: #00ff88;">!wallet</code> - View your wallet status<br>
                                <code style="color: #00ff88;">!tiltcheck</code> - Start accountability tracking
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <a href="https://discord.com/channels/@me" class="btn" target="_blank">🎮 Go to Discord</a>
                                <a href="/" class="btn">🏠 Dashboard</a>
                            </div>
                            
                            <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                                User ID: ${userData.id}<br>
                                Installation: ${new Date().toLocaleString()}
                            </div>
                        </div>
                        
                        <script>
                            // Optional: Auto-redirect to Discord after 10 seconds
                            setTimeout(() => {
                                if (confirm('Ready to start using your TrapHouse bot? Click OK to go to Discord!')) {
                                    window.open('https://discord.com/channels/@me', '_blank');
                                }
                            }, 5000);
                        </script>
                    </body>
                </html>
            `);
        } else {
            res.status(400).send(`OAuth Error: ${tokenData.error_description || 'Failed to get access token'}`);
        }
    } catch (error) {
        console.error('Discord OAuth callback error:', error);
        res.status(500).send('Internal server error during OAuth callback');
    }
});

// GitHub App installation callback
app.get('/github/callback', (req, res) => {
    const { installation_id, setup_action } = req.query;
    
    if (setup_action === 'install') {
        res.send(`
            <html>
                <head>
                    <title>JustTheTip GitHub App - Installation Complete</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 50px;
                            margin: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: rgba(0,0,0,0.1);
                            padding: 40px;
                            border-radius: 20px;
                            backdrop-filter: blur(10px);
                        }
                        h1 { font-size: 2.5em; margin-bottom: 20px; }
                        .success { color: #00ff88; font-size: 1.2em; }
                        .features { text-align: left; margin: 30px 0; }
                        .features li { margin: 10px 0; }
                        .footer { margin-top: 30px; opacity: 0.8; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🚀 JustTheTip GitHub App Installed!</h1>
                        <div class="success">✅ Installation successful!</div>
                        <p>Your repository is now connected to the JustTheTip Discord bot.</p>
                        
                        <div class="features">
                            <h3>🎉 What's enabled:</h3>
                            <ul>
                                <li>📝 Push notifications with degen humor</li>
                                <li>🔀 Pull request status updates</li>
                                <li>🐛 Issue tracking and alerts</li>
                                <li>🚀 Deployment notifications</li>
                                <li>👀 Code review reminders</li>
                            </ul>
                        </div>
                        
                        <p>Head back to your Discord server and check out the updates!</p>
                        
                        <div class="footer">
                            <small>Installation ID: ${installation_id}</small>
                        </div>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send('GitHub App setup cancelled.');
    }
});

// Initialize function to be called with Discord client
function initializeWebhookServer(discordClient) {
    githubIntegration = new GitHubIntegration(discordClient);
    
    // Try to start server with error handling for port conflicts
    const server = app.listen(port, () => {
        console.log(`🐙 GitHub webhook server running on port ${port}`);
        console.log(`📡 Webhook URL: http://localhost:${port}/github/webhook`);
        console.log(`🔗 Callback URL: http://localhost:${port}/github/callback`);
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
            port = port + 1;
            setTimeout(() => initializeWebhookServer(discordClient), 1000);
        } else {
            console.error('❌ Webhook server error:', err);
        }
    });
    
    return githubIntegration;
}

module.exports = { initializeWebhookServer, app };

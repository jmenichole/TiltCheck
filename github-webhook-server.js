const express = require('express');
const GitHubIntegration = require('./github-integration');

// Initialize Express app for GitHub webhooks
const app = express();
const port = process.env.PORT || 3001;

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
    
    app.listen(port, () => {
        console.log(`🐙 GitHub webhook server running on port ${port}`);
        console.log(`📡 Webhook URL: http://localhost:${port}/github/webhook`);
        console.log(`🔗 Callback URL: http://localhost:${port}/github/callback`);
    });
    
    return githubIntegration;
}

module.exports = { initializeWebhookServer, app };

const express = require('express');
const GitHubIntegration = require('./github-integration');

// Initialize Express app for GitHub webhooks
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// GitHub webhook endpoint
app.post('/github/webhook', async (req, res) => {
    if (!githubIntegration) {
        return res.status(503).json({ error: 'GitHub integration not initialized' });
    }
    
    await githubIntegration.handleWebhook(req, res);
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
    
    app.listen(port, () => {
        console.log(`🐙 GitHub webhook server running on port ${port}`);
        console.log(`📡 Webhook URL: http://localhost:${port}/github/webhook`);
        console.log(`🔗 Callback URL: http://localhost:${port}/github/callback`);
    });
    
    return githubIntegration;
}

module.exports = { initializeWebhookServer, app };

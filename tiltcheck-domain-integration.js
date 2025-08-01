#!/usr/bin/env node

/**
 * TiltCheck.it.com Domain Integration & Port Management
 * Comprehensive port forwarding and landing page routing for the entire TrapHouse ecosystem
 */

require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const fs = require('fs');

class TiltCheckDomainIntegration {
    constructor() {
        // Main domain configuration
        this.domain = 'tiltcheck.it.com';
        this.isDevelopment = process.env.NODE_ENV !== 'production';
        this.baseUrl = this.isDevelopment ? 'http://localhost' : `https://${this.domain}`;
        
        // Port configuration for TrapHouse ecosystem
        this.ports = {
            main: 3000,           // Main TrapHouse Bot (tiltcheck.it.com)
            justthetip: 3001,     // JustTheTip Bot (bot.tiltcheck.it.com)
            oauth: 3002,          // OAuth/Auth server (auth.tiltcheck.it.com)
            degens: 3003,         // Degens Card Game (cards.tiltcheck.it.com)
            collectclock: 3004,   // CollectClock (collectclock.tiltcheck.it.com)
            betaTesting: 3335,    // Beta Testing Server (beta.tiltcheck.it.com)
            analytics: 3336,      // Analytics Dashboard (dashboard.tiltcheck.it.com)
            installer: 4000,      // Desktop Installer (installer.tiltcheck.it.com)
            proxy: 8080          // Main reverse proxy
        };

        // Subdomain to port mapping
        this.subdomainRouting = {
            'www': this.ports.main,
            'bot': this.ports.justthetip,
            'auth': this.ports.oauth,
            'cards': this.ports.degens,
            'collectclock': this.ports.collectclock,
            'beta': this.ports.betaTesting,
            'dashboard': this.ports.analytics,
            'installer': this.ports.installer,
            'api': this.ports.main,
            'tilt': this.ports.main,
            'vault': this.ports.justthetip,
            'portal': this.ports.collectclock,
            'admin': this.ports.analytics
        };

        this.app = express();
        this.proxy = httpProxy.createProxyServer({});
        
        this.initializeRouting();
    }

    initializeRouting() {
        console.log(`🌐 Initializing TiltCheck.it.com Domain Integration`);
        console.log(`📍 Base URL: ${this.baseUrl}`);
        console.log(`🔧 Environment: ${this.isDevelopment ? 'Development' : 'Production'}`);

        // Middleware for logging and subdomain detection
        this.app.use((req, res, next) => {
            const subdomain = this.extractSubdomain(req.get('host'));
            req.subdomain = subdomain;
            req.targetPort = this.subdomainRouting[subdomain] || this.ports.main;
            
            console.log(`🔗 ${req.method} ${req.get('host')}${req.url} → Port ${req.targetPort}`);
            next();
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                domain: this.domain,
                timestamp: new Date().toISOString(),
                services: this.getServiceStatus(),
                ports: this.ports
            });
        });

        // Landing page routes
        this.setupLandingPages();
        
        // API routes
        this.setupAPIRoutes();
        
        // Proxy routes for all services
        this.setupProxyRoutes();

        // Error handling
        this.setupErrorHandling();
    }

    extractSubdomain(host) {
        if (!host) return '';
        
        // Remove port if present (for development)
        const cleanHost = host.split(':')[0];
        
        // In development, check for localhost patterns
        if (this.isDevelopment) {
            // Check for subdomain.localhost patterns
            const parts = cleanHost.split('.');
            if (parts.length >= 2 && parts[1] === 'localhost') {
                return parts[0];
            }
            return '';
        }
        
        // Production: extract subdomain from tiltcheck.it.com
        const parts = cleanHost.split('.');
        if (parts.length > 2) {
            return parts[0];
        }
        
        return '';
    }

    setupLandingPages() {
        // Main landing page (tiltcheck.it.com)
        this.app.get('/', (req, res) => {
            if (req.subdomain === '' || req.subdomain === 'www') {
                this.serveMainLandingPage(req, res);
            } else {
                this.proxyToService(req, res);
            }
        });

        // Bot-specific landing pages
        this.app.get('/landing/:botType', (req, res) => {
            this.serveBotLandingPage(req, res, req.params.botType);
        });

        // Installation success pages
        this.app.get('/install/success', (req, res) => {
            this.serveInstallSuccessPage(req, res);
        });

        // Auth callback handling
        this.app.get('/auth/callback', (req, res) => {
            this.handleAuthCallback(req, res);
        });
    }

    setupAPIRoutes() {
        // Main API endpoint
        this.app.use('/api', (req, res) => {
            this.proxyToService(req, res, this.ports.main);
        });

        // Service-specific API routes
        this.app.use('/api/beta', (req, res) => {
            this.proxyToService(req, res, this.ports.betaTesting);
        });

        this.app.use('/api/analytics', (req, res) => {
            this.proxyToService(req, res, this.ports.analytics);
        });

        this.app.use('/api/crypto', (req, res) => {
            this.proxyToService(req, res, this.ports.justthetip);
        });

        this.app.use('/api/collectclock', (req, res) => {
            this.proxyToService(req, res, this.ports.collectclock);
        });
    }

    setupProxyRoutes() {
        // Catch-all proxy route
        this.app.use('*', (req, res) => {
            this.proxyToService(req, res);
        });
    }

    proxyToService(req, res, targetPort = null) {
        const port = targetPort || req.targetPort;
        const target = `http://localhost:${port}`;
        
        // Add headers for service identification
        req.headers['x-forwarded-host'] = req.get('host');
        req.headers['x-forwarded-subdomain'] = req.subdomain;
        req.headers['x-original-url'] = req.url;
        
        this.proxy.web(req, res, { target }, (error) => {
            if (error) {
                console.error(`❌ Proxy error for ${req.get('host')}${req.url} → ${target}:`, error.message);
                this.handleProxyError(req, res, error, port);
            }
        });
    }

    serveMainLandingPage(req, res) {
        const landingPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrapHouse - TiltCheck.it.com | Degen Balance Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 60px 0; }
        .logo { font-size: 3rem; font-weight: bold; color: #00ff88; margin-bottom: 20px; }
        .tagline { font-size: 1.2rem; color: #cccccc; margin-bottom: 40px; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 60px 0; }
        .service-card { 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 15px; 
            padding: 30px; 
            text-align: center;
            border: 1px solid rgba(0, 255, 136, 0.3);
            transition: transform 0.3s ease;
        }
        .service-card:hover { transform: translateY(-5px); }
        .service-icon { font-size: 3rem; margin-bottom: 20px; }
        .service-title { font-size: 1.5rem; color: #00ff88; margin-bottom: 15px; }
        .service-desc { color: #cccccc; margin-bottom: 20px; }
        .btn { 
            background: linear-gradient(45deg, #00ff88, #00cc6a);
            color: #000000;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            transition: opacity 0.3s ease;
        }
        .btn:hover { opacity: 0.8; }
        .status-bar { 
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            margin: 40px 0;
        }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .status-item { text-align: center; }
        .status-label { color: #888; font-size: 0.9rem; }
        .status-value { color: #00ff88; font-size: 1.2rem; font-weight: bold; }
        @media (max-width: 768px) {
            .services-grid { grid-template-columns: 1fr; }
            .logo { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 TrapHouse</div>
            <div class="tagline">TiltCheck.it.com - Enhanced Balance Support for Degen + Mindful Integration</div>
        </div>

        <div class="status-bar">
            <div class="status-grid">
                <div class="status-item">
                    <div class="status-label">Platform Status</div>
                    <div class="status-value">🟢 Online</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Active Services</div>
                    <div class="status-value">${Object.keys(this.subdomainRouting).length}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Domain</div>
                    <div class="status-value">${this.domain}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Environment</div>
                    <div class="status-value">${this.isDevelopment ? 'Development' : 'Production'}</div>
                </div>
            </div>
        </div>

        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon">🎰</div>
                <div class="service-title">TiltCheck Monitor</div>
                <div class="service-desc">Real-time gambling accountability and responsible gaming tools</div>
                <a href="/tilt" class="btn">Launch TiltCheck</a>
            </div>

            <div class="service-card">
                <div class="service-icon">💡</div>
                <div class="service-title">JustTheTip Bot</div>
                <div class="service-desc">Smart crypto recommendations and vault management</div>
                <a href="https://bot.${this.domain}" class="btn">Access Bot</a>
            </div>

            <div class="service-card">
                <div class="service-icon">🕐</div>
                <div class="service-title">CollectClock</div>
                <div class="service-desc">Daily bonus tracking across 15+ crypto platforms</div>
                <a href="https://collectclock.${this.domain}" class="btn">Track Bonuses</a>
            </div>

            <div class="service-card">
                <div class="service-icon">🎮</div>
                <div class="service-title">Degens Cards</div>
                <div class="service-desc">Provably fair card games with crypto integration</div>
                <a href="https://cards.${this.domain}" class="btn">Play Cards</a>
            </div>

            <div class="service-card">
                <div class="service-icon">🧪</div>
                <div class="service-title">Beta Testing</div>
                <div class="service-desc">Desktop-only beta environment with analytics</div>
                <a href="https://beta.${this.domain}" class="btn">Join Beta</a>
            </div>

            <div class="service-card">
                <div class="service-icon">📊</div>
                <div class="service-title">Analytics Dashboard</div>
                <div class="service-desc">Real-time monitoring and performance metrics</div>
                <a href="https://dashboard.${this.domain}" class="btn">View Analytics</a>
            </div>
        </div>

        <div style="text-align: center; margin: 60px 0; color: #888;">
            <p>Powered by TrapHouse Discord Bot Ecosystem</p>
            <p>Degen-Mindful Balance Platform | Enhanced Support System</p>
        </div>
    </div>
</body>
</html>`;
        res.send(landingPageHtml);
    }

    serveBotLandingPage(req, res, botType) {
        const botConfigs = {
            traphouse: {
                name: 'TrapHouse Main Bot',
                description: 'Community respect system and loan management',
                clientId: '1354450590813655142',
                color: '#00ff88'
            },
            justthetip: {
                name: 'JustTheTip Bot',
                description: 'Smart crypto vault recommendations',
                clientId: '1373784722718720090',
                color: '#ffd700'
            },
            degens: {
                name: 'Degens Cards Bot',
                description: 'Provably fair card games',
                clientId: '1376113587025739807',
                color: '#ff6b6b'
            },
            collectclock: {
                name: 'CollectClock Bot',
                description: 'Daily bonus tracking',
                clientId: '1336968746450812928',
                color: '#4ecdc4'
            }
        };

        const config = botConfigs[botType] || botConfigs.traphouse;
        const installUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(this.baseUrl + '/install/success')}&response_type=code`;

        const landingPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name} - Installation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { max-width: 500px; text-align: center; padding: 40px; }
        .bot-icon { font-size: 4rem; margin-bottom: 30px; }
        .bot-name { font-size: 2rem; color: ${config.color}; margin-bottom: 15px; }
        .bot-desc { color: #cccccc; margin-bottom: 40px; font-size: 1.1rem; }
        .install-btn { 
            background: linear-gradient(45deg, ${config.color}, ${config.color}dd);
            color: #000000;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            font-size: 1.1rem;
            transition: transform 0.3s ease;
        }
        .install-btn:hover { transform: translateY(-2px); }
        .back-link { 
            color: #888;
            text-decoration: none;
            margin-top: 30px;
            display: inline-block;
        }
        .back-link:hover { color: #ccc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="bot-icon">🤖</div>
        <div class="bot-name">${config.name}</div>
        <div class="bot-desc">${config.description}</div>
        <a href="${installUrl}" class="install-btn">Add to Discord Server</a>
        <br>
        <a href="/" class="back-link">← Back to TiltCheck.it.com</a>
    </div>
</body>
</html>`;
        res.send(landingPageHtml);
    }

    serveInstallSuccessPage(req, res) {
        const { guild_id, permissions } = req.query;
        
        const successPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation Successful - TrapHouse</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { max-width: 600px; text-align: center; padding: 40px; }
        .success-icon { font-size: 5rem; color: #00ff88; margin-bottom: 30px; }
        .title { font-size: 2.5rem; color: #00ff88; margin-bottom: 20px; }
        .message { color: #cccccc; margin-bottom: 40px; font-size: 1.1rem; line-height: 1.6; }
        .next-steps { 
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
            text-align: left;
        }
        .step { margin-bottom: 15px; }
        .step-number { color: #00ff88; font-weight: bold; }
        .btn { 
            background: linear-gradient(45deg, #00ff88, #00cc6a);
            color: #000000;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            transition: opacity 0.3s ease;
        }
        .btn:hover { opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <div class="title">Bot Successfully Added!</div>
        <div class="message">
            Your TrapHouse bot has been successfully installed to your Discord server.
            ${guild_id ? `<br><br><strong>Server ID:</strong> ${guild_id}` : ''}
        </div>
        
        <div class="next-steps">
            <h3 style="color: #00ff88; margin-bottom: 20px;">Next Steps:</h3>
            <div class="step"><span class="step-number">1.</span> Return to your Discord server</div>
            <div class="step"><span class="step-number">2.</span> Type <code>!help</code> to see available commands</div>
            <div class="step"><span class="step-number">3.</span> Configure bot settings with <code>!setup</code></div>
            <div class="step"><span class="step-number">4.</span> Join our support server for assistance</div>
        </div>

        <a href="/" class="btn">Return to TiltCheck.it.com</a>
        <a href="https://discord.gg/your-support-server" class="btn">Join Support</a>
    </div>
</body>
</html>`;
        res.send(successPageHtml);
    }

    handleAuthCallback(req, res) {
        // Handle Discord OAuth callback
        const { code, state, error } = req.query;
        
        if (error) {
            return res.redirect(`/?error=${encodeURIComponent(error)}`);
        }
        
        if (code) {
            // Process OAuth code and redirect to success page
            res.redirect('/install/success');
        } else {
            res.redirect('/?error=no_code');
        }
    }

    handleProxyError(req, res, error, port) {
        const isServiceDown = error.code === 'ECONNREFUSED';
        
        if (isServiceDown) {
            const serviceDownHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Temporarily Unavailable</title>
    <style>
        body { 
            font-family: Arial, sans-serif;
            background: #1a1a2e;
            color: #ffffff;
            text-align: center;
            padding: 100px 20px;
        }
        .container { max-width: 500px; margin: 0 auto; }
        .icon { font-size: 4rem; margin-bottom: 30px; }
        .title { font-size: 2rem; color: #ff6b6b; margin-bottom: 20px; }
        .message { color: #cccccc; margin-bottom: 30px; }
        .retry-btn { 
            background: #00ff88;
            color: #000000;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <div class="title">Service Temporarily Unavailable</div>
        <div class="message">
            The service on port ${port} is currently down for maintenance.
            <br>Please try again in a few moments.
        </div>
        <a href="/" class="retry-btn">Return to Main Page</a>
    </div>
</body>
</html>`;
            res.status(503).send(serviceDownHtml);
        } else {
            res.status(500).json({
                error: 'Proxy Error',
                message: error.message,
                port: port,
                timestamp: new Date().toISOString()
            });
        }
    }

    getServiceStatus() {
        // This would check if services are running on their respective ports
        const services = {};
        for (const [name, port] of Object.entries(this.ports)) {
            services[name] = {
                port: port,
                url: `${this.baseUrl}:${port}`,
                status: 'unknown' // Would be checked with actual health checks
            };
        }
        return services;
    }

    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error('❌ Application error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        });
    }

    start() {
        const server = this.app.listen(this.ports.proxy, () => {
            console.log(`🚀 TiltCheck Domain Integration running on port ${this.ports.proxy}`);
            console.log(`🌐 Main URL: ${this.baseUrl}:${this.ports.proxy}`);
            console.log(`📋 Available subdomains:`);
            
            for (const [subdomain, port] of Object.entries(this.subdomainRouting)) {
                const url = this.isDevelopment 
                    ? `http://${subdomain}.localhost:${this.ports.proxy}` 
                    : `https://${subdomain}.${this.domain}`;
                console.log(`   • ${subdomain}: ${url} → Port ${port}`);
            }
            
            console.log(`🔗 Landing pages:`);
            console.log(`   • Main: ${this.baseUrl}:${this.ports.proxy}`);
            console.log(`   • Bot installs: ${this.baseUrl}:${this.ports.proxy}/landing/{botType}`);
            console.log(`   • Install success: ${this.baseUrl}:${this.ports.proxy}/install/success`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 Received SIGTERM, shutting down gracefully');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        return server;
    }
}

// Start the integration server if this file is run directly
if (require.main === module) {
    const integration = new TiltCheckDomainIntegration();
    integration.start();
}

module.exports = TiltCheckDomainIntegration;

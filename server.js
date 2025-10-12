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
const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import backend managers with fallbacks for development
let SecurityManager, AuthenticationManager, RedisManager, WebSocketManager;

try {
    const security = require('./backend/security-manager');
    SecurityManager = security.SecurityManager;
    console.log('✅ Security manager loaded');
} catch (error) {
    console.log('⚠️  Security manager not found, using basic security');
}

try {
    const auth = require('./backend/authentication');
    AuthenticationManager = auth.AuthenticationManager;
    console.log('✅ Authentication manager loaded');
} catch (error) {
    console.log('⚠️  Authentication manager not found, using mock auth');
}

class TiltCheckServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.port = process.env.PORT || 3000;
        this.isShuttingDown = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing TiltCheck Server...');
            
            // Setup middleware
            this.setupMiddleware();
            
            // Setup routes
            this.setupRoutes();
            
            // Setup error handling
            this.setupErrorHandling();
            
            console.log('✅ TiltCheck Server initialized successfully');
            
        } catch (error) {
            console.log('⚠️  Server initialization with warnings:', error.message);
            console.log('📱 Continuing in demo mode...');
        }
    }

    setupMiddleware() {
        // Security headers
        this.app.use((req, res, next) => {
            // Security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; img-src 'self' https: data:;");
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            // CORS for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
            
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });
        
        // JSON parsing with limits for security
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

    // Serve static files
        this.app.use(express.static('.'));
        this.app.use('/public', express.static('public'));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });

        console.log('✅ Middleware configured');
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0',
                mode: 'demo'
            });
        });

        // Main application routes - serve existing HTML files
        this.app.get('/', (req, res) => {
            if (fs.existsSync('./index.html')) {
                res.sendFile(path.join(__dirname, 'index.html'));
            } else {
                res.send(this.getDefaultHomePage());
            }
        });

        // API routes for demo
        this.setupApiRoutes();

        console.log('✅ Routes configured');
    }

    setupApiRoutes() {
        // Mock API for demo mode
        this.app.get('/api/players', (req, res) => {
            res.json({
                success: true,
                data: [
                    {
                        id: 'demo_player_1',
                        name: 'Demo Player 1',
                        initialStake: 100,
                        currentStake: 85,
                        riskLevel: 'low',
                        sessionTime: 45,
                        lastActivity: new Date().toISOString()
                    },
                    {
                        id: 'demo_player_2', 
                        name: 'Demo Player 2',
                        initialStake: 200,
                        currentStake: 350,
                        riskLevel: 'medium',
                        sessionTime: 120,
                        lastActivity: new Date().toISOString()
                    }
                ]
            });
        });

        this.app.post('/api/players/track', (req, res) => {
            const { playerId, initialStake } = req.body;
            
            res.json({
                success: true,
                message: 'Player tracking initialized (demo mode)',
                data: {
                    id: playerId || 'demo_player_' + Date.now(),
                    initialStake: initialStake || 0,
                    riskLevel: 'low',
                    sessionTime: 0,
                    created: new Date().toISOString()
                }
            });
        });

        this.app.post('/api/players/:playerId/activity', (req, res) => {
            const { playerId } = req.params;
            const { type, amount, gameType } = req.body;
            
            res.json({
                success: true,
                message: 'Activity recorded (demo mode)',
                data: {
                    playerId,
                    type,
                    amount,
                    gameType,
                    timestamp: new Date().toISOString(),
                    riskScore: Math.random() * 0.5 // Demo risk score
                }
            });
        });

        // Mock auth endpoints
        this.app.post('/api/auth/login', (req, res) => {
            res.json({
                success: true,
                message: 'Demo login successful',
                data: {
                    token: 'demo_token_' + Date.now(),
                    user: {
                        id: 'demo_user',
                        email: req.body.email,
                        name: 'Demo User'
                    }
                }
            });
        });

        this.app.post('/api/auth/register', (req, res) => {
            res.status(201).json({
                success: true,
                message: 'Demo registration successful',
                data: {
                    user: {
                        id: 'demo_user_' + Date.now(),
                        email: req.body.email,
                        name: req.body.name
                    }
                }
            });
        });

        // Mount Beta Signup API (if available)
        try {
            const { createBetaSignupRouter } = require('./beta-signup-api');
            // Basic CORS for API routes in dev/demo
            this.app.use('/api', (req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                if (req.method === 'OPTIONS') return res.sendStatus(204);
                next();
            }, createBetaSignupRouter());
            console.log('✅ Beta signup API mounted');
        } catch (err) {
            console.log('⚠️  Beta signup API not mounted:', err.message);
        }

        // API documentation
        this.app.get('/api-docs', (req, res) => {
            res.json({
                info: {
                    title: 'TiltCheck API',
                    version: '1.0.0',
                    description: 'Responsible gambling monitoring API'
                },
                endpoints: {
                    'GET /health': 'Health check',
                    'GET /api/players': 'Get tracked players',
                    'POST /api/players/track': 'Start tracking a player',
                    'POST /api/players/:id/activity': 'Record player activity',
                    'POST /api/auth/login': 'User login',
                    'POST /api/auth/register': 'User registration'
                },
                demo: 'Running in demo mode - no persistent data'
            });
        });
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                path: req.originalUrl
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Error:', error);

            res.status(error.status || 500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        });

        console.log('✅ Error handling configured');
    }

    getDefaultHomePage() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TiltCheck - Responsible Gambling Monitor</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; margin-bottom: 30px; }
                .status { background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .demo-warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .api-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                .endpoint { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; font-family: monospace; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎯 TiltCheck Server</h1>
                
                <div class="status">
                    <strong>✅ Server Status:</strong> Running in Demo Mode<br>
                    <strong>🕐 Uptime:</strong> ${Math.floor(process.uptime())} seconds<br>
                    <strong>📅 Started:</strong> ${new Date().toISOString()}
                </div>
                
                <div class="demo-warning">
                    <strong>⚠️ Demo Mode:</strong> This server is running without database connections. 
                    All data is simulated and will not persist between restarts.
                </div>
                
                <h2>🚀 Quick Links</h2>
                <ul>
                    <li><a href="/health">Health Check</a> - Server status</li>
                    <li><a href="/api-docs">API Documentation</a> - Available endpoints</li>
                    <li><a href="/api/players">Demo Players</a> - Sample player data</li>
                </ul>
                
                <div class="api-section">
                    <h2>📡 API Endpoints</h2>
                    <div class="endpoint">GET /api/players - List tracked players</div>
                    <div class="endpoint">POST /api/players/track - Start tracking a player</div>
                    <div class="endpoint">POST /api/players/:id/activity - Record player activity</div>
                    <div class="endpoint">POST /api/auth/login - User authentication</div>
                    <div class="endpoint">POST /api/auth/register - User registration</div>
                </div>
                
                <h2>🔧 Next Steps</h2>
                <p>To enable full functionality:</p>
                <ol>
                    <li>Set up PostgreSQL database</li>
                    <li>Configure Redis for caching</li>
                    <li>Add environment variables for production</li>
                    <li>Deploy backend infrastructure components</li>
                </ol>
            </div>
        </body>
        </html>
        `;
    }

    async start() {
        try {
            await this.initialize();

            this.server = this.app.listen(this.port, () => {
                console.log(`\n🌟 TiltCheck Server running on port ${this.port}`);
                console.log(`🏠 Main App: http://localhost:${this.port}/`);
                console.log(`💓 Health: http://localhost:${this.port}/health`);
                console.log(`📚 API Docs: http://localhost:${this.port}/api-docs`);
                console.log(`📊 Demo Players: http://localhost:${this.port}/api/players`);
                console.log(`\n⚠️  Running in DEMO MODE - no database required`);
            });

            // Graceful shutdown
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));

            return this.server;
            
        } catch (error) {
            console.error('❌ Failed to start server:', error);
            throw error;
        }
    }

    async shutdown() {
        if (this.isShuttingDown) return;
        
        console.log('\n📡 Shutting down gracefully...');
        this.isShuttingDown = true;

        this.server?.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    }
}

// Create and start server
const server = new TiltCheckServer();

if (require.main === module) {
    server.start().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

module.exports = { TiltCheckServer, server };
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
 * 🚀 TiltCheck API Server
 * 
 * Main server with comprehensive authentication, profile management,
 * and onboarding APIs
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import API routers
const { router: authRouter } = require('./api/auth');
const profileRouter = require('./api/profile');
const onboardingRouter = require('./api/onboarding');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        features: {
            authentication: true,
            profile: true,
            onboarding: true,
            discord: true,
            wallet: true,
            nft: true
        }
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/onboarding', onboardingRouter);

// Serve main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/profile-setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile-setup.html'));
});

app.get('/onboarding', (req, res) => {
    res.sendFile(path.join(__dirname, 'onboarding.html'));
});

// API documentation
app.get('/api-docs', (req, res) => {
    res.json({
        info: {
            title: 'TiltCheck API',
            version: '2.0.0',
            description: 'Complete authentication, profile, and onboarding API'
        },
        endpoints: {
            authentication: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'GET /api/auth/me': 'Get current user',
                'POST /api/auth/refresh': 'Refresh JWT token',
                'POST /api/auth/logout': 'Logout user'
            },
            profile: {
                'GET /api/profile': 'Get user profile',
                'PUT /api/profile': 'Update user profile',
                'POST /api/profile/permissions': 'Update permissions',
                'POST /api/profile/connect/discord': 'Connect Discord',
                'POST /api/profile/connect/wallet': 'Connect wallet',
                'POST /api/profile/onboarding/complete': 'Complete onboarding',
                'POST /api/profile/nft/mint': 'Record NFT minting'
            },
            onboarding: {
                'GET /api/onboarding/steps': 'Get onboarding steps and progress',
                'GET /api/onboarding/guidance': 'Get AI-powered guidance',
                'POST /api/onboarding/skip-step': 'Skip optional step'
            }
        },
        authentication: 'Bearer token in Authorization header',
        note: 'All authenticated endpoints require: Authorization: Bearer <token>'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 TiltCheck API Server Started');
    console.log('================================');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log('================================');
    console.log('✅ Authentication API: Enabled');
    console.log('✅ Profile Management: Enabled');
    console.log('✅ AI Onboarding: Enabled');
    console.log('✅ Discord Integration: Ready');
    console.log('✅ Wallet Connection: Ready');
    console.log('✅ NFT Minting: Ready');
    console.log('================================');
});

module.exports = app;

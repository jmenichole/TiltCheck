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
 * 🔐 OAuth Redirect Handler for TrapHouse Bot
 * 
 * Handles Discord OAuth2 authentication flows for:
 * - Web-based user authentication
 * - Payment verification
 * - Admin panel access
 * - User dashboard
 */

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');

class OAuthRedirectHandler {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        
        // OAuth configuration
        this.clientId = process.env.DISCORD_CLIENT_ID || process.env.APPLICATION_ID;
        this.clientSecret = process.env.DISCORD_CLIENT_SECRET;
        this.redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/auth/callback';
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        
        // JWT secret for session management
        this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
        
        console.log('🔐 OAuth Redirect Handler initialized');
    }
    
    setupMiddleware() {
        // Session middleware
        this.app.use(session({
            secret: this.jwtSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
        }));
        
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS for web requests
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    
    setupRoutes() {
        // Serve static files
        this.app.use(express.static('public'));
        
        // Main OAuth initiation route
        this.app.get('/auth/discord', this.initiateOAuth.bind(this));
        
        // OAuth callback route
        this.app.get('/auth/callback', this.handleOAuthCallback.bind(this));
        
        // Success page route
        this.app.get('/auth/success', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'auth', 'success.html'));
        });
        
        // User info route (protected)
        this.app.get('/auth/user', this.verifyToken.bind(this), this.getUserInfo.bind(this));
        
        // Payment verification route
        this.app.get('/auth/payment/:paymentId', this.verifyToken.bind(this), this.verifyPayment.bind(this));
        
        // Admin dashboard route
        this.app.get('/admin/dashboard', this.verifyToken.bind(this), this.adminDashboard.bind(this));
        
        // Logout route
        this.app.post('/auth/logout', this.logout.bind(this));
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        
        // Root route
        this.app.get('/', (req, res) => {
            res.redirect('/auth/success');
        });
        
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }
    
    /**
     * Initiate Discord OAuth flow
     */
    async initiateOAuth(req, res) {
        try {
            const state = crypto.randomBytes(16).toString('hex');
            const scope = req.query.scope || 'identify email guilds';
            
            // Store state for CSRF protection
            req.session = req.session || {};
            req.session.oauthState = state;
            
            const authUrl = new URL('https://discord.com/api/oauth2/authorize');
            authUrl.searchParams.set('client_id', this.clientId);
            authUrl.searchParams.set('redirect_uri', this.redirectUri);
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('scope', scope);
            authUrl.searchParams.set('state', state);
            
            console.log('🔐 OAuth initiation:', { state, scope, redirectUri: this.redirectUri });
            
            res.redirect(authUrl.toString());
        } catch (error) {
            console.error('OAuth initiation error:', error);
            res.status(500).json({ error: 'OAuth initiation failed' });
        }
    }
    
    /**
     * Handle OAuth callback from Discord
     */
    async handleOAuthCallback(req, res) {
        try {
            const { code, state, error } = req.query;
            
            if (error) {
                console.error('OAuth error:', error);
                return res.status(400).json({ error: 'OAuth authorization denied' });
            }
            
            if (!code) {
                return res.status(400).json({ error: 'Missing authorization code' });
            }
            
            // Verify state (CSRF protection)
            if (req.session?.oauthState !== state) {
                return res.status(400).json({ error: 'Invalid state parameter' });
            }
            
            // Exchange code for access token
            const tokenData = await this.exchangeCodeForToken(code);
            
            // Get user information
            const userInfo = await this.getDiscordUserInfo(tokenData.access_token);
            
            // Create JWT session token
            const sessionToken = this.createSessionToken(userInfo, tokenData);
            
            // Success redirect with token
            const successUrl = new URL(`${this.baseUrl}/auth/success`);
            successUrl.searchParams.set('token', sessionToken);
            
            console.log('✅ OAuth success:', { userId: userInfo.id, username: userInfo.username });
            
            res.redirect(successUrl.toString());
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.status(500).json({ error: 'OAuth callback failed' });
        }
    }
    
    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code) {
        const tokenUrl = 'https://discord.com/api/oauth2/token';
        
        const data = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri
        });
        
        const response = await axios.post(tokenUrl, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        return response.data;
    }
    
    /**
     * Get Discord user information
     */
    async getDiscordUserInfo(accessToken) {
        const response = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        return response.data;
    }
    
    /**
     * Create JWT session token
     */
    createSessionToken(userInfo, tokenData) {
        const payload = {
            userId: userInfo.id,
            username: userInfo.username,
            discriminator: userInfo.discriminator,
            avatar: userInfo.avatar,
            email: userInfo.email,
            isAdmin: userInfo.id === process.env.ADMIN_USER_ID,
            tokenExpiry: Date.now() + (tokenData.expires_in * 1000),
            iat: Math.floor(Date.now() / 1000)
        };
        
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    }
    
    /**
     * Verify JWT token middleware
     */
    async verifyToken(req, res, next) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            const decoded = jwt.verify(token, this.jwtSecret);
            req.user = decoded;
            
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }
    
    /**
     * Get authenticated user info
     */
    async getUserInfo(req, res) {
        try {
            // Get additional user data from bot storage
            const storage = global.unicodeSafeStorage;
            const userData = await storage?.getUserData(req.user.userId) || {};
            
            res.json({
                discord: {
                    id: req.user.userId,
                    username: req.user.username,
                    discriminator: req.user.discriminator,
                    avatar: req.user.avatar,
                    email: req.user.email
                },
                bot: userData,
                permissions: {
                    isAdmin: req.user.isAdmin
                }
            });
        } catch (error) {
            console.error('Get user info error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    }
    
    /**
     * Verify payment (protected route)
     */
    async verifyPayment(req, res) {
        try {
            const { paymentId } = req.params;
            
            // Get payment data from storage
            const storage = global.unicodeSafeStorage;
            const paymentData = await storage?.getPaymentData() || { payments: [] };
            
            const payment = paymentData.payments.find(p => p.id === paymentId);
            
            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }
            
            // Verify user owns this payment
            if (payment.userId !== req.user.userId && !req.user.isAdmin) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            res.json({ payment, verified: true });
        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({ error: 'Payment verification failed' });
        }
    }
    
    /**
     * Admin dashboard (admin only)
     */
    async adminDashboard(req, res) {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            
            const storage = global.unicodeSafeStorage;
            const integrity = await storage?.validateDataIntegrity() || {};
            
            res.json({
                admin: true,
                dataIntegrity: integrity,
                serverInfo: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Admin dashboard error:', error);
            res.status(500).json({ error: 'Dashboard access failed' });
        }
    }
    
    /**
     * Logout user
     */
    async logout(req, res) {
        try {
            // Clear session data
            req.session = null;
            
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    
    /**
     * Start the OAuth server
     */
    start(port = process.env.PORT || 3001) {
        this.server = this.app.listen(port, () => {
            console.log('🔐 OAuth Redirect Server running on port', port);
            console.log('📍 Redirect URI:', this.redirectUri);
            console.log('🔗 OAuth URL:', `${this.baseUrl}/auth/discord`);
        });
        
        return this.server;
    }
    
    /**
     * Stop the OAuth server
     */
    stop() {
        if (this.server) {
            this.server.close();
            console.log('🔐 OAuth Redirect Server stopped');
        }
    }
}

module.exports = OAuthRedirectHandler;

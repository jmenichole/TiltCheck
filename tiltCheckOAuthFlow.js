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
 * TiltCheck OAuth & Web3 Login Flow
 * 
 * Implements Discord-style OAuth popup flow for casino login tracking.
 * Enables mobile app integration with screen capture capabilities.
 * 
 * This answers the new requirement:
 * "Would web3 browser login or a TiltCheck browser popup (like Discord) 
 * when links are clicked enable mobile app with screen gameplay analysis?"
 * 
 * Answer: YES! This is the exact pattern we need.
 * 
 * Flow:
 * 1. User clicks casino link in TiltCheck mobile app
 * 2. Opens OAuth-style browser popup with TiltCheck wrapper
 * 3. User logs into casino (we track the login event)
 * 4. TiltCheck monitors gameplay via:
 *    - Web3 transaction tracking (for crypto casinos)
 *    - Screen capture API (with user permission)
 *    - Browser storage monitoring (for session data)
 * 5. Real-time RTP analysis happens in background
 * 6. Alerts sent back to mobile app
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Express is optional - only needed for createExpressRouter()
let express;
try {
    express = require('express');
} catch (e) {
    // Express not available, that's okay
}

class TiltCheckOAuthFlow {
    constructor(options = {}) {
        // SECURITY: JWT secret must be explicitly provided or set in environment
        // Never use random bytes as fallback for production secrets
        if (!options.jwtSecret && !process.env.TILTCHECK_JWT_SECRET) {
            console.warn('WARNING: No JWT secret provided. Using temporary random secret. Set TILTCHECK_JWT_SECRET environment variable for production.');
            this.jwtSecret = crypto.randomBytes(32).toString('hex');
        } else {
            this.jwtSecret = options.jwtSecret || process.env.TILTCHECK_JWT_SECRET;
        }
        
        this.oauthSessions = new Map(); // sessionId -> session data
        this.userCasinoSessions = new Map(); // userId -> active casino sessions
        this.mobileAppCallbacks = new Map(); // sessionId -> callback URL
        
        // Supported casino integrations
        this.supportedCasinos = new Map([
            ['stake', {
                name: 'Stake',
                loginUrl: 'https://stake.com/auth/login',
                web3Enabled: true,
                screenCaptureEnabled: true,
                claimedRTP: 0.96
            }],
            ['stake.us', {
                name: 'Stake.us',
                loginUrl: 'https://stake.us/auth/login',
                web3Enabled: false,
                screenCaptureEnabled: true,
                claimedRTP: 0.96
            }],
            ['rollbit', {
                name: 'Rollbit',
                loginUrl: 'https://rollbit.com/login',
                web3Enabled: true,
                screenCaptureEnabled: true,
                claimedRTP: 0.98
            }],
            ['bc.game', {
                name: 'BC.Game',
                loginUrl: 'https://bc.game/login',
                web3Enabled: true,
                screenCaptureEnabled: true,
                claimedRTP: 0.98
            }]
        ]);
        
        console.log('🔐 TiltCheck OAuth Flow initialized');
    }

    /**
     * Initialize OAuth flow for casino login
     * Called from mobile app when user clicks casino link
     * 
     * @param {Object} params - OAuth parameters
     * @param {string} params.userId - TiltCheck user ID
     * @param {string} params.casinoId - Casino identifier
     * @param {string} params.mobileAppCallback - Deep link to return to app
     * @param {string} params.deviceId - Mobile device identifier
     * @param {boolean} params.enableScreenCapture - Request screen capture permission
     * @returns {Object} OAuth session with popup URL
     */
    initiateOAuth(params) {
        const { userId, casinoId, mobileAppCallback, deviceId, enableScreenCapture = true } = params;
        
        // Validate casino
        const casino = this.supportedCasinos.get(casinoId);
        if (!casino) {
            throw new Error(`Casino ${casinoId} not supported`);
        }
        
        // Generate session
        const sessionId = crypto.randomBytes(16).toString('hex');
        const state = crypto.randomBytes(16).toString('hex'); // CSRF protection
        
        const session = {
            sessionId,
            userId,
            casinoId,
            casinoName: casino.name,
            state,
            deviceId,
            enableScreenCapture,
            web3Enabled: casino.web3Enabled,
            claimedRTP: casino.claimedRTP,
            status: 'pending',
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000 // 10 minutes
        };
        
        this.oauthSessions.set(sessionId, session);
        this.mobileAppCallbacks.set(sessionId, mobileAppCallback);
        
        // Generate OAuth popup URL
        const popupUrl = this._generatePopupUrl(sessionId, casinoId, state);
        
        console.log(`🔐 OAuth initiated for user ${userId} -> ${casino.name}`);
        
        return {
            sessionId,
            popupUrl,
            casino: {
                id: casinoId,
                name: casino.name,
                loginUrl: casino.loginUrl
            },
            permissions: {
                screenCapture: enableScreenCapture && casino.screenCaptureEnabled,
                web3: casino.web3Enabled
            },
            expiresIn: 600 // seconds
        };
    }

    /**
     * Generate OAuth popup URL
     * This is what the mobile app opens in browser
     * @private
     */
    _generatePopupUrl(sessionId, casinoId, state) {
        const baseUrl = process.env.TILTCHECK_OAUTH_BASE || 'https://oauth.tiltcheck.it.com';
        const casino = this.supportedCasinos.get(casinoId);
        
        // TiltCheck wrapper URL that will redirect to casino
        return `${baseUrl}/login/${casinoId}?session=${sessionId}&state=${state}&redirect=${encodeURIComponent(casino.loginUrl)}`;
    }

    /**
     * Handle successful casino login
     * Called when TiltCheck detects user has logged into casino
     * 
     * @param {Object} loginData - Login information
     * @param {string} loginData.sessionId - OAuth session ID
     * @param {string} loginData.state - CSRF token
     * @param {Object} loginData.casinoSessionData - Casino session info
     * @param {string} loginData.web3Address - User's Web3 wallet (if applicable)
     * @returns {Object} Session token and redirect
     */
    handleCasinoLogin(loginData) {
        const { sessionId, state, casinoSessionData, web3Address } = loginData;
        
        const session = this.oauthSessions.get(sessionId);
        if (!session) {
            throw new Error('Invalid or expired session');
        }
        
        if (session.state !== state) {
            throw new Error('CSRF token mismatch');
        }
        
        if (session.status !== 'pending') {
            throw new Error('Session already processed');
        }
        
        // Update session
        session.status = 'authenticated';
        session.authenticatedAt = Date.now();
        session.casinoSessionData = casinoSessionData;
        session.web3Address = web3Address;
        
        // Create JWT token for ongoing communication
        const token = this._generateSessionToken(session);
        
        // Track user's active casino session
        if (!this.userCasinoSessions.has(session.userId)) {
            this.userCasinoSessions.set(session.userId, []);
        }
        this.userCasinoSessions.get(session.userId).push({
            casinoId: session.casinoId,
            sessionId,
            token,
            startedAt: Date.now()
        });
        
        console.log(`✅ Casino login successful for user ${session.userId} at ${session.casinoName}`);
        
        // Get mobile app callback
        const mobileCallback = this.mobileAppCallbacks.get(sessionId);
        
        return {
            success: true,
            token,
            sessionId,
            userId: session.userId,
            casino: {
                id: session.casinoId,
                name: session.casinoName
            },
            web3Address,
            // Deep link back to mobile app
            redirectUrl: `${mobileCallback}?token=${token}&session=${sessionId}&status=success`,
            permissions: {
                screenCapture: session.enableScreenCapture,
                web3Monitoring: session.web3Enabled && !!web3Address
            }
        };
    }

    /**
     * Generate JWT session token
     * @private
     */
    _generateSessionToken(session) {
        const payload = {
            userId: session.userId,
            sessionId: session.sessionId,
            casinoId: session.casinoId,
            deviceId: session.deviceId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor((Date.now() + 86400000) / 1000) // 24 hours
        };
        
        return jwt.sign(payload, this.jwtSecret);
    }

    /**
     * Verify session token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token data
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Get active casino sessions for a user
     * @param {string} userId - User identifier
     * @returns {Array} Active sessions
     */
    getUserSessions(userId) {
        return this.userCasinoSessions.get(userId) || [];
    }

    /**
     * End a casino session
     * @param {string} sessionId - Session identifier
     * @returns {Object} Session end confirmation
     */
    endSession(sessionId) {
        const session = this.oauthSessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        
        session.status = 'ended';
        session.endedAt = Date.now();
        
        // Remove from active sessions
        const userSessions = this.userCasinoSessions.get(session.userId) || [];
        const filtered = userSessions.filter(s => s.sessionId !== sessionId);
        this.userCasinoSessions.set(session.userId, filtered);
        
        console.log(`🛑 Session ended: ${sessionId}`);
        
        return {
            sessionId,
            userId: session.userId,
            duration: session.endedAt - session.authenticatedAt,
            status: 'ended'
        };
    }

    /**
     * Clean up expired sessions
     * Should be called periodically
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [sessionId, session] of this.oauthSessions.entries()) {
            if (session.expiresAt < now && session.status === 'pending') {
                this.oauthSessions.delete(sessionId);
                this.mobileAppCallbacks.delete(sessionId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
        }
        
        return cleaned;
    }

    /**
     * Create Express middleware for OAuth endpoints
     * @returns {express.Router} Express router with OAuth routes
     */
    createExpressRouter() {
        if (!express) {
            throw new Error('Express is required for createExpressRouter(). Install with: npm install express');
        }
        const router = express.Router();
        
        // Initiate OAuth flow
        router.post('/oauth/initiate', (req, res) => {
            try {
                const result = this.initiateOAuth(req.body);
                res.json(result);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
        
        // OAuth callback (after casino login)
        router.post('/oauth/callback', (req, res) => {
            try {
                const result = this.handleCasinoLogin(req.body);
                res.json(result);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
        
        // Verify token
        router.post('/oauth/verify', (req, res) => {
            try {
                const decoded = this.verifyToken(req.body.token);
                res.json({ valid: true, data: decoded });
            } catch (error) {
                res.status(401).json({ valid: false, error: error.message });
            }
        });
        
        // Get user sessions
        router.get('/oauth/sessions/:userId', (req, res) => {
            try {
                const sessions = this.getUserSessions(req.params.userId);
                res.json({ sessions });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
        
        // End session
        router.post('/oauth/end-session', (req, res) => {
            try {
                const result = this.endSession(req.body.sessionId);
                res.json(result);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
        
        return router;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiltCheckOAuthFlow;
}

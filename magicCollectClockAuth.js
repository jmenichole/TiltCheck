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
 * Magic.link + CollectClock Unified Authentication System
 * 
 * This answers the new requirement:
 * "Could I use Magic.link authorization and CollectClock repo to keep users logged in
 * with their auth method while maintaining security?"
 * 
 * Answer: YES! This provides:
 * 1. Passwordless authentication via Magic.link
 * 2. Persistent sessions across TiltCheck + CollectClock
 * 3. Secure token management
 * 4. Cross-repository authentication
 * 5. Single sign-on (SSO) experience
 * 
 * Magic.link Benefits:
 * - No passwords to manage (email magic links or social OAuth)
 * - Built-in security (JWT tokens, DID authentication)
 * - Multi-device support
 * - Wallet integration (Web3 ready)
 * - Compliance ready (GDPR, SOC2)
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Magic.link would be imported in production
// const { Magic } = require('@magic-sdk/admin');

class MagicCollectClockAuth {
    constructor(options = {}) {
        // Magic.link configuration
        this.magicSecretKey = options.magicSecretKey || process.env.MAGIC_SECRET_KEY;
        this.magicPublishableKey = options.magicPublishableKey || process.env.MAGIC_PUBLISHABLE_KEY;
        
        // In production, initialize Magic SDK
        // this.magic = new Magic(this.magicSecretKey);
        
        // Session configuration
        this.sessionSecret = options.sessionSecret || process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
        this.sessionDuration = options.sessionDuration || 2592000000; // 30 days default
        
        // User sessions (in production, use Redis or database)
        this.activeSessions = new Map(); // sessionToken -> session data
        this.userSessions = new Map(); // userId -> array of session tokens
        
        // Cross-repository authentication
        this.collectClockSessions = new Map(); // Link TiltCheck sessions to CollectClock
        this.casinoSessions = new Map(); // Track active casino sessions
        
        console.log('🔐 Magic.link + CollectClock Auth initialized');
    }

    /**
     * Authenticate user with Magic.link
     * Called from mobile app or web app during initial login
     * 
     * @param {Object} params - Authentication parameters
     * @param {string} params.magicToken - DID token from Magic.link client SDK
     * @param {string} params.deviceId - Device identifier
     * @param {string} params.deviceType - 'mobile', 'web', or 'desktop'
     * @returns {Object} Unified session with TiltCheck + CollectClock access
     */
    async authenticateWithMagic(params) {
        const { magicToken, deviceId, deviceType = 'web' } = params;
        
        try {
            // Step 1: Verify Magic.link token
            // In production: const metadata = await this.magic.users.getMetadataByToken(magicToken);
            
            // Simulated Magic.link verification
            const metadata = await this._verifyMagicToken(magicToken);
            
            // Step 2: Create unified session
            const session = await this._createUnifiedSession(metadata, deviceId, deviceType);
            
            // Step 3: Link to CollectClock
            await this._linkCollectClockSession(session);
            
            console.log(`✅ User authenticated: ${metadata.email}`);
            
            return {
                success: true,
                sessionToken: session.sessionToken,
                user: {
                    id: session.userId,
                    email: metadata.email,
                    publicAddress: metadata.publicAddress, // Web3 wallet if using Magic Connect
                    phoneNumber: metadata.phoneNumber
                },
                session: {
                    expiresAt: session.expiresAt,
                    deviceId: session.deviceId,
                    deviceType: session.deviceType
                },
                integrations: {
                    tiltCheck: true,
                    collectClock: true,
                    casinoTracking: true
                }
            };
            
        } catch (error) {
            console.error('Magic authentication failed:', error);
            throw new Error('Authentication failed: ' + error.message);
        }
    }

    /**
     * Verify Magic.link DID token
     * @private
     */
    async _verifyMagicToken(magicToken) {
        // In production, this would use Magic SDK:
        // const metadata = await this.magic.users.getMetadataByToken(magicToken);
        
        // For testing/simulation, return mock metadata
        return {
            issuer: 'did:ethr:0x' + crypto.randomBytes(20).toString('hex'),
            publicAddress: '0x' + crypto.randomBytes(20).toString('hex'),
            email: 'user@example.com',
            phoneNumber: null
        };
    }

    /**
     * Create unified session across TiltCheck and CollectClock
     * @private
     */
    async _createUnifiedSession(magicMetadata, deviceId, deviceType) {
        const userId = magicMetadata.issuer; // Use Magic's DID as unique user ID
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        const session = {
            sessionToken,
            userId,
            magicIssuer: magicMetadata.issuer,
            publicAddress: magicMetadata.publicAddress,
            email: magicMetadata.email,
            deviceId,
            deviceType,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.sessionDuration,
            lastActivity: Date.now(),
            
            // Integration flags
            tiltCheckEnabled: true,
            collectClockEnabled: true,
            
            // Linked services
            linkedCasinos: [],
            activeCollectClockSession: null,
            
            // Security
            refreshToken: crypto.randomBytes(32).toString('hex'),
            ipAddress: null, // Set from request
            userAgent: null  // Set from request
        };
        
        // Store session
        this.activeSessions.set(sessionToken, session);
        
        // Track user's sessions
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, []);
        }
        this.userSessions.get(userId).push(sessionToken);
        
        return session;
    }

    /**
     * Link session to CollectClock for cross-repository access
     * @private
     */
    async _linkCollectClockSession(session) {
        // Create CollectClock-compatible session token
        const collectClockToken = this._generateCollectClockToken(session);
        
        session.activeCollectClockSession = collectClockToken;
        
        // Store the link
        this.collectClockSessions.set(session.sessionToken, {
            collectClockToken,
            userId: session.userId,
            linkedAt: Date.now()
        });
        
        console.log(`🔗 Linked to CollectClock: ${session.userId}`);
        
        return collectClockToken;
    }

    /**
     * Generate CollectClock-compatible session token
     * @private
     */
    _generateCollectClockToken(session) {
        // Create JWT token that CollectClock can verify
        const payload = {
            userId: session.userId,
            email: session.email,
            source: 'tiltcheck',
            deviceId: session.deviceId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(session.expiresAt / 1000)
        };
        
        return jwt.sign(payload, this.sessionSecret);
    }

    /**
     * Initialize casino login with persistent authentication
     * User stays logged in via Magic.link, casino session tracked separately
     * 
     * @param {Object} params - Casino login parameters
     * @param {string} params.sessionToken - TiltCheck session token
     * @param {string} params.casinoId - Casino identifier
     * @param {string} params.casinoName - Casino display name
     * @returns {Object} Casino session with tracking enabled
     */
    async initiateCasinoLogin(params) {
        const { sessionToken, casinoId, casinoName } = params;
        
        // Verify TiltCheck session
        const session = this.activeSessions.get(sessionToken);
        if (!session) {
            throw new Error('Invalid session token');
        }
        
        // Check if session expired
        if (Date.now() > session.expiresAt) {
            throw new Error('Session expired. Please re-authenticate.');
        }
        
        // Create casino session
        const casinoSessionId = crypto.randomBytes(16).toString('hex');
        const casinoSession = {
            casinoSessionId,
            userId: session.userId,
            casinoId,
            casinoName,
            tiltCheckSession: sessionToken,
            startedAt: Date.now(),
            lastActivity: Date.now(),
            
            // OAuth state for security
            state: crypto.randomBytes(16).toString('hex'),
            
            // Tracking flags
            rtpTrackingEnabled: true,
            screenCaptureEnabled: true,
            
            // Initial stats
            totalBets: 0,
            totalWagered: 0,
            totalWon: 0
        };
        
        // Store casino session
        this.casinoSessions.set(casinoSessionId, casinoSession);
        
        // Link to user's main session
        session.linkedCasinos.push(casinoSessionId);
        session.lastActivity = Date.now();
        
        console.log(`🎰 Casino session started: ${casinoName} for user ${session.email}`);
        
        return {
            success: true,
            casinoSessionId,
            userId: session.userId,
            oauth: {
                popupUrl: `https://oauth.tiltcheck.it.com/casino/${casinoId}`,
                state: casinoSession.state,
                returnUrl: `tiltcheck://casino/callback/${casinoSessionId}`
            },
            tracking: {
                rtpEnabled: true,
                screenCaptureEnabled: true
            }
        };
    }

    /**
     * Complete casino login callback
     * @param {Object} params - Callback parameters
     * @param {string} params.casinoSessionId - Casino session ID
     * @param {string} params.state - OAuth state token
     * @param {Object} params.casinoAuthData - Casino authentication data
     * @returns {Object} Complete session info
     */
    async completeCasinoLogin(params) {
        const { casinoSessionId, state, casinoAuthData } = params;
        
        const casinoSession = this.casinoSessions.get(casinoSessionId);
        if (!casinoSession) {
            throw new Error('Invalid casino session');
        }
        
        // Verify state token (CSRF protection)
        if (casinoSession.state !== state) {
            throw new Error('State token mismatch');
        }
        
        // Update casino session with auth data
        casinoSession.authenticated = true;
        casinoSession.casinoAuthData = casinoAuthData;
        casinoSession.authenticatedAt = Date.now();
        
        // Get main session
        const mainSession = this.activeSessions.get(casinoSession.tiltCheckSession);
        
        console.log(`✅ Casino login completed: ${casinoSession.casinoName}`);
        
        return {
            success: true,
            userId: mainSession.userId,
            email: mainSession.email,
            casinoSession: {
                id: casinoSessionId,
                casino: casinoSession.casinoName,
                authenticatedAt: casinoSession.authenticatedAt
            },
            persistentAuth: {
                mainSessionValid: true,
                expiresAt: mainSession.expiresAt,
                autoRefresh: true
            }
        };
    }

    /**
     * Verify session token (for API requests)
     * @param {string} sessionToken - Session token to verify
     * @returns {Object} Session data if valid
     */
    verifySession(sessionToken) {
        const session = this.activeSessions.get(sessionToken);
        
        if (!session) {
            throw new Error('Invalid session token');
        }
        
        if (Date.now() > session.expiresAt) {
            throw new Error('Session expired');
        }
        
        // Update last activity
        session.lastActivity = Date.now();
        
        return {
            valid: true,
            userId: session.userId,
            email: session.email,
            expiresAt: session.expiresAt,
            integrations: {
                tiltCheck: session.tiltCheckEnabled,
                collectClock: session.collectClockEnabled
            }
        };
    }

    /**
     * Refresh session (extend expiration)
     * @param {string} sessionToken - Session token to refresh
     * @returns {Object} New session data
     */
    async refreshSession(sessionToken) {
        const session = this.activeSessions.get(sessionToken);
        
        if (!session) {
            throw new Error('Invalid session token');
        }
        
        // Generate new session token for security
        const newSessionToken = crypto.randomBytes(32).toString('hex');
        
        // Update session
        session.sessionToken = newSessionToken;
        session.expiresAt = Date.now() + this.sessionDuration;
        session.lastActivity = Date.now();
        
        // Move to new token
        this.activeSessions.delete(sessionToken);
        this.activeSessions.set(newSessionToken, session);
        
        // Update user's session list
        const userSessions = this.userSessions.get(session.userId);
        const index = userSessions.indexOf(sessionToken);
        if (index > -1) {
            userSessions[index] = newSessionToken;
        }
        
        console.log(`🔄 Session refreshed for user ${session.email}`);
        
        return {
            success: true,
            sessionToken: newSessionToken,
            expiresAt: session.expiresAt
        };
    }

    /**
     * Logout (invalidate session)
     * @param {string} sessionToken - Session token to invalidate
     * @returns {Object} Logout confirmation
     */
    async logout(sessionToken) {
        const session = this.activeSessions.get(sessionToken);
        
        if (!session) {
            return { success: true, message: 'Already logged out' };
        }
        
        // Remove casino sessions
        for (const casinoSessionId of session.linkedCasinos) {
            this.casinoSessions.delete(casinoSessionId);
        }
        
        // Remove CollectClock link
        this.collectClockSessions.delete(sessionToken);
        
        // Remove main session
        this.activeSessions.delete(sessionToken);
        
        // Remove from user's session list
        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
            const index = userSessions.indexOf(sessionToken);
            if (index > -1) {
                userSessions.splice(index, 1);
            }
        }
        
        console.log(`👋 User logged out: ${session.email}`);
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Get user's active sessions (for multi-device management)
     * @param {string} userId - User identifier
     * @returns {Array} Active sessions
     */
    getUserSessions(userId) {
        const sessionTokens = this.userSessions.get(userId) || [];
        const sessions = [];
        
        for (const token of sessionTokens) {
            const session = this.activeSessions.get(token);
            if (session && Date.now() < session.expiresAt) {
                sessions.push({
                    deviceId: session.deviceId,
                    deviceType: session.deviceType,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity,
                    linkedCasinos: session.linkedCasinos.length
                });
            }
        }
        
        return sessions;
    }

    /**
     * Get CollectClock session for cross-repo access
     * @param {string} tiltCheckSessionToken - TiltCheck session token
     * @returns {Object} CollectClock session data
     */
    getCollectClockSession(tiltCheckSessionToken) {
        const link = this.collectClockSessions.get(tiltCheckSessionToken);
        
        if (!link) {
            throw new Error('No CollectClock session linked');
        }
        
        return {
            collectClockToken: link.collectClockToken,
            userId: link.userId,
            linkedAt: link.linkedAt
        };
    }

    /**
     * Update casino session stats (for RTP tracking)
     * @param {string} casinoSessionId - Casino session ID
     * @param {Object} stats - Updated statistics
     */
    updateCasinoStats(casinoSessionId, stats) {
        const casinoSession = this.casinoSessions.get(casinoSessionId);
        
        if (!casinoSession) {
            throw new Error('Casino session not found');
        }
        
        casinoSession.totalBets = stats.totalBets || casinoSession.totalBets;
        casinoSession.totalWagered = stats.totalWagered || casinoSession.totalWagered;
        casinoSession.totalWon = stats.totalWon || casinoSession.totalWon;
        casinoSession.lastActivity = Date.now();
        
        // Also update main session activity
        const mainSession = this.activeSessions.get(casinoSession.tiltCheckSession);
        if (mainSession) {
            mainSession.lastActivity = Date.now();
        }
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MagicCollectClockAuth;
}

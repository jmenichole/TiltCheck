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
 * Casino API Connector Tool
 * Triggers when users login to casinos through CollectClock links
 * Uses Discord user authentication to verify login and retrieve available balances/APIs
 */

const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

class CasinoApiConnector {
    constructor(collectClockIntegration, tiltCheckVerification) {
        this.collectClockIntegration = collectClockIntegration;
        this.tiltCheckVerification = tiltCheckVerification;
        
        // Track user login attempts and API connections
        this.userLoginAttempts = new Map(); // userId -> login attempts
        this.activeConnections = new Map(); // userId -> casino connections
        this.apiDocumentation = new Map(); // casino -> API docs
        
        // Discord authentication integration
        this.discordAuthSessions = new Map(); // userId -> auth session
        
        // Initialize casino API configurations
        this.initializeCasinoAPIs();
        
        console.log('🔌 Casino API Connector initialized');
    }

    /**
     * Initialize casino API configurations with available endpoints
     */
    initializeCasinoAPIs() {
        // Stake US API Configuration
        this.apiDocumentation.set('stake.us', {
            name: 'Stake US',
            baseUrl: 'https://stake.us/api',
            authMethod: 'session_token',
            availableEndpoints: {
                balance: '/user/balance',
                profile: '/user/profile', 
                deposits: '/user/deposits',
                withdrawals: '/user/withdrawals',
                bets: '/user/bets',
                bonuses: '/user/bonuses',
                session: '/user/session',
                verification: '/user/verify'
            },
            loginDetection: {
                cookieName: 'stake_session',
                localStorageKeys: ['stake_user', 'stake_auth'],
                urlPatterns: ['/api/user/login', '/api/auth/session']
            },
            balanceSupport: true,
            realTimeSupport: true,
            rateLimits: { requestsPerMinute: 60 }
        });

        // TrustDice API Configuration  
        this.apiDocumentation.set('trustdice.win', {
            name: 'TrustDice',
            baseUrl: 'https://trustdice.win/api',
            authMethod: 'bearer_token',
            availableEndpoints: {
                balance: '/v1/user/balance',
                profile: '/v1/user/info',
                transactions: '/v1/user/transactions',
                bonuses: '/v1/promotions/user',
                session: '/v1/auth/session'
            },
            loginDetection: {
                cookieName: 'td_session',
                localStorageKeys: ['trustdice_user', 'auth_token'],
                urlPatterns: ['/api/v1/auth/login']
            },
            balanceSupport: true,
            realTimeSupport: false,
            rateLimits: { requestsPerMinute: 30 }
        });

        // MetaWin API Configuration
        this.apiDocumentation.set('metawin.com', {
            name: 'MetaWin',
            baseUrl: 'https://metawin.com/api',
            authMethod: 'jwt_token',
            availableEndpoints: {
                balance: '/user/wallet',
                profile: '/user/profile',
                nfts: '/user/nfts',
                history: '/user/history',
                bonuses: '/promotions/active'
            },
            loginDetection: {
                cookieName: 'metawin_auth',
                localStorageKeys: ['mw_user', 'jwt_token'],
                urlPatterns: ['/api/auth/login', '/api/user/authenticate']
            },
            balanceSupport: true,
            realTimeSupport: true,
            rateLimits: { requestsPerMinute: 45 }
        });

        // Rollbit API Configuration
        this.apiDocumentation.set('rollbit.com', {
            name: 'Rollbit',
            baseUrl: 'https://rollbit.com/api',
            authMethod: 'session_cookie',
            availableEndpoints: {
                balance: '/user/balance',
                profile: '/user/profile',
                inventory: '/user/inventory',
                trades: '/user/trades',
                rewards: '/user/rewards'
            },
            loginDetection: {
                cookieName: 'rb_session',
                localStorageKeys: ['rollbit_user', 'session_data'],
                urlPatterns: ['/api/login', '/api/auth']
            },
            balanceSupport: true,
            realTimeSupport: true,
            rateLimits: { requestsPerMinute: 50 }
        });

        // Add more casinos...
        this.addAdditionalCasinoAPIs();
    }

    /**
     * Add additional casino API configurations
     */
    addAdditionalCasinoAPIs() {
        // DuelBits, BC.Game, Roobet, etc.
        const additionalCasinos = [
            {
                domain: 'duelbits.com',
                name: 'DuelBits',
                baseUrl: 'https://duelbits.com/api',
                endpoints: {
                    balance: '/user/balance',
                    profile: '/user/profile',
                    bets: '/user/bets'
                }
            },
            {
                domain: 'bc.game',
                name: 'BC.Game',
                baseUrl: 'https://bc.game/api',
                endpoints: {
                    balance: '/wallet/balance',
                    profile: '/user/info',
                    sports: '/sports/user'
                }
            }
            // Add more as needed...
        ];

        additionalCasinos.forEach(casino => {
            this.apiDocumentation.set(casino.domain, {
                name: casino.name,
                baseUrl: casino.baseUrl,
                authMethod: 'session_token',
                availableEndpoints: casino.endpoints,
                loginDetection: {
                    cookieName: `${casino.name.toLowerCase()}_session`,
                    localStorageKeys: [`${casino.name.toLowerCase()}_user`],
                    urlPatterns: ['/api/login', '/api/auth']
                },
                balanceSupport: true,
                realTimeSupport: false,
                rateLimits: { requestsPerMinute: 30 }
            });
        });
    }

    /**
     * Handle casino login detection from CollectClock
     */
    async handleCasinoLogin(userId, casinoUrl, loginData) {
        console.log(`🎰 Casino login detected: ${userId} -> ${casinoUrl}`);
        
        try {
            // Extract casino domain
            const domain = new URL(casinoUrl).hostname.replace('www.', '');
            const casinoConfig = this.apiDocumentation.get(domain);
            
            if (!casinoConfig) {
                console.log(`⚠️ No API configuration found for ${domain}`);
                return { success: false, reason: 'unsupported_casino' };
            }

            // Validate Discord user authentication
            const discordAuth = await this.validateDiscordAuthentication(userId);
            if (!discordAuth.valid) {
                console.log(`❌ Discord authentication failed for ${userId}`);
                return { success: false, reason: 'auth_failed' };
            }

            // Attempt to establish API connection
            const apiConnection = await this.establishApiConnection(userId, casinoConfig, loginData);
            
            if (apiConnection.success) {
                // Store active connection
                this.activeConnections.set(`${userId}_${domain}`, {
                    userId,
                    casino: casinoConfig,
                    connectionData: apiConnection,
                    connectedAt: new Date(),
                    lastBalance: null,
                    balanceHistory: []
                });

                // Attempt to retrieve initial balance
                const balanceData = await this.retrieveUserBalance(userId, casinoConfig, apiConnection.credentials);
                
                // Send Discord notification
                await this.sendConnectionNotification(userId, casinoConfig, balanceData);
                
                // Integrate with TiltCheck for monitoring
                if (this.tiltCheckVerification) {
                    await this.integrateWithTiltCheck(userId, casinoConfig, balanceData);
                }

                return {
                    success: true,
                    casino: casinoConfig.name,
                    balance: balanceData,
                    apiDocumentation: casinoConfig.availableEndpoints
                };
            } else {
                return {
                    success: false,
                    reason: 'api_connection_failed',
                    error: apiConnection.error
                };
            }

        } catch (error) {
            console.error('Casino login handling error:', error);
            return { success: false, reason: 'system_error', error: error.message };
        }
    }

    /**
     * Validate Discord user authentication
     */
    async validateDiscordAuthentication(userId) {
        try {
            // Check if user has active Discord session
            const userSession = this.discordAuthSessions.get(userId);
            
            if (!userSession) {
                // Attempt to create new auth session
                const newSession = await this.createDiscordAuthSession(userId);
                if (!newSession.success) {
                    return { valid: false, reason: 'no_session' };
                }
                this.discordAuthSessions.set(userId, newSession);
            }

            // Validate session is still active
            const isValid = await this.verifyDiscordSession(userSession);
            
            return {
                valid: isValid,
                session: userSession,
                permissions: ['read_user', 'read_guilds', 'identify']
            };

        } catch (error) {
            console.error('Discord auth validation error:', error);
            return { valid: false, reason: 'validation_error', error: error.message };
        }
    }

    /**
     * Create Discord authentication session
     */
    async createDiscordAuthSession(userId) {
        try {
            // Generate OAuth link for user authentication
            const oauthUrl = this.generateDiscordOAuthUrl(userId);
            
            return {
                success: true,
                userId,
                oauthUrl,
                sessionId: `discord_${userId}_${Date.now()}`,
                createdAt: new Date(),
                status: 'pending_auth'
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate Discord OAuth URL for user authentication
     */
    generateDiscordOAuthUrl(userId) {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/discord/callback';
        const scopes = 'identify guilds';
        const state = `casino_connector_${userId}_${Date.now()}`;
        
        return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;
    }

    /**
     * Establish API connection with casino
     */
    async establishApiConnection(userId, casinoConfig, loginData) {
        try {
            console.log(`🔌 Attempting API connection to ${casinoConfig.name}`);
            
            // Extract authentication credentials from login data
            const credentials = this.extractAuthCredentials(loginData, casinoConfig);
            
            if (!credentials) {
                return { success: false, error: 'no_credentials_found' };
            }

            // Test API connection with verification endpoint
            const verificationResult = await this.testApiConnection(casinoConfig, credentials);
            
            if (verificationResult.success) {
                return {
                    success: true,
                    credentials,
                    verified: true,
                    userId: verificationResult.userId,
                    permissions: verificationResult.permissions || []
                };
            } else {
                return {
                    success: false,
                    error: 'api_verification_failed',
                    details: verificationResult.error
                };
            }

        } catch (error) {
            console.error('API connection error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Extract authentication credentials from login data
     */
    extractAuthCredentials(loginData, casinoConfig) {
        const credentials = {};
        
        // Extract from cookies
        if (loginData.cookies && casinoConfig.loginDetection.cookieName) {
            const sessionCookie = loginData.cookies.find(c => c.name === casinoConfig.loginDetection.cookieName);
            if (sessionCookie) {
                credentials.sessionToken = sessionCookie.value;
            }
        }

        // Extract from localStorage
        if (loginData.localStorage && casinoConfig.loginDetection.localStorageKeys) {
            casinoConfig.loginDetection.localStorageKeys.forEach(key => {
                if (loginData.localStorage[key]) {
                    credentials[key] = loginData.localStorage[key];
                }
            });
        }

        // Extract from headers
        if (loginData.headers) {
            if (loginData.headers.authorization) {
                credentials.authToken = loginData.headers.authorization;
            }
        }

        return Object.keys(credentials).length > 0 ? credentials : null;
    }

    /**
     * Test API connection with verification
     */
    async testApiConnection(casinoConfig, credentials) {
        try {
            const verificationEndpoint = casinoConfig.availableEndpoints.verification || 
                                       casinoConfig.availableEndpoints.profile ||
                                       casinoConfig.availableEndpoints.session;
            
            if (!verificationEndpoint) {
                return { success: false, error: 'no_verification_endpoint' };
            }

            const headers = this.buildApiHeaders(casinoConfig, credentials);
            const response = await axios.get(`${casinoConfig.baseUrl}${verificationEndpoint}`, {
                headers,
                timeout: 10000
            });

            if (response.status === 200 && response.data) {
                return {
                    success: true,
                    userId: response.data.userId || response.data.id,
                    username: response.data.username || response.data.name,
                    permissions: response.data.permissions || []
                };
            } else {
                return { success: false, error: 'invalid_response' };
            }

        } catch (error) {
            console.error('API test connection error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Build API headers for requests
     */
    buildApiHeaders(casinoConfig, credentials) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TrapHouse-CollectClock-Connector/1.0'
        };

        // Add authentication based on method
        switch (casinoConfig.authMethod) {
            case 'session_token':
                if (credentials.sessionToken) {
                    headers['X-Session-Token'] = credentials.sessionToken;
                }
                break;
            case 'bearer_token':
                if (credentials.authToken) {
                    headers['Authorization'] = `Bearer ${credentials.authToken}`;
                }
                break;
            case 'jwt_token':
                if (credentials.jwt_token) {
                    headers['Authorization'] = `JWT ${credentials.jwt_token}`;
                }
                break;
            case 'session_cookie':
                if (credentials.sessionToken) {
                    headers['Cookie'] = `${casinoConfig.loginDetection.cookieName}=${credentials.sessionToken}`;
                }
                break;
        }

        return headers;
    }

    /**
     * Retrieve user balance from casino API
     */
    async retrieveUserBalance(userId, casinoConfig, credentials) {
        try {
            if (!casinoConfig.balanceSupport || !casinoConfig.availableEndpoints.balance) {
                return { success: false, reason: 'balance_not_supported' };
            }

            const headers = this.buildApiHeaders(casinoConfig, credentials);
            const response = await axios.get(`${casinoConfig.baseUrl}${casinoConfig.availableEndpoints.balance}`, {
                headers,
                timeout: 10000
            });

            if (response.status === 200 && response.data) {
                const balanceData = this.parseBalanceData(response.data, casinoConfig);
                
                // Update stored connection with balance
                const connectionKey = `${userId}_${new URL(casinoConfig.baseUrl).hostname}`;
                const connection = this.activeConnections.get(connectionKey);
                if (connection) {
                    connection.lastBalance = balanceData;
                    connection.balanceHistory.push({
                        balance: balanceData,
                        timestamp: new Date()
                    });
                }

                return {
                    success: true,
                    casino: casinoConfig.name,
                    balances: balanceData.balances,
                    totalUSD: balanceData.totalUSD,
                    currencies: balanceData.currencies,
                    lastUpdated: new Date()
                };
            } else {
                return { success: false, reason: 'invalid_balance_response' };
            }

        } catch (error) {
            console.error('Balance retrieval error:', error);
            return { success: false, reason: 'api_error', error: error.message };
        }
    }

    /**
     * Parse balance data from API response
     */
    parseBalanceData(responseData, casinoConfig) {
        const parsed = {
            balances: {},
            totalUSD: 0,
            currencies: []
        };

        // Common balance parsing patterns
        if (responseData.balance) {
            // Single balance format
            parsed.balances.main = responseData.balance;
            parsed.totalUSD = responseData.balanceUSD || responseData.balance;
        } else if (responseData.balances) {
            // Multiple balances format
            parsed.balances = responseData.balances;
            parsed.totalUSD = responseData.totalUSD || Object.values(responseData.balances).reduce((sum, val) => sum + (val || 0), 0);
        } else if (responseData.wallet) {
            // Wallet format
            parsed.balances = responseData.wallet;
            parsed.totalUSD = responseData.wallet.usd || 0;
        }

        // Extract currency types
        parsed.currencies = Object.keys(parsed.balances);

        return parsed;
    }

    /**
     * Send Discord notification about successful connection
     */
    async sendConnectionNotification(userId, casinoConfig, balanceData) {
        try {
            // Get Discord user
            const user = await this.collectClockIntegration.client.users.fetch(userId);
            if (!user) return;

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🔌 Casino API Connection Established')
                .setDescription(`Successfully connected to **${casinoConfig.name}** via CollectClock!`)
                .addFields(
                    {
                        name: '🎰 Casino',
                        value: casinoConfig.name,
                        inline: true
                    },
                    {
                        name: '🔗 Connection Type',
                        value: `API Integration (${casinoConfig.authMethod})`,
                        inline: true
                    },
                    {
                        name: '💰 Balance Retrieved',
                        value: balanceData.success ? 
                            `${balanceData.currencies.length} currencies\nTotal: $${balanceData.totalUSD?.toFixed(2) || '0.00'}` :
                            'Balance retrieval failed',
                        inline: true
                    },
                    {
                        name: '📋 Available APIs',
                        value: Object.keys(casinoConfig.availableEndpoints).map(api => `• ${api}`).join('\n') || 'None documented',
                        inline: false
                    },
                    {
                        name: '🛡️ TiltCheck Integration',
                        value: 'Real-time balance monitoring enabled\nAutomated tilt detection active',
                        inline: false
                    }
                )
                .setFooter({ text: 'Casino API Connector • Your balances are now monitored for responsible gambling' })
                .setTimestamp();

            await user.send({ embeds: [embed] });

        } catch (error) {
            console.error('Discord notification error:', error);
        }
    }

    /**
     * Integrate with TiltCheck for monitoring
     */
    async integrateWithTiltCheck(userId, casinoConfig, balanceData) {
        if (!this.tiltCheckVerification) return;

        try {
            // Add casino connection to TiltCheck verification
            const verificationData = {
                casinoConnections: [{
                    casino: casinoConfig.name,
                    domain: new URL(casinoConfig.baseUrl).hostname,
                    connectedAt: new Date(),
                    hasApiAccess: true,
                    balanceMonitoring: balanceData.success,
                    initialBalance: balanceData.totalUSD || 0
                }]
            };

            // Update user verification with new casino connection
            await this.tiltCheckVerification.updateUserVerification(userId, verificationData);

            console.log(`🛡️ TiltCheck integration updated for ${userId} - ${casinoConfig.name}`);

        } catch (error) {
            console.error('TiltCheck integration error:', error);
        }
    }

    /**
     * Monitor active connections for balance changes
     */
    startBalanceMonitoring() {
        setInterval(async () => {
            for (const [connectionKey, connection] of this.activeConnections) {
                try {
                    const newBalance = await this.retrieveUserBalance(
                        connection.userId, 
                        connection.casino, 
                        connection.connectionData.credentials
                    );

                    if (newBalance.success && connection.lastBalance) {
                        const balanceChange = newBalance.totalUSD - connection.lastBalance.totalUSD;
                        
                        if (Math.abs(balanceChange) > 10) { // Significant balance change
                            await this.handleBalanceChange(connection, balanceChange, newBalance);
                        }
                    }

                } catch (error) {
                    console.error(`Balance monitoring error for ${connectionKey}:`, error);
                }
            }
        }, 60000); // Check every minute

        console.log('🔄 Balance monitoring started for active connections');
    }

    /**
     * Handle significant balance changes
     */
    async handleBalanceChange(connection, balanceChange, newBalance) {
        try {
            // Send notification about balance change
            const user = await this.collectClockIntegration.client.users.fetch(connection.userId);
            if (!user) return;

            const changeType = balanceChange > 0 ? 'increase' : 'decrease';
            const changeEmoji = balanceChange > 0 ? '📈' : '📉';

            const embed = new EmbedBuilder()
                .setColor(balanceChange > 0 ? '#00ff88' : '#ff4444')
                .setTitle(`${changeEmoji} Balance Change Detected`)
                .setDescription(`Significant balance ${changeType} detected on **${connection.casino.name}**`)
                .addFields(
                    {
                        name: 'Balance Change',
                        value: `${balanceChange > 0 ? '+' : ''}$${balanceChange.toFixed(2)}`,
                        inline: true
                    },
                    {
                        name: 'New Balance',
                        value: `$${newBalance.totalUSD.toFixed(2)}`,
                        inline: true
                    },
                    {
                        name: 'Timestamp',
                        value: new Date().toLocaleString(),
                        inline: true
                    }
                )
                .setFooter({ text: 'Casino API Connector • Real-time balance monitoring' })
                .setTimestamp();

            await user.send({ embeds: [embed] });

            // Alert TiltCheck if significant loss
            if (balanceChange < -100) {
                await this.alertTiltCheckSignificantLoss(connection, balanceChange);
            }

        } catch (error) {
            console.error('Balance change handling error:', error);
        }
    }

    /**
     * Alert TiltCheck about significant losses
     */
    async alertTiltCheckSignificantLoss(connection, lossAmount) {
        if (!this.tiltCheckVerification) return;

        try {
            const alertData = {
                userId: connection.userId,
                casino: connection.casino.name,
                lossAmount: Math.abs(lossAmount),
                timestamp: new Date(),
                alertType: 'significant_loss',
                severity: lossAmount < -500 ? 'critical' : 'high'
            };

            // This would trigger TiltCheck intervention
            console.log(`🚨 TiltCheck Alert: Significant loss detected for ${connection.userId} - $${Math.abs(lossAmount)}`);
            
            // In full implementation, this would call TiltCheck methods

        } catch (error) {
            console.error('TiltCheck alert error:', error);
        }
    }

    /**
     * Get active connections for a user
     */
    getUserConnections(userId) {
        const connections = [];
        for (const [key, connection] of this.activeConnections) {
            if (connection.userId === userId) {
                connections.push({
                    casino: connection.casino.name,
                    connectedAt: connection.connectedAt,
                    lastBalance: connection.lastBalance,
                    status: 'active'
                });
            }
        }
        return connections;
    }

    /**
     * Get API documentation for a casino
     */
    getCasinoApiDoc(casinoDomain) {
        return this.apiDocumentation.get(casinoDomain) || null;
    }

    /**
     * Verify Discord session (stub)
     */
    async verifyDiscordSession(session) {
        // In full implementation, this would verify the Discord OAuth session
        return session && session.status === 'authenticated';
    }

    /**
     * Initialize the connector with CollectClock
     */
    initialize() {
        // Start balance monitoring
        this.startBalanceMonitoring();
        
        // Set up event listeners for CollectClock login events
        if (this.collectClockIntegration) {
            this.collectClockIntegration.on('casinoLogin', this.handleCasinoLogin.bind(this));
        }

        console.log('✅ Casino API Connector fully initialized');
    }
}

module.exports = CasinoApiConnector;

/**
 * TiltCheck Verification System
 * Comprehensive user verification and tracking for accurate tilt detection
 * Integrates wallet verification, Discord sessions, stake tracking, and casino data
 */

const crypto = require('crypto');
const axios = require('axios');

class TiltCheckVerificationSystem {
    constructor() {
        this.verifiedUsers = new Map(); // userId -> verification data
        this.walletTracker = new Map(); // wallet -> user associations
        this.sessionTracker = new Map(); // session -> user data
        this.casinoIntegrations = new Map(); // casino -> integration config
        this.bonusTracker = new Map(); // user -> bonus collection data
        
        // Initialize casino integrations
        this.initializeCasinoIntegrations();
        
        // Verification methods
        this.verificationMethods = {
            WALLET: 'wallet_verification',
            DISCORD: 'discord_session',
            STAKE: 'stake_account',
            CASINO_COOKIES: 'casino_cookies',
            LOCAL_STORAGE: 'local_storage',
            BROWSER_FINGERPRINT: 'browser_fingerprint'
        };
        
        // Tilt pattern detection enhanced with verification data
        this.tiltPatterns = {
            WALLET_BALANCE_CHASE: 'wallet_balance_chasing',
            MULTI_CASINO_VELOCITY: 'multi_casino_rapid_betting',
            BONUS_ABUSE_PATTERN: 'bonus_hunting_tilt',
            STAKE_ESCALATION_VERIFIED: 'verified_stake_escalation',
            CROSS_PLATFORM_CORRELATION: 'cross_platform_tilt_pattern'
        };
    }

    // Initialize casino integrations for bonus tracking
    initializeCasinoIntegrations() {
        this.casinoIntegrations.set('stake.us', {
            name: 'Stake US',
            apiEndpoint: process.env.STAKE_US_API || 'https://stake.us/api',
            cookieTracking: true,
            bonusEndpoints: ['/api/user/bonuses', '/api/promotions/daily'],
            sessionValidation: true,
            features: ['bonus_tracking', 'session_verification', 'balance_monitoring']
        });

        this.casinoIntegrations.set('trustdice', {
            name: 'TrustDice',
            apiEndpoint: 'https://trustdice.win/api',
            cookieTracking: true,
            bonusEndpoints: ['/api/bonus/daily', '/api/user/rewards'],
            sessionValidation: true,
            features: ['bonus_tracking', 'dice_pattern_analysis']
        });

        this.casinoIntegrations.set('metawin', {
            name: 'MetaWin',
            apiEndpoint: 'https://metawin.com/api',
            cookieTracking: true,
            bonusEndpoints: ['/api/daily-bonus', '/api/user/promotions'],
            sessionValidation: false,
            features: ['bonus_tracking', 'crypto_integration']
        });

        this.casinoIntegrations.set('rollbit', {
            name: 'Rollbit',
            apiEndpoint: 'https://rollbit.com/api',
            cookieTracking: true,
            bonusEndpoints: ['/api/bonus/claim', '/api/rewards'],
            sessionValidation: true,
            features: ['bonus_tracking', 'nft_integration', 'sports_betting']
        });

        this.casinoIntegrations.set('duelbits', {
            name: 'DuelBits',
            apiEndpoint: 'https://duelbits.com/api',
            cookieTracking: true,
            bonusEndpoints: ['/api/daily', '/api/user/bonuses'],
            sessionValidation: true,
            features: ['bonus_tracking', 'pvp_analysis']
        });

        // Add more casino integrations
        this.addAdditionalCasinos();
    }

    addAdditionalCasinos() {
        const additionalCasinos = [
            'bc.game', 'roobet', 'cloudbet', 'bitcasino', 'fortunejack',
            'nitrogen', 'betfury', 'wazamba', 'bitstarz', 'kingbilly',
            'sportsbet.io', 'fairspin', 'bitslot', 'casinofair'
        ];

        additionalCasinos.forEach(casino => {
            this.casinoIntegrations.set(casino, {
                name: casino.charAt(0).toUpperCase() + casino.slice(1),
                apiEndpoint: `https://${casino}/api`,
                cookieTracking: true,
                bonusEndpoints: ['/api/bonus', '/api/daily'],
                sessionValidation: false,
                features: ['bonus_tracking']
            });
        });
    }

    // Comprehensive user verification
    async verifyUser(userId, verificationData) {
        const verification = {
            userId,
            timestamp: new Date(),
            methods: {},
            trustScore: 0,
            riskFactors: [],
            verifiedWallets: [],
            connectedCasinos: [],
            sessionHistory: []
        };

        // Wallet verification
        if (verificationData.wallets) {
            verification.methods.wallet = await this.verifyWallets(userId, verificationData.wallets);
            verification.verifiedWallets = verification.methods.wallet.verified;
        }

        // Discord session verification
        if (verificationData.discordSession) {
            verification.methods.discord = await this.verifyDiscordSession(userId, verificationData.discordSession);
        }

        // Stake account verification
        if (verificationData.stakeAccount) {
            verification.methods.stake = await this.verifyStakeAccount(userId, verificationData.stakeAccount);
        }

        // Casino cookie verification
        if (verificationData.casinoCookies) {
            verification.methods.cookies = await this.verifyCasinoCookies(userId, verificationData.casinoCookies);
            verification.connectedCasinos = verification.methods.cookies.casinos;
        }

        // Local storage verification
        if (verificationData.localStorage) {
            verification.methods.localStorage = await this.verifyLocalStorage(userId, verificationData.localStorage);
        }

        // Browser fingerprint verification
        if (verificationData.browserFingerprint) {
            verification.methods.fingerprint = await this.verifyBrowserFingerprint(userId, verificationData.browserFingerprint);
        }

        // Calculate trust score
        verification.trustScore = this.calculateTrustScore(verification);
        
        // Store verification
        this.verifiedUsers.set(userId, verification);
        
        return verification;
    }

    // Verify cryptocurrency wallets
    async verifyWallets(userId, wallets) {
        const verification = {
            verified: [],
            failed: [],
            totalBalance: 0,
            riskIndicators: []
        };

        for (const wallet of wallets) {
            try {
                const walletData = await this.checkWalletOnChain(wallet);
                
                if (walletData.isValid) {
                    verification.verified.push({
                        address: wallet.address,
                        chain: wallet.chain,
                        balance: walletData.balance,
                        transactionHistory: walletData.recentTransactions,
                        riskScore: walletData.riskScore
                    });
                    
                    verification.totalBalance += walletData.balance;
                    
                    // Check for gambling-related transactions
                    if (walletData.gamblingTransactions > 10) {
                        verification.riskIndicators.push('high_gambling_activity');
                    }
                    
                    // Associate wallet with user
                    this.walletTracker.set(wallet.address, userId);
                } else {
                    verification.failed.push(wallet);
                }
            } catch (error) {
                verification.failed.push({...wallet, error: error.message});
            }
        }

        return verification;
    }

    // Verify Discord session and cross-reference with gambling activity
    async verifyDiscordSession(userId, sessionData) {
        const verification = {
            isValid: false,
            sessionId: sessionData.sessionId,
            serverConnections: [],
            gamblingServers: [],
            activityPattern: {},
            riskIndicators: []
        };

        try {
            // Verify session authenticity
            const sessionValid = await this.validateDiscordSession(sessionData);
            
            if (sessionValid) {
                verification.isValid = true;
                
                // Analyze server connections for gambling-related servers
                verification.gamblingServers = sessionData.servers.filter(server => 
                    this.isGamblingRelatedServer(server.name)
                );
                
                // Analyze activity patterns
                verification.activityPattern = {
                    averageOnlineHours: sessionData.averageOnlineHours || 0,
                    lateNightActivity: sessionData.lateNightSessions || 0,
                    gamblingChannelActivity: sessionData.gamblingChannelMessages || 0
                };
                
                // Risk indicators based on Discord activity
                if (verification.activityPattern.lateNightActivity > 50) {
                    verification.riskIndicators.push('excessive_late_night_activity');
                }
                
                if (verification.gamblingServers.length > 5) {
                    verification.riskIndicators.push('multiple_gambling_communities');
                }
            }
        } catch (error) {
            verification.error = error.message;
        }

        return verification;
    }

    // Verify Stake account and integrate with session data
    async verifyStakeAccount(userId, stakeData) {
        const verification = {
            isValid: false,
            accountId: stakeData.accountId,
            tier: null,
            totalWagered: 0,
            currentBalance: 0,
            bonusHistory: [],
            sessionPattern: {},
            riskIndicators: []
        };

        try {
            // Verify with Stake API
            const response = await axios.get(`${process.env.STAKE_BASE_URL}/user/verify`, {
                headers: {
                    'Authorization': `Bearer ${process.env.STAKE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    accountId: stakeData.accountId,
                    sessionToken: stakeData.sessionToken
                }
            });

            if (response.data.verified) {
                verification.isValid = true;
                verification.tier = response.data.tier;
                verification.totalWagered = response.data.totalWagered;
                verification.currentBalance = response.data.balance;
                verification.bonusHistory = response.data.bonuses || [];
                
                // Analyze session patterns
                verification.sessionPattern = {
                    averageSessionLength: response.data.avgSessionMinutes || 0,
                    dailySessions: response.data.dailySessions || 0,
                    peakHours: response.data.peakGamblingHours || [],
                    lossChasePattern: response.data.lossChaseDetected || false
                };
                
                // Risk indicators
                if (verification.sessionPattern.lossChasePattern) {
                    verification.riskIndicators.push('verified_loss_chasing');
                }
                
                if (verification.sessionPattern.averageSessionLength > 180) {
                    verification.riskIndicators.push('excessive_session_length');
                }
            }
        } catch (error) {
            verification.error = error.message;
        }

        return verification;
    }

    // Verify casino cookies and session data
    async verifyCasinoCookies(userId, cookieData) {
        const verification = {
            casinos: [],
            activeSessions: 0,
            totalCookies: 0,
            suspiciousActivity: [],
            bonusTracking: {}
        };

        for (const [casino, cookies] of Object.entries(cookieData)) {
            const casinoConfig = this.casinoIntegrations.get(casino);
            
            if (casinoConfig) {
                const casinoVerification = await this.verifyCasinoCookieData(casino, cookies, casinoConfig);
                verification.casinos.push(casinoVerification);
                verification.totalCookies += cookies.length;
                
                if (casinoVerification.hasActiveSession) {
                    verification.activeSessions++;
                }
                
                // Track bonus collection
                if (casinoVerification.bonusData) {
                    verification.bonusTracking[casino] = casinoVerification.bonusData;
                }
                
                // Check for suspicious activity
                if (casinoVerification.suspiciousPatterns.length > 0) {
                    verification.suspiciousActivity.push(...casinoVerification.suspiciousPatterns);
                }
            }
        }

        return verification;
    }

    // Verify individual casino cookie data
    async verifyCasinoCookieData(casino, cookies, config) {
        const verification = {
            casino,
            hasActiveSession: false,
            sessionData: {},
            bonusData: null,
            lastActivity: null,
            suspiciousPatterns: []
        };

        try {
            // Parse session cookies
            const sessionCookie = cookies.find(c => c.name.includes('session'));
            const authCookie = cookies.find(c => c.name.includes('auth'));
            
            if (sessionCookie && authCookie) {
                verification.hasActiveSession = true;
                verification.lastActivity = new Date(sessionCookie.lastAccessed);
                
                // Verify session with casino API if available
                if (config.sessionValidation) {
                    const sessionValid = await this.validateCasinoSession(casino, sessionCookie.value, config);
                    verification.sessionData = sessionValid;
                }
                
                // Track bonus collection if supported
                if (config.features.includes('bonus_tracking')) {
                    verification.bonusData = await this.trackCasinoBonuses(casino, authCookie.value, config);
                }
                
                // Detect suspicious patterns
                verification.suspiciousPatterns = this.detectSuspiciousCookiePatterns(cookies);
            }
        } catch (error) {
            verification.error = error.message;
        }

        return verification;
    }

    // Track casino bonuses and collection patterns
    async trackCasinoBonuses(casino, authToken, config) {
        const bonusData = {
            dailyBonuses: [],
            promotions: [],
            collectionPattern: {},
            missedBonuses: 0,
            totalClaimed: 0
        };

        try {
            for (const endpoint of config.bonusEndpoints) {
                const response = await axios.get(`${config.apiEndpoint}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.bonuses) {
                    bonusData.dailyBonuses.push(...response.data.bonuses);
                    bonusData.totalClaimed += response.data.bonuses.length;
                }

                if (response.data.promotions) {
                    bonusData.promotions.push(...response.data.promotions);
                }
            }

            // Analyze collection patterns
            bonusData.collectionPattern = this.analyzeBonusCollectionPattern(bonusData.dailyBonuses);
            
        } catch (error) {
            bonusData.error = error.message;
        }

        return bonusData;
    }

    // Analyze bonus collection patterns for insights
    analyzeBonusCollectionPattern(bonuses) {
        const pattern = {
            averageCollectionTime: null,
            consistencyScore: 0,
            missedDays: 0,
            streakLength: 0,
            riskIndicators: []
        };

        if (bonuses.length === 0) return pattern;

        // Calculate average collection time
        const collectionTimes = bonuses.map(b => new Date(b.claimedAt).getHours());
        pattern.averageCollectionTime = collectionTimes.reduce((a, b) => a + b, 0) / collectionTimes.length;

        // Calculate consistency (how regular the collection is)
        const last30Days = bonuses.filter(b => 
            new Date(b.claimedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        pattern.consistencyScore = (last30Days.length / 30) * 100;

        // Check for risk patterns
        if (pattern.averageCollectionTime < 6) { // Very early morning collections
            pattern.riskIndicators.push('obsessive_collection_pattern');
        }

        if (pattern.consistencyScore > 95) { // Almost perfect collection
            pattern.riskIndicators.push('potential_addiction_indicator');
        }

        return pattern;
    }

    // Verify local storage data for additional insights
    async verifyLocalStorage(userId, localStorageData) {
        const verification = {
            gamblingRelatedData: [],
            walletConnections: [],
            sessionData: {},
            automationDetected: false,
            riskIndicators: []
        };

        // Analyze local storage for gambling-related data
        for (const [key, value] of Object.entries(localStorageData)) {
            if (this.isGamblingRelatedKey(key)) {
                verification.gamblingRelatedData.push({ key, value });
            }

            // Check for wallet connection data
            if (key.includes('wallet') || key.includes('metamask') || key.includes('web3')) {
                verification.walletConnections.push({ key, value });
            }

            // Detect automation tools
            if (key.includes('bot') || key.includes('script') || key.includes('auto')) {
                verification.automationDetected = true;
                verification.riskIndicators.push('automation_tools_detected');
            }
        }

        return verification;
    }

    // Enhanced tilt pattern detection with verification data
    async detectTiltPatternsEnhanced(userId, sessionData) {
        const verification = this.verifiedUsers.get(userId);
        if (!verification) {
            throw new Error('User not verified - cannot perform enhanced tilt detection');
        }

        const patterns = {
            detected: [],
            severity: 'LOW',
            confidence: 0,
            verificationSupported: true,
            crossPlatformData: {}
        };

        // Wallet balance chasing pattern
        if (verification.verifiedWallets.length > 0) {
            const walletPattern = await this.detectWalletBalanceChasing(userId, verification.verifiedWallets);
            if (walletPattern.detected) {
                patterns.detected.push({
                    type: this.tiltPatterns.WALLET_BALANCE_CHASE,
                    confidence: walletPattern.confidence,
                    evidence: walletPattern.evidence
                });
            }
        }

        // Multi-casino velocity pattern
        if (verification.connectedCasinos.length > 1) {
            const velocityPattern = await this.detectMultiCasinoVelocity(userId, verification.connectedCasinos);
            if (velocityPattern.detected) {
                patterns.detected.push({
                    type: this.tiltPatterns.MULTI_CASINO_VELOCITY,
                    confidence: velocityPattern.confidence,
                    evidence: velocityPattern.evidence
                });
            }
        }

        // Bonus abuse pattern
        if (verification.methods.cookies && verification.methods.cookies.bonusTracking) {
            const bonusPattern = await this.detectBonusAbusePattern(userId, verification.methods.cookies.bonusTracking);
            if (bonusPattern.detected) {
                patterns.detected.push({
                    type: this.tiltPatterns.BONUS_ABUSE_PATTERN,
                    confidence: bonusPattern.confidence,
                    evidence: bonusPattern.evidence
                });
            }
        }

        // Verified stake escalation
        if (verification.methods.stake && verification.methods.stake.isValid) {
            const stakePattern = await this.detectVerifiedStakeEscalation(userId, verification.methods.stake, sessionData);
            if (stakePattern.detected) {
                patterns.detected.push({
                    type: this.tiltPatterns.STAKE_ESCALATION_VERIFIED,
                    confidence: stakePattern.confidence,
                    evidence: stakePattern.evidence
                });
            }
        }

        // Cross-platform correlation
        patterns.crossPlatformData = await this.correlateCrossPlatformData(userId, verification);

        // Calculate overall severity and confidence
        if (patterns.detected.length > 0) {
            patterns.confidence = patterns.detected.reduce((avg, p) => avg + p.confidence, 0) / patterns.detected.length;
            
            if (patterns.confidence > 80) {
                patterns.severity = 'CRITICAL';
            } else if (patterns.confidence > 60) {
                patterns.severity = 'HIGH';
            } else if (patterns.confidence > 40) {
                patterns.severity = 'MEDIUM';
            }
        }

        return patterns;
    }

    // Detect wallet balance chasing patterns
    async detectWalletBalanceChasing(userId, wallets) {
        const pattern = { detected: false, confidence: 0, evidence: [] };

        for (const wallet of wallets) {
            // Check for rapid deposits to gambling platforms
            const gamblingDeposits = wallet.transactionHistory.filter(tx => 
                this.isGamblingRelatedAddress(tx.to) && 
                new Date(tx.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            );

            if (gamblingDeposits.length > 5) {
                pattern.detected = true;
                pattern.confidence += 30;
                pattern.evidence.push(`${gamblingDeposits.length} gambling deposits in 24h from ${wallet.address}`);
            }

            // Check for depleted balance followed by new deposits
            const balanceHistory = wallet.balanceHistory || [];
            const depletionPattern = this.detectBalanceDepletionPattern(balanceHistory);
            
            if (depletionPattern.detected) {
                pattern.detected = true;
                pattern.confidence += depletionPattern.severity * 20;
                pattern.evidence.push(`Balance depletion pattern detected: ${depletionPattern.description}`);
            }
        }

        return pattern;
    }

    // Detect multi-casino rapid betting patterns
    async detectMultiCasinoVelocity(userId, connectedCasinos) {
        const pattern = { detected: false, confidence: 0, evidence: [] };

        // Check for simultaneous activity across casinos
        const recentActivity = [];
        
        for (const casino of connectedCasinos) {
            if (casino.sessionData && casino.sessionData.lastBet) {
                const timeSinceLastBet = Date.now() - new Date(casino.sessionData.lastBet).getTime();
                if (timeSinceLastBet < 5 * 60 * 1000) { // 5 minutes
                    recentActivity.push(casino);
                }
            }
        }

        if (recentActivity.length > 2) {
            pattern.detected = true;
            pattern.confidence = Math.min(recentActivity.length * 25, 100);
            pattern.evidence.push(`Simultaneous activity detected across ${recentActivity.length} casinos`);
        }

        return pattern;
    }

    // Calculate comprehensive trust score
    calculateTrustScore(verification) {
        let score = 0;
        let maxScore = 0;

        // Wallet verification weight: 30 points
        maxScore += 30;
        if (verification.methods.wallet && verification.methods.wallet.verified.length > 0) {
            score += Math.min(verification.methods.wallet.verified.length * 10, 30);
        }

        // Discord verification weight: 20 points
        maxScore += 20;
        if (verification.methods.discord && verification.methods.discord.isValid) {
            score += 20;
        }

        // Stake verification weight: 25 points
        maxScore += 25;
        if (verification.methods.stake && verification.methods.stake.isValid) {
            score += 25;
        }

        // Casino cookie verification weight: 15 points
        maxScore += 15;
        if (verification.methods.cookies && verification.methods.cookies.casinos.length > 0) {
            score += Math.min(verification.methods.cookies.casinos.length * 5, 15);
        }

        // Local storage verification weight: 10 points
        maxScore += 10;
        if (verification.methods.localStorage) {
            score += 10;
        }

        return Math.round((score / maxScore) * 100);
    }

    // Helper methods
    isGamblingRelatedServer(serverName) {
        const gamblingKeywords = ['casino', 'betting', 'poker', 'dice', 'stake', 'gamble', 'slots', 'crypto'];
        return gamblingKeywords.some(keyword => 
            serverName.toLowerCase().includes(keyword)
        );
    }

    isGamblingRelatedKey(key) {
        const gamblingKeys = ['casino', 'bet', 'stake', 'gamble', 'dice', 'poker', 'slots'];
        return gamblingKeys.some(keyword => 
            key.toLowerCase().includes(keyword)
        );
    }

    isGamblingRelatedAddress(address) {
        // This would contain known gambling platform addresses
        const knownGamblingAddresses = [
            // Add known casino hot wallet addresses
        ];
        return knownGamblingAddresses.includes(address.toLowerCase());
    }

    async checkWalletOnChain(wallet) {
        // Mock implementation - would integrate with actual blockchain APIs
        return {
            isValid: true,
            balance: Math.random() * 1000,
            recentTransactions: [],
            gamblingTransactions: Math.floor(Math.random() * 20),
            riskScore: Math.floor(Math.random() * 100)
        };
    }

    detectSuspiciousCookiePatterns(cookies) {
        const patterns = [];
        
        // Check for automation indicators
        if (cookies.some(c => c.name.includes('bot') || c.name.includes('auto'))) {
            patterns.push('automation_cookies_detected');
        }

        // Check for unusual session patterns
        const sessionCookies = cookies.filter(c => c.name.includes('session'));
        if (sessionCookies.length > 5) {
            patterns.push('multiple_session_cookies');
        }

        return patterns;
    }
}

module.exports = TiltCheckVerificationSystem;

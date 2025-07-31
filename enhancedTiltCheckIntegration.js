/**
 * Enhanced TiltCheck Integration with CollectClock
 * Comprehensive tilt detection with verification, bonus tracking, and pattern analysis
 */

const TiltCheckVerificationSystem = require('./tiltCheckVerificationSystem');
const axios = require('axios');

class EnhancedTiltCheckIntegration {
    constructor() {
        this.verificationSystem = new TiltCheckVerificationSystem();
        this.collectClockData = new Map(); // User bonus collection data
        this.tiltSessions = new Map(); // Active tilt monitoring sessions
        this.patternDatabase = new Map(); // Historical pattern data
        
        // TiltCheck API configuration
        this.tiltCheckConfig = {
            baseUrl: process.env.TILTCHECK_BASE_URL || 'https://api.tiltcheck.com',
            apiKey: process.env.TILTCHECK_API_KEY,
            webhookUrl: process.env.TILTCHECK_WEBHOOK_URL,
            riskThresholds: {
                LOW: 30,
                MEDIUM: 50,
                HIGH: 70,
                CRITICAL: 85
            }
        };

        // CollectClock integration for bonus tracking
        this.collectClockIntegration = {
            trackingEnabled: true,
            bonusPatterns: new Map(),
            casinoSchedules: new Map(),
            userCollectionData: new Map()
        };

        this.initializeCollectClockSchedules();
    }

    // Initialize CollectClock casino bonus schedules
    initializeCollectClockSchedules() {
        // Stake.us daily bonus schedule
        this.collectClockIntegration.casinoSchedules.set('stake.us', {
            dailyBonus: {
                resetTime: '00:00 UTC',
                amount: 'variable',
                requirements: 'login',
                trackingEnabled: true
            },
            weeklyBonus: {
                resetTime: 'Monday 00:00 UTC',
                amount: 'tier-based',
                requirements: 'weekly_wager',
                trackingEnabled: true
            },
            reload: {
                frequency: 'deposit-based',
                percentage: '5-25%',
                trackingEnabled: true
            }
        });

        // TrustDice schedule
        this.collectClockIntegration.casinoSchedules.set('trustdice', {
            dailyBonus: {
                resetTime: '00:00 UTC',
                amount: '0.1-1 USD',
                requirements: 'login + chat',
                trackingEnabled: true
            },
            hourlyFaucet: {
                frequency: '60 minutes',
                amount: '0.01-0.05 USD',
                requirements: 'active_session',
                trackingEnabled: true
            }
        });

        // Add more casino schedules
        this.addAdditionalCasinoSchedules();
    }

    addAdditionalCasinoSchedules() {
        const casinos = [
            'rollbit', 'metawin', 'duelbits', 'bc.game', 'roobet'
        ];

        casinos.forEach(casino => {
            this.collectClockIntegration.casinoSchedules.set(casino, {
                dailyBonus: {
                    resetTime: '00:00 UTC',
                    amount: 'variable',
                    requirements: 'login',
                    trackingEnabled: true
                }
            });
        });
    }

    // Start comprehensive verification and monitoring
    async startVerifiedTiltMonitoring(userId, discordUser, verificationData) {
        try {
            // Step 1: Comprehensive user verification
            console.log(`🔍 Starting comprehensive verification for ${discordUser.username}`);
            const verification = await this.verificationSystem.verifyUser(userId, verificationData);
            
            if (verification.trustScore < 50) {
                return {
                    success: false,
                    error: 'Insufficient verification score for enhanced monitoring',
                    trustScore: verification.trustScore,
                    requiredScore: 50
                };
            }

            // Step 2: Initialize TiltCheck session with verification data
            const tiltCheckSession = await this.initializeTiltCheckSession(userId, verification);
            
            // Step 3: Start CollectClock integration for verified casinos
            const collectClockSession = await this.initializeCollectClockTracking(userId, verification);

            // Step 4: Begin cross-platform monitoring
            const monitoringSession = {
                userId,
                discordUser,
                verification,
                tiltCheckSession,
                collectClockSession,
                startTime: new Date(),
                status: 'ACTIVE',
                patterns: {
                    detected: [],
                    monitoring: ['wallet_chasing', 'bonus_abuse', 'session_escalation', 'cross_platform']
                }
            };

            this.tiltSessions.set(userId, monitoringSession);

            // Step 5: Start real-time monitoring loops
            this.startRealTimeMonitoring(userId);

            return {
                success: true,
                sessionId: tiltCheckSession.sessionId,
                verification: {
                    trustScore: verification.trustScore,
                    verifiedMethods: Object.keys(verification.methods).filter(m => verification.methods[m].isValid || verification.methods[m].verified?.length > 0),
                    connectedCasinos: verification.connectedCasinos.length,
                    trackedWallets: verification.verifiedWallets.length
                },
                monitoring: {
                    tiltCheck: tiltCheckSession.status,
                    collectClock: collectClockSession.status,
                    patterns: monitoringSession.patterns.monitoring
                }
            };

        } catch (error) {
            console.error('Error starting verified tilt monitoring:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Initialize TiltCheck session with enhanced verification
    async initializeTiltCheckSession(userId, verification) {
        const sessionData = {
            userId,
            sessionId: `tc_${userId}_${Date.now()}`,
            verification: {
                trustScore: verification.trustScore,
                verifiedWallets: verification.verifiedWallets.map(w => ({
                    address: w.address,
                    chain: w.chain,
                    balance: w.balance,
                    riskScore: w.riskScore
                })),
                stakeAccount: verification.methods.stake?.isValid ? {
                    accountId: verification.methods.stake.accountId,
                    tier: verification.methods.stake.tier,
                    totalWagered: verification.methods.stake.totalWagered
                } : null,
                connectedCasinos: verification.connectedCasinos.map(c => ({
                    casino: c.casino,
                    hasActiveSession: c.hasActiveSession,
                    lastActivity: c.lastActivity
                }))
            },
            monitoring: {
                patterns: ['verified_loss_chasing', 'multi_platform_velocity', 'bonus_hunting_tilt'],
                thresholds: this.tiltCheckConfig.riskThresholds,
                realTimeEnabled: true
            }
        };

        // Register session with TiltCheck API
        try {
            const response = await axios.post(`${this.tiltCheckConfig.baseUrl}/sessions`, sessionData, {
                headers: {
                    'Authorization': `Bearer ${this.tiltCheckConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                sessionId: sessionData.sessionId,
                status: 'ACTIVE',
                tiltCheckId: response.data.id,
                monitoring: sessionData.monitoring
            };
        } catch (error) {
            console.error('TiltCheck API error:', error);
            return {
                sessionId: sessionData.sessionId,
                status: 'LOCAL_ONLY',
                error: error.message,
                monitoring: sessionData.monitoring
            };
        }
    }

    // Initialize CollectClock tracking for verified casinos
    async initializeCollectClockTracking(userId, verification) {
        const trackingData = {
            userId,
            trackedCasinos: [],
            bonusSchedules: new Map(),
            collectionPatterns: new Map(),
            missedBonuses: new Map(),
            riskIndicators: []
        };

        // Set up tracking for each verified casino
        for (const casino of verification.connectedCasinos) {
            const casinoName = casino.casino;
            const schedule = this.collectClockIntegration.casinoSchedules.get(casinoName);
            
            if (schedule && casino.hasActiveSession) {
                trackingData.trackedCasinos.push(casinoName);
                trackingData.bonusSchedules.set(casinoName, schedule);
                
                // Initialize collection pattern tracking
                const existingPattern = casino.bonusData?.collectionPattern || {};
                trackingData.collectionPatterns.set(casinoName, {
                    lastCollection: casino.bonusData?.dailyBonuses?.[0]?.claimedAt || null,
                    averageCollectionTime: existingPattern.averageCollectionTime || null,
                    consistencyScore: existingPattern.consistencyScore || 0,
                    missedDays: existingPattern.missedDays || 0,
                    obsessivePattern: existingPattern.riskIndicators?.includes('obsessive_collection_pattern') || false
                });

                // Check for risk indicators in bonus collection
                if (existingPattern.riskIndicators?.length > 0) {
                    trackingData.riskIndicators.push({
                        casino: casinoName,
                        indicators: existingPattern.riskIndicators
                    });
                }
            }
        }

        // Store CollectClock data
        this.collectClockIntegration.userCollectionData.set(userId, trackingData);

        return {
            status: 'ACTIVE',
            trackedCasinos: trackingData.trackedCasinos.length,
            monitoringSchedules: trackingData.bonusSchedules.size,
            riskIndicators: trackingData.riskIndicators.length
        };
    }

    // Start real-time monitoring loops
    startRealTimeMonitoring(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) return;

        // Wallet monitoring loop (every 5 minutes)
        const walletMonitor = setInterval(async () => {
            await this.monitorWalletActivity(userId);
        }, 5 * 60 * 1000);

        // Casino session monitoring (every 2 minutes)
        const casinoMonitor = setInterval(async () => {
            await this.monitorCasinoSessions(userId);
        }, 2 * 60 * 1000);

        // Bonus collection monitoring (every 10 minutes)
        const bonusMonitor = setInterval(async () => {
            await this.monitorBonusCollection(userId);
        }, 10 * 60 * 1000);

        // TiltCheck pattern analysis (every 1 minute)
        const patternMonitor = setInterval(async () => {
            await this.runTiltPatternAnalysis(userId);
        }, 60 * 1000);

        // Store monitoring intervals for cleanup
        session.monitoring = {
            walletMonitor,
            casinoMonitor,
            bonusMonitor,
            patternMonitor
        };

        this.tiltSessions.set(userId, session);
    }

    // Monitor wallet activity for tilt patterns
    async monitorWalletActivity(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) return;

        try {
            for (const wallet of session.verification.verifiedWallets) {
                // Check for new transactions
                const newTransactions = await this.checkWalletForNewTransactions(wallet.address);
                
                if (newTransactions.length > 0) {
                    const gamblingTxs = newTransactions.filter(tx => 
                        this.verificationSystem.isGamblingRelatedAddress(tx.to)
                    );

                    if (gamblingTxs.length > 0) {
                        await this.processPotentialTiltTransaction(userId, wallet, gamblingTxs);
                    }
                }
            }
        } catch (error) {
            console.error('Wallet monitoring error:', error);
        }
    }

    // Monitor casino sessions for rapid betting patterns
    async monitorCasinoSessions(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) return;

        try {
            const verification = session.verification;
            const simultaneousActivity = [];

            for (const casino of verification.connectedCasinos) {
                if (casino.hasActiveSession) {
                    const activityCheck = await this.checkCasinoActivity(casino.casino, casino.sessionData);
                    
                    if (activityCheck.recentActivity) {
                        simultaneousActivity.push({
                            casino: casino.casino,
                            lastBet: activityCheck.lastBet,
                            betSize: activityCheck.betSize,
                            sessionLength: activityCheck.sessionLength
                        });
                    }
                }
            }

            // Detect simultaneous multi-casino activity
            if (simultaneousActivity.length > 1) {
                await this.processMultiCasinoActivity(userId, simultaneousActivity);
            }
        } catch (error) {
            console.error('Casino session monitoring error:', error);
        }
    }

    // Monitor bonus collection patterns via CollectClock
    async monitorBonusCollection(userId) {
        const collectClockData = this.collectClockIntegration.userCollectionData.get(userId);
        if (!collectClockData) return;

        try {
            for (const casino of collectClockData.trackedCasinos) {
                const schedule = collectClockData.bonusSchedules.get(casino);
                const pattern = collectClockData.collectionPatterns.get(casino);

                // Check if bonus should be available
                const bonusAvailable = await this.checkBonusAvailability(casino, schedule);
                
                if (bonusAvailable.available) {
                    const collected = await this.checkBonusCollection(casino, userId);
                    
                    if (collected.collected) {
                        // Update collection pattern
                        await this.updateCollectionPattern(userId, casino, collected.collectionTime);
                        
                        // Check for obsessive collection patterns
                        const updatedPattern = collectClockData.collectionPatterns.get(casino);
                        if (this.isObsessiveCollectionPattern(updatedPattern)) {
                            await this.triggerBonusObsessionAlert(userId, casino, updatedPattern);
                        }
                    } else if (bonusAvailable.timeRemaining < 60 * 60 * 1000) { // Less than 1 hour remaining
                        // User hasn't collected with less than 1 hour remaining
                        await this.processMissedBonusRisk(userId, casino, bonusAvailable);
                    }
                }
            }
        } catch (error) {
            console.error('Bonus collection monitoring error:', error);
        }
    }

    // Run comprehensive tilt pattern analysis
    async runTiltPatternAnalysis(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) return;

        try {
            // Get current session data
            const currentData = {
                walletActivity: await this.getRecentWalletActivity(userId),
                casinoActivity: await this.getRecentCasinoActivity(userId),
                bonusActivity: await this.getRecentBonusActivity(userId),
                sessionLength: Date.now() - session.startTime.getTime()
            };

            // Run enhanced pattern detection
            const patterns = await this.verificationSystem.detectTiltPatternsEnhanced(userId, currentData);

            if (patterns.detected.length > 0) {
                await this.processTiltPatternsDetected(userId, patterns);
            }

            // Update session with latest patterns
            session.patterns.detected = patterns.detected;
            session.lastAnalysis = new Date();
            this.tiltSessions.set(userId, session);

        } catch (error) {
            console.error('Tilt pattern analysis error:', error);
        }
    }

    // Process detected tilt patterns and trigger appropriate responses
    async processTiltPatternsDetected(userId, patterns) {
        const session = this.tiltSessions.get(userId);
        if (!session) return;

        console.log(`🚨 Tilt patterns detected for user ${userId}:`, patterns);

        // Send to TiltCheck API
        if (session.tiltCheckSession.status === 'ACTIVE') {
            try {
                await axios.post(`${this.tiltCheckConfig.baseUrl}/patterns`, {
                    sessionId: session.tiltCheckSession.sessionId,
                    patterns: patterns.detected,
                    severity: patterns.severity,
                    confidence: patterns.confidence,
                    timestamp: new Date(),
                    verificationSupported: true
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.tiltCheckConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Error sending patterns to TiltCheck API:', error);
            }
        }

        // Trigger alerts based on severity
        if (patterns.severity === 'CRITICAL' || patterns.confidence > 80) {
            await this.triggerCriticalTiltAlert(userId, patterns);
        } else if (patterns.severity === 'HIGH' || patterns.confidence > 60) {
            await this.triggerHighRiskAlert(userId, patterns);
        }

        // Store pattern in database for learning
        this.patternDatabase.set(`${userId}_${Date.now()}`, {
            userId,
            patterns: patterns.detected,
            severity: patterns.severity,
            confidence: patterns.confidence,
            timestamp: new Date(),
            verification: session.verification.trustScore
        });
    }

    // Trigger critical tilt alert
    async triggerCriticalTiltAlert(userId, patterns) {
        const session = this.tiltSessions.get(userId);
        
        console.log(`🔴 CRITICAL TILT ALERT for user ${userId}`);
        console.log(`Patterns: ${patterns.detected.map(p => p.type).join(', ')}`);
        console.log(`Confidence: ${patterns.confidence}%`);
        console.log(`Verification Score: ${session.verification.trustScore}`);

        // Here you would integrate with Discord notifications, intervention systems, etc.
        
        return {
            alertLevel: 'CRITICAL',
            patterns: patterns.detected,
            recommendedActions: [
                'immediate_intervention',
                'session_break_suggestion',
                'limit_enforcement',
                'cool_down_period'
            ]
        };
    }

    // Stop monitoring for a user
    stopMonitoring(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) return false;

        // Clear monitoring intervals
        if (session.monitoring) {
            clearInterval(session.monitoring.walletMonitor);
            clearInterval(session.monitoring.casinoMonitor);
            clearInterval(session.monitoring.bonusMonitor);
            clearInterval(session.monitoring.patternMonitor);
        }

        // Clean up data
        this.tiltSessions.delete(userId);
        this.collectClockIntegration.userCollectionData.delete(userId);

        console.log(`✅ Stopped monitoring for user ${userId}`);
        return true;
    }

    // Get monitoring status
    getMonitoringStatus(userId) {
        const session = this.tiltSessions.get(userId);
        if (!session) {
            return { monitoring: false };
        }

        const collectClockData = this.collectClockIntegration.userCollectionData.get(userId);

        return {
            monitoring: true,
            session: {
                startTime: session.startTime,
                status: session.status,
                trustScore: session.verification.trustScore
            },
            verification: {
                verifiedMethods: Object.keys(session.verification.methods).length,
                connectedCasinos: session.verification.connectedCasinos.length,
                trackedWallets: session.verification.verifiedWallets.length
            },
            collectClock: {
                trackedCasinos: collectClockData?.trackedCasinos?.length || 0,
                bonusSchedules: collectClockData?.bonusSchedules?.size || 0
            },
            patterns: {
                detected: session.patterns.detected.length,
                monitoring: session.patterns.monitoring
            },
            lastAnalysis: session.lastAnalysis
        };
    }

    // Helper methods (stubs for full implementation)
    async checkWalletForNewTransactions(address) {
        // Implementation would check blockchain APIs
        return [];
    }

    async checkCasinoActivity(casino, sessionData) {
        // Implementation would check casino APIs or session data
        return { recentActivity: false };
    }

    async checkBonusAvailability(casino, schedule) {
        // Implementation would check casino bonus availability
        return { available: false };
    }

    async checkBonusCollection(casino, userId) {
        // Implementation would verify if bonus was collected
        return { collected: false };
    }

    isObsessiveCollectionPattern(pattern) {
        return pattern.consistencyScore > 95 && pattern.averageCollectionTime < 6;
    }
}

module.exports = EnhancedTiltCheckIntegration;

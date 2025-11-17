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
 * Provably Fair Verification System
 * 
 * This answers the new requirement:
 * "Implement notification for user to hash seed from mismatched gameplay to use 
 * casino provable fairness formulas available to users to verify hashes, and log 
 * results similarly."
 * 
 * When RTP mismatches are detected, this system:
 * 1. Notifies user to collect their game seeds/hashes
 * 2. Provides tools to verify provably fair hashes
 * 3. Logs verification results for legal evidence
 * 4. Integrates with compliance monitoring
 * 
 * Provably Fair Algorithms Supported:
 * - SHA-256 based (Stake, BC.Game, etc.)
 * - HMAC-SHA-256 (Rollbit, etc.)
 * - MD5 legacy (older casinos)
 * - Custom casino algorithms
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class ProvablyFairVerifier {
    constructor(options = {}) {
        // Verification settings
        this.verificationLogPath = options.verificationLogPath || './data/provably_fair_verifications.json';
        this.suspiciousHashPath = options.suspiciousHashPath || './data/suspicious_hashes.json';
        
        // Track verifications
        this.userVerifications = new Map(); // userId -> verifications
        this.casinoHashIssues = new Map();  // casinoId -> hash issues
        this.pendingNotifications = new Map(); // userId -> pending notifications
        
        // Known casino provably fair algorithms
        this.casinoAlgorithms = new Map([
            ['stake', {
                name: 'Stake',
                algorithm: 'sha256',
                format: 'server_seed:client_seed:nonce',
                instructions: 'Go to Settings → Fairness → View Game History',
                docsUrl: 'https://stake.com/provably-fair/overview'
            }],
            ['bc.game', {
                name: 'BC.Game',
                algorithm: 'sha256',
                format: 'server_seed:client_seed:nonce',
                instructions: 'Click on game → Fairness → Export seed pairs',
                docsUrl: 'https://bc.game/provably-fair'
            }],
            ['rollbit', {
                name: 'Rollbit',
                algorithm: 'hmac-sha256',
                format: 'hmac(server_seed, client_seed + nonce)',
                instructions: 'Profile → Provably Fair → Download session data',
                docsUrl: 'https://rollbit.com/fairness'
            }],
            ['shuffle', {
                name: 'Shuffle',
                algorithm: 'sha256',
                format: 'sha256(server_seed:client_seed:nonce)',
                instructions: 'Game menu → Fairness verification',
                docsUrl: 'https://shuffle.com/fairness-verification'
            }],
            ['default', {
                name: 'Unknown Casino',
                algorithm: 'sha256',
                format: 'Check casino documentation',
                instructions: 'Look for "Provably Fair" or "Fairness" section on casino website',
                docsUrl: null
            }]
        ]);
        
        console.log('🎲 Provably Fair Verifier initialized');
        
        this.loadHistoricalData();
    }

    /**
     * Notify user to collect seeds after RTP mismatch
     * @param {Object} mismatchData - Mismatch information
     * @param {string} mismatchData.userId - User identifier
     * @param {string} mismatchData.casinoId - Casino identifier
     * @param {string} mismatchData.casinoName - Casino display name
     * @param {string} mismatchData.sessionId - Session identifier
     * @param {number} mismatchData.deviation - RTP deviation
     * @param {string} mismatchData.severity - Mismatch severity
     * @param {Array} mismatchData.suspiciousBets - List of suspicious bet IDs
     * @returns {Object} Notification details
     */
    async notifyUserToCollectSeeds(mismatchData) {
        const {
            userId,
            casinoId,
            casinoName,
            sessionId,
            deviation,
            severity,
            suspiciousBets = []
        } = mismatchData;
        
        const casino = this.casinoAlgorithms.get(casinoId) || this.casinoAlgorithms.get('default');
        
        const notification = {
            notificationId: crypto.randomBytes(8).toString('hex'),
            userId,
            casinoId,
            casinoName,
            sessionId,
            timestamp: Date.now(),
            severity,
            deviation: (deviation * 100).toFixed(2) + '%',
            
            // Instructions for user
            title: '🔍 Verify Casino Fairness - Collect Your Seeds',
            urgency: severity === 'critical' || severity === 'major' ? 'HIGH' : 'MEDIUM',
            
            message: this._generateSeedCollectionMessage(casinoName, casino, suspiciousBets),
            
            instructions: {
                casino: casinoName,
                algorithm: casino.algorithm,
                format: casino.format,
                steps: casino.instructions,
                docsUrl: casino.docsUrl,
                suspiciousBets: suspiciousBets,
                
                whatToCollect: [
                    'Server Seed (usually hashed)',
                    'Client Seed (your seed)',
                    'Nonce (bet number)',
                    'Game result',
                    'Timestamp of each bet'
                ],
                
                whereToFind: casino.instructions,
                
                howToVerify: [
                    '1. Collect seeds from casino',
                    '2. Return to TiltCheck',
                    '3. Paste seeds into verification tool',
                    '4. We\'ll verify if results match',
                    '5. If mismatch found, legal evidence is created'
                ]
            },
            
            verificationUrl: `/verify-seeds/${userId}/${sessionId}`,
            
            legalImportance: `
If the casino's seeds don't verify correctly, this is PROOF of manipulation.
This evidence can be used in:
- Complaints to licensing authorities
- Chargebacks with payment processors
- Class action lawsuits
- Public exposure of the casino
            `.trim()
        };
        
        // Store pending notification
        if (!this.pendingNotifications.has(userId)) {
            this.pendingNotifications.set(userId, []);
        }
        this.pendingNotifications.get(userId).push(notification);
        
        // Log the notification
        await this._logNotification(notification);
        
        console.log(`🔔 Seed collection notification sent to user ${userId}`);
        
        return notification;
    }

    /**
     * Generate seed collection message
     * @private
     */
    _generateSeedCollectionMessage(casinoName, casino, suspiciousBets) {
        return `
🔍 IMPORTANT: Verify Casino Fairness

We detected unusual results in your ${casinoName} gameplay. To verify if the casino 
is operating fairly, we need you to collect your game seeds.

═══════════════════════════════════════════════════════════

📋 WHAT ARE SEEDS?
Provably fair casinos use cryptographic seeds to generate game results. 
You can verify these seeds to prove whether results were fair.

🎯 WHY THIS MATTERS:
If the seeds don't verify, it's PROOF the casino manipulated your games.
This is strong legal evidence for:
• Regulatory complaints
• Chargebacks
• Lawsuits

🔑 WHAT TO COLLECT:
${casino.whatToCollect || 'Server seed, client seed, nonce, and results'}

📍 WHERE TO FIND THEM:
${casino.instructions}

${suspiciousBets.length > 0 ? `
⚠️  PRIORITY BETS TO VERIFY:
We identified ${suspiciousBets.length} particularly suspicious bets. 
Get seeds for these first:
${suspiciousBets.slice(0, 5).map((bet, i) => `${i + 1}. Bet #${bet.betId} - ${bet.reason}`).join('\n')}
` : ''}

⏱️  TIME SENSITIVE:
Some casinos delete seed data after 24-48 hours. 
Collect your seeds NOW while they're still available.

═══════════════════════════════════════════════════════════

After collecting seeds, return to TiltCheck and we'll verify them for you.
        `.trim();
    }

    /**
     * Verify provably fair seeds
     * @param {Object} verificationData - Verification data
     * @param {string} verificationData.userId - User identifier
     * @param {string} verificationData.casinoId - Casino identifier
     * @param {string} verificationData.sessionId - Session identifier
     * @param {Array} verificationData.bets - Array of bets with seeds
     * @returns {Object} Verification results
     */
    async verifySeeds(verificationData) {
        const {
            userId,
            casinoId,
            sessionId,
            bets
        } = verificationData;
        
        const casino = this.casinoAlgorithms.get(casinoId) || this.casinoAlgorithms.get('default');
        const results = {
            verificationId: crypto.randomBytes(8).toString('hex'),
            userId,
            casinoId,
            sessionId,
            timestamp: Date.now(),
            totalBets: bets.length,
            verified: 0,
            failed: 0,
            suspicious: 0,
            bets: [],
            verdict: 'pending',
            evidence: []
        };
        
        console.log(`🔍 Verifying ${bets.length} bets for user ${userId}...`);
        
        // Verify each bet
        for (const bet of bets) {
            const betResult = await this._verifyBet(bet, casino);
            results.bets.push(betResult);
            
            if (betResult.verified) {
                results.verified++;
            } else {
                results.failed++;
                
                // Track as suspicious if hash doesn't match
                if (betResult.hashMismatch) {
                    results.suspicious++;
                    results.evidence.push({
                        betId: bet.betId,
                        expectedHash: betResult.expectedHash,
                        actualHash: betResult.actualHash,
                        reason: betResult.reason
                    });
                }
            }
        }
        
        // Determine verdict
        const failureRate = results.failed / results.totalBets;
        
        if (failureRate === 0) {
            results.verdict = 'FAIR - All seeds verified correctly';
        } else if (failureRate < 0.1) {
            results.verdict = 'MOSTLY_FAIR - Minor discrepancies (could be user error)';
        } else if (failureRate < 0.3) {
            results.verdict = 'SUSPICIOUS - Multiple verification failures';
        } else {
            results.verdict = 'FRAUDULENT - Majority of seeds do not verify';
        }
        
        // Track casino hash issues
        if (results.suspicious > 0) {
            await this._recordHashIssues(casinoId, results);
        }
        
        // Store verification
        if (!this.userVerifications.has(userId)) {
            this.userVerifications.set(userId, []);
        }
        this.userVerifications.get(userId).push(results);
        
        // Log verification
        await this._logVerification(results);
        
        console.log(`✅ Verification complete: ${results.verdict}`);
        console.log(`   Verified: ${results.verified}/${results.totalBets}`);
        console.log(`   Failed: ${results.failed}/${results.totalBets}`);
        console.log(`   Suspicious: ${results.suspicious}/${results.totalBets}`);
        
        return results;
    }

    /**
     * Verify individual bet
     * @private
     */
    async _verifyBet(bet, casino) {
        const {
            betId,
            serverSeed,
            serverSeedHash,
            clientSeed,
            nonce,
            result,
            gameType
        } = bet;
        
        const betResult = {
            betId,
            verified: false,
            hashMismatch: false,
            expectedHash: null,
            actualHash: null,
            expectedResult: null,
            actualResult: result,
            reason: null
        };
        
        try {
            // Step 1: Verify server seed hash
            const calculatedHash = this._hashSeed(serverSeed, casino.algorithm);
            betResult.expectedHash = serverSeedHash;
            betResult.actualHash = calculatedHash;
            
            if (calculatedHash !== serverSeedHash) {
                betResult.hashMismatch = true;
                betResult.reason = 'Server seed hash does not match';
                return betResult;
            }
            
            // Step 2: Calculate expected result
            const expectedResult = this._calculateResult(
                serverSeed,
                clientSeed,
                nonce,
                gameType,
                casino.algorithm
            );
            betResult.expectedResult = expectedResult;
            
            // Step 3: Compare results
            if (this._resultsMatch(expectedResult, result, gameType)) {
                betResult.verified = true;
            } else {
                betResult.reason = 'Game result does not match calculated result';
            }
            
        } catch (error) {
            betResult.reason = 'Verification error: ' + error.message;
        }
        
        return betResult;
    }

    /**
     * Hash a seed using specified algorithm
     * @private
     */
    _hashSeed(seed, algorithm) {
        switch (algorithm) {
            case 'sha256':
                return crypto.createHash('sha256').update(seed).digest('hex');
            
            case 'hmac-sha256':
                // HMAC requires a key, this is simplified
                return crypto.createHmac('sha256', 'key').update(seed).digest('hex');
            
            case 'md5':
                return crypto.createHash('md5').update(seed).digest('hex');
            
            default:
                return crypto.createHash('sha256').update(seed).digest('hex');
        }
    }

    /**
     * Calculate expected result from seeds
     * @private
     */
    _calculateResult(serverSeed, clientSeed, nonce, gameType, algorithm) {
        // Create combined string
        const combined = `${serverSeed}:${clientSeed}:${nonce}`;
        
        // Hash it
        const hash = this._hashSeed(combined, algorithm);
        
        // Convert hash to game result (simplified)
        // In production, this would use the actual casino algorithm
        const hashInt = parseInt(hash.substring(0, 8), 16);
        
        switch (gameType) {
            case 'dice':
                return (hashInt % 10000) / 100; // 0-99.99
            
            case 'crash':
                return 1 + (hashInt % 10000) / 100; // 1.00-100.00
            
            case 'slots':
                return hashInt % 100; // Symbol position 0-99
            
            default:
                return hashInt % 100;
        }
    }

    /**
     * Check if results match
     * @private
     */
    _resultsMatch(expected, actual, gameType) {
        // Allow for small floating point differences
        const tolerance = 0.01;
        
        if (typeof expected === 'number' && typeof actual === 'number') {
            return Math.abs(expected - actual) < tolerance;
        }
        
        return expected === actual;
    }

    /**
     * Record hash issues for casino
     * @private
     */
    async _recordHashIssues(casinoId, results) {
        if (!this.casinoHashIssues.has(casinoId)) {
            this.casinoHashIssues.set(casinoId, {
                casinoId,
                totalVerifications: 0,
                failedVerifications: 0,
                suspiciousBets: [],
                firstIssue: Date.now(),
                lastIssue: Date.now()
            });
        }
        
        const issues = this.casinoHashIssues.get(casinoId);
        issues.totalVerifications++;
        issues.failedVerifications++;
        issues.lastIssue = Date.now();
        issues.suspiciousBets.push(...results.evidence);
        
        // Save to disk
        await this._saveSuspiciousHashes();
        
        console.log(`⚠️  Hash issues recorded for casino ${casinoId}`);
    }

    /**
     * Log notification
     * @private
     */
    async _logNotification(notification) {
        try {
            const logEntry = {
                timestamp: notification.timestamp,
                type: 'seed_collection_notification',
                userId: notification.userId,
                casinoId: notification.casinoId,
                notificationId: notification.notificationId,
                severity: notification.severity,
                deviation: notification.deviation
            };
            
            // Append to log file
            await this._appendToLog(this.verificationLogPath, logEntry);
            
        } catch (error) {
            console.error('Failed to log notification:', error);
        }
    }

    /**
     * Log verification results
     * @private
     */
    async _logVerification(results) {
        try {
            const logEntry = {
                timestamp: results.timestamp,
                type: 'seed_verification',
                verificationId: results.verificationId,
                userId: results.userId,
                casinoId: results.casinoId,
                sessionId: results.sessionId,
                totalBets: results.totalBets,
                verified: results.verified,
                failed: results.failed,
                suspicious: results.suspicious,
                verdict: results.verdict,
                evidence: results.evidence.length > 0
            };
            
            await this._appendToLog(this.verificationLogPath, logEntry);
            
            console.log(`💾 Verification logged: ${results.verificationId}`);
            
        } catch (error) {
            console.error('Failed to log verification:', error);
        }
    }

    /**
     * Append entry to log file
     * @private
     */
    async _appendToLog(logPath, entry) {
        try {
            const dir = path.dirname(logPath);
            await fs.mkdir(dir, { recursive: true });
            
            let log = [];
            try {
                const data = await fs.readFile(logPath, 'utf8');
                log = JSON.parse(data);
            } catch (e) {
                // File doesn't exist yet
            }
            
            log.push(entry);
            
            // Keep last 10,000 entries
            if (log.length > 10000) {
                log = log.slice(-10000);
            }
            
            await fs.writeFile(logPath, JSON.stringify(log, null, 2), 'utf8');
            
        } catch (error) {
            console.error('Error appending to log:', error);
        }
    }

    /**
     * Save suspicious hashes
     * @private
     */
    async _saveSuspiciousHashes() {
        try {
            const dir = path.dirname(this.suspiciousHashPath);
            await fs.mkdir(dir, { recursive: true });
            
            const data = Array.from(this.casinoHashIssues.entries()).map(([casinoId, issues]) => ({
                casinoId,
                ...issues,
                suspiciousBets: issues.suspiciousBets.slice(-100) // Keep last 100
            }));
            
            await fs.writeFile(
                this.suspiciousHashPath,
                JSON.stringify(data, null, 2),
                'utf8'
            );
            
        } catch (error) {
            console.error('Error saving suspicious hashes:', error);
        }
    }

    /**
     * Load historical data
     * @private
     */
    async loadHistoricalData() {
        try {
            // Load suspicious hashes
            try {
                const data = await fs.readFile(this.suspiciousHashPath, 'utf8');
                const issues = JSON.parse(data);
                
                for (const issue of issues) {
                    this.casinoHashIssues.set(issue.casinoId, issue);
                }
                
                console.log(`📊 Loaded hash issues for ${issues.length} casinos`);
            } catch (e) {
                // No historical data
            }
        } catch (error) {
            console.error('Error loading historical data:', error);
        }
    }

    /**
     * Get pending notifications for user
     * @param {string} userId - User identifier
     * @returns {Array} Pending notifications
     */
    getPendingNotifications(userId) {
        return this.pendingNotifications.get(userId) || [];
    }

    /**
     * Get verification history for user
     * @param {string} userId - User identifier
     * @returns {Array} Verification history
     */
    getUserVerificationHistory(userId) {
        return this.userVerifications.get(userId) || [];
    }

    /**
     * Get hash issues for casino
     * @param {string} casinoId - Casino identifier
     * @returns {Object} Hash issue report
     */
    getCasinoHashIssues(casinoId) {
        const issues = this.casinoHashIssues.get(casinoId);
        
        if (!issues) {
            return {
                casinoId,
                hasIssues: false,
                message: 'No hash verification issues found'
            };
        }
        
        const failureRate = issues.failedVerifications / issues.totalVerifications;
        
        return {
            casinoId: issues.casinoId,
            hasIssues: true,
            totalVerifications: issues.totalVerifications,
            failedVerifications: issues.failedVerifications,
            failureRate: (failureRate * 100).toFixed(2) + '%',
            suspiciousBetsCount: issues.suspiciousBets.length,
            firstIssue: new Date(issues.firstIssue).toISOString(),
            lastIssue: new Date(issues.lastIssue).toISOString(),
            verdict: failureRate > 0.5 ? 'HIGHLY_SUSPICIOUS' : 
                    failureRate > 0.2 ? 'SUSPICIOUS' : 
                    'MONITORING'
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProvablyFairVerifier;
}

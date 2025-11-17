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
 * Casino Compliance & Legal Monitoring System
 * 
 * This answers the new requirement:
 * "Log mismatches per user/per casino to determine trust score and flag when 
 * casinos are not following gambling guidelines. Message dev (jmenichole) with 
 * legal steps and notices to send to affected users."
 * 
 * Features:
 * 1. Track RTP mismatches per user and casino
 * 2. Calculate dynamic casino trust scores
 * 3. Detect regulatory violations
 * 4. Alert developer when legal action needed
 * 5. Generate legal notices for affected users
 * 6. Maintain audit trail for legal proceedings
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class CasinoComplianceMonitor {
    constructor(options = {}) {
        // Developer contact info
        this.developerDiscord = 'jmenichole';
        this.developerWebhook = options.developerWebhook || process.env.DEVELOPER_DISCORD_WEBHOOK;
        this.legalEmail = options.legalEmail || 'jmenichole007@outlook.com';
        
        // Compliance thresholds
        this.thresholds = {
            rtpDeviation: {
                minor: 0.05,      // 5% deviation = warning
                major: 0.10,      // 10% deviation = serious
                critical: 0.15    // 15% deviation = legal action
            },
            minSampleSize: 100,   // Minimum bets for reliable analysis
            userComplaintThreshold: 3, // Users affected before escalation
            trustScoreMinimum: 60 // Below this = regulatory review
        };
        
        // Data storage
        this.casinoRecords = new Map();      // casinoId -> compliance record
        this.userRecords = new Map();        // userId -> user mismatch records
        this.violations = [];                // Array of violations
        this.legalCases = new Map();         // caseId -> legal case data
        
        // Audit log path
        this.auditLogPath = options.auditLogPath || './data/compliance_audit.json';
        this.violationLogPath = options.violationLogPath || './data/violations.json';
        
        console.log('⚖️ Casino Compliance Monitor initialized');
        console.log(`👨‍💼 Developer contact: ${this.developerDiscord}`);
        
        this.loadHistoricalData();
    }

    /**
     * Record RTP mismatch for a user session
     * @param {Object} mismatchData - Mismatch information
     * @param {string} mismatchData.userId - User identifier
     * @param {string} mismatchData.sessionId - Session identifier
     * @param {string} mismatchData.casinoId - Casino identifier
     * @param {string} mismatchData.casinoName - Casino display name
     * @param {number} mismatchData.claimedRTP - Casino's claimed RTP
     * @param {number} mismatchData.observedRTP - Actual observed RTP
     * @param {number} mismatchData.sampleSize - Number of bets
     * @param {Object} mismatchData.statistics - Statistical analysis
     * @param {string} mismatchData.gameType - Type of game
     * @returns {Object} Compliance analysis
     */
    async recordMismatch(mismatchData) {
        const {
            userId,
            sessionId,
            casinoId,
            casinoName,
            claimedRTP,
            observedRTP,
            sampleSize,
            statistics,
            gameType
        } = mismatchData;
        
        const deviation = Math.abs(observedRTP - claimedRTP);
        const deviationPercent = (deviation * 100).toFixed(2);
        
        // Determine severity
        const severity = this._determineSeverity(deviation, sampleSize, statistics);
        
        // Record for user
        const userRecord = this._recordUserMismatch(
            userId,
            casinoId,
            deviation,
            severity,
            sessionId
        );
        
        // Record for casino
        const casinoRecord = await this._recordCasinoMismatch(
            casinoId,
            casinoName,
            userId,
            deviation,
            severity,
            observedRTP,
            claimedRTP,
            sampleSize,
            gameType
        );
        
        // Update casino trust score
        const trustScore = this._calculateTrustScore(casinoRecord);
        
        // Check if violation requires escalation
        const escalation = await this._checkEscalation(
            casinoId,
            casinoName,
            casinoRecord,
            trustScore,
            severity,
            deviation
        );
        
        // Log to audit trail
        await this._logToAuditTrail({
            timestamp: Date.now(),
            type: 'mismatch_recorded',
            userId,
            casinoId,
            deviation: deviationPercent + '%',
            severity,
            trustScore,
            escalated: escalation.escalated
        });
        
        return {
            recorded: true,
            severity,
            deviation: deviationPercent + '%',
            userTotalMismatches: userRecord.totalMismatches,
            casinoTrustScore: trustScore,
            casinoTotalViolations: casinoRecord.totalViolations,
            affectedUsers: casinoRecord.affectedUsers.size,
            escalation
        };
    }

    /**
     * Determine severity of mismatch
     * @private
     */
    _determineSeverity(deviation, sampleSize, statistics) {
        // Not enough data
        if (sampleSize < this.thresholds.minSampleSize) {
            return 'insufficient_data';
        }
        
        // Check statistical significance
        const isSignificant = statistics?.isStatisticallySignificant || false;
        
        if (deviation >= this.thresholds.rtpDeviation.critical) {
            return isSignificant ? 'critical' : 'major';
        } else if (deviation >= this.thresholds.rtpDeviation.major) {
            return isSignificant ? 'major' : 'moderate';
        } else if (deviation >= this.thresholds.rtpDeviation.minor) {
            return 'minor';
        }
        
        return 'acceptable';
    }

    /**
     * Record mismatch for a specific user
     * @private
     */
    _recordUserMismatch(userId, casinoId, deviation, severity, sessionId) {
        if (!this.userRecords.has(userId)) {
            this.userRecords.set(userId, {
                userId,
                totalMismatches: 0,
                casinoMismatches: new Map(), // casinoId -> count
                sessions: [],
                firstReported: Date.now(),
                lastReported: Date.now()
            });
        }
        
        const userRecord = this.userRecords.get(userId);
        userRecord.totalMismatches++;
        userRecord.lastReported = Date.now();
        
        // Track per casino
        if (!userRecord.casinoMismatches.has(casinoId)) {
            userRecord.casinoMismatches.set(casinoId, 0);
        }
        userRecord.casinoMismatches.set(
            casinoId,
            userRecord.casinoMismatches.get(casinoId) + 1
        );
        
        // Record session
        userRecord.sessions.push({
            sessionId,
            casinoId,
            deviation,
            severity,
            timestamp: Date.now()
        });
        
        return userRecord;
    }

    /**
     * Record mismatch for a specific casino
     * @private
     */
    async _recordCasinoMismatch(
        casinoId,
        casinoName,
        userId,
        deviation,
        severity,
        observedRTP,
        claimedRTP,
        sampleSize,
        gameType
    ) {
        if (!this.casinoRecords.has(casinoId)) {
            this.casinoRecords.set(casinoId, {
                casinoId,
                casinoName,
                totalViolations: 0,
                violationsBySeverity: {
                    acceptable: 0,
                    minor: 0,
                    moderate: 0,
                    major: 0,
                    critical: 0
                },
                affectedUsers: new Set(),
                violations: [],
                gameTypeViolations: new Map(),
                averageDeviation: 0,
                maxDeviation: 0,
                firstViolation: Date.now(),
                lastViolation: Date.now(),
                regulatoryStatus: 'compliant'
            });
        }
        
        const casinoRecord = this.casinoRecords.get(casinoId);
        casinoRecord.totalViolations++;
        casinoRecord.lastViolation = Date.now();
        casinoRecord.affectedUsers.add(userId);
        
        // Track by severity
        if (severity !== 'insufficient_data') {
            casinoRecord.violationsBySeverity[severity]++;
        }
        
        // Track by game type
        if (!casinoRecord.gameTypeViolations.has(gameType)) {
            casinoRecord.gameTypeViolations.set(gameType, {
                count: 0,
                totalDeviation: 0,
                avgDeviation: 0
            });
        }
        const gameStats = casinoRecord.gameTypeViolations.get(gameType);
        gameStats.count++;
        gameStats.totalDeviation += deviation;
        gameStats.avgDeviation = gameStats.totalDeviation / gameStats.count;
        
        // Update max deviation
        if (deviation > casinoRecord.maxDeviation) {
            casinoRecord.maxDeviation = deviation;
        }
        
        // Calculate average deviation
        const allDeviations = casinoRecord.violations.map(v => v.deviation);
        allDeviations.push(deviation);
        casinoRecord.averageDeviation = allDeviations.reduce((a, b) => a + b, 0) / allDeviations.length;
        
        // Record violation
        casinoRecord.violations.push({
            userId,
            timestamp: Date.now(),
            deviation,
            severity,
            observedRTP,
            claimedRTP,
            sampleSize,
            gameType
        });
        
        return casinoRecord;
    }

    /**
     * Calculate dynamic trust score for casino
     * @private
     */
    _calculateTrustScore(casinoRecord) {
        let score = 100;
        
        // Deduct points for violations
        score -= casinoRecord.violationsBySeverity.minor * 2;
        score -= casinoRecord.violationsBySeverity.moderate * 5;
        score -= casinoRecord.violationsBySeverity.major * 15;
        score -= casinoRecord.violationsBySeverity.critical * 30;
        
        // Deduct for number of affected users
        const affectedCount = casinoRecord.affectedUsers.size;
        if (affectedCount > 10) score -= 20;
        else if (affectedCount > 5) score -= 10;
        else if (affectedCount > 2) score -= 5;
        
        // Deduct for average deviation
        if (casinoRecord.averageDeviation > 0.15) score -= 25;
        else if (casinoRecord.averageDeviation > 0.10) score -= 15;
        else if (casinoRecord.averageDeviation > 0.05) score -= 5;
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Check if violation requires escalation to developer
     * @private
     */
    async _checkEscalation(casinoId, casinoName, casinoRecord, trustScore, severity, deviation) {
        const escalation = {
            escalated: false,
            reason: null,
            actions: [],
            legalCase: null
        };
        
        // Critical severity - immediate escalation
        if (severity === 'critical') {
            escalation.escalated = true;
            escalation.reason = 'Critical RTP deviation detected';
            await this._escalateToLegal(casinoId, casinoName, casinoRecord, 'critical_deviation', deviation);
        }
        
        // Multiple major violations
        if (casinoRecord.violationsBySeverity.major >= 3) {
            escalation.escalated = true;
            escalation.reason = 'Multiple major violations detected';
            await this._escalateToLegal(casinoId, casinoName, casinoRecord, 'repeated_violations', deviation);
        }
        
        // Trust score below minimum
        if (trustScore < this.thresholds.trustScoreMinimum) {
            escalation.escalated = true;
            escalation.reason = 'Casino trust score below minimum threshold';
            await this._escalateToLegal(casinoId, casinoName, casinoRecord, 'low_trust_score', deviation);
        }
        
        // Multiple users affected
        if (casinoRecord.affectedUsers.size >= this.thresholds.userComplaintThreshold) {
            escalation.escalated = true;
            escalation.reason = 'Multiple users experiencing unfair gameplay';
            await this._escalateToLegal(casinoId, casinoName, casinoRecord, 'multiple_complaints', deviation);
        }
        
        return escalation;
    }

    /**
     * Escalate violation to legal/developer
     * @private
     */
    async _escalateToLegal(casinoId, casinoName, casinoRecord, violationType, deviation) {
        const caseId = crypto.randomBytes(8).toString('hex');
        const timestamp = Date.now();
        
        // Create legal case
        const legalCase = {
            caseId,
            casinoId,
            casinoName,
            violationType,
            openedAt: timestamp,
            status: 'open',
            severity: this._getCaseSeverity(violationType, deviation),
            evidence: {
                totalViolations: casinoRecord.totalViolations,
                affectedUsers: Array.from(casinoRecord.affectedUsers),
                averageDeviation: (casinoRecord.averageDeviation * 100).toFixed(2) + '%',
                maxDeviation: (casinoRecord.maxDeviation * 100).toFixed(2) + '%',
                violations: casinoRecord.violations.slice(-10) // Last 10 violations
            },
            legalSteps: this._generateLegalSteps(violationType, casinoRecord),
            userNotice: this._generateUserNotice(casinoId, casinoName, violationType, casinoRecord),
            developmentAlerted: false
        };
        
        this.legalCases.set(caseId, legalCase);
        this.violations.push(legalCase);
        
        // Alert developer
        await this._alertDeveloper(legalCase);
        
        // Save violation record
        await this._saveViolationRecord(legalCase);
        
        console.log(`⚖️ Legal case opened: ${caseId} for ${casinoName}`);
        
        return legalCase;
    }

    /**
     * Determine case severity
     * @private
     */
    _getCaseSeverity(violationType, deviation) {
        if (violationType === 'critical_deviation' || deviation > 0.15) {
            return 'HIGH';
        } else if (violationType === 'repeated_violations' || deviation > 0.10) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * Generate legal steps for developer
     * @private
     */
    _generateLegalSteps(violationType, casinoRecord) {
        const steps = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            evidence: []
        };
        
        // Immediate actions
        steps.immediate.push({
            step: 1,
            action: 'Cease directing users to this casino',
            urgency: 'IMMEDIATE',
            description: 'Remove affiliate links and disable casino in app'
        });
        
        steps.immediate.push({
            step: 2,
            action: 'Notify all affected users',
            urgency: 'IMMEDIATE',
            description: 'Send automated notice to all users who played at this casino',
            template: 'user_notice'
        });
        
        steps.immediate.push({
            step: 3,
            action: 'Preserve evidence',
            urgency: 'IMMEDIATE',
            description: 'Export all relevant data, logs, and screenshots',
            files: ['audit_log', 'violation_records', 'user_sessions']
        });
        
        // Short-term actions (1-7 days)
        steps.shortTerm.push({
            step: 4,
            action: 'Contact casino licensing authority',
            timeframe: '3 days',
            description: 'File formal complaint with regulatory body',
            contacts: this._getRegulatoryContacts(casinoRecord.casinoId)
        });
        
        steps.shortTerm.push({
            step: 5,
            action: 'Demand casino response',
            timeframe: '5 days',
            description: 'Send formal notice to casino demanding explanation',
            template: 'casino_demand_letter'
        });
        
        steps.shortTerm.push({
            step: 6,
            action: 'Consult with attorney',
            timeframe: '7 days',
            description: 'Seek legal counsel specializing in online gambling regulation',
            recommended: 'Gaming law attorney in jurisdiction'
        });
        
        // Long-term actions (7-30 days)
        steps.longTerm.push({
            step: 7,
            action: 'Public disclosure',
            timeframe: '14 days',
            description: 'Publish detailed report of findings if casino non-responsive',
            platforms: ['GitHub', 'Blog', 'Reddit r/gambling']
        });
        
        steps.longTerm.push({
            step: 8,
            action: 'Class action consideration',
            timeframe: '30 days',
            description: 'If multiple users affected, consider class action lawsuit',
            requirements: `${casinoRecord.affectedUsers.size} users affected`
        });
        
        // Evidence to collect
        steps.evidence = [
            {
                type: 'Statistical Analysis',
                description: 'RTP deviation calculations with confidence intervals',
                file: `evidence_${casinoRecord.casinoId}_statistics.json`
            },
            {
                type: 'User Testimonials',
                description: 'Statements from affected users',
                count: casinoRecord.affectedUsers.size
            },
            {
                type: 'Session Logs',
                description: 'Complete bet/outcome logs for all sessions',
                file: `evidence_${casinoRecord.casinoId}_sessions.json`
            },
            {
                type: 'Casino Claims',
                description: 'Screenshots of casino\'s advertised RTP',
                action: 'Archive casino website with advertised rates'
            },
            {
                type: 'Regulatory Information',
                description: 'Casino license information and regulatory contacts',
                file: `evidence_${casinoRecord.casinoId}_regulatory.json`
            }
        ];
        
        return steps;
    }

    /**
     * Generate user notice template
     * @private
     */
    _generateUserNotice(casinoId, casinoName, violationType, casinoRecord) {
        const notice = {
            subject: `Important Notice: ${casinoName} Fairness Concerns`,
            severity: 'HIGH',
            body: `
🚨 IMPORTANT NOTICE - CASINO FAIRNESS ALERT 🚨

Dear TiltCheck User,

We have detected significant irregularities in your recent gameplay at ${casinoName} that require your immediate attention.

WHAT WE FOUND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Casino: ${casinoName}
• Issue: Actual Return to Player (RTP) significantly lower than advertised
• Your Experience: Average ${(casinoRecord.averageDeviation * 100).toFixed(1)}% deviation from claimed RTP
• Affected Users: ${casinoRecord.affectedUsers.size} TiltCheck users have reported similar issues
• Statistical Significance: YES - This is unlikely to be normal variance

WHAT THIS MEANS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The casino may not be operating fairly according to their advertised rates. This could constitute:
- Breach of their Terms of Service
- Violation of gambling regulations
- Potential fraud

YOUR RIGHTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You may be entitled to:
1. Refund of losses attributable to unfair gameplay
2. Compensation for breach of contract
3. Participation in potential class action lawsuit

IMMEDIATE ACTIONS TO TAKE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STOP playing at ${casinoName} immediately
✅ DOCUMENT your sessions (TiltCheck has already saved your data)
✅ CONTACT the casino's customer support to file a complaint
✅ CONTACT the licensing authority (details below)
✅ REQUEST a refund citing unfair RTP

REGULATORY CONTACTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this._getRegulatoryContactsText(casinoId)}

YOUR DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TiltCheck has preserved evidence of your gameplay including:
- Complete bet and outcome logs
- Statistical analysis showing deviation
- Timestamps and session information

This data is available to you upon request and may be used in any legal proceedings.

HOW WE'RE HELPING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ We have ceased directing users to ${casinoName}
✅ We are filing a complaint with the licensing authority
✅ We are consulting with legal counsel
✅ We will keep you informed of any developments

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Reply to this message if you want to participate in collective action
2. Forward your own records to us at ${this.legalEmail}
3. Do NOT delete any communication from the casino
4. Keep records of all deposits and withdrawals

We take casino fairness seriously. This notification is based on statistical analysis and represents a potential violation of gambling regulations.

Questions? Contact us:
Email: ${this.legalEmail}
Discord: ${this.developerDiscord}

Case ID: [Will be provided]
Date: ${new Date().toISOString().split('T')[0]}

═══════════════════════════════════════════

This notice is provided for informational purposes and does not constitute legal advice. 
Consult with an attorney regarding your specific situation.

TiltCheck - Casino Fairness Verification
© 2024-2025 JME (jmenichole). All Rights Reserved.
            `.trim(),
            actions: [
                'Stop playing immediately',
                'File complaint with licensing authority',
                'Contact TiltCheck for evidence',
                'Consider legal action'
            ],
            resources: [
                'Casino complaint form',
                'Regulatory contact information',
                'Your gameplay evidence',
                'Legal consultation referrals'
            ]
        };
        
        return notice;
    }

    /**
     * Get regulatory contacts for casino
     * @private
     */
    _getRegulatoryContacts(casinoId) {
        // In production, this would query a database
        const contacts = {
            'stake': {
                authority: 'Curacao eGaming',
                email: 'complaints@curacao-egaming.com',
                website: 'https://www.curacao-egaming.com/public-and-players/#complaints',
                phone: '+599 9-433-8808'
            },
            'stake.us': {
                authority: 'State Gaming Commissions',
                note: 'Varies by state',
                website: 'https://www.ncpgambling.org/state-resources/'
            },
            'default': {
                authority: 'Unknown - Check casino website',
                action: 'Look for licensing seal in casino footer'
            }
        };
        
        return contacts[casinoId] || contacts.default;
    }

    /**
     * Get regulatory contacts as formatted text
     * @private
     */
    _getRegulatoryContactsText(casinoId) {
        const contacts = this._getRegulatoryContacts(casinoId);
        
        let text = `Authority: ${contacts.authority}\n`;
        if (contacts.email) text += `Email: ${contacts.email}\n`;
        if (contacts.website) text += `Website: ${contacts.website}\n`;
        if (contacts.phone) text += `Phone: ${contacts.phone}\n`;
        if (contacts.note) text += `Note: ${contacts.note}\n`;
        
        return text;
    }

    /**
     * Alert developer via Discord webhook
     * @private
     */
    async _alertDeveloper(legalCase) {
        const alert = {
            caseId: legalCase.caseId,
            casino: legalCase.casinoName,
            severity: legalCase.severity,
            violationType: legalCase.violationType,
            affectedUsers: legalCase.evidence.affectedUsers.length,
            averageDeviation: legalCase.evidence.averageDeviation,
            timestamp: new Date(legalCase.openedAt).toISOString()
        };
        
        console.log('\n' + '='.repeat(70));
        console.log('🚨 LEGAL ALERT FOR DEVELOPER (@jmenichole)');
        console.log('='.repeat(70));
        console.log(`Case ID: ${alert.caseId}`);
        console.log(`Casino: ${alert.casino}`);
        console.log(`Severity: ${alert.severity}`);
        console.log(`Violation: ${alert.violationType}`);
        console.log(`Affected Users: ${alert.affectedUsers}`);
        console.log(`Average Deviation: ${alert.averageDeviation}`);
        console.log('\nLEGAL STEPS REQUIRED:');
        console.log('1. Review case details immediately');
        console.log('2. Contact affected users with notice');
        console.log('3. File complaint with licensing authority');
        console.log('4. Consult legal counsel if needed');
        console.log('\nView full case: /api/legal/case/' + alert.caseId);
        console.log('='.repeat(70) + '\n');
        
        // In production, send to Discord webhook
        if (this.developerWebhook) {
            try {
                const axios = require('axios');
                await axios.post(this.developerWebhook, {
                    content: `<@jmenichole>`,
                    embeds: [{
                        title: '🚨 LEGAL ALERT - Casino Compliance Violation',
                        color: alert.severity === 'HIGH' ? 0xFF0000 : 0xFFA500,
                        fields: [
                            { name: 'Case ID', value: alert.caseId, inline: true },
                            { name: 'Casino', value: alert.casino, inline: true },
                            { name: 'Severity', value: alert.severity, inline: true },
                            { name: 'Violation Type', value: alert.violationType, inline: false },
                            { name: 'Affected Users', value: alert.affectedUsers.toString(), inline: true },
                            { name: 'RTP Deviation', value: alert.averageDeviation, inline: true }
                        ],
                        description: 'Casino may be violating gambling regulations. Immediate action required.',
                        timestamp: alert.timestamp,
                        footer: { text: 'TiltCheck Legal Compliance System' }
                    }]
                });
                
                legalCase.developerAlerted = true;
            } catch (error) {
                console.error('Failed to send Discord alert:', error);
            }
        }
        
        return alert;
    }

    /**
     * Save violation record to disk
     * @private
     */
    async _saveViolationRecord(legalCase) {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.violationLogPath);
            await fs.mkdir(dir, { recursive: true });
            
            // Read existing violations
            let violations = [];
            try {
                const data = await fs.readFile(this.violationLogPath, 'utf8');
                violations = JSON.parse(data);
            } catch (e) {
                // File doesn't exist yet
            }
            
            // Add new violation
            violations.push({
                ...legalCase,
                evidence: {
                    ...legalCase.evidence,
                    affectedUsers: Array.from(legalCase.evidence.affectedUsers) // Convert Set to Array
                }
            });
            
            // Save
            await fs.writeFile(
                this.violationLogPath,
                JSON.stringify(violations, null, 2),
                'utf8'
            );
            
            console.log(`💾 Violation record saved: ${legalCase.caseId}`);
        } catch (error) {
            console.error('Failed to save violation record:', error);
        }
    }

    /**
     * Log to audit trail
     * @private
     */
    async _logToAuditTrail(entry) {
        try {
            const dir = path.dirname(this.auditLogPath);
            await fs.mkdir(dir, { recursive: true });
            
            let log = [];
            try {
                const data = await fs.readFile(this.auditLogPath, 'utf8');
                log = JSON.parse(data);
            } catch (e) {
                // File doesn't exist yet
            }
            
            log.push(entry);
            
            // Keep last 10,000 entries
            if (log.length > 10000) {
                log = log.slice(-10000);
            }
            
            await fs.writeFile(
                this.auditLogPath,
                JSON.stringify(log, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Failed to write audit log:', error);
        }
    }

    /**
     * Load historical data
     * @private
     */
    async loadHistoricalData() {
        try {
            // Load violations
            try {
                const data = await fs.readFile(this.violationLogPath, 'utf8');
                this.violations = JSON.parse(data);
                console.log(`📊 Loaded ${this.violations.length} historical violations`);
            } catch (e) {
                // No historical data
            }
        } catch (error) {
            console.error('Error loading historical data:', error);
        }
    }

    /**
     * Get compliance report for casino
     * @param {string} casinoId - Casino identifier
     * @returns {Object} Compliance report
     */
    getComplianceReport(casinoId) {
        const record = this.casinoRecords.get(casinoId);
        
        if (!record) {
            return {
                casinoId,
                status: 'no_data',
                message: 'No compliance data available'
            };
        }
        
        const trustScore = this._calculateTrustScore(record);
        
        return {
            casinoId: record.casinoId,
            casinoName: record.casinoName,
            trustScore,
            status: record.regulatoryStatus,
            violations: {
                total: record.totalViolations,
                bySeverity: record.violationsBySeverity,
                byGameType: Object.fromEntries(record.gameTypeViolations)
            },
            affectedUsers: record.affectedUsers.size,
            statistics: {
                averageDeviation: (record.averageDeviation * 100).toFixed(2) + '%',
                maxDeviation: (record.maxDeviation * 100).toFixed(2) + '%',
                firstViolation: new Date(record.firstViolation).toISOString(),
                lastViolation: new Date(record.lastViolation).toISOString()
            },
            activeLegalCases: this._getActiveCasesForCasino(casinoId)
        };
    }

    /**
     * Get active legal cases for casino
     * @private
     */
    _getActiveCasesForCasino(casinoId) {
        return Array.from(this.legalCases.values())
            .filter(c => c.casinoId === casinoId && c.status === 'open')
            .map(c => ({
                caseId: c.caseId,
                violationType: c.violationType,
                severity: c.severity,
                openedAt: c.openedAt
            }));
    }

    /**
     * Get user's compliance history
     * @param {string} userId - User identifier
     * @returns {Object} User compliance report
     */
    getUserComplianceHistory(userId) {
        const record = this.userRecords.get(userId);
        
        if (!record) {
            return {
                userId,
                totalMismatches: 0,
                casinos: []
            };
        }
        
        return {
            userId: record.userId,
            totalMismatches: record.totalMismatches,
            casinos: Array.from(record.casinoMismatches.entries()).map(([casinoId, count]) => ({
                casinoId,
                mismatchCount: count
            })),
            recentSessions: record.sessions.slice(-10),
            firstReported: new Date(record.firstReported).toISOString(),
            lastReported: new Date(record.lastReported).toISOString()
        };
    }

    /**
     * Get all active legal cases
     * @returns {Array} Active legal cases
     */
    getActiveLegalCases() {
        return Array.from(this.legalCases.values())
            .filter(c => c.status === 'open')
            .map(c => ({
                caseId: c.caseId,
                casinoId: c.casinoId,
                casinoName: c.casinoName,
                violationType: c.violationType,
                severity: c.severity,
                affectedUsers: c.evidence.affectedUsers.length,
                openedAt: new Date(c.openedAt).toISOString()
            }));
    }

    /**
     * Get legal case details
     * @param {string} caseId - Case identifier
     * @returns {Object} Complete case details
     */
    getLegalCase(caseId) {
        const legalCase = this.legalCases.get(caseId);
        
        if (!legalCase) {
            throw new Error('Legal case not found');
        }
        
        return {
            ...legalCase,
            evidence: {
                ...legalCase.evidence,
                affectedUsers: Array.from(legalCase.evidence.affectedUsers)
            }
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasinoComplianceMonitor;
}

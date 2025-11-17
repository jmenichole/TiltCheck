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
 * AI-Powered Fairness Monitoring System
 * 
 * Real-time monitoring layer that provides intelligent alerts and analysis
 * for casino fairness verification. Works with RTPVerificationAnalyzer to
 * provide human-readable insights and proactive warnings.
 * 
 * This answers: "Can AI help users verify fairness in real-time without API access?"
 * Answer: YES - Through pattern recognition, anomaly detection, and statistical analysis
 */

const RTPVerificationAnalyzer = require('./rtpVerificationAnalyzer.js');

class AIFairnessMonitor {
    constructor(options = {}) {
        this.rtpAnalyzer = new RTPVerificationAnalyzer(options);
        this.alertHandlers = [];
        this.monitoringActive = new Map(); // userId -> monitoring status
        
        // AI-driven alert thresholds
        this.alertConfig = {
            suspiciousRTPDeviation: 0.05, // 5% deviation
            criticalRTPDeviation: 0.10, // 10% deviation
            minBetsForAlert: 50, // Minimum bets before alerting
            alertCooldown: 300000, // 5 minutes between similar alerts
            patternDetectionWindow: 20 // Last N bets to analyze for patterns
        };
        
        // Track alert history to prevent spam
        this.alertHistory = new Map(); // userId -> recent alerts
        
        console.log('🤖 AI Fairness Monitor initialized');
    }

    /**
     * Start monitoring a user's gameplay
     * @param {string} userId - User identifier
     * @param {Object} options - Monitoring options
     * @param {string} options.casinoId - Casino being played
     * @param {string} options.casinoName - Casino display name
     * @param {number} options.claimedRTP - Casino's claimed RTP
     * @param {string} options.claimedHouseEdge - Casino's claimed house edge
     * @returns {Object} Monitoring session info
     */
    startMonitoring(userId, options = {}) {
        const { casinoId, casinoName, claimedRTP, claimedHouseEdge } = options;
        
        this.monitoringActive.set(userId, {
            userId,
            casinoId,
            casinoName,
            claimedRTP,
            claimedHouseEdge,
            startTime: Date.now(),
            lastAlert: 0,
            alertCount: 0
        });
        
        // Initialize alert history for user
        if (!this.alertHistory.has(userId)) {
            this.alertHistory.set(userId, []);
        }
        
        console.log(`🎮 Started monitoring user ${userId} at ${casinoName || casinoId}`);
        
        return {
            status: 'monitoring_started',
            userId,
            casinoId,
            message: `Now monitoring gameplay at ${casinoName || casinoId}. Will analyze fairness in real-time.`
        };
    }

    /**
     * Stop monitoring a user
     * @param {string} userId - User identifier
     * @returns {Object} Final report
     */
    stopMonitoring(userId) {
        const monitoring = this.monitoringActive.get(userId);
        if (!monitoring) {
            return { error: 'User not being monitored' };
        }
        
        // Get final statistics
        const finalStats = this.rtpAnalyzer.getUserStats(userId);
        
        this.monitoringActive.delete(userId);
        
        console.log(`🛑 Stopped monitoring user ${userId}`);
        
        return {
            status: 'monitoring_stopped',
            userId,
            duration: Date.now() - monitoring.startTime,
            totalAlerts: monitoring.alertCount,
            finalStats
        };
    }

    /**
     * Track a bet with AI analysis
     * @param {Object} betData - Bet information (see RTPVerificationAnalyzer.trackBet)
     * @returns {Object} Immediate feedback
     */
    trackBet(betData) {
        const { userId, casinoId } = betData;
        
        // Track in RTP analyzer
        const tracking = this.rtpAnalyzer.trackBet(betData);
        
        // Check if we're monitoring this user
        const monitoring = this.monitoringActive.get(userId);
        if (monitoring) {
            monitoring.lastActivity = Date.now();
        }
        
        return {
            tracked: true,
            sessionId: tracking.sessionId,
            betIndex: tracking.betIndex,
            totalBets: tracking.totalBets,
            message: 'Bet tracked. Analyzing fairness...'
        };
    }

    /**
     * Track outcome with AI analysis and alerts
     * @param {Object} outcomeData - Outcome information (see RTPVerificationAnalyzer.trackOutcome)
     * @returns {Object} Analysis with AI insights
     */
    async trackOutcome(outcomeData) {
        const { userId, sessionId } = outcomeData;
        
        // Track outcome in RTP analyzer
        const analysis = this.rtpAnalyzer.trackOutcome(outcomeData);
        
        // Check if we're monitoring this user
        const monitoring = this.monitoringActive.get(userId);
        if (!monitoring) {
            return analysis; // Not monitoring, just return raw analysis
        }
        
        // AI-powered alert analysis
        const alerts = this._analyzeForAlerts(analysis, monitoring);
        
        // Trigger any necessary alerts
        if (alerts.length > 0) {
            monitoring.alertCount += alerts.length;
            monitoring.lastAlert = Date.now();
            
            // Store in alert history
            const history = this.alertHistory.get(userId) || [];
            history.push(...alerts.map(a => ({ ...a, timestamp: Date.now() })));
            
            // Keep only recent alerts
            this.alertHistory.set(userId, history.slice(-50));
            
            // Notify handlers
            for (const alert of alerts) {
                await this._notifyHandlers(userId, alert, analysis);
            }
        }
        
        // Enhance analysis with AI insights
        return {
            ...analysis,
            aiInsights: this._generateInsights(analysis, monitoring),
            alerts,
            monitoringStatus: {
                totalAlerts: monitoring.alertCount,
                sessionDuration: Date.now() - monitoring.startTime
            }
        };
    }

    /**
     * Analyze for potential alerts
     * @private
     */
    _analyzeForAlerts(analysis, monitoring) {
        const alerts = [];
        
        // Don't alert if insufficient data
        if (!analysis.hasEnoughData) {
            return alerts;
        }
        
        // Check alert cooldown
        if (Date.now() - monitoring.lastAlert < this.alertConfig.alertCooldown) {
            return alerts;
        }
        
        const { fairnessAssessment, observedRTP, expectedRTP, statistics } = analysis;
        const observedRTPValue = parseFloat(observedRTP);
        const expectedRTPValue = expectedRTP.typical;
        const deviation = Math.abs(observedRTPValue - expectedRTPValue);
        
        // Critical deviation alert
        if (deviation > this.alertConfig.criticalRTPDeviation) {
            alerts.push({
                level: 'CRITICAL',
                type: 'rtp_critical_deviation',
                title: '🚨 Critical RTP Deviation Detected',
                message: `Observed RTP (${(observedRTPValue * 100).toFixed(2)}%) deviates significantly from expected (${(expectedRTPValue * 100).toFixed(2)}%).`,
                recommendation: fairnessAssessment.recommendation,
                trustScore: fairnessAssessment.trustScore,
                requiresAction: true
            });
        }
        // Suspicious deviation alert
        else if (deviation > this.alertConfig.suspiciousRTPDeviation) {
            alerts.push({
                level: 'WARNING',
                type: 'rtp_suspicious_deviation',
                title: '⚠️ Suspicious RTP Pattern',
                message: `Observed RTP (${(observedRTPValue * 100).toFixed(2)}%) is outside expected range (${(expectedRTP.min * 100).toFixed(2)}% - ${(expectedRTP.max * 100).toFixed(2)}%).`,
                recommendation: 'Continue monitoring. This may be normal variance or indicate issues.',
                trustScore: fairnessAssessment.trustScore,
                requiresAction: false
            });
        }
        
        // Statistical significance alert
        if (statistics.isStatisticallySignificant && observedRTPValue < expectedRTPValue) {
            alerts.push({
                level: 'WARNING',
                type: 'statistical_anomaly',
                title: '📊 Statistically Significant Unfairness',
                message: `Results are statistically significant (p=${statistics.pValue}) and unfavorable to player.`,
                recommendation: 'This is unlikely to occur by chance. Consider switching games or casinos.',
                trustScore: fairnessAssessment.trustScore,
                requiresAction: true
            });
        }
        
        // Verdict-based alerts
        if (fairnessAssessment.verdict === 'HIGHLY_SUSPICIOUS') {
            alerts.push({
                level: 'CRITICAL',
                type: 'highly_suspicious',
                title: '🚨 HIGHLY SUSPICIOUS ACTIVITY',
                message: 'Multiple indicators suggest unfair gameplay.',
                recommendation: fairnessAssessment.recommendation,
                trustScore: fairnessAssessment.trustScore,
                requiresAction: true
            });
        }
        
        return alerts;
    }

    /**
     * Generate AI insights from analysis
     * @private
     */
    _generateInsights(analysis, monitoring) {
        const insights = [];
        
        const observedRTP = parseFloat(analysis.observedRTP);
        const expectedRTP = analysis.expectedRTP.typical;
        
        // Data quality insight
        if (!analysis.hasEnoughData) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'Building Statistical Confidence',
                message: `Collected ${analysis.betsCompleted}/${analysis.minSampleSize} bets. More data will improve accuracy of fairness assessment.`
            });
        } else {
            insights.push({
                type: 'success',
                icon: '✅',
                title: 'Sufficient Data Collected',
                message: `Analysis is statistically reliable with ${analysis.betsCompleted} bets.`
            });
        }
        
        // RTP comparison insight
        const rtpDiff = ((observedRTP - expectedRTP) * 100).toFixed(2);
        if (observedRTP > expectedRTP) {
            insights.push({
                type: 'positive',
                icon: '🎰',
                title: 'Favorable Variance',
                message: `Your actual RTP (${analysis.observedRTPPercent}) is ${rtpDiff}% higher than expected. This is good luck!`
            });
        } else if (observedRTP < expectedRTP - 0.02) {
            insights.push({
                type: 'negative',
                icon: '📉',
                title: 'Unfavorable Results',
                message: `Your actual RTP (${analysis.observedRTPPercent}) is ${Math.abs(rtpDiff)}% lower than expected.`
            });
        } else {
            insights.push({
                type: 'neutral',
                icon: '📊',
                title: 'Normal Variance',
                message: `Your RTP (${analysis.observedRTPPercent}) is within expected range.`
            });
        }
        
        // House edge insight
        insights.push({
            type: 'info',
            icon: '🏠',
            title: 'House Edge Analysis',
            message: `Observed house edge: ${analysis.observedHouseEdge} (Expected: ${analysis.expectedHouseEdge})`
        });
        
        // Trust score insight
        const trustScore = analysis.fairnessAssessment.trustScore;
        if (trustScore >= 90) {
            insights.push({
                type: 'success',
                icon: '✅',
                title: 'High Trust Score',
                message: `Casino trust score: ${trustScore}/100 - Operating fairly`
            });
        } else if (trustScore >= 70) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Moderate Trust Score',
                message: `Casino trust score: ${trustScore}/100 - Monitor closely`
            });
        } else {
            insights.push({
                type: 'danger',
                icon: '🚨',
                title: 'Low Trust Score',
                message: `Casino trust score: ${trustScore}/100 - Exercise caution`
            });
        }
        
        // Session statistics insight
        const duration = analysis.sessionDuration / 1000 / 60; // minutes
        insights.push({
            type: 'info',
            icon: '⏱️',
            title: 'Session Statistics',
            message: `${analysis.betsCompleted} bets over ${duration.toFixed(1)} minutes. Average bet: $${(analysis.totalWagered / analysis.betsCompleted).toFixed(2)}`
        });
        
        return insights;
    }

    /**
     * Register an alert handler
     * @param {Function} handler - Function to call when alerts are triggered
     */
    onAlert(handler) {
        this.alertHandlers.push(handler);
    }

    /**
     * Notify all registered handlers
     * @private
     */
    async _notifyHandlers(userId, alert, analysis) {
        for (const handler of this.alertHandlers) {
            try {
                await handler({
                    userId,
                    alert,
                    analysis,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error in alert handler:', error);
            }
        }
    }

    /**
     * Get real-time status for a user
     * @param {string} userId - User identifier
     * @returns {Object} Current monitoring status
     */
    getStatus(userId) {
        const monitoring = this.monitoringActive.get(userId);
        if (!monitoring) {
            return { 
                status: 'not_monitoring',
                message: 'User is not being monitored' 
            };
        }
        
        const userStats = this.rtpAnalyzer.getUserStats(userId);
        const recentAlerts = (this.alertHistory.get(userId) || [])
            .filter(a => Date.now() - a.timestamp < 3600000) // Last hour
            .slice(-5); // Last 5 alerts
        
        return {
            status: 'monitoring',
            monitoring: {
                casinoId: monitoring.casinoId,
                casinoName: monitoring.casinoName,
                duration: Date.now() - monitoring.startTime,
                alertCount: monitoring.alertCount
            },
            stats: userStats,
            recentAlerts,
            claimedRTP: monitoring.claimedRTP,
            claimedHouseEdge: monitoring.claimedHouseEdge
        };
    }

    /**
     * Get comprehensive report for a user's session
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @returns {Object} Detailed report with AI analysis
     */
    getDetailedReport(userId, sessionId) {
        const analysis = this.rtpAnalyzer.analyzeSession(userId, sessionId);
        const monitoring = this.monitoringActive.get(userId);
        
        if (analysis.error) {
            return analysis;
        }
        
        return {
            ...analysis,
            aiInsights: monitoring ? this._generateInsights(analysis, monitoring) : [],
            alertHistory: (this.alertHistory.get(userId) || [])
                .filter(a => a.sessionId === sessionId),
            reportGenerated: Date.now(),
            reportType: 'detailed_fairness_analysis'
        };
    }

    /**
     * Generate a summary report for a casino
     * @param {string} casinoId - Casino identifier
     * @returns {Object} Casino-wide fairness report
     */
    getCasinoReport(casinoId) {
        const casinoAnalysis = this.rtpAnalyzer.analyzeCasino(casinoId);
        
        if (casinoAnalysis.error) {
            return casinoAnalysis;
        }
        
        // Calculate overall trust assessment
        const observedRTP = parseFloat(casinoAnalysis.observedRTP) / 100;
        let trustVerdict = 'Unknown';
        let trustScore = 50;
        
        if (casinoAnalysis.totalBets >= 1000) {
            if (observedRTP >= 0.90) {
                trustVerdict = 'Trustworthy';
                trustScore = 85;
            } else if (observedRTP >= 0.85) {
                trustVerdict = 'Acceptable';
                trustScore = 70;
            } else {
                trustVerdict = 'Concerning';
                trustScore = 40;
            }
        }
        
        return {
            ...casinoAnalysis,
            trustAssessment: {
                verdict: trustVerdict,
                trustScore,
                basedOnBets: casinoAnalysis.totalBets,
                dataQuality: casinoAnalysis.totalBets >= 1000 ? 'High' : 'Moderate'
            },
            reportType: 'casino_fairness_report'
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIFairnessMonitor;
}

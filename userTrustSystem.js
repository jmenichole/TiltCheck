/**
 * User Trust & Suspicious Activity Scoring System
 * Implements dual-tier scoring for casino trust vs user behavioral trust
 * Built for degens by degens who learned the hard way
 */

const fs = require('fs');
const path = require('path');

class UserTrustSystem {
    constructor() {
        this.userTrustDataPath = './data/user_trust_scores.json';
        this.behaviorHistoryPath = './data/user_behavior_history.json';
        this.interventionLogPath = './data/intervention_log.json';
        
        // Score weights and thresholds
        this.SCORE_WEIGHTS = {
            gambling_discipline: 300,
            community_behavior: 250,
            accountability_engagement: 200,
            consistency_patterns: 150,
            support_network: 100
        };
        
        this.SUS_THRESHOLDS = {
            CRITICAL: 80,
            HIGH_RISK: 60,
            MODERATE_RISK: 40,
            LOW_RISK: 20
        };
        
        this.TRUST_TIERS = {
            ELITE: 800,
            TRUSTED: 600,
            AVERAGE: 400,
            DEVELOPING: 200,
            NEW_USER: 0
        };
        
        this.ensureDataDirectories();
    }

    ensureDataDirectories() {
        const dataDir = './data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initialize data files if they don't exist
        [this.userTrustDataPath, this.behaviorHistoryPath, this.interventionLogPath].forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            }
        });
    }

    // ===== CASINO TRUST SCORE (External Verification) =====
    
    /**
     * Calculate casino trust score for loan eligibility
     * Range: 0-100 points
     */
    async calculateCasinoTrustScore(userId) {
        try {
            const paymentHistory = this.calculatePaymentHistory(userId);
            const casinoConnections = this.calculateCasinoConnections(userId);
            const complianceBonus = this.calculateComplianceBonus(userId);
            const diversityBonus = this.calculateDiversityBonus(userId);
            const respectScore = this.calculateRespectScore(userId);
            
            const totalScore = paymentHistory + casinoConnections + complianceBonus + diversityBonus + respectScore;
            
            const riskLevel = this.classifyCasinoRisk(totalScore);
            
            return {
                totalScore: Math.round(totalScore),
                breakdown: {
                    paymentHistory: Math.round(paymentHistory),
                    casinoConnections: Math.round(casinoConnections),
                    complianceBonus: Math.round(complianceBonus),
                    diversityBonus: Math.round(diversityBonus),
                    respectScore: Math.round(respectScore)
                },
                riskLevel,
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Casino trust score calculation error:', error);
            return this.getDefaultCasinoTrustScore();
        }
    }

    calculatePaymentHistory(userId) {
        // Load from existing user trust system
        const userTrust = this.loadUserTrust()[userId] || { successfulPayments: 0, defaulted: 0 };
        const baseScore = Math.min(userTrust.successfulPayments * 8, 40);
        const penalty = userTrust.defaulted * 10;
        return Math.max(0, baseScore - penalty);
    }

    calculateCasinoConnections(userId) {
        // Integrate with existing casino verification system
        const connections = this.loadCasinoConnections()[userId] || {};
        let totalScore = 0;
        let totalWeight = 0;
        
        // This would integrate with existing DEGEN_APPROVED_CASINOS
        const verifiedCasinos = Object.keys(connections).filter(casino => connections[casino]?.verified);
        
        verifiedCasinos.forEach(casino => {
            const connection = connections[casino];
            const quality = this.calculateConnectionQuality(connection);
            totalScore += quality;
            totalWeight += 1;
        });
        
        return totalWeight > 0 ? Math.min((totalScore / totalWeight) * 35, 35) : 0;
    }

    // ===== USER TRUST SCORE (Behavioral Analysis) =====
    
    /**
     * Calculate comprehensive user trust score
     * Range: 0-1000 points
     */
    async calculateUserTrustScore(userId) {
        try {
            const gamblingDiscipline = await this.calculateGamblingDiscipline(userId);
            const communityBehavior = await this.calculateCommunityBehavior(userId);
            const accountabilityEngagement = await this.calculateAccountabilityEngagement(userId);
            const consistencyPatterns = await this.calculateConsistencyPatterns(userId);
            const supportNetworkActivity = await this.calculateSupportNetworkActivity(userId);
            
            const totalScore = gamblingDiscipline + communityBehavior + accountabilityEngagement + 
                             consistencyPatterns + supportNetworkActivity;
            
            const trustTier = this.classifyUserTrust(totalScore);
            
            const userTrustScore = {
                totalScore: Math.round(totalScore),
                breakdown: {
                    gamblingDiscipline: Math.round(gamblingDiscipline),
                    communityBehavior: Math.round(communityBehavior),
                    accountabilityEngagement: Math.round(accountabilityEngagement),
                    consistencyPatterns: Math.round(consistencyPatterns),
                    supportNetworkActivity: Math.round(supportNetworkActivity)
                },
                trustTier,
                calculatedAt: new Date().toISOString()
            };
            
            // Store the score
            this.saveUserTrustScore(userId, userTrustScore);
            
            return userTrustScore;
        } catch (error) {
            console.error('User trust score calculation error:', error);
            return this.getDefaultUserTrustScore();
        }
    }

    async calculateGamblingDiscipline(userId) {
        const sessions = await this.getUserGamblingSessions(userId);
        const tiltHistory = await this.getUserTiltHistory(userId);
        
        let disciplineScore = 200; // Base score
        
        // Session quality analysis
        sessions.forEach(session => {
            const grade = this.calculateSessionGrade(session);
            switch(grade.letter) {
                case 'A+': disciplineScore += 15; break;
                case 'A':  disciplineScore += 10; break;
                case 'B+': disciplineScore += 5; break;
                case 'C':  disciplineScore -= 5; break;
                case 'D':  disciplineScore -= 10; break;
                case 'F':  disciplineScore -= 20; break;
            }
        });
        
        // Tilt management
        const tiltEvents = tiltHistory.filter(event => event.type === 'tilt_detected');
        const tiltRecovery = tiltHistory.filter(event => event.type === 'tilt_recovered');
        disciplineScore -= tiltEvents.length * 5;
        disciplineScore += tiltRecovery.length * 10;
        
        // Consistency bonuses
        const avgSessionLength = this.calculateAvgSessionLength(sessions);
        if (avgSessionLength < 120) disciplineScore += 20; // Under 2 hours
        
        const stakeConsistency = this.calculateStakeConsistency(sessions);
        if (stakeConsistency > 0.8) disciplineScore += 15; // Consistent stake sizing
        
        return Math.max(0, Math.min(300, disciplineScore));
    }

    async calculateCommunityBehavior(userId) {
        const respectPoints = await this.getUserRespectPoints(userId);
        const helpingActions = await this.getUserHelpingActions(userId);
        const reportedIncidents = await this.getUserReportedIncidents(userId);
        
        let behaviorScore = 125; // Base score
        
        // Respect points conversion
        behaviorScore += Math.min(respectPoints / 10, 50); // Max 50 from respect
        
        // Helping other users
        behaviorScore += (helpingActions.accountability_buddy || 0) * 15;
        behaviorScore += (helpingActions.intervention_assists || 0) * 10;
        behaviorScore += (helpingActions.support_provided || 0) * 5;
        
        // Negative behaviors
        behaviorScore -= (reportedIncidents.spam || 0) * 20;
        behaviorScore -= (reportedIncidents.harassment || 0) * 30;
        behaviorScore -= (reportedIncidents.misinformation || 0) * 15;
        
        // Community engagement bonuses
        const discordActivity = await this.getUserDiscordActivity(userId);
        if (discordActivity.helpful_messages > 50) behaviorScore += 25;
        if (discordActivity.constructive_feedback > 10) behaviorScore += 15;
        
        return Math.max(0, Math.min(250, behaviorScore));
    }

    async calculateAccountabilityEngagement(userId) {
        const tiltCheckUsage = await this.getUserTiltCheckUsage(userId);
        const buddySystem = await this.getUserBuddySystemActivity(userId);
        const selfReporting = await this.getUserSelfReporting(userId);
        
        let engagementScore = 100; // Base score
        
        // TiltCheck system usage
        engagementScore += Math.min(tiltCheckUsage.sessions_logged || 0, 50);
        engagementScore += (tiltCheckUsage.breaks_taken || 0) * 5;
        engagementScore += (tiltCheckUsage.limits_set || 0) * 10;
        
        // Buddy system participation
        engagementScore += (buddySystem.buddy_connections || 0) * 15;
        engagementScore += (buddySystem.interventions_received || 0) * 8;
        engagementScore += (buddySystem.check_ins_completed || 0) * 3;
        
        // Self-reporting and transparency
        engagementScore += (selfReporting.honest_loss_reports || 0) * 5;
        engagementScore += (selfReporting.tilt_admissions || 0) * 10;
        engagementScore += (selfReporting.goal_setting || 0) * 8;
        
        return Math.max(0, Math.min(200, engagementScore));
    }

    async calculateConsistencyPatterns(userId) {
        const behaviorHistory = await this.getUserBehaviorHistory(userId, 90); // 90 days
        
        let consistencyScore = 75; // Base score
        
        // Time pattern analysis
        const timeConsistency = this.analyzeBettingTimePatterns(behaviorHistory);
        if (timeConsistency.variance < 0.3) consistencyScore += 25; // Consistent timing
        
        // Stake sizing consistency
        const stakeVariance = this.calculateStakeVariance(behaviorHistory);
        if (stakeVariance < 0.5) consistencyScore += 20; // Consistent stakes
        
        // Platform loyalty (not jumping between casinos during tilt)
        const platformSwitching = this.analyzePlatformSwitching(behaviorHistory);
        if (platformSwitching.tilt_switching < 3) consistencyScore += 15;
        
        // Goal adherence
        const goalAdherence = this.calculateGoalAdherence(behaviorHistory);
        consistencyScore += goalAdherence * 15; // 0-1 multiplier
        
        return Math.max(0, Math.min(150, consistencyScore));
    }

    async calculateSupportNetworkActivity(userId) {
        const networkEngagement = await this.getUserNetworkEngagement(userId);
        
        let networkScore = 50; // Base score
        
        // Active accountability partnerships
        networkScore += (networkEngagement.active_buddies || 0) * 15;
        
        // Group participation
        networkScore += (networkEngagement.group_sessions_attended || 0) * 3;
        networkScore += (networkEngagement.community_challenges_joined || 0) * 5;
        
        // Mentorship (giving and receiving)
        networkScore += (networkEngagement.mentoring_others || 0) * 10;
        networkScore += (networkEngagement.being_mentored || 0) * 5;
        
        return Math.max(0, Math.min(100, networkScore));
    }

    // ===== SUSPICIOUS ACTIVITY DETECTION =====
    
    /**
     * Calculate suspicious activity score
     * Range: 0-100 (higher = more suspicious)
     */
    async calculateSusScore(userId) {
        try {
            let susScore = 0;
            
            // Rapid betting patterns
            const rapidBetting = await this.detectRapidBetting(userId);
            susScore += rapidBetting.intensity * 20;
            
            // Loss chasing indicators
            const lossChasing = await this.detectLossChasing(userId);
            susScore += lossChasing.severity * 25;
            
            // Multi-platform velocity
            const multiPlatform = await this.detectMultiPlatformActivity(userId);
            susScore += multiPlatform.simultaneous_sessions * 15;
            
            // Stake escalation patterns
            const stakeEscalation = await this.detectStakeEscalation(userId);
            susScore += stakeEscalation.aggression_level * 20;
            
            // Time-based red flags
            const timeRedFlags = await this.detectTimeBasedRedFlags(userId);
            susScore += timeRedFlags.late_night_binges * 10;
            susScore += timeRedFlags.extended_sessions * 15;
            
            const finalSusScore = Math.min(100, susScore);
            
            // Log high sus scores
            if (finalSusScore >= this.SUS_THRESHOLDS.HIGH_RISK) {
                this.logSuspiciousActivity(userId, finalSusScore, {
                    rapidBetting, lossChasing, multiPlatform, stakeEscalation, timeRedFlags
                });
            }
            
            return finalSusScore;
        } catch (error) {
            console.error('Sus score calculation error:', error);
            return 0;
        }
    }

    // ===== RISK CLASSIFICATION =====
    
    classifyUserRisk(userTrustScore, susScore) {
        if (susScore >= this.SUS_THRESHOLDS.CRITICAL) return 'CRITICAL_INTERVENTION';
        if (susScore >= this.SUS_THRESHOLDS.HIGH_RISK) return 'HIGH_RISK';
        if (susScore >= this.SUS_THRESHOLDS.MODERATE_RISK) return 'MODERATE_RISK';
        if (userTrustScore >= this.TRUST_TIERS.ELITE) return 'HIGHLY_TRUSTED';
        if (userTrustScore >= this.TRUST_TIERS.TRUSTED) return 'TRUSTED';
        if (userTrustScore >= this.TRUST_TIERS.AVERAGE) return 'AVERAGE';
        if (userTrustScore >= this.TRUST_TIERS.DEVELOPING) return 'DEVELOPING';
        return 'NEW_USER';
    }

    classifyCasinoRisk(casinoScore) {
        if (casinoScore >= 85) return 'very_low';
        if (casinoScore >= 70) return 'low';
        if (casinoScore >= 50) return 'medium';
        if (casinoScore >= 30) return 'high';
        return 'very_high';
    }

    classifyUserTrust(userScore) {
        if (userScore >= this.TRUST_TIERS.ELITE) return 'ELITE';
        if (userScore >= this.TRUST_TIERS.TRUSTED) return 'TRUSTED';
        if (userScore >= this.TRUST_TIERS.AVERAGE) return 'AVERAGE';
        if (userScore >= this.TRUST_TIERS.DEVELOPING) return 'DEVELOPING';
        return 'NEW_USER';
    }

    // ===== INTERVENTION SYSTEM =====
    
    async triggerIntervention(userId, riskLevel, susScore, userTrustScore) {
        const intervention = {
            userId,
            riskLevel,
            susScore,
            userTrustScore,
            timestamp: new Date().toISOString(),
            actions: []
        };

        switch (riskLevel) {
            case 'CRITICAL_INTERVENTION':
                intervention.actions = [
                    'disable_betting_commands',
                    'alert_accountability_buddies',
                    'trigger_cooling_off_period',
                    'admin_notification',
                    'crisis_support_contact'
                ];
                break;
                
            case 'HIGH_RISK':
                intervention.actions = [
                    'tiltcheck_reminders',
                    'buddy_system_activation',
                    'limit_suggestions',
                    'progress_check_ins',
                    'enhanced_monitoring'
                ];
                break;
                
            case 'MODERATE_RISK':
                intervention.actions = [
                    'gentle_reminders',
                    'resource_sharing',
                    'goal_review_prompts',
                    'community_engagement_encouragement'
                ];
                break;
        }

        this.logIntervention(intervention);
        return intervention;
    }

    // ===== DATA PERSISTENCE =====
    
    saveUserTrustScore(userId, score) {
        const data = this.loadUserTrustData();
        data[userId] = score;
        fs.writeFileSync(this.userTrustDataPath, JSON.stringify(data, null, 2));
    }

    loadUserTrustData() {
        try {
            return JSON.parse(fs.readFileSync(this.userTrustDataPath, 'utf8'));
        } catch (error) {
            return {};
        }
    }

    logSuspiciousActivity(userId, susScore, details) {
        const log = {
            userId,
            susScore,
            details,
            timestamp: new Date().toISOString()
        };
        
        // Append to log file
        const logs = this.loadSuspiciousActivityLogs();
        logs.push(log);
        
        // Keep last 1000 entries
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        fs.writeFileSync('./data/suspicious_activity_log.json', JSON.stringify(logs, null, 2));
    }

    logIntervention(intervention) {
        const interventions = this.loadInterventionLogs();
        interventions.push(intervention);
        
        // Keep last 500 interventions
        if (interventions.length > 500) {
            interventions.splice(0, interventions.length - 500);
        }
        
        fs.writeFileSync(this.interventionLogPath, JSON.stringify(interventions, null, 2));
    }

    // ===== HELPER METHODS (to be implemented with actual data sources) =====
    
    async getUserGamblingSessions(userId) {
        // Integrate with existing TiltCheck system
        return [];
    }

    async getUserTiltHistory(userId) {
        // Integrate with existing tilt detection
        return [];
    }

    async getUserRespectPoints(userId) {
        // Integrate with existing respect system
        return 0;
    }

    // ... Additional helper methods would integrate with existing systems

    // ===== DEFAULT SCORES =====
    
    getDefaultCasinoTrustScore() {
        return {
            totalScore: 0,
            breakdown: {
                paymentHistory: 0,
                casinoConnections: 0,
                complianceBonus: 0,
                diversityBonus: 0,
                respectScore: 0
            },
            riskLevel: 'very_high',
            calculatedAt: new Date().toISOString()
        };
    }

    getDefaultUserTrustScore() {
        return {
            totalScore: 100,
            breakdown: {
                gamblingDiscipline: 50,
                communityBehavior: 25,
                accountabilityEngagement: 15,
                consistencyPatterns: 10,
                supportNetworkActivity: 0
            },
            trustTier: 'NEW_USER',
            calculatedAt: new Date().toISOString()
        };
    }

    // ===== INTEGRATION METHODS =====
    
    loadUserTrust() {
        try {
            return JSON.parse(fs.readFileSync('./user_trust.json', 'utf8'));
        } catch (error) {
            return {};
        }
    }

    loadCasinoConnections() {
        try {
            return JSON.parse(fs.readFileSync('./casino_connections.json', 'utf8'));
        } catch (error) {
            return {};
        }
    }

    loadSuspiciousActivityLogs() {
        try {
            return JSON.parse(fs.readFileSync('./data/suspicious_activity_log.json', 'utf8'));
        } catch (error) {
            return [];
        }
    }

    loadInterventionLogs() {
        try {
            return JSON.parse(fs.readFileSync(this.interventionLogPath, 'utf8'));
        } catch (error) {
            return [];
        }
    }
}

module.exports = UserTrustSystem;

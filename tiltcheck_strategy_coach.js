// TiltCheck Strategy Coach - AI-Powered Gambling Strategy Assistant
// Provides personalized coaching based on user behavior and market analysis

const crypto = require('crypto');

class TiltCheckStrategyCoach {
    constructor() {
        this.userStrategies = new Map();
        this.marketData = new Map();
        this.coachingSession = new Map();
        this.behaviorAnalytics = new Map();
        
        this.initializeCoachingSystem();
    }

    initializeCoachingSystem() {
        console.log("🎯 Initializing TiltCheck Strategy Coach...");
        
        // Initialize coaching modules
        this.strategyModules = {
            bankrollManagement: new BankrollCoach(),
            gameSelection: new GameSelectionCoach(),
            tiltPrevention: new TiltPreventionCoach(),
            bonusOptimization: new BonusCoach(),
            riskAssessment: new RiskAnalysisCoach(),
            timeManagement: new SessionCoach()
        };

        // Load market analysis data
        this.loadMarketIntelligence();
        
        console.log("✅ Strategy Coach system initialized");
    }

    // Main coaching interface
    async getPersonalizedCoaching(userId, sessionData) {
        const userProfile = await this.getUserProfile(userId);
        const currentSession = this.analyzeCurrentSession(sessionData);
        const riskLevel = this.assessRiskLevel(userProfile, currentSession);
        
        const coaching = {
            sessionId: crypto.randomUUID(),
            userId,
            timestamp: Date.now(),
            riskLevel,
            recommendations: await this.generateRecommendations(userProfile, currentSession),
            strategies: await this.suggestStrategies(userProfile, riskLevel),
            warnings: this.checkWarningSignals(userProfile, currentSession),
            actionPlan: this.createActionPlan(userProfile, currentSession),
            marketInsights: this.getMarketInsights(sessionData.games || [])
        };

        // Store coaching session
        this.coachingSession.set(coaching.sessionId, coaching);
        
        return coaching;
    }

    async getUserProfile(userId) {
        if (!this.userStrategies.has(userId)) {
            // Create new user profile
            const profile = {
                userId,
                createdAt: Date.now(),
                totalSessions: 0,
                totalWagered: 0,
                netResult: 0,
                averageSessionLength: 0,
                preferredGames: [],
                riskTolerance: 'medium',
                bankrollSize: 0,
                goals: [],
                weaknesses: [],
                strengths: [],
                coachingHistory: [],
                tiltTriggers: [],
                successPatterns: []
            };
            this.userStrategies.set(userId, profile);
        }
        
        return this.userStrategies.get(userId);
    }

    analyzeCurrentSession(sessionData) {
        return {
            duration: sessionData.duration || 0,
            gamesPlayed: sessionData.games || [],
            currentBankroll: sessionData.bankroll || 0,
            wageredAmount: sessionData.wagered || 0,
            winLossRatio: this.calculateWinLoss(sessionData),
            emotionalState: this.assessEmotionalState(sessionData),
            decisionQuality: this.analyzeDecisionQuality(sessionData),
            streakAnalysis: this.analyzeStreaks(sessionData)
        };
    }

    assessRiskLevel(userProfile, currentSession) {
        let riskScore = 0;
        
        // Bankroll risk factors
        if (currentSession.wageredAmount > userProfile.bankrollSize * 0.2) riskScore += 30;
        if (currentSession.wageredAmount > userProfile.bankrollSize * 0.5) riskScore += 50;
        
        // Session length risk
        if (currentSession.duration > 4 * 60 * 60 * 1000) riskScore += 20; // 4 hours
        if (currentSession.duration > 8 * 60 * 60 * 1000) riskScore += 40; // 8 hours
        
        // Emotional state risk
        if (currentSession.emotionalState === 'tilted') riskScore += 60;
        if (currentSession.emotionalState === 'frustrated') riskScore += 40;
        
        // Win/Loss streak risk
        if (currentSession.streakAnalysis.losingStreak > 5) riskScore += 30;
        if (currentSession.streakAnalysis.losingStreak > 10) riskScore += 50;
        
        if (riskScore >= 80) return 'critical';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 40) return 'medium';
        if (riskScore >= 20) return 'low';
        return 'minimal';
    }

    async generateRecommendations(userProfile, currentSession) {
        const recommendations = [];
        
        // Bankroll management recommendations
        const bankrollAdvice = this.strategyModules.bankrollManagement.analyze(userProfile, currentSession);
        recommendations.push(...bankrollAdvice);
        
        // Game selection recommendations
        const gameAdvice = this.strategyModules.gameSelection.analyze(userProfile, currentSession);
        recommendations.push(...gameAdvice);
        
        // Tilt prevention recommendations
        const tiltAdvice = this.strategyModules.tiltPrevention.analyze(userProfile, currentSession);
        recommendations.push(...tiltAdvice);
        
        // Bonus optimization recommendations
        const bonusAdvice = this.strategyModules.bonusOptimization.analyze(userProfile, currentSession);
        recommendations.push(...bonusAdvice);
        
        return recommendations.sort((a, b) => b.priority - a.priority);
    }

    checkWarningSignals(userProfile, currentSession) {
        const warnings = [];
        
        // Detect chase behavior
        if (this.detectChaseBehavior(currentSession)) {
            warnings.push({
                type: 'chase_behavior',
                severity: 'high',
                message: 'Chase behavior detected - consider taking a break',
                action: 'immediate_intervention'
            });
        }
        
        // Detect bankroll depletion
        if (currentSession.currentBankroll < userProfile.bankrollSize * 0.1) {
            warnings.push({
                type: 'bankroll_critical',
                severity: 'critical',
                message: 'Bankroll critically low - stop loss recommended',
                action: 'emergency_stop'
            });
        }
        
        // Detect extended session
        if (currentSession.duration > 6 * 60 * 60 * 1000) {
            warnings.push({
                type: 'session_length',
                severity: 'medium',
                message: 'Extended session detected - fatigue may affect decisions',
                action: 'break_suggestion'
            });
        }
        
        return warnings;
    }

    createActionPlan(userProfile, currentSession) {
        const plan = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            goals: []
        };
        
        // Immediate actions based on current risk level
        const riskLevel = this.assessRiskLevel(userProfile, currentSession);
        
        if (riskLevel === 'critical' || riskLevel === 'high') {
            plan.immediate.push('Take a 15-minute break');
            plan.immediate.push('Review current bankroll and set strict limits');
            plan.immediate.push('Switch to lower variance games');
        }
        
        // Short-term strategy improvements
        plan.shortTerm.push('Implement strict bankroll management rules');
        plan.shortTerm.push('Set session time limits');
        plan.shortTerm.push('Practice emotional awareness techniques');
        
        // Long-term skill development
        plan.longTerm.push('Develop advanced game strategies');
        plan.longTerm.push('Build consistent profit tracking');
        plan.longTerm.push('Master tilt prevention techniques');
        
        return plan;
    }

    getMarketInsights(games) {
        const insights = [];
        
        games.forEach(game => {
            const gameData = this.marketData.get(game);
            if (gameData) {
                insights.push({
                    game,
                    volatility: gameData.volatility,
                    optimalStrategy: gameData.strategy,
                    expectedValue: gameData.ev,
                    recommendation: gameData.recommendation
                });
            }
        });
        
        return insights;
    }

    loadMarketIntelligence() {
        // Simulate market data loading
        this.marketData.set('slots', {
            volatility: 'high',
            strategy: 'Low variance slots with bonus features',
            ev: -0.02,
            recommendation: 'Play during bonus hours for better RTP'
        });
        
        this.marketData.set('blackjack', {
            volatility: 'low',
            strategy: 'Basic strategy with card counting',
            ev: -0.005,
            recommendation: 'Best odds game - stick to basic strategy'
        });
        
        this.marketData.set('roulette', {
            volatility: 'medium',
            strategy: 'European roulette with even money bets',
            ev: -0.027,
            recommendation: 'Avoid American roulette - higher house edge'
        });
    }

    // Helper methods
    calculateWinLoss(sessionData) {
        if (!sessionData.results) return { wins: 0, losses: 0, ratio: 0 };
        
        const wins = sessionData.results.filter(r => r.result === 'win').length;
        const losses = sessionData.results.filter(r => r.result === 'loss').length;
        
        return {
            wins,
            losses,
            ratio: losses > 0 ? wins / losses : wins
        };
    }

    assessEmotionalState(sessionData) {
        if (!sessionData.results || sessionData.results.length === 0) return 'neutral';
        
        const recentResults = sessionData.results.slice(-10);
        const losses = recentResults.filter(r => r.result === 'loss').length;
        
        if (losses >= 8) return 'tilted';
        if (losses >= 6) return 'frustrated';
        if (losses >= 4) return 'concerned';
        return 'stable';
    }

    analyzeDecisionQuality(sessionData) {
        // Analyze bet sizing patterns, game choice changes, etc.
        return {
            betSizingConsistency: 'good',
            gameSelectionLogic: 'optimal',
            timingDecisions: 'fair',
            overallQuality: 'good'
        };
    }

    analyzeStreaks(sessionData) {
        if (!sessionData.results) return { winStreak: 0, losingStreak: 0 };
        
        let currentWinStreak = 0;
        let currentLossStreak = 0;
        let maxWinStreak = 0;
        let maxLossStreak = 0;
        
        sessionData.results.forEach(result => {
            if (result.result === 'win') {
                currentWinStreak++;
                currentLossStreak = 0;
                maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
            } else {
                currentLossStreak++;
                currentWinStreak = 0;
                maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
            }
        });
        
        return {
            winStreak: currentWinStreak,
            losingStreak: currentLossStreak,
            maxWinStreak,
            maxLossStreak
        };
    }

    detectChaseBehavior(sessionData) {
        if (!sessionData.betHistory) return false;
        
        // Look for increasing bet sizes after losses
        const recentBets = sessionData.betHistory.slice(-10);
        let increasingAfterLoss = 0;
        
        for (let i = 1; i < recentBets.length; i++) {
            if (recentBets[i-1].result === 'loss' && recentBets[i].amount > recentBets[i-1].amount * 1.5) {
                increasingAfterLoss++;
            }
        }
        
        return increasingAfterLoss >= 3;
    }
}

// Specialized coaching modules
class BankrollCoach {
    analyze(userProfile, currentSession) {
        const recommendations = [];
        
        const riskPercentage = (currentSession.wageredAmount / userProfile.bankrollSize) * 100;
        
        if (riskPercentage > 50) {
            recommendations.push({
                type: 'bankroll_management',
                priority: 90,
                message: 'You\'ve wagered over 50% of your bankroll. Consider implementing the 1-2% rule.',
                action: 'reduce_bet_sizes',
                details: 'Never risk more than 2% of your total bankroll on a single bet.'
            });
        }
        
        if (currentSession.currentBankroll < userProfile.bankrollSize * 0.2) {
            recommendations.push({
                type: 'stop_loss',
                priority: 95,
                message: 'Stop-loss trigger activated. Consider ending this session.',
                action: 'end_session',
                details: 'Protect your remaining bankroll for future sessions.'
            });
        }
        
        return recommendations;
    }
}

class GameSelectionCoach {
    analyze(userProfile, currentSession) {
        const recommendations = [];
        
        // Analyze game variance vs bankroll
        if (currentSession.gamesPlayed.includes('slots') && userProfile.bankrollSize < 1000) {
            recommendations.push({
                type: 'game_selection',
                priority: 70,
                message: 'High variance slots may not suit your bankroll size.',
                action: 'switch_games',
                details: 'Consider lower variance games like blackjack or baccarat.'
            });
        }
        
        return recommendations;
    }
}

class TiltPreventionCoach {
    analyze(userProfile, currentSession) {
        const recommendations = [];
        
        if (currentSession.emotionalState === 'tilted' || currentSession.emotionalState === 'frustrated') {
            recommendations.push({
                type: 'tilt_prevention',
                priority: 100,
                message: 'Emotional state detected. Immediate break recommended.',
                action: 'take_break',
                details: 'Step away for 15-30 minutes. Practice deep breathing or light exercise.'
            });
        }
        
        return recommendations;
    }
}

class BonusCoach {
    analyze(userProfile, currentSession) {
        const recommendations = [];
        
        // Analyze bonus utilization
        recommendations.push({
            type: 'bonus_optimization',
            priority: 50,
            message: 'Optimize bonus collection timing.',
            action: 'check_bonuses',
            details: 'Best bonus collection times are typically during off-peak hours.'
        });
        
        return recommendations;
    }
}

class RiskAnalysisCoach {
    analyze(userProfile, currentSession) {
        // Comprehensive risk analysis
        return {
            overallRisk: 'medium',
            factors: ['session_length', 'bet_sizing', 'game_selection'],
            mitigation: ['reduce_session_time', 'lower_bet_sizes', 'choose_lower_variance']
        };
    }
}

class SessionCoach {
    analyze(userProfile, currentSession) {
        const recommendations = [];
        
        if (currentSession.duration > 4 * 60 * 60 * 1000) { // 4 hours
            recommendations.push({
                type: 'session_management',
                priority: 80,
                message: 'Extended session detected. Fatigue affects decision making.',
                action: 'schedule_break',
                details: 'Take a 30-minute break every 2 hours for optimal performance.'
            });
        }
        
        return recommendations;
    }
}

module.exports = { TiltCheckStrategyCoach };

// Example usage
if (require.main === module) {
    const coach = new TiltCheckStrategyCoach();
    
    console.log("🎯 TiltCheck Strategy Coach System");
    console.log("=" .repeat(50));
    
    // Simulate coaching session
    const testSession = {
        duration: 3 * 60 * 60 * 1000, // 3 hours
        games: ['slots', 'blackjack'],
        bankroll: 500,
        wagered: 200,
        results: [
            { result: 'loss', amount: 20 },
            { result: 'loss', amount: 25 },
            { result: 'win', amount: 15 },
            { result: 'loss', amount: 30 },
            { result: 'loss', amount: 35 }
        ],
        betHistory: [
            { amount: 20, result: 'loss' },
            { amount: 25, result: 'loss' },
            { amount: 15, result: 'win' },
            { amount: 30, result: 'loss' },
            { amount: 35, result: 'loss' }
        ]
    };
    
    coach.getPersonalizedCoaching('user123', testSession).then(coaching => {
        console.log("\n🎓 Personalized Coaching Results:");
        console.log(`Risk Level: ${coaching.riskLevel}`);
        console.log(`Recommendations: ${coaching.recommendations.length}`);
        console.log(`Warnings: ${coaching.warnings.length}`);
        
        if (coaching.warnings.length > 0) {
            console.log("\n⚠️ Warning Signals:");
            coaching.warnings.forEach(warning => {
                console.log(`• ${warning.message} (${warning.severity})`);
            });
        }
        
        console.log("\n📋 Top Recommendations:");
        coaching.recommendations.slice(0, 3).forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.message}`);
        });
    });
}

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 */

/**
 * Unified Integration Hub for TiltCheck Ecosystem
 * 
 * This module provides centralized integration between:
 * - TiltCheck (tilt detection and responsible gaming)
 * - JustTheTip (crypto tipping and accountability)
 * - QualifyFirst (alternative earning opportunities)
 * - Vercel AI Gateway (multi-model AI analysis)
 * 
 * Enables seamless data flow, AI-powered insights, and coordinated interventions
 * across the entire ecosystem.
 */

import VercelAIGatewayTiltCheck from './vercel-ai-gateway-integration.js';

class UnifiedEcosystemHub {
  constructor(config = {}) {
    this.config = {
      // AI Gateway configuration
      aiGateway: {
        enabled: config.aiGateway?.enabled ?? true,
        costOptimization: config.aiGateway?.costOptimization ?? true,
        modelStrategy: config.aiGateway?.modelStrategy ?? 'auto'
      },
      
      // TiltCheck configuration
      tiltCheck: {
        enabled: config.tiltCheck?.enabled ?? true,
        alertThresholds: config.tiltCheck?.alertThresholds ?? {
          riskScore: 7.0,
          lossStreak: 5,
          sessionDuration: 180 // minutes
        }
      },
      
      // JustTheTip integration
      justTheTip: {
        enabled: config.justTheTip?.enabled ?? true,
        autoVaultThreshold: config.justTheTip?.autoVaultThreshold ?? 0.7,
        vaultTypes: ['HODL', 'YOLO', 'Regret', 'GrassTouching', 'Therapy']
      },
      
      // QualifyFirst integration
      qualifyFirst: {
        enabled: config.qualifyFirst?.enabled ?? true,
        autoRedirectOnTilt: config.qualifyFirst?.autoRedirectOnTilt ?? true,
        earningOpportunities: ['surveys', 'micro-tasks', 'content-creation', 'skill-building']
      },
      
      // Admin panel configuration
      adminPanel: {
        enabled: config.adminPanel?.enabled ?? true,
        dataRetention: config.adminPanel?.dataRetention ?? 90, // days
        reportGeneration: config.adminPanel?.reportGeneration ?? 'daily'
      }
    };
    
    // Initialize AI Gateway
    if (this.config.aiGateway.enabled) {
      this.aiGateway = new VercelAIGatewayTiltCheck(this.config.aiGateway);
    }
    
    // Data storage for analytics
    this.analytics = {
      sessions: [],
      interventions: [],
      vaultActions: [],
      redirects: [],
      userFeedback: []
    };
  }

  /**
   * Unified session analysis across all systems
   * Combines TiltCheck, AI Gateway, and behavioral insights
   */
  async analyzeSession(sessionData) {
    const analysis = {
      timestamp: Date.now(),
      userId: sessionData.userId,
      platform: sessionData.platform || 'unknown'
    };

    // 1. TiltCheck Analysis
    if (this.config.tiltCheck.enabled) {
      analysis.tiltCheck = await this.analyzeTiltBehavior(sessionData);
    }

    // 2. AI-Enhanced Analysis (if enabled and high risk detected)
    if (this.config.aiGateway.enabled && analysis.tiltCheck?.riskScore > 5) {
      analysis.aiAnalysis = await this.aiGateway.analyzeBettingBehavior({
        playerId: sessionData.userId,
        bettingHistory: sessionData.bettingHistory,
        currentStake: sessionData.currentStake,
        sessionDuration: sessionData.sessionDuration,
        emotionalIndicators: analysis.tiltCheck.emotionalIndicators
      });
    }

    // 3. JustTheTip Auto-Vault Recommendation
    if (this.config.justTheTip.enabled) {
      analysis.vaultRecommendation = await this.recommendVault(analysis);
    }

    // 4. QualifyFirst Redirect Suggestion
    if (this.config.qualifyFirst.enabled) {
      analysis.earningRedirect = await this.suggestAlternativeEarning(analysis);
    }

    // Store for analytics
    this.analytics.sessions.push(analysis);

    return analysis;
  }

  /**
   * TiltCheck behavioral analysis
   */
  async analyzeTiltBehavior(sessionData) {
    const { bettingHistory, currentStake, sessionDuration } = sessionData;

    // Calculate risk indicators
    const lossStreak = this.calculateLossStreak(bettingHistory);
    const stakeEscalation = this.calculateStakeEscalation(bettingHistory);
    const sessionLength = sessionDuration || 0;
    
    // Calculate risk score
    let riskScore = 0;
    
    if (lossStreak >= 3) riskScore += 2;
    if (lossStreak >= 5) riskScore += 3;
    if (stakeEscalation > 1.5) riskScore += 2;
    if (stakeEscalation > 2.0) riskScore += 3;
    if (sessionLength > 120) riskScore += 1;
    if (sessionLength > 180) riskScore += 2;

    return {
      riskScore: Math.min(riskScore, 10),
      lossStreak,
      stakeEscalation,
      sessionLength,
      tiltDetected: riskScore >= this.config.tiltCheck.alertThresholds.riskScore,
      emotionalIndicators: {
        impulsive: stakeEscalation > 1.5,
        chasing: lossStreak >= 3,
        exhausted: sessionLength > 180
      }
    };
  }

  /**
   * JustTheTip vault recommendation based on behavior
   */
  async recommendVault(analysis) {
    const { tiltCheck, aiAnalysis } = analysis;
    const riskScore = aiAnalysis?.analysis?.riskScore || tiltCheck?.riskScore || 0;

    let vaultType = null;
    let confidence = 0;
    let reasoning = '';

    if (riskScore >= 8) {
      vaultType = 'Therapy';
      confidence = 0.9;
      reasoning = 'Critical tilt detected. Time for self-care and recovery.';
    } else if (riskScore >= 6) {
      vaultType = 'Regret';
      confidence = 0.8;
      reasoning = 'High risk behavior. Secure winnings before impulse strikes.';
    } else if (tiltCheck?.emotionalIndicators?.chasing) {
      vaultType = 'HODL';
      confidence = 0.75;
      reasoning = 'Loss chasing detected. Lock it away for future you.';
    } else if (tiltCheck?.sessionLength > 180) {
      vaultType = 'GrassTouching';
      confidence = 0.7;
      reasoning = 'Long session detected. Time to touch grass.';
    } else if (tiltCheck?.emotionalIndicators?.impulsive) {
      vaultType = 'YOLO';
      confidence = 0.65;
      reasoning = 'Impulsive behavior. Safe containment for degen energy.';
    }

    // Auto-vault trigger
    const shouldAutoVault = confidence >= this.config.justTheTip.autoVaultThreshold;

    if (shouldAutoVault) {
      this.analytics.vaultActions.push({
        timestamp: Date.now(),
        userId: analysis.userId,
        vaultType,
        confidence,
        reasoning,
        autoTriggered: true
      });
    }

    return {
      vaultType,
      confidence,
      reasoning,
      shouldAutoVault,
      message: this.generateVaultMessage(vaultType, confidence)
    };
  }

  /**
   * QualifyFirst earning opportunity suggestion
   */
  async suggestAlternativeEarning(analysis) {
    const { tiltCheck, aiAnalysis } = analysis;
    const riskScore = aiAnalysis?.analysis?.riskScore || tiltCheck?.riskScore || 0;

    // Only suggest if tilt detected and auto-redirect enabled
    if (!this.config.qualifyFirst.autoRedirectOnTilt || riskScore < 6) {
      return null;
    }

    // Analyze user skills and preferences
    const opportunities = this.matchEarningOpportunities(analysis);

    const redirect = {
      shouldRedirect: riskScore >= 7,
      urgency: riskScore >= 8 ? 'high' : 'medium',
      opportunities,
      estimatedEarnings: this.calculateEstimatedEarnings(opportunities),
      message: this.generateRedirectMessage(riskScore),
      cooldownPeriod: this.calculateCooldownPeriod(riskScore)
    };

    if (redirect.shouldRedirect) {
      this.analytics.redirects.push({
        timestamp: Date.now(),
        userId: analysis.userId,
        riskScore,
        opportunities: opportunities.map(o => o.type),
        accepted: false // Will be updated on user action
      });
    }

    return redirect;
  }

  /**
   * Generate comprehensive intervention strategy
   */
  async generateIntervention(analysis) {
    const intervention = {
      timestamp: Date.now(),
      userId: analysis.userId,
      riskLevel: this.categorizeRiskLevel(analysis),
      actions: []
    };

    // Action 1: Immediate alert
    if (analysis.tiltCheck?.tiltDetected || analysis.aiAnalysis?.analysis?.tiltDetected) {
      intervention.actions.push({
        type: 'alert',
        priority: 'high',
        message: this.generateAlertMessage(analysis),
        channels: ['in-app', 'discord', 'email']
      });
    }

    // Action 2: Vault recommendation
    if (analysis.vaultRecommendation?.shouldAutoVault) {
      intervention.actions.push({
        type: 'vault',
        priority: 'high',
        vaultType: analysis.vaultRecommendation.vaultType,
        message: analysis.vaultRecommendation.message,
        autoTrigger: true
      });
    }

    // Action 3: Redirect to QualifyFirst
    if (analysis.earningRedirect?.shouldRedirect) {
      intervention.actions.push({
        type: 'redirect',
        priority: analysis.earningRedirect.urgency === 'high' ? 'critical' : 'medium',
        destination: 'qualifyfirst',
        opportunities: analysis.earningRedirect.opportunities,
        message: analysis.earningRedirect.message,
        cooldownPeriod: analysis.earningRedirect.cooldownPeriod
      });
    }

    // Action 4: AI-powered personalized recommendations
    if (analysis.aiAnalysis?.analysis?.recommendations) {
      intervention.actions.push({
        type: 'recommendations',
        priority: 'medium',
        items: analysis.aiAnalysis.analysis.recommendations,
        source: 'ai-gateway'
      });
    }

    // Store intervention
    this.analytics.interventions.push(intervention);

    return intervention;
  }

  /**
   * Process user feedback for ML improvement
   */
  async processFeedback(feedback) {
    const feedbackEntry = {
      timestamp: Date.now(),
      userId: feedback.userId,
      sessionId: feedback.sessionId,
      interventionId: feedback.interventionId,
      rating: feedback.rating, // 1-5
      helpful: feedback.helpful, // boolean
      comment: feedback.comment,
      actionTaken: feedback.actionTaken, // what user did
      outcome: feedback.outcome // positive, negative, neutral
    };

    this.analytics.userFeedback.push(feedbackEntry);

    // Use feedback to improve future recommendations
    await this.updateMLModels(feedbackEntry);

    return feedbackEntry;
  }

  /**
   * Generate analytics report for admin panel
   */
  async generateAnalyticsReport(timeframe = 'daily') {
    const now = Date.now();
    const timeframes = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - (timeframes[timeframe] || timeframes.daily);

    const recentSessions = this.analytics.sessions.filter(s => s.timestamp > cutoff);
    const recentInterventions = this.analytics.interventions.filter(i => i.timestamp > cutoff);
    const recentVaults = this.analytics.vaultActions.filter(v => v.timestamp > cutoff);
    const recentRedirects = this.analytics.redirects.filter(r => r.timestamp > cutoff);
    const recentFeedback = this.analytics.userFeedback.filter(f => f.timestamp > cutoff);

    return {
      timeframe,
      period: { start: cutoff, end: now },
      
      summary: {
        totalSessions: recentSessions.length,
        totalInterventions: recentInterventions.length,
        tiltDetections: recentSessions.filter(s => s.tiltCheck?.tiltDetected).length,
        vaultsTriggered: recentVaults.length,
        redirects: recentRedirects.length,
        feedbackReceived: recentFeedback.length
      },
      
      riskDistribution: this.calculateRiskDistribution(recentSessions),
      
      interventionEffectiveness: this.calculateInterventionEffectiveness(recentInterventions, recentFeedback),
      
      vaultPerformance: this.calculateVaultPerformance(recentVaults, recentFeedback),
      
      qualifyFirstEngagement: this.calculateQualifyFirstEngagement(recentRedirects),
      
      aiGatewayMetrics: await this.getAIGatewayMetrics(),
      
      userSatisfaction: this.calculateUserSatisfaction(recentFeedback),
      
      financialImpact: this.calculateFinancialImpact(recentSessions, recentVaults),
      
      trends: await this.analyzeTrends(timeframe),
      
      recommendations: await this.generateSystemRecommendations()
    };
  }

  /**
   * Helper methods
   */
  calculateLossStreak(bettingHistory) {
    if (!bettingHistory || bettingHistory.length === 0) return 0;
    
    let streak = 0;
    for (let i = bettingHistory.length - 1; i >= 0; i--) {
      if (bettingHistory[i].outcome === 'loss') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  calculateStakeEscalation(bettingHistory) {
    if (!bettingHistory || bettingHistory.length < 2) return 1.0;
    
    const recentBets = bettingHistory.slice(-5);
    const firstBet = recentBets[0].amount;
    const lastBet = recentBets[recentBets.length - 1].amount;
    
    return lastBet / firstBet;
  }

  generateVaultMessage(vaultType, confidence) {
    const messages = {
      'Therapy': '🧘‍♂️ Self-care is the ultimate alpha. Time to secure gains and recharge.',
      'Regret': '🛡️ Future you will thank present you. Lock it in before FOMO strikes.',
      'HODL': '💎 Diamond hands activated. Keep the gains, lose the chaos.',
      'GrassTouching': '🌱 Touch grass protocol initiated. Real world awaits.',
      'YOLO': '🚀 Controlled chaos mode. Safe harbor for degen energy.'
    };
    
    return messages[vaultType] || '💰 Secure your gains, king.';
  }

  generateRedirectMessage(riskScore) {
    if (riskScore >= 8) {
      return '🎯 Critical tilt detected. Let\'s redirect that energy to guaranteed earnings. QualifyFirst has opportunities waiting.';
    } else if (riskScore >= 6) {
      return '💡 High risk behavior detected. Why gamble when you can earn? Check out these opportunities.';
    }
    return '✨ Take a break and stack some guaranteed cash on QualifyFirst.';
  }

  calculateCooldownPeriod(riskScore) {
    // Suggest cooldown period in minutes
    if (riskScore >= 8) return 60;
    if (riskScore >= 6) return 30;
    return 15;
  }

  matchEarningOpportunities(analysis) {
    // Match user to earning opportunities based on profile and behavior
    return [
      {
        type: 'surveys',
        difficulty: 'easy',
        estimatedTime: 15, // minutes
        estimatedEarning: 5, // USD
        match: 0.9
      },
      {
        type: 'micro-tasks',
        difficulty: 'easy',
        estimatedTime: 30,
        estimatedEarning: 10,
        match: 0.85
      },
      {
        type: 'content-creation',
        difficulty: 'medium',
        estimatedTime: 60,
        estimatedEarning: 25,
        match: 0.7
      }
    ];
  }

  calculateEstimatedEarnings(opportunities) {
    return opportunities.reduce((sum, opp) => sum + opp.estimatedEarning, 0);
  }

  categorizeRiskLevel(analysis) {
    const riskScore = analysis.aiAnalysis?.analysis?.riskScore || analysis.tiltCheck?.riskScore || 0;
    
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  generateAlertMessage(analysis) {
    const riskLevel = this.categorizeRiskLevel(analysis);
    const messages = {
      critical: '🚨 CRITICAL: Severe tilt detected. Stop playing immediately and take a break.',
      high: '⚠️ HIGH RISK: Concerning behavior patterns detected. Consider taking a break.',
      medium: '⚡ CAUTION: Elevated risk. Monitor your behavior carefully.',
      low: 'ℹ️ All good. Keep playing responsibly.'
    };
    
    return messages[riskLevel];
  }

  async updateMLModels(feedbackEntry) {
    // Placeholder for ML model updates based on feedback
    // In production, this would send data to ML pipeline
    console.log('Feedback recorded for ML training:', feedbackEntry);
  }

  calculateRiskDistribution(sessions) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    
    sessions.forEach(session => {
      const riskScore = session.aiAnalysis?.analysis?.riskScore || session.tiltCheck?.riskScore || 0;
      if (riskScore >= 8) distribution.critical++;
      else if (riskScore >= 6) distribution.high++;
      else if (riskScore >= 4) distribution.medium++;
      else distribution.low++;
    });
    
    return distribution;
  }

  calculateInterventionEffectiveness(interventions, feedback) {
    const withFeedback = interventions.filter(i => 
      feedback.some(f => f.interventionId === i.timestamp)
    );
    
    const avgRating = feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (feedback.length || 1);
    const helpfulCount = feedback.filter(f => f.helpful).length;
    
    return {
      totalInterventions: interventions.length,
      withFeedback: withFeedback.length,
      averageRating: avgRating.toFixed(2),
      helpfulPercentage: ((helpfulCount / feedback.length) * 100).toFixed(1)
    };
  }

  calculateVaultPerformance(vaults, feedback) {
    const vaultsByType = {};
    
    vaults.forEach(vault => {
      if (!vaultsByType[vault.vaultType]) {
        vaultsByType[vault.vaultType] = { count: 0, autoTriggered: 0 };
      }
      vaultsByType[vault.vaultType].count++;
      if (vault.autoTriggered) {
        vaultsByType[vault.vaultType].autoTriggered++;
      }
    });
    
    return {
      totalVaults: vaults.length,
      byType: vaultsByType,
      autoTriggerRate: ((vaults.filter(v => v.autoTriggered).length / vaults.length) * 100).toFixed(1)
    };
  }

  calculateQualifyFirstEngagement(redirects) {
    const accepted = redirects.filter(r => r.accepted).length;
    
    return {
      totalRedirects: redirects.length,
      accepted,
      acceptanceRate: ((accepted / redirects.length) * 100).toFixed(1),
      avgCooldownPeriod: redirects.reduce((sum, r) => sum + (r.cooldownPeriod || 0), 0) / redirects.length
    };
  }

  async getAIGatewayMetrics() {
    if (!this.aiGateway) {
      return null;
    }
    
    return await this.aiGateway.getGatewayStats();
  }

  calculateUserSatisfaction(feedback) {
    if (feedback.length === 0) {
      return { avgRating: 0, totalFeedback: 0 };
    }
    
    const avgRating = feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length;
    const positiveOutcomes = feedback.filter(f => f.outcome === 'positive').length;
    
    return {
      avgRating: avgRating.toFixed(2),
      totalFeedback: feedback.length,
      positiveOutcomeRate: ((positiveOutcomes / feedback.length) * 100).toFixed(1)
    };
  }

  calculateFinancialImpact(sessions, vaults) {
    // Placeholder calculations - would use real financial data in production
    const estimatedLossesPrevented = vaults.length * 150; // avg $150 per vault action
    const aiCosts = sessions.filter(s => s.aiAnalysis).length * 0.011;
    
    return {
      estimatedLossesPrevented,
      aiCosts,
      netSavings: estimatedLossesPrevented - aiCosts,
      roi: ((estimatedLossesPrevented / aiCosts) * 100).toFixed(0)
    };
  }

  async analyzeTrends(timeframe) {
    // Placeholder for trend analysis
    return {
      tiltTrend: 'increasing',
      vaultUsageTrend: 'stable',
      qualifyFirstEngagement: 'increasing',
      userSatisfaction: 'stable'
    };
  }

  async generateSystemRecommendations() {
    // AI-powered system recommendations
    return [
      'Consider lowering auto-vault threshold to 0.65 for better prevention',
      'QualifyFirst engagement is high - expand opportunity types',
      'User feedback suggests vault messages could be more personalized'
    ];
  }

  /**
   * Export analytics data for tax reporting and compliance
   */
  async exportTaxData(userId, year) {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).getTime();

    const userSessions = this.analytics.sessions.filter(s => 
      s.userId === userId && s.timestamp >= startOfYear && s.timestamp <= endOfYear
    );

    const userVaults = this.analytics.vaultActions.filter(v => 
      v.userId === userId && v.timestamp >= startOfYear && v.timestamp <= endOfYear
    );

    return {
      year,
      userId,
      summary: {
        totalSessions: userSessions.length,
        totalVaultActions: userVaults.length,
        // Additional tax-relevant data would be added here
      },
      sessions: userSessions,
      vaults: userVaults
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnifiedEcosystemHub;
}

if (typeof window !== 'undefined') {
  window.UnifiedEcosystemHub = UnifiedEcosystemHub;
}

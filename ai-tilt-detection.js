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
 * Enhanced AI Tilt Detection Algorithm
 * Comprehensive behavioral analysis with multi-factor pattern recognition
 * Tracks: time-of-day patterns, currency usage, device correlation, PnL variations, betting modality
 */
class AITiltDetection {
  constructor() {
    // Session data storage
    this.sessionData = {
      bets: [],
      timePatterns: {},
      currencyUsage: {},
      deviceStats: {},
      pnlHistory: [],
      bettingModality: {
        aggressive: 0,
        conservative: 0,
        chasing: 0,
        strategic: 0
      }
    };
    
    // AI pattern recognition thresholds
    this.thresholds = {
      timeOfDayRisk: {
        lateNight: 0.8,    // 11pm-4am (highest risk)
        earlyMorning: 0.6, // 4am-8am (high risk)
        workHours: 0.3,    // 9am-5pm (moderate risk)
        evening: 0.5       // 6pm-11pm (moderate-high risk)
      },
      currencyRisk: {
        crypto: 0.7,       // Higher risk due to volatility
        fiat: 0.4,         // Lower risk
        mixed: 0.6         // Medium risk
      },
      deviceRisk: {
        mobile: 0.7,       // Higher risk (impulsive)
        desktop: 0.4,      // Lower risk (more deliberate)
        tablet: 0.5        // Medium risk
      },
      pnlVariation: {
        wildSwing: 50,     // Percentage change indicating wild swings
        chasingLoss: 30    // Percentage loss before likely chasing
      },
      modalityRisk: {
        aggressive: 0.8,
        conservative: 0.2,
        chasing: 0.9,
        strategic: 0.3
      }
    };
    
    // Initialize session start time
    this.sessionStart = Date.now();
  }
  
  /**
   * Log a betting event with comprehensive metadata
   */
  logBet(bet) {
    const timestamp = Date.now();
    const timeOfDay = this.getTimeOfDay(timestamp);
    
    const betData = {
      timestamp,
      timeOfDay,
      amount: bet.amount,
      currency: bet.currency || 'USD',
      device: bet.device || 'desktop',
      outcome: bet.outcome, // 'win' or 'loss'
      pnl: bet.pnl,
      gameType: bet.gameType,
      betSpeed: this.calculateBetSpeed(timestamp)
    };
    
    // Store bet
    this.sessionData.bets.push(betData);
    
    // Update pattern trackers
    this.updateTimePatterns(betData);
    this.updateCurrencyUsage(betData);
    this.updateDeviceStats(betData);
    this.updatePnLHistory(betData);
    this.analyzeBettingModality(betData);
    
    return betData;
  }
  
  /**
   * Determine time of day category
   */
  getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    
    if (hour >= 23 || hour < 4) return 'lateNight';
    if (hour >= 4 && hour < 8) return 'earlyMorning';
    if (hour >= 9 && hour < 17) return 'workHours';
    return 'evening';
  }
  
  /**
   * Calculate betting speed (bets per minute)
   */
  calculateBetSpeed(timestamp) {
    if (this.sessionData.bets.length < 2) return 0;
    
    const recentBets = this.sessionData.bets.filter(
      bet => timestamp - bet.timestamp < 60000 // Last minute
    );
    
    return recentBets.length;
  }
  
  /**
   * Update time-of-day patterns
   */
  updateTimePatterns(betData) {
    const { timeOfDay, amount, outcome } = betData;
    
    if (!this.sessionData.timePatterns[timeOfDay]) {
      this.sessionData.timePatterns[timeOfDay] = {
        totalBets: 0,
        totalAmount: 0,
        wins: 0,
        losses: 0,
        netPnL: 0
      };
    }
    
    const pattern = this.sessionData.timePatterns[timeOfDay];
    pattern.totalBets++;
    pattern.totalAmount += amount;
    
    if (outcome === 'win') {
      pattern.wins++;
      pattern.netPnL += betData.pnl;
    } else {
      pattern.losses++;
      pattern.netPnL -= betData.pnl;
    }
  }
  
  /**
   * Update currency usage patterns
   */
  updateCurrencyUsage(betData) {
    const { currency, amount, outcome } = betData;
    
    if (!this.sessionData.currencyUsage[currency]) {
      this.sessionData.currencyUsage[currency] = {
        totalBets: 0,
        totalAmount: 0,
        wins: 0,
        losses: 0,
        netPnL: 0
      };
    }
    
    const currencyData = this.sessionData.currencyUsage[currency];
    currencyData.totalBets++;
    currencyData.totalAmount += amount;
    
    if (outcome === 'win') {
      currencyData.wins++;
      currencyData.netPnL += betData.pnl;
    } else {
      currencyData.losses++;
      currencyData.netPnL -= betData.pnl;
    }
  }
  
  /**
   * Update device statistics
   */
  updateDeviceStats(betData) {
    const { device, amount, outcome } = betData;
    
    if (!this.sessionData.deviceStats[device]) {
      this.sessionData.deviceStats[device] = {
        totalBets: 0,
        totalAmount: 0,
        wins: 0,
        losses: 0,
        avgBetSpeed: 0
      };
    }
    
    const deviceData = this.sessionData.deviceStats[device];
    deviceData.totalBets++;
    deviceData.totalAmount += amount;
    deviceData.avgBetSpeed = (deviceData.avgBetSpeed * (deviceData.totalBets - 1) + betData.betSpeed) / deviceData.totalBets;
    
    if (outcome === 'win') {
      deviceData.wins++;
    } else {
      deviceData.losses++;
    }
  }
  
  /**
   * Update PnL history
   */
  updatePnLHistory(betData) {
    const previousTotal = this.sessionData.pnlHistory.length > 0 
      ? this.sessionData.pnlHistory[this.sessionData.pnlHistory.length - 1].cumulativePnL
      : 0;
    const totalPnL = previousTotal + (betData.outcome === 'win' ? betData.pnl : -betData.pnl);
    
    this.sessionData.pnlHistory.push({
      timestamp: betData.timestamp,
      pnl: betData.outcome === 'win' ? betData.pnl : -betData.pnl,
      cumulativePnL: totalPnL
    });
    
    // Keep only last 100 entries for performance
    if (this.sessionData.pnlHistory.length > 100) {
      this.sessionData.pnlHistory.shift();
    }
  }
  
  /**
   * Analyze betting modality (aggressive, conservative, chasing, strategic)
   */
  analyzeBettingModality(betData) {
    const recentBets = this.sessionData.bets.slice(-10);
    
    if (recentBets.length < 5) return;
    
    // Check for aggressive betting (increasing bet sizes)
    const avgBet = recentBets.reduce((sum, bet) => sum + bet.amount, 0) / recentBets.length;
    if (betData.amount > avgBet * 1.5) {
      this.sessionData.bettingModality.aggressive++;
    }
    
    // Check for conservative betting (small, consistent bets)
    if (betData.amount < avgBet * 0.8) {
      this.sessionData.bettingModality.conservative++;
    }
    
    // Check for chasing losses (increasing bets after losses)
    const lastThreeBets = recentBets.slice(-3);
    const hasLossStreak = lastThreeBets.every(bet => bet.outcome === 'loss');
    if (hasLossStreak && betData.amount > avgBet * 1.3) {
      this.sessionData.bettingModality.chasing++;
    }
    
    // Check for strategic betting (varying bets based on conditions)
    const betVariance = this.calculateVariance(recentBets.map(bet => bet.amount));
    if (betVariance > 0.3 && betVariance < 0.7) {
      this.sessionData.bettingModality.strategic++;
    }
  }
  
  /**
   * Calculate variance for an array of numbers
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }
  
  /**
   * Comprehensive AI tilt risk analysis
   */
  analyzeTiltRisk() {
    const analysis = {
      overallRiskScore: 0,
      riskFactors: [],
      recommendations: [],
      patterns: {}
    };
    
    // Time-of-day risk analysis
    const timeRisk = this.analyzeTimeOfDayRisk();
    analysis.patterns.timeOfDay = timeRisk;
    analysis.overallRiskScore += timeRisk.riskScore * 0.25;
    
    if (timeRisk.riskScore > 0.6) {
      analysis.riskFactors.push({
        factor: 'Time of Day',
        severity: timeRisk.riskScore,
        message: `Playing during ${timeRisk.currentPeriod} - ${timeRisk.message}`
      });
    }
    
    // Currency risk analysis
    const currencyRisk = this.analyzeCurrencyRisk();
    analysis.patterns.currency = currencyRisk;
    analysis.overallRiskScore += currencyRisk.riskScore * 0.15;
    
    if (currencyRisk.riskScore > 0.5) {
      analysis.riskFactors.push({
        factor: 'Currency Usage',
        severity: currencyRisk.riskScore,
        message: currencyRisk.message
      });
    }
    
    // Device risk analysis
    const deviceRisk = this.analyzeDeviceRisk();
    analysis.patterns.device = deviceRisk;
    analysis.overallRiskScore += deviceRisk.riskScore * 0.15;
    
    if (deviceRisk.riskScore > 0.6) {
      analysis.riskFactors.push({
        factor: 'Device Pattern',
        severity: deviceRisk.riskScore,
        message: deviceRisk.message
      });
    }
    
    // PnL variation analysis
    const pnlRisk = this.analyzePnLVariation();
    analysis.patterns.pnl = pnlRisk;
    analysis.overallRiskScore += pnlRisk.riskScore * 0.25;
    
    if (pnlRisk.riskScore > 0.5) {
      analysis.riskFactors.push({
        factor: 'PnL Variation',
        severity: pnlRisk.riskScore,
        message: pnlRisk.message
      });
    }
    
    // Betting modality analysis
    const modalityRisk = this.analyzeBettingModalityRisk();
    analysis.patterns.modality = modalityRisk;
    analysis.overallRiskScore += modalityRisk.riskScore * 0.20;
    
    if (modalityRisk.riskScore > 0.6) {
      analysis.riskFactors.push({
        factor: 'Betting Behavior',
        severity: modalityRisk.riskScore,
        message: modalityRisk.message
      });
    }
    
    // Generate recommendations based on risk level
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Normalize risk score to 0-1 range
    analysis.overallRiskScore = Math.min(1, analysis.overallRiskScore);
    
    return analysis;
  }
  
  /**
   * Analyze time-of-day risk patterns
   */
  analyzeTimeOfDayRisk() {
    const currentHour = new Date().getHours();
    const currentPeriod = this.getTimeOfDay(Date.now());
    const baseRisk = this.thresholds.timeOfDayRisk[currentPeriod];
    
    // Analyze historical patterns for this time period
    const pattern = this.sessionData.timePatterns[currentPeriod];
    let riskScore = baseRisk;
    let message = '';
    
    if (pattern) {
      const winRate = pattern.wins / (pattern.totalBets || 1);
      
      if (winRate < 0.3 && pattern.totalBets > 5) {
        riskScore += 0.15;
        message = `You have a ${Math.round(winRate * 100)}% win rate during this time - consider playing at different hours`;
      } else if (pattern.netPnL < 0) {
        riskScore += 0.1;
        message = `Historical losses during ${currentPeriod} - be cautious`;
      } else {
        message = `${currentPeriod} is a high-risk time for impulsive betting`;
      }
    } else {
      message = `${currentPeriod} is typically a high-risk time for gambling`;
    }
    
    return {
      currentPeriod,
      riskScore: Math.min(1, riskScore),
      message,
      historicalData: pattern
    };
  }
  
  /**
   * Analyze currency usage risk
   */
  analyzeCurrencyRisk() {
    const currencies = Object.keys(this.sessionData.currencyUsage);
    
    if (currencies.length === 0) {
      return { riskScore: 0.3, message: 'No currency data yet' };
    }
    
    let riskScore = 0;
    let message = '';
    
    // Using multiple currencies (mixed strategy)
    if (currencies.length > 1) {
      riskScore = this.thresholds.currencyRisk.mixed;
      message = `Using ${currencies.length} different currencies - may indicate chasing or emotional betting`;
    } else {
      const currency = currencies[0];
      const isCrypto = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].includes(currency);
      
      if (isCrypto) {
        riskScore = this.thresholds.currencyRisk.crypto;
        message = 'Using cryptocurrency - higher volatility and risk';
      } else {
        riskScore = this.thresholds.currencyRisk.fiat;
        message = 'Using fiat currency - lower risk profile';
      }
    }
    
    return { riskScore, message, currencies };
  }
  
  /**
   * Analyze device usage risk
   */
  analyzeDeviceRisk() {
    const devices = Object.keys(this.sessionData.deviceStats);
    
    if (devices.length === 0) {
      return { riskScore: 0.3, message: 'No device data yet' };
    }
    
    let riskScore = 0;
    let message = '';
    
    // Calculate weighted risk based on bet distribution
    const totalBets = Object.values(this.sessionData.deviceStats).reduce((sum, stats) => sum + stats.totalBets, 0);
    
    devices.forEach(device => {
      const stats = this.sessionData.deviceStats[device];
      const deviceWeight = stats.totalBets / totalBets;
      const deviceRisk = this.thresholds.deviceRisk[device] || 0.5;
      
      riskScore += deviceRisk * deviceWeight;
      
      // Check for high-speed betting on mobile
      if (device === 'mobile' && stats.avgBetSpeed > 5) {
        riskScore += 0.15;
        message = 'High-speed betting on mobile detected - sign of impulsive behavior';
      }
    });
    
    if (!message) {
      const primaryDevice = devices.reduce((a, b) => 
        this.sessionData.deviceStats[a].totalBets > this.sessionData.deviceStats[b].totalBets ? a : b
      );
      message = `Primary device: ${primaryDevice}`;
    }
    
    return { riskScore: Math.min(1, riskScore), message, devices };
  }
  
  /**
   * Analyze PnL variation patterns
   */
  analyzePnLVariation() {
    if (this.sessionData.pnlHistory.length < 5) {
      return { riskScore: 0.2, message: 'Insufficient PnL data', variation: 0 };
    }
    
    const pnlValues = this.sessionData.pnlHistory.map(entry => entry.cumulativePnL);
    const currentPnL = pnlValues[pnlValues.length - 1];
    const maxPnL = Math.max(...pnlValues);
    const minPnL = Math.min(...pnlValues);
    
    const variation = ((maxPnL - minPnL) / Math.abs(maxPnL) * 100) || 0;
    
    let riskScore = 0;
    let message = '';
    
    // Wild swings indicate emotional betting
    if (variation > this.thresholds.pnlVariation.wildSwing) {
      riskScore = 0.8;
      message = `Extreme PnL swings (${Math.round(variation)}%) - highly volatile session`;
    } else if (currentPnL < 0 && Math.abs(currentPnL) > this.thresholds.pnlVariation.chasingLoss) {
      riskScore = 0.7;
      message = `Down ${Math.abs(Math.round(currentPnL))}% - high risk of chasing losses`;
    } else if (variation > 20) {
      riskScore = 0.5;
      message = `Moderate PnL swings (${Math.round(variation)}%) - manage your risk`;
    } else {
      riskScore = 0.3;
      message = 'Stable PnL pattern - good risk management';
    }
    
    return {
      riskScore,
      message,
      variation,
      currentPnL,
      trend: currentPnL > 0 ? 'positive' : 'negative'
    };
  }
  
  /**
   * Analyze betting modality risk
   */
  analyzeBettingModalityRisk() {
    const modality = this.sessionData.bettingModality;
    const totalActions = Object.values(modality).reduce((sum, val) => sum + val, 0);
    
    if (totalActions === 0) {
      return { riskScore: 0.3, message: 'Insufficient betting data', dominantModality: 'unknown' };
    }
    
    // Calculate weighted risk
    let riskScore = 0;
    let dominantModality = '';
    let maxCount = 0;
    
    Object.entries(modality).forEach(([type, count]) => {
      const weight = count / totalActions;
      riskScore += this.thresholds.modalityRisk[type] * weight;
      
      if (count > maxCount) {
        maxCount = count;
        dominantModality = type;
      }
    });
    
    const messages = {
      aggressive: 'Aggressive betting pattern detected - high risk',
      conservative: 'Conservative betting - lower risk profile',
      chasing: 'CRITICAL: Loss-chasing behavior detected',
      strategic: 'Strategic betting pattern - moderate risk'
    };
    
    return {
      riskScore: Math.min(1, riskScore),
      message: messages[dominantModality] || 'Mixed betting pattern',
      dominantModality,
      distribution: modality
    };
  }
  
  /**
   * Generate personalized recommendations based on risk analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    const riskScore = analysis.overallRiskScore;
    
    // High-level recommendations based on overall risk
    if (riskScore > 0.8) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'STOP_SESSION',
        message: '🛑 Stop playing immediately - Critical tilt detected',
        icon: '🚨'
      });
    } else if (riskScore > 0.6) {
      recommendations.push({
        priority: 'HIGH',
        action: 'TAKE_BREAK',
        message: '⏸️ Take a 15-minute break - High risk detected',
        icon: '⚠️'
      });
    } else if (riskScore > 0.4) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'REDUCE_BETS',
        message: '📉 Reduce bet sizes by 50%',
        icon: '⚡'
      });
    }
    
    // Specific recommendations based on risk factors
    analysis.riskFactors.forEach(factor => {
      if (factor.factor === 'Time of Day' && factor.severity > 0.7) {
        recommendations.push({
          priority: 'HIGH',
          action: 'SCHEDULE_CHANGE',
          message: '🕐 Consider playing during daytime hours instead',
          icon: '🌅'
        });
      }
      
      if (factor.factor === 'Betting Behavior' && factor.message.includes('chasing')) {
        recommendations.push({
          priority: 'CRITICAL',
          action: 'STOP_CHASING',
          message: '🎯 Stop chasing losses - Set hard limits now',
          icon: '🛡️'
        });
      }
      
      if (factor.factor === 'Device Pattern' && factor.message.includes('mobile')) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'SWITCH_DEVICE',
          message: '💻 Switch to desktop for more deliberate betting',
          icon: '🔄'
        });
      }
    });
    
    // Always provide a positive alternative
    recommendations.push({
      priority: 'INFO',
      action: 'EARN_INSTEAD',
      message: '💰 Redirect energy to earning opportunities',
      icon: '🚀'
    });
    
    return recommendations;
  }
  
  /**
   * Get comprehensive session statistics
   */
  getSessionStats() {
    const totalBets = this.sessionData.bets.length;
    const totalWagered = this.sessionData.bets.reduce((sum, bet) => sum + bet.amount, 0);
    const wins = this.sessionData.bets.filter(bet => bet.outcome === 'win').length;
    const losses = totalBets - wins;
    const netPnL = this.sessionData.pnlHistory.length > 0 
      ? this.sessionData.pnlHistory[this.sessionData.pnlHistory.length - 1].cumulativePnL 
      : 0;
    
    const sessionDuration = (Date.now() - this.sessionStart) / 1000 / 60; // minutes
    const avgBetSize = totalWagered / (totalBets || 1);
    const betsPerMinute = totalBets / (sessionDuration || 1);
    
    return {
      totalBets,
      totalWagered,
      wins,
      losses,
      winRate: wins / (totalBets || 1),
      netPnL: Math.round(netPnL * 100) / 100,
      sessionDuration: Math.round(sessionDuration),
      avgBetSize: Math.round(avgBetSize * 100) / 100,
      betsPerMinute: Math.round(betsPerMinute * 10) / 10,
      timePatterns: this.sessionData.timePatterns,
      currencyUsage: this.sessionData.currencyUsage,
      deviceStats: this.sessionData.deviceStats,
      bettingModality: this.sessionData.bettingModality
    };
  }
  
  /**
   * Export session data for analysis
   */
  exportSessionData() {
    return {
      sessionStart: this.sessionStart,
      sessionEnd: Date.now(),
      sessionData: this.sessionData,
      finalAnalysis: this.analyzeTiltRisk(),
      finalStats: this.getSessionStats()
    };
  }
  
  /**
   * Reset session data
   */
  reset() {
    this.sessionData = {
      bets: [],
      timePatterns: {},
      currencyUsage: {},
      deviceStats: {},
      pnlHistory: [],
      bettingModality: {
        aggressive: 0,
        conservative: 0,
        chasing: 0,
        strategic: 0
      }
    };
    this.sessionStart = Date.now();
  }
}

// Export for use in both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AITiltDetection;
}
if (typeof window !== 'undefined') {
  window.AITiltDetection = AITiltDetection;
}

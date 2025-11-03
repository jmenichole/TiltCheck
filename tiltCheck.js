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

// Load config - works for both Node.js and browser
let config;
if (typeof require !== 'undefined') {
  config = require('./config.json');
} else {
  // Browser fallback configuration
  config = {
    "alertThresholds": {
      "stakeIncrease": 200,
      "timeAtSlots": 180,
      "timeAtOriginals": 120,
      "lossSequence": 5,
      "emotionalIndicatorScore": 7,
      "vaultReminderBalance": 1000,
      "rapidBettingThreshold": 10,
      "maxSessionTime": 300
    },
    "notifications": {
      "popup": { "enabled": true, "position": "top-right" },
      "browserNotification": { "enabled": true, "icon": "/tilt-warning.png" },
      "messenger": { "enabled": true, "style": "aol", "position": "bottom-right" }
    },
    "monitoring": {
      "slotsVsOriginalsRatio": 0.7,
      "emotionalIndicators": {
        "rapidClicking": 3,
        "increasingBetSize": 5,
        "timeSpentIncreasing": 4,
        "lossChasing": 8
      }
    },
    "integrations": {
      "casinoManagementApi": "https://api.example.com/casino",
      "notificationEndpoint": "https://alerts.example.com/notify"
    }
  };
}

/**
 * TiltCheck - Real-time Player Behavior Monitoring System
 * Detects tilt patterns and provides intervention recommendations
 * 
 * @class
 * @example
 * const tiltChecker = new TiltCheck('your-api-key');
 * const player = tiltChecker.trackPlayer('player-123', { initialStake: 1000 });
 */
class TiltCheck {
  /**
   * Creates a new TiltCheck instance
   * @param {string} apiKey - API key for authentication
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.activePlayers = new Map();
    this.config = config;
  }

  /**
   * Initialize a new TiltCheck instance
   * @param {string} apiKey - API key for authentication
   * @returns {TiltCheck} New TiltCheck instance
   * @deprecated Use constructor directly
   */
  initialize(apiKey) {
    return new TiltCheck(apiKey);
  }

  /**
   * Start tracking a player for tilt monitoring
   * 
   * @param {string} playerId - Unique player identifier
   * @param {Object} options - Configuration options
   * @param {number} [options.initialStake=0] - Player's starting balance
   * @param {string} [options.riskProfile='medium'] - Risk profile: 'low', 'medium', or 'high'
   * @returns {Object} Player tracking object
   * 
   * @example
   * const player = tiltChecker.trackPlayer('player-123', {
   *   initialStake: 1000,
   *   riskProfile: 'medium'
   * });
   */
  trackPlayer(playerId, options = {}) {
    const player = {
      id: playerId,
      initialStake: options.initialStake || 0,
      currentStake: options.initialStake || 0,
      riskProfile: options.riskProfile || 'medium',
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      bettingHistory: [],
      timeAtSlots: 0,
      timeAtOriginals: 0,
      emotionalScore: 0,
      lossSequence: 0,
      alerts: []
    };

    this.activePlayers.set(playerId, player);
    this.startMonitoring(playerId);
    return player;
  }

  /**
   * Start monitoring intervals for a player
   * @private
   * @param {string} playerId - Player identifier
   */
  startMonitoring(playerId) {
    const player = this.activePlayers.get(playerId);
    if (!player) return;

    // Start monitoring intervals
    player.monitoringInterval = setInterval(() => {
      this.analyzePlayerBehavior(playerId);
    }, 5000); // Check every 5 seconds

    // Track session time
    player.sessionInterval = setInterval(() => {
      this.updateSessionTime(playerId);
    }, 1000); // Update every second
  }

  /**
   * Update player activity with new bet/game data
   * 
   * @param {string} playerId - Player identifier
   * @param {Object} activity - Activity data
   * @param {string} activity.type - Activity type: 'bet', 'win', 'loss', 'gameSwitch'
   * @param {number} [activity.amount] - Bet amount
   * @param {string} [activity.gameType] - Game type: 'slots' or 'originals'
   * @param {number} [activity.newStake] - Updated player stake
   * 
   * @example
   * tiltChecker.updatePlayerActivity('player-123', {
   *   type: 'bet',
   *   amount: 50,
   *   gameType: 'slots',
   *   newStake: 950
   * });
   */
  updatePlayerActivity(playerId, activity) {
    const player = this.activePlayers.get(playerId);
    if (!player) return;

    player.lastActivity = Date.now();
    
    switch (activity.type) {
      case 'bet':
        this.recordBet(player, activity);
        break;
      case 'gameSwitch':
        this.recordGameSwitch(player, activity);
        break;
      case 'win':
        this.recordWin(player, activity);
        break;
      case 'loss':
        this.recordLoss(player, activity);
        break;
    }

    this.analyzePlayerBehavior(playerId);
  }

  /**
   * Record a betting action
   * @private
   * @param {Object} player - Player object
   * @param {Object} activity - Activity data
   */
  recordBet(player, activity) {
    const bet = {
      amount: activity.amount,
      gameType: activity.gameType, // 'slots' or 'originals'
      timestamp: Date.now()
    };

    player.bettingHistory.push(bet);
    player.currentStake = activity.newStake || player.currentStake;

    // Limit betting history to last 50 bets for performance
    if (player.bettingHistory.length > 50) {
      player.bettingHistory.shift();
    }
  }

  /**
   * Record a game type switch
   * @private
   * @param {Object} player - Player object
   * @param {Object} activity - Activity data with fromGame and toGame
   */
  recordGameSwitch(player, activity) {
    // Track time spent in different game types
    if (activity.fromGame === 'slots') {
      player.timeAtSlots += (Date.now() - player.lastGameSwitch) / 1000;
    } else if (activity.fromGame === 'originals') {
      player.timeAtOriginals += (Date.now() - player.lastGameSwitch) / 1000;
    }
    player.lastGameSwitch = Date.now();
  }

  recordWin(player, activity) {
    player.lossSequence = 0; // Reset loss sequence
    player.currentStake = activity.newStake || player.currentStake;
  }

  recordLoss(player, activity) {
    player.lossSequence += 1;
    player.currentStake = activity.newStake || player.currentStake;
  }

  updateSessionTime(playerId) {
    const player = this.activePlayers.get(playerId);
    if (!player) return;

    const sessionTime = (Date.now() - player.sessionStart) / 1000;
    
    // Check for max session time alert
    if (sessionTime > this.config.alertThresholds.maxSessionTime) {
      this.triggerAlert(playerId, {
        type: 'sessionTime',
        message: `You've been playing for ${Math.round(sessionTime / 60)} minutes. Consider taking a break!`,
        severity: 'warning'
      });
    }
  }

  analyzePlayerBehavior(playerId) {
    const player = this.activePlayers.get(playerId);
    if (!player) return;

    const analysis = this.getBehaviorAnalysis(player);
    
    // Check various tilt indicators
    this.checkStakeIncrease(player);
    this.checkLossSequence(player);
    this.checkRapidBetting(player);
    this.checkSlotsVsOriginalsRatio(player);
    this.checkEmotionalIndicators(player);
    this.checkVaultReminder(player);
  }

  getBehaviorAnalysis(player) {
    const recentBets = player.bettingHistory.slice(-10);
    const totalTime = (Date.now() - player.sessionStart) / 1000;
    const slotsRatio = player.timeAtSlots / (player.timeAtSlots + player.timeAtOriginals || 1);

    return {
      averageBetSize: recentBets.reduce((sum, bet) => sum + bet.amount, 0) / recentBets.length || 0,
      bettingFrequency: recentBets.length / (totalTime / 60), // bets per minute
      slotsVsOriginalsRatio: slotsRatio,
      sessionDuration: totalTime,
      lossSequence: player.lossSequence,
      stakeChange: ((player.currentStake - player.initialStake) / player.initialStake) * 100
    };
  }

  checkStakeIncrease(player) {
    const stakeIncrease = player.currentStake - player.initialStake;
    if (stakeIncrease > this.config.alertThresholds.stakeIncrease) {
      this.triggerAlert(player.id, {
        type: 'stakeIncrease',
        message: `Your stake has increased by $${stakeIncrease}. Consider holding your current position!`,
        severity: 'info',
        advice: 'holdEm'
      });
    }
  }

  checkLossSequence(player) {
    if (player.lossSequence >= this.config.alertThresholds.lossSequence) {
      this.triggerAlert(player.id, {
        type: 'lossSequence',
        message: `${player.lossSequence} losses in a row detected. Time to fold 'em and take a break!`,
        severity: 'high',
        advice: 'foldEm'
      });
    }
  }

  checkRapidBetting(player) {
    const recentBets = player.bettingHistory.slice(-this.config.alertThresholds.rapidBettingThreshold);
    if (recentBets.length >= this.config.alertThresholds.rapidBettingThreshold) {
      const timeSpan = (recentBets[recentBets.length - 1].timestamp - recentBets[0].timestamp) / 1000;
      if (timeSpan < 60) { // Less than 1 minute for 10 bets
        this.triggerAlert(player.id, {
          type: 'rapidBetting',
          message: 'Rapid betting detected! Slow down and think before your next move.',
          severity: 'warning',
          advice: 'holdEm'
        });
      }
    }
  }

  checkSlotsVsOriginalsRatio(player) {
    const totalTime = player.timeAtSlots + player.timeAtOriginals;
    if (totalTime > 60) { // Only check after 1 minute of play
      const slotsRatio = player.timeAtSlots / totalTime;
      if (slotsRatio > this.config.monitoring.slotsVsOriginalsRatio) {
        this.triggerAlert(player.id, {
          type: 'gameBalance',
          message: `You've spent ${Math.round(slotsRatio * 100)}% of your time on slots. Consider trying some originals!`,
          severity: 'info',
          advice: 'diversify'
        });
      }
    }
  }

  checkEmotionalIndicators(player) {
    // Calculate emotional score based on betting patterns
    let emotionalScore = 0;
    
    const recentBets = player.bettingHistory.slice(-5);
    if (recentBets.length > 1) {
      // Check for increasing bet sizes (chasing losses)
      const isIncreasing = recentBets.every((bet, i) => 
        i === 0 || bet.amount >= recentBets[i - 1].amount
      );
      if (isIncreasing) emotionalScore += this.config.monitoring.emotionalIndicators.increasingBetSize;
    }

    // Add loss sequence to emotional score
    emotionalScore += player.lossSequence * this.config.monitoring.emotionalIndicators.lossChasing;

    player.emotionalScore = emotionalScore;

    if (emotionalScore >= this.config.alertThresholds.emotionalIndicatorScore) {
      this.triggerAlert(player.id, {
        type: 'emotional',
        message: 'High emotional stress detected! Take a deep breath and consider stepping away.',
        severity: 'high',
        advice: 'foldEm'
      });
    }
  }

  checkVaultReminder(player) {
    if (player.currentStake >= this.config.alertThresholds.vaultReminderBalance) {
      this.triggerAlert(player.id, {
        type: 'vault',
        message: `Your balance is $${player.currentStake}! Consider vaulting some of your winnings.`,
        severity: 'info',
        advice: 'vault'
      });
    }
  }

  triggerAlert(playerId, alert) {
    const player = this.activePlayers.get(playerId);
    if (!player) return;

    // Prevent duplicate alerts of the same type within 5 minutes
    const recentAlerts = player.alerts.filter(a => 
      a.type === alert.type && (Date.now() - a.timestamp) < 300000
    );
    if (recentAlerts.length > 0) return;

    alert.timestamp = Date.now();
    alert.playerId = playerId;
    player.alerts.push(alert);

    // Trigger various notification methods
    this.sendNotifications(alert);

    return alert;
  }

  sendNotifications(alert) {
    if (typeof window !== 'undefined') {
      // Browser popup
      if (this.config.notifications.popup.enabled) {
        this.showPopupAlert(alert);
      }

      // Browser notification API
      if (this.config.notifications.browserNotification.enabled) {
        this.showBrowserNotification(alert);
      }

      // AOL-style messenger
      if (this.config.notifications.messenger.enabled) {
        this.showMessengerAlert(alert);
      }

      // Send Discord webhook if configured
      if (window.TiltCheckDiscordWebhook) {
        window.TiltCheckDiscordWebhook.sendTiltAlert(alert);
      }
    }
  }

  showPopupAlert(alert) {
    // This will be implemented in the React component
    if (window.TiltCheckUI) {
      window.TiltCheckUI.showPopup(alert);
    }
  }

  showBrowserNotification(alert) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('TiltCheck Alert', {
          body: alert.message,
          icon: this.config.notifications.browserNotification.icon
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('TiltCheck Alert', {
              body: alert.message,
              icon: this.config.notifications.browserNotification.icon
            });
          }
        });
      }
    }
  }

  showMessengerAlert(alert) {
    // This will be implemented in the React component
    if (window.TiltCheckUI) {
      window.TiltCheckUI.showMessenger(alert);
    }
  }

  getPlayerStats(playerId) {
    const player = this.activePlayers.get(playerId);
    if (!player) return null;

    return {
      ...this.getBehaviorAnalysis(player),
      alerts: player.alerts,
      emotionalScore: player.emotionalScore,
      sessionDuration: (Date.now() - player.sessionStart) / 1000,
      recommendation: this.getRecommendation(player)
    };
  }

  getRecommendation(player) {
    const analysis = this.getBehaviorAnalysis(player);
    
    if (player.lossSequence >= 3 || player.emotionalScore >= 5) {
      return {
        action: 'foldEm',
        message: "Time to fold 'em! Take a break and come back when you're feeling better.",
        confidence: 'high'
      };
    }
    
    if (analysis.stakeChange > 50 && player.currentStake >= this.config.alertThresholds.vaultReminderBalance) {
      return {
        action: 'holdEm',
        message: "Hold 'em! You're doing well, but consider vaulting some winnings.",
        confidence: 'medium'
      };
    }

    if (analysis.slotsVsOriginalsRatio > 0.8) {
      return {
        action: 'diversify',
        message: "Mix it up! Try some originals to balance your gameplay.",
        confidence: 'low'
      };
    }

    return {
      action: 'continue',
      message: "Looking good! Continue with your current strategy.",
      confidence: 'medium'
    };
  }

  stopTracking(playerId) {
    const player = this.activePlayers.get(playerId);
    if (player) {
      if (player.monitoringInterval) clearInterval(player.monitoringInterval);
      if (player.sessionInterval) clearInterval(player.sessionInterval);
      this.activePlayers.delete(playerId);
    }
  }

  getAllActivePlayers() {
    return Array.from(this.activePlayers.values());
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TiltCheck;
} else if (typeof window !== 'undefined') {
  window.TiltCheck = TiltCheck;
}
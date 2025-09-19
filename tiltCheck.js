const config = require('./config.json');

class TiltCheck {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.config = config;
    this.trackedPlayers = new Map();
  }

  trackPlayer(playerId, options = {}) {
    const playerData = {
      id: playerId,
      initialStake: options.initialStake || 0,
      riskProfile: options.riskProfile || 'medium',
      startTime: new Date(),
      bettingHistory: [],
      alertCount: 0
    };
    
    this.trackedPlayers.set(playerId, playerData);
    console.log(`Now tracking player ${playerId} with ${options.riskProfile} risk profile`);
    
    return {
      updateStake: (newStake) => this.updatePlayerStake(playerId, newStake),
      addBet: (bet) => this.addPlayerBet(playerId, bet),
      checkTilt: () => this.checkPlayerTilt(playerId)
    };
  }

  updatePlayerStake(playerId, newStake) {
    const player = this.trackedPlayers.get(playerId);
    if (!player) return false;
    
    const increase = newStake - player.initialStake;
    if (increase >= this.config.alertThresholds.stakeIncrease) {
      this.triggerAlert(playerId, 'STAKE_INCREASE', { increase });
    }
    
    return true;
  }

  addPlayerBet(playerId, bet) {
    const player = this.trackedPlayers.get(playerId);
    if (!player) return false;
    
    player.bettingHistory.push({
      ...bet,
      timestamp: new Date()
    });
    
    // Check for loss sequence
    const recentBets = player.bettingHistory.slice(-this.config.alertThresholds.lossSequence);
    if (recentBets.length === this.config.alertThresholds.lossSequence &&
        recentBets.every(b => b.result === 'loss')) {
      this.triggerAlert(playerId, 'LOSS_SEQUENCE', { sequence: recentBets.length });
    }
    
    return true;
  }

  checkPlayerTilt(playerId) {
    const player = this.trackedPlayers.get(playerId);
    if (!player) return null;
    
    const timeAtTable = (new Date() - player.startTime) / 1000 / 60; // minutes
    if (timeAtTable >= this.config.alertThresholds.timeAtTable) {
      this.triggerAlert(playerId, 'TIME_AT_TABLE', { minutes: timeAtTable });
    }
    
    return {
      timeAtTable,
      alertCount: player.alertCount,
      riskLevel: this.calculateRiskLevel(player)
    };
  }

  calculateRiskLevel(player) {
    if (player.alertCount >= 3) return 'high';
    if (player.alertCount >= 1) return 'medium';
    return 'low';
  }

  triggerAlert(playerId, alertType, data) {
    const player = this.trackedPlayers.get(playerId);
    if (!player) return;
    
    player.alertCount++;
    
    const alert = {
      playerId,
      type: alertType,
      timestamp: new Date(),
      data
    };
    
    console.warn(`🚨 TILT ALERT for player ${playerId}:`, alert);
    
    // In a real implementation, this would send to the notification endpoint
    // fetch(this.config.integrations.notificationEndpoint, { ... });
  }
}

module.exports = {
  initialize: (apiKey) => new TiltCheck(apiKey)
};
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

// TiltCheck Advanced Screen Reading Content Script
// Monitors gambling sites with OCR, AI analysis, and real-time intervention

class TiltCheckAdvancedScreenReader {
  constructor() {
    this.isActive = false;
    this.sessionStartTime = Date.now();
    this.lastScreenshot = null;
    this.gamblingData = {
      balance: null,
      totalWagered: 0,
      totalWon: 0,
      totalLost: 0,
      sessionTime: 0,
      gameType: null,
      platform: null,
      betHistory: [],
      tiltLevel: 0
    };
    
    this.platform = this.detectPlatform();
    this.setupTiltCheckIntegration();
    this.startMonitoring();
  }

  // Platform Detection with Specific Selectors
  detectPlatform() {
    const hostname = window.location.hostname;
    const platforms = {
      'stake.com': {
        name: 'Stake',
        type: 'crypto-casino',
        selectors: {
          balance: '[data-testid="wallet-balance"], .wallet-balance',
          betAmount: '[data-testid="bet-amount"], .bet-input',
          lastBet: '.bet-history-item:first-child',
          gameResult: '[data-testid="game-result"], .game-outcome'
        }
      },
      'bovada.lv': {
        name: 'Bovada',
        type: 'sportsbook-casino', 
        selectors: {
          balance: '.balance-amount, .account-balance',
          betSlip: '.bet-slip-amount, .wager-amount'
        }
      },
      'draftkings.com': {
        name: 'DraftKings',
        type: 'sportsbook',
        selectors: {
          balance: '.balance, .available-balance',
          betSlip: '.bet-slip .stake-input'
        }
      },
      'pokerstars.com': {
        name: 'PokerStars', 
        type: 'poker',
        selectors: {
          balance: '.balance-display, #balance',
          currentBet: '.bet-amount, .current-bet'
        }
      }
    };

    return platforms[hostname] || {
      name: 'Unknown Casino',
      type: 'generic',
      selectors: this.guessSelectors()
    };
  }

  // Guess selectors for unknown platforms
  guessSelectors() {
    return {
      balance: '[class*="balance"], [id*="balance"], [data*="balance"]',
      betAmount: '[class*="bet"], [class*="stake"], [class*="wager"]',
      gameResult: '[class*="result"], [class*="outcome"], [class*="win"]'
    };
  }

  // Start comprehensive monitoring
  async startMonitoring() {
    console.log(`🎯 TiltCheck Screen Reader active on ${this.platform.name}`);
    
    // Multiple monitoring approaches
    this.startDOMMonitoring();     // Fast DOM changes
    this.startScreenCapture();     // OCR backup for dynamic content
    this.startBehaviorAnalysis();  // Mouse/keyboard patterns
    this.startNetworkMonitoring(); // API calls
    
    // Show overlay
    this.showTiltCheckOverlay();
  }

  // DOM-based monitoring (fastest)
  startDOMMonitoring() {
    // Watch for balance changes
    this.observeElement(this.platform.selectors.balance, (element) => {
      const newBalance = this.extractNumber(element.textContent);
      if (newBalance !== null && newBalance !== this.gamblingData.balance) {
        this.handleBalanceChange(newBalance);
      }
    });

    // Watch for bet amount changes  
    this.observeElement(this.platform.selectors.betAmount, (element) => {
      const betAmount = this.extractNumber(element.textContent || element.value);
      if (betAmount !== null) {
        this.handleBetAmountChange(betAmount);
      }
    });

    // Watch for game results
    this.observeElement(this.platform.selectors.gameResult, (element) => {
      const result = element.textContent.toLowerCase();
      this.handleGameResult(result);
    });
  }

  // Screen capture with OCR (backup for dynamic content)
  async startScreenCapture() {
    setInterval(async () => {
      if (this.isActive) {
        try {
          const screenshot = await this.captureScreen();
          const extractedData = await this.analyzeScreenshot(screenshot);
          this.processExtractedData(extractedData);
        } catch (error) {
          console.error('Screen capture error:', error);
        }
      }
    }, 5000); // Every 5 seconds
  }

  // Behavioral pattern analysis
  startBehaviorAnalysis() {
    let clickCount = 0;
    let rapidClicks = 0;
    let keyPresses = 0;
    
    document.addEventListener('click', (event) => {
      clickCount++;
      
      // Detect rapid clicking (tilt indicator)
      setTimeout(() => clickCount--, 1000);
      if (clickCount > 10) { // 10+ clicks per second
        rapidClicks++;
        this.updateTiltLevel('rapid-clicking', rapidClicks);
      }

      // Track bet button clicks
      if (this.isBetButton(event.target)) {
        this.handleBetButtonClick(event.target);
      }
    });

    document.addEventListener('keydown', (event) => {
      keyPresses++;
      
      // Detect frantic typing (tilt indicator)  
      setTimeout(() => keyPresses--, 1000);
      if (keyPresses > 20) {
        this.updateTiltLevel('frantic-typing', keyPresses);
      }
    });
  }

  // Network monitoring for API calls
  startNetworkMonitoring() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Intercept gambling-related API calls
      if (this.isGamblingAPI(args[0])) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.processAPIData(data);
        } catch (e) {
          // Ignore non-JSON responses
        }
      }
      
      return response;
    };
  }

  // Analyze screenshot with OCR and AI
  async analyzeScreenshot(screenshot) {
    try {
      // Send to TiltCheck backend for AI analysis
      const response = await fetch('http://localhost:3001/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
          platform: this.platform.name,
          url: window.location.href,
          timestamp: Date.now()
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      return null;
    }
  }

  // Handle balance changes
  handleBalanceChange(newBalance) {
    const previousBalance = this.gamblingData.balance;
    this.gamblingData.balance = newBalance;

    if (previousBalance !== null) {
      const change = newBalance - previousBalance;
      if (change < 0) {
        this.gamblingData.totalLost += Math.abs(change);
        this.updateTiltLevel('loss', Math.abs(change));
      } else if (change > 0) {
        this.gamblingData.totalWon += change;
        this.updateTiltLevel('win', change);
      }
    }

    this.reportToTiltCheck('balance-change', {
      newBalance,
      change: previousBalance ? newBalance - previousBalance : 0
    });
  }

  // Handle bet amount changes (indicates betting escalation)
  handleBetAmountChange(betAmount) {
    const previousBet = this.gamblingData.betHistory[0]?.amount || 0;
    
    if (betAmount > previousBet * 2) {
      // Bet doubling - major tilt indicator
      this.updateTiltLevel('bet-escalation', betAmount / previousBet);
    }

    this.gamblingData.betHistory.unshift({
      amount: betAmount,
      timestamp: Date.now()
    });

    // Keep only last 10 bets
    this.gamblingData.betHistory = this.gamblingData.betHistory.slice(0, 10);
  }

  // Update tilt level based on various factors
  updateTiltLevel(trigger, intensity) {
    const tiltFactors = {
      'rapid-clicking': intensity * 0.1,
      'frantic-typing': intensity * 0.05,
      'loss': Math.min(intensity / 100, 2), // $100 loss = +2 tilt
      'win': -intensity / 200,              // $200 win = -1 tilt  
      'bet-escalation': Math.min(intensity, 3),
      'session-time': this.getSessionMinutes() / 60 // +1 per hour
    };

    this.gamblingData.tiltLevel += tiltFactors[trigger] || 0;
    this.gamblingData.tiltLevel = Math.max(0, Math.min(10, this.gamblingData.tiltLevel));

    // Trigger interventions at high tilt
    if (this.gamblingData.tiltLevel >= 7) {
      this.triggerTiltIntervention();
    }

    this.updateOverlay();
  }

  // Trigger intervention when highly tilted
  async triggerTiltIntervention() {
    // Multiple intervention strategies
    const strategies = [
      await this.suggestQualifyFirstSurveys(),
      await this.inviteToDegensAgainstDecency(), 
      this.showBreathingExercise(),
      this.suggestVaultWithdrawal(),
      this.showAccountabilityReminder()
    ];

    // Show most appropriate intervention
    const intervention = this.selectBestIntervention(strategies);
    this.showInterventionModal(intervention);
  }

  // Integrate with QualifyFirst for positive redirection
  async suggestQualifyFirstSurveys() {
    try {
      const response = await fetch('http://localhost:3001/api/qualifyfirst-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: await this.getUserId(),
          currentLoss: this.gamblingData.totalLost,
          tiltLevel: this.gamblingData.tiltLevel
        })
      });

      const data = await response.json();
      return {
        type: 'qualifyfirst-redirect',
        title: '💰 Earn Money Safely Instead!',
        message: data.message,
        surveys: data.surveys,
        estimatedEarnings: data.estimatedEarnings,
        action: () => window.open(data.surveyUrl, '_blank')
      };
    } catch (error) {
      return null;
    }
  }

  // Integrate with DegensAgainstDecency for social distraction
  async inviteToDegensAgainstDecency() {
    try {
      const response = await fetch('http://localhost:3001/api/degens-intervention', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: await this.getUserId(),
          tiltLevel: this.gamblingData.tiltLevel
        })
      });

      const data = await response.json();
      return {
        type: 'social-gaming-redirect',
        title: '🎮 Join Friends in Fun Games!',
        message: 'Take a break and laugh with friends instead',
        games: data.activeGames,
        discordInvite: data.discordInvite,
        action: () => window.open(data.gameUrl, '_blank')
      };
    } catch (error) {
      return null;
    }
  }

  // Report all activity to TiltCheck backend
  async reportToTiltCheck(eventType, data) {
    try {
      await fetch('http://localhost:3001/api/screen-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          data,
          gamblingData: this.gamblingData,
          platform: this.platform,
          url: window.location.href,
          timestamp: Date.now(),
          userId: await this.getUserId()
        })
      });
    } catch (error) {
      console.error('Failed to report to TiltCheck:', error);
    }
  }

  // Show TiltCheck overlay
  showTiltCheckOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'tiltcheck-overlay';
    overlay.innerHTML = `
      <div class="tiltcheck-widget">
        <div class="tiltcheck-header">
          <span>🛡️ TiltCheck</span>
          <button id="tiltcheck-minimize">−</button>
        </div>
        <div class="tiltcheck-stats">
          <div>Session: <span id="session-time">0m</span></div>
          <div>P&L: <span id="session-pl">$0</span></div>
          <div>Tilt: <span id="tilt-level">😌</span></div>
        </div>
        <div class="tiltcheck-actions">
          <button id="take-break">Take Break</button>
          <button id="set-limit">Set Limit</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.setupOverlayEvents();
  }

  // Utility functions
  extractNumber(text) {
    if (!text) return null;
    const match = text.replace(/[^0-9.-]/g, '');
    return match ? parseFloat(match) : null;
  }

  observeElement(selector, callback) {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) callback(element);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  async getUserId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tiltcheck_user_id'], (result) => {
        resolve(result.tiltcheck_user_id || 'anonymous');
      });
    });
  }

  getSessionMinutes() {
    return Math.floor((Date.now() - this.sessionStartTime) / 60000);
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TiltCheckAdvancedScreenReader();
  });
} else {
  new TiltCheckAdvancedScreenReader();
}
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
 * TiltCheck Overlay - Vanilla JavaScript UI for TiltCheck alerts and monitoring
 * Provides popup alerts, messenger, stats dashboard, and browser notifications
 * without React dependencies.
 */

class TiltCheckOverlay {
  constructor(tiltChecker, playerId) {
    this.tiltChecker = tiltChecker;
    this.playerId = playerId;
    this.alerts = [];
    this.stats = null;
    this.activeAlert = null;
    this.messengerVisible = false;
    this.statsInterval = null;
    
    this.init();
  }

  init() {
    this.createStyles();
    this.setupGlobalInterface();
    this.startStatsUpdating();
    this.createToggleButton();
  }

  createStyles() {
    const styleId = 'tiltcheck-overlay-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .tiltcheck-overlay * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .tiltcheck-popup {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 10000;
        max-width: 384px;
        animation: tiltcheck-slide-in 0.3s ease-out;
      }

      .tiltcheck-popup-content {
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid;
        backdrop-filter: blur(12px);
        color: white;
      }

      .tiltcheck-popup-content.high {
        background-color: rgba(220, 38, 38, 0.9);
        border-color: rgb(239, 68, 68);
      }

      .tiltcheck-popup-content.warning {
        background-color: rgba(217, 119, 6, 0.9);
        border-color: rgb(245, 158, 11);
      }

      .tiltcheck-popup-content.info {
        background-color: rgba(37, 99, 235, 0.9);
        border-color: rgb(59, 130, 246);
      }

      .tiltcheck-popup-content.default {
        background-color: rgba(75, 85, 99, 0.9);
        border-color: rgb(107, 114, 128);
      }

      .tiltcheck-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .tiltcheck-popup-title {
        font-size: 14px;
        font-weight: 500;
      }

      .tiltcheck-popup-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s;
      }

      .tiltcheck-popup-close:hover {
        color: white;
      }

      .tiltcheck-popup-message {
        font-size: 14px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 8px;
      }

      .tiltcheck-advice {
        font-size: 12px;
        font-weight: 600;
        margin-top: 8px;
      }

      .tiltcheck-advice.foldEm { color: rgb(252, 165, 165); }
      .tiltcheck-advice.holdEm { color: rgb(134, 239, 172); }
      .tiltcheck-advice.vault { color: rgb(254, 240, 138); }
      .tiltcheck-advice.default { color: rgb(147, 197, 253); }

      .tiltcheck-messenger {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9999;
        width: 320px;
        max-height: 384px;
        background: linear-gradient(to bottom, rgb(37, 99, 235), rgb(29, 78, 216));
        border-radius: 8px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid rgb(59, 130, 246);
        animation: tiltcheck-slide-up 0.3s ease-out;
      }

      .tiltcheck-messenger-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        background-color: rgb(29, 78, 216);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom: 1px solid rgb(59, 130, 246);
      }

      .tiltcheck-messenger-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tiltcheck-online-indicator {
        width: 12px;
        height: 12px;
        background-color: rgb(34, 197, 94);
        border-radius: 50%;
        animation: tiltcheck-pulse 2s infinite;
      }

      .tiltcheck-messenger-title {
        color: white;
        font-weight: bold;
        font-size: 14px;
      }

      .tiltcheck-messenger-messages {
        padding: 12px;
        max-height: 256px;
        overflow-y: auto;
      }

      .tiltcheck-message {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .tiltcheck-message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .tiltcheck-message-time {
        color: white;
        font-weight: 500;
        font-size: 10px;
      }

      .tiltcheck-message-text {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
      }

      .tiltcheck-empty-state {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        text-align: center;
        padding: 16px;
      }

      .tiltcheck-messenger-status {
        padding: 8px;
        background-color: rgb(30, 64, 175);
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        border-top: 1px solid rgb(59, 130, 246);
      }

      .tiltcheck-status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }

      .tiltcheck-toggle-button {
        position: fixed;
        bottom: 16px;
        right: 400px;
        z-index: 9998;
        background-color: rgb(37, 99, 235);
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .tiltcheck-toggle-button:hover {
        background-color: rgb(29, 78, 216);
      }

      .tiltcheck-notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: rgb(239, 68, 68);
        color: white;
        font-size: 10px;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .tiltcheck-stats {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 9997;
        background-color: rgba(17, 24, 39, 0.9);
        backdrop-filter: blur(12px);
        border-radius: 8px;
        padding: 16px;
        color: white;
        font-size: 14px;
        max-width: 320px;
        animation: tiltcheck-fade-in 0.3s ease-out;
      }

      .tiltcheck-stats-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .tiltcheck-stats-title {
        font-weight: bold;
      }

      .tiltcheck-stats-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .tiltcheck-stats-label {
        color: rgb(156, 163, 175);
      }

      .tiltcheck-stats-value {
        font-weight: 500;
      }

      .tiltcheck-stats-value.danger {
        color: rgb(248, 113, 113);
      }

      .tiltcheck-stats-value.success {
        color: rgb(34, 197, 94);
      }

      .tiltcheck-recommendation {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgb(55, 65, 81);
      }

      .tiltcheck-recommendation-text {
        font-size: 12px;
        color: rgb(156, 163, 175);
        margin-top: 4px;
      }

      /* Icons using unicode symbols */
      .tiltcheck-icon-warning::before { content: "⚠️"; margin-right: 4px; }
      .tiltcheck-icon-info::before { content: "ℹ️"; margin-right: 4px; }
      .tiltcheck-icon-close::before { content: "✖"; }
      .tiltcheck-icon-bell::before { content: "🔔"; }
      .tiltcheck-icon-chart::before { content: "📊"; margin-right: 4px; }

      /* Animations */
      @keyframes tiltcheck-slide-in {
        from {
          opacity: 0;
          transform: translateY(-20px) translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateY(0) translateX(0);
        }
      }

      @keyframes tiltcheck-slide-up {
        from {
          opacity: 0;
          transform: translateY(20px) translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0) translateX(0);
        }
      }

      @keyframes tiltcheck-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes tiltcheck-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  setupGlobalInterface() {
    // Set up global interface for TiltCheck to call
    window.TiltCheckUI = {
      showPopup: (alert) => this.showPopup(alert),
      showMessenger: (alert) => this.showMessenger(alert)
    };
  }

  startStatsUpdating() {
    this.statsInterval = setInterval(() => {
      if (this.tiltChecker && this.playerId) {
        this.stats = this.tiltChecker.getPlayerStats(this.playerId);
        this.updateStatsDisplay();
      }
    }, 5000);
  }

  showPopup(alert) {
    this.activeAlert = alert;
    this.renderPopup();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.activeAlert === alert) { // Only hide if this is still the same alert
        this.hidePopup();
      }
    }, 5000);
  }

  hidePopup(clearAlert = true) {
    const popup = document.getElementById('tiltcheck-popup');
    if (popup) {
      popup.remove();
    }
    if (clearAlert) {
      this.activeAlert = null;
    }
  }

  renderPopup() {
    if (!this.activeAlert) return;

    this.hidePopup(false); // Remove existing popup but don't clear activeAlert

    const popup = document.createElement('div');
    popup.id = 'tiltcheck-popup';
    popup.className = 'tiltcheck-overlay tiltcheck-popup';
    
    const severityClass = this.getSeverityClass(this.activeAlert.severity);
    const iconClass = this.getSeverityIcon(this.activeAlert.severity);
    const advice = this.activeAlert.advice ? this.getAdviceMessage(this.activeAlert.advice) : '';
    const adviceClass = this.activeAlert.advice ? `tiltcheck-advice ${this.activeAlert.advice}` : 'tiltcheck-advice default';

    popup.innerHTML = `
      <div class="tiltcheck-popup-content ${severityClass}">
        <div class="tiltcheck-popup-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="${iconClass}"></span>
            <span class="tiltcheck-popup-title">TiltCheck Alert</span>
          </div>
          <button class="tiltcheck-popup-close tiltcheck-icon-close" onclick="window.tiltCheckOverlay.hidePopup()"></button>
        </div>
        <div class="tiltcheck-popup-message">${this.activeAlert.message}</div>
        ${advice ? `<div class="${adviceClass}">${advice}</div>` : ''}
      </div>
    `;

    document.body.appendChild(popup);
  }

  showMessenger(alert) {
    this.alerts.push(alert);
    this.messengerVisible = true;
    this.renderMessenger();
    this.updateToggleButton();
  }

  toggleMessenger() {
    this.messengerVisible = !this.messengerVisible;
    if (this.messengerVisible) {
      this.renderMessenger();
    } else {
      this.hideMessenger();
    }
  }

  hideMessenger() {
    const messenger = document.getElementById('tiltcheck-messenger');
    if (messenger) {
      messenger.remove();
    }
  }

  renderMessenger() {
    this.hideMessenger(); // Remove existing messenger

    const messenger = document.createElement('div');
    messenger.id = 'tiltcheck-messenger';
    messenger.className = 'tiltcheck-overlay tiltcheck-messenger';

    const recentAlerts = this.alerts.slice(-5);
    const messagesHtml = recentAlerts.length > 0 
      ? recentAlerts.map(alert => {
          const iconClass = this.getSeverityIcon(alert.severity);
          const time = new Date(alert.timestamp).toLocaleTimeString();
          const advice = alert.advice ? this.getAdviceMessage(alert.advice) : '';
          const adviceClass = alert.advice ? `tiltcheck-advice ${alert.advice}` : '';
          
          return `
            <div class="tiltcheck-message">
              <div class="tiltcheck-message-header">
                <span class="${iconClass}"></span>
                <span class="tiltcheck-message-time">${time}</span>
              </div>
              <div class="tiltcheck-message-text">${alert.message}</div>
              ${advice ? `<div class="${adviceClass}">${advice}</div>` : ''}
            </div>
          `;
        }).join('')
      : '<div class="tiltcheck-empty-state">TiltCheck is monitoring your gameplay...</div>';

    messenger.innerHTML = `
      <div class="tiltcheck-messenger-header">
        <div class="tiltcheck-messenger-header-left">
          <div class="tiltcheck-online-indicator"></div>
          <span class="tiltcheck-messenger-title">TiltCheck Assistant</span>
        </div>
        <button class="tiltcheck-popup-close tiltcheck-icon-close" onclick="window.tiltCheckOverlay.toggleMessenger()"></button>
      </div>
      <div class="tiltcheck-messenger-messages">
        ${messagesHtml}
      </div>
      <div class="tiltcheck-messenger-status">
        <div class="tiltcheck-status-row">
          <span>🟢 Monitoring Active</span>
          <span>${this.alerts.length} alerts</span>
        </div>
      </div>
    `;

    document.body.appendChild(messenger);
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'tiltcheck-toggle';
    button.className = 'tiltcheck-overlay tiltcheck-toggle-button';
    button.onclick = () => this.toggleMessenger();
    
    this.updateToggleButton();
    document.body.appendChild(button);
  }

  updateToggleButton() {
    const button = document.getElementById('tiltcheck-toggle');
    if (!button) return;

    const count = this.alerts.length;
    const badge = count > 0 ? `<span class="tiltcheck-notification-badge">${count > 9 ? '9+' : count}</span>` : '';
    
    button.innerHTML = `
      <span class="tiltcheck-icon-bell"></span>
      ${badge}
    `;
  }

  updateStatsDisplay() {
    if (!this.stats) {
      this.hideStats();
      return;
    }

    let statsElement = document.getElementById('tiltcheck-stats');
    if (!statsElement) {
      statsElement = document.createElement('div');
      statsElement.id = 'tiltcheck-stats';
      statsElement.className = 'tiltcheck-overlay tiltcheck-stats';
      document.body.appendChild(statsElement);
    }

    const sessionMinutes = Math.round(this.stats.sessionDuration / 60);
    const emotionalColor = this.stats.emotionalScore > 5 ? 'danger' : 'success';
    const lossColor = this.stats.lossSequence > 3 ? 'danger' : '';
    const slotsRatio = Math.round(this.stats.slotsVsOriginalsRatio * 100);

    let recommendationHtml = '';
    if (this.stats.recommendation) {
      const adviceMessage = this.getAdviceMessage(this.stats.recommendation.action);
      const adviceClass = `tiltcheck-advice ${this.stats.recommendation.action}`;
      recommendationHtml = `
        <div class="tiltcheck-recommendation">
          <div class="${adviceClass}">${adviceMessage}</div>
          <div class="tiltcheck-recommendation-text">${this.stats.recommendation.message}</div>
        </div>
      `;
    }

    statsElement.innerHTML = `
      <div class="tiltcheck-stats-header">
        <span class="tiltcheck-icon-chart"></span>
        <span class="tiltcheck-stats-title">TiltCheck Monitor</span>
      </div>
      <div class="tiltcheck-stats-row">
        <span class="tiltcheck-stats-label">Session:</span>
        <span class="tiltcheck-stats-value">${sessionMinutes}m</span>
      </div>
      <div class="tiltcheck-stats-row">
        <span class="tiltcheck-stats-label">Emotional Score:</span>
        <span class="tiltcheck-stats-value ${emotionalColor}">${this.stats.emotionalScore}/10</span>
      </div>
      <div class="tiltcheck-stats-row">
        <span class="tiltcheck-stats-label">Loss Streak:</span>
        <span class="tiltcheck-stats-value ${lossColor}">${this.stats.lossSequence}</span>
      </div>
      <div class="tiltcheck-stats-row">
        <span class="tiltcheck-stats-label">Slots/Originals:</span>
        <span class="tiltcheck-stats-value">${slotsRatio}%</span>
      </div>
      ${recommendationHtml}
    `;
  }

  hideStats() {
    const stats = document.getElementById('tiltcheck-stats');
    if (stats) {
      stats.remove();
    }
  }

  getSeverityClass(severity) {
    switch (severity) {
      case 'high': return 'high';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case 'high':
      case 'warning': return 'tiltcheck-icon-warning';
      case 'info':
      default: return 'tiltcheck-icon-info';
    }
  }

  getAdviceMessage(advice) {
    switch (advice) {
      case 'foldEm': return "🃏 Time to Fold 'Em";
      case 'holdEm': return "🤝 Hold 'Em Strong";
      case 'vault': return "🏦 Vault Those Winnings";
      default: return "🎯 Stay Alert";
    }
  }

  destroy() {
    // Clean up intervals and DOM elements
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    
    // Remove DOM elements
    this.hidePopup();
    this.hideMessenger();
    this.hideStats();
    
    const button = document.getElementById('tiltcheck-toggle');
    if (button) button.remove();
    
    // Clean up global interface
    delete window.TiltCheckUI;
    delete window.tiltCheckOverlay;
  }
}

// Initialize function for easy setup
window.initTiltCheckOverlay = function(tiltChecker, playerId) {
  // Destroy existing overlay if it exists
  if (window.tiltCheckOverlay) {
    window.tiltCheckOverlay.destroy();
  }
  
  // Create new overlay
  window.tiltCheckOverlay = new TiltCheckOverlay(tiltChecker, playerId);
  return window.tiltCheckOverlay;
};

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TiltCheckOverlay;
} else if (typeof window !== 'undefined') {
  window.TiltCheckOverlay = TiltCheckOverlay;
}
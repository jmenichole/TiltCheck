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
 * TiltCheck Right-Side Overlay - TrustWallet Style
 * Persistent gambling monitoring overlay for casino websites
 */

class TiltCheckRightSideOverlay {
    constructor() {
        this.isExpanded = false;
        this.isMonitoring = false;
        this.sessionData = {
            startTime: Date.now(),
            betCount: 0,
            winCount: 0,
            balance: 0,
            initialBalance: 0,
            alerts: []
        };
        this.overlayContainer = null;
        this.updateInterval = null;
        this.riskLevel = 'LOW';
        
        this.init();
    }

    async init() {
        await this.injectOverlay();
        this.setupEventListeners();
        this.startMonitoring();
        this.startSessionTimer();
    }

    async injectOverlay() {
        // Remove existing overlay if present
        const existing = document.getElementById('tiltcheck-overlay-container');
        if (existing) {
            existing.remove();
        }

        try {
            // Get overlay HTML from Chrome extension
            const overlayHTML = await this.getOverlayHTML();
            
            // Create container and inject
            const overlayElement = document.createElement('div');
            overlayElement.innerHTML = overlayHTML;
            this.overlayContainer = overlayElement.firstElementChild;
            
            // Inject into page
            document.body.appendChild(this.overlayContainer);
            
            console.log('TiltCheck overlay injected successfully');
        } catch (error) {
            console.error('Failed to inject TiltCheck overlay:', error);
            this.createFallbackOverlay();
        }
    }

    async getOverlayHTML() {
        // Try to fetch from extension resources
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            const url = chrome.runtime.getURL('overlay.html');
            const response = await fetch(url);
            return await response.text();
        }
        
        // Fallback to inline HTML if extension resources not available
        return this.getFallbackHTML();
    }

    getFallbackHTML() {
        return `
            <div id="tiltcheck-overlay-container" class="tiltcheck-overlay-container">
                <div class="tiltcheck-overlay-header">
                    <div class="tiltcheck-overlay-logo">
                        <div class="tiltcheck-overlay-logo-icon">🛡️</div>
                        <div class="tiltcheck-overlay-logo-text">TiltCheck</div>
                    </div>
                    <button class="tiltcheck-overlay-toggle" id="tiltcheck-toggle-btn">
                        <span id="tiltcheck-toggle-icon">→</span>
                    </button>
                </div>
                <div class="tiltcheck-overlay-minimized" id="tiltcheck-minimized-view">
                    <div class="tiltcheck-activity-indicator idle" id="tiltcheck-activity-indicator">
                        <span>👁️</span>
                    </div>
                </div>
                <div class="tiltcheck-overlay-content" id="tiltcheck-expanded-content">
                    <div class="tiltcheck-dashboard-section">
                        <h3>🎯 TiltCheck Active</h3>
                        <p style="color: #94a3b8; font-size: 12px;">Monitoring your gaming session for responsible gambling.</p>
                    </div>
                </div>
            </div>
        `;
    }

    createFallbackOverlay() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.innerHTML = this.getFallbackHTML();
        this.overlayContainer = this.overlayContainer.firstElementChild;
        document.body.appendChild(this.overlayContainer);
    }

    setupEventListeners() {
        // Toggle button
        const toggleBtn = this.overlayContainer.querySelector('#tiltcheck-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleExpanded());
        }

        // Activity indicator click (expand when minimized)
        const activityIndicator = this.overlayContainer.querySelector('#tiltcheck-activity-indicator');
        if (activityIndicator) {
            activityIndicator.addEventListener('click', () => {
                if (!this.isExpanded) {
                    this.toggleExpanded();
                }
            });
        }

        // Action buttons
        this.setupActionButtons();

        // Listen for page clicks and key presses for behavior tracking
        document.addEventListener('click', (e) => this.trackUserInteraction('click', e));
        document.addEventListener('keypress', (e) => this.trackUserInteraction('keypress', e));
        
        // Monitor for gambling-related changes
        this.setupGamblingDetection();
    }

    setupActionButtons() {
        const buttons = {
            'tiltcheck-take-break': () => this.takeBreak(),
            'tiltcheck-set-limits': () => this.setLimits(),
            'tiltcheck-view-stats': () => this.viewStats(),
            'tiltcheck-get-help': () => this.getHelp()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            const button = this.overlayContainer.querySelector(`#${id}`);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.overlayContainer.classList.add('expanded');
            const toggleIcon = this.overlayContainer.querySelector('#tiltcheck-toggle-icon');
            if (toggleIcon) toggleIcon.textContent = '←';
        } else {
            this.overlayContainer.classList.remove('expanded');
            const toggleIcon = this.overlayContainer.querySelector('#tiltcheck-toggle-icon');
            if (toggleIcon) toggleIcon.textContent = '→';
        }

        // Save state
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ tiltcheckExpanded: this.isExpanded });
        }
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.updateActivityIndicator('monitoring');

        // Update display every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
            this.assessRiskLevel();
        }, 5000);
    }

    startSessionTimer() {
        setInterval(() => {
            this.updateSessionTime();
        }, 60000); // Update every minute
    }

    updateSessionTime() {
        const sessionDuration = Math.floor((Date.now() - this.sessionData.startTime) / 60000);
        const sessionTimeElements = this.overlayContainer.querySelectorAll('#tiltcheck-session-time, #tiltcheck-session-duration');
        
        sessionTimeElements.forEach(element => {
            if (element) {
                element.textContent = `${sessionDuration}m`;
            }
        });

        // Alert for long sessions
        if (sessionDuration > 0 && sessionDuration % 30 === 0) { // Every 30 minutes
            this.addAlert('warning', 'Long Session Alert', `You've been playing for ${sessionDuration} minutes. Consider taking a break.`);
        }
    }

    updateDisplay() {
        // Update bet count
        const betCountElement = this.overlayContainer.querySelector('#tiltcheck-bet-count');
        if (betCountElement) {
            betCountElement.textContent = this.sessionData.betCount.toString();
        }

        // Update win rate
        const winRateElement = this.overlayContainer.querySelector('#tiltcheck-win-rate');
        if (winRateElement && this.sessionData.betCount > 0) {
            const winRate = Math.round((this.sessionData.winCount / this.sessionData.betCount) * 100);
            winRateElement.textContent = `${winRate}%`;
        }

        // Update balance change
        const balanceChangeElement = this.overlayContainer.querySelector('#tiltcheck-balance-change');
        if (balanceChangeElement) {
            const change = this.sessionData.balance - this.sessionData.initialBalance;
            const prefix = change >= 0 ? '+' : '';
            balanceChangeElement.textContent = `${prefix}$${change}`;
            balanceChangeElement.style.color = change >= 0 ? '#10b981' : '#ef4444';
        }
    }

    updateActivityIndicator(status) {
        const indicator = this.overlayContainer.querySelector('#tiltcheck-activity-indicator');
        if (!indicator) return;

        // Remove all status classes
        indicator.classList.remove('idle', 'monitoring', 'warning', 'danger');
        indicator.classList.add(status);

        // Update icon based on status
        const icon = indicator.querySelector('span');
        if (icon) {
            switch (status) {
                case 'monitoring':
                    icon.textContent = '👁️';
                    break;
                case 'warning':
                    icon.textContent = '⚠️';
                    break;
                case 'danger':
                    icon.textContent = '🚨';
                    break;
                default:
                    icon.textContent = '😴';
            }
        }
    }

    trackUserInteraction(type, event) {
        // Look for gambling-related interactions
        const target = event.target;
        const text = target.textContent || target.value || '';
        const classes = target.className || '';
        
        // Common gambling site patterns
        const gamblingPatterns = [
            /bet|wager|stake/i,
            /spin|play|deal/i,
            /max|all.?in/i,
            /\$\d+|\d+\s*(?:dollars?|usd|btc|eth)/i
        ];

        if (gamblingPatterns.some(pattern => pattern.test(text) || pattern.test(classes))) {
            this.sessionData.betCount++;
            
            // Check for rapid betting
            if (!this.lastBetTime) this.lastBetTime = Date.now();
            const timeSinceLastBet = Date.now() - this.lastBetTime;
            
            if (timeSinceLastBet < 5000) { // Less than 5 seconds
                this.addAlert('warning', 'Rapid Betting Detected', 'You are placing bets very quickly. Consider slowing down.');
                this.updateActivityIndicator('warning');
            }
            
            this.lastBetTime = Date.now();
        }
    }

    setupGamblingDetection() {
        // Monitor for balance changes in common gambling site elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    this.checkForGamblingActivity(mutation.target);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    checkForGamblingActivity(element) {
        if (!element.textContent) return;

        const text = element.textContent.toLowerCase();
        
        // Look for balance indicators
        if (text.includes('balance') || text.includes('credit') || text.includes('wallet')) {
            const balanceMatch = text.match(/\$?([\d,]+\.?\d*)/);
            if (balanceMatch) {
                const newBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
                if (this.sessionData.initialBalance === 0) {
                    this.sessionData.initialBalance = newBalance;
                }
                this.sessionData.balance = newBalance;
            }
        }

        // Look for win/loss indicators
        if (text.includes('you won') || text.includes('congratulations')) {
            this.sessionData.winCount++;
        }
    }

    assessRiskLevel() {
        let riskScore = 0;
        
        // Session time risk
        const sessionMinutes = (Date.now() - this.sessionData.startTime) / 60000;
        if (sessionMinutes > 60) riskScore += 1;
        if (sessionMinutes > 120) riskScore += 2;
        
        // Betting frequency risk
        if (this.sessionData.betCount > 50) riskScore += 1;
        if (this.sessionData.betCount > 100) riskScore += 2;
        
        // Loss streak risk
        const winRate = this.sessionData.betCount > 0 ? this.sessionData.winCount / this.sessionData.betCount : 0;
        if (winRate < 0.3) riskScore += 1;
        if (winRate < 0.2) riskScore += 2;

        // Update risk level
        let newRiskLevel, newRiskMessage, indicatorStatus;
        
        if (riskScore >= 4) {
            newRiskLevel = 'HIGH';
            newRiskMessage = 'High tilt risk detected! Consider stopping your session.';
            indicatorStatus = 'danger';
        } else if (riskScore >= 2) {
            newRiskLevel = 'MEDIUM';
            newRiskMessage = 'Moderate tilt risk. Take breaks and monitor your behavior.';
            indicatorStatus = 'warning';
        } else {
            newRiskLevel = 'LOW';
            newRiskMessage = 'Your behavior patterns look healthy. Keep it up!';
            indicatorStatus = 'monitoring';
        }

        if (newRiskLevel !== this.riskLevel) {
            this.riskLevel = newRiskLevel;
            this.updateRiskDisplay(newRiskLevel, newRiskMessage);
            this.updateActivityIndicator(indicatorStatus);

            if (riskScore >= 4) {
                this.addAlert('danger', 'High Tilt Risk!', 'Multiple risk factors detected. Consider taking a break or stopping your session.');
            } else if (riskScore >= 2) {
                this.addAlert('warning', 'Tilt Risk Increasing', 'Be mindful of your gambling behavior and consider taking a break.');
            }
        }
    }

    updateRiskDisplay(level, message) {
        const riskLevelElement = this.overlayContainer.querySelector('#tiltcheck-risk-level');
        const riskMessageElement = this.overlayContainer.querySelector('#tiltcheck-risk-message');
        const riskBarElement = this.overlayContainer.querySelector('#tiltcheck-risk-bar');

        if (riskLevelElement) {
            riskLevelElement.textContent = level;
            // Cyberpunk color scheme
            const colors = {
                'HIGH': '#ff00ff',
                'MEDIUM': '#ffff00', 
                'LOW': '#00ff41'
            };
            riskLevelElement.style.color = colors[level] || '#00ff41';
            riskLevelElement.style.textShadow = `0 0 10px ${colors[level] || '#00ff41'}80`;
        }

        if (riskMessageElement) {
            riskMessageElement.textContent = message;
        }

        if (riskBarElement) {
            const width = level === 'HIGH' ? '85%' : level === 'MEDIUM' ? '50%' : '15%';
            riskBarElement.style.width = width;
        }
    }

    addAlert(severity, title, message) {
        const alert = { severity, title, message, timestamp: Date.now() };
        this.sessionData.alerts.unshift(alert);
        
        // Keep only last 5 alerts
        if (this.sessionData.alerts.length > 5) {
            this.sessionData.alerts = this.sessionData.alerts.slice(0, 5);
        }

        this.updateAlertsDisplay();

        // Auto-expand for high severity alerts
        if (severity === 'danger' && !this.isExpanded) {
            this.toggleExpanded();
        }
    }

    updateAlertsDisplay() {
        const container = this.overlayContainer.querySelector('#tiltcheck-alerts-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.sessionData.alerts.length === 0) {
            container.innerHTML = `
                <div class="tiltcheck-alert info">
                    <div class="tiltcheck-alert-title">All Clear</div>
                    <div class="tiltcheck-alert-message">No active alerts. Keep gambling responsibly!</div>
                </div>
            `;
        } else {
            this.sessionData.alerts.forEach(alert => {
                const alertElement = document.createElement('div');
                alertElement.className = `tiltcheck-alert ${alert.severity}`;
                alertElement.innerHTML = `
                    <div class="tiltcheck-alert-title">${alert.title}</div>
                    <div class="tiltcheck-alert-message">${alert.message}</div>
                `;
                container.appendChild(alertElement);
            });
        }
    }

    // Action handlers
    takeBreak() {
        this.addAlert('info', 'Break Timer Started', 'Taking a 15-minute break. The overlay will remind you when the break is over.');
        
        // Set a 15-minute timer
        setTimeout(() => {
            this.addAlert('info', 'Break Over', 'Your 15-minute break is complete. Remember to gamble responsibly.');
        }, 15 * 60 * 1000);
    }

    setLimits() {
        // For now, just show an alert. In a full implementation, this would open a limits dialog
        this.addAlert('info', 'Set Limits', 'Feature coming soon! Set time and spending limits for your gambling sessions.');
    }

    viewStats() {
        // Expand the overlay to show current stats
        if (!this.isExpanded) {
            this.toggleExpanded();
        }
        this.addAlert('info', 'Session Stats', `Session: ${Math.floor((Date.now() - this.sessionData.startTime) / 60000)}m, Bets: ${this.sessionData.betCount}, Risk: ${this.riskLevel}`);
    }

    getHelp() {
        // Open responsible gambling resources
        window.open('https://www.ncpgambling.org/help-treatment/national-helpline/', '_blank');
        this.addAlert('info', 'Help Resources', 'Opening responsible gambling resources. Remember, help is always available.');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.overlayContainer) {
            this.overlayContainer.remove();
        }
    }
}

// Initialize overlay when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tiltCheckOverlay = new TiltCheckRightSideOverlay();
    });
} else {
    window.tiltCheckOverlay = new TiltCheckRightSideOverlay();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiltCheckRightSideOverlay;
}
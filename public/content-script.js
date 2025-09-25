// TiltCheck Content Script - Injects overlay into any webpage
(function() {
    'use strict';
    
    let overlayContainer = null;
    let isOverlayVisible = false;
    let monitoringInterval = null;
    let tiltCheckAPI = null;

    // TiltCheck API Integration
    class TiltCheckContentAPI {
        constructor() {
            this.apiKey = null;
            this.sessionData = {
                startTime: Date.now(),
                pageViews: 0,
                interactions: 0,
                suspiciousActivity: 0
            };
            this.init();
        }

        async init() {
            // Load API key from storage
            const result = await chrome.storage.local.get(['apiKey']);
            this.apiKey = result.apiKey;
            
            // Start monitoring current page
            this.startPageMonitoring();
        }

        startPageMonitoring() {
            // Detect gambling site patterns
            const isGamblingSite = this.detectGamblingSite();
            
            if (isGamblingSite) {
                this.startBehaviorTracking();
                // Notify popup
                chrome.runtime.sendMessage({
                    action: 'updateStatus',
                    monitoring: true
                });
            }
        }

        detectGamblingSite() {
            const url = window.location.href.toLowerCase();
            const title = document.title.toLowerCase();
            const content = document.body.textContent.toLowerCase();
            
            const gamblingKeywords = [
                'casino', 'bet', 'poker', 'slots', 'gambling', 'roulette',
                'blackjack', 'jackpot', 'spin', 'wager', 'stake', 'chips'
            ];
            
            return gamblingKeywords.some(keyword => 
                url.includes(keyword) || 
                title.includes(keyword) || 
                content.includes(keyword)
            );
        }

        startBehaviorTracking() {
            // Track mouse movements for rapid clicking patterns
            let clickCount = 0;
            let rapidClickTimer = null;

            document.addEventListener('click', () => {
                clickCount++;
                this.sessionData.interactions++;
                
                if (rapidClickTimer) clearTimeout(rapidClickTimer);
                
                rapidClickTimer = setTimeout(() => {
                    if (clickCount > 10) { // More than 10 clicks in 5 seconds
                        this.detectTiltBehavior('rapid_clicking', { clicks: clickCount });
                    }
                    clickCount = 0;
                }, 5000);
            });

            // Track page focus/blur for session monitoring
            let focusTime = Date.now();
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    const sessionTime = Date.now() - focusTime;
                    if (sessionTime > 30 * 60 * 1000) { // More than 30 minutes
                        this.detectTiltBehavior('extended_session', { duration: sessionTime });
                    }
                } else {
                    focusTime = Date.now();
                }
            });

            // Monitor for specific gambling-related DOM changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // Look for balance changes, bet amount changes, etc.
                        this.analyzeGameStateChanges(mutation);
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        analyzeGameStateChanges(mutation) {
            // Analyze DOM changes for betting patterns
            const addedNodes = Array.from(mutation.addedNodes);
            const textContent = addedNodes
                .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
                .map(node => node.textContent || '')
                .join(' ')
                .toLowerCase();

            // Look for loss indicators
            if (textContent.includes('loss') || textContent.includes('lose') || textContent.includes('lost')) {
                this.detectTiltBehavior('loss_detected', { context: textContent.substring(0, 100) });
            }

            // Look for big win indicators that might lead to increased betting
            if (textContent.includes('win') || textContent.includes('jackpot') || textContent.includes('bonus')) {
                this.detectTiltBehavior('win_detected', { context: textContent.substring(0, 100) });
            }
        }

        detectTiltBehavior(type, data) {
            this.sessionData.suspiciousActivity++;
            
            const tiltEvent = {
                type: type,
                timestamp: Date.now(),
                url: window.location.href,
                data: data,
                sessionData: { ...this.sessionData }
            };

            // Send to overlay if visible
            if (isOverlayVisible && overlayContainer) {
                this.sendToOverlay('tiltDetected', tiltEvent);
            }

            // Store in local storage for persistence
            chrome.storage.local.get(['tiltEvents'], (result) => {
                const events = result.tiltEvents || [];
                events.push(tiltEvent);
                // Keep only last 100 events
                if (events.length > 100) {
                    events.splice(0, events.length - 100);
                }
                chrome.storage.local.set({ tiltEvents: events });
            });

            console.log('TiltCheck: Tilt behavior detected', tiltEvent);
        }

        sendToOverlay(action, data) {
            const event = new CustomEvent('tiltCheckMessage', {
                detail: { action, data }
            });
            window.dispatchEvent(event);
        }
    }

    // Create overlay HTML
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tiltcheck-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid #374151;
            border-radius: 12px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        overlay.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; padding: 16px; border-bottom: 1px solid #374151;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600;">TiltCheck Monitor</h3>
                </div>
                <button id="tiltcheck-close" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 18px; padding: 4px;">&times;</button>
            </div>
            
            <div style="padding: 16px; flex: 1; overflow-y: auto;">
                <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #9ca3af;">SESSION STATS</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px;">Duration:</span>
                        <span id="session-time" style="font-size: 12px; color: #10b981;">0m</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px;">Interactions:</span>
                        <span id="interaction-count" style="font-size: 12px; color: #3b82f6;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 12px;">Risk Level:</span>
                        <span id="risk-level" style="font-size: 12px; color: #10b981;">LOW</span>
                    </div>
                </div>

                <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #9ca3af;">RECENT ACTIVITY</div>
                    <div id="activity-log" style="max-height: 120px; overflow-y: auto;">
                        <div style="font-size: 11px; color: #6b7280; text-align: center; padding: 20px;">
                            Monitoring for behavioral patterns...
                        </div>
                    </div>
                </div>

                <div style="background: #1f2937; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #9ca3af;">QUICK ACTIONS</div>
                    <button id="take-break" style="width: 100%; background: #f59e0b; color: white; border: none; border-radius: 6px; padding: 8px; font-size: 12px; cursor: pointer; margin-bottom: 6px;">
                        Take a 5-minute Break
                    </button>
                    <button id="vault-winnings" style="width: 100%; background: #10b981; color: white; border: none; border-radius: 6px; padding: 8px; font-size: 12px; cursor: pointer; margin-bottom: 6px;">
                        Vault Current Winnings
                    </button>
                    <button id="share-discord" style="width: 100%; background: #5865f2; color: white; border: none; border-radius: 6px; padding: 8px; font-size: 12px; cursor: pointer;">
                        Share to Discord
                    </button>
                </div>
            </div>
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        return overlay;
    }

    // Update overlay stats
    function updateOverlayStats() {
        if (!overlayContainer || !tiltCheckAPI) return;

        const sessionTime = Math.floor((Date.now() - tiltCheckAPI.sessionData.startTime) / 60000);
        const sessionTimeEl = overlayContainer.querySelector('#session-time');
        const interactionCountEl = overlayContainer.querySelector('#interaction-count');
        const riskLevelEl = overlayContainer.querySelector('#risk-level');

        if (sessionTimeEl) sessionTimeEl.textContent = `${sessionTime}m`;
        if (interactionCountEl) interactionCountEl.textContent = tiltCheckAPI.sessionData.interactions;
        
        // Calculate risk level based on activity
        let riskLevel = 'LOW';
        let riskColor = '#10b981';
        
        if (tiltCheckAPI.sessionData.suspiciousActivity > 3 || sessionTime > 60) {
            riskLevel = 'HIGH';
            riskColor = '#ef4444';
        } else if (tiltCheckAPI.sessionData.suspiciousActivity > 1 || sessionTime > 30) {
            riskLevel = 'MEDIUM';
            riskColor = '#f59e0b';
        }
        
        if (riskLevelEl) {
            riskLevelEl.textContent = riskLevel;
            riskLevelEl.style.color = riskColor;
        }
    }

    // Add activity to log
    function addActivityLog(message, type = 'info') {
        if (!overlayContainer) return;
        
        const activityLog = overlayContainer.querySelector('#activity-log');
        if (!activityLog) return;

        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            font-size: 11px;
            padding: 4px 0;
            border-bottom: 1px solid #374151;
            color: ${type === 'warning' ? '#f59e0b' : type === 'danger' ? '#ef4444' : '#9ca3af'};
        `;
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        activityLog.appendChild(logEntry);
        activityLog.scrollTop = activityLog.scrollHeight;
        
        // Keep only last 10 entries
        const entries = activityLog.children;
        while (entries.length > 10) {
            activityLog.removeChild(entries[0]);
        }
    }

    // Show overlay
    function showOverlay() {
        if (overlayContainer) return;

        overlayContainer = createOverlay();
        document.body.appendChild(overlayContainer);
        isOverlayVisible = true;

        // Add event listeners
        const closeBtn = overlayContainer.querySelector('#tiltcheck-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideOverlay);
        }

        const takeBreakBtn = overlayContainer.querySelector('#take-break');
        if (takeBreakBtn) {
            takeBreakBtn.addEventListener('click', () => {
                addActivityLog('5-minute break timer started', 'info');
                // In a real implementation, this would start a timer
            });
        }

        const vaultBtn = overlayContainer.querySelector('#vault-winnings');
        if (vaultBtn) {
            vaultBtn.addEventListener('click', () => {
                addActivityLog('Vault reminder sent', 'info');
                // In a real implementation, this would trigger vault action
            });
        }

        const discordBtn = overlayContainer.querySelector('#share-discord');
        if (discordBtn) {
            discordBtn.addEventListener('click', () => {
                addActivityLog('Shared session data to Discord', 'info');
                // In a real implementation, this would post to Discord
            });
        }

        // Start updating stats
        monitoringInterval = setInterval(updateOverlayStats, 1000);
        
        addActivityLog('TiltCheck monitoring started', 'info');
        console.log('TiltCheck overlay shown');
    }

    // Hide overlay
    function hideOverlay() {
        if (overlayContainer) {
            overlayContainer.remove();
            overlayContainer = null;
        }
        isOverlayVisible = false;
        
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        
        console.log('TiltCheck overlay hidden');
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.action) {
            case 'showOverlay':
                showOverlay();
                break;
            case 'hideOverlay':
                hideOverlay();
                break;
        }
    });

    // Listen for tilt detection events
    window.addEventListener('tiltCheckMessage', function(event) {
        const { action, data } = event.detail;
        
        if (action === 'tiltDetected') {
            addActivityLog(`Tilt behavior detected: ${data.type}`, 'warning');
            
            // Increase suspicion level
            if (tiltCheckAPI) {
                tiltCheckAPI.sessionData.suspiciousActivity++;
            }
        }
    });

    // Initialize API when content script loads
    tiltCheckAPI = new TiltCheckContentAPI();

    // Check if overlay should be shown on load
    chrome.storage.local.get(['overlayActive'], function(result) {
        if (result.overlayActive) {
            showOverlay();
        }
    });

    console.log('TiltCheck content script loaded');
})();
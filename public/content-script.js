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

// TiltCheck Content Script - Right-side overlay for gambling sites
(function() {
    'use strict';
    
    let rightSideOverlay = null;
    let isGamblingSite = false;
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
            // Load API key and settings from storage
            const result = await chrome.storage.local.get(['apiKey', 'overlayActive', 'autoShowOverlay']);
            this.apiKey = result.apiKey;
            
            // Start monitoring current page
            this.startPageMonitoring();
            
            // Auto-show overlay if enabled and on gambling site
            if (result.autoShowOverlay && this.detectGamblingSite()) {
                this.showRightSideOverlay();
            }
        }

        startPageMonitoring() {
            // Detect gambling site patterns
            isGamblingSite = this.detectGamblingSite();
            
            if (isGamblingSite) {
                console.log('TiltCheck: Gambling site detected, starting monitoring');
                this.startBehaviorTracking();
                this.showRightSideOverlay();
                
                // Notify background script
                chrome.runtime.sendMessage({
                    action: 'gamblingDetected',
                    url: window.location.href,
                    monitoring: true
                });
            }
        }

        detectGamblingSite() {
            const url = window.location.href.toLowerCase();
            const title = document.title.toLowerCase();
            const content = document.body ? document.body.textContent.toLowerCase() : '';
            
            const gamblingKeywords = [
                'casino', 'bet', 'poker', 'slots', 'gambling', 'roulette',
                'blackjack', 'jackpot', 'spin', 'wager', 'stake', 'chips',
                'bovada', 'draftkings', 'fanduel', 'betmgm', 'caesars',
                'unibet', 'william hill', 'bet365', 'paddy power',
                'sportsbook', 'baccarat', 'craps', 'keno'
            ];
            
            const gamblingDomains = [
                'bovada.lv', 'draftkings.com', 'fanduel.com', 'betmgm.com',
                'caesars.com', 'unibet.com', 'bet365.com', 'williamhill.com'
            ];
            
            // Check domain first
            const hostname = window.location.hostname.toLowerCase();
            if (gamblingDomains.some(domain => hostname.includes(domain))) {
                return true;
            }
            
            // Check keywords in URL, title, and content
            return gamblingKeywords.some(keyword => 
                url.includes(keyword) || 
                title.includes(keyword) || 
                content.includes(keyword)
            );
        }

        showRightSideOverlay() {
            if (rightSideOverlay) {
                return; // Already showing
            }

            // Load and inject CSS
            this.injectOverlayCSS();
            
            // Load and inject overlay JavaScript
            this.injectOverlayJS();
        }

        injectOverlayCSS() {
            // Check if CSS already injected
            if (document.getElementById('tiltcheck-overlay-css')) {
                return;
            }

            const link = document.createElement('link');
            link.id = 'tiltcheck-overlay-css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = chrome.runtime.getURL('overlay.css');
            document.head.appendChild(link);
        }

        injectOverlayJS() {
            // Check if JS already injected
            if (document.getElementById('tiltcheck-overlay-js')) {
                return;
            }

            const script = document.createElement('script');
            script.id = 'tiltcheck-overlay-js';
            script.src = chrome.runtime.getURL('overlay.js');
            script.onload = () => {
                console.log('TiltCheck right-side overlay loaded');
            };
            document.head.appendChild(script);
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
            if (window.tiltCheckOverlay isOverlayVisible && overlayContainerisOverlayVisible && overlayContainer typeof window.tiltCheckOverlay.addAlert === 'function') {
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
            // Send message to right-side overlay if it exists
            if (window.tiltCheckOverlay) {
                switch (action) {
                    case 'tiltDetected':
                        if (data.type === 'rapid_clicking') {
                            window.tiltCheckOverlay.addAlert('warning', 'Rapid Clicking', 'Rapid clicking detected. Take a moment to slow down.');
                        } else if (data.type === 'extended_session') {
                            window.tiltCheckOverlay.addAlert('warning', 'Long Session', 'You\'ve been playing for over 30 minutes. Consider taking a break.');
                        } else if (data.type === 'loss_detected') {
                            window.tiltCheckOverlay.addAlert('info', 'Loss Detected', 'Loss recorded. Stay mindful of your spending.');
                        }
                        break;
                }
            }
        }
    }

    // Listen for messages from popup and background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('Content script received message:', request);
        
        switch (request.action) {
            case 'showOverlay':
                if (tiltCheckAPI) {
                    tiltCheckAPI.showRightSideOverlay();
                }
                sendResponse({ success: true });
                break;
                
            case 'hideOverlay':
                if (window.tiltCheckOverlay) {
                    window.tiltCheckOverlay.destroy();
                    window.tiltCheckOverlay = null;
                }
                sendResponse({ success: true });
                break;
                
            case 'getGamblingSiteStatus':
                sendResponse({ 
                    isGamblingSite: isGamblingSite,
                    url: window.location.href,
                    monitoring: !!tiltCheckAPI
                });
                break;
                
            case 'toggleOverlay':
                if (window.tiltCheckOverlay) {
                    window.tiltCheckOverlay.toggleExpanded();
                }
                sendResponse({ success: true });
                break;
        }
    });

    // Initialize TiltCheck API when page loads
    function initTiltCheck() {
        tiltCheckAPI = new TiltCheckContentAPI();
        
        // Add custom event listener for communication with overlay
        window.addEventListener('tiltCheckMessage', function(event) {
            if (tiltCheckAPI) {
                const { action, data } = event.detail;
                tiltCheckAPI.sendToOverlay(action, data);
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTiltCheck);
    } else {
        initTiltCheck();
    }

    // Handle page navigation (for SPAs)
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            // Re-initialize on URL change
            if (tiltCheckAPI) {
                tiltCheckAPI.startPageMonitoring();
            }
        }
    }, 1000);

    console.log('TiltCheck content script loaded with right-side overlay');
})();

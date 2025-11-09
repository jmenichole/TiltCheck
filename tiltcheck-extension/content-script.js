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
 * TiltCheck Enhanced Content Script
 * Unified API with robust error handling and fallback UI
 */

(function() {
    'use strict';
    
    // Storage strategy: Use local for session data, sync for user preferences
    const STORAGE = {
        local: ['sessionData', 'tiltEvents', 'currentSession', 'overlayState'],
        sync: ['userSettings', 'customDomains', 'overlayEnabled', 'notifications']
    };

    class TiltCheckEnhancedAPI {
        constructor() {
            this.isInitialized = false;
            this.overlayInjected = false;
            this.fallbackUI = null;
            this.settings = {
                overlayEnabled: true,
                customDomains: [],
                notifications: true,
                autoShow: true
            };
            this.sessionData = {
                startTime: Date.now(),
                interactions: 0,
                suspiciousActivity: 0,
                domain: window.location.hostname
            };
            
            this.init();
        }

        async init() {
            try {
                if (!this.checkChromeAPI()) {
                    this.createFallbackUI();
                    return;
                }

                await this.loadSettings();
                await this.waitForDOM();
                await this.detectAndInitialize();
                
                this.setupMessageListeners();
                this.isInitialized = true;
                console.log('TiltCheck Enhanced API initialized');
                
            } catch (error) {
                console.error('TiltCheck initialization failed:', error);
                this.createFallbackUI();
            }
        }

        checkChromeAPI() {
            return typeof chrome !== 'undefined' && chrome.runtime && chrome.storage;
        }

        async waitForDOM() {
            return new Promise((resolve) => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }

        async loadSettings() {
            try {
                const syncData = await chrome.storage.sync.get(STORAGE.sync);
                const localData = await chrome.storage.local.get(STORAGE.local);
                
                // Merge settings with defaults
                this.settings = {
                    overlayEnabled: syncData.overlayEnabled !== false,
                    customDomains: syncData.customDomains || [],
                    notifications: syncData.notifications !== false,
                    autoShow: syncData.autoShow !== false,
                    ...syncData.userSettings
                };
                
                console.log('TiltCheck settings loaded:', this.settings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }

        async detectAndInitialize() {
            const isGamblingSite = this.detectGamblingSite();
            
            if (isGamblingSite && this.settings.overlayEnabled) {
                console.log('TiltCheck: Gambling site detected, initializing monitoring');
                
                try {
                    await this.injectOverlay();
                    this.startMonitoring();
                    this.notifyBackground('monitoringStarted');
                } catch (error) {
                    console.error('Overlay injection failed:', error);
                    this.createFallbackUI();
                }
            }
        }

        detectGamblingSite() {
            const url = window.location.href.toLowerCase();
            const hostname = window.location.hostname.toLowerCase();
            const title = document.title.toLowerCase();
            
            // Check custom domains first
            if (this.settings.customDomains.some(domain => hostname.includes(domain))) {
                return true;
            }
            
            // Standard gambling domains (from manifest)
            const gamblingDomains = [
                'stake.com', 'bovada.lv', 'draftkings.com', 'fanduel.com',
                'betmgm.com', 'caesars.com', 'pointsbet.com', 
                'barstoolsportsbook.com', 'wynnbet.com', 'foxbet.com'
            ];
            
            return gamblingDomains.some(domain => hostname.includes(domain));
        }

        async injectOverlay() {
            if (this.overlayInjected) return;

            try {
                // Inject CSS first
                await this.injectCSS();
                
                // Inject overlay script
                await this.injectOverlayScript();
                
                // Wait for overlay to initialize
                await this.waitForOverlay();
                
                this.overlayInjected = true;
                console.log('TiltCheck overlay injected successfully');
                
            } catch (error) {
                console.error('Overlay injection failed:', error);
                throw error;
            }
        }

        async injectCSS() {
            return new Promise((resolve, reject) => {
                if (document.getElementById('tiltcheck-styles')) {
                    resolve();
                    return;
                }

                const link = document.createElement('link');
                link.id = 'tiltcheck-styles';
                link.rel = 'stylesheet';
                link.href = chrome.runtime.getURL('overlay.css');
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }

        async injectOverlayScript() {
            return new Promise((resolve, reject) => {
                if (document.getElementById('tiltcheck-overlay-script')) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.id = 'tiltcheck-overlay-script';
                script.src = chrome.runtime.getURL('overlay.js');
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async waitForOverlay() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds max wait
                
                const checkOverlay = () => {
                    if (window.tiltCheckOverlay) {
                        resolve();
                    } else if (attempts++ < maxAttempts) {
                        setTimeout(checkOverlay, 100);
                    } else {
                        reject(new Error('Overlay failed to initialize'));
                    }
                };
                
                checkOverlay();
            });
        }

        createFallbackUI() {
            if (this.fallbackUI) return;

            console.log('TiltCheck: Creating fallback UI');
            
            this.fallbackUI = document.createElement('div');
            this.fallbackUI.id = 'tiltcheck-fallback';
            this.fallbackUI.innerHTML = `
                <div style="
                    position: fixed; 
                    top: 20px; 
                    right: 20px; 
                    background: #1e293b; 
                    color: white; 
                    padding: 16px; 
                    border-radius: 8px; 
                    z-index: 10000; 
                    font-family: system-ui, Arial, sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    max-width: 300px;
                ">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 18px; margin-right: 8px;">🛡️</span>
                        <strong>TiltCheck Active</strong>
                    </div>
                    <p style="margin: 8px 0; font-size: 14px;">
                        Monitoring gambling behavior on this site.
                    </p>
                    <button id="tiltcheck-fallback-close" style="
                        background: #ef4444; 
                        color: white; 
                        border: none; 
                        padding: 6px 12px; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 12px;
                    ">Close</button>
                </div>
            `;
            
            document.body.appendChild(this.fallbackUI);
            
            // Add close functionality
            document.getElementById('tiltcheck-fallback-close').onclick = () => {
                this.fallbackUI.remove();
                this.fallbackUI = null;
            };
        }

        startMonitoring() {
            // Start behavior tracking
            this.trackUserInteractions();
            this.trackDOMChanges();
            
            // Update session data
            this.sessionData.startTime = Date.now();
            this.saveSessionData();
        }

        trackUserInteractions() {
            let clickCount = 0;
            let lastClickTime = 0;

            document.addEventListener('click', (e) => {
                const currentTime = Date.now();
                this.sessionData.interactions++;
                
                // Rapid clicking detection
                if (currentTime - lastClickTime < 1000) {
                    clickCount++;
                } else {
                    clickCount = 1;
                }
                
                if (clickCount > 5) {
                    this.sessionData.suspiciousActivity++;
                    this.notifyBackground('tiltDetected', {
                        type: 'rapid_clicking',
                        intensity: clickCount,
                        timestamp: currentTime
                    });
                }
                
                lastClickTime = currentTime;
                this.saveSessionData();
            });
        }

        trackDOMChanges() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        this.analyzeContentChanges(mutation);
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        analyzeContentChanges(mutation) {
            // Look for gambling-related content changes
            const addedNodes = Array.from(mutation.addedNodes);
            const textContent = addedNodes
                .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
                .map(node => node.textContent || '')
                .join(' ')
                .toLowerCase();

            // Detect potential triggers
            if (textContent.includes('you lost') || textContent.includes('better luck')) {
                this.notifyBackground('tiltDetected', {
                    type: 'loss_detected',
                    content: textContent.substring(0, 100)
                });
            }
        }

        setupMessageListeners() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.handleMessage(request, sender, sendResponse);
                return true; // Keep message channel open
            });
        }

        async handleMessage(request, sender, sendResponse) {
            try {
                switch (request.action) {
                    case 'showOverlay':
                        if (window.tiltCheckOverlay) {
                            window.tiltCheckOverlay.show();
                        } else {
                            await this.injectOverlay();
                        }
                        sendResponse({ success: true });
                        break;
                        
                    case 'hideOverlay':
                        if (window.tiltCheckOverlay) {
                            window.tiltCheckOverlay.hide();
                        }
                        sendResponse({ success: true });
                        break;
                        
                    case 'getStatus':
                        sendResponse({
                            isGamblingSite: this.detectGamblingSite(),
                            overlayActive: this.overlayInjected,
                            sessionData: this.sessionData
                        });
                        break;
                        
                    case 'updateSettings':
                        await this.updateSettings(request.settings);
                        sendResponse({ success: true });
                        break;
                        
                    default:
                        sendResponse({ error: 'Unknown action' });
                }
            } catch (error) {
                console.error('Message handling error:', error);
                sendResponse({ error: error.message });
            }
        }

        async updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings };
            await chrome.storage.sync.set({
                userSettings: this.settings,
                overlayEnabled: this.settings.overlayEnabled,
                customDomains: this.settings.customDomains,
                notifications: this.settings.notifications
            });
        }

        async saveSessionData() {
            try {
                await chrome.storage.local.set({
                    sessionData: this.sessionData,
                    lastUpdate: Date.now()
                });
            } catch (error) {
                console.error('Failed to save session data:', error);
            }
        }

        notifyBackground(action, data = {}) {
            if (!this.checkChromeAPI()) return;
            
            chrome.runtime.sendMessage({
                action: action,
                data: data,
                timestamp: Date.now(),
                url: window.location.href,
                domain: window.location.hostname
            }).catch(error => {
                console.error('Failed to notify background:', error);
            });
        }
    }

    // Initialize when DOM is ready
    let tiltCheckAPI = null;
    
    function initializeTiltCheck() {
        if (tiltCheckAPI) return;
        tiltCheckAPI = new TiltCheckEnhancedAPI();
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTiltCheck);
    } else {
        initializeTiltCheck();
    }

    // Handle page navigation for SPAs
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            if (tiltCheckAPI && tiltCheckAPI.detectGamblingSite()) {
                tiltCheckAPI.detectAndInitialize();
            }
        }
    }, 1000);

})();

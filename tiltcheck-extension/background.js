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
 * TiltCheck Enhanced Background Service Worker
 * Advanced tilt detection with interventions and notifications
 */

// Enhanced error handling for Chrome extension APIs
function safeChromeCalls() {
    if (!chrome || !chrome.runtime) {
        console.error('TiltCheck: Chrome runtime not available');
        return false;
    }
    return true;
}

class TiltCheckBackground {
    constructor() {
        this.activeSessions = new Map();
        this.tiltThresholds = {
            low: 3,
            medium: 6, 
            high: 8
        };
        this.lastInterventions = new Map();
        this.interventionCooldown = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    init() {
        if (!safeChromeCalls()) return;
        
        this.setupMessageListeners();
        this.setupAlarms();
        this.loadSettings();
        console.log('TiltCheck Enhanced Background initialized');
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.checkGamblingSite(tab);
            }
        });

        chrome.tabs.onRemoved.addListener((tabId) => {
            this.activeSessions.delete(tabId);
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            const tabId = sender.tab?.id;
            
            switch (request.action) {
                case 'monitoringStarted':
                    await this.handleMonitoringStarted(request, sender);
                    sendResponse({ success: true });
                    break;
                
                case 'tiltDetected':
                    await this.handleTiltDetection(request.data, sender.tab);
                    sendResponse({ success: true });
                    break;
                
                case 'getSessionData':
                    const sessionData = await this.getSessionData(tabId);
                    sendResponse(sessionData);
                    break;
                
                case 'updateTiltScore':
                    await this.handleTiltUpdate(request, sender);
                    sendResponse({ success: true });
                    break;
                
                case 'requestIntervention':
                    await this.triggerIntervention(request.platform || 'unknown', request.tiltLevel || 'high', tabId);
                    sendResponse({ success: true });
                    break;
                
                default:
                    console.log('Unknown message action:', request.action);
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    checkGamblingSite(tab) {
        const url = tab.url.toLowerCase();
        const title = tab.title.toLowerCase();
        
        const gamblingDomains = [
            'stake.com', 'bovada.lv', 'draftkings.com', 'fanduel.com',
            'betmgm.com', 'caesars.com', 'pointsbet.com', 
            'barstoolsportsbook.com', 'wynnbet.com', 'foxbet.com'
        ];
        
        const isGamblingSite = gamblingDomains.some(domain => 
            url.includes(domain)
        );
        
        if (isGamblingSite) {
            this.updateBadge(tab.id, '●', '#10b981');
            console.log('Gambling site detected:', tab.url);
            
            // Notify content script to start monitoring
            chrome.tabs.sendMessage(tab.id, {
                action: 'startMonitoring'
            }).catch(err => {
                console.log('Could not send message to tab:', err.message);
            });
        } else {
            this.updateBadge(tab.id, '', '#6b7280');
        }
    }

    async handleMonitoringStarted(request, sender) {
        const tabId = sender.tab?.id;
        if (!tabId) return;

        const hostname = new URL(sender.tab.url).hostname;
        this.activeSessions.set(tabId, {
            platform: hostname,
            startTime: Date.now(),
            url: sender.tab.url,
            tiltScore: 0,
            tiltLevel: 'Low',
            interactions: 0,
            alerts: []
        });

        this.updateBadge(tabId, '●', '#10b981');
        console.log('Monitoring started for:', hostname);
    }

    async handleTiltDetection(data, tab) {
        const tabId = tab?.id;
        if (!tabId) return;

        const session = this.activeSessions.get(tabId);
        if (!session) return;

        // Update session with tilt event
        session.alerts.push({
            type: data.type,
            timestamp: data.timestamp || Date.now(),
            data: data
        });

        // Calculate new tilt score
        const newTiltScore = this.calculateTiltScore(session);
        const newTiltLevel = this.getTiltLevel(newTiltScore);

        session.tiltScore = newTiltScore;
        session.tiltLevel = newTiltLevel;
        session.lastUpdate = Date.now();

        this.activeSessions.set(tabId, session);

        // Update badge with tilt level
        const badgeColor = this.getTiltColor(newTiltLevel);
        this.updateBadge(tabId, newTiltLevel.charAt(0), badgeColor);

        // Store tilt event
        await this.storeTiltData({
            tabId,
            platform: session.platform,
            tiltScore: newTiltScore,
            tiltLevel: newTiltLevel,
            eventType: data.type,
            timestamp: Date.now()
        });

        // Check if intervention is needed
        if (this.shouldTriggerIntervention(newTiltScore, session.platform)) {
            await this.triggerIntervention(session.platform, newTiltLevel, tabId);
        }

        console.log(`Tilt detected: ${data.type} - Score: ${newTiltScore}, Level: ${newTiltLevel}`);
    }

    calculateTiltScore(session) {
        let score = 0;
        const recentAlerts = session.alerts.filter(alert => 
            Date.now() - alert.timestamp < 10 * 60 * 1000 // Last 10 minutes
        );

        // Weight different types of alerts
        recentAlerts.forEach(alert => {
            switch (alert.type) {
                case 'rapid_clicking':
                    score += 2;
                    break;
                case 'loss_detected':
                    score += 3;
                    break;
                case 'extended_session':
                    score += 1;
                    break;
                default:
                    score += 1;
            }
        });

        // Time-based multiplier
        const sessionMinutes = (Date.now() - session.startTime) / (1000 * 60);
        if (sessionMinutes > 60) score *= 1.5;
        if (sessionMinutes > 120) score *= 2;

        return Math.min(score, 10); // Cap at 10
    }

    getTiltLevel(score) {
        if (score >= this.tiltThresholds.high) return 'High';
        if (score >= this.tiltThresholds.medium) return 'Medium';
        return 'Low';
    }

    getTiltColor(level) {
        const colors = {
            'High': '#ef4444',
            'Medium': '#f59e0b',
            'Low': '#10b981'
        };
        return colors[level] || '#6b7280';
    }

    shouldTriggerIntervention(tiltScore, platform) {
        if (tiltScore < this.tiltThresholds.high) return false;

        const lastIntervention = this.lastInterventions.get(platform);
        if (lastIntervention) {
            const timeSince = Date.now() - lastIntervention;
            if (timeSince < this.interventionCooldown) return false;
        }

        return true;
    }

    async triggerIntervention(platform, tiltLevel, tabId) {
        try {
            this.lastInterventions.set(platform, Date.now());

            // Create notification
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon-48.png',
                title: 'TiltCheck - High Tilt Detected',
                message: `Consider taking a break from ${platform}. Alternative activities are available.`,
                buttons: [
                    { title: 'Take Break' },
                    { title: 'View Alternatives' }
                ],
                requireInteraction: true
            });

            // Update badge to danger color
            if (tabId) {
                this.updateBadge(tabId, '!', '#ef4444');
                
                // Reset badge after 10 seconds
                setTimeout(() => {
                    this.updateBadge(tabId, 'H', '#ef4444');
                }, 10000);
            }

            // Store intervention
            await this.storeIntervention({
                platform: platform,
                tiltLevel: tiltLevel,
                timestamp: Date.now(),
                type: 'automatic'
            });

            console.log(`Intervention triggered for ${platform} (${tiltLevel} tilt)`);

        } catch (error) {
            console.error('Error triggering intervention:', error);
        }
    }

    async updateBadge(tabId, text, color) {
        try {
            await chrome.action.setBadgeText({ text, tabId });
            await chrome.action.setBadgeBackgroundColor({ color, tabId });
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    async storeTiltData(tiltData) {
        try {
            const stored = await chrome.storage.local.get(['tiltHistory']);
            const history = stored.tiltHistory || [];
            
            history.push(tiltData);
            
            // Keep only last 500 entries
            if (history.length > 500) {
                history.splice(0, history.length - 500);
            }
            
            await chrome.storage.local.set({ tiltHistory: history });
        } catch (error) {
            console.error('Error storing tilt data:', error);
        }
    }

    async storeIntervention(intervention) {
        try {
            const stored = await chrome.storage.local.get(['interventions']);
            const interventions = stored.interventions || [];
            
            interventions.push(intervention);
            
            if (interventions.length > 100) {
                interventions.splice(0, interventions.length - 100);
            }
            
            await chrome.storage.local.set({ interventions: interventions });
        } catch (error) {
            console.error('Error storing intervention:', error);
        }
    }

    async getSessionData(tabId) {
        return this.activeSessions.get(tabId) || null;
    }

    setupAlarms() {
        if (!chrome.alarms) return;
        
        chrome.alarms.clear('sessionCleanup');
        chrome.alarms.create('sessionCleanup', { periodInMinutes: 30 });
        
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'sessionCleanup') {
                this.cleanupSessions();
            }
        });
    }

    async cleanupSessions() {
        try {
            const tabs = await chrome.tabs.query({});
            const activeTabIds = new Set(tabs.map(tab => tab.id));
            
            for (const [tabId] of this.activeSessions.entries()) {
                if (!activeTabIds.has(tabId)) {
                    this.activeSessions.delete(tabId);
                }
            }
        } catch (error) {
            console.error('Error during session cleanup:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'tiltThresholds',
                'interventionCooldown',
                'enableNotifications'
            ]);
            
            if (result.tiltThresholds) {
                this.tiltThresholds = { ...this.tiltThresholds, ...result.tiltThresholds };
            }
            
            if (result.interventionCooldown) {
                this.interventionCooldown = result.interventionCooldown;
            }
            
            console.log('Settings loaded:', {
                tiltThresholds: this.tiltThresholds,
                interventionCooldown: this.interventionCooldown
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Initialize background service worker
const tiltCheckBackground = new TiltCheckBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('TiltCheck Enhanced: Extension installed');
        
        // Set default settings
        chrome.storage.sync.set({
            enableNotifications: true,
            enableInterventions: true,
            overlayEnabled: true,
            customDomains: [],
            tiltThresholds: { low: 3, medium: 6, high: 8 },
            interventionCooldown: 5 * 60 * 1000
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'https://github.com/jmenichole/TiltCheck'
        });
    }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
        // Take Break button
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'takeBreak' });
        }
    } else if (buttonIndex === 1) {
        // View Alternatives button
        chrome.tabs.create({ url: 'https://qualifyfirst.vercel.app' });
    }
    
    chrome.notifications.clear(notificationId);
});

console.log('TiltCheck Enhanced Background Service Worker started');

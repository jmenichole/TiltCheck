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

// TiltCheck Extension Background Service Worker
console.log('TiltCheck background service worker started');

// Install and setup
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('TiltCheck extension installed/updated', details);
    
    // Set default settings
    chrome.storage.local.set({
        overlayActive: false,
        autoShowOverlay: true, // Auto-show on gambling sites
        apiKey: '',
        discordWebhook: '',
        monitoringEnabled: true,
        alertThresholds: {
            sessionTime: 60, // minutes
            rapidClicks: 10,
            suspiciousActivity: 5
        }
    });
});

// Handle tab updates to check for gambling sites
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        checkGamblingSite(tab);
    }
});

// Check if current site is a gambling site
function checkGamblingSite(tab) {
    const url = tab.url.toLowerCase();
    const title = tab.title.toLowerCase();
    
    const gamblingKeywords = [
        'casino', 'bet', 'poker', 'slots', 'gambling', 'roulette',
        'blackjack', 'jackpot', 'spin', 'wager', 'stake', 'chips',
        'bovada', 'draftkings', 'fanduel', 'betmgm', 'caesars'
    ];
    
    const isGamblingSite = gamblingKeywords.some(keyword => 
        url.includes(keyword) || title.includes(keyword)
    );
    
    if (isGamblingSite) {
        // Update badge to show monitoring is active
        chrome.action.setBadgeText({
            text: '●',
            tabId: tab.id
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#10b981',
            tabId: tab.id
        });
        
        console.log('Gambling site detected:', tab.url);
        
        // Optionally auto-show overlay
        chrome.storage.local.get(['autoShowOverlay'], function(result) {
            if (result.autoShowOverlay) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'showOverlay'
                }).catch(err => {
                    // Ignore errors for tabs that don't have content script
                    console.log('Could not send message to tab:', err.message);
                });
            }
        });
    } else {
        // Clear badge
        chrome.action.setBadgeText({
            text: '',
            tabId: tab.id
        });
    }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'tiltDetected':
            handleTiltDetection(request.data, sender.tab);
            break;
        case 'saveSettings':
            chrome.storage.local.set(request.settings);
            sendResponse({success: true});
            break;
        case 'getSettings':
            chrome.storage.local.get(null, function(items) {
                sendResponse(items);
            });
            return true; // Keep message channel open for async response
    }
});

// Handle tilt detection from content script
function handleTiltDetection(data, tab) {
    console.log('Tilt behavior detected:', data);
    
    // Store tilt event
    chrome.storage.local.get(['tiltEvents'], function(result) {
        const events = result.tiltEvents || [];
        events.push({
            ...data,
            tabId: tab.id,
            url: tab.url,
            title: tab.title,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        chrome.storage.local.set({tiltEvents: events});
    });
    
    // Send to Discord if configured
    chrome.storage.local.get(['discordWebhook'], function(result) {
        if (result.discordWebhook) {
            sendDiscordAlert(data, tab, result.discordWebhook);
        }
    });
    
    // Update badge to show alert
    chrome.action.setBadgeText({
        text: '!',
        tabId: tab.id
    });
    chrome.action.setBadgeBackgroundColor({
        color: '#ef4444',
        tabId: tab.id
    });
    
    // Reset badge after 10 seconds
    setTimeout(() => {
        chrome.action.setBadgeText({
            text: '●',
            tabId: tab.id
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#10b981',
            tabId: tab.id
        });
    }, 10000);
}

// Send alert to Discord webhook
async function sendDiscordAlert(data, tab, webhookUrl) {
    try {
        const embed = {
            title: "🎯 TiltCheck Alert",
            description: `Tilt behavior detected: **${data.type}**`,
            color: 15548997, // Red color
            fields: [
                {
                    name: "Site",
                    value: new URL(tab.url).hostname,
                    inline: true
                },
                {
                    name: "Time",
                    value: new Date().toLocaleString(),
                    inline: true
                },
                {
                    name: "Session Data",
                    value: `Interactions: ${data.sessionData?.interactions || 0}\nSuspicious Activity: ${data.sessionData?.suspiciousActivity || 0}`,
                    inline: false
                }
            ],
            footer: {
                text: "TiltCheck Extension v1.0.0"
            }
        };
        
        const payload = {
            embeds: [embed],
            username: "TiltCheck Bot"
        };
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('Discord alert sent successfully');
        } else {
            console.error('Failed to send Discord alert:', response.status);
        }
    } catch (error) {
        console.error('Error sending Discord alert:', error);
    }
}

// Periodic cleanup of old data
setInterval(() => {
    chrome.storage.local.get(['tiltEvents'], function(result) {
        if (result.tiltEvents) {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const recentEvents = result.tiltEvents.filter(event => event.timestamp > oneWeekAgo);
            
            if (recentEvents.length !== result.tiltEvents.length) {
                chrome.storage.local.set({tiltEvents: recentEvents});
                console.log('Cleaned up old tilt events');
            }
        }
    });
}, 24 * 60 * 60 * 1000); // Run daily
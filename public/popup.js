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

// TiltCheck Extension Popup Script
document.addEventListener('DOMContentLoaded', function() {
    const toggleOverlayBtn = document.getElementById('toggleOverlay');
    const openSettingsBtn = document.getElementById('openSettings');
    const openFullDashboardBtn = document.getElementById('openFullDashboard');
    const dashboardStatus = document.getElementById('dashboardStatus');
    const currentPage = document.getElementById('currentPage');
    const monitoringStatus = document.getElementById('monitoringStatus');

    let overlayActive = false;

    // Check current tab and update UI
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);
        
        // Update current page display
        currentPage.textContent = url.hostname;
        
        // Check if this is a gambling site (simplified detection)
        const gamblingKeywords = ['casino', 'bet', 'poker', 'slots', 'gambling', 'game'];
        const isGamblingSite = gamblingKeywords.some(keyword => 
            url.hostname.toLowerCase().includes(keyword) || 
            currentTab.title.toLowerCase().includes(keyword)
        );
        
        if (isGamblingSite) {
            monitoringStatus.innerHTML = '<span class="indicator green"></span>Casino Detected';
            monitoringStatus.className = 'status-value active';
            
            // Auto-enable overlay for gambling sites
            chrome.storage.local.get(['autoShowOverlay'], function(result) {
                if (result.autoShowOverlay !== false) { // Default to true
                    overlayActive = true;
                    updateOverlayButton();
                }
            });
        } else {
            monitoringStatus.innerHTML = '<span class="indicator yellow"></span>Standby';
            monitoringStatus.className = 'status-value warning';
        }
    });

    // Load overlay state from storage
    chrome.storage.local.get(['overlayActive'], function(result) {
        overlayActive = result.overlayActive || false;
        updateOverlayButton();
    });

    function updateOverlayButton() {
        if (overlayActive) {
            toggleOverlayBtn.textContent = 'Hide Dashboard Overlay';
            toggleOverlayBtn.className = 'button success';
        } else {
            toggleOverlayBtn.textContent = 'Show Dashboard Overlay';
            toggleOverlayBtn.className = 'button';
        }
    }

    // Toggle overlay
    toggleOverlayBtn.addEventListener('click', function() {
        overlayActive = !overlayActive;
        
        // Save state
        chrome.storage.local.set({overlayActive: overlayActive});
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: overlayActive ? 'showOverlay' : 'hideOverlay'
            });
        });
        
        updateOverlayButton();
    });

    // Open settings
    openSettingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Open full dashboard
    openFullDashboardBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
        });
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStatus') {
            // Update popup status based on content script feedback
            if (request.monitoring) {
                monitoringStatus.innerHTML = '<span class="indicator green"></span>Monitoring';
                monitoringStatus.className = 'status-value active';
            }
        }
    });
});
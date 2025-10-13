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

// TiltCheck Demo Extension - Enhanced Popup with JustTheTip Integration
// Investor Demo Version v2.1.0

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ TiltCheck Demo Dashboard Loaded - JustTheTip Integration Active');
    
    // Initialize demo data and real-time updates
    initializeDemoData();
    startRealTimeUpdates();
    setupEventListeners();
    
    // Show demo notification
    showDemoNotification();
});

// Demo data state
let demoState = {
    interventions: 47,
    moneySaved: 2340,
    earningsGenerated: 890,
    successRate: 95,
    tiltLevel: 15,
    aiConfidence: 97,
    justTheTipEarnings: 127.50,
    isActive: true
};

function initializeDemoData() {
    // Load saved demo data from storage
    chrome.storage.local.get(['tiltCheckDemo'], (result) => {
        if (result.tiltCheckDemo) {
            demoState = { ...demoState, ...result.tiltCheckDemo };
        }
        updateDashboard();
    });
}

function updateDashboard() {
    // Update metrics display
    document.getElementById('interventions').textContent = demoState.interventions;
    document.getElementById('moneySaved').textContent = `$${demoState.moneySaved.toLocaleString()}`;
    document.getElementById('earningsGenerated').textContent = `$${demoState.earningsGenerated.toLocaleString()}`;
    document.getElementById('successRate').textContent = `${demoState.successRate}%`;
    document.getElementById('aiConfidence').textContent = `${demoState.aiConfidence}%`;
    
    // Update tilt meter
    const tiltFill = document.getElementById('tiltFill');
    tiltFill.style.width = `${demoState.tiltLevel}%`;
    
    // Update JustTheTip earnings
    const earningsElement = document.querySelector('.earnings-amount');
    if (earningsElement) {
        earningsElement.textContent = `$${demoState.justTheTipEarnings.toFixed(2)}`;
    }
    
    // Save state
    chrome.storage.local.set({ tiltCheckDemo: demoState });
}

function setupEventListeners() {
    // Demo Control Buttons
    document.getElementById('triggerDemo')?.addEventListener('click', triggerDemoIntervention);
    document.getElementById('openEarnings')?.addEventListener('click', openEarningsPlatform);
    document.getElementById('viewAnalytics')?.addEventListener('click', viewAnalyticsDashboard);
    document.getElementById('simulateTilt')?.addEventListener('click', simulateTiltDetection);
    
    // Investor Demo Buttons
    document.getElementById('showIntegration')?.addEventListener('click', showJustTheTipIntegration);
    document.getElementById('viewMetrics')?.addEventListener('click', viewRealTimeMetrics);
    document.getElementById('testWorkflow')?.addEventListener('click', testCompleteWorkflow);
}

function triggerDemoIntervention() {
    console.log('🎯 Triggering Demo Intervention');
    
    // Animate metrics update
    demoState.interventions += 1;
    demoState.moneySaved += Math.floor(Math.random() * 200) + 50;
    demoState.earningsGenerated += Math.floor(Math.random() * 50) + 15;
    
    updateDashboard();
    
    // Show intervention overlay on current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: showDemoIntervention
        });
    });
    
    // Show success notification
    showNotification('Demo Intervention Triggered', 'AI detected simulated tilt and activated intervention overlay');
}

function openEarningsPlatform() {
    console.log('💰 Opening QualifyFirst Earnings Platform');
    chrome.tabs.create({ url: 'http://localhost:3001/cpx-research' });
}

function viewAnalyticsDashboard() {
    console.log('📊 Opening Analytics Dashboard');
    chrome.tabs.create({ url: 'http://localhost:3001/smart-dashboard' });
}

function simulateTiltDetection() {
    console.log('⚠️ Simulating Tilt Detection');
    
    // Animate tilt level increase
    let currentLevel = demoState.tiltLevel;
    const targetLevel = Math.min(currentLevel + 30, 85);
    
    const animateTilt = () => {
        if (currentLevel < targetLevel) {
            currentLevel += 2;
            demoState.tiltLevel = currentLevel;
            updateDashboard();
            setTimeout(animateTilt, 100);
        } else {
            // Trigger intervention after reaching high tilt
            setTimeout(() => {
                triggerDemoIntervention();
                // Reset tilt level after intervention
                setTimeout(() => {
                    demoState.tiltLevel = 15;
                    updateDashboard();
                }, 2000);
            }, 1000);
        }
    };
    
    animateTilt();
}

function showJustTheTipIntegration() {
    console.log('🔗 Demonstrating JustTheTip Integration');
    
    // Update earnings to show JustTheTip integration
    demoState.justTheTipEarnings += Math.random() * 25 + 10;
    updateDashboard();
    
    // Show integration details
    showNotification(
        'JustTheTip Integration Active',
        `Revenue sharing active: 25% TiltCheck, 75% User. Current available earnings: $${demoState.justTheTipEarnings.toFixed(2)}`
    );
    
    // Open JustTheTip platform (simulated)
    chrome.tabs.create({ url: 'https://justthetip.app' });
}

function viewRealTimeMetrics() {
    console.log('📈 Viewing Real-Time Metrics');
    chrome.tabs.create({ url: 'http://localhost:3002/api/integration/status' });
}

function testCompleteWorkflow() {
    console.log('🚀 Testing Complete Workflow');
    
    showNotification('Complete Workflow Test', 'Starting end-to-end demonstration...');
    
    // Simulate complete workflow
    setTimeout(() => {
        simulateTiltDetection();
    }, 1000);
    
    setTimeout(() => {
        showJustTheTipIntegration();
    }, 4000);
    
    setTimeout(() => {
        openEarningsPlatform();
    }, 6000);
}

function startRealTimeUpdates() {
    // Simulate real-time data updates for demo
    setInterval(() => {
        // Small random fluctuations in AI confidence
        demoState.aiConfidence = Math.max(90, Math.min(99, demoState.aiConfidence + (Math.random() - 0.5) * 2));
        
        // Slight tilt level variations
        if (demoState.tiltLevel < 50) {
            demoState.tiltLevel = Math.max(10, Math.min(30, demoState.tiltLevel + (Math.random() - 0.5) * 5));
        }
        
        // JustTheTip earnings updates
        if (Math.random() > 0.7) {
            demoState.justTheTipEarnings += Math.random() * 2;
        }
        
        updateDashboard();
    }, 3000);
}

function showDemoIntervention() {
    // This function runs in the content script context
    const overlay = document.createElement('div');
    overlay.id = 'tiltcheck-demo-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: white;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            ">
                <div style="font-size: 60px; margin-bottom: 20px;">🛡️</div>
                <h2 style="margin-bottom: 20px; font-size: 28px;">TiltCheck Demo - AI Intervention Active</h2>
                <p style="margin-bottom: 20px; font-size: 18px; line-height: 1.6;">
                    Our AI has detected potential gambling tilt behavior. This is a demonstration of how TiltCheck redirects users to earning opportunities.
                </p>
                <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                    <div style="font-size: 24px; font-weight: bold; color: #4ade80; margin-bottom: 10px;">$127.50</div>
                    <div style="font-size: 14px;">Available through JustTheTip Integration</div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="window.open('http://localhost:3001/cpx-research', '_blank')" style="
                        background: linear-gradient(45deg, #4ade80, #22c55e);
                        color: white;
                        border: none;
                        padding: 15px 25px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">🚀 Start Earning Instead</button>
                    <button onclick="document.getElementById('tiltcheck-demo-overlay').remove()" style="
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        padding: 15px 25px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">🧘 Take a Moment</button>
                </div>
                <div style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                    Demo Mode - Investor Presentation
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        const existingOverlay = document.getElementById('tiltcheck-demo-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }, 10000);
}

function showDemoNotification() {
    showNotification(
        'TiltCheck Demo Active',
        'Investor demo mode enabled. JustTheTip integration ready. Click buttons to see AI intervention in action.'
    );
}

function showNotification(title, message) {
    // Check if notifications are supported
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        });
    } else {
        console.log(`${title}: ${message}`);
    }
}

// Export functions for content script access
window.tiltCheckDemo = {
    triggerIntervention: triggerDemoIntervention,
    updateMetrics: updateDashboard,
    showJustTheTipIntegration: showJustTheTipIntegration
};
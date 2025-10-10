// TiltCheck Demo Background Service Worker
// Investor Demo v2.1.0 with JustTheTip Integration

console.log('🛡️ TiltCheck Demo Background Service Worker Starting');

// Demo configuration
const DEMO_CONFIG = {
    version: '2.1.0',
    justTheTipIntegration: true,
    tiltCheckAPI: 'http://localhost:3002',
    qualifyFirstPlatform: 'http://localhost:3001',
    justTheTipAPI: 'https://justthetip.app/api',
    demoMode: true
};

// AI Detection simulation parameters
const AI_CONFIG = {
    detectionInterval: 5000, // Check every 5 seconds in demo
    tiltThreshold: 0.75,
    confidenceThreshold: 0.85,
    interventionCooldown: 30000 // 30 seconds between interventions
};

// Demo state tracking
let demoState = {
    sessionsMonitored: 0,
    interventionsTriggered: 0,
    moneySaved: 0,
    earningsGenerated: 0,
    lastIntervention: 0,
    justTheTipRevenue: 0,
    activeUsers: new Set()
};

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
    console.log('🚀 TiltCheck Demo Extension Installed');
    
    if (details.reason === 'install') {
        // Show welcome notification for demo
        showDemoWelcomeNotification();
        
        // Initialize demo data
        initializeDemoData();
        
        // Open demo dashboard
        setTimeout(() => {
            chrome.tabs.create({ url: 'http://localhost:3000' });
        }, 2000);
    }
});

// Content script messaging
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Background received message:', request.type);
    
    switch (request.type) {
        case 'TILT_DETECTED':
            handleTiltDetection(request.data, sender.tab);
            break;
            
        case 'DEMO_TRIGGER_INTERVENTION':
            triggerDemoIntervention(sender.tab);
            break;
            
        case 'GET_DEMO_STATS':
            sendResponse({ success: true, data: demoState });
            break;
            
        case 'UPDATE_DEMO_METRICS':
            updateDemoMetrics(request.data);
            sendResponse({ success: true });
            break;
            
        case 'JUSTTHETIP_INTEGRATION':
            handleJustTheTipIntegration(request.data);
            sendResponse({ success: true });
            break;
            
        default:
            console.log('❓ Unknown message type:', request.type);
    }
    
    return true; // Keep message channel open for async response
});

// Tab monitoring for gambling sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isGamblingSite = checkIfGamblingSite(tab.url);
        
        if (isGamblingSite) {
            console.log('🎰 Gambling site detected:', tab.url);
            demoState.sessionsMonitored++;
            demoState.activeUsers.add(tabId);
            
            // Start monitoring this tab
            startTabMonitoring(tabId);
            
            // Update demo metrics
            saveDemoState();
        }
    }
});

// Tab removal cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
    demoState.activeUsers.delete(tabId);
});

function checkIfGamblingSite(url) {
    const gamblingDomains = [
        'stake.us', 'stake.com', 'draftkings.com', 'fanduel.com', 
        'betmgm.com', 'caesars.com', 'pointsbet.com', 'barstool.com',
        'bovada.lv', 'ignition.eu', 'pokerstars.com', '888poker.com'
    ];
    
    // Also treat localhost as gambling site for demo
    if (url.includes('localhost')) return true;
    
    return gamblingDomains.some(domain => url.includes(domain));
}

function startTabMonitoring(tabId) {
    console.log('👁️ Starting monitoring for tab:', tabId);
    
    // Inject enhanced content script for demo
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: initializeAdvancedDemo
    });
}

function handleTiltDetection(tiltData, tab) {
    console.log('⚠️ Tilt detected:', tiltData);
    
    const now = Date.now();
    const timeSinceLastIntervention = now - demoState.lastIntervention;
    
    if (timeSinceLastIntervention < AI_CONFIG.interventionCooldown) {
        console.log('🔄 Intervention on cooldown');
        return;
    }
    
    if (tiltData.confidence >= AI_CONFIG.confidenceThreshold) {
        triggerIntervention(tab, tiltData);
    }
}

function triggerIntervention(tab, tiltData) {
    console.log('🛡️ Triggering intervention for tab:', tab.id);
    
    // Update demo metrics
    demoState.interventionsTriggered++;
    demoState.lastIntervention = Date.now();
    demoState.moneySaved += Math.floor(Math.random() * 200) + 50;
    
    // Show intervention overlay
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: showAdvancedIntervention,
        args: [tiltData, DEMO_CONFIG]
    });
    
    // Notify JustTheTip integration
    notifyJustTheTipIntegration(tiltData);
    
    // Show notification
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'TiltCheck Demo - Intervention Triggered',
        message: `AI detected tilt (${Math.round(tiltData.confidence * 100)}% confidence). Redirecting to earning opportunities.`
    });
    
    saveDemoState();
}

function triggerDemoIntervention(tab) {
    const mockTiltData = {
        confidence: 0.95,
        riskLevel: 'HIGH',
        betAmount: Math.floor(Math.random() * 500) + 100,
        sessionDuration: Math.floor(Math.random() * 120) + 30,
        lossAmount: Math.floor(Math.random() * 1000) + 200
    };
    
    triggerIntervention(tab, mockTiltData);
}

function notifyJustTheTipIntegration(tiltData) {
    console.log('💎 Notifying JustTheTip integration');
    
    // Simulate API call to JustTheTip
    const revenueShare = calculateRevenueShare(tiltData);
    demoState.justTheTipRevenue += revenueShare;
    
    // Simulate earning opportunity
    const earningOpportunity = generateEarningOpportunity();
    demoState.earningsGenerated += earningOpportunity;
    
    console.log('💰 Revenue share calculated:', revenueShare);
    console.log('🎯 Earning opportunity:', earningOpportunity);
}

function calculateRevenueShare(tiltData) {
    // 25% to TiltCheck, 75% to user
    const potentialLoss = tiltData.betAmount || 100;
    const revenueShare = potentialLoss * 0.25;
    return Math.round(revenueShare * 100) / 100;
}

function generateEarningOpportunity() {
    // Generate realistic earning amounts
    const opportunities = [
        { task: 'Consumer Survey', amount: 12 },
        { task: 'Product Feedback', amount: 8 },
        { task: 'Market Research', amount: 15 },
        { task: 'Focus Group', amount: 35 },
        { task: 'Brand Study', amount: 22 }
    ];
    
    const opportunity = opportunities[Math.floor(Math.random() * opportunities.length)];
    return opportunity.amount;
}

function updateDemoMetrics(newData) {
    Object.assign(demoState, newData);
    saveDemoState();
}

function handleJustTheTipIntegration(data) {
    console.log('🔗 Handling JustTheTip integration:', data);
    
    // Update revenue tracking
    demoState.justTheTipRevenue += data.amount || 0;
    
    // Notify integration bridge
    fetch(`${DEMO_CONFIG.tiltCheckAPI}/api/revenue/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 'demo-user',
            surveyCompleted: true,
            earningAmount: data.amount || 0,
            source: 'justthetip'
        })
    }).catch(err => console.log('API call failed (demo mode):', err));
}

function initializeDemoData() {
    // Load existing demo data or create new
    chrome.storage.local.get(['tiltCheckDemoState'], (result) => {
        if (result.tiltCheckDemoState) {
            demoState = { ...demoState, ...result.tiltCheckDemoState };
        } else {
            // Initialize with impressive demo numbers
            demoState = {
                sessionsMonitored: 156,
                interventionsTriggered: 47,
                moneySaved: 2340,
                earningsGenerated: 890,
                lastIntervention: 0,
                justTheTipRevenue: 127.50,
                activeUsers: new Set()
            };
        }
        
        saveDemoState();
    });
}

function saveDemoState() {
    // Convert Set to Array for storage
    const stateToSave = {
        ...demoState,
        activeUsers: Array.from(demoState.activeUsers)
    };
    
    chrome.storage.local.set({ tiltCheckDemoState: stateToSave });
}

function showDemoWelcomeNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'TiltCheck Demo Extension Loaded',
        message: 'Investor demo ready! JustTheTip integration active. Click extension icon to see dashboard.'
    });
}

// Content script functions (injected into pages)
function initializeAdvancedDemo() {
    console.log('🎯 Advanced demo initialization');
    
    // Enhanced AI detection simulation
    let tiltScore = 0;
    let sessionStartTime = Date.now();
    
    // Monitor for demo triggers
    document.addEventListener('keydown', (e) => {
        // Press Ctrl+Shift+T to trigger demo
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            chrome.runtime.sendMessage({
                type: 'DEMO_TRIGGER_INTERVENTION'
            });
        }
    });
    
    // Simulate AI monitoring
    setInterval(() => {
        // Simulate tilt detection based on page activity
        const scrollActivity = window.scrollY;
        const timeOnPage = Date.now() - sessionStartTime;
        
        if (timeOnPage > 60000 && Math.random() > 0.95) {
            chrome.runtime.sendMessage({
                type: 'TILT_DETECTED',
                data: {
                    confidence: 0.87 + Math.random() * 0.12,
                    riskLevel: 'MEDIUM',
                    sessionDuration: timeOnPage / 1000,
                    pageActivity: scrollActivity
                }
            });
        }
    }, 10000);
}

function showAdvancedIntervention(tiltData, config) {
    // Remove any existing overlays
    const existingOverlay = document.getElementById('tiltcheck-advanced-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'tiltcheck-advanced-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: white;
            animation: fadeIn 0.5s ease;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 50px;
                border-radius: 25px;
                text-align: center;
                max-width: 600px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
                border: 2px solid rgba(255, 255, 255, 0.2);
            ">
                <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 1s;">🛡️</div>
                <h1 style="margin-bottom: 15px; font-size: 32px; font-weight: bold;">TiltCheck AI Intervention</h1>
                <div style="background: rgba(255, 69, 58, 0.2); padding: 15px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #ff453a;">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">⚠️ High-Risk Gambling Behavior Detected</div>
                    <div style="font-size: 14px; opacity: 0.9;">AI Confidence: ${Math.round(tiltData.confidence * 100)}% | Risk Level: ${tiltData.riskLevel}</div>
                </div>
                
                <p style="margin-bottom: 30px; font-size: 18px; line-height: 1.6;">
                    Our AI has detected escalating gambling behavior. Instead of potentially losing money, 
                    redirect this energy into legitimate earning opportunities.
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
                    <div style="background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.2);">
                        <div style="font-size: 28px; font-weight: bold; color: #4ade80; margin-bottom: 8px;">$${tiltData.betAmount || 150}</div>
                        <div style="font-size: 14px; opacity: 0.9;">Potential Loss Prevented</div>
                    </div>
                    <div style="background: linear-gradient(45deg, #8b5cf6, #a855f7); padding: 20px; border-radius: 15px; border: 2px solid rgba(255, 255, 255, 0.3);">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 20px;">💎</span>
                            <span style="font-size: 24px; font-weight: bold; color: #fde047;">$127.50</span>
                        </div>
                        <div style="font-size: 13px; font-weight: bold;">JustTheTip Integration</div>
                        <div style="font-size: 11px; opacity: 0.9;">Available Earning Potential</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                    <button onclick="window.open('${config.qualifyFirstPlatform}/cpx-research', '_blank')" style="
                        background: linear-gradient(45deg, #4ade80, #22c55e);
                        color: white;
                        border: none;
                        padding: 18px 30px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 8px 20px rgba(74, 222, 128, 0.3);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🚀 Start Earning $15-45/hour
                    </button>
                    <button onclick="window.open('https://justthetip.app', '_blank')" style="
                        background: linear-gradient(45deg, #8b5cf6, #a855f7);
                        color: white;
                        border: none;
                        padding: 18px 30px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        💎 JustTheTip Platform
                    </button>
                </div>
                
                <button onclick="document.getElementById('tiltcheck-advanced-overlay').remove()" style="
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 12px 25px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.25)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'">
                    🧘 I'll Take a Moment to Reflect
                </button>
                
                <div style="margin-top: 25px; font-size: 12px; opacity: 0.7;">
                    <div>TiltCheck Demo v${config.version} | AI-Powered Intervention</div>
                    <div>JustTheTip Integration Active | Investor Presentation Mode</div>
                </div>
            </div>
        </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Auto-remove after 15 seconds if no interaction
    setTimeout(() => {
        const stillExists = document.getElementById('tiltcheck-advanced-overlay');
        if (stillExists) {
            stillExists.remove();
        }
    }, 15000);
}

console.log('🛡️ TiltCheck Demo Background Service Worker Ready - JustTheTip Integration Active');
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

// TiltCheck Background Service Worker
// Handles extension lifecycle, communication, and background monitoring

console.log('🛡️ TiltCheck Background Service Worker Started');

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TiltCheck extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      tiltcheckEnabled: true,
      interventionLevel: 'medium', // low, medium, high
      surveyRedirection: true,
      analyticsEnabled: true,
      soundAlerts: true
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'https://tiltcheck.it.com/?source=extension_install'
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'tiltDetected':
      handleTiltDetection(request.data, sender.tab);
      break;
      
    case 'userActivity':
      logUserActivity(request.data, sender.tab);
      break;
      
    case 'interventionTriggered':
      handleIntervention(request.data, sender.tab);
      break;
      
    case 'surveyRedirect':
      redirectToSurveys(request.data, sender.tab);
      break;
      
    default:
      console.warn('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
  return true; // Keep message channel open for async response
});

// Tilt detection handler
async function handleTiltDetection(tiltData, tab) {
  console.log('🚨 Tilt detected:', tiltData);
  
  // Get user settings
  const settings = await chrome.storage.sync.get([
    'tiltcheckEnabled',
    'interventionLevel', 
    'surveyRedirection'
  ]);
  
  if (!settings.tiltcheckEnabled) {
    return;
  }
  
  // Determine intervention based on tilt level
  const shouldIntervene = determineShouldIntervene(
    tiltData.tiltLevel, 
    settings.interventionLevel
  );
  
  if (shouldIntervene) {
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'TiltCheck - Tilt Detected',
      message: `${getTiltMessage(tiltData.tiltLevel)} Consider taking a break and earning money with surveys instead.`
    });
    
    // Log intervention for analytics
    logIntervention(tiltData, tab);
    
    // Redirect to surveys if enabled
    if (settings.surveyRedirection) {
      setTimeout(() => {
        redirectToSurveys(tiltData, tab);
      }, 2000); // 2 second delay to show warning first
    }
  }
}

// Determine if intervention should happen
function determineShouldIntervene(tiltLevel, userSetting) {
  const interventionMap = {
    low: ['high'],
    medium: ['medium', 'high'],
    high: ['low', 'medium', 'high']
  };
  
  return interventionMap[userSetting]?.includes(tiltLevel) || false;
}

// Get appropriate message for tilt level
function getTiltMessage(tiltLevel) {
  const messages = {
    low: 'Mild tilt detected.',
    medium: 'Moderate tilt detected.', 
    high: 'High tilt detected!'
  };
  return messages[tiltLevel] || 'Tilt detected.';
}

// Redirect user to survey platform
async function redirectToSurveys(tiltData, tab) {
  const surveyUrl = `http://localhost:3001/dashboard?from_tiltcheck=true&tilt_level=${tiltData.tiltLevel}&user_id=${tiltData.userId}&tab_id=${tab.id}`;
  
  // Open survey platform in new tab
  chrome.tabs.create({
    url: surveyUrl,
    active: true
  });
  
  // Send intervention success to integration bridge
  try {
    const response = await fetch('http://localhost:3002/api/intervention/redirect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: tiltData.userId,
        tiltLevel: tiltData.tiltLevel,
        gamblingSession: tiltData.session,
        timestamp: new Date().toISOString(),
        tabUrl: tab.url
      }),
    });
    
    if (response.ok) {
      console.log('✅ Intervention logged successfully');
    }
  } catch (error) {
    console.error('Failed to log intervention:', error);
  }
}

// Log user activity for analytics
async function logUserActivity(activityData, tab) {
  // Store activity locally
  const activities = await chrome.storage.local.get(['userActivities']) || { userActivities: [] };
  activities.userActivities.push({
    ...activityData,
    timestamp: new Date().toISOString(),
    tabUrl: tab.url,
    tabTitle: tab.title
  });
  
  // Keep only last 1000 activities
  if (activities.userActivities.length > 1000) {
    activities.userActivities = activities.userActivities.slice(-1000);
  }
  
  await chrome.storage.local.set(activities);
}

// Log intervention events
async function logIntervention(tiltData, tab) {
  const interventions = await chrome.storage.local.get(['interventions']) || { interventions: [] };
  
  interventions.interventions.push({
    tiltLevel: tiltData.tiltLevel,
    timestamp: new Date().toISOString(),
    tabUrl: tab.url,
    sessionData: tiltData.session,
    userId: tiltData.userId
  });
  
  await chrome.storage.local.set(interventions);
  
  console.log('📊 Intervention logged');
}

// Handle tab updates to check for gambling sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isGamblingSite = checkIfGamblingSite(tab.url);
    if (isGamblingSite) {
      console.log('🎰 Gambling site detected:', tab.url);
      
      // Inject enhanced monitoring if not already present
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-script-advanced.js']
      }).catch(error => {
        console.log('Content script already injected or blocked:', error);
      });
    }
  }
});

// Check if URL is a gambling site
function checkIfGamblingSite(url) {
  const gamblingDomains = [
    'stake.us', 'stake.com',
    'draftkings.com', 'fanduel.com', 
    'betmgm.com', 'caesars.com',
    'pointsbet.com', 'barstool.com'
  ];
  
  return gamblingDomains.some(domain => url.includes(domain));
}

// Periodic cleanup and sync
chrome.alarms.create('tiltcheckCleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'tiltcheckCleanup') {
    cleanupOldData();
  }
});

// Cleanup old stored data
async function cleanupOldData() {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  // Clean old activities
  const activities = await chrome.storage.local.get(['userActivities']);
  if (activities.userActivities) {
    activities.userActivities = activities.userActivities.filter(
      activity => new Date(activity.timestamp).getTime() > weekAgo
    );
    await chrome.storage.local.set(activities);
  }
  
  // Clean old interventions
  const interventions = await chrome.storage.local.get(['interventions']);
  if (interventions.interventions) {
    interventions.interventions = interventions.interventions.filter(
      intervention => new Date(intervention.timestamp).getTime() > weekAgo
    );
    await chrome.storage.local.set(interventions);
  }
  
  console.log('🧹 TiltCheck data cleanup completed');
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open TiltCheck dashboard
  chrome.tabs.create({
    url: 'https://tiltcheck.it.com/dashboard'
  });
});

console.log('🛡️ TiltCheck Background Service Worker Ready');
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

// TiltCheck Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  console.log('TiltCheck popup loaded');
  
  // Load user stats
  await loadStats();
  
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Load statistics
async function loadStats() {
  try {
    // Get stored data
    const activities = await chrome.storage.local.get(['userActivities']);
    const interventions = await chrome.storage.local.get(['interventions']);
    
    // Calculate stats
    const sessionsCount = activities.userActivities?.length || 0;
    const interventionsCount = interventions.interventions?.length || 0;
    
    // Estimate losses prevented (simplified calculation)
    const avgLossPrevented = 250; // Average loss per intervention
    const lossesPrevented = interventionsCount * avgLossPrevented;
    
    // Survey earnings (mock data for demo)
    const surveyEarnings = interventionsCount * 18; // Average $18 per survey
    
    // Update UI
    document.getElementById('sessionsMonitored').textContent = sessionsCount;
    document.getElementById('interventionsCount').textContent = interventionsCount;
    document.getElementById('lossesPrevented').textContent = `$${lossesPrevented.toLocaleString()}`;
    document.getElementById('surveyEarnings').textContent = `$${surveyEarnings.toLocaleString()}`;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load settings
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'tiltcheckEnabled',
      'surveyRedirection', 
      'soundAlerts'
    ]);
    
    // Update toggle states
    updateToggle('protectionToggle', settings.tiltcheckEnabled !== false);
    updateToggle('surveyToggle', settings.surveyRedirection !== false);
    updateToggle('soundToggle', settings.soundAlerts !== false);
    
    // Update status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    if (settings.tiltcheckEnabled !== false) {
      statusIndicator.style.background = '#48bb78'; // Green
    } else {
      statusIndicator.style.background = '#fc8181'; // Red
    }
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Update toggle appearance
function updateToggle(toggleId, isActive) {
  const toggle = document.getElementById(toggleId);
  if (isActive) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

// Set up event listeners
function setupEventListeners() {
  // Dashboard button
  document.getElementById('viewDashboard').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://tiltcheck.it.com/dashboard'
    });
    window.close();
  });
  
  // Survey earnings button
  document.getElementById('earnSurveys').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'http://localhost:3001/dashboard'
    });
    window.close();
  });
  
  // Settings toggles
  document.getElementById('protectionToggle').addEventListener('click', () => {
    toggleSetting('tiltcheckEnabled', 'protectionToggle');
  });
  
  document.getElementById('surveyToggle').addEventListener('click', () => {
    toggleSetting('surveyRedirection', 'surveyToggle');
  });
  
  document.getElementById('soundToggle').addEventListener('click', () => {
    toggleSetting('soundAlerts', 'soundToggle');
  });
}

// Toggle setting
async function toggleSetting(settingKey, toggleId) {
  try {
    const settings = await chrome.storage.sync.get([settingKey]);
    const currentValue = settings[settingKey] !== false;
    const newValue = !currentValue;
    
    // Save new setting
    await chrome.storage.sync.set({ [settingKey]: newValue });
    
    // Update toggle appearance
    updateToggle(toggleId, newValue);
    
    // Update status indicator if main protection setting
    if (settingKey === 'tiltcheckEnabled') {
      const statusIndicator = document.getElementById('statusIndicator');
      statusIndicator.style.background = newValue ? '#48bb78' : '#fc8181';
    }
    
    console.log(`Setting ${settingKey} updated to:`, newValue);
    
  } catch (error) {
    console.error('Error toggling setting:', error);
  }
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.close();
  }
  
  if (event.key === 'Enter') {
    document.getElementById('viewDashboard').click();
  }
});
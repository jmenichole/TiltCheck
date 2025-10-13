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

#!/usr/bin/env node

/**
 * Enhanced TrapHouse Dashboard Launcher
 * Starts the integrated CollectClock verification, multiplayer card battles,
 * and payment-verified loan front system
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎮 Starting Enhanced TrapHouse Dashboard System...');
console.log('🔐 CollectClock Integration: Loading...');
console.log('⚔️ Multiplayer Card Battle Engine: Initializing...');
console.log('💎 Loan Front Verification System: Starting...');
console.log('🏢 Group Hangar Battle Arenas: Preparing...');

// Path to the dashboard overlay
const dashboardPath = path.join(__dirname, 'dashboard', 'TrapHouseDashboardOverlay.js');

// Start the Electron application
const electron = spawn('npx', ['electron', dashboardPath], {
    stdio: 'inherit',
    cwd: __dirname
});

electron.on('close', (code) => {
    console.log(`\n🎮 Enhanced TrapHouse Dashboard closed with code ${code}`);
});

electron.on('error', (error) => {
    console.error('❌ Failed to start Enhanced TrapHouse Dashboard:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure Electron is installed: npm install electron');
    console.log('   2. Check that all dependencies are installed: npm install');
    console.log('   3. Verify Node.js version is 16 or higher');
});

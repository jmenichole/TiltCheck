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
 * 🏠 TrapHouse Bot Complete System Launcher
 * 
 * Launches all components of the TrapHouse ecosystem:
 * - Main Discord bot with all integrations
 * - Webhook server for crypto payments
 * - System health monitoring
 */

require('dotenv').config();
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏠 TrapHouse Bot Complete System Launcher');
console.log('=' .repeat(60));

// Check if all required files exist
const requiredFiles = [
    'main_complete_working.js',
    'start_webhook_server.js',
    '.env'
];

console.log('🔍 Pre-flight checks...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} - Found`);
    } else {
        console.log(`   ❌ ${file} - Missing`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Missing required files. Please check your installation.');
    process.exit(1);
}

// Check environment variables
const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'JUSTTHETIP_WEBHOOK_SECRET',
    'JWT_SECRET'
];

console.log('\n🔧 Environment checks...');
let allEnvVarsSet = true;

requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} - Set`);
    } else {
        console.log(`   ❌ ${envVar} - Missing`);
        allEnvVarsSet = false;
    }
});

if (!allEnvVarsSet) {
    console.log('\n❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

console.log('\n🎯 All checks passed! Starting TrapHouse Bot ecosystem...\n');

// Start the webhook server
console.log('🔗 Starting webhook server...');
const webhookServer = spawn('node', ['start_webhook_server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
});

// Handle webhook server output
webhookServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
        console.log(`[WEBHOOK] ${output}`);
    }
});

webhookServer.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
        console.log(`[WEBHOOK ERROR] ${error}`);
    }
});

// Wait a moment for webhook server to start
setTimeout(() => {
    console.log('\n🤖 Starting main TrapHouse Discord bot...');
    
    // Start the main bot
    const mainBot = spawn('node', ['main_complete_working.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
    });
    
    // Handle main bot output
    mainBot.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`[BOT] ${output}`);
        }
    });
    
    mainBot.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error) {
            console.log(`[BOT ERROR] ${error}`);
        }
    });
    
    // Handle bot process events
    mainBot.on('close', (code) => {
        console.log(`\n❌ TrapHouse Bot process exited with code ${code}`);
        process.exit(code);
    });
    
    mainBot.on('error', (error) => {
        console.log(`\n❌ Error starting TrapHouse Bot: ${error.message}`);
        process.exit(1);
    });
    
}, 3000);

// Handle webhook server process events
webhookServer.on('close', (code) => {
    console.log(`\n❌ Webhook server process exited with code ${code}`);
    process.exit(code);
});

webhookServer.on('error', (error) => {
    console.log(`\n❌ Error starting webhook server: ${error.message}`);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Graceful shutdown initiated...');
    
    if (webhookServer && !webhookServer.killed) {
        console.log('🔗 Stopping webhook server...');
        webhookServer.kill('SIGTERM');
    }
    
    console.log('🏠 TrapHouse Bot system stopped.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 System termination requested...');
    
    if (webhookServer && !webhookServer.killed) {
        webhookServer.kill('SIGTERM');
    }
    
    process.exit(0);
});

// Display system information after startup
setTimeout(() => {
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TRAPHOUSE BOT ECOSYSTEM STARTED!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('🤖 TrapHouse Discord Bot: RUNNING');
    console.log('🔗 Webhook Server: RUNNING (Port 3002)');
    console.log('💰 Crypto Payments: ENABLED');
    console.log('🔐 Security: ACTIVE');
    console.log('');
    console.log('📊 Available Features:');
    console.log('   • Multi-chain crypto payments (ETH/BTC/MATIC/BNB)');
    console.log('   • Respect system with multipliers');
    console.log('   • OAuth authentication');
    console.log('   • GitHub integration');
    console.log('   • Loan management system');
    console.log('   • Role management');
    console.log('   • Unicode-safe storage');
    console.log('');
    console.log('🔗 Webhook Endpoints:');
    console.log('   • http://localhost:3002/webhook/justthetip');
    console.log('   • http://localhost:3002/webhook/github');
    console.log('   • http://localhost:3002/webhook/health');
    console.log('');
    console.log('⚡ To stop: Press Ctrl+C');
    console.log('📝 Logs: Monitor this terminal for real-time activity');
    console.log('=' .repeat(60));
}, 8000);

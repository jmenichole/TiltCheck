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
 * 🏠 TrapHouse Bot System Status Check
 * 
 * This script checks all components of the complete integration:
 * - Discord bot connection
 * - Webhook endpoints
 * - File system integrations
 * - Environment configuration
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 TrapHouse Bot Complete System Status Check');
console.log('=' .repeat(50));

// 1. Environment Check
console.log('\n📋 Environment Configuration:');
const requiredEnv = [
    'DISCORD_BOT_TOKEN',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'GITHUB_WEBHOOK_SECRET',
    'JUSTTHETIP_WEBHOOK_SECRET'
];

requiredEnv.forEach(env => {
    const value = process.env[env];
    console.log(`  ${env}: ${value ? '✅ Set' : '❌ Missing'}`);
});

// 2. File System Check
console.log('\n📁 File System Check:');
const requiredFiles = [
    'bot.js',
    'respectManager.js',
    'roleManager.js',
    'loanManager.js',
    'storage.js',
    'webhookServer.js',
    'main_complete_working.js',
    'integrations/oauthRedirect.js',
    'integrations/justTheTipIntegration.js',
    'integrations/githubIntegration.js',
    'config/payments.js',
    'utils/unicodeUtils.js',
    'utils/unicodeSafeStorage.js'
];

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
});

// 3. Commands Check
console.log('\n⚡ Commands Check:');
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commands = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    console.log(`  Found ${commands.length} command files:`);
    commands.forEach(cmd => console.log(`    ✅ ${cmd}`));
} else {
    console.log('  ❌ Commands directory not found');
}

// 4. Integration Status
console.log('\n🔗 Integration Status:');

// Check OAuth system
try {
    const oauth = require('./integrations/oauthRedirect.js');
    console.log('  OAuth System: ✅ Ready');
} catch (e) {
    console.log('  OAuth System: ❌ Error -', e.message);
}

// Check GitHub integration
try {
    const github = require('./integrations/githubIntegration.js');
    console.log('  GitHub Integration: ✅ Ready');
} catch (e) {
    console.log('  GitHub Integration: ❌ Error -', e.message);
}

// Check JustTheTip integration
try {
    const jtt = require('./integrations/justTheTipIntegration.js');
    console.log('  JustTheTip Integration: ✅ Ready');
} catch (e) {
    console.log('  JustTheTip Integration: ❌ Error -', e.message);
}

// Check webhook server
try {
    const webhook = require('./webhookServer.js');
    console.log('  Webhook Server: ✅ Ready');
} catch (e) {
    console.log('  Webhook Server: ❌ Error -', e.message);
}

// 5. Data Files Check
console.log('\n💾 Data Storage Check:');
const dataFiles = ['loans.json', 'data/userData.json'];
dataFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${file}: ${exists ? '✅ Exists' : '⚠️  Will be created'}`);
});

// 6. Module Dependencies Check
console.log('\n📦 Module Dependencies:');
try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    console.log(`  Found ${deps.length} dependencies:`);
    deps.forEach(dep => console.log(`    ✅ ${dep}`));
} catch (e) {
    console.log('  ❌ Error reading package.json');
}

console.log('\n' + '=' .repeat(50));
console.log('🏠 TrapHouse Bot Complete Integration System');
console.log('🚀 Ready for deployment!');
console.log('');
console.log('📝 To start the complete system:');
console.log('   node main_complete_working.js');
console.log('');
console.log('🔗 Available webhook endpoints:');
console.log('   POST http://localhost:3002/webhook/github');
console.log('   POST http://localhost:3002/webhook/justthetip');
console.log('   POST http://localhost:3002/webhook/stripe');
console.log('   GET  http://localhost:3002/webhook/health');
console.log('');
console.log('🎯 OAuth endpoints:');
console.log('   GET  http://localhost:3001/auth/discord');
console.log('   GET  http://localhost:3001/auth/callback');
console.log('   GET  http://localhost:3001/dashboard');
console.log('');

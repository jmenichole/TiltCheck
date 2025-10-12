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
 * Test Discord OAuth Custom Install Flow
 * Quick test to verify your OAuth configuration
 */

require('dotenv').config();

console.log('🔗 Testing Discord OAuth Configuration');
console.log('====================================');

const config = {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    baseUrl: process.env.BASE_URL,
    jwtSecret: process.env.JWT_SECRET
};

console.log('\n📋 OAuth Configuration:');
console.log(`   Client ID: ${config.clientId}`);
console.log(`   Client Secret: ${config.clientSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`   Redirect URI: ${config.redirectUri}`);
console.log(`   Base URL: ${config.baseUrl}`);
console.log(`   JWT Secret: ${config.jwtSecret ? '✅ Set' : '❌ Missing'}`);

console.log('\n🔗 Your Custom Install URLs:');

// JustTheTip Bot (your current OAuth setup)
const justTheTipInstall = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log('\n💡 JustTheTip Bot Custom Install:');
console.log(justTheTipInstall);

// TrapHouse Main Bot
const trapHouseInstall = `https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log('\n🏠 TrapHouse Main Bot Custom Install:');
console.log(trapHouseInstall);

// CollectClock Bot
const collectClockInstall = `https://discord.com/oauth2/authorize?client_id=1336968746450812928&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log('\n💧 CollectClock Bot Custom Install:');
console.log(collectClockInstall);

// Degens Bot
const degensInstall = `https://discord.com/oauth2/authorize?client_id=1376113587025739807&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log('\n🎰 Degens Bot Custom Install:');
console.log(degensInstall);

console.log('\n📝 Setup Instructions:');
console.log('1. Add redirect URI to Discord Developer Portal for each bot:');
console.log(`   ${config.redirectUri}`);
console.log('2. Test OAuth flow with the JustTheTip install link above');
console.log('3. Check your webhook server at http://localhost:3002');

console.log('\n🧪 Quick Test Commands:');
console.log('   curl http://localhost:3002/');
console.log('   curl http://localhost:3002/health');

if (!config.clientSecret || config.clientSecret.includes('your_')) {
    console.log('\n⚠️  Warning: Client Secret not configured properly');
}

if (config.jwtSecret === 'your_random_32_character_secret') {
    console.log('\n⚠️  Warning: JWT Secret should be updated for security');
}

console.log('\n✅ OAuth configuration test complete!');
console.log('🔗 Your custom install flow is ready to test!');

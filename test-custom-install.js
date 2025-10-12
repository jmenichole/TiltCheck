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
 * Discord OAuth Custom Install Flow - Test & Demo
 */

require('dotenv').config();

console.log('🔗 Discord OAuth Custom Install Flow - Ready to Test!');
console.log('=====================================================');

const config = {
    clientId: process.env.DISCORD_CLIENT_ID,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    baseUrl: process.env.BASE_URL
};

console.log('\n✅ OAuth Endpoints Active:');
console.log(`   Initiate OAuth: ${config.baseUrl}/auth/discord`);
console.log(`   Callback URL: ${config.redirectUri}`);

console.log('\n🔗 Your Custom Install Links:');

// JustTheTip Bot (your configured OAuth)
const justTheTipCustom = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log('\n💡 JustTheTip Bot (OAuth Configured):');
console.log(justTheTipCustom);

console.log('\n📝 Test Instructions:');
console.log('1. Add redirect URI to Discord Developer Portal:');
console.log(`   https://discord.com/developers/applications/${config.clientId}/oauth2/general`);
console.log(`   Add: ${config.redirectUri}`);
console.log('');
console.log('2. Test the OAuth initiation:');
console.log(`   curl -I ${config.baseUrl}/auth/discord`);
console.log('');
console.log('3. Test the custom install link:');
console.log('   Click the JustTheTip install link above');
console.log('');
console.log('4. Expected flow:');
console.log('   → Discord authorization page');
console.log('   → User authorizes bot');
console.log('   → Redirect to YOUR custom success page');
console.log('   → Professional branded experience! 🎉');

console.log('\n🌐 Alternative Bot Install Links:');
console.log('   (Add the redirect URI to each Discord app to enable)');

// Other bots with same callback
const trapHouseCustom = `https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log(`\n🏠 TrapHouse Main Bot: ${trapHouseCustom}`);

const collectClockCustom = `https://discord.com/oauth2/authorize?client_id=1336968746450812928&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log(`💧 CollectClock Bot: ${collectClockCustom}`);

const degensCustom = `https://discord.com/oauth2/authorize?client_id=1376113587025739807&permissions=414539926592&scope=bot&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code`;
console.log(`🎰 Degens Bot: ${degensCustom}`);

console.log('\n🎨 Custom Landing Page Features:');
console.log('   ✅ Personalized welcome message');
console.log('   ✅ TrapHouse branding and styling');
console.log('   ✅ Quick start instructions');
console.log('   ✅ Feature overview and commands');
console.log('   ✅ Direct links to Discord');
console.log('   ✅ User information display');
console.log('   ✅ Auto-redirect option');

console.log('\n🚀 Ready to launch your professional Discord bot experience!');
console.log('\n💡 Quick Start: Add the redirect URI and test the JustTheTip install link!');

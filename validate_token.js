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

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('🔍 Discord Bot Token Validator\n');

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.log('❌ No token found in .env file');
    console.log('Make sure your .env file contains: DISCORD_BOT_TOKEN=your_token_here');
    process.exit(1);
}

console.log('✅ Token loaded from .env');
console.log('📏 Token length:', token.length);
console.log('🔤 Token format check:', token.split('.').length === 3 ? 'Valid format' : 'Invalid format');

// Test the token with minimal client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('✅ TOKEN VALID! Bot logged in as:', client.user.tag);
    console.log('🎯 Bot is ready to use!');
    process.exit(0);
});

client.on('error', (error) => {
    console.log('❌ CONNECTION ERROR:', error.message);
    process.exit(1);
});

console.log('🔄 Attempting to connect...');

client.login(token).catch(error => {
    console.log('❌ LOGIN FAILED:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Select your application');
    console.log('3. Go to "Bot" section');
    console.log('4. Click "Reset Token"');
    console.log('5. Copy the new token and update your .env file');
    console.log('6. Make sure you have enabled required intents (Message Content Intent)');
    process.exit(1);
});

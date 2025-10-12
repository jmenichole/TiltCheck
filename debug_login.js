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
console.log('🔍 Environment loaded');
console.log('Token present:', !!process.env.DISCORD_BOT_TOKEN);
console.log('Token length:', process.env.DISCORD_BOT_TOKEN?.length);

const { Client, GatewayIntentBits } = require('discord.js');
console.log('📦 Discord.js loaded');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});
console.log('🤖 Client created');

client.once('ready', () => {
    console.log('✅ Bot is ready!');
    console.log('Bot user:', client.user.tag);
});

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

console.log('🔄 Attempting login...');
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        console.log('✅ Login successful');
    })
    .catch(error => {
        console.error('❌ Login failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
    });

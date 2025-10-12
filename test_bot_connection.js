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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log('✅ Bot is ready and connected!');
    console.log(`📝 Logged in as: ${client.user.tag}`);
    console.log(`🏠 Connected to ${client.guilds.cache.size} servers`);
    
    // List servers
    client.guilds.cache.forEach(guild => {
        console.log(`🏰 Server: ${guild.name} (ID: ${guild.id})`);
        console.log(`👥 Members: ${guild.memberCount}`);
    });
    
    process.exit(0);
});

client.on('error', error => {
    console.error('❌ Discord client error:', error);
    process.exit(1);
});

console.log('🔄 Attempting to connect to Discord...');
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('❌ Failed to login:', error.message);
    process.exit(1);
});

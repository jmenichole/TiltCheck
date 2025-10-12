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

// TiltCheck Discord Bot - Main Entry Point
// This is a simple entry point that loads the main bot from discord-bot/bot.js

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Initialize Discord client with proper intents for v14
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Bot ready event
client.once('ready', () => {
    console.log(`✅ TiltCheck Bot logged in as ${client.user.tag}!`);
    console.log(`📊 Monitoring ${client.guilds.cache.size} server(s)`);
});

// Simple message handler for basic commands
client.on('messageCreate', (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Basic commands
    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    } else if (message.content === '!hello') {
        message.reply('👋 Hello there!');
    } else if (message.content === '!help') {
        message.reply('📋 Available commands: !ping, !hello, !help\n\nFor the full TiltCheck bot, use the discord-bot/bot.js implementation.');
    }
});

// Error handling
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

// Login to Discord
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
    console.error('❌ Error: DISCORD_BOT_TOKEN not found in environment variables');
    console.log('💡 Please set your Discord bot token in .env file');
    process.exit(1);
}

client.login(token).catch(error => {
    console.error('❌ Failed to login to Discord:', error.message);
    process.exit(1);
});

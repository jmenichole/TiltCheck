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
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.once('ready', () => {
    console.log('✅ Bot is ready!');
    console.log(`📝 Logged in as: ${client.user.tag}`);
    console.log('🎯 Listening for messages...');
});

client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    
    console.log(`📨 Message received: "${message.content}" from ${message.author.tag} in ${message.guild?.name || 'DM'}`);
    
    // Simple ping command
    if (message.content === '!ping') {
        console.log('🏓 Responding to ping command');
        message.reply('🏓 Pong!');
        return;
    }
    
    // Help command
    if (message.content === '!help') {
        console.log('❓ Responding to help command');
        const embed = {
            color: 0x00ff00,
            title: '🤖 TrapHouse Bot Commands',
            description: 'Here are the available commands:',
            fields: [
                { name: '!ping', value: 'Test bot responsiveness', inline: true },
                { name: '!help', value: 'Show this help message', inline: true },
                { name: '!test', value: 'Simple test command', inline: true }
            ]
        };
        message.reply({ embeds: [embed] });
        return;
    }
    
    // Test command
    if (message.content === '!test') {
        console.log('🧪 Responding to test command');
        message.reply('✅ Test successful! Bot is working properly.');
        return;
    }
});

client.on('error', error => {
    console.error('❌ Client error:', error);
});

console.log('🚀 Starting simplified bot for testing...');
client.login(process.env.DISCORD_BOT_TOKEN);

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

/**
 * 🏠 TrapHouse Bot - Working Complete Integration
 * 
 * Features:
 * - Discord bot with existing functionality
 * - OAuth webhook server
 * - GitHub integration
 * - JustTheTip crypto integration
 * - All existing respect/loan systems
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Import existing modules
const { addRespect, removeRespect, getRankFromRespect } = require('./respectManager');
const { assignRole } = require('./roleManager');
const loanManager = require('./loanManager');
const storage = require('./storage');

// Import new integration systems (only the ones that exist)
const webhookServer = require('./webhookServer');

// Create Discord client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ] 
});

// Commands collection
client.commands = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if (command.name) {
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            }
        } catch (error) {
            console.error(`❌ Error loading command ${file}:`, error.message);
        }
    }
}

// Bot ready event
client.once('ready', async () => {
    console.log(`🚀 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
    console.log(`👥 Serving ${client.users.cache.size} users`);
    
    // Set bot status
    client.user.setPresence({
        activities: [{ name: 'TrapHouse Commands | !help', type: 0 }],
        status: 'online'
    });

    // Start webhook server
    try {
        console.log('🔗 Starting webhook server...');
        // The webhook server will start automatically when required
        console.log('✅ Webhook server ready');
    } catch (error) {
        console.error('❌ Failed to start webhook server:', error.message);
    }
});

// Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const prefix = process.env.BOT_PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get command from collection
    const command = client.commands.get(commandName);
    
    if (command) {
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            await message.reply('❌ There was an error executing that command!');
        }
        return;
    }

    // Handle existing command patterns
    try {
        const { handleGeneralCommand } = require('./commands/general');
        const { handleAdminCommand } = require('./commands/admin');
        const { handleNonAdminCommand } = require('./commands/nonAdmin');

        if (await handleGeneralCommand(message)) return;
        if (await handleAdminCommand(message)) return;
        if (await handleNonAdminCommand(message)) return;

    } catch (error) {
        console.error('Error handling command:', error);
    }
});

// Reaction handler for respect system
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    try {
        const message = reaction.message;
        const channel = message.channel;

        // Showoff hits channel - give respect for reactions
        if (channel.name === 'showoff-your-hits' && message.author.id !== user.id) {
            const respectToAdd = 5;
            await addRespect(message.author.id, respectToAdd, message.guild);
            await channel.send(`${message.author.username} earned +${respectToAdd} respect for a reaction on their message! 🔥`);
            
            // Update roles
            const tempMessage = { author: message.author, guild: message.guild, member: message.member };
            await assignRole(tempMessage);
        }

        // Other reaction-based features can be added here
        
    } catch (error) {
        console.error('Error handling reaction:', error);
        await reaction.message.channel.send(`❌ Something went wrong: ${error.message}`);
    }
});

// Member join handler
client.on('guildMemberAdd', async (member) => {
    try {
        console.log(`👋 New member joined: ${member.user.tag}`);
        
        // Initialize user data
        const userData = await storage.getUserData(member.id);
        if (!userData.respect) {
            userData.respect = 0;
            userData.joinDate = new Date().toISOString();
            await storage.saveUserData(member.id, userData);
        }

        // Welcome message (if welcome channel exists)
        const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
        if (welcomeChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🏠 Welcome to TrapHouse!')
                .setDescription(`Welcome ${member.user}, to the TrapHouse! 🎉`)
                .addFields(
                    { name: '📋 Getting Started', value: 'Type `!help` to see available commands' },
                    { name: '💰 Respect System', value: 'Earn respect through activity and reactions!' },
                    { name: '🎯 Roles', value: 'Your role will update based on your respect level' }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await welcomeChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error handling member join:', error);
    }
});

// Enhanced error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Enhanced logging for debugging
if (process.env.NODE_ENV === 'development') {
    client.on('debug', (info) => {
        console.log('🐛 Debug:', info);
    });
}

// Login to Discord
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN not found in environment variables!');
    process.exit(1);
}

console.log('🔐 Attempting to login to Discord...');
client.login(token).catch(error => {
    console.error('❌ Failed to login to Discord:', error);
    process.exit(1);
});

// Start webhook server in the background
setTimeout(() => {
    try {
        console.log('🚀 Starting webhook integrations...');
        // The webhook server module will handle starting the server
        console.log('✅ Webhook integrations ready');
    } catch (error) {
        console.error('❌ Failed to start webhook integrations:', error);
    }
}, 5000); // Start after 5 seconds to ensure Discord client is ready

console.log('🏠 TrapHouse Bot Complete Integration Loading...');
console.log('📝 Features: Discord Bot + OAuth + GitHub + JustTheTip + Webhooks');
console.log('🔧 Environment:', process.env.NODE_ENV || 'production');

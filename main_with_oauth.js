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
 * 🏠 TrapHouse Bot with OAuth Integration
 * 
 * Main bot file with OAuth redirect support
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Import our modules
const UnicodeUtils = require('./utils/unicodeUtils');
const UnicodeSafeStorage = require('./utils/unicodeSafeStorage');
const PaymentManager = require('./paymentManager');
const RespectManager = require('./respectManager');
const RoleManager = require('./roleManager');
const OAuthIntegration = require('./oauthIntegration');

// Initialize Unicode-safe storage
const unicodeSafeStorage = new UnicodeSafeStorage('./data');

// Create bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Initialize managers
const paymentManager = new PaymentManager(unicodeSafeStorage);
const respectManager = new RespectManager(unicodeSafeStorage);
const roleManager = new RoleManager(client, unicodeSafeStorage);

// Initialize OAuth integration
const oauthIntegration = new OAuthIntegration(client, unicodeSafeStorage);

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
                UnicodeUtils.log('info', `Loaded command: ${command.name}`);
            }
        } catch (error) {
            UnicodeUtils.log('error', `Error loading command ${file}:`, error);
        }
    }
}

// Bot ready event
client.once('ready', async () => {
    UnicodeUtils.log('info', `🤖 ${client.user.tag} is online!`);
    UnicodeUtils.log('info', `🌐 Serving ${client.guilds.cache.size} servers`);
    
    // Migrate and validate data
    await unicodeSafeStorage.migrateData();
    await unicodeSafeStorage.validateDataIntegrity();
    
    // Initialize OAuth system
    const oauthSuccess = await oauthIntegration.initialize();
    if (oauthSuccess) {
        UnicodeUtils.log('info', '✅ OAuth system initialized successfully');
        
        // Log OAuth status
        const oauthStatus = oauthIntegration.getStatus();
        UnicodeUtils.log('info', `🔗 OAuth available at: ${oauthStatus.baseUrl}/auth/discord`);
    } else {
        UnicodeUtils.log('warn', '⚠️ OAuth system failed to initialize');
    }
    
    // Set bot activity
    client.user.setActivity('Managing the TrapHouse 🏠', { type: 'WATCHING' });
});

// Message handling
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    try {
        // Clean and validate message content
        const cleanContent = UnicodeUtils.sanitizeInput(message.content);
        
        // Check for commands (prefix: !)
        if (cleanContent.startsWith('!')) {
            const args = cleanContent.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            // Get command
            const command = client.commands.get(commandName);
            
            if (command) {
                // Execute command with managers
                await command.execute(message, args, {
                    paymentManager,
                    respectManager,
                    roleManager,
                    unicodeSafeStorage,
                    oauthIntegration
                });
            } else {
                // Handle basic commands
                await handleBasicCommands(message, commandName, args);
            }
        }
        
        // Update user activity
        await updateUserActivity(message.author.id);
        
    } catch (error) {
        UnicodeUtils.log('error', 'Message handling error:', error);
        
        try {
            await message.reply('❌ An error occurred while processing your message. Please try again.');
        } catch (replyError) {
            UnicodeUtils.log('error', 'Reply error:', replyError);
        }
    }
});

// Handle basic commands
async function handleBasicCommands(message, commandName, args) {
    switch (commandName) {
        case 'ping':
            await message.reply('🏓 Pong!');
            break;
            
        case 'help':
            await showHelpMenu(message);
            break;
            
        case 'status':
            await showBotStatus(message);
            break;
            
        case 'oauth':
        case 'login':
        case 'auth':
            // OAuth commands are handled by the integration
            break;
            
        default:
            // Unknown command - suggest help
            await message.reply('❓ Unknown command. Use `!help` to see available commands.');
            break;
    }
}

// Show help menu
async function showHelpMenu(message) {
    const embed = {
        color: 0x7289DA,
        title: '🏠 TrapHouse Bot Commands',
        description: 'Available commands for the TrapHouse lending system:',
        fields: [
            {
                name: '💰 Lending Commands',
                value: '`!loan <amount>` - Request a loan\n`!repay <amount>` - Repay a loan\n`!balance` - Check your balance',
                inline: true
            },
            {
                name: '👑 Respect System',
                value: '`!respect` - Check respect points\n`!rank` - View your rank\n`!leaderboard` - Top users',
                inline: true
            },
            {
                name: '🔐 Authentication',
                value: '`!login` - Web authentication\n`!dashboard` - Access dashboard\n`!payment <id>` - Verify payment',
                inline: true
            },
            {
                name: '🔧 Utility',
                value: '`!help` - This menu\n`!ping` - Bot latency\n`!status` - Bot information',
                inline: true
            }
        ],
        footer: {
            text: 'TrapHouse Bot - Secure Lending System'
        },
        timestamp: new Date().toISOString()
    };
    
    await message.reply({ embeds: [embed] });
}

// Show bot status
async function showBotStatus(message) {
    const oauthStatus = oauthIntegration.getStatus();
    
    const embed = {
        color: 0x00FF00,
        title: '📊 TrapHouse Bot Status',
        fields: [
            {
                name: '🤖 Bot Info',
                value: `Servers: ${client.guilds.cache.size}\nUptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
                inline: true
            },
            {
                name: '🔐 OAuth Status',
                value: `Initialized: ${oauthStatus.initialized ? '✅' : '❌'}\nURL: ${oauthStatus.baseUrl}`,
                inline: true
            },
            {
                name: '💾 Memory Usage',
                value: `${Math.floor(process.memoryUsage().used / 1024 / 1024)} MB`,
                inline: true
            }
        ],
        footer: {
            text: 'All systems operational'
        },
        timestamp: new Date().toISOString()
    };
    
    await message.reply({ embeds: [embed] });
}

// Update user activity
async function updateUserActivity(userId) {
    try {
        const userData = await unicodeSafeStorage.getUserData(userId);
        userData.lastActive = new Date().toISOString();
        await unicodeSafeStorage.saveUserData(userId, userData);
    } catch (error) {
        UnicodeUtils.log('error', 'Error updating user activity:', error);
    }
}

// Error handling
client.on('error', (error) => {
    UnicodeUtils.log('error', 'Discord client error:', error);
});

client.on('warn', (warning) => {
    UnicodeUtils.log('warn', 'Discord client warning:', warning);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    UnicodeUtils.log('info', '🛑 Shutting down TrapHouse Bot...');
    
    // Shutdown OAuth system
    oauthIntegration.shutdown();
    
    // Close Discord connection
    client.destroy();
    
    UnicodeUtils.log('info', '✅ TrapHouse Bot shutdown complete');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    UnicodeUtils.log('error', 'Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    UnicodeUtils.log('error', 'Unhandled rejection at:', promise, 'reason:', reason);
});

// Login to Discord
if (!process.env.DISCORD_BOT_TOKEN) {
    UnicodeUtils.log('error', '❌ DISCORD_BOT_TOKEN is required in environment variables');
    process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        UnicodeUtils.log('info', '🔐 Successfully logged in to Discord');
    })
    .catch((error) => {
        UnicodeUtils.log('error', '❌ Failed to login to Discord:', error);
        process.exit(1);
    });

module.exports = { client, unicodeSafeStorage, paymentManager, respectManager, roleManager, oauthIntegration };

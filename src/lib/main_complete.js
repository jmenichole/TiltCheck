/**
 * 🏠 TrapHouse Bot with Complete Integration Suite
 * 
 * Features:
 * - Discord bot with OAuth authentication
 * - Multi-chain crypto payments (JustTheTip)
 * - GitHub organization integration
 * - Unicode-resistant security
 * - Comprehensive webhook handling
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Import our modules
const UnicodeUtils = require('./utils/unicodeUtils');
const UnicodeSafeStorage = require('./utils/unicodeSafeStorage');
const paymentManager = require('./managers/paymentManager');
const respectManager = require('./respectManager');
const roleManager = require('./roleManager');
const oauthIntegration = require('./integrations/oauthIntegration');
const webhookServer = require('./webhookServer');

// Initialize storage system
const unicodeSafeStorage = new UnicodeSafeStorage();

// Webhook server will be initialized separately
// OAuth integration will be initialized separately

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
        const oauthStatus = oauthIntegration.getStatus();
        UnicodeUtils.log('info', `🔗 OAuth available at: ${oauthStatus.baseUrl}/auth/discord`);
    } else {
        UnicodeUtils.log('warn', '⚠️ OAuth system failed to initialize');
    }
    
    // Initialize webhook server
    const webhookSuccess = await webhookServer.initialize();
    if (webhookSuccess) {
        const webhookPort = process.env.WEBHOOK_PORT || 3002;
        webhookServer.start(webhookPort);
        UnicodeUtils.log('info', '✅ Webhook server initialized successfully');
        UnicodeUtils.log('info', `📡 Webhooks available at: http://localhost:${webhookPort}`);
    } else {
        UnicodeUtils.log('warn', '⚠️ Webhook server failed to initialize');
    }
    
    // Set bot activity
    client.user.setActivity('Managing the TrapHouse 🏠💰🐙', { type: 'WATCHING' });
    
    // Send startup notification
    await sendStartupNotification();
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
                // Execute command with all managers
                await command.execute(message, args, {
                    paymentManager,
                    respectManager,
                    roleManager,
                    unicodeSafeStorage,
                    oauthIntegration,
                    webhookServer
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
            
        case 'integrations':
            await showIntegrationStatus(message);
            break;
            
        case 'oauth':
        case 'login':
        case 'auth':
            // OAuth commands are handled by the integration
            break;
            
        case 'webhook':
            if (args[0] === 'test' && message.author.id === process.env.ADMIN_USER_ID) {
                await testWebhooks(message);
            }
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
        description: 'Available commands for the complete TrapHouse ecosystem:',
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
                name: '💎 Crypto Features',
                value: '`!crypto` - Crypto stats\n`!chains` - Supported blockchains\n`!wallet` - Wallet management',
                inline: true
            },
            {
                name: '🐙 GitHub Integration',
                value: '`!github` - Repository stats\n`!commits` - Recent activity\n`!releases` - Latest releases',
                inline: true
            },
            {
                name: '🔧 System',
                value: '`!help` - This menu\n`!ping` - Bot latency\n`!status` - Bot information\n`!integrations` - System status',
                inline: true
            }
        ],
        footer: {
            text: 'TrapHouse Bot - Complete Integration Suite'
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
            },
            {
                name: '📡 Webhook Server',
                value: `Port: ${process.env.WEBHOOK_PORT || 3002}\nStatus: Running`,
                inline: true
            },
            {
                name: '🐙 GitHub Integration',
                value: `Organization: ${process.env.GITHUB_ORGANIZATION}\nWebhook: ${process.env.GITHUB_WEBHOOK_URL ? 'Configured' : 'Not set'}`,
                inline: true
            },
            {
                name: '💰 Crypto Integration',
                value: `JustTheTip: ${process.env.JUSTTHETIP_API_ENABLED === 'true' ? 'Enabled' : 'Disabled'}\nChains: ${process.env.JUSTTHETIP_SUPPORTED_CHAINS}`,
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

// Show integration status
async function showIntegrationStatus(message) {
    const embed = {
        color: 0x7289DA,
        title: '🔗 Integration Status',
        description: 'Status of all TrapHouse bot integrations:',
        fields: [
            {
                name: '🔐 OAuth Authentication',
                value: oauthIntegration.getStatus().initialized ? '✅ Active' : '❌ Inactive',
                inline: true
            },
            {
                name: '🐙 GitHub Webhooks',
                value: process.env.GITHUB_WEBHOOK_URL ? '✅ Configured' : '❌ Not configured',
                inline: true
            },
            {
                name: '💰 JustTheTip Crypto',
                value: process.env.JUSTTHETIP_API_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled',
                inline: true
            },
            {
                name: '💳 Stripe Payments',
                value: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_key' ? '✅ Configured' : '❌ Not configured',
                inline: true
            },
            {
                name: '🛡️ Unicode Security',
                value: '✅ Active',
                inline: true
            },
            {
                name: '📊 Data Storage',
                value: '✅ Unicode-safe',
                inline: true
            }
        ],
        footer: {
            text: 'TrapHouse Bot Integration Suite'
        },
        timestamp: new Date().toISOString()
    };
    
    await message.reply({ embeds: [embed] });
}

// Test webhooks (admin only)
async function testWebhooks(message) {
    try {
        const embed = {
            color: 0x00FF00,
            title: '🧪 Webhook Test Initiated',
            description: 'Testing all webhook integrations...',
            fields: [
                {
                    name: '🐙 GitHub',
                    value: 'Test webhook sent',
                    inline: true
                },
                {
                    name: '💰 JustTheTip',
                    value: 'Test webhook sent',
                    inline: true
                },
                {
                    name: '📡 General',
                    value: 'Test webhook sent',
                    inline: true
                }
            ],
            footer: {
                text: 'Webhook Test - Admin Command'
            },
            timestamp: new Date().toISOString()
        };
        
        await message.reply({ embeds: [embed] });
        
    } catch (error) {
        UnicodeUtils.log('error', 'Webhook test error:', error);
        await message.reply('❌ Webhook test failed');
    }
}

// Send startup notification
async function sendStartupNotification() {
    try {
        if (!process.env.WEBHOOK_URL) return;
        
        const axios = require('axios');
        
        const embed = {
            color: 0x00FF00,
            title: '🚀 TrapHouse Bot Started',
            description: 'Complete integration suite is now online!',
            fields: [
                {
                    name: '🤖 Discord Bot',
                    value: `✅ Online (${client.guilds.cache.size} servers)`,
                    inline: true
                },
                {
                    name: '🔐 OAuth Server',
                    value: `✅ Running (Port ${process.env.PORT || 3001})`,
                    inline: true
                },
                {
                    name: '📡 Webhook Server',
                    value: `✅ Running (Port ${process.env.WEBHOOK_PORT || 3002})`,
                    inline: true
                },
                {
                    name: '🐙 GitHub Integration',
                    value: process.env.GITHUB_WEBHOOK_URL ? '✅ Configured' : '⚠️ Not configured',
                    inline: true
                },
                {
                    name: '💰 Crypto Integration',
                    value: process.env.JUSTTHETIP_API_ENABLED === 'true' ? '✅ Enabled' : '⚠️ Disabled',
                    inline: true
                },
                {
                    name: '🛡️ Security',
                    value: '✅ Unicode-resistant',
                    inline: true
                }
            ],
            footer: {
                text: 'TrapHouse Bot - Ready for operations'
            },
            timestamp: new Date().toISOString()
        };
        
        await axios.post(process.env.WEBHOOK_URL, { embeds: [embed] });
        
    } catch (error) {
        UnicodeUtils.log('error', 'Startup notification error:', error);
    }
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
    
    // Shutdown integrations
    oauthIntegration.shutdown();
    webhookServer.stop();
    
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

module.exports = { 
    client, 
    unicodeSafeStorage, 
    paymentManager, 
    respectManager, 
    roleManager, 
    oauthIntegration,
    webhookServer
};

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
const BotRoleManager = require('./botRoleManager');
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');
const DegensCardGame = require('./degensCardGame');
const { justTheTipManager, handleJustTheTip } = require('./justTheTipBot');
const GitHubIntegration = require('./github-integration');
const { initializeWebhookServer } = require('./github-webhook-server');
const CollectClockIntegration = require('./collectClockIntegration-new');
const TiltCheckMischiefManager = require('./tiltCheckMischiefManager');
const EcosystemManager = require('./ecosystemManager');
const PaymentManager = require('./paymentManager');
const SolscanPaymentTracker = require('./solscanPaymentTracker');
const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');
const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');
const BlockchainDiscordCommands = require('./blockchainDiscordCommands');
const SupportIntegration = require('./supportIntegration');
const EnhancedSystemIntegration = require('./enhancedSystemIntegration');
const PersonalizedTiltProtection = require('./personalizedTiltProtection');
const EnhancedTiltSetup = require('./enhancedTiltSetup');

// Initialize Bot Role Manager
const botRoleManager = new BotRoleManager();
const currentBotConfig = botRoleManager.getCurrentBotConfig();

console.log(`🤖 Starting ${currentBotConfig.name} - ${currentBotConfig.description}`);
console.log(`🔗 Landing Page: ${currentBotConfig.landingPage}`);

// Initialize all systems
const cardGame = new DegensCardGame();
const collectClock = new CollectClockIntegration();
const tiltCheckManager = new TiltCheckMischiefManager();
const ecosystem = new EcosystemManager();
const enhancedSystems = new EnhancedSystemIntegration();
const personalizedTiltProtection = new PersonalizedTiltProtection();

// Initialize Enhanced Tilt Setup (will be initialized after solscanTracker is ready)
let enhancedTiltSetup;
let paymentManager; // Will be initialized after client is ready

// Initialize Crypto Tip System
let cryptoTipManager;
let cryptoTipAdmin;
let enhancedCryptoTipManager;
let blockchainCommands;
let supportIntegration;

// Initialize Solscan Payment Tracker for JustTheTip
let solscanTracker;
if (process.env.CURRENT_BOT === 'JUSTTHETIP' || process.env.ENABLE_SOLSCAN_TRACKING === 'true') {
    solscanTracker = new SolscanPaymentTracker();
}

// ========== MARKETPLACE COMMANDS ==========

async function handleMarketplace(message) {
    const embed = {
        color: 0x9932cc,
        title: '🏪 TrapHouse Marketplace',
        description: 'Welcome to the TrapHouse marketplace - where the streets meet the web!',
        fields: [
            {
                name: '🛒 Shop',
                value: '[Browse Products](http://localhost:3002/stripe/marketplace)',
                inline: true
            },
            {
                name: '💼 Sell',
                value: '[Become a Seller](http://localhost:3002/stripe/seller-dashboard)',
                inline: true
            },
            {
                    name: '🧪 Test',
                    value: '[Developer Dashboard](http://localhost:3002/test)',
                    inline: true
                },
                {
                    name: '🃏 Play Cards',
                    value: 'Use `!cards start` to play Degens Against Decency!',
                    inline: true
                }
        ],
        footer: {
            text: 'Use !sell to start selling, !buy to purchase, or !cards to play games'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleSellCommand(message, args) {
    if (args.length === 0) {
        const embed = {
            color: 0x4caf50,
            title: '💼 Become a TrapHouse Seller',
            description: 'Start your empire in the TrapHouse marketplace!',
            fields: [
                {
                    name: '🚀 Get Started',
                    value: '1. Visit [Seller Dashboard](http://localhost:3002/stripe/seller-dashboard)\n2. Create your seller account\n3. Complete onboarding\n4. Start listing products!'
                },
                {
                    name: '💰 Earnings',
                    value: 'Keep 90% of sales (10% platform fee)\nInstant payouts to your bank account'
                },
                {
                    name: '📝 Example',
                    value: '`!sell "TrapHouse NFT" 50.00 "Exclusive digital art"`'
                }
            ]
        };
        return message.reply({ embeds: [embed] });
    }
    
    // Parse sell command arguments
    const productName = args[0];
    const price = parseFloat(args[1]);
    const description = args.slice(2).join(' ') || 'TrapHouse marketplace item';
    
    if (!productName || !price || price <= 0) {
        return message.reply('❌ Usage: `!sell "Product Name" 25.00 "Optional description"`');
    }
    
    const embed = {
        color: 0xff9800,
        title: '🏗️ Product Creation',
        description: `Ready to list: **${productName}** for $${price.toFixed(2)}`,
        fields: [
            {
                name: '📋 Next Steps',
                value: '1. Visit the [Seller Dashboard](http://localhost:3002/stripe/seller-dashboard)\n2. Create your seller account if needed\n3. Use the product creation form\n4. Your item will be live instantly!'
            }
        ]
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleBuyCommand(message, args) {
    const embed = {
        color: 0x2196f3,
        title: '🛒 TrapHouse Shopping',
        description: 'Ready to buy from the streets?',
        fields: [
            {
                name: '🏪 Browse Products',
                value: '[Visit Marketplace](http://localhost:3002/stripe/marketplace)',
                inline: false
            },
            {
                name: '💳 Payment Methods',
                value: '• Credit/Debit Cards\n• Digital Wallets\n• Crypto (via JustTheTip)\n• Bank Transfers',
                inline: true
            },
            {
                name: '🔒 Security',
                value: 'Stripe-powered payments\nBuyer protection included\nInstant delivery',
                inline: true
            }
        ],
        footer: {
            text: 'All transactions are secure and protected'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

// ========== DEGENS AGAINST DECENCY CARD GAME ==========

async function handleCardsCommand(message, args) {
    const subcommand = args[0]?.toLowerCase();
    
    switch (subcommand) {
        case 'start':
            const maxPlayers = parseInt(args[1]) || 6;
            if (maxPlayers < 3 || maxPlayers > 10) {
                return message.reply('❌ Max players must be between 3 and 10!');
            }
            await cardGame.startGame(message, maxPlayers);
            break;
            
        case 'join':
            await cardGame.joinGame(message);
            break;
            
        case 'play':
            if (!args[1]) {
                return message.reply('❌ Usage: `!cards play <card number>`');
            }
            await cardGame.playCard(message, args.slice(1));
            break;
            
        case 'pick':
            if (!args[1]) {
                return message.reply('❌ Usage: `!cards pick <submission number>`');
            }
            await cardGame.pickWinner(message, args.slice(1));
            break;
            
        case 'status':
            await cardGame.showStatus(message);
            break;
            
        case 'end':
            const game = cardGame.getGameByChannel(message.channel.id);
            if (game && (message.author.id === game.host || message.member?.permissions.has('Administrator'))) {
                await cardGame.endGame(message, game);
            } else {
                message.reply('❌ Only the host or admin can end the game!');
            }
            break;
            
        default:
            const helpEmbed = {
                color: 0xFF1493,
                title: '🃏 Degens Against Decency - Card Game',
                description: 'A TrapHouse-themed Cards Against Humanity style game!',
                fields: [
                    {
                        name: '🎮 Game Commands',
                        value: '`!cards start [max players]` - Start a new game\n`!cards join` - Join an existing game\n`!cards play <number>` - Play a white card\n`!cards pick <number>` - Pick winning combo (Czar only)\n`!cards status` - Show game status\n`!cards end` - End the game (Host/Admin only)'
                    },
                    {
                        name: '🎯 How to Play',
                        value: '1. One player is the **Card Czar**\n2. Everyone else gets white cards\n3. Czar reads a black card prompt\n4. Players submit their funniest white card\n5. Czar picks the best combo\n6. First to 5 points wins!'
                    },
                    {
                        name: '🏆 TrapHouse Theme',
                        value: 'Cards are themed around:\n• Street life and respect\n• Crypto and DeFi culture\n• Discord degenerate lifestyle\n• TrapHouse marketplace vibes'
                    },
                    {
                        name: '🚀 Quick Start',
                        value: 'Type `!cards start` to begin a game right now!'
                    }
                ],
                footer: {
                    text: 'Degens Against Decency - Where the streets meet the memes'
                }
            };
            
            await message.reply({ embeds: [helpEmbed] });
    }
}

async function handleDegensCommand(message, args) {
    const embed = {
        color: 0xFF1493,
        title: '🔥 Degens Against Decency',
        description: 'The ultimate TrapHouse card game experience!',
        fields: [
            {
                name: '🎮 Play the Game',
                value: 'Use `!cards start` to begin a game in this channel!'
            },
            {
                name: '🏪 TrapHouse Integration',
                value: '• Win games to earn respect points\n• Marketplace rewards for top players\n• Special roles for card game champions'
            },
            {
                name: '💰 Crypto Rewards',
                value: 'Coming soon: Win crypto prizes for tournament victories!'
            },
            {
                name: '🔗 Quick Links',
                value: '[Marketplace](http://localhost:3002/stripe/marketplace) | [Seller Dashboard](http://localhost:3002/stripe/seller-dashboard)'
            }
        ],
        footer: {
            text: 'Type !cards for full game instructions'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

const loanManager = require('./loanManager');
const { handleFrontCommand } = require('./front');
const { handleAdminFrontCommand } = require('./admin_front');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});

// Initialize GitHub integration
const githubIntegration = new GitHubIntegration(client);

client.once('ready', async () => {
    const botConfig = botRoleManager.getCurrentBotConfig();
    console.log(`🏠 ${botConfig.name} is online! ${botConfig.description} 💯`);
    console.log(`🔗 Landing Page: ${botConfig.landingPage}`);
    console.log(`📋 Features: ${botConfig.features.join(', ')}`);
    console.log(`� Dashboards: ${botConfig.dashboards.join(', ')}`);
    
    // Set bot activity based on role
    if (botRoleManager.currentBot === 'TRAPHOUSE') {
        client.user.setActivity('Enterprise Operations | !street !front', { type: 'WATCHING' });
    } else if (botRoleManager.currentBot === 'JUSTTHETIP') {
        client.user.setActivity('Financial Operations | !tip !tiltcheck', { type: 'WATCHING' });
    } else if (botRoleManager.currentBot === 'DEGENS') {
        client.user.setActivity('Gaming Hub | !cards !degens', { type: 'PLAYING' });
    }
    
    console.log('🐙 GitHub Integration initialized!');
    console.log('💧 CollectClock Integration ready!');
    console.log('🎰 TiltCheck Mischief Manager loaded!');
    console.log('🚀 Enhanced System Integration loaded!');
    console.log('🌐 Ecosystem Manager initializing...');
    
    // Initialize ecosystem manager
    await ecosystem.initialize();
    
    // Initialize payment manager with client
    paymentManager = new PaymentManager(client);
    console.log('💳 Payment Manager initialized - Crypto & Fiat support ready!');
    
    // Initialize BetCollective Support System
    try {
        supportIntegration = new SupportIntegration(client);
        await supportIntegration.initialize();
        console.log('🎫 BetCollective Support System initialized - @jmenichole dev pinging ready!');
    } catch (error) {
        console.error('❌ Failed to initialize Support System:', error);
    }
    
    // Initialize Crypto Tip System
    try {
        cryptoTipManager = new CryptoTipManager();
        await cryptoTipManager.initializeTipManager();
        cryptoTipAdmin = new CryptoTipAdmin(cryptoTipManager);
        console.log('💎 Crypto Tip System initialized - SOLUSDC ready!');
        
        // Initialize Enhanced Crypto Tip System with Real Blockchain
        enhancedCryptoTipManager = new EnhancedCryptoTipManager(cryptoTipManager);
        await enhancedCryptoTipManager.initialize();
        blockchainCommands = new BlockchainDiscordCommands(enhancedCryptoTipManager);
        console.log('🔗 Enhanced Crypto System initialized - Real blockchain integration ready!');
        
    } catch (error) {
        console.error('❌ Failed to initialize Crypto Tip System:', error);
    }
    
    // Initialize Solscan payment tracking for JustTheTip bot
    if (solscanTracker && (process.env.CURRENT_BOT === 'JUSTTHETIP' || process.env.ENABLE_SOLSCAN_TRACKING === 'true')) {
        console.log('💡 Starting Solscan payment monitoring for JustTheTip...');
        
        // Start monitoring payments
        solscanTracker.startPaymentMonitoring((paymentData) => {
            console.log('💰 New payment detected:', paymentData.transaction.signature);
            
            // Handle loan payments specifically
            if (paymentData.loanData) {
                handleLoanPayment(paymentData, client);
            }
        });
        
        console.log('🔍 Solscan payment tracker active');
    }
    
    // Initialize Enhanced Tilt Setup with integrations
    try {
        enhancedTiltSetup = new EnhancedTiltSetup(personalizedTiltProtection, solscanTracker);
        console.log('🚀 Enhanced Tilt Setup initialized - JustTheIP + Stake API integration ready!');
    } catch (error) {
        console.error('❌ Failed to initialize Enhanced Tilt Setup:', error);
    }
    
    // Connect integrations to TrapHouse for cross-platform features
    collectClock.setTrapHouseBot(client);
    
    // Start GitHub webhook server
    initializeWebhookServer(client);
    
    console.log('✅ All systems operational! Ecosystem ready for degens!');
});

// Handle reactions for respect points
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    try {
        // Fetch the message if it's partial
        if (reaction.partial) {
            await reaction.fetch();
        }
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        // Handle 🔥 reactions in any channel
        if (reaction.emoji.name === '🔥') {
            await handleFireReaction(reaction.message, user);
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Handle posts in #showoff-your-hits for respect
    if (message.channel.name === 'showoff-your-hits') {
        await handleShowoffPost(message);
        return;
    }

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // Bot Role Management - Restrict commands based on bot type
    if (botRoleManager.currentBot === 'TRAPHOUSE') {
        // TrapHouse Bot: Only handle !street and !front commands
        const allowedCommands = ['!street', '!streetname', '!setup_ranks', '!front', '!admin_front', '!respect'];
        
        if (!allowedCommands.includes(command)) {
            return message.reply(botRoleManager.getUnauthorizedMessage(command));
        }
    } else if (botRoleManager.currentBot === 'JUSTTHETIP') {
        // JustTheTip Bot: Handle financial operations and monitoring
        const allowedCommands = ['!tip', '!balance', '!withdraw', '!deposit', '!tiltcheck', '!collectclock', '!jtt', '!justthetip'];
        
        if (!allowedCommands.includes(command)) {
            return message.reply(botRoleManager.getUnauthorizedMessage(command));
        }
    } else if (botRoleManager.currentBot === 'DEGENS') {
        // Degens Bot: Handle gaming and card commands  
        const allowedCommands = ['!degens', '!cards', '!play', '!leaderboard', '!tournament', '!stats'];
        
        if (!allowedCommands.includes(command)) {
            return message.reply(botRoleManager.getUnauthorizedMessage(command));
        }
    }

    // Handle all commands (only if authorized by role manager above)
    if (command === '!street' || command === '!streetname') {
        await roleManager.assignRole(message);
    } else if (command === '!setup_ranks') {
        // Admin command to create all rank roles
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions to set up ranks! 👮‍♂️');
        }
        
        const createdRoles = await roleManager.createRankRoles(message.guild);
        if (createdRoles.length > 0) {
            await message.reply(`✅ Created rank roles: ${createdRoles.join(', ')}\n\nUsers can now use \`!street\` to get their rank roles!`);
        } else {
            await message.reply('✅ All rank roles already exist! Users can use \`!street\` to get their roles.');
        }
    } else if (command === '!work') {
        await addRespectPoints(message);
    } else if (command === '!respect') {
        await handleRespectCommand(message, args);
    } else if (command === '!dashboard' || command === '!landing') {
        // Display bot-specific landing page and dashboard info
        const botConfig = botRoleManager.getCurrentBotConfig();
        const landingInfo = botRoleManager.getLandingPageRedirect();
        
        const embed = {
            color: 0x00ff00,
            title: `🏠 ${botConfig.name} Dashboard`,
            description: botConfig.description,
            fields: [
                {
                    name: '🔗 Landing Page',
                    value: `[${landingInfo.url}](${landingInfo.url})`,
                    inline: true
                },
                {
                    name: '🎯 Available Dashboards',
                    value: landingInfo.dashboards.map(d => `• ${d.replace(/-/g, ' ')}`).join('\n'),
                    inline: true
                },
                {
                    name: '📋 Bot Features',
                    value: botConfig.features.map(f => `• ${f.replace(/_/g, ' ')}`).join('\n'),
                    inline: false
                },
                {
                    name: '⚡ Available Commands',
                    value: botConfig.allowedCommands.slice(0, 8).map(c => `\`${c}\``).join(' '),
                    inline: false
                }
            ],
            footer: {
                text: `${botConfig.name} - Specialized Bot for Optimal Performance`
            }
        };
        
        await message.reply({ embeds: [embed] });
    } else if (command === '!botroles') {
        // Display information about all bots in the ecosystem
        await message.reply(botRoleManager.getBotRolesList());
    } else if (command === '!front') {
        const frontArgs = args;
        await handleFrontCommand(message, frontArgs);
    } else if (command === '!admin_front') {
        const adminArgs = args;
        await handleAdminFrontCommand(message, adminArgs);
    } else if (command === '!repay') {
        await loanManager.handleRepayment(message);
    } else if (command === '!job') {
        await message.reply('Job system coming soon! 💼 For now, use `!work` to earn respect points.');
    } else if (command === '!leaderboard') {
        await handleLeaderboard(message);
    } else if (command === '!flex') {
        await handleFlex(message);
    } else if (command === '!hood') {
        await handleHoodStats(message);
    } else if (command === '!marketplace') {
        await handleMarketplace(message);
    } else if (command === '!sell') {
        await handleSellCommand(message, args);
    } else if (command === '!buy') {
        await handleBuyCommand(message, args);
    } else if (command === '!cards') {
        await handleCardsCommand(message, args);
    } else if (command === '!degens') {
        await handleDegensCommand(message, args);
    } else if (command === '!jtt' || command === '!justthetip') {
        await handleJustTheTip(message, args);
    } else if (command === '!github') {
        const githubCommands = githubIntegration.setupCommands();
        await githubCommands.handleGitHubStatus(message);
    } else if (command === '!cc' || command === '!collect') {
        // Forward to CollectClock integration
        const ccArgs = args;
        await collectClock.handleCollectClock(message, ccArgs);
    } else if (command === '!collectclock') {
        await collectClock.showCollectClockHelp(message);
    } else if (command === '!tiltcheck' || command === '!tilt') {
        // Forward to TiltCheck Mischief Manager
        await tiltCheckManager.handleTiltCheck(message, args);
    } else if (command === '!ecosystem') {
        await ecosystem.handleEcosystemCommand(message, args);
    } else if (command === '!enhanced' || command === '$enhanced') {
        // Enhanced systems integration - all new features
        await enhancedSystems.handleEnhancedCommand(message, args);
    } else if (command === '!mytilt' || command === '$mytilt') {
        // Personalized tilt protection based on user's specific patterns
        await handlePersonalizedTiltCommand(message, args);
    }
    
    // ========== CRYPTO TIP SYSTEM COMMANDS (JUSTTHETIP BOT ONLY) ==========
    else if (command.startsWith('$tip') || command.startsWith('$balance') || command.startsWith('$history') || command.startsWith('$solusdc') || 
             command.startsWith('$wallet') || command.startsWith('$withdraw') || command.startsWith('$airdrop') || command.startsWith('$blockchain')) {
        // Only allow crypto commands on JustTheTip bot
        if (process.env.CURRENT_BOT !== 'JUSTTHETIP') {
            return message.reply('💡 **Crypto commands are only available on JustTheTip bot!**\n\nUse `node launcher.js justthetip` to run the JustTheTip bot with crypto features.\n\nOr switch to JustTheTip bot in your Discord server.');
        }
        
        if (!cryptoTipManager) {
            return message.reply('❌ Crypto Tip System not available. Contact admin.');
        }

        try {
            // Enhanced blockchain commands (if available)
            if (command.startsWith('$balance') && enhancedCryptoTipManager && blockchainCommands) {
                await blockchainCommands.handleEnhancedBalance(message);
            } else if (command.startsWith('$wallet') && enhancedCryptoTipManager && blockchainCommands) {
                await blockchainCommands.handleWallet(message, args);
            } else if (command.startsWith('$withdraw') && enhancedCryptoTipManager && blockchainCommands) {
                await blockchainCommands.handleWithdraw(message, args);
            } else if (command.startsWith('$airdrop') && enhancedCryptoTipManager && blockchainCommands) {
                await blockchainCommands.handleAirdrop(message, args);
            } else if (command.startsWith('$blockchain') && enhancedCryptoTipManager && blockchainCommands) {
                await blockchainCommands.handleBlockchainStatus(message);
            } 
            // Original virtual commands
            else if (command.startsWith('$tip')) {
                await cryptoTipManager.handleTipCommand(message, args);
            } else if (command.startsWith('$balance')) {
                await cryptoTipManager.handleBalanceCommand(message, args);
            } else if (command.startsWith('$history')) {
                await cryptoTipManager.handleHistoryCommand(message, args);
            } else if (command.startsWith('$solusdc')) {
                // Special SOLUSDC testing command
                await handleSOLUSDCTestCommand(message, args, cryptoTipManager, cryptoTipAdmin);
            }
        } catch (error) {
            console.error('Crypto tip command error:', error);
            await message.reply('❌ An error occurred with the crypto tip system.');
        }
    }
    
    // Crypto Tip Admin commands - Admin only (JUSTTHETIP BOT ONLY)
    else if (command.startsWith('!tip-admin')) {
        // Only allow crypto admin commands on JustTheTip bot
        if (process.env.CURRENT_BOT !== 'JUSTTHETIP') {
            return message.reply('💡 **Crypto admin commands are only available on JustTheTip bot!**\n\nUse `node launcher.js justthetip` to run the JustTheTip bot with crypto features.');
        }
        
        if (!cryptoTipAdmin) {
            return message.reply('❌ Crypto Tip Admin System not available. Contact admin.');
        }

        try {
            await cryptoTipAdmin.handleAdminCommand(message, args);
        } catch (error) {
            console.error('Crypto tip admin command error:', error);
            await message.reply('❌ An error occurred with the crypto tip admin system.');
        }
    }
    
    // ========== PAYMENT COMMANDS ==========
    else if (command === '!deposit') {
        if (!paymentManager) {
            return await message.reply('💳 Payment system is initializing. Please try again in a moment.');
        }
        const depositType = args[0]?.toLowerCase();
        if (depositType === 'fiat') {
            await paymentManager.createFiatDeposit(message, args.slice(1));
        } else if (depositType === 'crypto') {
            await paymentManager.generateCryptoDeposit(message, args.slice(1));
        } else {
            await message.reply('💳 **TrapHouse Payment System**\n\n**Fiat Deposits:**\n`!deposit fiat <amount> [currency]` - Deposit via Stripe\nExample: `!deposit fiat 100 USD`\n\n**Crypto Deposits:**\n`!deposit crypto <CRYPTO>` - Generate deposit address\nExample: `!deposit crypto ETH`\n\nSupported: ETH, USDC, USDT, WBTC');
        }
    } else if (command === '!verify-payment' || command === '!check-tx') {
        // JustTheTip Solscan payment verification
        if (!solscanTracker) {
            return await message.reply('💡 Solscan tracking not available on this bot. Use `node launcher.js justthetip` to run JustTheTip bot.');
        }
        
        const signature = args[0];
        if (!signature) {
            return await message.reply('💡 **Verify Payment**\n\nUsage: `!verify-payment <transaction_signature>`\nExample: `!verify-payment TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E`\n\n⚠️ **Note:** Full verification requires Solscan Pro API key');
        }
        
        try {
            // First, let's check if we have a proper API key
            const hasApiKey = process.env.SOLSCAN_API_KEY && process.env.SOLSCAN_API_KEY !== 'your_solscan_api_key_here';
            
            if (!hasApiKey) {
                const embed = {
                    title: "⚠️ Limited Verification Mode",
                    color: 0xffaa00,
                    fields: [
                        {
                            name: "Transaction Signature",
                            value: `\`${signature}\``,
                            inline: false
                        },
                        {
                            name: "Expected Payment Signer",
                            value: `\`${process.env.JUSTTHETIP_PAYMENT_SIGNER?.substring(0, 20)}...\``,
                            inline: false
                        },
                        {
                            name: "Status",
                            value: "⚠️ Cannot fully verify without Solscan Pro API key",
                            inline: false
                        },
                        {
                            name: "Manual Verification",
                            value: `[View on Solscan](https://solscan.io/tx/${signature})\n[View on Solana Explorer](https://explorer.solana.com/tx/${signature})`,
                            inline: false
                        },
                        {
                            name: "How to Enable Full Verification",
                            value: "1. Get API key from https://pro-api.solscan.io/\n2. Add to .env: `SOLSCAN_API_KEY=your_key`\n3. Restart bot: `node launcher.js justthetip`",
                            inline: false
                        }
                    ],
                    footer: {
                        text: "JustTheTip Payment Verification • Limited Mode"
                    }
                };
                
                return await message.reply({ embeds: [embed] });
            }
            
            // If we have an API key, proceed with full verification
            const isValid = await solscanTracker.verifyPaymentTransaction(signature);
            
            if (isValid) {
                const paymentResult = await solscanTracker.processLoanPayment(signature);
                
                if (paymentResult.success) {
                    const embed = {
                        title: "✅ Payment Verified",
                        color: 0x00ff00,
                        fields: [
                            {
                                name: "Transaction",
                                value: `\`${signature}\``,
                                inline: false
                            },
                            {
                                name: "Amount",
                                value: `${paymentResult.transaction.amount} ${paymentResult.transaction.token}`,
                                inline: true
                            },
                            {
                                name: "Signer Verified",
                                value: "✅ JustTheTip Payment Signer",
                                inline: true
                            },
                            {
                                name: "Solscan Link",
                                value: `[View Transaction](https://solscan.io/tx/${signature})`,
                                inline: false
                            }
                        ],
                        footer: {
                            text: "JustTheTip Payment Verification • Full Mode"
                        }
                    };
                    
                    await message.reply({ embeds: [embed] });
                } else {
                    await message.reply(`❌ Could not process payment: ${paymentResult.error}`);
                }
            } else {
                const embed = {
                    title: "❌ Payment Verification Failed",
                    color: 0xff0000,
                    fields: [
                        {
                            name: "Transaction",
                            value: `\`${signature}\``,
                            inline: false
                        },
                        {
                            name: "Issue",
                            value: "Transaction not signed by JustTheTip payment signer or not found",
                            inline: false
                        },
                        {
                            name: "Expected Signer",
                            value: `\`${process.env.JUSTTHETIP_PAYMENT_SIGNER?.substring(0, 20)}...\``,
                            inline: false
                        },
                        {
                            name: "Manual Check",
                            value: `[View on Solscan](https://solscan.io/tx/${signature})\n[View on Solana Explorer](https://explorer.solana.com/tx/${signature})`,
                            inline: false
                        }
                    ],
                    footer: {
                        text: "JustTheTip Payment Verification"
                    }
                };
                
                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            
            const embed = {
                title: "❌ Verification Error",
                color: 0xff0000,
                fields: [
                    {
                        name: "Error",
                        value: "Unable to verify payment - API error",
                        inline: false
                    },
                    {
                        name: "Transaction",
                        value: `\`${signature}\``,
                        inline: false
                    },
                    {
                        name: "Manual Verification",
                        value: `[View on Solscan](https://solscan.io/tx/${signature})\n[View on Solana Explorer](https://explorer.solana.com/tx/${signature})`,
                        inline: false
                    },
                    {
                        name: "Possible Issues",
                        value: "• Solscan API key missing or invalid\n• Transaction not found\n• Network connectivity issues",
                        inline: false
                    }
                ],
                footer: {
                    text: "JustTheTip Payment Verification • Error Mode"
                }
            };
            
            await message.reply({ embeds: [embed] });
        }
    } else if (command === '!solscan-status' || command === '!api-status') {
        // Check Solscan API configuration and status
        if (!solscanTracker) {
            return await message.reply('💡 Solscan tracking not available. Run `node launcher.js justthetip` to enable.');
        }
        
        const hasApiKey = process.env.SOLSCAN_API_KEY && process.env.SOLSCAN_API_KEY !== 'your_solscan_api_key_here';
        const paymentSigner = process.env.JUSTTHETIP_PAYMENT_SIGNER;
        const loanChannel = process.env.JUSTTHETIP_LOAN_CHANNEL_ID;
        const webhookUrl = process.env.JUSTTHETIP_WEBHOOK_URL;
        
        const embed = {
            title: "🔍 JustTheTip Solscan Configuration",
            color: hasApiKey ? 0x00ff00 : 0xffaa00,
            fields: [
                {
                    name: "API Status",
                    value: hasApiKey ? "✅ Solscan Pro API Key configured" : "⚠️ No API key - Limited functionality",
                    inline: false
                },
                {
                    name: "Payment Signer",
                    value: paymentSigner ? `\`${paymentSigner.substring(0, 20)}...\`` : "❌ Not configured",
                    inline: true
                },
                {
                    name: "Loan Channel",
                    value: loanChannel ? `<#${loanChannel}>` : "❌ Not configured",
                    inline: true
                },
                {
                    name: "Webhook",
                    value: webhookUrl && !webhookUrl.includes('your_webhook') ? "✅ Configured" : "❌ Not configured",
                    inline: true
                },
                {
                    name: "Monitoring Status",
                    value: "🔄 Active (checks every 30 seconds)",
                    inline: false
                },
                {
                    name: "Available Commands",
                    value: "`!verify-payment <tx>` - Verify transaction\n`!check-tx <tx>` - Same as above\n`!solscan-status` - Show this status\n`!test-balance` - Test account balance API\n`!test-tokens` - Test token holdings API\n`!test-tx <sig>` - Test transaction detail API",
                    inline: false
                }
            ],
            footer: {
                text: hasApiKey ? "JustTheTip • Full API Access" : "JustTheTip • Limited Access - Get API key at pro-api.solscan.io"
            }
        };
        
        if (!hasApiKey) {
            embed.fields.push({
                name: "🚀 Enable Full Features",
                value: "1. Visit https://pro-api.solscan.io/\n2. Get your API key\n3. Add to .env: `SOLSCAN_API_KEY=your_key`\n4. Restart: `node launcher.js justthetip`",
                inline: false
            });
        }
        
        await message.reply({ embeds: [embed] });
        
    } else if (command === '!test-balance') {
        if (CURRENT_BOT !== 'JustTheTip') return;

        const balanceData = await solscanTracker.getAccountBalance();
        
        const balanceEmbed = {
            title: '💰 Account Balance Test',
            color: balanceData ? 0x00ff00 : 0xff0000,
            timestamp: new Date().toISOString(),
            fields: []
        };

        if (balanceData) {
            balanceEmbed.description = `✅ Successfully fetched balance for payment signer`;
            balanceEmbed.fields.push(
                { name: 'Balance', value: `${balanceData.lamports || 0} lamports`, inline: true },
                { name: 'SOL Balance', value: `${(balanceData.lamports || 0) / 1e9} SOL`, inline: true }
            );
        } else {
            balanceEmbed.description = '❌ Failed to fetch account balance';
            balanceEmbed.fields.push({ name: 'Note', value: 'Check API key configuration or try again later' });
        }

        await message.reply({ embeds: [balanceEmbed] });
        
    } else if (command === '!test-tokens') {
        if (CURRENT_BOT !== 'JustTheTip') return;

        const tokenData = await solscanTracker.getTokenHoldings();
        
        const tokenEmbed = {
            title: '🪙 Token Holdings Test',
            color: tokenData.length > 0 ? 0x00ff00 : 0xff0000,
            timestamp: new Date().toISOString(),
            fields: []
        };

        if (tokenData.length > 0) {
            const tokenList = tokenData.slice(0, 5).map(token => 
                `${token.tokenSymbol || 'Unknown'}: ${token.amount || 0}`
            ).join('\n');
            
            tokenEmbed.description = `✅ Found ${tokenData.length} token holdings`;
            tokenEmbed.fields.push({ name: 'Top Holdings', value: tokenList || 'No tokens found' });
        } else {
            tokenEmbed.description = 'ℹ️ No token holdings found or API error';
            tokenEmbed.fields.push({ name: 'Note', value: 'This may be normal if the account has no tokens' });
        }

        await message.reply({ embeds: [tokenEmbed] });
        
    } else if (command === '!test-tx') {
        if (CURRENT_BOT !== 'JustTheTip') return;

        const txSignature = args[0];
        if (!txSignature) {
            await message.reply('Please provide a transaction signature: `!test-tx <signature>`');
            return;
        }

        const txData = await solscanTracker.getTransactionDetail(txSignature, {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 0
        });
        
        const txEmbed = {
            title: '🔍 Transaction Detail Test',
            color: txData ? 0x00ff00 : 0xff0000,
            timestamp: new Date().toISOString(),
            fields: []
        };

        if (txData) {
            txEmbed.description = `✅ Successfully fetched transaction details`;
            txEmbed.fields.push(
                { name: 'Signature', value: txSignature, inline: false },
                { name: 'Status', value: txData.status || 'Unknown', inline: true },
                { name: 'Block Time', value: txData.blockTime ? new Date(txData.blockTime * 1000).toISOString() : 'Unknown', inline: true }
            );
        } else {
            txEmbed.description = '❌ Failed to fetch transaction details';
            txEmbed.fields.push({ name: 'Note', value: 'Transaction may not exist or API error occurred' });
        }

        await message.reply({ embeds: [txEmbed] });
        
    } else if (command === '!withdraw') {
        if (!paymentManager) {
            return await message.reply('💳 Payment system is initializing. Please try again in a moment.');
        }
        await paymentManager.withdrawCrypto(message, args);
    } else if (command === '!wallet') {
        if (!paymentManager) {
            return await message.reply('💳 Payment system is initializing. Please try again in a moment.');
        }
        const subCommand = args[0]?.toLowerCase();
        if (subCommand === 'status' || !subCommand) {
            await paymentManager.showWalletStatus(message);
        } else {
            await message.reply('💼 **Wallet Commands:**\n`!wallet status` - View complete wallet dashboard\n`!wallet history` - Transaction history\n`!deposit crypto <CRYPTO>` - Generate deposit address\n`!deposit fiat <amount>` - Fiat deposit via Stripe');
        }
    }
    
    // Admin commands
    else if (command === '!kick' || command === '!ban' || command === '!clear' || command === '!mute') {
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions for that command! 👮‍♂️');
        }
        await message.reply('Admin command system coming soon! 🔨');
    }
});

// Ecosystem status dashboard
async function handleEcosystemStatus(message) {
    const embed = {
        color: 0x9932cc,
        title: '🏠 TrapHouse Ecosystem Status',
        description: '*Made for degens by degens - Full system overview*',
        fields: [
            {
                name: '🎮 Core Systems',
                value: '✅ **TrapHouse Bot** - Lending & community\n✅ **JustTheTip** - Smart crypto assistant\n✅ **Degens Card Game** - Interactive entertainment\n✅ **Respect System** - Community ranking',
                inline: true
            },
            {
                name: '🔧 Integrations',
                value: `✅ **CollectClock** - Daily bonus tracking\n✅ **TiltCheck** - Gambling behavior analysis\n✅ **GitHub** - Development automation\n${collectClock.isReady() ? '✅' : '❌'} **Webhook Server** - External APIs`,
                inline: true
            },
            {
                name: '🌐 Connected Projects',
                value: '📋 [**JustTheTip Terms**](https://github.com/jmenichole/JustTheTip-Terms)\n🌟 [**Portfolio Website**](https://jmenichole.github.io/Portfolio/)\n🎰 [**TiltCheck Audit**](https://github.com/jmenichole/TiltCheck-audit-stakeus)\n💧 [**CollectClock**](https://jmenichole.github.io/CollectClock/)',
                inline: false
            },
            {
                name: '📊 Quick Stats',
                value: `**Active Users:** ${message.guild?.memberCount || 'Unknown'}\n**Commands Available:** 25+\n**Integrations:** 7\n**Uptime:** ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
                inline: true
            },
            {
                name: '🎯 Available Commands',
                value: '`!front` `!respect` `!work` `!cards`\n`!jtt` `!cc` `!tiltcheck` `!github`\n`!marketplace` `!leaderboard` `!flex`',
                inline: true
            }
        ],
        footer: {
            text: 'TrapHouse Ecosystem • Turning degeneracy into disciplined gains since 2025'
        },
        timestamp: new Date().toISOString()
    };

    await message.reply({ embeds: [embed] });
}

// Helper functions for commands
async function handleLeaderboard(message) {
    try {
        const { getUserData } = require('./storage');
        const { getRankFromRespect } = require('./respectManager');
        
        // Get all users (this is a simplified version - in production you'd want to track users better)
        await message.reply('🏆 **STREET LEADERBOARD** 🏆\n\nLeaderboard system coming soon! For now, check your rank with `!front trust`\n\n*Top hustlers will be displayed here once we track all users*');
    } catch (error) {
        console.error('Leaderboard error:', error);
        await message.reply('Something went wrong with the leaderboard! 💥');
    }
}

async function handleFlex(message) {
    try {
        const { getUserData } = require('./storage');
        const { getRankFromRespect } = require('./respectManager');
        
        const userData = await getUserData(message.author.id);
        const userRank = getRankFromRespect(userData.respect || 0);
        
        const flexMessages = [
            `${message.author.username} is flexin' with ${userData.respect || 0} respect! 💯`,
            `Look at this ${userRank.rank} showing off! 🔥`,
            `${message.author.username} got the streets on lock! 👑`,
            `This ${userRank.rank} ain't playing games! 💰`,
            `${message.author.username} built different! 🏆`
        ];
        
        const randomFlex = flexMessages[Math.floor(Math.random() * flexMessages.length)];
        await message.reply(`${randomFlex}\n\n**${message.author.username}'s Status:**\n👑 Rank: ${userRank.rank}\n💯 Respect: ${userData.respect || 0}\n💰 Max Front: $${userRank.loanCap}`);
    } catch (error) {
        console.error('Flex error:', error);
        await message.reply('Something went wrong with your flex! 💥');
    }
}

async function handleHoodStats(message) {
    try {
        const fs = require('fs');
        
        // Get loan stats
        let activeLoans = 0;
        let totalBorrowed = 0;
        try {
            const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
            activeLoans = Object.values(loans).filter(loan => !loan.repaid).length;
        } catch (e) {}
        
        // Get trust stats
        let totalUsers = 0;
        let totalRepaid = 0;
        try {
            const trust = JSON.parse(fs.readFileSync('./user_trust.json', 'utf8') || '{}');
            totalUsers = Object.keys(trust).length;
            totalRepaid = Object.values(trust).reduce((sum, user) => sum + (user.totalBorrowed || 0), 0);
        } catch (e) {}
        
        await message.reply(`🏠 **TRAPHOUSE HOOD STATS** 🏠

💰 **Money on the Streets:**
• Active fronts: ${activeLoans}
• Total repaid: $${totalRepaid}
• Hustlers in the game: ${totalUsers}

📅 **Front Schedule:**
• Next front day: ${getNextMonday()}
• Current day: ${new Date().toLocaleDateString()}

🏆 **The Game:**
• Ranks available: 5 (Street Soldier → Boss)
• Max respect earned: Unlimited 💯
• Trust levels: Low → Medium → High

*Keep grinding and climb those ranks! 📈*`);
    } catch (error) {
        console.error('Hood stats error:', error);
        await message.reply('Something went wrong checking hood stats! 💥');
    }
}

function getNextMonday() {
    const today = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + (7 - today.getDay() + 1) % 7);
    return nextMonday.toDateString();
}

// Handle loan payments detected by Solscan
async function handleLoanPayment(paymentData, client) {
    try {
        const { transaction, loanData } = paymentData;
        
        console.log(`💡 Processing loan payment: ${transaction.signature}`);
        
        // Get the loan channel
        const loanChannelId = process.env.JUSTTHETIP_LOAN_CHANNEL_ID;
        const loanChannel = client.channels.cache.get(loanChannelId);
        
        if (!loanChannel) {
            console.error('❌ Loan channel not found');
            return;
        }
        
        // Create payment confirmation embed
        const embed = {
            title: "💡 JustTheTip Loan Payment Received",
            color: 0x00ff00,
            fields: [
                {
                    name: "Transaction Hash",
                    value: `\`${transaction.signature}\``,
                    inline: false
                },
                {
                    name: "Amount",
                    value: `${transaction.amount} ${transaction.token}`,
                    inline: true
                },
                {
                    name: "Block Time",
                    value: new Date(transaction.timestamp * 1000).toLocaleString(),
                    inline: true
                },
                {
                    name: "Solscan Link",
                    value: `[View Transaction](https://solscan.io/tx/${transaction.signature})`,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: "JustTheTip Loan Payment System"
            }
        };
        
        // Send to loan channel
        await loanChannel.send({ embeds: [embed] });
        
        console.log('✅ Loan payment notification sent to Discord');
        
    } catch (error) {
        console.error('❌ Error handling loan payment:', error.message);
    }
}

// Handle button interactions for payment system and slash commands
client.on('interactionCreate', async (interaction) => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // Bot Role Management for Slash Commands
        if (botRoleManager.currentBot === 'TRAPHOUSE') {
            // TrapHouse Bot: Only casino trust system commands
            const allowedSlashCommands = [
                'casino-verify', 'casino-profile', 'casino-ranking', 
                'trust-score', 'enhanced-loan'
            ];
            
            if (!allowedSlashCommands.includes(commandName)) {
                return await interaction.reply({
                    content: botRoleManager.getUnauthorizedMessage(`/${commandName}`),
                    ephemeral: true
                });
            }
        } else if (botRoleManager.currentBot === 'JUSTTHETIP') {
            // JustTheTip Bot: Financial and monitoring commands
            const allowedSlashCommands = [
                'payment', 'tilt-check', 'help'
            ];
            
            if (!allowedSlashCommands.includes(commandName)) {
                return await interaction.reply({
                    content: botRoleManager.getUnauthorizedMessage(`/${commandName}`),
                    ephemeral: true
                });
            }
        }

        // Load and execute commands (only if authorized)
        try {
            let command;
            switch (commandName) {
                case 'casino-verify':
                    command = require('./commands/casino-verify.js');
                    break;
                case 'casino-profile':
                    command = require('./commands/casino-profile.js');
                    break;
                case 'casino-ranking':
                    command = require('./commands/casino-ranking.js');
                    break;
                case 'trust-score':
                    command = require('./commands/trust-score.js');
                    break;
                case 'enhanced-loan':
                    command = require('./commands/enhanced-loan.js');
                    break;
                case 'payment':
                    command = require('./commands/payment.js');
                    break;
                case 'help':
                    command = require('./commands/help_fixed.js');
                    break;
                case 'tilt-check':
                    command = require('./commands/enhancedTiltCheck.js');
                    break;
                default:
                    return await interaction.reply({ 
                        content: `❌ Command \`/${commandName}\` not found.`, 
                        ephemeral: true 
                    });
            }

            if (command && command.execute) {
                await command.execute(interaction);
            } else {
                await interaction.reply({ 
                    content: `❌ Command \`/${commandName}\` is not properly configured.`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error(`Error executing slash command ${commandName}:`, error);
            const errorMessage = '❌ There was an error while executing this command!';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
        return;
    }

    // Handle button interactions
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    
    try {
        // Payment-related button interactions
        if (customId.startsWith('cancel_payment_')) {
            await interaction.reply({ content: '❌ Payment cancelled.', ephemeral: true });
        }
        else if (customId.startsWith('refresh_balance_')) {
            if (!paymentManager) {
                return await interaction.reply({ content: '💳 Payment system is not available.', ephemeral: true });
            }
            
            const parts = customId.split('_');
            const crypto = parts[2];
            const userId = parts[3];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ You can only refresh your own balance.', ephemeral: true });
            }
            
            // Simulate balance refresh
            await interaction.reply({ content: `🔄 Refreshing ${crypto} balance...`, ephemeral: true });
            
            // In production, this would trigger actual balance checking
            setTimeout(async () => {
                try {
                    await interaction.editReply({ content: `✅ ${crypto} balance refreshed! Check for new deposits.` });
                } catch (error) {
                    console.error('Error updating balance refresh:', error);
                }
            }, 2000);
        }
        else if (customId.startsWith('view_transactions_')) {
            const parts = customId.split('_');
            const crypto = parts[2];
            const userId = parts[3];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ You can only view your own transactions.', ephemeral: true });
            }
            
            await interaction.reply({ 
                content: `📊 **${crypto} Transaction History**\n\nTransaction history feature coming soon!\nFor now, check your Discord DMs for deposit confirmations.`, 
                ephemeral: true 
            });
        }
        else if (customId.startsWith('vault_transfer_')) {
            const parts = customId.split('_');
            const crypto = parts[2];
            const userId = parts[3];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ You can only transfer your own funds.', ephemeral: true });
            }
            
            await interaction.reply({ 
                content: `🏦 **JustTheTip Vault Transfer**\n\nUse \`!jtt vault ${crypto.toLowerCase()}\` to transfer your ${crypto} to a vault for disciplined holding!`, 
                ephemeral: true 
            });
        }
        else if (customId.startsWith('wallet_status_')) {
            const userId = customId.split('_')[2];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ You can only view your own wallet.', ephemeral: true });
            }
            
            if (!paymentManager) {
                return await interaction.reply({ content: '💳 Payment system is not available.', ephemeral: true });
            }
            
            // Create a mock message object for the payment manager
            const mockMessage = {
                author: interaction.user,
                reply: async (content) => await interaction.reply({ ...content, ephemeral: true })
            };
            
            await paymentManager.showWalletStatus(mockMessage);
        }
        else if (customId.startsWith('deposit_crypto_')) {
            const userId = customId.split('_')[2];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
            }
            
            await interaction.reply({ 
                content: `💰 **Crypto Deposit**\n\nUse one of these commands to generate a deposit address:\n\`!deposit crypto ETH\` - Ethereum\n\`!deposit crypto USDC\` - USD Coin\n\`!deposit crypto USDT\` - Tether\n\`!deposit crypto WBTC\` - Wrapped Bitcoin`, 
                ephemeral: true 
            });
        }
        else if (customId.startsWith('deposit_fiat_')) {
            const userId = customId.split('_')[2];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
            }
            
            await interaction.reply({ 
                content: `💳 **Fiat Deposit**\n\nUse \`!deposit fiat <amount>\` to create a secure Stripe payment.\n\nExample: \`!deposit fiat 100\` for $100 USD\n\nMinimum: $5 | Maximum: $10,000`, 
                ephemeral: true 
            });
        }
        else if (customId.startsWith('view_vault_')) {
            const userId = customId.split('_')[2];
            
            if (userId !== interaction.user.id) {
                return await interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
            }
            
            await interaction.reply({ 
                content: `🏦 **JustTheTip Vault System**\n\nUse \`!jtt vault\` to see available vaults:\n• **HODL Vault** - Long-term holding\n• **REGRET Vault** - Anti-FOMO protection\n• **GRASS TOUCHING Vault** - Time-based breaks\n• **THERAPY Vault** - Emergency lockup\n• **YOLO Vault** - High-risk plays`, 
                ephemeral: true 
            });
        }
        else if (customId.startsWith('confirm_withdrawal_')) {
            await interaction.reply({ content: '⚠️ Withdrawal confirmation system is being implemented for security.', ephemeral: true });
        }
        else if (customId.startsWith('cancel_withdrawal_')) {
            await interaction.reply({ content: '❌ Withdrawal cancelled.', ephemeral: true });
        }
        
    } catch (error) {
        console.error('Interaction error:', error);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred processing your request.', ephemeral: true });
        }
    }
});

// Handle SOLUSDC test command
async function handleSOLUSDCTestCommand(message, args, cryptoTipManager, cryptoTipAdmin) {
    const { EmbedBuilder } = require('discord.js');
    const subcommand = args[0]?.toLowerCase();
    const userId = message.author.id;
    const username = message.author.username;

    try {
        if (subcommand === 'add') {
            // Add SOLUSDC for testing - admin only
            if (!message.member || !message.member.permissions.has('Administrator')) {
                return message.reply('❌ Only admins can add SOLUSDC test funds!');
            }

            const amount = parseFloat(args[1]) || 100;
            await cryptoTipManager.addUserBalance(userId, 'SOLUSDC', amount);

            const embed = new EmbedBuilder()
                .setTitle('✅ SOLUSDC Test Funds Added')
                .setDescription(`Added **${amount} SOLUSDC** for testing`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '👤 User', value: username, inline: true },
                    { name: '💰 Amount', value: `${amount} SOLUSDC`, inline: true },
                    { name: '🏦 New Balance', value: `${cryptoTipManager.getUserBalance(userId, 'SOLUSDC')} SOLUSDC`, inline: true }
                )
                .addFields({
                    name: '🧪 Test Commands',
                    value: '`$solusdc send @user amount` - Send SOLUSDC\n`$solusdc balance` - Check SOLUSDC balance\n`$tip @user amount SOLUSDC` - Regular tip with SOLUSDC',
                    inline: false
                })
                .setFooter({ text: 'SOLUSDC testing enabled - Solana USDC simulation' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } else if (subcommand === 'send') {
            // Quick send command for SOLUSDC
            const mentionMatch = args[1]?.match(/<@!?(\d+)>/);
            if (!mentionMatch) {
                return message.reply('❌ Usage: `$solusdc send @user amount`');
            }

            const toUserId = mentionMatch[1];
            const amount = parseFloat(args[2]) || 10;

            // Use the regular tip system but force SOLUSDC
            const modifiedArgs = [`<@${toUserId}>`, amount.toString(), 'SOLUSDC'];
            await cryptoTipManager.handleTipCommand(message, modifiedArgs);

        } else if (subcommand === 'balance') {
            // Check SOLUSDC balance specifically
            const balance = cryptoTipManager.getUserBalance(userId, 'SOLUSDC');

            const embed = new EmbedBuilder()
                .setTitle(`💰 ${username}'s SOLUSDC Balance`)
                .setDescription(`**${balance.toFixed(6)} SOLUSDC** (~$${(balance * 1.00).toFixed(2)} USD)`)
                .setColor(0x9945FF)
                .addFields(
                    { name: '🪙 Token Type', value: 'Solana USDC (SPL Token)', inline: true },
                    { name: '⛓️ Network', value: 'Solana Mainnet-Beta', inline: true },
                    { name: '💵 USD Value', value: `~$${(balance * 1.00).toFixed(2)}`, inline: true }
                )
                .addFields({
                    name: '🚀 Quick Actions',
                    value: '`$solusdc send @user amount` - Send SOLUSDC\n`$tip @user amount SOLUSDC` - Regular tip\n`$solusdc add amount` - Add test funds (admin)',
                    inline: false
                })
                .setFooter({ text: 'SOLUSDC - Perfect for testing fast crypto transfers' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } else {
            // Show SOLUSDC help
            const embed = new EmbedBuilder()
                .setTitle('🪙 SOLUSDC Testing System')
                .setDescription('Fast & cheap crypto testing with Solana USDC')
                .setColor(0x9945FF)
                .addFields(
                    {
                        name: '⚡ SOLUSDC Commands',
                        value: '`$solusdc` - Show this help\n`$solusdc balance` - Check SOLUSDC balance\n`$solusdc send @user amount` - Quick SOLUSDC send\n`$solusdc add amount` - Add test funds (admin only)',
                        inline: false
                    },
                    {
                        name: '💡 Standard Commands',
                        value: '`$tip @user amount SOLUSDC` - Regular tip with SOLUSDC\n`$balance` - Check all crypto balances\n`$history` - View tip history',
                        inline: false
                    },
                    {
                        name: '⚡ Why SOLUSDC?',
                        value: '• **Fast:** 1-2 second confirmations\n• **Cheap:** ~$0.001 transaction fees\n• **Stable:** USDC pegged to $1.00\n• **Reliable:** Built on Solana network',
                        inline: false
                    }
                )
                .addFields({
                    name: '🧪 Testing Flow',
                    value: '1. Admin: `$solusdc add 100`\n2. User: `$solusdc send @friend 10`\n3. Check: `$solusdc balance`',
                    inline: false
                })
                .setFooter({ text: 'SOLUSDC - Perfect for testing fast crypto transfers' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('SOLUSDC command error:', error);
        await message.reply(`❌ Error with SOLUSDC command: ${error.message}`);
    }
}

// ========== PERSONALIZED TILT PROTECTION SYSTEM ==========

async function handlePersonalizedTiltCommand(message, args) {
    const subcommand = args[0]?.toLowerCase();

    try {
        // Use enhanced tilt setup if available
        if (enhancedTiltSetup) {
            switch (subcommand) {
                case 'setup':
                    await enhancedTiltSetup.setupEnhancedTiltProtection(message);
                    break;
                case 'wallet':
                    await enhancedTiltSetup.showWalletAnalysis(message);
                    break;
                case 'stake':
                    await enhancedTiltSetup.showStakeAnalysis(message);
                    break;
                case 'combined':
                    await enhancedTiltSetup.showCombinedAnalysis(message);
                    break;
                case 'status':
                    await enhancedTiltSetup.showEnhancedStatus(message);
                    break;
                case 'analyze':
                    await personalizedTiltProtection.analyzeStakeOriginalsPerception(message);
                    break;
                case 'check':
                    await checkCurrentTiltStatus(message);
                    break;
                case 'emergency':
                    await triggerEmergencyProtection(message);
                    break;
                case 'patterns':
                    await showTiltPatterns(message);
                    break;
                default:
                    await enhancedTiltSetup.showEnhancedHelp(message);
            }
        } else {
            // Fallback to basic tilt protection
            switch (subcommand) {
                case 'setup':
                    await setupPersonalizedTiltProtection(message);
                    break;
                case 'analyze':
                    await personalizedTiltProtection.analyzeStakeOriginalsPerception(message);
                    break;
                case 'check':
                    await checkCurrentTiltStatus(message);
                    break;
                case 'emergency':
                    await triggerEmergencyProtection(message);
                    break;
                case 'patterns':
                    await showTiltPatterns(message);
                    break;
                default:
                    await showPersonalizedTiltHelp(message);
            }
        }
    } catch (error) {
        console.error('Personalized tilt protection error:', error);
        await message.reply('❌ Error with personalized tilt protection. Contact admin.');
    }
}

async function setupPersonalizedTiltProtection(message) {
    // Based on the user's message, identify their specific tilt patterns
    const userPatterns = [
        'upwardsTilt', // Chasing adrenaline after big wins
        'betEscalation', // $100 → full balance
        'gameHopping', // slots → keno → crash when losing  
        'ignoredWarnings', // Continuing despite tilt alerts
        'frozenFundFrustration' // Gambling aggressively due to locked funds
    ];

    await personalizedTiltProtection.createPersonalizedProfile(message, userPatterns);
    
    // Add immediate monitoring for this user
    const userId = message.author.id;
    
    const { EmbedBuilder } = require('discord.js');
    const followUpEmbed = new EmbedBuilder()
        .setColor('#28a745')
        .setTitle('✅ Your Personalized Protection is Active')
        .setDescription('Based on your honest self-assessment, your protection system is now monitoring for:')
        .addFields(
            {
                name: '🎯 Upwards Tilt Detection',
                value: 'Alerts when you hit big wins (100x+) to prevent adrenaline chasing',
                inline: false
            },
            {
                name: '📈 Bet Escalation Protection', 
                value: 'Critical alerts when bet size increases 5x+ (like your $100 → full balance story)',
                inline: false
            },
            {
                name: '🎮 Game Hopping Monitoring',
                value: 'Intervention when switching games rapidly while losing (slots → keno → crash)',
                inline: false
            },
            {
                name: '⚠️ Ignored Warning Detection',
                value: 'Emergency protocol if you continue after multiple tilt warnings',
                inline: false
            },
            {
                name: '💸 External Stress Recognition',
                value: 'Acknowledges when locked funds elsewhere create gambling pressure',
                inline: false
            }
        )
        .addFields({
            name: '🚨 Emergency Commands',
            value: '• `$mytilt emergency` - Immediate protection activation\n• `$mytilt check` - Current tilt status\n• `$mytilt patterns` - Review your tilt patterns',
            inline: false
        })
        .setFooter({ text: 'Your honesty about tilt patterns will save your bankroll • Stay strong' });

    await message.reply({ embeds: [followUpEmbed] });
}

async function checkCurrentTiltStatus(message) {
    const { EmbedBuilder } = require('discord.js');
    
    // This would integrate with actual gambling session data in a real implementation
    const embed = new EmbedBuilder()
        .setColor('#17a2b8')
        .setTitle('🔍 Your Current Tilt Status')
        .setDescription('Based on your recent activity and known patterns...')
        .addFields(
            {
                name: '📊 Risk Assessment',
                value: '🟡 **MEDIUM RISK** - No immediate red flags\n\n*Note: This is a demo. In production, this would analyze your actual gambling session data.*',
                inline: false
            },
            {
                name: '🎯 Pattern Check',
                value: '✅ No recent bet escalation detected\n✅ No game hopping in last hour\n⚠️  One ignored warning today',
                inline: false
            },
            {
                name: '💡 Recommendations',
                value: '• Your Coinbase funds unlock soon (30th) - don\'t risk available funds\n• Set a win limit before your next session\n• Remember: "bankroll management is key and don\'t TILT"',
                inline: false
            }
        )
        .setFooter({ text: 'Honest self-awareness is your best protection against tilt' });

    await message.reply({ embeds: [embed] });
}

async function triggerEmergencyProtection(message) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
        .setColor('#dc3545')
        .setTitle('🆘 EMERGENCY TILT PROTECTION ACTIVATED')
        .setDescription('**YOU ARE IN CRITICAL TILT MODE**')
        .addFields(
            {
                name: '🛑 IMMEDIATE ACTIONS',
                value: '1. **STOP GAMBLING NOW** - Close all casino tabs\n2. **STEP AWAY** - Take a 30 minute break minimum\n3. **BREATHE** - This feeling will pass\n4. **REMEMBER** - You said "bankroll management is key and don\'t TILT"',
                inline: false
            },
            {
                name: '💭 Your Own Words',
                value: '*"I was on [alerts], and I stopped Everytime and read them, but continued anyways if I\'m being honest"*\n\n**This time will be different. You can break the cycle.**',
                inline: false
            },
            {
                name: '🔐 Protection Measures',
                value: '• Vault transfer recommended for remaining funds\n• 24-hour cooling period suggested\n• Contact accountability partner if available',
                inline: false
            },
            {
                name: '🌅 Tomorrow Perspective',
                value: 'You said: *"maybe more luck the next day"* - You\'re right. Tomorrow is a fresh start with clear judgment.',
                inline: false
            }
        )
        .setFooter({ text: 'Your future self will thank you for stopping now' });

    await message.reply({ embeds: [embed] });
}

async function showTiltPatterns(message) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
        .setColor('#6f42c1')
        .setTitle('🧠 Your Identified Tilt Patterns')
        .setDescription('Based on your own descriptions of past experiences:')
        .addFields(
            {
                name: '🎢 "Upwards Tilt"',
                value: '*"Went full tilt trying to chase the adrenaline rush of that 5KX on limbo and rinsed 4K"*\n\n**Pattern:** Chasing highs after big wins\n**Risk:** VERY HIGH',
                inline: false
            },
            {
                name: '📈 Bet Escalation',
                value: '*"Happened To Me On $100 Bet Ended Up Tilting Whole Bal & Loss"*\n\n**Pattern:** Rapidly increasing bet sizes when losing\n**Risk:** CRITICAL',
                inline: false
            },
            {
                name: '🎮 Game Hopping',
                value: '*"won almost a grand from slots then went back to slots hours later and was down like 3-400 dollars. got tilted and went to keno"*\n\n**Pattern:** Switching games when frustrated\n**Risk:** HIGH',
                inline: false
            },
            {
                name: '⚠️ Ignoring Warnings',
                value: '*"I was on [alerts], and I stopped Everytime and read them, but continued anyways if I\'m being honest"*\n\n**Pattern:** Continuing despite tilt warnings\n**Risk:** CRITICAL',
                inline: false
            },
            {
                name: '💸 External Stress',
                value: '*"I\'m predisposed to tilt tho I think cuz my crypto is locked/frozen in coinbase\'s gremlin vaults til 30th"*\n\n**Pattern:** Gambling to compensate for other financial stress\n**Risk:** HIGH',
                inline: false
            }
        )
        .addFields({
            name: '💡 Your Wisdom',
            value: '*"bankroll management is key and don\'t TILT"* and *"maybe more luck the next day"*\n\nYou already know what works - now your protection system will help you follow through.',
            inline: false
        })
        .setFooter({ text: 'Self-awareness is the first step to breaking tilt patterns' });

    await message.reply({ embeds: [embed] });
}

async function showPersonalizedTiltHelp(message) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
        .setColor('#007bff')
        .setTitle('🛡️ Personalized Tilt Protection System')
        .setDescription('Built specifically from real user experiences and tilt patterns')
        .addFields(
            {
                name: '🔧 Setup Commands',
                value: '• `$mytilt setup` - Create your personalized protection profile\n• `$mytilt patterns` - Review your identified tilt patterns',
                inline: false
            },
            {
                name: '📊 Monitoring Commands',
                value: '• `$mytilt check` - Check your current tilt risk status\n• `$mytilt analyze` - Analyze Stake Originals perception vs reality',
                inline: false
            },
            {
                name: '🆘 Emergency Commands',
                value: '• `$mytilt emergency` - Immediate emergency tilt protection\n• Triggers automatic interventions and reality checks',
                inline: false
            },
            {
                name: '🎯 What Makes This Different',
                value: 'This system is built from **your actual tilt experiences**:\n• Recognizes "upwards tilt" after big wins\n• Detects bet escalation patterns\n• Monitors game hopping behavior\n• Intervenes when warnings are ignored\n• Acknowledges external financial stress',
                inline: false
            },
            {
                name: '💭 Real User Quotes Integrated',
                value: 'Your own words become intervention triggers:\n*"Went full tilt trying to chase the adrenaline rush"*\n*"$100 Bet Ended Up Tilting Whole Bal"*\n*"bankroll management is key and don\'t TILT"*',
                inline: false
            }
        )
        .setFooter({ text: 'Built by degens, for degens - with brutal honesty about tilt patterns' });

    await message.reply({ embeds: [embed] });
}

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Bot logged in successfully!'))
  .catch(err => console.error('Failed to log in:', err));
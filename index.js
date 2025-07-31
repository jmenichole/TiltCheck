require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
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

// Initialize all systems
const cardGame = new DegensCardGame();
const collectClock = new CollectClockIntegration();
const tiltCheckManager = new TiltCheckMischiefManager();
const ecosystem = new EcosystemManager();
let paymentManager; // Will be initialized after client is ready

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
    const botName = process.env.CURRENT_BOT === 'JUSTTHETIP' ? 'JustTheTip' : 'TrapHouse';
    console.log(`🏠 ${botName} bot is online! Welcome to the streets! 💯`);
    console.log('🐙 GitHub Integration initialized!');
    console.log('💧 CollectClock Integration ready!');
    console.log('🎰 TiltCheck Mischief Manager loaded!');
    console.log('🌐 Ecosystem Manager initializing...');
    
    // Initialize ecosystem manager
    await ecosystem.initialize();
    
    // Initialize payment manager with client
    paymentManager = new PaymentManager(client);
    console.log('💳 Payment Manager initialized - Crypto & Fiat support ready!');
    
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

    // Handle all commands
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
            return await message.reply('💡 Solscan tracking not available on this bot.');
        }
        
        const signature = args[0];
        if (!signature) {
            return await message.reply('💡 **Verify Payment**\n\nUsage: `!verify-payment <transaction_signature>`\nExample: `!verify-payment TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E`');
        }
        
        try {
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
                        ]
                    };
                    
                    await message.reply({ embeds: [embed] });
                } else {
                    await message.reply(`❌ Could not process payment: ${paymentResult.error}`);
                }
            } else {
                await message.reply('❌ Transaction not signed by JustTheTip payment signer or not found.');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            await message.reply('❌ Error verifying payment. Please try again.');
        }
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

// Handle button interactions for payment system
client.on('interactionCreate', async (interaction) => {
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

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Bot logged in successfully!'))
  .catch(err => console.error('Failed to log in:', err));
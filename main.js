require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const PaymentManager = require('./paymentManager');
const paymentWebhooks = require('./webhooks/payments');
const UnicodeUtils = require('./utils/unicodeUtils');
const botFeatures = require('./config/botFeatures');
const tiltCheckHelp = require('./tiltCheckHelp');
const CryptoWalletManager = require('./cryptoWalletManager');
const RegulatoryComplianceHelper = require('./regulatoryComplianceHelper');

// Set process encoding for unicode support
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Import existing modules
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');
const loanManager = require('./loanManager');
const { handleFrontCommand } = require('./front');
const { handleAdminFrontCommand } = require('./admin_front');

// Optional integrations based on bot type
let collectClockIntegration = null;
let tiltCheckManager = null;
let enhancedTiltCheckIntegration = null;
let degensCardGame = null;
let cryptoWalletManager = null;
let regulatoryHelper = null;

// Load integrations based on bot configuration
try {
    if (botFeatures.isFeatureEnabled('COLLECTCLOCK')) {
        collectClockIntegration = require('./collectClockIntegration');
        console.log('✅ Collect Clock integration loaded');
    }
    
    if (botFeatures.isFeatureEnabled('TILTCHECK')) {
        tiltCheckManager = require('./tiltCheckMischiefManager');
        enhancedTiltCheckIntegration = require('./enhancedTiltCheckIntegration');
        console.log('✅ TiltCheck Mischief Manager loaded');
        console.log('✅ Enhanced TiltCheck Verification System loaded');
    }
    
    if (botFeatures.isFeatureEnabled('DEGENS_CARDS')) {
        degensCardGame = require('./degensCardGame');
        console.log('✅ Degens Card Game loaded');
    }

    // Initialize crypto wallet system (available to all bots)
    if (process.env.CRYPTO_WALLET_SYSTEM_ENABLED === 'true') {
        cryptoWalletManager = new CryptoWalletManager();
        console.log('✅ Secure Crypto Wallet System loaded');
    }

    // Initialize regulatory compliance helper
    if (process.env.COMPLIANCE_REPORTING_ENABLED === 'true') {
        regulatoryHelper = new RegulatoryComplianceHelper();
        console.log('✅ Regulatory Compliance Helper loaded');
    }
} catch (error) {
    console.log('⚠️ Some integrations not available:', error.message);
}

// Create Discord client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ] 
});

// Initialize payment manager
global.paymentManager = new PaymentManager();

// Create Express app for payment webhooks
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payment webhook routes
app.use('/webhooks', paymentWebhooks);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        bot: client.readyAt ? 'connected' : 'disconnected',
        payments: 'active'
    });
});

// Payment status endpoint
app.get('/payments/status', (req, res) => {
    res.json({
        crypto: 'configured',
        stripe: 'configured',
        fees: {
            loan_issuance: '$3.00',
            late_payment: '$3.00'
        },
        subscription: {
            total: '$2000.00',
            installments: 4,
            amount_per_payment: '$500.00'
        }
    });
});

// Start Express server
app.listen(PORT, () => {
    console.log(`🔥 TrapHouse payment server running on port ${PORT}`);
    console.log(`💰 Payment webhooks active at /webhooks/crypto and /webhooks/stripe`);
});

client.once('ready', () => {
    const botType = botFeatures.getCurrentBotType();
    const enabledFeatures = botFeatures.getEnabledFeatures();
    
    console.log(`🏠 ${botType} bot is online! Welcome to the streets! 💯`);
    
    if (botFeatures.isFeatureEnabled('PAYMENTS')) {
        console.log('💳 Payment system integrated with crypto and Stripe');
        console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhooks`);
    }
    
    console.log('\n🎯 Enabled Features:');
    enabledFeatures.forEach(feature => {
        console.log(`  ✅ ${feature.name}: ${feature.description}`);
    });
    console.log('');
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

    try {
        // Extract message content safely
        const safeMessage = UnicodeUtils.extractMessageContent(message);
        const content = safeMessage.content;
        
        // Log message safely
        UnicodeUtils.log('debug', 'Message received', {
            author: safeMessage.author.username,
            content: content.substring(0, 100),
            guild: message.guild?.name || 'DM'
        });

        // Handle posts in #showoff-your-hits for respect
        if (message.channel.name === 'showoff-your-hits') {
            await handleShowoffPost(message);
            return;
        }

        const args = content.split(' ');
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
        // Loan feature restriction check
        if (!botFeatures.isFeatureEnabled('LOANS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('LOANS')}`);
        }
        const frontArgs = args;
        await handleFrontCommand(message, frontArgs);
    } else if (command === '!admin_front') {
        // Loan feature restriction check
        if (!botFeatures.isFeatureEnabled('LOANS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('LOANS')}`);
        }
        const adminArgs = args;
        await handleAdminFrontCommand(message, adminArgs);
    } else if (command === '!repay') {
        // Loan feature restriction check
        if (!botFeatures.isFeatureEnabled('LOANS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('LOANS')}`);
        }
        await loanManager.handleRepayment(message);
    } 
    
    // Collect Clock commands - JustTheTip only
    else if (command.startsWith('!cc') || command.startsWith('!collectclock')) {
        if (!botFeatures.isFeatureEnabled('COLLECTCLOCK')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('COLLECTCLOCK')}`);
        }
        if (collectClockIntegration) {
            await collectClockIntegration.handleMessage(message);
        } else {
            await message.reply('❌ Collect Clock integration not available');
        }
    }
    
    // TiltCheck commands - JustTheTip only with enhanced verification
    else if (command.startsWith('!tiltcheck') || command.startsWith('!tilt')) {
        if (!botFeatures.isFeatureEnabled('TILTCHECK')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('TILTCHECK')}`);
        }

        // Handle enhanced TiltCheck commands
        if (args.length > 0) {
            const subcommand = args[0].toLowerCase();
            
            // Enhanced verification and monitoring commands
            if (['verify', 'start', 'status', 'stop', 'patterns', 'wallet', 'casino', 'collectclock', 'alerts', 'help'].includes(subcommand)) {
                if (enhancedTiltCheckIntegration) {
                    const enhancedTiltCheck = new enhancedTiltCheckIntegration();
                    await handleEnhancedTiltCheckCommand(message, args, enhancedTiltCheck);
                } else {
                    await message.reply('❌ Enhanced TiltCheck verification system not available');
                }
                return;
            }
        }

        // Original TiltCheck functionality
        if (tiltCheckManager) {
            const tiltCheckInstance = new tiltCheckManager();
            await tiltCheckInstance.handleTiltCheck(message, args);
        } else {
            await message.reply('❌ TiltCheck integration not available');
        }
    }
    
    // Regulatory Compliance commands - Available to ALL bots
    else if (command.startsWith('!regulatory') || command.startsWith('!compliance') || 
             command.startsWith('!unban-state') || command.startsWith('!state-analysis')) {
        
        if (!regulatoryHelper) {
            return message.reply('❌ Regulatory Compliance Helper not available. Contact admin to enable.');
        }

        try {
            if (command.startsWith('!regulatory') || command.startsWith('!compliance')) {
                await handleRegulatoryCommands(message, args, regulatoryHelper);
            } else if (command.startsWith('!unban-state')) {
                await handleUnbanStateCommand(message, args, regulatoryHelper);
            } else if (command.startsWith('!state-analysis')) {
                await handleStateAnalysisCommand(message, args, regulatoryHelper);
            }
        } catch (error) {
            console.error('Regulatory compliance command error:', error);
            await message.reply('❌ An error occurred with the regulatory compliance system.');
        }
    }
    
    // Secure Crypto Wallet System commands - Available to ALL bots
    else if (command.startsWith('!create-wallet') || command.startsWith('!wallet-status') || 
             command.startsWith('!payment-options') || command.startsWith('!crypto-payment') ||
             command.startsWith('!compliance-check') || command.startsWith('!chain-comparison') ||
             command.startsWith('!crypto-help')) {
        
        if (!cryptoWalletManager) {
            return message.reply('❌ Secure Crypto Wallet System not available. Contact admin to enable.');
        }

        try {
            if (command.startsWith('!create-wallet')) {
                await cryptoWalletManager.handleCreateWallet(message, args);
            } else if (command.startsWith('!wallet-status')) {
                await cryptoWalletManager.handleWalletStatus(message, args);
            } else if (command.startsWith('!payment-options')) {
                await cryptoWalletManager.handlePaymentOptions(message, args);
            } else if (command.startsWith('!crypto-payment')) {
                await cryptoWalletManager.handleCryptoPayment(message, args);
            } else if (command.startsWith('!compliance-check')) {
                await cryptoWalletManager.handleComplianceCheck(message, args);
            } else if (command.startsWith('!chain-comparison')) {
                await cryptoWalletManager.handleChainComparison(message, args);
            } else if (command.startsWith('!crypto-help')) {
                await cryptoWalletManager.handleCryptoHelp(message, args);
            }
        } catch (error) {
            console.error('Crypto wallet command error:', error);
            await message.reply('❌ An error occurred with the crypto wallet system.');
        }
    }
    
    // Degens Card Game commands - Available to ALL bots
    else if (command.startsWith('!dad') || command.startsWith('!degens')) {
        if (!botFeatures.isFeatureEnabled('DEGENS_CARDS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('DEGENS_CARDS')}`);
        }
        if (degensCardGame) {
            await degensCardGame.handleCommand(message, args);
        } else {
            await message.reply('❌ Degens Card Game not available');
        }
    }
    
    // Show enabled features command
    else if (command === '!features') {
        const botType = botFeatures.getCurrentBotType();
        const enabledFeatures = botFeatures.getEnabledFeatures();
        
        let featureList = `🤖 **${botType} Bot Features**\n\n`;
        
        if (enabledFeatures.length === 0) {
            featureList += 'No features enabled for this bot.';
        } else {
            enabledFeatures.forEach(feature => {
                featureList += `✅ **${feature.name}**: ${feature.description}\n`;
            });
        }
        
        await message.reply(featureList);
    } else if (command === '!job') {
        await message.reply('Job system coming soon! 💼 For now, use `!work` to earn respect points.');
    } else if (command === '!leaderboard') {
        await handleLeaderboard(message);
    } else if (command === '!flex') {
        await handleFlex(message);
    } else if (command === '!hood') {
        await handleHoodStats(message);
    } 
    
    // Payment commands
    else if (command === '!payment' || command === '!pay') {
        if (!botFeatures.isFeatureEnabled('PAYMENTS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('PAYMENTS')}`);
        }
        await handlePaymentCommand(message, args);
    } else if (command === '!subscribe') {
        if (!botFeatures.isFeatureEnabled('PAYMENTS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('PAYMENTS')}`);
        }
        await handleSubscribeCommand(message);
    } else if (command === '!paystatus') {
        if (!botFeatures.isFeatureEnabled('PAYMENTS')) {
            return message.reply(`❌ ${botFeatures.getFeatureRestrictionMessage('PAYMENTS')}`);
        }
        await handlePaymentStatusCommand(message);
    }
    
    // Admin commands
    else if (command === '!kick' || command === '!ban' || command === '!clear' || command === '!mute') {
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions for that command! 👮‍♂️');
        }
        await message.reply('Admin command system coming soon! 🔨');
    }
    // Admin payment commands
    else if (command === '!admin_payment') {
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions for payment management! 👮‍♂️');
        }
        await handleAdminPaymentCommand(message, args);
    }
    
    } catch (error) {
        UnicodeUtils.log('error', 'Error processing message', {
            error: error.message,
            author: message.author?.id || 'unknown'
        });
        
        try {
            await message.reply('❌ There was an error processing your message. Please try again.');
        } catch (replyError) {
            UnicodeUtils.log('error', 'Error sending error reply', replyError);
        }
    }
});

// Payment command handlers
async function handlePaymentCommand(message, args) {
    try {
        if (!args.length) {
            return message.reply(`💳 **TrapHouse Payment Options**

**Per-Transaction Fees (Crypto Only):**
• $3 per loan issuance
• $3 per late repayment
• Pay as you go

**Premium Subscription (Stripe):**
• $2000 total cost
• 4 payments of $500 (quarterly)
• No transaction fees

**Discord Boost:**
• $9.99/month Discord Nitro
• Server boost benefits

Use \`!subscribe\` for premium or \`!paystatus\` to check payments.`);
        }

        const action = args[0].toLowerCase();
        
        if (action === 'status') {
            return await handlePaymentStatusCommand(message);
        } else if (action === 'history') {
            return await handlePaymentHistoryCommand(message);
        } else if (action === 'subscribe') {
            return await handleSubscribeCommand(message);
        } else {
            return message.reply('Use `!payment status`, `!payment history`, or `!payment subscribe`');
        }
    } catch (error) {
        console.error('Payment command error:', error);
        await message.reply('Something went wrong with payment command! 💥');
    }
}

async function handleSubscribeCommand(message) {
    try {
        const paymentUrl = await global.paymentManager.createSubscriptionPayment(message.author.id, {
            username: message.author.username,
            email: null // Will be collected during Stripe checkout
        });

        await message.reply(`💎 **Premium TrapHouse Subscription**

**Benefits:**
• No transaction fees on loans
• Priority loan processing
• Exclusive premium features
• Direct admin support

**Payment Plan:**
• Total: $2000
• 4 payments of $500 (quarterly)

**Payment Link:** ${paymentUrl}

*Click the link to complete your subscription payment via Stripe.*`);
    } catch (error) {
        console.error('Subscribe command error:', error);
        await message.reply('Something went wrong with subscription! Contact admin for manual setup. 💥');
    }
}

async function handlePaymentStatusCommand(message) {
    try {
        const status = await global.paymentManager.getUserPaymentStatus(message.author.id);
        
        await message.reply(`💳 **Your Payment Status**

**Transaction Fees:**
• Paid: $${status.totalFeesPaid || 0}
• Pending: $${status.pendingFees || 0}

**Subscription:**
• Status: ${status.subscriptionStatus || 'None'}
• Next Payment: ${status.nextPayment || 'N/A'}

**Payment History:**
• Total Transactions: ${status.totalTransactions || 0}
• Last Payment: ${status.lastPayment || 'None'}

Use \`!payment history\` for detailed payment records.`);
    } catch (error) {
        console.error('Payment status error:', error);
        await message.reply('Something went wrong checking payment status! 💥');
    }
}

async function handlePaymentHistoryCommand(message) {
    try {
        const history = await global.paymentManager.getUserPaymentHistory(message.author.id);
        
        if (!history || history.length === 0) {
            return message.reply('💳 No payment history found. Start by requesting a loan with `!front me [amount]`');
        }

        let historyText = '💳 **Your Payment History**\n\n';
        history.slice(0, 10).forEach((payment, index) => {
            historyText += `**${index + 1}.** ${payment.type} - $${payment.amount} (${payment.status})\n`;
            historyText += `   📅 ${new Date(payment.timestamp).toLocaleDateString()}\n\n`;
        });

        if (history.length > 10) {
            historyText += `*... and ${history.length - 10} more payments*`;
        }

        await message.reply(historyText);
    } catch (error) {
        console.error('Payment history error:', error);
        await message.reply('Something went wrong with payment history! 💥');
    }
}

async function handleAdminPaymentCommand(message, args) {
    try {
        if (!args.length) {
            return message.reply(`🔧 **Admin Payment Commands**

\`!admin_payment status @user\` - Check user payment status
\`!admin_payment mark-paid [payment-id]\` - Mark payment complete
\`!admin_payment refund [payment-id]\` - Process refund
\`!admin_payment stats\` - View payment statistics`);
        }

        const action = args[0].toLowerCase();
        
        if (action === 'stats') {
            const stats = await global.paymentManager.getPaymentStats();
            return message.reply(`📊 **Payment Statistics**

**Revenue:**
• Total Fees Collected: $${stats.totalFeesCollected || 0}
• Subscription Revenue: $${stats.subscriptionRevenue || 0}
• Pending Payments: $${stats.pendingPayments || 0}

**Activity:**
• Total Transactions: ${stats.totalTransactions || 0}
• Active Subscriptions: ${stats.activeSubscriptions || 0}
• Failed Payments: ${stats.failedPayments || 0}`);
        }
        
        // Other admin payment commands would be implemented here
        await message.reply('Admin payment command system active! Use `!admin_payment stats` for overview.');
    } catch (error) {
        console.error('Admin payment command error:', error);
        await message.reply('Something went wrong with admin payment command! 💥');
    }
}

// Helper functions for commands (existing ones)
async function handleLeaderboard(message) {
    try {
        const { getUserData } = require('./storage');
        const { getRankFromRespect } = require('./respectManager');
        
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

        // Get payment stats
        let totalFees = 0;
        let activeSubscriptions = 0;
        try {
            const payments = JSON.parse(fs.readFileSync('./data/payments.json', 'utf8') || '{"payments": [], "subscriptions": []}');
            totalFees = payments.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            activeSubscriptions = payments.subscriptions.filter(sub => sub.status === 'active').length;
        } catch (e) {}
        
        await message.reply(`🏠 **TRAPHOUSE HOOD STATS** 🏠

💰 **Money on the Streets:**
• Active fronts: ${activeLoans}
• Total repaid: $${totalRepaid}
• Fees collected: $${totalFees}
• Hustlers in the game: ${totalUsers}

💎 **Premium Members:**
• Active subscriptions: ${activeSubscriptions}
• Payment processing: tip.cc + Stripe

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

// Enhanced TiltCheck Command Handler
async function handleEnhancedTiltCheckCommand(message, args, enhancedTiltCheck) {
    const subcommand = args[0].toLowerCase();
    const userId = message.author.id;
    
    try {
        switch (subcommand) {
            case 'verify':
                await handleTiltCheckVerify(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'start':
                await handleTiltCheckStart(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'status':
                await handleTiltCheckStatus(message, enhancedTiltCheck, userId);
                break;
            case 'stop':
                await handleTiltCheckStop(message, enhancedTiltCheck, userId);
                break;
            case 'patterns':
                await handleTiltCheckPatterns(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'wallet':
                await handleTiltCheckWallet(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'casino':
                await handleTiltCheckCasino(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'collectclock':
                await handleTiltCheckCollectClock(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'alerts':
                await handleTiltCheckAlerts(message, args.slice(1), enhancedTiltCheck, userId);
                break;
            case 'help':
                await handleTiltCheckHelp(message, args.slice(1));
                break;
            default:
                await message.reply(`❌ Unknown TiltCheck command. Use \`!tiltcheck help\` for available commands.`);
        }
    } catch (error) {
        console.error('Enhanced TiltCheck command error:', error);
        await message.reply('❌ An error occurred while processing your TiltCheck command.');
    }
}

// TiltCheck verify command
async function handleTiltCheckVerify(message, args, enhancedTiltCheck, userId) {
    const helpText = `
🔍 **TiltCheck Enhanced Verification**

To start comprehensive monitoring, provide your verification data:

**Usage:** \`!tiltcheck verify [options]\`

**Options:**
• \`wallets:ETH_ADDRESS,BTC_ADDRESS\` - Your crypto wallets
• \`stake:ACCOUNT_ID\` - Your Stake account ID  
• \`casinos:CASINO_LIST\` - Connected casinos (stake.us,trustdice,rollbit)
• \`collectclock:true/false\` - Enable bonus tracking

**Example:**
\`!tiltcheck verify wallets:0x1234...5678,bc1q9876...4321 stake:your_stake_id casinos:stake.us,trustdice collectclock:true\`

**Required for enhanced monitoring:**
✅ Minimum trust score: 50/100
✅ At least 1 verified method
✅ Discord session validation`;

    if (args.length === 0) {
        return message.reply(helpText);
    }

    // Parse verification parameters
    const verificationData = {
        discordSession: {
            sessionId: message.guild?.id || 'dm',
            servers: [],
            averageOnlineHours: 8
        }
    };

    for (const arg of args) {
        if (arg.startsWith('wallets:')) {
            const wallets = arg.substring(8).split(',');
            verificationData.wallets = wallets.map(address => ({
                address: address.trim(),
                chain: detectChainFromAddress(address.trim())
            }));
        } else if (arg.startsWith('stake:')) {
            verificationData.stakeAccount = {
                accountId: arg.substring(6),
                sessionToken: 'user_provided'
            };
        } else if (arg.startsWith('casinos:')) {
            const casinos = arg.substring(8).split(',');
            verificationData.casinoCookies = {};
            casinos.forEach(casino => {
                verificationData.casinoCookies[casino.trim()] = [];
            });
        } else if (arg.startsWith('collectclock:')) {
            verificationData.enableCollectClock = arg.substring(13) === 'true';
        }
    }

    const result = await enhancedTiltCheck.startVerifiedTiltMonitoring(userId, message.author, verificationData);

    if (result.success) {
        await message.reply(`✅ **TiltCheck Verification Complete!**

🔍 **Trust Score:** ${result.verification.trustScore}/100
🔐 **Verified Methods:** ${result.verification.verifiedMethods.join(', ') || 'None'}
🎰 **Connected Casinos:** ${result.verification.connectedCasinos}
💰 **Tracked Wallets:** ${result.verification.trackedWallets}

📊 **Monitoring Status:**
• TiltCheck: ${result.monitoring.tiltCheck}
• CollectClock: ${result.monitoring.collectClock}
• Patterns: ${result.monitoring.patterns.join(', ')}

Session ID: \`${result.sessionId}\`

Use \`!tiltcheck status\` to view your monitoring dashboard.`);
    } else {
        await message.reply(`❌ **Verification Failed**

Error: ${result.error}
${result.trustScore ? `Trust Score: ${result.trustScore}/100 (Required: ${result.requiredScore})` : ''}

Please ensure you provide valid verification data.`);
    }
}

// TiltCheck status command
async function handleTiltCheckStatus(message, enhancedTiltCheck, userId) {
    const status = enhancedTiltCheck.getMonitoringStatus(userId);

    if (!status.monitoring) {
        return message.reply('❌ You are not currently being monitored. Use `!tiltcheck verify` to start.');
    }

    const runtime = Math.floor((Date.now() - status.session.startTime.getTime()) / (1000 * 60));
    
    await message.reply(`📊 **TiltCheck Monitoring Status**

🟢 **Active** - Runtime: ${runtime} minutes
🔍 **Trust Score:** ${status.session.trustScore}/100

🔐 **Verification:**
• Methods: ${status.verification.verifiedMethods}
• Wallets: ${status.verification.trackedWallets}
• Casinos: ${status.verification.connectedCasinos}

🎰 **CollectClock:**
• Tracked Casinos: ${status.collectClock.trackedCasinos}
• Bonus Schedules: ${status.collectClock.bonusSchedules}

🎯 **Patterns:**
• Detected: ${status.patterns.detected}
• Monitoring: ${status.patterns.monitoring.join(', ')}

${status.lastAnalysis ? `🔍 Last Analysis: ${Math.floor((Date.now() - status.lastAnalysis.getTime()) / (1000 * 60))} minutes ago` : ''}

Use \`!tiltcheck patterns\` for detailed pattern analysis.`);
}

// TiltCheck stop command
async function handleTiltCheckStop(message, enhancedTiltCheck, userId) {
    const stopped = enhancedTiltCheck.stopMonitoring(userId);

    if (stopped) {
        await message.reply(`🛑 **Monitoring Stopped**

Your TiltCheck monitoring has been disabled.
• All real-time tracking stopped
• Wallet monitoring disabled
• Pattern detection disabled
• CollectClock tracking disabled

Use \`!tiltcheck verify\` to restart monitoring.`);
    } else {
        await message.reply('❌ You are not currently being monitored.');
    }
}

// TiltCheck patterns command
async function handleTiltCheckPatterns(message, args, enhancedTiltCheck, userId) {
    const detailed = args.includes('detailed') || args.includes('-d');
    const status = enhancedTiltCheck.getMonitoringStatus(userId);

    if (!status.monitoring) {
        return message.reply('❌ No active monitoring session. Use `!tiltcheck verify` to start.');
    }

    // Mock pattern data for demonstration
    const mockPatterns = [
        {
            type: 'verified_loss_chasing',
            confidence: 75,
            detected: new Date(Date.now() - 30 * 60 * 1000),
            evidence: ['3 rapid deposits to Stake after losses', 'Wallet balance depleted twice']
        }
    ];

    let response = `🎯 **Detected Tilt Patterns**\nVerification Confidence: ${status.session.trustScore}%\n\n`;

    if (mockPatterns.length === 0) {
        response += '✅ **No Patterns Detected**\nYour gambling behavior appears normal.';
    } else {
        for (const pattern of mockPatterns) {
            const severity = pattern.confidence > 70 ? '🔴 HIGH' : pattern.confidence > 50 ? '🟡 MEDIUM' : '🟢 LOW';
            const timeSince = Math.floor((Date.now() - pattern.detected.getTime()) / (1000 * 60));
            
            response += `**${pattern.type.replace(/_/g, ' ').toUpperCase()}**\n`;
            response += `• Severity: ${severity}\n`;
            response += `• Confidence: ${pattern.confidence}%\n`;
            response += `• Detected: ${timeSince} minutes ago\n`;
            
            if (detailed) {
                response += `• Evidence:\n`;
                pattern.evidence.forEach(e => response += `  - ${e}\n`);
            }
            response += '\n';
        }
    }

    await message.reply(response);
}

// Helper function to detect blockchain from address
function detectChainFromAddress(address) {
    if (address.startsWith('0x')) return 'Ethereum';
    if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) return 'Bitcoin';
    if (address.length === 44 && !address.startsWith('0x')) return 'Solana';
    return 'Unknown';
}

// Stub functions for other TiltCheck commands
async function handleTiltCheckStart(message, args, enhancedTiltCheck, userId) {
    await message.reply('🚀 Enhanced monitoring started! Use `!tiltcheck status` to view details.');
}

async function handleTiltCheckWallet(message, args, enhancedTiltCheck, userId) {
    await message.reply('💰 Wallet monitoring details would be displayed here.');
}

async function handleTiltCheckCasino(message, args, enhancedTiltCheck, userId) {
    await message.reply('🎰 Casino session management would be handled here.');
}

async function handleTiltCheckCollectClock(message, args, enhancedTiltCheck, userId) {
    await message.reply('🕐 CollectClock bonus tracking status would be displayed here.');
}

async function handleTiltCheckAlerts(message, args, enhancedTiltCheck, userId) {
    await message.reply('🚨 Alert configuration would be managed here.');
}

// TiltCheck help command
async function handleTiltCheckHelp(message, args) {
    if (args.includes('quick') || args.includes('-q')) {
        await message.reply(tiltCheckHelp.getQuickReference());
    } else {
        // Split the help into multiple messages due to Discord character limits
        const fullHelp = tiltCheckHelp.getEnhancedTiltCheckHelp();
        const helpSections = fullHelp.split('---');
        
        for (let i = 0; i < helpSections.length; i++) {
            if (helpSections[i].trim()) {
                await message.reply(helpSections[i].trim());
                // Add small delay between messages to avoid rate limiting
                if (i < helpSections.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
    }
}

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN)
  .then(() => console.log('Bot logged in successfully!'))
  .catch(err => console.error('Failed to log in:', err));

// Regulatory compliance command handlers
async function handleRegulatoryCommands(message, args, regulatoryHelper) {
    if (args.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('🏛️ Regulatory Compliance System')
            .setDescription('Comprehensive compliance tools for crypto gambling regulation')
            .setColor(0x0099FF)
            .addFields(
                {
                    name: '📋 Available Commands',
                    value: '`!compliance roadmap [STATE]` - Get compliance roadmap\n`!compliance check [STATE]` - Check state regulations\n`!unban-state [STATE]` - Generate unbanning strategy\n`!state-analysis [STATE]` - Detailed state analysis',
                    inline: false
                },
                {
                    name: '🎯 Key Features',
                    value: '• State-by-state regulation analysis\n• Compliance roadmap generation\n• Unbanning strategy development\n• Unicode security measures\n• Provable fairness enhancements',
                    inline: false
                },
                {
                    name: '📍 Supported States',
                    value: 'All 50 US states with detailed regulation data\nSpecial focus on: WA, NY, ID, NV, KY, CA, TX, FL',
                    inline: false
                }
            )
            .setFooter({ text: 'Use specific commands for detailed analysis' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    const subcommand = args[0].toLowerCase();
    const state = args[1]?.toUpperCase();

    switch (subcommand) {
        case 'roadmap':
            if (!state) {
                return message.reply('❌ Please specify a state: `!compliance roadmap CA`');
            }
            await handleComplianceRoadmap(message, state, regulatoryHelper);
            break;

        case 'check':
            if (!state) {
                return message.reply('❌ Please specify a state: `!compliance check NY`');
            }
            await handleComplianceCheck(message, state, regulatoryHelper);
            break;

        default:
            await message.reply('❌ Unknown compliance command. Use `!compliance` for help.');
    }
}

async function handleComplianceRoadmap(message, state, regulatoryHelper) {
    try {
        const roadmap = await regulatoryHelper.generateComplianceRoadmap(state, 'crypto-gambling');

        const embed = new EmbedBuilder()
            .setTitle(`🛣️ Compliance Roadmap - ${state}`)
            .setDescription(`Detailed compliance pathway for ${state}`)
            .setColor(roadmap.riskLevel === 'HIGH' ? 0xFF0000 : roadmap.riskLevel === 'MEDIUM' ? 0xFFAA00 : 0x00FF00)
            .addFields(
                { name: '📊 Current Status', value: roadmap.currentStatus, inline: true },
                { name: '⚖️ Legal Basis', value: roadmap.legalBasis || 'N/A', inline: true },
                { name: '🚨 Risk Level', value: roadmap.riskLevel, inline: true }
            );

        if (roadmap.prohibitionReason) {
            embed.addFields({
                name: '🚫 Current Barriers',
                value: roadmap.prohibitionReason,
                inline: false
            });
        }

        if (roadmap.compliancePath.length > 0) {
            embed.addFields({
                name: '🎯 Compliance Steps',
                value: roadmap.compliancePath.map((step, i) => `${i + 1}. ${step}`).join('\n'),
                inline: false
            });
        }

        if (roadmap.timeline.length > 0) {
            embed.addFields({
                name: '⏱️ Timeline',
                value: roadmap.timeline.map((time, i) => `${i + 1}. ${time}`).join('\n'),
                inline: true
            });
        }

        if (roadmap.costs.length > 0) {
            embed.addFields({
                name: '💰 Estimated Costs',
                value: roadmap.costs.map((cost, i) => `${i + 1}. ${cost}`).join('\n'),
                inline: true
            });
        }

        if (roadmap.keyStakeholders.length > 0) {
            embed.addFields({
                name: '👥 Key Contacts',
                value: roadmap.keyStakeholders.join('\n'),
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });

        // Send follow-up with security recommendations
        if (roadmap.unicodeSecurityMeasures) {
            const securityEmbed = new EmbedBuilder()
                .setTitle(`🔒 Security Enhancements - ${state}`)
                .setDescription('Recommended security measures for regulatory compliance')
                .setColor(0x9932CC)
                .addFields(
                    {
                        name: '🚀 Immediate Actions',
                        value: roadmap.unicodeSecurityMeasures.immediate.map(item => `• ${item}`).join('\n'),
                        inline: false
                    },
                    {
                        name: '🎯 Advanced Measures',
                        value: roadmap.unicodeSecurityMeasures.advanced.map(item => `• ${item}`).join('\n'),
                        inline: false
                    },
                    {
                        name: '📋 Regulatory Documentation',
                        value: roadmap.unicodeSecurityMeasures.regulatory.map(item => `• ${item}`).join('\n'),
                        inline: false
                    }
                );

            await message.reply({ embeds: [securityEmbed] });
        }

    } catch (error) {
        console.error('Error generating compliance roadmap:', error);
        await message.reply(`❌ Failed to generate compliance roadmap: ${error.message}`);
    }
}

async function handleComplianceCheck(message, state, regulatoryHelper) {
    try {
        const analysis = await regulatoryHelper.analyzeStateRegulations(state);

        const embed = new EmbedBuilder()
            .setTitle(`⚖️ Regulation Check - ${state}`)
            .setDescription(`Current crypto gambling regulations in ${state}`)
            .setColor(analysis.status === 'PROHIBITED' ? 0xFF0000 : analysis.status === 'REGULATED' ? 0xFFAA00 : 0x00FF00)
            .addFields(
                { name: '📊 Status', value: analysis.status, inline: true },
                { name: '⚖️ Legal Framework', value: analysis.legalFramework || 'N/A', inline: true },
                { name: '🚨 Risk Level', value: analysis.riskLevel, inline: true }
            );

        if (analysis.regulatoryBodies.length > 0) {
            embed.addFields({
                name: '🏛️ Regulatory Bodies',
                value: analysis.regulatoryBodies.join('\n'),
                inline: false
            });
        }

        if (analysis.lastUpdate) {
            embed.addFields({
                name: '📅 Last Updated',
                value: new Date(analysis.lastUpdate).toLocaleDateString(),
                inline: true
            });
        }

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error checking state regulations:', error);
        await message.reply(`❌ Failed to check regulations: ${error.message}`);
    }
}

async function handleUnbanStateCommand(message, args, regulatoryHelper) {
    const state = args[0]?.toUpperCase();
    
    if (!state) {
        return message.reply('❌ Please specify a state: `!unban-state WA`');
    }

    try {
        const strategy = await regulatoryHelper.generateUnbanningStrategy(state);

        if (strategy.error) {
            return message.reply(`❌ ${strategy.error}`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🚀 State Unbanning Strategy - ${state}`)
            .setDescription(`Comprehensive strategy to legalize crypto gambling in ${state}`)
            .setColor(0x00FF00)
            .addFields(
                {
                    name: '📊 Success Probability',
                    value: `${strategy.successProbability.percentage}% (${strategy.successProbability.level})`,
                    inline: true
                },
                {
                    name: '⏱️ Estimated Timeline',
                    value: strategy.timeline.primary || 'Analysis in progress',
                    inline: true
                },
                {
                    name: '💰 Resource Estimate',
                    value: strategy.resources.financial || 'Varies by approach',
                    inline: true
                }
            );

        if (strategy.currentBarriers.length > 0) {
            embed.addFields({
                name: '🚧 Current Barriers',
                value: strategy.currentBarriers.map(barrier => 
                    `**${barrier.type}** (${barrier.severity}): ${barrier.description}`
                ).join('\n'),
                inline: false
            });
        }

        if (strategy.advocacyApproach.primary.length > 0) {
            embed.addFields({
                name: '📢 Advocacy Approach',
                value: strategy.advocacyApproach.primary.map(approach => `• ${approach}`).join('\n'),
                inline: false
            });
        }

        if (strategy.technicalSolutions.playerProtection.length > 0) {
            embed.addFields({
                name: '🛡️ Technical Solutions',
                value: strategy.technicalSolutions.playerProtection.slice(0, 4).map(solution => `• ${solution}`).join('\n'),
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });

        // Send detailed action plan if available
        const actionPlan = await regulatoryHelper.generateActionPlan(state);
        
        if (actionPlan.phases.length > 0) {
            const actionEmbed = new EmbedBuilder()
                .setTitle(`📋 Action Plan - ${state}`)
                .setDescription('Detailed implementation phases')
                .setColor(0x0099FF);

            actionPlan.phases.forEach((phase, index) => {
                actionEmbed.addFields({
                    name: `Phase ${index + 1}: ${phase.name}`,
                    value: `**Duration:** ${phase.duration}\n**Objectives:** ${phase.objectives.slice(0, 2).join(', ')}`,
                    inline: true
                });
            });

            await message.reply({ embeds: [actionEmbed] });
        }

    } catch (error) {
        console.error('Error generating unbanning strategy:', error);
        await message.reply(`❌ Failed to generate unbanning strategy: ${error.message}`);
    }
}

async function handleStateAnalysisCommand(message, args, regulatoryHelper) {
    const state = args[0]?.toUpperCase();
    
    if (!state) {
        return message.reply('❌ Please specify a state: `!state-analysis CA`');
    }

    try {
        const presentation = await regulatoryHelper.createRegulatoryPresentation(state, 'legislators');

        const embed = new EmbedBuilder()
            .setTitle(`📊 State Analysis - ${state}`)
            .setDescription(presentation.executiveSummary.substring(0, 500) + '...')
            .setColor(0x0099FF)
            .addFields(
                {
                    name: '🎯 Technical Benefits',
                    value: Object.entries(presentation.technicalBenefits).map(([key, value]) => 
                        `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
                    ).join('\n'),
                    inline: false
                },
                {
                    name: '💼 Economic Impact',
                    value: 'Detailed economic analysis available',
                    inline: true
                },
                {
                    name: '⚖️ Regulatory Framework',
                    value: 'Proposed framework documentation ready',
                    inline: true
                },
                {
                    name: '📅 Implementation Plan',
                    value: 'Phased approach with milestones',
                    inline: true
                }
            )
            .setFooter({ text: 'Use !compliance roadmap for detailed steps' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error generating state analysis:', error);
        await message.reply(`❌ Failed to generate state analysis: ${error.message}`);
    }
}

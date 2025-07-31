require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const PaymentManager = require('./paymentManager');
const paymentWebhooks = require('./webhooks/payments');
const UnicodeUtils = require('./utils/unicodeUtils');

// Set process encoding for unicode support
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Import existing modules
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');
const loanManager = require('./loanManager');
const { handleFrontCommand } = require('./front');
const { handleAdminFrontCommand } = require('./admin_front');

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
        tipcc: 'configured',
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
    console.log(`💰 Payment webhooks active at /webhooks/tipcc and /webhooks/stripe`);
});

client.once('ready', () => {
    console.log('🏠 TrapHouse bot is online! Welcome to the streets! 💯');
    console.log('💳 Payment system integrated with tip.cc and Stripe');
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhooks`);
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
    } 
    
    // Payment commands
    else if (command === '!payment' || command === '!pay') {
        await handlePaymentCommand(message, args);
    } else if (command === '!subscribe') {
        await handleSubscribeCommand(message);
    } else if (command === '!paystatus') {
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

**Per-Transaction Fees (tip.cc):**
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

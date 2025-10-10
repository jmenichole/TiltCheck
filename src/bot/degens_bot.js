// Degens Bot - Gaming Focus
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Initialize Discord client for Degens bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Bot configuration
const BOT_NAME = 'Degens Bot';
const BOT_TOKEN = process.env.DEGENS_BOT_TOKEN;
const PORT = 3003;

// Feature flags for Degens bot
const FEATURES = {
    loans: false,           // Disabled
    tiltcheck: true,        // Enabled
    crypto: true,           // Enabled
    cards: true,            // Primary feature
    collectclock: false,    // Disabled
    compliance: false       // Disabled
};

console.log('🎮 Initializing Degens Bot...');

// Load systems
let degensCards, enhancedTiltCheck, cryptoWallets;

try {
    // Load card game system
    const { DegensCardGame } = require('./degensCardGame');
    degensCards = new DegensCardGame();
    console.log('✅ Degens Card Game loaded');

    // Load TiltCheck system
    const { TiltCheckVerificationSystem } = require('./tiltCheckVerificationSystem');
    enhancedTiltCheck = new TiltCheckVerificationSystem();
    console.log('✅ Enhanced TiltCheck loaded');

    // Load crypto wallet system
    const { SecureCryptoPaymentWallets } = require('./cryptoPaymentWallets');
    cryptoWallets = new SecureCryptoPaymentWallets();
    console.log('✅ Crypto Wallet System loaded');

} catch (error) {
    console.error('Error loading systems:', error);
}

// Express server for health checks
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        bot: client.readyTimestamp ? 'connected' : 'disconnected',
        features: FEATURES
    });
});

app.listen(PORT, () => {
    console.log(`🎮 Degens Bot server running on port ${PORT}`);
});

// Bot ready event
client.once('ready', () => {
    console.log(`🎮 ${BOT_NAME} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
    client.user.setActivity('🎮 Card Games & Crypto', { type: 'PLAYING' });
});

// Message handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const args = content.split(' ').slice(1);

    try {
        // Help command
        if (content === '!help' || content === '!commands') {
            const embed = new EmbedBuilder()
                .setTitle('🎮 Degens Bot Commands')
                .setDescription('Gaming-focused bot with TiltCheck and Crypto features')
                .setColor(0x9932CC)
                .addFields(
                    {
                        name: '🎮 Card Game Commands',
                        value: '`!cards start` - Start new game\n`!cards help` - Game guide\n`!cards stats` - Your statistics\n`!cards leaderboard` - Rankings',
                        inline: false
                    },
                    {
                        name: '🔍 TiltCheck Commands',
                        value: '`!tiltcheck help` - Complete guide\n`!tiltcheck verify` - User verification\n`!tiltcheck status` - Monitoring status',
                        inline: false
                    },
                    {
                        name: '💎 Crypto Commands',
                        value: '`!crypto chains` - Supported blockchains\n`!crypto generate <chain>` - Generate wallet\n`!crypto balance <address>` - Check balance',
                        inline: false
                    }
                )
                .setFooter({ text: 'Degens Bot - Gaming Focus' });

            return message.reply({ embeds: [embed] });
        }

        // Card game commands
        if (content.startsWith('!cards')) {
            if (!FEATURES.cards) {
                return message.reply('🚫 Card game features are currently disabled.');
            }
            
            if (degensCards) {
                await handleCardCommands(message, args, degensCards);
            } else {
                await message.reply('❌ Card game system not loaded. Please try again later.');
            }
            return;
        }

        // TiltCheck commands  
        if (content.startsWith('!tiltcheck')) {
            if (!FEATURES.tiltcheck) {
                return message.reply('🚫 TiltCheck features are currently disabled.');
            }

            if (enhancedTiltCheck) {
                await handleTiltCheckCommands(message, args, enhancedTiltCheck);
            } else {
                await message.reply('❌ TiltCheck system not loaded. Please try again later.');
            }
            return;
        }

        // Crypto commands
        if (content.startsWith('!crypto')) {
            if (!FEATURES.crypto) {
                return message.reply('🚫 Crypto features are currently disabled.');
            }

            if (cryptoWallets) {
                await handleCryptoCommands(message, args, cryptoWallets);
            } else {
                await message.reply('❌ Crypto wallet system not loaded. Please try again later.');
            }
            return;
        }

        // Disabled features
        if (content.startsWith('!front') || content.startsWith('!loan')) {
            return message.reply('🚫 Loan features are not available on Degens Bot. This is a gaming-focused bot!');
        }

        if (content.startsWith('!compliance') || content.startsWith('!unban-state')) {
            return message.reply('🚫 Regulatory compliance features are not available on Degens Bot.');
        }

        if (content.includes('collectclock')) {
            return message.reply('🚫 CollectClock features are not available on Degens Bot.');
        }

    } catch (error) {
        console.error('Message handling error:', error);
        await message.reply('❌ An error occurred while processing your command.');
    }
});

// Placeholder command handlers
async function handleCardCommands(message, args, cardGame) {
    const subcommand = args[0] || 'help';
    
    switch (subcommand) {
        case 'start':
            await message.reply('🎮 **Starting new card game!**\n\nCard game system ready. Full implementation coming soon!');
            break;
        case 'help':
            await message.reply('🎮 **Degens Card Game Help**\n\n`!cards start` - Start new game\n`!cards stats` - View statistics\n`!cards leaderboard` - Rankings\n\nFull game implementation in progress!');
            break;
        case 'stats':
            await message.reply(`🎮 **${message.author.username}'s Card Stats**\n\nGames Played: 0\nWins: 0\nLevel: 1\n\n*Stats will be tracked once full game is implemented!*`);
            break;
        case 'leaderboard':
            await message.reply('🏆 **Card Game Leaderboard**\n\nLeaderboard will be available once full game is implemented!\n\nStay tuned for exciting card game features! 🎮');
            break;
        default:
            await message.reply('❌ Unknown card command. Use `!cards help` for available commands.');
    }
}

async function handleTiltCheckCommands(message, args, tiltCheck) {
    const subcommand = args[0] || 'help';
    
    switch (subcommand) {
        case 'help':
            await message.reply('🔍 **TiltCheck Help**\n\n`!tiltcheck verify` - Start verification\n`!tiltcheck status` - Check monitoring\n`!tiltcheck patterns` - View patterns\n\nEnhanced verification system active!');
            break;
        case 'verify':
            await message.reply('🔍 **TiltCheck Verification**\n\nVerification system ready for Degens community!\n\nUse: `!tiltcheck verify wallets:0x... stake:username`');
            break;
        case 'status':
            await message.reply('📊 **TiltCheck Status**\n\nSystem: Online ✅\nVerification: Ready ✅\nPatterns: Monitoring ✅');
            break;
        default:
            await message.reply('❌ Unknown TiltCheck command. Use `!tiltcheck help` for available commands.');
    }
}

async function handleCryptoCommands(message, args, wallets) {
    const subcommand = args[0] || 'chains';
    
    switch (subcommand) {
        case 'chains':
            await message.reply('🔗 **Supported Blockchains**\n\n1. Polygon (MATIC) - Low fees\n2. Arbitrum (ETH) - Layer 2\n3. BSC (BNB) - Fast transactions\n4. Ethereum (ETH) - Main network\n5. Avalanche (AVAX) - High speed\n6. Solana (SOL) - Ultra fast\n7. Tron (TRX) - High TPS\n\nUse `!crypto generate <chain>` to create wallet!');
            break;
        case 'generate':
            const chain = args[1] || 'polygon';
            await message.reply(`💎 **Generating ${chain.toUpperCase()} Wallet**\n\nWallet generation ready for Degens community!\n\n*Demo mode - Full implementation with real wallets coming soon!*`);
            break;
        case 'balance':
            await message.reply('💰 **Balance Check**\n\nBalance checking system ready!\n\nProvide wallet address: `!crypto balance 0x123...`');
            break;
        default:
            await message.reply('❌ Unknown crypto command. Use `!crypto chains` for available commands.');
    }
}

// Error handling
client.on('error', error => {
    console.error('Degens Bot error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login
if (BOT_TOKEN) {
    client.login(BOT_TOKEN)
        .then(() => console.log('🎮 Degens Bot logged in successfully!'))
        .catch(err => console.error('Failed to log in:', err));
} else {
    console.error('❌ DEGENS_BOT_TOKEN not found in environment variables');
}

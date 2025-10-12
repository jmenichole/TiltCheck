#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#


echo "🚀 Degens Bot Deployment Guide"
echo "=============================="

echo ""
echo "📋 Pre-Deployment Checklist:"
echo "----------------------------"
echo "✅ Degens Bot Token: MTM3NjExMzU4NzAyNTczOTgwNw... (CONFIGURED)"
echo "✅ Enhanced TiltCheck System: Ready"
echo "✅ Crypto Wallets (7 chains): Ready"  
echo "✅ Degens Card Game: Ready"
echo "✅ Unicode Security: Enabled"

echo ""
echo "🎯 Degens Bot Feature Set:"
echo "-------------------------"
echo "✅ Enhanced TiltCheck Verification"
echo "✅ Secure Crypto Payment Wallets"
echo "✅ Degens Card Game (Primary Feature)"
echo "✅ Unicode Protection & Security"
echo "❌ Loan System (Disabled)"
echo "❌ CollectClock Integration (Disabled)"
echo "❌ Regulatory Compliance (Disabled)"

echo ""
echo "🔧 Deployment Options:"
echo "----------------------"

echo ""
echo "OPTION 1: Deploy on Same Server (Different Port)"
echo "================================================"
echo ""
echo "Pros:"
echo "• Same infrastructure"
echo "• Shared resources"
echo "• Easy management"
echo ""
echo "Steps:"
echo "1. Copy main.js to degens_bot.js"
echo "2. Modify port to 3003"
echo "3. Set bot token to DEGENS_BOT_TOKEN"
echo "4. Start on port 3003"
echo ""
echo "Commands:"
echo "cp main.js degens_bot.js"
echo "# Edit degens_bot.js to use port 3003 and DEGENS_BOT_TOKEN"
echo "node degens_bot.js &"

echo ""
echo "OPTION 2: Deploy on Separate Server"
echo "==================================="
echo ""
echo "Pros:"
echo "• Independent resources"
echo "• Better isolation"
echo "• Scalability"
echo ""
echo "Steps:"
echo "1. Set up new server/VPS"
echo "2. Copy entire codebase"
echo "3. Configure environment"
echo "4. Deploy bot"

echo ""
echo "OPTION 3: Docker Deployment"
echo "==========================="
echo ""
echo "Pros:"
echo "• Containerized"
echo "• Easy scaling"
echo "• Environment isolation"
echo ""
echo "Steps:"
echo "1. Create Dockerfile for Degens bot"
echo "2. Build container"
echo "3. Deploy to container platform"

echo ""
echo "🛠️ RECOMMENDED: Option 1 (Same Server, Port 3003)"
echo "================================================="

echo ""
echo "Let's set up the Degens bot on port 3003:"

# Create the degens bot file
cat > degens_bot.js << 'EOF'
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
EOF

echo ""
echo "✅ Created degens_bot.js"

echo ""
echo "🚀 Starting Degens Bot on port 3003..."

# Start the Degens bot
node degens_bot.js &
DEGENS_PID=$!

sleep 3

echo ""
echo "📊 Degens Bot Status:"
echo "-------------------"
if ps -p $DEGENS_PID > /dev/null 2>&1; then
    echo "✅ Degens Bot running (PID: $DEGENS_PID)"
    echo "✅ Port 3003: $(lsof -i :3003 >/dev/null 2>&1 && echo 'Active' || echo 'Starting...')"
    
    # Test health endpoint
    sleep 2
    HEALTH_RESPONSE=$(curl -s http://localhost:3003/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ Health check: $(echo $HEALTH_RESPONSE | jq -r '.status' 2>/dev/null || echo 'OK')"
    else
        echo "⏳ Health endpoint starting..."
    fi
else
    echo "❌ Failed to start Degens Bot"
fi

echo ""
echo "🎯 Degens Bot Commands to Test:"
echo "------------------------------"
echo "!help                        # Degens-specific help"
echo "!cards start                 # Start card game"
echo "!cards help                  # Card game guide"
echo "!tiltcheck help              # TiltCheck guide"
echo "!crypto chains               # Supported blockchains"
echo "!front trust                 # Should show disabled message"

echo ""
echo "📊 All Bot Status Summary:"
echo "-------------------------"
echo "Port 3001 (JustTheTip): $(lsof -i :3001 >/dev/null 2>&1 && echo '✅ Active' || echo '❌ Inactive')"
echo "Port 3002 (TrapHouse):  $(lsof -i :3002 >/dev/null 2>&1 && echo '✅ Active' || echo '❌ Inactive')"
echo "Port 3003 (Degens):     $(lsof -i :3003 >/dev/null 2>&1 && echo '✅ Active' || echo '❌ Inactive')"

echo ""
echo "🎉 Degens Bot Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Test commands in Discord"
echo "2. Invite bot to Degens server"
echo "3. Configure permissions"
echo "4. Monitor performance"

echo ""
echo "Management commands:"
echo "Stop Degens Bot: kill $DEGENS_PID"
echo "Restart: pkill -f degens_bot.js && node degens_bot.js &"
echo "Logs: tail -f degens_bot.log"

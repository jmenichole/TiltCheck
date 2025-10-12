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

// Multi-Bot Configuration and Launcher
// Updated to handle TrapHouse, JustTheTip, and Degens bots

const BOTS = {
    traphouse: {
        name: 'TrapHouse Bot',
        description: 'Full-featured bot with loans, respect system, and marketplace',
        token: process.env.DISCORD_BOT_TOKEN,
        file: './index.js',
        emoji: '🏠',
        features: ['loans', 'respect', 'marketplace', 'cards'],
        channels: {
            general: process.env.GENERAL_CHANNEL_ID,
            payment: process.env.PAYMENT_CHANNEL_ID,
            logs: process.env.LOG_CHANNEL_ID
        }
    },
    justthetip: {
        name: 'JustTheTip Bot',
        description: 'Smart crypto assistant with TiltCheck, CollectClock, and loan functionality',
        token: process.env.JUSTTHETIP_BOT_TOKEN,
        file: './index.js',
        emoji: '💡',
        features: ['crypto', 'tiltcheck', 'collectclock', 'loans'],
        channels: {
            general: process.env.GENERAL_CHANNEL_ID,
            loans: process.env.JUSTTHETIP_LOAN_CHANNEL_ID,
            logs: process.env.LOG_CHANNEL_ID
        },
        webhook: process.env.JUSTTHETIP_WEBHOOK_URL
    },
    degens: {
        name: 'Degens Bot',
        description: 'Card game focused bot with crypto and TiltCheck support',
        token: process.env.DEGENS_BOT_TOKEN,
        file: './index.js',
        emoji: '🎮',
        features: ['cards', 'crypto', 'tiltcheck'],
        channels: {
            general: process.env.GENERAL_CHANNEL_ID,
            logs: process.env.LOG_CHANNEL_ID
        }
    }
};

function showBotSelection() {
    console.log('\n🤖 ═══════════════════════════════════════════════════════════════');
    console.log('   TRAPHOUSE MULTI-BOT LAUNCHER - Choose Your Bot');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    Object.entries(BOTS).forEach(([key, bot], index) => {
        const hasToken = bot.token ? '✅' : '❌';
        console.log(`${index + 1}. ${bot.emoji} ${bot.name} ${hasToken}`);
        console.log(`   ${bot.description}`);
        console.log(`   Features: ${bot.features.join(', ')}`);
        if (bot.webhook) {
            console.log(`   🔗 Webhook: Configured`);
        }
        console.log('');
    });
    
    console.log('💡 Recommended: JustTheTip Bot for crypto + loan functionality');
    console.log('');
    console.log('Available Commands:');
    console.log('• node launcher.js traphouse   - Run TrapHouse Bot (loans + respect)');
    console.log('• node launcher.js justthetip  - Run JustTheTip Bot (crypto + loans + tiltcheck)');
    console.log('• node launcher.js degens      - Run Degens Bot (cards + crypto)');
    console.log('• node launcher.js             - Show this menu\n');
}

function launchBot(botName) {
    const bot = BOTS[botName];
    
    if (!bot) {
        console.log(`❌ Invalid bot! Available bots: ${Object.keys(BOTS).join(', ')}`);
        showBotSelection();
        return;
    }

    if (!bot.token) {
        console.error(`❌ No token configured for ${bot.name}`);
        console.log('Please check your .env file for the required bot token.');
        return;
    }

    console.log(`\n🚀 Launching ${bot.emoji} ${bot.name}...`);
    console.log(`📂 Features: ${bot.features.join(', ')}`);
    
    if (bot.webhook) {
        console.log(`🔗 Webhook: Configured`);
    }
    
    console.log(`� Running: ${bot.file}`);
    console.log('══════════════════════════════════════════════════\n');

    // Set environment variables for the selected bot
    process.env.CURRENT_BOT = botName.toUpperCase();
    process.env.BOT_NAME = bot.name;
    process.env.BOT_FEATURES = bot.features.join(',');
    
    // Set the appropriate Discord token and features
    if (botName === 'justthetip') {
        process.env.DISCORD_BOT_TOKEN = bot.token;
        process.env.ENABLE_LOANS_JUSTTHETIP = 'true';
        process.env.ENABLE_LOANS_TRAPHOUSE = 'false';
        console.log('💡 JustTheTip Bot: Crypto + Loans + TiltCheck enabled');
        console.log(`� Loan Channel: ${bot.channels.loans}`);
    } else if (botName === 'traphouse') {
        process.env.DISCORD_BOT_TOKEN = bot.token;
        process.env.ENABLE_LOANS_TRAPHOUSE = 'true';
        process.env.ENABLE_LOANS_JUSTTHETIP = 'false';
        console.log('🏠 TrapHouse Bot: Full features + Loans + Respect enabled');
    } else if (botName === 'degens') {
        process.env.DISCORD_BOT_TOKEN = bot.token;
        process.env.ENABLE_LOANS_TRAPHOUSE = 'false';
        process.env.ENABLE_LOANS_JUSTTHETIP = 'false';
        console.log('🎮 Degens Bot: Cards + Crypto + TiltCheck enabled');
    }

    try {
        require(bot.file);
    } catch (error) {
        console.error(`❌ Failed to launch ${bot.name}:`, error.message);
    }
}

// Main execution
const selectedBot = process.argv[2];

if (selectedBot && BOTS[selectedBot]) {
    launchBot(selectedBot);
} else {
    showBotSelection();
}

module.exports = { BOTS, launchBot };

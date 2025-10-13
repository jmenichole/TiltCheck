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

#!/usr/bin/env node

// Discord Bot Status Check
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot Status Check - ${client.user.tag} is online!`);
    console.log(`📊 Connected to ${client.guilds.cache.size} servers`);
    console.log(`👥 Total users: ${client.users.cache.size}`);
    
    // Show crypto tip system status
    const CryptoTipManager = require('./cryptoTipManager');
    try {
        const tipManager = new CryptoTipManager();
        console.log('💎 Crypto Tip System: ✅ Available');
        console.log('🎯 Ready to test: Try $balance command in Discord');
    } catch (error) {
        console.log('💎 Crypto Tip System: ❌ Error -', error.message);
    }
    
    // Exit after status check
    setTimeout(() => {
        console.log('🔄 Status check complete. Your main bot should be responding to $balance commands now.');
        process.exit(0);
    }, 2000);
});

client.login(process.env.DISCORD_BOT_TOKEN);

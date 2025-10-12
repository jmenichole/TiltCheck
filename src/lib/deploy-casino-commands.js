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

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();

const commands = [];

// Define casino commands to register
const casinoCommands = [
    'casino-verify.js',
    'casino-profile.js', 
    'casino-ranking.js',
    'trust-score.js',
    'enhanced-loan.js'
];

// Load casino commands
const commandsPath = path.join(__dirname, 'commands');
for (const file of casinoCommands) {
    const filePath = path.join(commandsPath, file);
    if (fs.existsSync(filePath)) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
            console.log(`⚠️ Command ${file} is missing required properties.`);
        }
    } else {
        console.log(`❌ Command file not found: ${file}`);
    }
}

// Load other existing slash commands
const otherSlashCommands = [
    'payment.js',
    'help_fixed.js',
    'enhancedTiltCheck.js'
];

for (const file of otherSlashCommands) {
    const filePath = path.join(commandsPath, file);
    if (fs.existsSync(filePath)) {
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Loaded existing command: ${command.data.name}`);
            }
        } catch (error) {
            console.log(`⚠️ Error loading ${file}:`, error.message);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // Use TrapHouse Bot CLIENT_ID (since casino system is for TrapHouse)
        const CLIENT_ID = '1354450590813655142';
        
        console.log(`🎯 Using TrapHouse Bot CLIENT_ID: ${CLIENT_ID}`);
        
        if (!CLIENT_ID) {
            throw new Error('CLIENT_ID not found');
        }

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        
        // Log registered commands
        console.log('\n📋 Registered Commands:');
        data.forEach(cmd => {
            console.log(`   • /${cmd.name} - ${cmd.description}`);
        });
        
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        
        if (error.code === 50001) {
            console.log('⚠️ Missing Access: Bot may not have proper permissions');
        } else if (error.code === 10002) {
            console.log('⚠️ Unknown Application: Check your CLIENT_ID');
        }
    }
})();

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

/**
 * Integration file to add Non-Custodial commands to existing TiltCheck Discord Bot
 * Copy this code into your main bot.js file's command handling section
 */

const { NonCustodialDiscordCommands } = require('./NonCustodialDiscordCommands');

// Initialize non-custodial system
const nonCustodialCommands = new NonCustodialDiscordCommands();

// Add these commands to your existing slash command registration
const additionalCommands = nonCustodialCommands.getCommands();

console.log('🔗 Non-Custodial commands loaded:', additionalCommands.map(cmd => cmd.name));

// Add this to your existing interaction handler
async function handleNonCustodialInteractions(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'wallet':
                await nonCustodialCommands.handleWalletCommand(interaction);
                break;
            
            case 'tip':
                await nonCustodialCommands.handleTipCommand(interaction);
                break;
        }
    } catch (error) {
        console.error('Non-custodial command error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred processing your command.',
                ephemeral: true
            });
        }
    }
}

module.exports = {
    nonCustodialCommands,
    additionalCommands,
    handleNonCustodialInteractions
};

/*
INTEGRATION INSTRUCTIONS:
1. In your main bot.js file, import this module:
   const { additionalCommands, handleNonCustodialInteractions } = require('./bot-integration');

2. Add the additionalCommands to your commands array when registering slash commands

3. In your interaction handler, add:
   await handleNonCustodialInteractions(interaction);

4. The non-custodial /wallet and /tip commands will now work alongside existing TiltCheck features
*/

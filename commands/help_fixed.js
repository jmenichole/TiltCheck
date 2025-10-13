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

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available TrapHouse commands'),
    async execute(interaction) {
        const helpEmbed = {
            color: 0xFF6B35,
            title: '🏠 TrapHouse Bot Commands',
            description: 'Complete command reference for the TrapHouse ecosystem',
            fields: [
                {
                    name: '💰 Economy',
                    value: '`!respect` - Check respect balance\n`!loan <amount>` - Request a loan\n`!balance` - Financial summary',
                    inline: true
                },
                {
                    name: '🕒 Time Tracking',
                    value: '`!clockin` - Start work\n`!clockout` - End work\n`!timesheet` - View hours',
                    inline: true
                },
                {
                    name: '💼 Work',
                    value: '`!work` - Earn respect\n`!job list` - Available jobs\n`!leaderboard` - Top users',
                    inline: true
                }
            ],
            footer: { text: 'TrapHouse Ecosystem • Use !help-clock for time tracking help' }
        };

        await interaction.reply({ embeds: [helpEmbed] });
    },
};

// Legacy message-based command support
module.exports.messageHandler = async (message, args) => {
    const helpEmbed = {
        color: 0xFF6B35,
        title: '🏠 TrapHouse Bot Commands',
        description: 'Complete command reference for the TrapHouse ecosystem',
        fields: [
            {
                name: '💰 Economy',
                value: '`!respect` - Check respect balance\n`!loan <amount>` - Request a loan\n`!balance` - Financial summary',
                inline: true
            },
            {
                name: '🕒 Time Tracking (CollectClock)',
                value: '`!clockin` - Start work session\n`!clockout` - End work session\n`!timesheet` - View work hours\n`!productivity` - Detailed stats\n`!goal <hours>` - Set daily goals',
                inline: true
            },
            {
                name: '💼 Work & Jobs',
                value: '`!work` - Earn respect points\n`!job list` - Available jobs\n`!leaderboard` - Top users\n`!daily` - Daily bonus',
                inline: true
            },
            {
                name: '₿ Crypto Payments',
                value: '`!tip @user <amount>` - Send crypto tip\n`!deposit` - Get deposit address\n`!withdraw <address>` - Withdraw funds',
                inline: true
            }
        ],
        footer: { text: 'TrapHouse Ecosystem • Crypto payments via JustTheTip' }
    };

    await message.reply({ embeds: [helpEmbed] });
};

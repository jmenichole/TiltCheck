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
 * Admin commands for crypto tip system testing
 * Allows admins to add crypto balances for users
 */

const { EmbedBuilder } = require('discord.js');

class CryptoTipAdmin {
    constructor(cryptoTipManager) {
        this.tipManager = cryptoTipManager;
    }

    /**
     * Handle admin commands for crypto tip system
     */
    async handleAdminCommand(message, args) {
        // Check if user has admin permissions
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('❌ You need admin permissions to use tip admin commands!');
        }

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'add-balance') {
            await this.handleAddBalance(message, args.slice(1));
        } else if (subcommand === 'view-user') {
            await this.handleViewUser(message, args.slice(1));
        } else if (subcommand === 'tip-stats') {
            await this.handleTipStats(message);
        } else {
            await this.showAdminHelp(message);
        }
    }

    /**
     * Add crypto balance to a user for testing
     */
    async handleAddBalance(message, args) {
        try {
            const mentionMatch = args[0]?.match(/<@!?(\d+)>/);
            if (!mentionMatch) {
                return message.reply('❌ Please mention a user: `!tip-admin add-balance @user amount chain`');
            }

            const userId = mentionMatch[1];
            const amount = parseFloat(args[1]);
            const chain = (args[2] || 'POLYGON').toUpperCase();

            if (isNaN(amount) || amount <= 0) {
                return message.reply('❌ Please specify a valid amount');
            }

            // Add balance to user
            await this.tipManager.addUserBalance(userId, chain, amount);

            const user = await message.client.users.fetch(userId);
            const newBalance = this.tipManager.getUserBalance(userId, chain);

            const embed = new EmbedBuilder()
                .setTitle('✅ Balance Added')
                .setDescription(`Added **${amount} ${chain}** to ${user.username}'s wallet`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '👤 User', value: user.username, inline: true },
                    { name: '💰 Amount Added', value: `${amount} ${chain}`, inline: true },
                    { name: '🏦 New Balance', value: `${newBalance} ${chain}`, inline: true }
                )
                .setFooter({ text: 'Admin action - balance updated' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error adding balance:', error);
            await message.reply(`❌ Error adding balance: ${error.message}`);
        }
    }

    /**
     * View user's crypto balances and tip history
     */
    async handleViewUser(message, args) {
        try {
            const mentionMatch = args[0]?.match(/<@!?(\d+)>/);
            if (!mentionMatch) {
                return message.reply('❌ Please mention a user: `!tip-admin view-user @user`');
            }

            const userId = mentionMatch[1];
            const user = await message.client.users.fetch(userId);

            // Get balances for all chains
            const supportedChains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
            const balances = [];

            for (const chain of supportedChains) {
                const balance = this.tipManager.getUserBalance(userId, chain);
                if (balance > 0) {
                    balances.push(`**${chain}:** ${balance.toFixed(6)}`);
                }
            }

            // Get tip stats
            const totalSent = this.tipManager.getTotalTipsSent(userId);
            const totalReceived = this.tipManager.getTotalTipsReceived(userId);

            const embed = new EmbedBuilder()
                .setTitle(`👤 User Profile: ${user.username}`)
                .setColor(0x0099FF)
                .addFields(
                    { 
                        name: '💰 Crypto Balances', 
                        value: balances.length > 0 ? balances.join('\n') : 'No balances found', 
                        inline: false 
                    },
                    { name: '📤 Total Tips Sent', value: totalSent.toFixed(6), inline: true },
                    { name: '📥 Total Tips Received', value: totalReceived.toFixed(6), inline: true },
                    { name: '📊 Net Balance', value: (totalReceived - totalSent).toFixed(6), inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: 'Admin view - user statistics' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error viewing user:', error);
            await message.reply(`❌ Error viewing user: ${error.message}`);
        }
    }

    /**
     * Show overall tip system statistics
     */
    async handleTipStats(message) {
        try {
            // Get system-wide statistics
            const allTips = Array.from(this.tipManager.tipHistory.values());
            const completedTips = allTips.filter(tip => tip.status === 'completed');
            
            const totalVolume = completedTips.reduce((sum, tip) => sum + tip.amount, 0);
            const uniqueUsers = new Set([...completedTips.map(tip => tip.fromUserId), ...completedTips.map(tip => tip.toUserId)]).size;
            
            // Chain breakdown
            const chainStats = {};
            completedTips.forEach(tip => {
                chainStats[tip.chain] = (chainStats[tip.chain] || 0) + tip.amount;
            });

            const chainBreakdown = Object.entries(chainStats)
                .map(([chain, volume]) => `**${chain}:** ${volume.toFixed(6)}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle('📊 Crypto Tip System Statistics')
                .setDescription('System-wide tipping activity overview')
                .setColor(0x9932CC)
                .addFields(
                    { name: '💸 Total Tips', value: completedTips.length.toString(), inline: true },
                    { name: '💰 Total Volume', value: totalVolume.toFixed(6), inline: true },
                    { name: '👥 Active Users', value: uniqueUsers.toString(), inline: true },
                    { 
                        name: '⛓️ Chain Breakdown', 
                        value: chainBreakdown || 'No tips yet', 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Admin stats - all completed transactions' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting tip stats:', error);
            await message.reply(`❌ Error getting statistics: ${error.message}`);
        }
    }

    /**
     * Show admin help
     */
    async showAdminHelp(message) {
        const embed = new EmbedBuilder()
            .setTitle('🔧 Crypto Tip Admin Commands')
            .setDescription('Admin-only commands for managing the crypto tip system')
            .setColor(0xFF6600)
            .addFields(
                {
                    name: '💰 Balance Management',
                    value: '`!tip-admin add-balance @user amount [chain]` - Add crypto balance to user\n`!tip-admin view-user @user` - View user balances and stats',
                    inline: false
                },
                {
                    name: '📊 System Statistics',
                    value: '`!tip-admin tip-stats` - View system-wide statistics',
                    inline: false
                },
                {
                    name: '🔗 Supported Chains',
                    value: 'ETHEREUM, POLYGON, BSC, ARBITRUM, AVALANCHE, SOLANA, TRON, SOLUSDC',
                    inline: false
                },
                {
                    name: '⚠️ Testing Notes',
                    value: 'Use add-balance to give users test crypto for tipping\nNo real crypto is involved - this is for testing only',
                    inline: false
                }
            )
            .setFooter({ text: 'Admin commands require Administrator permission' });

        await message.reply({ embeds: [embed] });
    }
}

module.exports = CryptoTipAdmin;

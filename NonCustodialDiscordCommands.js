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
const { NonCustodialTippingSystem } = require('./NonCustodialTippingSystem');

class NonCustodialDiscordCommands {
    constructor() {
        this.tippingSystem = new NonCustodialTippingSystem();
        console.log('🔗 Non-Custodial Discord Commands initialized');
    }

    getCommands() {
        return [
            new SlashCommandBuilder()
                .setName('wallet')
                .setDescription('Non-custodial wallet management')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('register')
                        .setDescription('Register your Solana wallet public key')
                        .addStringOption(option =>
                            option
                                .setName('pubkey')
                                .setDescription('Your Solana wallet public address')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('balance')
                        .setDescription('Check your wallet balance and stats')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('help')
                        .setDescription('Get wallet setup instructions')
                ),

            new SlashCommandBuilder()
                .setName('tip')
                .setDescription('Send a non-custodial tip directly wallet-to-wallet')
                .addUserOption(option =>
                    option
                        .setName('recipient')
                        .setDescription('User to tip')
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName('amount')
                        .setDescription('Amount to tip (SOL)')
                        .setRequired(true)
                        .setMinValue(0.001)
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Optional tip message')
                        .setRequired(false)
                )
        ];
    }

    async handleWalletCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case 'register':
                    const pubkey = interaction.options.getString('pubkey');
                    const result = await this.tippingSystem.registerUserWallet(userId, pubkey);
                    
                    await interaction.reply({
                        content: `${result.message}\n\n**Wallet Address:** \`${result.walletAddress}\`\n*${result.note}*`,
                        ephemeral: true
                    });
                    break;

                case 'balance':
                    const balance = await this.tippingSystem.getUserBalance(userId);
                    
                    if (!balance.registered) {
                        await interaction.reply({
                            content: balance.message,
                            ephemeral: true
                        });
                        return;
                    }

                    const balanceEmbed = {
                        color: 0x00ff00,
                        title: '💳 Your Non-Custodial Wallet',
                        fields: [
                            { name: '🏦 Wallet Address', value: `\`${balance.walletAddress}\``, inline: false },
                            { name: '💰 Balance', value: balance.balance.formatted, inline: true },
                            { name: '📊 Tips Sent', value: balance.stats.tipsSent.toString(), inline: true },
                            { name: '📨 Tips Received', value: balance.stats.tipsReceived.toString(), inline: true },
                            { name: '⭐ Reputation', value: balance.stats.reputation.toString(), inline: true }
                        ],
                        footer: { text: balance.controlMessage }
                    };

                    await interaction.reply({ embeds: [balanceEmbed], ephemeral: true });
                    break;

                case 'help':
                    const instructions = this.tippingSystem.generateWalletInstructions();
                    
                    const helpEmbed = {
                        color: 0x9932cc,
                        title: instructions.title,
                        fields: [
                            { name: '📋 Setup Steps', value: instructions.steps.join('\n'), inline: false },
                            { name: '🔐 Security Reminders', value: instructions.security.join('\n'), inline: false }
                        ],
                        footer: { text: instructions.note }
                    };

                    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
                    break;
            }
        } catch (error) {
            console.error('Wallet command error:', error);
            await interaction.reply({
                content: `❌ Error: ${error.message}`,
                ephemeral: true
            });
        }
    }

    async handleTipCommand(interaction) {
        const recipient = interaction.options.getUser('recipient');
        const amount = interaction.options.getNumber('amount');
        const message = interaction.options.getString('message') || '';
        const senderId = interaction.user.id;
        const recipientId = recipient.id;

        try {
            const tipResult = await this.tippingSystem.executeTip(senderId, recipientId, amount, message);
            
            const tipEmbed = {
                color: 0xffd700,
                title: '�� Non-Custodial Tip Ready',
                fields: [
                    { name: '👤 From', value: `<@${senderId}>`, inline: true },
                    { name: '🎯 To', value: `<@${recipientId}>`, inline: true },
                    { name: '💰 Amount', value: `${amount} SOL`, inline: true },
                    { name: '💌 Message', value: message || '_No message_', inline: false },
                    { name: '🔗 Next Step', value: tipResult.userAction, inline: false }
                ],
                footer: { text: '🔒 This is a direct wallet-to-wallet transaction' }
            };

            await interaction.reply({ embeds: [tipEmbed] });
            
        } catch (error) {
            console.error('Tip command error:', error);
            await interaction.reply({
                content: `❌ ${error.message}`,
                ephemeral: true
            });
        }
    }
}

module.exports = { NonCustodialDiscordCommands };

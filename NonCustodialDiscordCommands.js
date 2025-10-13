const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { NonCustodialTippingSystem } = require('./NonCustodialTippingSystem.js');

class NonCustodialDiscordCommands {
    constructor() {
        this.tippingSystem = new NonCustodialTippingSystem({
            rpcUrl: process.env.SOLANA_RPC_URL
        });
    }

    getCommands() {
        return [
            new SlashCommandBuilder()
                .setName('wallet')
                .setDescription('Manage your non-custodial wallet')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('register')
                        .setDescription('Register your wallet (you keep the private key)')
                        .addStringOption(option =>
                            option
                                .setName('address')
                                .setDescription('Your wallet public address')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('balance').setDescription('Check your wallet balance')
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('instructions').setDescription('Get wallet setup instructions')
                ),

            new SlashCommandBuilder()
                .setName('tip')
                .setDescription('Send a non-custodial tip (you sign the transaction)')
                .addUserOption(option =>
                    option.setName('user').setDescription('User to tip').setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName('amount').setDescription('Amount in SOL').setRequired(true).setMinValue(0.001)
                )
        ];
    }

    async handleWalletCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        switch (subcommand) {
            case 'register':
                await this.handleWalletRegister(interaction);
                break;
            case 'balance':
                await this.handleWalletBalance(interaction);
                break;
            case 'instructions':
                await this.handleWalletInstructions(interaction);
                break;
        }
    }

    async handleWalletRegister(interaction) {
        const walletAddress = interaction.options.getString('address');
        
        try {
            const result = await this.tippingSystem.registerUserWallet(interaction.user.id, walletAddress);
            
            const embed = new EmbedBuilder()
                .setTitle('🔒 Wallet Registered Successfully!')
                .setColor(0x00FF00)
                .addFields(
                    { name: '📍 Wallet Address', value: `\`${walletAddress}\``, inline: false },
                    { name: '🔒 Security', value: result.note, inline: false }
                );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
    }

    async handleWalletBalance(interaction) {
        try {
            const balance = await this.tippingSystem.getUserBalance(interaction.user.id);
            
            if (!balance.registered) {
                await interaction.reply({ content: balance.message, ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('💰 Your Non-Custodial Wallet Balance')
                .setColor(0x0099FF)
                .addFields(
                    { name: '📍 Wallet Address', value: `\`${balance.walletAddress}\``, inline: false },
                    { name: '💎 SOL Balance', value: balance.balance.formatted, inline: true },
                    { name: '🔒 Security Note', value: balance.controlMessage, inline: false }
                );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
    }

    async handleWalletInstructions(interaction) {
        const instructions = this.tippingSystem.generateWalletInstructions();

        const embed = new EmbedBuilder()
            .setTitle(instructions.title)
            .setColor(0x9932CC)
            .addFields(
                { name: '📋 Setup Steps', value: instructions.steps.join('\n'), inline: false },
                { name: '🔒 Security Guidelines', value: instructions.security.join('\n'), inline: false },
                { name: '💡 Important Note', value: instructions.note, inline: false }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    async handleTipCommand(interaction) {
        const recipient = interaction.options.getUser('user');
        const amount = interaction.options.getNumber('amount');
        
        try {
            const tip = await this.tippingSystem.executeTip(interaction.user.id, recipient.id, amount);
            
            const embed = new EmbedBuilder()
                .setTitle('💰 Non-Custodial Tip Ready')
                .setColor(0xFFD700)
                .addFields(
                    { name: '👤 From', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '🎯 To', value: `<@${recipient.id}>`, inline: true },
                    { name: '💎 Amount', value: `${amount} SOL`, inline: true },
                    { name: '🔒 Security', value: 'This requires YOUR wallet signature', inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
        }
    }

    async shutdown() {
        console.log('🔒 Non-Custodial Discord Commands shutting down...');
    }
}

module.exports = { NonCustodialDiscordCommands };

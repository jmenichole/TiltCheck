const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const PaymentManager = require('../paymentManager');
const config = require('../config/payments');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('payment')
        .setDescription('Payment management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check your payment status')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('history')
                .setDescription('View your payment history')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('subscribe')
                .setDescription('Subscribe to TrapHouse Premium')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('plans')
                .setDescription('View available payment plans')
        ),

    async execute(interaction) {
        const paymentManager = new PaymentManager(interaction.client);
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'status':
                await this.handlePaymentStatus(interaction, paymentManager);
                break;
            case 'history':
                await this.handlePaymentHistory(interaction, paymentManager);
                break;
            case 'subscribe':
                await this.handleSubscribe(interaction, paymentManager);
                break;
            case 'plans':
                await this.handlePlans(interaction);
                break;
        }
    },

    async handlePaymentStatus(interaction, paymentManager) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get user's pending payments
            const payments = JSON.parse(require('fs').readFileSync('./data/payments.json', 'utf8'));
            const userPayments = Object.values(payments).filter(p => p.userId === interaction.user.id && p.status !== 'completed');

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('💳 Your Payment Status')
                .setDescription('Current payment information for your account.')
                .setFooter({ text: 'TrapHouse Payment System' })
                .setTimestamp();

            if (userPayments.length === 0) {
                embed.addFields({ name: '✅ Status', value: 'No pending payments', inline: false });
            } else {
                embed.addFields(
                    { name: '⏳ Pending Payments', value: `${userPayments.length} payment(s)`, inline: true },
                    { name: '💰 Total Amount Due', value: `$${userPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`, inline: true }
                );

                // Show details of pending payments
                userPayments.forEach((payment, index) => {
                    embed.addFields({
                        name: `Payment #${index + 1}`,
                        value: `**Type:** ${payment.type}\n**Amount:** $${payment.amount}\n**Status:** ${payment.status}`,
                        inline: true
                    });
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error checking payment status:', error);
            await interaction.editReply({ content: '❌ Error checking payment status.' });
        }
    },

    async handlePaymentHistory(interaction, paymentManager) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const payments = JSON.parse(require('fs').readFileSync('./data/payments.json', 'utf8'));
            const userPayments = Object.values(payments).filter(p => p.userId === interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle('📋 Payment History')
                .setDescription('Your payment transaction history.')
                .setFooter({ text: 'TrapHouse Payment System' })
                .setTimestamp();

            if (userPayments.length === 0) {
                embed.addFields({ name: 'ℹ️ No History', value: 'No payment records found.', inline: false });
            } else {
                const totalPaid = userPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
                const totalPending = userPayments.filter(p => p.status !== 'completed').reduce((sum, p) => sum + p.amount, 0);

                embed.addFields(
                    { name: '✅ Total Paid', value: `$${totalPaid.toFixed(2)}`, inline: true },
                    { name: '⏳ Pending', value: `$${totalPending.toFixed(2)}`, inline: true },
                    { name: '📊 Total Transactions', value: `${userPayments.length}`, inline: true }
                );

                // Show recent transactions
                const recentPayments = userPayments.slice(-5).reverse();
                recentPayments.forEach((payment, index) => {
                    const status = payment.status === 'completed' ? '✅' : '⏳';
                    const date = new Date(payment.created).toLocaleDateString();
                    embed.addFields({
                        name: `${status} ${payment.type}`,
                        value: `**Amount:** $${payment.amount}\n**Date:** ${date}\n**Status:** ${payment.status}`,
                        inline: true
                    });
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error getting payment history:', error);
            await interaction.editReply({ content: '❌ Error retrieving payment history.' });
        }
    },

    async handleSubscribe(interaction, paymentManager) {
        const embed = new EmbedBuilder()
            .setColor('#9C27B0')
            .setTitle('👑 TrapHouse Premium Subscription')
            .setDescription('Upgrade to Premium for enhanced features and higher loan limits.')
            .addFields(
                { name: '💰 Total Cost', value: `$${config.FEES.SUBSCRIPTION_TOTAL}`, inline: true },
                { name: '📅 Payment Plan', value: `${config.FEES.SUBSCRIPTION_INSTALLMENTS} payments of $${config.FEES.SUBSCRIPTION_AMOUNT}`, inline: true },
                { name: '🔄 Billing Cycle', value: 'Quarterly (every 3 months)', inline: true },
                { name: '✨ Premium Benefits', value: '• Higher loan caps (+100%)\n• Priority support\n• Exclusive channels\n• Custom commands\n• Advanced analytics', inline: false }
            )
            .setFooter({ text: 'TrapHouse Premium Subscription' })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscribe_stripe')
                    .setLabel('Subscribe with Stripe')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💳'),
                new ButtonBuilder()
                    .setCustomId('subscribe_tipcc')
                    .setLabel('Pay with tip.cc')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🪙'),
                new ButtonBuilder()
                    .setCustomId('payment_info')
                    .setLabel('More Info')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('ℹ️')
            );

        await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
    },

    async handlePlans(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle('💳 TrapHouse Payment Plans')
            .setDescription('Choose the payment option that works best for you.')
            .addFields(
                {
                    name: '🪙 Per-Transaction (tip.cc)',
                    value: `**Loan Issuance Fee:** $${config.FEES.LOAN_ISSUANCE_FEE}\n**Late Payment Fee:** $${config.FEES.LATE_REPAYMENT_FEE}\n\n✅ Pay only when you use the service\n✅ No upfront costs\n✅ Automatic processing`,
                    inline: true
                },
                {
                    name: '👑 Premium Subscription (Stripe)',
                    value: `**Total Cost:** $${config.FEES.SUBSCRIPTION_TOTAL}\n**Payment Plan:** ${config.FEES.SUBSCRIPTION_INSTALLMENTS}x $${config.FEES.SUBSCRIPTION_AMOUNT}\n**Billing:** Quarterly\n\n✅ No per-transaction fees\n✅ Premium features\n✅ Higher loan limits`,
                    inline: true
                },
                {
                    name: '🎮 Discord Alternative',
                    value: `**Monthly Boost:** $${config.FEES.DISCORD_BOOST_EQUIVALENT}\n\n✅ Support via Discord Nitro\n✅ Server boosting benefits\n✅ Community recognition`,
                    inline: false
                }
            )
            .setFooter({ text: 'TrapHouse Payment Options' })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('choose_per_transaction')
                    .setLabel('Per-Transaction')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🪙'),
                new ButtonBuilder()
                    .setCustomId('choose_subscription')
                    .setLabel('Premium Subscription')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👑'),
                new ButtonBuilder()
                    .setCustomId('choose_discord')
                    .setLabel('Discord Boost')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎮')
            );

        await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
    }
};

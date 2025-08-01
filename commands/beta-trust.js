/**
 * Beta Trust System Test Command
 * Simple command to test NFT-based trust scoring for approved beta users
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const NFTUserTrustSystem = require('../nftUserTrustSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beta-trust')
        .setDescription('Beta test NFT contract-based trust system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('init')
                .setDescription('Initialize beta trust score'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('score')
                .setDescription('View beta trust score'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('verify-link')
                .setDescription('Add verified link (beta)')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Link type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Wallet', value: 'wallet' },
                            { name: 'Casino', value: 'casino' },
                            { name: 'Social', value: 'social' }
                        ))
                .addStringOption(option =>
                    option.setName('link')
                        .setDescription('Link or address')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('degen-proof')
                .setDescription('Record degen proof action (beta)')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Proof type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Loss Transparency', value: 'loss_transparency' },
                            { name: 'Tilt Recovery', value: 'tilt_recovery' },
                            { name: 'Community Help', value: 'community_help' }
                        ))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('report-scam')
                .setDescription('Report scam event (beta)')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to report')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Scam type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Fake Giveaway', value: 'fake_giveaway' },
                            { name: 'Phishing', value: 'phishing' },
                            { name: 'Payment Fraud', value: 'payment_fraud' }
                        ))
                .addStringOption(option =>
                    option.setName('evidence')
                        .setDescription('Evidence')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('summary')
                .setDescription('Complete beta trust summary')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const trustSystem = new NFTUserTrustSystem();

        try {
            switch (subcommand) {
                case 'init':
                    await this.handleInit(interaction, trustSystem);
                    break;
                case 'score':
                    await this.handleScore(interaction, trustSystem);
                    break;
                case 'verify-link':
                    await this.handleVerifyLink(interaction, trustSystem);
                    break;
                case 'degen-proof':
                    await this.handleDegenProof(interaction, trustSystem);
                    break;
                case 'report-scam':
                    await this.handleReportScam(interaction, trustSystem);
                    break;
                case 'summary':
                    await this.handleSummary(interaction, trustSystem);
                    break;
            }
        } catch (error) {
            console.error('Beta trust command error:', error);
            await interaction.reply({
                content: '❌ Beta test error occurred.',
                ephemeral: true
            });
        }
    },

    async handleInit(interaction, trustSystem) {
        const userId = interaction.user.id;
        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.initializeTrustScore(userId);

        const embed = new EmbedBuilder()
            .setTitle(result.success ? '✅ Beta Trust Initialized' : '❌ Beta Access Required')
            .setColor(result.success ? 0x00ff00 : 0xff0000)
            .setDescription(result.message)
            .addFields({
                name: '🎯 Trust Score',
                value: result.success ? `${result.trustScore}/1000` : '0/1000',
                inline: true
            });

        if (result.success) {
            embed.addFields(
                { name: '🎫 Beta Token', value: `beta_token_${userId}`, inline: true },
                { name: '📈 Next Steps', value: '• Add verified links\n• Record degen proof\n• Report scams (200+ score)' }
            );
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleScore(interaction, trustSystem) {
        const userId = interaction.user.id;
        await interaction.deferReply({ ephemeral: false });

        const trustScore = await trustSystem.calculateUserTrustScore(userId);

        const embed = new EmbedBuilder()
            .setTitle(`🔒 Beta Trust Score - ${interaction.user.displayName}`)
            .setColor(this.getTrustColor(trustScore.totalScore))
            .setThumbnail(interaction.user.displayAvatarURL());

        if (trustScore.totalScore === 0) {
            embed.setDescription('❌ **No Beta Trust Score**\n\nUse `/beta-trust init` to initialize your score.')
                .addFields({
                    name: '📋 Beta Requirements',
                    value: 'Must be approved beta tester to access trust system'
                });
        } else {
            const breakdown = trustScore.breakdown;
            embed.setDescription(`**Trust Tier:** ${trustScore.trustTier}\n**Status:** ${trustScore.status.toUpperCase()}`)
                .addFields(
                    { name: '📊 Total Score', value: `**${trustScore.totalScore}**/1000`, inline: true },
                    { name: '🏆 Trust Tier', value: trustScore.trustTier, inline: true },
                    { name: '📈 Status', value: trustScore.status, inline: true },
                    { name: '🎫 NFT Contract', value: `${breakdown.nftContract} points`, inline: true },
                    { name: '🔗 Verified Links', value: `${breakdown.verifiedLinks} points`, inline: true },
                    { name: '🎯 Degen Proof', value: `${breakdown.degenProofActions} points`, inline: true }
                );
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleVerifyLink(interaction, trustSystem) {
        const userId = interaction.user.id;
        const linkType = interaction.options.getString('type');
        const linkData = interaction.options.getString('link');

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.addVerifiedLink(userId, linkType, linkData);

        const embed = new EmbedBuilder()
            .setTitle(result.success ? '✅ Link Verified' : '❌ Verification Failed')
            .setColor(result.success ? 0x00ff00 : 0xff0000)
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                { name: '🔗 Link Type', value: this.formatLinkType(linkType), inline: true },
                { name: '⭐ Points', value: `+${result.trustPointsAwarded}`, inline: true },
                { name: '📊 Total', value: `${result.newTotalScore}/1000`, inline: true }
            );
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleDegenProof(interaction, trustSystem) {
        const userId = interaction.user.id;
        const proofType = interaction.options.getString('type');
        const description = interaction.options.getString('description');

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.recordDegenProofAction(userId, proofType, description, '');

        const embed = new EmbedBuilder()
            .setTitle(result.success ? '🎯 Degen Proof Recorded' : '❌ Proof Failed')
            .setColor(result.success ? 0x00ff00 : 0xff0000)
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                { name: '🎭 Proof Type', value: this.formatProofType(proofType), inline: true },
                { name: '⭐ Points', value: `+${result.trustPointsAwarded}`, inline: true },
                { name: '📊 Total', value: `${result.newTotalScore}/1000`, inline: true },
                { name: '📝 Description', value: description, inline: false }
            );

            if (result.consistencyBonus > 0) {
                embed.addFields({ name: '🔥 Bonus!', value: `+${result.consistencyBonus} consistency bonus` });
            }
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleReportScam(interaction, trustSystem) {
        const reporterId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');
        const scamType = interaction.options.getString('type');
        const evidence = interaction.options.getString('evidence');

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.reportScamEvent(reporterId, targetUser.id, scamType, evidence, 'Beta test scam report');

        const embed = new EmbedBuilder()
            .setTitle(result.success ? '🚨 Scam Report Submitted' : '❌ Report Failed')
            .setColor(result.success ? 0xff6600 : 0xff0000)
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                { name: '👤 Reported User', value: targetUser.displayName, inline: true },
                { name: '🚨 Type', value: this.formatScamType(scamType), inline: true },
                { name: '📋 Report ID', value: result.reportId, inline: true },
                { name: '⭐ Trust Points', value: `+${result.trustPointsAwarded}`, inline: true }
            );
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleSummary(interaction, trustSystem) {
        const userId = interaction.user.id;
        await interaction.deferReply({ ephemeral: false });

        const summary = await trustSystem.getUserTrustSummary(userId);

        if (summary.error) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Beta Summary Error')
                .setColor(0xff0000)
                .setDescription(summary.error);

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const userTrust = summary.userTrust;
        const embed = new EmbedBuilder()
            .setTitle(`📊 Beta Trust Summary - ${interaction.user.displayName}`)
            .setColor(this.getTrustColor(userTrust.totalScore))
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`**Trust Tier:** ${userTrust.trustTier}\n**Risk Level:** ${summary.riskLevel}`)
            .addFields(
                { name: '👤 Trust Score', value: `**${userTrust.totalScore}**/1000`, inline: true },
                { name: '🚨 Sus Score', value: `**${summary.susScore}**/1000`, inline: true },
                { name: '⚠️ Risk Level', value: summary.riskLevel, inline: true }
            );

        if (userTrust.breakdown) {
            const breakdown = userTrust.breakdown;
            embed.addFields({
                name: '📊 Score Breakdown',
                value: `🎫 NFT: ${breakdown.nftContract}\n🔗 Links: ${breakdown.verifiedLinks}\n🎯 Proof: ${breakdown.degenProofActions}\n🚨 Reports: ${breakdown.scamReporting}`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },

    // Utility methods
    getTrustColor(score) {
        if (score >= 1000) return 0xFFD700;
        if (score >= 750) return 0x00FF00;
        if (score >= 500) return 0x32CD32;
        if (score >= 250) return 0xFFFF00;
        if (score >= 100) return 0xFFA500;
        return 0xFF0000;
    },

    formatLinkType(type) {
        const types = { 'wallet': '🔗 Wallet', 'casino': '🎰 Casino', 'social': '📱 Social' };
        return types[type] || type;
    },

    formatProofType(type) {
        const types = {
            'loss_transparency': '📉 Loss Transparency',
            'tilt_recovery': '🔄 Tilt Recovery', 
            'community_help': '👥 Community Help'
        };
        return types[type] || type;
    },

    formatScamType(type) {
        const types = {
            'fake_giveaway': '🎁 Fake Giveaway',
            'phishing': '🎣 Phishing',
            'payment_fraud': '💳 Payment Fraud'
        };
        return types[type] || type;
    }
};

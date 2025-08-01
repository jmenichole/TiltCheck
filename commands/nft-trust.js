/**
 * NFT-Based User Trust Discord Commands
 * /trust - NFT contract-based trust scoring with scam reporting
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const NFTUserTrustSystem = require('../nftUserTrustSystem');
const BetaVerificationContract = require('../beta-verification-contract');

const trustSystem = new NFTUserTrustSystem();
const nftContract = new BetaVerificationContract();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trust')
        .setDescription('NFT contract-based trust scoring system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('init')
                .setDescription('Initialize trust score with NFT contract'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('score')
                .setDescription('View trust score')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check (leave empty for yourself)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('verify-link')
                .setDescription('Add verified link to increase trust')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of link')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Wallet', value: 'wallet' },
                            { name: 'Casino Account', value: 'casino' },
                            { name: 'Social Media', value: 'social' }
                        ))
                .addStringOption(option =>
                    option.setName('link')
                        .setDescription('Link or address to verify')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('degen-proof')
                .setDescription('Record degen proof action')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of proof')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Loss Transparency', value: 'loss_transparency' },
                            { name: 'Tilt Recovery', value: 'tilt_recovery' },
                            { name: 'Limit Adherence', value: 'limit_adherence' },
                            { name: 'Profit Withdrawal', value: 'profit_withdrawal' },
                            { name: 'Community Help', value: 'community_help' }
                        ))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Describe your proof action')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('evidence')
                        .setDescription('Evidence links (optional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('report-scam')
                .setDescription('Report verified scam event')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to report')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of scam')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Fake Giveaway', value: 'fake_giveaway' },
                            { name: 'Phishing Link', value: 'phishing' },
                            { name: 'Payment Fraud', value: 'payment_fraud' },
                            { name: 'Impersonation', value: 'impersonation' },
                            { name: 'Other', value: 'other' }
                        ))
                .addStringOption(option =>
                    option.setName('evidence')
                        .setDescription('Evidence of scam')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Detailed description')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('summary')
                .setDescription('View complete trust summary')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check (leave empty for yourself)')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
            switch (subcommand) {
                case 'init':
                    await this.handleInitCommand(interaction);
                    break;
                case 'score':
                    await this.handleScoreCommand(interaction);
                    break;
                case 'verify-link':
                    await this.handleVerifyLinkCommand(interaction);
                    break;
                case 'degen-proof':
                    await this.handleDegenProofCommand(interaction);
                    break;
                case 'report-scam':
                    await this.handleReportScamCommand(interaction);
                    break;
                case 'summary':
                    await this.handleSummaryCommand(interaction);
                    break;
            }
        } catch (error) {
            console.error('Trust command error:', error);
            await interaction.reply({
                content: '❌ An error occurred processing your request.',
                ephemeral: true
            });
        }
    },

    async handleInitCommand(interaction) {
        const userId = interaction.user.id;
        
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user has NFT contract
            const hasContract = await nftContract.hasValidContract(userId);
            
            if (!hasContract) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ NFT Contract Required')
                    .setColor(0xff0000)
                    .setDescription('**You need to sign an NFT contract first.**')
                    .addFields(
                        { name: '📋 Requirements', value: 'Valid NFT contract signature required to begin trust scoring' },
                        { name: '🔧 Next Steps', value: 'Complete the NFT contract verification process first' }
                    );

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Get NFT info
            const nftInfo = await nftContract.verifyNFTOwnership(userId);
            const tokenId = nftInfo.nfts[0]?.tokenId || 'unknown';

            // Initialize trust score
            const result = await trustSystem.initializeTrustScore(userId, tokenId);

            if (result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Trust Score Initialized!')
                    .setColor(0x00ff00)
                    .setDescription('**Your NFT contract-based trust scoring is now active.**')
                    .addFields(
                        { name: '🎫 NFT Token ID', value: tokenId, inline: true },
                        { name: '📊 Starting Score', value: `${result.trustScore}/1000`, inline: true },
                        { name: '🏆 Trust Tier', value: 'NEW_USER', inline: true },
                        { name: '🎯 Next Steps', value: '• Verify wallet links (+50 points)\n• Record degen proof actions (+45 points)\n• Help community members (+35 points)' },
                        { name: '🚨 Scam Reporting', value: 'Report verified scam events once you reach 200+ trust score' }
                    );

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Initialization Failed')
                    .setColor(0xff0000)
                    .setDescription(result.message);

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Init command error:', error);
            await interaction.editReply({
                content: '❌ Failed to initialize trust score.'
            });
        }
    },

    async handleScoreCommand(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetUserId = targetUser.id;

        await interaction.deferReply({ ephemeral: false });

        const trustScore = await trustSystem.calculateUserTrustScore(targetUserId);

        const embed = new EmbedBuilder()
            .setTitle(`🔒 Trust Score - ${targetUser.displayName}`)
            .setColor(this.getTrustColor(trustScore.totalScore))
            .setThumbnail(targetUser.displayAvatarURL());

        if (trustScore.totalScore === 0) {
            embed.setDescription('❌ **No Trust Score Found**\n\nSign an NFT contract to begin trust scoring.')
                .addFields(
                    { name: '📋 Getting Started', value: 'Use `/trust init` to initialize your trust score with NFT contract verification.' },
                    { name: '🎯 Trust Benefits', value: '• Verified link rewards\n• Degen proof recognition\n• Scam reporting abilities\n• Community trust building' }
                );
        } else {
            const progressBar = this.createProgressBar(trustScore.totalScore, 1000);
            const breakdown = trustScore.breakdown;

            embed.setDescription(`**Trust Tier:** ${trustScore.trustTier}\n**Status:** ${trustScore.status.toUpperCase()}\n\n${progressBar}`)
                .addFields(
                    { name: '📊 Total Score', value: `**${trustScore.totalScore}**/1000`, inline: true },
                    { name: '🏆 Trust Tier', value: trustScore.trustTier, inline: true },
                    { name: '🚨 Sus Score', value: `${trustScore.susScore}/1000`, inline: true },
                    { name: '🎫 NFT Contract', value: `${breakdown.nftContract} points`, inline: true },
                    { name: '🔗 Verified Links', value: `${breakdown.verifiedLinks} points`, inline: true },
                    { name: '🎯 Degen Proof', value: `${breakdown.degenProofActions} points`, inline: true },
                    { name: '🚨 Scam Reports', value: `${breakdown.scamReporting} points`, inline: true },
                    { name: '📈 Growth Tips', value: this.getTrustGrowthTips(trustScore.totalScore), inline: false }
                );
        }

        // Action buttons
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('trust_verify_link')
                    .setLabel('Verify Link')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔗'),
                new ButtonBuilder()
                    .setCustomId('trust_degen_proof')
                    .setLabel('Degen Proof')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎯'),
                new ButtonBuilder()
                    .setCustomId('trust_summary')
                    .setLabel('Full Summary')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊')
            );

        await interaction.editReply({
            embeds: [embed],
            components: [actionRow]
        });
    },

    async handleVerifyLinkCommand(interaction) {
        const userId = interaction.user.id;
        const linkType = interaction.options.getString('type');
        const linkData = interaction.options.getString('link');

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.addVerifiedLink(userId, linkType, linkData);

        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Verified Link Added!')
                .setColor(0x00ff00)
                .setDescription('**Your verified link has been added successfully.**')
                .addFields(
                    { name: '🔗 Link Type', value: this.formatLinkType(linkType), inline: true },
                    { name: '⭐ Points Earned', value: `+${result.trustPointsAwarded}`, inline: true },
                    { name: '📊 New Total', value: `${result.newTotalScore}/1000`, inline: true },
                    { name: '💡 Next Steps', value: 'Continue adding verified links and recording degen proof actions to grow your trust score!' }
                );

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Link Verification Failed')
                .setColor(0xff0000)
                .setDescription(result.message)
                .addFields(
                    { name: '📋 Requirements', value: 'NFT contract must be signed before adding verified links' }
                );

            await interaction.editReply({ embeds: [embed] });
        }
    },

    async handleDegenProofCommand(interaction) {
        const userId = interaction.user.id;
        const proofType = interaction.options.getString('type');
        const description = interaction.options.getString('description');
        const evidence = interaction.options.getString('evidence') || '';

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.recordDegenProofAction(userId, proofType, description, evidence);

        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('🎯 Degen Proof Recorded!')
                .setColor(0x00ff00)
                .setDescription('**Your degen proof action has been verified and recorded.**')
                .addFields(
                    { name: '🎭 Proof Type', value: this.formatProofType(proofType), inline: true },
                    { name: '⭐ Points Earned', value: `+${result.trustPointsAwarded}`, inline: true },
                    { name: '🎁 Bonus', value: result.consistencyBonus > 0 ? `+${result.consistencyBonus}` : 'None', inline: true },
                    { name: '📊 New Total', value: `${result.newTotalScore}/1000`, inline: false },
                    { name: '📝 Description', value: description, inline: false }
                );

            if (result.consistencyBonus > 0) {
                embed.addFields({ name: '🔥 Consistency Bonus!', value: 'You earned bonus points for multiple degen proof actions!' });
            }

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Degen Proof Failed')
                .setColor(0xff0000)
                .setDescription(result.message)
                .addFields(
                    { name: '📋 Requirements', value: 'NFT contract must be signed before recording degen proof actions' }
                );

            await interaction.editReply({ embeds: [embed] });
        }
    },

    async handleReportScamCommand(interaction) {
        const reporterId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');
        const scamType = interaction.options.getString('type');
        const evidence = interaction.options.getString('evidence');
        const description = interaction.options.getString('description');

        await interaction.deferReply({ ephemeral: true });

        const result = await trustSystem.reportScamEvent(reporterId, targetUser.id, scamType, evidence, description);

        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('🚨 Scam Report Submitted')
                .setColor(0xff6600)
                .setDescription('**Your scam report has been submitted for review.**')
                .addFields(
                    { name: '👤 Reported User', value: targetUser.displayName, inline: true },
                    { name: '🚨 Scam Type', value: this.formatScamType(scamType), inline: true },
                    { name: '📋 Report ID', value: result.reportId, inline: true },
                    { name: '⭐ Trust Points', value: `+${result.trustPointsAwarded}`, inline: true },
                    { name: '⏱️ Status', value: 'Under Review', inline: true },
                    { name: '📝 Description', value: description.length > 100 ? description.substring(0, 100) + '...' : description, inline: false },
                    { name: '⚠️ Important', value: 'False reports may result in trust score penalties. Only report verified scams with solid evidence.' }
                );

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Scam Report Failed')
                .setColor(0xff0000)
                .setDescription(result.message)
                .addFields(
                    { name: '📋 Requirements', value: '• NFT contract signed\n• Trust score ≥ 200\n• Valid evidence provided' }
                );

            await interaction.editReply({ embeds: [embed] });
        }
    },

    async handleSummaryCommand(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetUserId = targetUser.id;

        await interaction.deferReply({ ephemeral: false });

        const summary = await trustSystem.getUserTrustSummary(targetUserId);

        if (summary.error) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Trust Summary Error')
                .setColor(0xff0000)
                .setDescription(summary.error)
                .addFields(
                    { name: '📋 Requirements', value: 'NFT contract must be signed to access trust system.' }
                );

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const userTrust = summary.userTrust;
        const riskEmoji = this.getRiskEmoji(summary.riskLevel);

        const embed = new EmbedBuilder()
            .setTitle(`${riskEmoji} Trust Summary - ${targetUser.displayName}`)
            .setColor(this.getTrustColor(userTrust.totalScore))
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(`**Trust Tier:** ${userTrust.trustTier}\n**Risk Level:** ${summary.riskLevel}`)
            .addFields(
                { name: '👤 User Trust Score', value: `**${userTrust.totalScore}**/1000\n${this.createProgressBar(userTrust.totalScore, 1000)}`, inline: false },
                { name: '🚨 Sus Score', value: `**${summary.susScore}**/1000`, inline: true },
                { name: '⚠️ Risk Level', value: summary.riskLevel.replace('_', ' '), inline: true },
                { name: '🎫 NFT Required', value: summary.nftContractRequired ? 'Yes' : 'No', inline: true }
            );

        // Trust breakdown
        if (userTrust.breakdown) {
            const breakdown = userTrust.breakdown;
            embed.addFields({
                name: '📊 Trust Score Breakdown',
                value: `🎫 NFT Contract: ${breakdown.nftContract}\n🔗 Verified Links: ${breakdown.verifiedLinks}\n🎯 Degen Proof: ${breakdown.degenProofActions}\n🚨 Scam Reports: ${breakdown.scamReporting}`,
                inline: false
            });
        }

        // Recommendations
        embed.addFields({
            name: '💡 Recommendations',
            value: this.getRecommendations(userTrust.totalScore, summary.susScore),
            inline: false
        });

        embed.setFooter({ text: `Last calculated: ${new Date(summary.calculatedAt).toLocaleString()}` });

        await interaction.editReply({ embeds: [embed] });
    },

    // Utility methods
    getTrustColor(score) {
        if (score >= 1000) return 0xFFD700; // Gold
        if (score >= 750) return 0x00FF00;  // Green
        if (score >= 500) return 0x32CD32;  // Lime
        if (score >= 250) return 0xFFFF00;  // Yellow
        if (score >= 100) return 0xFFA500;  // Orange
        return 0xFF0000; // Red
    },

    createProgressBar(current, max, length = 20) {
        const percentage = Math.min(current / max, 1);
        const filled = Math.round(percentage * length);
        const empty = length - filled;
        return `\`${'█'.repeat(filled)}${'░'.repeat(empty)}\` ${Math.round(percentage * 100)}%`;
    },

    getRiskEmoji(riskLevel) {
        const emojis = {
            'CRITICAL': '🚨',
            'HIGH_RISK': '⚠️',
            'MODERATE_HIGH': '🟡',
            'MODERATE_RISK': '🟡',
            'LOW_RISK': '🟢',
            'MINIMAL_RISK': '✅'
        };
        return emojis[riskLevel] || '❓';
    },

    formatLinkType(type) {
        const types = {
            'wallet': '🔗 Wallet Address',
            'casino': '🎰 Casino Account',
            'social': '📱 Social Media'
        };
        return types[type] || type;
    },

    formatProofType(type) {
        const types = {
            'loss_transparency': '📉 Loss Transparency',
            'tilt_recovery': '🔄 Tilt Recovery',
            'limit_adherence': '🎯 Limit Adherence',
            'profit_withdrawal': '💰 Profit Withdrawal',
            'community_help': '👥 Community Help'
        };
        return types[type] || type;
    },

    formatScamType(type) {
        const types = {
            'fake_giveaway': '🎁 Fake Giveaway',
            'phishing': '🎣 Phishing Link',
            'payment_fraud': '💳 Payment Fraud',
            'impersonation': '🎭 Impersonation',
            'other': '⚠️ Other Scam'
        };
        return types[type] || type;
    },

    getTrustGrowthTips(score) {
        if (score < 200) {
            return '🎯 Add verified links (+50 each)\n📝 Record degen proof actions (+45 each)';
        } else if (score < 500) {
            return '🚨 Report verified scams (+60 each)\n👥 Help community members (+35 each)';
        } else {
            return '🏆 Mentor new users\n🔄 Maintain consistency for bonus points';
        }
    },

    getRecommendations(trustScore, susScore) {
        let recommendations = [];

        if (trustScore < 200) {
            recommendations.push('🎫 Complete NFT contract verification');
            recommendations.push('🔗 Add verified wallet links');
        }

        if (trustScore < 500) {
            recommendations.push('🎯 Record degen proof actions');
            recommendations.push('👥 Engage with community');
        }

        if (susScore > 100) {
            recommendations.push('⚠️ Address suspicious activity');
            recommendations.push('🤝 Improve community interactions');
        }

        if (trustScore >= 500) {
            recommendations.push('🏆 Mentor new users');
            recommendations.push('🚨 Help verify scam reports');
        }

        return recommendations.length > 0 ? recommendations.join('\n') : '✅ Excellent trust profile!';
    }
};

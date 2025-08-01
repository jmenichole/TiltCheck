const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserTrustSystem = require('../userTrustSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-trust')
        .setDescription('View your comprehensive user trust score and behavioral analysis')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Check another user\'s trust score (admin only)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
        
        // Only allow admins to check other users
        if (targetUser.id !== interaction.user.id && !isAdmin) {
            return await interaction.reply({
                content: '❌ You can only view your own trust score. Admins can view others.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const NFTUserTrustSystem = require('../nftUserTrustSystem');

const trustSystem = new NFTUserTrustSystem();
            
            // Calculate scores
            const userTrustScore = await trustSystem.calculateUserTrustScore(targetUser.id);
            const casinoTrustScore = await trustSystem.calculateCasinoTrustScore(targetUser.id);
            const susScore = await trustSystem.calculateSusScore(targetUser.id);
            
            // Determine overall risk classification
            const riskClassification = trustSystem.classifyUserRisk(userTrustScore.totalScore, susScore);
            
            // Risk level styling
            const riskEmojis = {
                'HIGHLY_TRUSTED': '🟢',
                'TRUSTED': '🟡',
                'AVERAGE': '🟠',
                'DEVELOPING': '🔵',
                'NEW_USER': '⚪',
                'MODERATE_RISK': '🟠',
                'HIGH_RISK': '🔴',
                'CRITICAL_INTERVENTION': '🚨'
            };

            const riskColors = {
                'HIGHLY_TRUSTED': 0x00ff00,
                'TRUSTED': 0xffff00,
                'AVERAGE': 0xff8800,
                'DEVELOPING': 0x0088ff,
                'NEW_USER': 0x888888,
                'MODERATE_RISK': 0xff8800,
                'HIGH_RISK': 0xff0000,
                'CRITICAL_INTERVENTION': 0xff0000
            };

            // Create comprehensive trust score embed
            const trustEmbed = new EmbedBuilder()
                .setTitle(`${riskEmojis[riskClassification]} User Trust Analysis`)
                .setDescription(`Comprehensive behavioral and financial trust assessment for ${targetUser.username}`)
                .setColor(riskColors[riskClassification])
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    {
                        name: '📊 **Overall Risk Classification**',
                        value: `${riskEmojis[riskClassification]} **${riskClassification.replace('_', ' ')}**\n` +
                               `*${this.getRiskDescription(riskClassification)}*`,
                        inline: false
                    },
                    {
                        name: '👤 **User Trust Score**',
                        value: `**${userTrustScore.totalScore}/1000** (${userTrustScore.trustTier})\n` +
                               `🎯 Gambling Discipline: ${userTrustScore.breakdown.gamblingDiscipline}/300\n` +
                               `🤝 Community Behavior: ${userTrustScore.breakdown.communityBehavior}/250\n` +
                               `🔗 Accountability: ${userTrustScore.breakdown.accountabilityEngagement}/200\n` +
                               `📈 Consistency: ${userTrustScore.breakdown.consistencyPatterns}/150\n` +
                               `🌐 Support Network: ${userTrustScore.breakdown.supportNetworkActivity}/100`,
                        inline: true
                    },
                    {
                        name: '🏛️ **Casino Trust Score**',
                        value: `**${casinoTrustScore.totalScore}/100** (${casinoTrustScore.riskLevel.toUpperCase()})\n` +
                               `💳 Payment History: ${casinoTrustScore.breakdown.paymentHistory}/40\n` +
                               `🎰 Casino Connections: ${casinoTrustScore.breakdown.casinoConnections}/35\n` +
                               `🏛️ Compliance Bonus: ${casinoTrustScore.breakdown.complianceBonus}/10\n` +
                               `🌟 Diversity Bonus: ${casinoTrustScore.breakdown.diversityBonus}/10\n` +
                               `⭐ Respect Score: ${casinoTrustScore.breakdown.respectScore}/5`,
                        inline: true
                    },
                    {
                        name: '🚨 **Suspicious Activity Score**',
                        value: `**${susScore}/100** ${this.getSusEmoji(susScore)}\n` +
                               `${this.getSusDescription(susScore)}`,
                        inline: false
                    }
                );

            // Add intervention info if needed
            if (susScore >= 40) {
                trustEmbed.addFields({
                    name: '⚠️ **Active Monitoring**',
                    value: this.getInterventionMessage(riskClassification, susScore),
                    inline: false
                });
            }

            // Add improvement suggestions
            const improvements = this.getImprovementSuggestions(userTrustScore, casinoTrustScore, susScore);
            if (improvements.length > 0) {
                trustEmbed.addFields({
                    name: '💡 **Improvement Opportunities**',
                    value: improvements.join('\n'),
                    inline: false
                });
            }

            // Add access level information
            trustEmbed.addFields({
                name: '🔐 **Current Access Level**',
                value: this.getAccessLevelInfo(riskClassification, userTrustScore.totalScore, casinoTrustScore.totalScore),
                inline: false
            });

            trustEmbed.setFooter({
                text: `Trust scores update dynamically based on behavior | Last calculated: ${new Date().toLocaleString()}`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.editReply({ embeds: [trustEmbed] });

            // Trigger intervention if needed
            if (susScore >= 60) {
                await trustSystem.triggerIntervention(targetUser.id, riskClassification, susScore, userTrustScore.totalScore);
            }

        } catch (error) {
            console.error('User trust command error:', error);
            await interaction.editReply({
                content: '❌ An error occurred while calculating trust scores. Please try again later.',
                ephemeral: true
            });
        }
    },

    getRiskDescription(riskClass) {
        const descriptions = {
            'HIGHLY_TRUSTED': 'Elite community member with excellent gambling discipline and financial reliability',
            'TRUSTED': 'Reliable user with good behavioral patterns and established trust history',
            'AVERAGE': 'Standard user with normal monitoring requirements',
            'DEVELOPING': 'New or improving user building trust and learning accountability',
            'NEW_USER': 'Recently joined user establishing behavioral baseline',
            'MODERATE_RISK': 'Concerning patterns detected - enhanced monitoring active',
            'HIGH_RISK': 'Significant risk indicators - intervention protocols engaged',
            'CRITICAL_INTERVENTION': 'Emergency risk level - immediate support required'
        };
        return descriptions[riskClass] || 'Unknown risk classification';
    },

    getSusEmoji(susScore) {
        if (susScore >= 80) return '🚨';
        if (susScore >= 60) return '🔴';
        if (susScore >= 40) return '🟠';
        if (susScore >= 20) return '🟡';
        return '🟢';
    },

    getSusDescription(susScore) {
        if (susScore >= 80) return 'Critical risk patterns detected';
        if (susScore >= 60) return 'High-risk behaviors identified';
        if (susScore >= 40) return 'Moderate risk indicators present';
        if (susScore >= 20) return 'Minor risk factors noted';
        return 'Low risk behavioral patterns';
    },

    getInterventionMessage(riskClass, susScore) {
        if (riskClass === 'CRITICAL_INTERVENTION') {
            return '🚨 **Crisis Protocol Active**\n' +
                   '• Betting commands temporarily disabled\n' +
                   '• Accountability buddies notified\n' +
                   '• Mandatory cooling-off period initiated\n' +
                   '• Admin team alerted for immediate support';
        } else if (riskClass === 'HIGH_RISK') {
            return '⚠️ **Enhanced Support Active**\n' +
                   '• TiltCheck reminders increased\n' +
                   '• Buddy system activation recommended\n' +
                   '• Suggested betting limits in effect\n' +
                   '• Progress check-ins scheduled';
        } else if (riskClass === 'MODERATE_RISK') {
            return '💡 **Proactive Support Available**\n' +
                   '• Gentle accountability reminders\n' +
                   '• Resource sharing and guidance\n' +
                   '• Goal review prompts active\n' +
                   '• Community engagement encouraged';
        }
        return 'Standard monitoring protocols';
    },

    getImprovementSuggestions(userTrust, casinoTrust, susScore) {
        const suggestions = [];
        
        if (userTrust.breakdown.gamblingDiscipline < 200) {
            suggestions.push('• Use TiltCheck system more consistently to track sessions');
        }
        
        if (userTrust.breakdown.communityBehavior < 150) {
            suggestions.push('• Increase positive community engagement and help other users');
        }
        
        if (userTrust.breakdown.accountabilityEngagement < 100) {
            suggestions.push('• Join the accountability buddy system for peer support');
        }
        
        if (casinoTrust.breakdown.casinoConnections < 20) {
            suggestions.push('• Verify casino accounts with `/casino-verify` for better loan terms');
        }
        
        if (casinoTrust.breakdown.paymentHistory < 20) {
            suggestions.push('• Build payment history with successful loan repayments');
        }
        
        if (susScore >= 40) {
            suggestions.push('• Take regular breaks and consider setting betting limits');
            suggestions.push('• Engage with accountability resources when feeling tilted');
        }
        
        return suggestions.slice(0, 4); // Limit to top 4 suggestions
    },

    getAccessLevelInfo(riskClass, userScore, casinoScore) {
        let accessInfo = '';
        
        // Loan access
        if (casinoScore >= 85) accessInfo += '💰 **Elite Loan Terms**: 5% interest, 3.0x multiplier\n';
        else if (casinoScore >= 70) accessInfo += '💰 **Enhanced Loan Terms**: 8% interest, 2.2x multiplier\n';
        else if (casinoScore >= 50) accessInfo += '💰 **Standard Loan Terms**: 12% interest, 1.5x multiplier\n';
        else if (casinoScore >= 30) accessInfo += '💰 **Limited Loan Terms**: 18% interest, 0.9x multiplier\n';
        else accessInfo += '💰 **Restricted Loan Access**: 25% interest, 0.4x multiplier\n';
        
        // Community access
        if (userScore >= 800) accessInfo += '👑 **Mentor Role Eligible**: Can guide other users\n';
        else if (userScore >= 600) accessInfo += '🤝 **Buddy System Access**: Full accountability features\n';
        else if (userScore >= 400) accessInfo += '📊 **Standard Community Access**: Normal monitoring\n';
        else if (userScore >= 200) accessInfo += '🔍 **Enhanced Monitoring**: Building trust baseline\n';
        else accessInfo += '🆕 **New User Status**: Establishing behavior patterns\n';
        
        // Special restrictions
        if (riskClass.includes('RISK') || riskClass === 'CRITICAL_INTERVENTION') {
            accessInfo += '⚠️ **Active Restrictions**: Some features limited for safety';
        }
        
        return accessInfo;
    }
};

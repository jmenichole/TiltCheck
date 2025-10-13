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
const { DEGEN_APPROVED_CASINOS } = require('../front.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino-profile')
        .setDescription('View detailed casino compliance and performance profiles')
        .addStringOption(option =>
            option.setName('casino')
                .setDescription('Select a casino to view profile')
                .setRequired(true)
                .addChoices(
                    { name: 'Stake', value: 'stake' },
                    { name: 'Rollbit', value: 'rollbit' },
                    { name: 'Shuffle', value: 'shuffle' },
                    { name: 'BC.Game', value: 'bcgame' },
                    { name: 'MetaWin', value: 'metawin' },
                    { name: 'DuelBits', value: 'duelbits' }
                )),

    async execute(interaction) {
        const casino = interaction.options.getString('casino');
        const casinoData = DEGEN_APPROVED_CASINOS[casino];

        if (!casinoData) {
            return await interaction.reply('❌ Casino not found in our database.');
        }

        await interaction.deferReply();

        const compliance = casinoData.complianceProfile;
        const payouts = casinoData.payoutMetrics;
        const bonuses = casinoData.bonusCompliance;
        const trust = casinoData.trustFactors;

        // Status emojis
        const statusEmoji = {
            compliant: '✅',
            under_review: '⚠️',
            pending: '🔄',
            non_compliant: '❌'
        };

        const fairnessEmoji = {
            true: '✅',
            false: '❌'
        };

        // Calculate overall grades
        const getGrade = (score) => {
            if (score >= 95) return 'A+';
            if (score >= 90) return 'A';
            if (score >= 85) return 'B+';
            if (score >= 80) return 'B';
            if (score >= 75) return 'C+';
            if (score >= 70) return 'C';
            if (score >= 60) return 'D';
            return 'F';
        };

        // Payout performance analysis
        const payoutVariance = payouts.actualAverage;
        const statedHours = parseFloat(payouts.statedTimeframe.split('-')[1] || payouts.statedTimeframe.split(' ')[0]);
        const actualHours = parseFloat(payouts.actualAverage.split(' ')[0]);
        const performanceRatio = statedHours > 0 ? (actualHours / statedHours) : 1;
        
        let payoutRating = '✅ Excellent';
        if (performanceRatio > 2) payoutRating = '❌ Poor';
        else if (performanceRatio > 1.5) payoutRating = '⚠️ Fair';
        else if (performanceRatio > 1.2) payoutRating = '🟡 Good';

        // Bonus fairness analysis
        let bonusFairness = 0;
        if (bonuses.wageringRequirements.fair) bonusFairness += 25;
        if (bonuses.gameRestrictions.accurate) bonusFairness += 25;
        if (bonuses.maxBet.enforced) bonusFairness += 25;
        if (bonuses.bonusAbuse.prevention !== 'none') bonusFairness += 25;

        const profileMessage = `🎰 **${casinoData.name} - Compliance Profile**\n\n` +
            
            `**📊 Overall Ratings:**\n` +
            `• Compliance Score: ${compliance.complianceScore}/100 (${getGrade(compliance.complianceScore)})\n` +
            `• Trust Weight: ${casinoData.weight} (${casinoData.riskLevel})\n` +
            `• User Reviews: ${trust.userReviews}/5.0\n` +
            `• Platform Stability: ${trust.platformStability}%\n\n` +
            
            `**🏛️ Regulatory Compliance:**\n` +
            `${statusEmoji[compliance.regulatoryStatus]} Status: ${compliance.regulatoryStatus.toUpperCase()}\n` +
            `📜 Licenses: ${compliance.licenses.join(', ')}\n` +
            `🔍 KYC Required: ${compliance.kyc.required ? 'Yes' : 'No'} (${compliance.kyc.levels.join(', ')})\n` +
            `🛡️ AML Monitoring: ${compliance.aml.enabled ? compliance.aml.monitoring : 'Disabled'}\n` +
            `🎲 Provably Fair: ${fairnessEmoji[compliance.fairness.provablyFair]} ${compliance.fairness.provablyFair}\n` +
            `📋 Audited: ${fairnessEmoji[compliance.fairness.audited]} ${compliance.fairness.audited}\n` +
            `📅 Last Audit: ${compliance.lastAudit || 'Never'}\n\n` +
            
            `**💰 Payout Performance:**\n` +
            `⏱️ Stated: ${payouts.statedTimeframe} | Actual: ${payouts.actualAverage}\n` +
            `📈 Success Rate: ${payouts.successRate}% ${payoutRating}\n` +
            `💵 Min Withdrawal: $${payouts.minimumWithdrawal}\n` +
            `🏦 Daily Limit: $${payouts.maximumDaily.toLocaleString()}\n` +
            `💸 Fees: Crypto ${payouts.fees.crypto} | Fiat ${payouts.fees.fiat}\n\n` +
            
            `**🎁 Bonus Compliance (${bonusFairness}% Fair):**\n` +
            `📊 Wagering: ${bonuses.wageringRequirements.stated} (${bonuses.wageringRequirements.fair ? '✅' : '❌'} Fair)\n` +
            `🎰 Max Bet: $${bonuses.maxBet.stated} (${bonuses.maxBet.enforced ? '✅' : '❌'} Enforced)\n` +
            `🎮 Game Limits: ${bonuses.gameRestrictions.stated} (${bonuses.gameRestrictions.accurate ? '✅' : '❌'} Accurate)\n` +
            `⏰ Time Limit: ${bonuses.timeLimit.stated} (${bonuses.timeLimit.extended ? '⚠️' : '✅'} As Stated)\n` +
            `🔒 Abuse Prevention: ${bonuses.bonusAbuse.prevention}\n\n` +
            
            `**🎯 Trust Metrics:**\n` +
            `💳 Payout Reliability: ${trust.payoutReliability}%\n` +
            `🎁 Bonus Honoring: ${trust.bonusHonoring}%\n` +
            `🎧 Customer Support: ${trust.customerSupport}/5.0\n\n` +
            
            `**⚠️ Compliance Issues:**\n` +
            `${!bonuses.wageringRequirements.fair ? '• Unfair wagering requirements\n' : ''}` +
            `${!bonuses.gameRestrictions.accurate ? '• Inaccurate game restrictions\n' : ''}` +
            `${!bonuses.maxBet.enforced ? '• Max bet limits not enforced\n' : ''}` +
            `${compliance.regulatoryStatus !== 'compliant' ? '• Regulatory status pending\n' : ''}` +
            `${!compliance.fairness.audited ? '• No independent audits\n' : ''}` +
            `${bonuses.bonusAbuse.prevention === 'none' ? '• No bonus abuse prevention\n' : ''}` +
            `${compliance.complianceScore < 80 ? '• Below recommended compliance threshold\n' : ''}` +
            
            `\n*Trust scores are based on verifiable data and regulatory compliance metrics.*`;

        await interaction.editReply(profileMessage);
    },
};

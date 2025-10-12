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
const { 
    calculateEnhancedTrustScore,
    calculateEnhancedLoanAmount,
    processEnhancedLoan 
} = require('../front.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enhanced-loan')
        .setDescription('Request a loan with casino trust verification benefits')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Loan amount requested')
                .setRequired(true)
                .setMinValue(1000)
                .setMaxValue(1000000)),

    async execute(interaction) {
        const requestedAmount = interaction.options.getInteger('amount');
        const userId = interaction.user.id;

        await interaction.deferReply();

        try {
            // Calculate enhanced loan eligibility
            const loanCalculation = await calculateEnhancedLoanAmount(userId);
            const trustScore = loanCalculation.trustScore;

            // Check if user qualifies for enhanced loans
            if (trustScore.breakdown.verifiedCasinos === 0) {
                const noVerificationMessage = `❌ **Enhanced Loans Require Casino Verification**\n\n` +
                    `🎰 **No verified casino connections found**\n` +
                    `📊 **Current Trust Score:** ${trustScore.totalScore}/100\n` +
                    `💰 **Max Standard Loan:** $${loanCalculation.baseLoanAmount.toLocaleString()}\n\n` +
                    `**To unlock enhanced loans:**\n` +
                    `• Use \`/casino-verify\` to connect your casino accounts\n` +
                    `• Verify accounts at Stake, Rollbit, Shuffle, BC.Game, MetaWin, or DuelBits\n` +
                    `• Enhanced loans offer higher amounts and lower interest rates\n\n` +
                    `*Standard loans are still available via \`!front me <amount>\`*`;

                return await interaction.editReply(noVerificationMessage);
            }

            // Display loan eligibility information
            if (requestedAmount <= loanCalculation.maxLoanAmount) {
                // Process the enhanced loan
                const loanResult = await processEnhancedLoan(userId, requestedAmount, interaction);

                if (loanResult.success) {
                    await interaction.editReply(loanResult.message);
                } else {
                    await interaction.editReply(`❌ **Loan Processing Failed**\n\n${loanResult.error}`);
                }
            } else {
                // Amount exceeds limit - show detailed breakdown with compliance context
                const limitMessage = `⚠️ **Requested Amount Exceeds Limit**\n\n` +
                    `💰 **Requested:** $${requestedAmount.toLocaleString()}\n` +
                    `📈 **Maximum Available:** $${loanCalculation.maxLoanAmount.toLocaleString()}\n\n` +
                    `**📊 Trust Score Breakdown:**\n` +
                    `• Overall Score: ${trustScore.totalScore}/100 (${trustScore.risk})\n` +
                    `• Payment History: ${trustScore.breakdown.paymentHistory}/40\n` +
                    `• Casino Connections: ${trustScore.breakdown.casinoConnections}/35\n` +
                    `• Compliance Bonus: ${trustScore.breakdown.complianceBonus}/10\n` +
                    `• Casino Diversity: ${trustScore.breakdown.diversityBonus}/10\n` +
                    `• Respect Score: ${trustScore.breakdown.respectScore}/5\n\n` +
                    `**�️ Compliance Metrics:**\n` +
                    `• Avg Compliance Score: ${trustScore.breakdown.avgComplianceScore}/100\n` +
                    `• Verified Casinos: ${trustScore.breakdown.verifiedCasinos}\n` +
                    `• Regulatory Tier: ${loanCalculation.complianceMetrics.regulatoryBonus}\n\n` +
                    `**💡 To increase your limit:**\n` +
                    `• Verify high-compliance casinos (95+ score)\n` +
                    `• Focus on casinos with ✅ compliant regulatory status\n` +
                    `• Build payment history with successful loans\n` +
                    `• Maintain higher casino balances and VIP status\n` +
                    `• Use \`/casino-ranking\` to find top-tier casinos\n\n` +
                    `*Would you like to proceed with $${loanCalculation.maxLoanAmount.toLocaleString()}?*`;

                await interaction.editReply(limitMessage);
            }

        } catch (error) {
            console.error('Enhanced loan command error:', error);
            await interaction.editReply('❌ An error occurred while processing your enhanced loan request.');
        }
    },
};

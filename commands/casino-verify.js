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
    verifyCasinoConnection, 
    calculateEnhancedTrustScore,
    DEGEN_APPROVED_CASINOS 
} = require('../front.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino-verify')
        .setDescription('Verify your casino connections to improve loan terms')
        .addStringOption(option =>
            option.setName('casino')
                .setDescription('Select a casino to verify')
                .setRequired(true)
                .addChoices(
                    { name: 'Stake', value: 'stake' },
                    { name: 'Rollbit', value: 'rollbit' },
                    { name: 'Shuffle', value: 'shuffle' },
                    { name: 'BC.Game', value: 'bcgame' },
                    { name: 'MetaWin', value: 'metawin' },
                    { name: 'DuelBits', value: 'duelbits' }
                ))
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('Your casino username/wallet/ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('proof')
                .setDescription('API key, signature, or verification token')
                .setRequired(true)),

    async execute(interaction) {
        const casino = interaction.options.getString('casino');
        const identifier = interaction.options.getString('identifier');
        const proof = interaction.options.getString('proof');
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Prepare account details based on casino type
            let accountDetails = {};
            
            switch (casino) {
                case 'stake':
                    accountDetails = {
                        username: identifier,
                        signature: proof
                    };
                    break;
                case 'rollbit':
                    accountDetails = {
                        userId: identifier,
                        apiKey: proof
                    };
                    break;
                case 'shuffle':
                    accountDetails = {
                        publicKey: identifier,
                        signature: proof
                    };
                    break;
                case 'bcgame':
                    accountDetails = {
                        username: identifier,
                        authToken: proof
                    };
                    break;
                case 'metawin':
                    accountDetails = {
                        walletAddress: identifier,
                        signature: proof
                    };
                    break;
                case 'duelbits':
                    accountDetails = {
                        userId: identifier,
                        apiSecret: proof
                    };
                    break;
            }

            // Verify casino connection
            const verificationResult = await verifyCasinoConnection(userId, casino, accountDetails);

            if (verificationResult.success) {
                // Calculate updated trust score
                const trustScore = await calculateEnhancedTrustScore(userId);
                const casinoConfig = DEGEN_APPROVED_CASINOS[casino];

                const successMessage = `✅ **Casino Verification Successful!**\n\n` +
                    `🎰 **${casinoConfig.name}** connection verified\n` +
                    `📊 **Trust Weight:** ${casinoConfig.weight}\n` +
                    `🏛️ **Compliance Score:** ${casinoConfig.complianceProfile.complianceScore}/100\n` +
                    `💰 **Min Balance:** $${casinoConfig.minBalance.toLocaleString()}\n` +
                    `🏆 **Account Age:** ${verificationResult.data.accountAge} days\n` +
                    `💎 **VIP Level:** ${verificationResult.data.vipLevel || 'Standard'}\n\n` +
                    `**🔍 Regulatory Standing:**\n` +
                    `${casinoConfig.complianceProfile.regulatoryStatus === 'compliant' ? '✅' : '⚠️'} Status: ${casinoConfig.complianceProfile.regulatoryStatus.toUpperCase()}\n` +
                    `� Licenses: ${casinoConfig.complianceProfile.licenses[0]}\n` +
                    `🎲 Provably Fair: ${casinoConfig.complianceProfile.fairness.provablyFair ? '✅' : '❌'}\n` +
                    `📋 Audited: ${casinoConfig.complianceProfile.fairness.audited ? '✅' : '❌'}\n\n` +
                    `**📈 Updated Trust Metrics:**\n` +
                    `📊 **Trust Score:** ${trustScore.totalScore}/100 (${trustScore.risk.toUpperCase()})\n` +
                    `�️ **Avg Compliance:** ${trustScore.breakdown.avgComplianceScore}/100\n` +
                    `🔗 **Verified Casinos:** ${trustScore.breakdown.verifiedCasinos}\n` +
                    `💰 **Compliance Bonus:** +${trustScore.breakdown.complianceBonus} points\n\n` +
                    `*Enhanced trust score with compliance weighting improves loan terms and reduces risk assessment!*`;

                await interaction.editReply(successMessage);
            } else {
                const casinoConfig = DEGEN_APPROVED_CASINOS[casino];
                const errorMessage = `❌ **Verification Failed**\n\n` +
                    `🎰 Casino: ${casinoConfig.name}\n` +
                    `🏛️ Compliance Score: ${casinoConfig.complianceProfile.complianceScore}/100\n` +
                    `⚠️ Error: ${verificationResult.error}\n\n` +
                    `**📋 ${casinoConfig.name} Requirements:**\n` +
                    `• Min Balance: $${casinoConfig.minBalance.toLocaleString()}\n` +
                    `• KYC Required: ${casinoConfig.complianceProfile.kyc.required ? 'Yes' : 'No'}\n` +
                    `• Regulatory Status: ${casinoConfig.complianceProfile.regulatoryStatus}\n\n` +
                    `**🔧 Troubleshooting:**\n` +
                    `• Check your identifier format matches casino requirements\n` +
                    `• Ensure API key/signature is valid and current\n` +
                    `• Verify account meets minimum balance requirements\n` +
                    `• Complete KYC verification if required\n` +
                    `• Contact support if issues persist\n\n` +
                    `*Use \`/casino-profile ${casino}\` for detailed compliance information.*`;

                await interaction.editReply(errorMessage);
            }

        } catch (error) {
            console.error('Casino verification command error:', error);
            await interaction.editReply('❌ An error occurred during verification. Please try again later.');
        }
    },
};

const { SlashCommandBuilder } = require('discord.js');
const { 
    calculateEnhancedTrustScore,
    loadCasinoConnections,
    DEGEN_APPROVED_CASINOS 
} = require('../front.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trust-score')
        .setDescription('View your detailed casino trust score and loan eligibility'),

    async execute(interaction) {
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Calculate enhanced trust score
            const trustScore = await calculateEnhancedTrustScore(userId);
            const connections = loadCasinoConnections()[userId] || {};

            // Build casino connections display
            let casinoDisplay = '';
            const verifiedCasinos = [];
            
            for (const [casino, casinoData] of Object.entries(DEGEN_APPROVED_CASINOS)) {
                if (connections[casino] && connections[casino].verified) {
                    const conn = connections[casino];
                    verifiedCasinos.push({
                        name: casinoData.name,
                        weight: casinoData.weight,
                        accountAge: conn.accountAge,
                        vipLevel: conn.vipLevel,
                        avgBalance: conn.avgBalance
                    });
                    casinoDisplay += `✅ **${casinoData.name}** (Weight: ${casinoData.weight})\n` +
                        `   Age: ${conn.accountAge} days | VIP: ${conn.vipLevel || 'Standard'}\n`;
                } else {
                    casinoDisplay += `❌ **${casinoData.name}** (Not verified)\n`;
                }
            }

            // Risk level emoji and description
            const riskEmojis = {
                'very_low': '🟢',
                'low': '🟡', 
                'medium': '🟠',
                'high': '🔴',
                'very_high': '⚫'
            };

            const riskDescriptions = {
                'very_low': 'Elite Borrower - Maximum benefits',
                'low': 'Trusted Borrower - Enhanced terms',
                'medium': 'Standard Borrower - Regular terms',
                'high': 'High Risk - Limited terms',
                'very_high': 'Very High Risk - Restricted access'
            };

            // Interest rate preview
            const interestRates = {
                'very_low': '5%',
                'low': '8%',
                'medium': '12%',
                'high': '18%',
                'very_high': '25%'
            };

        const trustMessage = `🎯 **Your Casino Trust Score**\n\n` +
            `**📊 Overall Score: ${trustScore.totalScore}/100**\n` +
            `${riskEmojis[trustScore.risk]} **Risk Level:** ${trustScore.risk.toUpperCase()}\n` +
            `*${riskDescriptions[trustScore.risk]}*\n\n` +
            
            `**🔍 Score Breakdown:**\n` +
            `💳 Payment History: ${trustScore.breakdown.paymentHistory}/40\n` +
            `🎰 Casino Connections: ${trustScore.breakdown.casinoConnections}/35\n` +
            `🏛️ Compliance Bonus: ${trustScore.breakdown.complianceBonus}/10\n` +
            `🌟 Casino Diversity: ${trustScore.breakdown.diversityBonus}/10\n` +
            `🏆 Respect Score: ${trustScore.breakdown.respectScore}/5\n\n` +
            
            `**🏛️ Regulatory Standing:**\n` +
            `📈 Avg Compliance Score: ${trustScore.breakdown.avgComplianceScore}/100\n` +
            `🎰 Verified Casinos: ${trustScore.breakdown.verifiedCasinos}/6\n` +
            `🏅 Regulatory Tier: ${trustScore.breakdown.avgComplianceScore >= 90 ? 'Elite' : 
                                  trustScore.breakdown.avgComplianceScore >= 80 ? 'Standard' : 'Basic'}\n\n` +
            
            `**🎰 Casino Connections:**\n` +
            `${casinoDisplay}\n` +
            
            `**💰 Enhanced Loan Benefits:**\n` +
            `📈 Interest Rate: ${interestRates[trustScore.risk]}\n` +
            `💎 Trust Multiplier: ${trustScore.totalScore >= 85 ? '3.0x' : 
                                  trustScore.totalScore >= 70 ? '2.2x' :
                                  trustScore.totalScore >= 50 ? '1.5x' :
                                  trustScore.totalScore >= 30 ? '0.9x' : '0.4x'}\n` +
            `🏛️ Compliance Bonus: ${trustScore.breakdown.avgComplianceScore >= 95 ? '+30%' :
                                   trustScore.breakdown.avgComplianceScore >= 90 ? '+80%' :
                                   trustScore.breakdown.avgComplianceScore >= 80 ? '+50%' : 'None'}\n` +
            `🔗 Multi-Casino Bonus: ${trustScore.breakdown.verifiedCasinos >= 3 ? 'Yes' : 'None'}\n\n` +
            
            `**📈 Improvement Tips:**\n` +
            `${trustScore.breakdown.verifiedCasinos < 3 ? '• Verify more high-compliance casino accounts\n' : ''}` +
            `${trustScore.breakdown.paymentHistory < 30 ? '• Build payment history with successful loans\n' : ''}` +
            `${trustScore.breakdown.respectScore < 4 ? '• Increase server respect points\n' : ''}` +
            `${trustScore.breakdown.avgComplianceScore < 80 ? '• Focus on casinos with better regulatory standing\n' : ''}` +
            `• Maintain higher casino balances for better scores\n` +
            `• Choose casinos with proven payout reliability\n\n` +
            
            `*Use \`/casino-verify\` to connect compliant casinos and \`/casino-profile\` to check regulatory standings!*`;            await interaction.editReply(trustMessage);

        } catch (error) {
            console.error('Trust score command error:', error);
            await interaction.editReply('❌ An error occurred while calculating your trust score.');
        }
    },
};

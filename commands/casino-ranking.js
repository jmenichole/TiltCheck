const { SlashCommandBuilder } = require('discord.js');
const { DEGEN_APPROVED_CASINOS } = require('../front.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino-ranking')
        .setDescription('View ranked casino compliance and performance leaderboard'),

    async execute(interaction) {
        await interaction.deferReply();

        // Sort casinos by compliance score and trust factors
        const casinoRankings = Object.entries(DEGEN_APPROVED_CASINOS)
            .map(([key, data]) => ({
                key,
                name: data.name,
                weight: data.weight,
                complianceScore: data.complianceProfile.complianceScore,
                regulatoryStatus: data.complianceProfile.regulatoryStatus,
                payoutReliability: data.payoutMetrics.successRate,
                bonusHonoring: data.trustFactors.bonusHonoring,
                userReviews: data.trustFactors.userReviews,
                overallScore: calculateOverallScore(data)
            }))
            .sort((a, b) => b.overallScore - a.overallScore);

        // Calculate overall scores
        function calculateOverallScore(casino) {
            const compliance = casino.complianceProfile.complianceScore * 0.3;
            const payout = casino.payoutMetrics.successRate * 0.25;
            const bonus = casino.trustFactors.bonusHonoring * 0.2;
            const reviews = (casino.trustFactors.userReviews / 5) * 100 * 0.15;
            const stability = casino.trustFactors.platformStability * 0.1;
            
            return Math.round(compliance + payout + bonus + reviews + stability);
        }

        // Status emojis
        const statusEmoji = {
            compliant: '✅',
            under_review: '⚠️',
            pending: '🔄',
            non_compliant: '❌'
        };

        const medalEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'];

        let rankingMessage = `🏆 **Casino Compliance & Performance Rankings**\n\n`;

        casinoRankings.forEach((casino, index) => {
            const grade = getGrade(casino.overallScore);
            const trustMultiplier = getTrustMultiplier(casino.complianceScore, casino.weight);
            
            rankingMessage += `${medalEmojis[index]} **${casino.name}** (${grade})\n` +
                `   📊 Overall: ${casino.overallScore}/100 | Weight: ${casino.weight}\n` +
                `   ${statusEmoji[casino.regulatoryStatus]} Compliance: ${casino.complianceScore}/100\n` +
                `   💰 Payout Rate: ${casino.payoutReliability}% | Reviews: ${casino.userReviews}/5\n` +
                `   🎁 Bonus Fair: ${casino.bonusHonoring}% | Trust Multi: ${trustMultiplier}x\n\n`;
        });

        // Add recommendations
        rankingMessage += `**🎯 Verification Recommendations:**\n\n`;
        
        const topTier = casinoRankings.filter(c => c.overallScore >= 90);
        const midTier = casinoRankings.filter(c => c.overallScore >= 75 && c.overallScore < 90);
        const lowTier = casinoRankings.filter(c => c.overallScore < 75);

        if (topTier.length > 0) {
            rankingMessage += `🟢 **Elite Tier (90+):** ${topTier.map(c => c.name).join(', ')}\n` +
                `*Highest trust weights, best compliance, maximum loan benefits*\n\n`;
        }

        if (midTier.length > 0) {
            rankingMessage += `🟡 **Standard Tier (75-89):** ${midTier.map(c => c.name).join(', ')}\n` +
                `*Good reliability, moderate trust weights, standard benefits*\n\n`;
        }

        if (lowTier.length > 0) {
            rankingMessage += `🔴 **Caution Tier (<75):** ${lowTier.map(c => c.name).join(', ')}\n` +
                `*Lower trust weights, compliance issues, limited benefits*\n\n`;
        }

        rankingMessage += `**💡 Pro Tips:**\n` +
            `• Verify top-tier casinos for maximum trust multipliers\n` +
            `• Check \`/casino-profile <casino>\` for detailed compliance data\n` +
            `• Focus on casinos with ✅ compliant regulatory status\n` +
            `• Diversify across multiple high-compliance casinos for bonuses\n\n` +
            `*Rankings update based on real-time compliance monitoring and user feedback.*`;

        await interaction.editReply(rankingMessage);

        function getGrade(score) {
            if (score >= 95) return 'A+';
            if (score >= 90) return 'A';
            if (score >= 85) return 'B+';
            if (score >= 80) return 'B';
            if (score >= 75) return 'C+';
            if (score >= 70) return 'C';
            if (score >= 60) return 'D';
            return 'F';
        }

        function getTrustMultiplier(complianceScore, baseWeight) {
            let multiplier = baseWeight;
            
            // Compliance adjustment
            if (complianceScore >= 95) multiplier *= 1.2;
            else if (complianceScore >= 90) multiplier *= 1.1;
            else if (complianceScore >= 80) multiplier *= 1.0;
            else if (complianceScore >= 70) multiplier *= 0.9;
            else multiplier *= 0.7;
            
            return Math.round(multiplier * 10) / 10;
        }
    },
};

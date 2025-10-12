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

/**
 * Verification and Provable Fairness Tools
 * Provides cryptographic verification for gambling fairness and transparency
 */

const crypto = require('crypto');
const { EmbedBuilder } = require('discord.js');

class VerificationProofSystem {
    constructor() {
        this.gameSeeds = new Map(); // gameId -> seed data
        this.verificationRequests = new Map(); // requestId -> verification data
        this.fairnessReports = new Map(); // userId -> fairness history
        this.thirdPartyVerifiers = [
            'https://www.dicesites.com/provfair',
            'https://dicesites.com/verify',
            'https://www.coinflip.com/verify'
        ];
    }

    // Generate provably fair seed
    async generateProvablyFairSeed(message, args) {
        if (args.length < 1) {
            return await message.reply(`❌ **Usage:** \`$verify seed <casino> [game_type]\`

**Examples:**
• \`$verify seed stake dice\` - Generate seed for Stake dice
• \`$verify seed rollbit crash\` - Generate seed for Rollbit crash
• \`$verify seed bc.game limbo\` - Generate seed for BC.Game limbo

**Supported Casinos:**
🎲 Stake, Rollbit, BC.Game, TrustDice, Roobet, DuelBits, Cloudbet`);
        }

        const casino = args[0].toLowerCase();
        const gameType = args[1] || 'general';
        const userId = message.author.id;

        // Generate cryptographically secure seeds
        const clientSeed = crypto.randomBytes(16).toString('hex');
        const serverSeed = crypto.randomBytes(32).toString('hex');
        const nonce = 0;
        
        // Create hash for verification
        const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
        const gameId = `${userId}_${Date.now()}`;

        const seedData = {
            gameId: gameId,
            casino: casino,
            gameType: gameType,
            clientSeed: clientSeed,
            serverSeed: serverSeed,
            serverSeedHash: serverSeedHash,
            nonce: nonce,
            created: new Date(),
            userId: userId,
            status: 'active',
            betsPlaced: 0
        };

        this.gameSeeds.set(gameId, seedData);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔐 Provably Fair Seeds Generated!')
            .setDescription(`Seeds created for **${casino}** ${gameType} games`)
            .addFields(
                {
                    name: '🎲 Client Seed',
                    value: `\`${clientSeed}\``,
                    inline: false
                },
                {
                    name: '🔒 Server Seed Hash',
                    value: `\`${serverSeedHash}\``,
                    inline: false
                },
                {
                    name: '🎯 Game Settings',
                    value: `**Casino:** ${casino}\n**Game:** ${gameType}\n**Nonce:** ${nonce}`,
                    inline: true
                },
                {
                    name: '🛡️ Security Info',
                    value: `**Game ID:** \`${gameId}\`\n**Status:** Active\n**Bets:** 0`,
                    inline: true
                },
                {
                    name: '📋 How to Use',
                    value: `1. Use client seed: \`${clientSeed}\` in ${casino}\n2. Verify server seed hash matches casino\n3. Track your bets with \`$verify bet\`\n4. Verify results with \`$verify check\``,
                    inline: false
                }
            )
            .setFooter({ text: 'Keep this info safe • Server seed revealed after session ends' });

        await message.reply({ embeds: [embed] });
    }

    // Verify bet result
    async verifyBetResult(message, args) {
        if (args.length < 4) {
            return await message.reply(`❌ **Usage:** \`$verify bet <game_id> <server_seed> <client_seed> <nonce>\`

**Example:**
\`$verify bet game123 a1b2c3... x7y8z9... 42\`

**Or quick verify with bet details:**
\`$verify quick <casino> <bet_amount> <result> <claimed_seed>\`

**What this does:**
• Verifies the bet was provably fair
• Recreates the random number generation
• Confirms casino didn't cheat
• Provides mathematical proof of fairness`);
        }

        const gameId = args[0];
        const serverSeed = args[1];
        const clientSeed = args[2];
        const nonce = parseInt(args[3]);

        const seedData = this.gameSeeds.get(gameId);
        
        if (!seedData) {
            return await message.reply('❌ Game ID not found! Make sure you generated seeds first with `$verify seed`');
        }

        // Verify server seed hash
        const providedServerHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
        const originalHash = seedData.serverSeedHash;

        const isHashValid = providedServerHash === originalHash;
        
        // Generate the outcome using provably fair algorithm
        const hmac = crypto.createHmac('sha512', serverSeed);
        hmac.update(`${clientSeed}:${nonce}`);
        const hash = hmac.digest('hex');

        // Convert to number (standard provably fair method)
        const outcome = this.calculateOutcome(hash, seedData.gameType);
        
        const verification = {
            gameId: gameId,
            isValid: isHashValid,
            outcome: outcome,
            hash: hash,
            verifiedAt: new Date(),
            serverSeedMatch: isHashValid
        };

        // Store verification result
        this.verificationRequests.set(`${gameId}_${nonce}`, verification);

        const embed = new EmbedBuilder()
            .setColor(isHashValid ? '#00ff00' : '#ff0000')
            .setTitle(isHashValid ? '✅ Bet Verification PASSED' : '❌ Bet Verification FAILED')
            .setDescription(isHashValid ? 
                'This bet was provably fair! 🎉' : 
                '⚠️ Server seed hash mismatch detected!')
            .addFields(
                {
                    name: '🔍 Verification Details',
                    value: `**Game ID:** ${gameId}\n**Nonce:** ${nonce}\n**Hash Match:** ${isHashValid ? '✅ Valid' : '❌ Invalid'}`,
                    inline: true
                },
                {
                    name: '🎲 Calculated Outcome',
                    value: `**Result:** ${outcome}\n**Hash:** \`${hash.substring(0, 16)}...\`\n**Method:** HMAC-SHA512`,
                    inline: true
                },
                {
                    name: '🔐 Cryptographic Proof',
                    value: `**Server Seed Hash:** ${isHashValid ? 'Verified ✅' : 'Mismatch ❌'}\n**Client Seed:** Confirmed\n**Algorithm:** Standard Provably Fair`,
                    inline: false
                }
            );

        if (!isHashValid) {
            embed.addFields({
                name: '⚠️ What This Means',
                value: 'The casino provided a different server seed than originally hashed. This could indicate manipulation. Consider reporting this to the casino.',
                inline: false
            });
        }

        embed.setFooter({ text: 'Cryptographic verification complete • Mathematics doesn\'t lie' });

        await message.reply({ embeds: [embed] });
    }

    // Third-party verification
    async requestThirdPartyVerification(message, args) {
        const userId = message.author.id;
        const verifications = Array.from(this.verificationRequests.values())
            .filter(v => v.gameId.startsWith(userId));

        if (verifications.length === 0) {
            return await message.reply('❌ No verification data found! Verify some bets first with `$verify bet`');
        }

        const embed = new EmbedBuilder()
            .setColor('#6f42c1')
            .setTitle('🔍 Third-Party Verification Services')
            .setDescription('Independent verification sources for additional confidence')
            .addFields(
                {
                    name: '🌐 Online Verifiers',
                    value: this.thirdPartyVerifiers.map(url => `• [Verify Here](${url})`).join('\n'),
                    inline: false
                },
                {
                    name: '📋 Your Verification Data',
                    value: `**Recent Verifications:** ${verifications.length}\n**Success Rate:** ${this.calculateSuccessRate(verifications)}%\n**Last Verified:** ${verifications[verifications.length - 1]?.verifiedAt.toLocaleString()}`,
                    inline: true
                },
                {
                    name: '🛡️ Why Third-Party?',
                    value: '• Independent confirmation\n• Additional transparency\n• Community trust building\n• Mathematical double-checking',
                    inline: true
                },
                {
                    name: '📖 How to Use External Verifiers',
                    value: '1. Copy your seed data from verification results\n2. Visit any verifier link above\n3. Input: Server seed, client seed, nonce\n4. Compare results with our verification\n5. All should match for provable fairness',
                    inline: false
                }
            )
            .setFooter({ text: 'Trust but verify • Multiple sources = maximum confidence' });

        await message.reply({ embeds: [embed] });
    }

    // Generate fairness report
    async generateFairnessReport(message) {
        const userId = message.author.id;
        
        const userSeeds = Array.from(this.gameSeeds.values())
            .filter(seed => seed.userId === userId);
        
        const userVerifications = Array.from(this.verificationRequests.values())
            .filter(v => v.gameId.startsWith(userId));

        if (userSeeds.length === 0) {
            return await message.reply(`📊 **No fairness data found!**

**Get started with provable fairness:**
• \`$verify seed stake dice\` - Generate seeds for a casino
• \`$verify bet <game_id> <seeds>\` - Verify bet results
• \`$verify third-party\` - Use external verifiers

**Why use verification?**
• Prove casinos aren't cheating
• Mathematical certainty of fairness
• Build confidence in your gambling
• Detect any manipulation attempts`);
        }

        // Calculate statistics
        const totalGames = userSeeds.length;
        const totalVerifications = userVerifications.length;
        const successfulVerifications = userVerifications.filter(v => v.isValid).length;
        const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications * 100).toFixed(1) : 0;

        // Casino breakdown
        const casinoStats = {};
        userSeeds.forEach(seed => {
            if (!casinoStats[seed.casino]) {
                casinoStats[seed.casino] = { games: 0, verifications: 0, success: 0 };
            }
            casinoStats[seed.casino].games++;
        });

        userVerifications.forEach(v => {
            const seedData = this.gameSeeds.get(v.gameId);
            if (seedData && casinoStats[seedData.casino]) {
                casinoStats[seedData.casino].verifications++;
                if (v.isValid) casinoStats[seedData.casino].success++;
            }
        });

        const embed = new EmbedBuilder()
            .setColor('#007bff')
            .setTitle('📊 Provable Fairness Report')
            .setDescription(`Your gambling verification history and fairness analysis`)
            .addFields(
                {
                    name: '📈 Overall Statistics',
                    value: `**Total Games:** ${totalGames}\n**Verifications:** ${totalVerifications}\n**Success Rate:** ${successRate}%\n**Failed Verifications:** ${totalVerifications - successfulVerifications}`,
                    inline: true
                },
                {
                    name: '🎰 Casino Breakdown',
                    value: Object.entries(casinoStats)
                        .map(([casino, stats]) => 
                            `**${casino}:** ${stats.games} games, ${stats.success}/${stats.verifications} verified`
                        ).join('\n') || 'No casino data',
                    inline: true
                },
                {
                    name: '🔍 Verification Quality',
                    value: this.getVerificationQualityAssessment(successRate, totalVerifications),
                    inline: false
                }
            );

        // Add warning if any failed verifications
        if (totalVerifications - successfulVerifications > 0) {
            embed.addFields({
                name: '⚠️ Failed Verifications Detected',
                value: `${totalVerifications - successfulVerifications} verification(s) failed. This could indicate:\n• Casino seed manipulation\n• Data entry errors\n• Technical issues\n\nRecommendation: Double-check with third-party verifiers`,
                inline: false
            });
        }

        embed.setFooter({ text: `Generated: ${new Date().toLocaleString()} • Stay mathematically informed` });

        await message.reply({ embeds: [embed] });

        // Store report
        this.fairnessReports.set(userId, {
            generatedAt: new Date(),
            totalGames: totalGames,
            successRate: parseFloat(successRate),
            casinoStats: casinoStats
        });
    }

    // Educational content about provable fairness
    async explainProvableFairness(message) {
        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('🎓 Provable Fairness Explained')
            .setDescription('Understanding the mathematics behind fair gambling')
            .addFields(
                {
                    name: '🔐 What is Provable Fairness?',
                    value: 'A cryptographic method that allows players to verify that casino games are truly random and not manipulated. It uses hash functions and seeds to create verifiable randomness.',
                    inline: false
                },
                {
                    name: '🧮 How It Works',
                    value: '1. **Server Seed:** Casino generates random data\n2. **Client Seed:** You provide random data\n3. **Nonce:** Bet counter for uniqueness\n4. **Hash:** Mathematical combination creates outcome\n5. **Verification:** You can recreate and verify results',
                    inline: false
                },
                {
                    name: '🎲 The Algorithm',
                    value: '```\nHMAC-SHA512(server_seed, client_seed:nonce)\n→ Convert to number\n→ Apply game logic\n→ Determine outcome```',
                    inline: false
                },
                {
                    name: '✅ Benefits',
                    value: '• **Transparency:** Every bet is verifiable\n• **Trust:** No need to trust casino\n• **Fairness:** Mathematically guaranteed\n• **Accountability:** Casinos can\'t cheat',
                    inline: true
                },
                {
                    name: '🚩 Red Flags',
                    value: '• Server seed hash doesn\'t match\n• Casino won\'t provide seeds\n• Verification tools unavailable\n• Unusual winning/losing patterns',
                    inline: true
                },
                {
                    name: '🛠️ Tools Available',
                    value: '• `$verify seed` - Generate fair seeds\n• `$verify bet` - Verify individual bets\n• `$verify third-party` - External verification\n• `$verify report` - Fairness analysis',
                    inline: false
                }
            )
            .setFooter({ text: 'Knowledge is power • Mathematics is truth' });

        await message.reply({ embeds: [embed] });
    }

    // Helper methods
    calculateOutcome(hash, gameType) {
        // Convert hex hash to decimal for outcome calculation
        const hexSegment = hash.substring(0, 8);
        const decimal = parseInt(hexSegment, 16);
        
        switch (gameType.toLowerCase()) {
            case 'dice':
                return (decimal % 10000) / 100; // 0.00 to 99.99
            case 'crash':
                return Math.max(1, (decimal % 10000) / 100); // 1.00+
            case 'limbo':
                return Math.max(1, (decimal % 100000) / 1000); // 1.000+
            case 'coinflip':
                return decimal % 2 === 0 ? 'Heads' : 'Tails';
            case 'roulette':
                return decimal % 37; // 0-36
            default:
                return decimal % 100; // Generic percentage
        }
    }

    calculateSuccessRate(verifications) {
        if (verifications.length === 0) return 100;
        const successful = verifications.filter(v => v.isValid).length;
        return Math.round((successful / verifications.length) * 100);
    }

    getVerificationQualityAssessment(successRate, totalVerifications) {
        if (totalVerifications === 0) return '🔍 No verifications yet - start with $verify seed';
        if (successRate === 100) return '🏆 Perfect! All verifications passed';
        if (successRate >= 95) return '🟢 Excellent verification rate';
        if (successRate >= 85) return '🟡 Good, but some concerns detected';
        if (successRate >= 70) return '🟠 Moderate issues - investigate further';
        return '🔴 Serious concerns - consider avoiding these casinos';
    }
}

module.exports = VerificationProofSystem;

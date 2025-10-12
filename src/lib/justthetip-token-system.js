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

// JustTheTip Token System - Custom Token Tipping & Rewards for TiltCheck Community
// Alternative to Collab.Land SmartTag with enhanced responsible gaming features

const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, transfer, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

class JustTheTipTokenSystem {
    constructor(config) {
        this.connection = new Connection(config.rpcUrl || 'https://api.mainnet-beta.solana.com');
        this.adminWallet = config.adminWallet;
        this.supportedTokens = config.supportedTokens || {};
        this.userAccounts = new Map(); // In production, use database
        this.transactionHistory = new Map();
        this.communityFees = config.communityFee || 0.02; // 2% fee like Collab.Land
        this.responsibleLimits = config.responsibleLimits || {};
    }

    // Initialize user's Smart Account (like Collab.Land but with responsible gaming features)
    async initializeUserAccount(discordUserId, username) {
        try {
            if (this.userAccounts.has(discordUserId)) {
                return this.userAccounts.get(discordUserId);
            }

            // Create new Keypair for user (stored securely)
            const userKeypair = Keypair.generate();
            const smartAccount = {
                userId: discordUserId,
                username: username,
                publicKey: userKeypair.publicKey.toBase58(),
                secretKey: userKeypair.secretKey, // Encrypted in production
                balances: {},
                nftBalances: [],
                transactionHistory: [],
                responsibleGamingLimits: {
                    dailyTipLimit: this.responsibleLimits.dailyTipLimit || 100,
                    weeklyReceiveLimit: this.responsibleLimits.weeklyReceiveLimit || 500,
                    totalTippedToday: 0,
                    totalReceivedThisWeek: 0,
                    lastResetDaily: new Date().toDateString(),
                    lastResetWeekly: this.getWeekStart()
                },
                tiltCheckVerified: false,
                degenTrustScore: 0,
                createdAt: new Date(),
                soundPreferences: {
                    enableTipSounds: true,
                    enableRewardSounds: true,
                    volume: 0.5
                }
            };

            this.userAccounts.set(discordUserId, smartAccount);
            
            // Send welcome message with blackjackson sound reference
            return {
                success: true,
                account: smartAccount,
                welcomeMessage: `🎉 JustTheTip Token Account created! Your wallet: \`${smartAccount.publicKey}\`\n🎵 Tip sounds by blackjackson enabled by default.\n🛡️ Responsible gaming limits active for your protection.`
            };

        } catch (error) {
            console.error('Error initializing user account:', error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced tip command with responsible gaming checks
    async tipUser(senderId, recipientId, amount, tokenSymbol, channelId) {
        try {
            const sender = this.userAccounts.get(senderId);
            const recipient = this.userAccounts.get(recipientId);

            if (!sender || !recipient) {
                return { success: false, error: 'One or both users need to initialize their TipGuard account first. Use `/tipguard balance` to get started!' };
            }

            // Responsible Gaming Checks
            const responsibleCheck = this.checkResponsibleLimits(sender, recipient, amount, tokenSymbol);
            if (!responsibleCheck.allowed) {
                return { 
                    success: false, 
                    error: `🛡️ Responsible Gaming Protection: ${responsibleCheck.reason}`,
                    supportMessage: 'Consider taking a break or reviewing your gaming habits. Visit our support resources if needed.'
                };
            }

            // Check token support and balance
            const token = this.supportedTokens[tokenSymbol];
            if (!token) {
                return { success: false, error: `Token ${tokenSymbol} not supported in this community.` };
            }

            if (!sender.balances[tokenSymbol] || sender.balances[tokenSymbol] < amount) {
                return { success: false, error: `Insufficient ${tokenSymbol} balance. Use \`/tilttag deposit\` to add funds.` };
            }

            // Execute transfer (on-chain transaction)
            const transaction = await this.executeTransfer(sender, recipient, amount, token);
            
            if (transaction.success) {
                // Update balances
                sender.balances[tokenSymbol] -= amount;
                const feeAmount = amount * this.communityFees;
                const receivedAmount = amount - feeAmount;
                
                recipient.balances[tokenSymbol] = (recipient.balances[tokenSymbol] || 0) + receivedAmount;

                // Update responsible gaming counters
                sender.responsibleGamingLimits.totalTippedToday += amount;
                recipient.responsibleGamingLimits.totalReceivedThisWeek += receivedAmount;

                // Record transaction
                const txRecord = {
                    id: transaction.signature,
                    from: senderId,
                    to: recipientId,
                    amount: amount,
                    token: tokenSymbol,
                    fee: feeAmount,
                    timestamp: new Date(),
                    type: 'tip',
                    channelId: channelId,
                    responsibleGamingFlag: responsibleCheck.warnings.length > 0
                };

                this.recordTransaction(txRecord);

                return {
                    success: true,
                    transaction: txRecord,
                    embed: this.createTipEmbed(sender, recipient, amount, tokenSymbol, transaction.signature),
                    playSound: true // Trigger blackjackson's sound
                };
            }

            return { success: false, error: 'Transaction failed on blockchain' };

        } catch (error) {
            console.error('Error processing tip:', error);
            return { success: false, error: error.message };
        }
    }

    // Responsible gaming limit checks
    checkResponsibleLimits(sender, recipient, amount, tokenSymbol) {
        const today = new Date().toDateString();
        const thisWeek = this.getWeekStart();
        
        // Reset counters if needed
        if (sender.responsibleGamingLimits.lastResetDaily !== today) {
            sender.responsibleGamingLimits.totalTippedToday = 0;
            sender.responsibleGamingLimits.lastResetDaily = today;
        }

        if (recipient.responsibleGamingLimits.lastResetWeekly !== thisWeek) {
            recipient.responsibleGamingLimits.totalReceivedThisWeek = 0;
            recipient.responsibleGamingLimits.lastResetWeekly = thisWeek;
        }

        const warnings = [];
        
        // Check daily tip limit for sender
        if (sender.responsibleGamingLimits.totalTippedToday + amount > sender.responsibleGamingLimits.dailyTipLimit) {
            return { 
                allowed: false, 
                reason: `Daily tip limit reached (${sender.responsibleGamingLimits.dailyTipLimit} ${tokenSymbol}). Resets tomorrow.`,
                warnings: ['daily_limit_exceeded']
            };
        }

        // Check weekly receive limit for recipient
        if (recipient.responsibleGamingLimits.totalReceivedThisWeek + amount > recipient.responsibleGamingLimits.weeklyReceiveLimit) {
            return { 
                allowed: false, 
                reason: `Recipient's weekly receive limit would be exceeded. This protects against excessive accumulation.`,
                warnings: ['weekly_receive_limit']
            };
        }

        // Warning thresholds (allow but warn)
        if (sender.responsibleGamingLimits.totalTippedToday + amount > sender.responsibleGamingLimits.dailyTipLimit * 0.8) {
            warnings.push('approaching_daily_limit');
        }

        return { allowed: true, warnings: warnings };
    }

    // Create raindrops/giveaways with responsible gaming features
    async createRaindrop(adminId, amount, tokenSymbol, duration, maxEntries, channelId) {
        try {
            const raindrop = {
                id: Date.now().toString(),
                createdBy: adminId,
                amount: amount,
                token: tokenSymbol,
                duration: duration,
                maxEntries: maxEntries,
                entries: new Set(),
                channelId: channelId,
                createdAt: new Date(),
                endsAt: new Date(Date.now() + duration * 60000), // duration in minutes
                active: true,
                responsibleGamingNote: 'Remember to play responsibly! This is for fun and community engagement.'
            };

            // Store raindrop (in production, use database)
            this.activeRaindrops = this.activeRaindrops || new Map();
            this.activeRaindrops.set(raindrop.id, raindrop);

            // Auto-end raindrop after duration
            setTimeout(() => {
                this.endRaindrop(raindrop.id);
            }, duration * 60000);

            return {
                success: true,
                raindrop: raindrop,
                embed: this.createRaindropEmbed(raindrop)
            };

        } catch (error) {
            console.error('Error creating raindrop:', error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced balance command with responsible gaming insights
    async getUserBalance(userId) {
        const user = this.userAccounts.get(userId);
        if (!user) {
            const initResult = await this.initializeUserAccount(userId, 'Unknown');
            if (!initResult.success) {
                return initResult;
            }
            return this.getUserBalance(userId);
        }

        const embed = new EmbedBuilder()
            .setColor('#60A5FA')
            .setTitle(`🛡️ TiltTag Balance - ${user.username}`)
            .setDescription(`Your secure, on-chain smart account balance`)
            .addFields([
                {
                    name: '💰 Token Balances',
                    value: Object.keys(user.balances).length > 0 
                        ? Object.entries(user.balances)
                            .map(([token, balance]) => `${token}: ${balance}`)
                            .join('\n')
                        : 'No tokens yet. Use `/tilttag deposit` to add funds.',
                    inline: false
                },
                {
                    name: '🎯 Today\'s Activity',
                    value: `Tipped: ${user.responsibleGamingLimits.totalTippedToday}/${user.responsibleGamingLimits.dailyTipLimit} (Daily Limit)`,
                    inline: true
                },
                {
                    name: '📊 This Week',
                    value: `Received: ${user.responsibleGamingLimits.totalReceivedThisWeek}/${user.responsibleGamingLimits.weeklyReceiveLimit}`,
                    inline: true
                },
                {
                    name: '🛡️ Verification Status',
                    value: user.tiltCheckVerified 
                        ? `✅ TiltCheck Verified (DegenTrust: ${user.degenTrustScore})` 
                        : '⚪ Not Verified - Visit our community forum to verify',
                    inline: false
                },
                {
                    name: '🔗 Wallet Address',
                    value: `\`${user.publicKey}\``,
                    inline: false
                }
            ])
            .setFooter({ text: 'TiltTag • Responsible Gaming • Sound by blackjackson' })
            .setTimestamp();

        return { success: true, embed: embed };
    }

    // NFT support (similar to Collab.Land but integrated with DegenTrust)
    async sendNFT(senderId, recipientId, collectionAddress, tokenId) {
        try {
            const sender = this.userAccounts.get(senderId);
            const recipient = this.userAccounts.get(recipientId);

            if (!sender || !recipient) {
                return { success: false, error: 'Both users need TiltTag accounts. Use `/tilttag balance` to initialize.' };
            }

            // Check if sender owns the NFT
            const nftIndex = sender.nftBalances.findIndex(nft => 
                nft.collection === collectionAddress && nft.tokenId === tokenId
            );

            if (nftIndex === -1) {
                return { success: false, error: 'You don\'t own this NFT.' };
            }

            // Execute NFT transfer on-chain
            const nftTransaction = await this.executeNFTTransfer(sender, recipient, collectionAddress, tokenId);

            if (nftTransaction.success) {
                // Update NFT balances
                const nft = sender.nftBalances.splice(nftIndex, 1)[0];
                recipient.nftBalances.push(nft);

                // Special handling for DegenTrust NFTs
                if (collectionAddress === this.degenTrustCollection) {
                    recipient.tiltCheckVerified = true;
                    recipient.degenTrustScore = nft.trustScore || 100;
                }

                const txRecord = {
                    id: nftTransaction.signature,
                    from: senderId,
                    to: recipientId,
                    nft: { collection: collectionAddress, tokenId: tokenId },
                    timestamp: new Date(),
                    type: 'nft_transfer'
                };

                this.recordTransaction(txRecord);

                return {
                    success: true,
                    transaction: txRecord,
                    embed: this.createNFTTransferEmbed(sender, recipient, nft, nftTransaction.signature)
                };
            }

            return { success: false, error: 'NFT transfer failed on blockchain' };

        } catch (error) {
            console.error('Error sending NFT:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper methods
    createTipEmbed(sender, recipient, amount, token, signature) {
        return new EmbedBuilder()
            .setColor('#10B981')
            .setTitle('💰 TiltTag Tip Sent!')
            .setDescription(`🎉 **${sender.username}** tipped **${recipient.username}**`)
            .addFields([
                { name: '💎 Amount', value: `${amount} ${token}`, inline: true },
                { name: '🔗 Transaction', value: `[View on Explorer](https://solscan.io/tx/${signature})`, inline: true },
                { name: '🎵 Sound', value: 'blackjackson\'s redeem alert played!', inline: true }
            ])
            .setFooter({ text: 'TiltTag • Responsible Gaming Community' })
            .setTimestamp();
    }

    createRaindropEmbed(raindrop) {
        return new EmbedBuilder()
            .setColor('#8B5CF6')
            .setTitle('🌧️ TiltTag Raindrop Active!')
            .setDescription(`React with 🌧️ to enter the giveaway!`)
            .addFields([
                { name: '💰 Prize Pool', value: `${raindrop.amount} ${raindrop.token}`, inline: true },
                { name: '⏰ Duration', value: `${raindrop.duration} minutes`, inline: true },
                { name: '👥 Max Entries', value: `${raindrop.maxEntries}`, inline: true },
                { name: '🛡️ Responsible Gaming', value: raindrop.responsibleGamingNote, inline: false }
            ])
            .setFooter({ text: 'TiltTag Raindrop • Play Responsibly' })
            .setTimestamp(raindrop.endsAt);
    }

    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        return new Date(now.setDate(diff)).toDateString();
    }

    recordTransaction(transaction) {
        if (!this.transactionHistory.has(transaction.from)) {
            this.transactionHistory.set(transaction.from, []);
        }
        if (!this.transactionHistory.has(transaction.to)) {
            this.transactionHistory.set(transaction.to, []);
        }
        
        this.transactionHistory.get(transaction.from).push(transaction);
        this.transactionHistory.get(transaction.to).push(transaction);
    }

    // Placeholder for actual blockchain transactions
    async executeTransfer(sender, recipient, amount, token) {
        // In production: actual Solana transfer
        return { 
            success: true, 
            signature: 'mock_' + Date.now() + Math.random().toString(36).substr(2, 9)
        };
    }

    async executeNFTTransfer(sender, recipient, collection, tokenId) {
        // In production: actual Solana NFT transfer
        return { 
            success: true, 
            signature: 'mock_nft_' + Date.now() + Math.random().toString(36).substr(2, 9)
        };
    }
}


    // ========== VERIFICATION NFT SYSTEM ==========
    
    async mintVerificationNFT(discordUserId, username, verificationLevel = 'basic') {
        try {
            let userAccount = this.userAccounts.get(discordUserId);
            if (!userAccount) {
                const initResult = await this.initializeUserAccount(discordUserId, username);
                if (!initResult.success) {
                    return { success: false, error: 'Failed to initialize user account' };
                }
                userAccount = initResult.account;
            }

            if (userAccount.verificationNFT) {
                return { success: false, error: 'User already has verification NFT', existingNFT: userAccount.verificationNFT };
            }

            const nftResult = await this._executeVerificationNFTMint(discordUserId, verificationLevel);
            
            if (nftResult.success) {
                userAccount.verificationNFT = {
                    mint: nftResult.mintAddress,
                    level: verificationLevel,
                    mintedAt: new Date(),
                    transactionSignature: nftResult.signature
                };
                userAccount.tiltCheckVerified = true;

                this.recordTransaction({
                    type: 'verification_nft_mint',
                    from: 'system',
                    to: discordUserId,
                    amount: 1,
                    token: 'VERIFICATION_NFT',
                    signature: nftResult.signature,
                    level: verificationLevel,
                    timestamp: new Date()
                });

                return {
                    success: true,
                    nft: userAccount.verificationNFT,
                    message: ``✅ Verification NFT minted! Level: ${verificationLevel.toUpperCase()}`
                };
            } else {
                return { success: false, error: nftResult.error };
            }
        } catch (error) {
            console.error('Error minting verification NFT:', error);
            return { success: false, error: error.message };
        }
    }

    async checkVerificationStatus(discordUserId) {
        try {
            const userAccount = this.userAccounts.get(discordUserId);
            
            if (!userAccount) {
                return { verified: false, reason: 'No account found' };
            }

            if (!userAccount.verificationNFT) {
                return { verified: false, reason: 'No verification NFT' };
            }

            const isValid = await this._verifyNFTOwnership(userAccount.verificationNFT.mint, discordUserId);
            
            return {
                verified: isValid,
                level: userAccount.verificationNFT.level,
                mintedAt: userAccount.verificationNFT.mintedAt,
                mintAddress: userAccount.verificationNFT.mint
            };
        } catch (error) {
            console.error('Error checking verification status:', error);
            return { verified: false, reason: 'Verification check failed: ' + error.message };
        }
    }

    async upgradeVerificationNFT(discordUserId, newLevel) {
        try {
            const userAccount = this.userAccounts.get(discordUserId);
            
            if (!userAccount || !userAccount.verificationNFT) {
                return { success: false, error: 'No verification NFT found' };
            }

            const currentLevel = userAccount.verificationNFT.level;
            const levelHierarchy = { 'basic': 1, 'premium': 2, 'enterprise': 3 };
            
            if (levelHierarchy[newLevel] <= levelHierarchy[currentLevel]) {
                return { success: false, error: 'Cannot downgrade verification level' };
            }

            userAccount.verificationNFT.level = newLevel;
            userAccount.verificationNFT.upgradedAt = new Date();

            return {
                success: true,
                previousLevel: currentLevel,
                newLevel: newLevel,
                message: ``✅ Verification NFT upgraded to ${newLevel.toUpperCase()}!`
            };
        } catch (error) {
            console.error('Error upgrading verification NFT:', error);
            return { success: false, error: error.message };
        }
    }

    async _executeVerificationNFTMint(discordUserId, level) {
        return {
            success: true,
            mintAddress: ``nft_${discordUserId}_${Date.now()}`,
            signature: ``sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    async _verifyNFTOwnership(mintAddress, discordUserId) {
        const userAccount = this.userAccounts.get(discordUserId);
        return userAccount && userAccount.verificationNFT && userAccount.verificationNFT.mint === mintAddress;
    }

}

module.exports = { JustTheTipTokenSystem };module.exports = { JustTheTipTokenSystem };\
\
    // ========== VERIFICATION NFT SYSTEM ==========\
    \
    async mintVerificationNFT(discordUserId, username, verificationLevel = 'basic') {\
        try {\
            let userAccount = this.userAccounts.get(discordUserId);\
            if (!userAccount) {\
                const initResult = await this.initializeUserAccount(discordUserId, username);\
                if (!initResult.success) {\
                    return { success: false, error: 'Failed to initialize user account' };\
                }\
                userAccount = initResult.account;\
            }\
\
            if (userAccount.verificationNFT) {\
                return { success: false, error: 'User already has verification NFT', existingNFT: userAccount.verificationNFT };\
            }\
\
            const nftResult = await this._executeVerificationNFTMint(discordUserId, verificationLevel);\
            \
            if (nftResult.success) {\
                userAccount.verificationNFT = {\
                    mint: nftResult.mintAddress,\
                    level: verificationLevel,\
                    mintedAt: new Date(),\
                    transactionSignature: nftResult.signature\
                };\
                userAccount.tiltCheckVerified = true;\
\
                this.recordTransaction({\
                    type: 'verification_nft_mint',\
                    from: 'system',\
                    to: discordUserId,\
                    amount: 1,\
                    token: 'VERIFICATION_NFT',\
                    signature: nftResult.signature,\
                    level: verificationLevel,\
                    timestamp: new Date()\
                });\
\
                return {\
                    success: true,\
                    nft: userAccount.verificationNFT,\
                    message: `\`✅ Verification NFT minted! Level: ${verificationLevel.toUpperCase()}\`\
                };\
            } else {\
                return { success: false, error: nftResult.error };\
            }\
        } catch (error) {\
            console.error('Error minting verification NFT:', error);\
            return { success: false, error: error.message };\
        }\
    }\
\
    async checkVerificationStatus(discordUserId) {\
        try {\
            const userAccount = this.userAccounts.get(discordUserId);\
            \
            if (!userAccount) {\
                return { verified: false, reason: 'No account found' };\
            }\
\
            if (!userAccount.verificationNFT) {\
                return { verified: false, reason: 'No verification NFT' };\
            }\
\
            const isValid = await this._verifyNFTOwnership(userAccount.verificationNFT.mint, discordUserId);\
            \
            return {\
                verified: isValid,\
                level: userAccount.verificationNFT.level,\
                mintedAt: userAccount.verificationNFT.mintedAt,\
                mintAddress: userAccount.verificationNFT.mint\
            };\
        } catch (error) {\
            console.error('Error checking verification status:', error);\
            return { verified: false, reason: 'Verification check failed: ' + error.message };\
        }\
    }\
\
    async upgradeVerificationNFT(discordUserId, newLevel) {\
        try {\
            const userAccount = this.userAccounts.get(discordUserId);\
            \
            if (!userAccount || !userAccount.verificationNFT) {\
                return { success: false, error: 'No verification NFT found' };\
            }\
\
            const currentLevel = userAccount.verificationNFT.level;\
            const levelHierarchy = { 'basic': 1, 'premium': 2, 'enterprise': 3 };\
            \
            if (levelHierarchy[newLevel] <= levelHierarchy[currentLevel]) {\
                return { success: false, error: 'Cannot downgrade verification level' };\
            }\
\
            userAccount.verificationNFT.level = newLevel;\
            userAccount.verificationNFT.upgradedAt = new Date();\
\
            return {\
                success: true,\
                previousLevel: currentLevel,\
                newLevel: newLevel,\
                message: `\`✅ Verification NFT upgraded to ${newLevel.toUpperCase()}!\`\
            };\
        } catch (error) {\
            console.error('Error upgrading verification NFT:', error);\
            return { success: false, error: error.message };\
        }\
    }\
\
    async _executeVerificationNFTMint(discordUserId, level) {\
        return {\
            success: true,\
            mintAddress: `\`nft_${discordUserId}_${Date.now()}\`,\
            signature: `\`sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}\`\
        };\
    }\
\
    async _verifyNFTOwnership(mintAddress, discordUserId) {\
        const userAccount = this.userAccounts.get(discordUserId);\
        return userAccount && userAccount.verificationNFT && userAccount.verificationNFT.mint === mintAddress;\
    }\


    // ========== VERIFICATION NFT SYSTEM ==========

    async mintVerificationNFT(discordUserId, username, verificationLevel = 'basic') {
        try {
            let userAccount = this.userAccounts.get(discordUserId);
            if (!userAccount) {
                const initResult = await this.initializeUserAccount(discordUserId, username);
                if (!initResult.success) {
                    return { success: false, error: 'Failed to initialize user account' };
                }
                userAccount = initResult.account;
            }

            if (userAccount.verificationNFT) {
                return { success: false, error: 'User already has verification NFT', existingNFT: userAccount.verificationNFT };
            }

            const nftResult = await this._executeVerificationNFTMint(discordUserId, verificationLevel);
            
            if (nftResult.success) {
                userAccount.verificationNFT = {
                    mint: nftResult.mintAddress,
                    level: verificationLevel,
                    mintedAt: new Date(),
                    transactionSignature: nftResult.signature
                };
                userAccount.tiltCheckVerified = true;

                this.recordTransaction({
                    type: 'verification_nft_mint',
                    from: 'system',
                    to: discordUserId,
                    amount: 1,
                    token: 'VERIFICATION_NFT',
                    signature: nftResult.signature,
                    level: verificationLevel,
                    timestamp: new Date()
                });

                return {
                    success: true,
                    nft: userAccount.verificationNFT,
                    message: `✅ Verification NFT minted! Level: ${verificationLevel.toUpperCase()}`
                };
            } else {
                return { success: false, error: nftResult.error };
            }
        } catch (error) {
            console.error('Error minting verification NFT:', error);
            return { success: false, error: error.message };
        }
    }

    async checkVerificationStatus(discordUserId) {
        try {
            const userAccount = this.userAccounts.get(discordUserId);
            
            if (!userAccount) {
                return { verified: false, reason: 'No account found' };
            }

            if (!userAccount.verificationNFT) {
                return { verified: false, reason: 'No verification NFT' };
            }

            const isValid = await this._verifyNFTOwnership(userAccount.verificationNFT.mint, discordUserId);
            
            return {
                verified: isValid,
                level: userAccount.verificationNFT.level,
                mintedAt: userAccount.verificationNFT.mintedAt,
                mintAddress: userAccount.verificationNFT.mint
            };
        } catch (error) {
            console.error('Error checking verification status:', error);
            return { verified: false, reason: 'Verification check failed: ' + error.message };
        }
    }

    async upgradeVerificationNFT(discordUserId, newLevel) {
        try {
            const userAccount = this.userAccounts.get(discordUserId);
            
            if (!userAccount || !userAccount.verificationNFT) {
                return { success: false, error: 'No verification NFT found' };
            }

            const currentLevel = userAccount.verificationNFT.level;
            const levelHierarchy = { 'basic': 1, 'premium': 2, 'enterprise': 3 };
            
            if (levelHierarchy[newLevel] <= levelHierarchy[currentLevel]) {
                return { success: false, error: 'Cannot downgrade verification level' };
            }

            userAccount.verificationNFT.level = newLevel;
            userAccount.verificationNFT.upgradedAt = new Date();

            return {
                success: true,
                previousLevel: currentLevel,
                newLevel: newLevel,
                message: `✅ Verification NFT upgraded to ${newLevel.toUpperCase()}!`
            };
        } catch (error) {
            console.error('Error upgrading verification NFT:', error);
            return { success: false, error: error.message };
        }
    }

    async _executeVerificationNFTMint(discordUserId, level) {
        return {
            success: true,
            mintAddress: `nft_${discordUserId}_${Date.now()}`,
            signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    async _verifyNFTOwnership(mintAddress, discordUserId) {
        const userAccount = this.userAccounts.get(discordUserId);
        return userAccount && userAccount.verificationNFT && userAccount.verificationNFT.mint === mintAddress;
    }

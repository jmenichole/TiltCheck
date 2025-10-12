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
 * Crypto Wallet Manager Integration
 * Integrates secure crypto wallets with the Discord bot payment system
 */

const SecureCryptoPaymentWallets = require('./cryptoPaymentWallets');
const { EmbedBuilder } = require('discord.js');

class CryptoWalletManager {
    constructor() {
        this.cryptoSystem = new SecureCryptoPaymentWallets();
        this.userSessions = new Map(); // Active user sessions
        this.pendingTransactions = new Map(); // Pending user transactions
        this.walletCache = new Map(); // Cache user wallets
        
        this.initializeManager();
    }

    async initializeManager() {
        console.log('🔗 Initializing Crypto Wallet Manager...');
        
        // Initialize the crypto system
        await this.cryptoSystem.initializeSystem();
        
        console.log('✅ Crypto Wallet Manager Ready');
    }

    // Create user wallet command
    async handleCreateWallet(message, args) {
        const userId = message.author.id;
        const userState = args.find(arg => arg.startsWith('state:'))?.substring(6) || 'UNKNOWN';
        const preferredChain = args.find(arg => arg.startsWith('chain:'))?.substring(6) || 'POLYGON';

        try {
            // Check if user already has a wallet
            if (this.walletCache.has(userId)) {
                const existingWallet = this.walletCache.get(userId);
                return message.reply(`You already have a wallet: \`${existingWallet.address}\` on ${existingWallet.chain}`);
            }

            // Create new wallet
            const walletInfo = await this.cryptoSystem.createUserWallet(userId, preferredChain.toUpperCase());
            this.walletCache.set(userId, walletInfo);

            const embed = new EmbedBuilder()
                .setTitle('🏦 Crypto Wallet Created')
                .setDescription('Your secure crypto wallet has been generated!')
                .setColor(0x00FF00)
                .addFields(
                    { name: '📍 Address', value: `\`${walletInfo.address}\``, inline: false },
                    { name: '⛓️ Blockchain', value: walletInfo.chainConfig.name, inline: true },
                    { name: '💰 Currency', value: walletInfo.chainConfig.currency, inline: true },
                    { name: '⚡ Avg Speed', value: `${walletInfo.chainConfig.avgConfirmTime}s`, inline: true },
                    { name: '💸 Avg Fees', value: `$${walletInfo.chainConfig.avgFees}`, inline: true },
                    { name: '🛡️ Reliability', value: `${walletInfo.chainConfig.reliability}%`, inline: true },
                    { name: '🎰 Gambling Friendly', value: walletInfo.chainConfig.gambling_friendly ? '✅ Yes' : '❌ No', inline: true }
                )
                .addFields({
                    name: '🔒 Security Features',
                    value: '• End-to-end encryption\n• Unicode variant protection\n• AML/KYC compliance\n• Direct casino transfers',
                    inline: false
                })
                .setFooter({ text: 'Keep your wallet address safe and never share your private keys!' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error creating wallet:', error);
            await message.reply(`❌ Failed to create wallet: ${error.message}`);
        }
    }

    // Get payment options for user
    async handlePaymentOptions(message, args) {
        const userId = message.author.id;
        const userState = args.find(arg => arg.startsWith('state:'))?.substring(6) || 'UNKNOWN';
        const amount = parseFloat(args.find(arg => arg.startsWith('amount:'))?.substring(7)) || 100;

        try {
            const options = await this.cryptoSystem.getSupportedPaymentOptions(userId, userState, amount);

            if (options.availableOptions.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ No Payment Options Available')
                    .setDescription('Unfortunately, no crypto payment options are available in your jurisdiction.')
                    .setColor(0xFF0000)
                    .addFields({
                        name: 'Compliance Notes',
                        value: options.complianceNotes,
                        inline: false
                    });

                return message.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle('💳 Available Crypto Payment Options')
                .setDescription(`Found ${options.totalOptions} compliant payment methods for $${amount}`)
                .setColor(0x0099FF);

            // Add top 5 options
            for (let i = 0; i < Math.min(5, options.availableOptions.length); i++) {
                const option = options.availableOptions[i];
                const recommended = option.recommended ? '⭐ ' : '';
                
                embed.addFields({
                    name: `${recommended}${option.name} (${option.currency})`,
                    value: `**Speed:** ${option.avgConfirmTime}s | **Fees:** $${option.avgFees} | **Reliability:** ${option.reliability}%\n**Supports:** ${option.supports.join(', ')}`,
                    inline: false
                });
            }

            embed.addFields({
                name: '🎯 Recommended',
                value: `${options.availableOptions[0].name} - Best combination of speed, cost, and reliability`,
                inline: false
            });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting payment options:', error);
            await message.reply(`❌ Failed to get payment options: ${error.message}`);
        }
    }

    // Process crypto payment
    async handleCryptoPayment(message, args) {
        const userId = message.author.id;
        const toAddress = args.find(arg => arg.startsWith('to:'))?.substring(3);
        const amount = parseFloat(args.find(arg => arg.startsWith('amount:'))?.substring(7));
        const currency = args.find(arg => arg.startsWith('currency:'))?.substring(9) || 'USDC';
        const chain = args.find(arg => arg.startsWith('chain:'))?.substring(6) || 'POLYGON';
        const userState = args.find(arg => arg.startsWith('state:'))?.substring(6) || 'UNKNOWN';

        if (!toAddress || !amount) {
            return message.reply('❌ Usage: `!crypto-payment to:ADDRESS amount:100 currency:USDC chain:POLYGON state:CA`');
        }

        try {
            // Get user wallet
            const userWallet = this.walletCache.get(userId);
            if (!userWallet) {
                return message.reply('❌ You need to create a wallet first. Use `!create-wallet`');
            }

            const paymentData = {
                fromAddress: userWallet.address,
                toAddress,
                amount,
                currency,
                chain: chain.toUpperCase(),
                userId,
                purpose: 'GAMBLING',
                userState,
                userCountry: 'US'
            };

            // Show processing message
            const processingMessage = await message.reply('🔄 Processing your crypto payment...');

            // Process the payment
            const result = await this.cryptoSystem.processCryptoPayment(paymentData);

            if (result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Payment Processed Successfully')
                    .setDescription('Your crypto payment has been initiated!')
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '🆔 Transaction ID', value: `\`${result.transactionId}\``, inline: false },
                        { name: '🔗 Transaction Hash', value: `\`${result.txHash}\``, inline: false },
                        { name: '⛓️ Blockchain', value: result.chain, inline: true },
                        { name: '⏱️ Est. Confirmation', value: `${result.estimatedConfirmTime}s`, inline: true },
                        { name: '🔍 Explorer', value: `[View Transaction](${result.explorerUrl})`, inline: true }
                    )
                    .setFooter({ text: 'Transaction is being processed on the blockchain' })
                    .setTimestamp();

                await processingMessage.edit({ content: '', embeds: [embed] });

                // Store pending transaction
                this.pendingTransactions.set(result.transactionId, {
                    userId,
                    messageId: processingMessage.id,
                    channelId: message.channel.id,
                    ...result
                });

            } else {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Payment Failed')
                    .setDescription('Your crypto payment could not be processed.')
                    .setColor(0xFF0000)
                    .addFields({
                        name: 'Error',
                        value: result.error,
                        inline: false
                    });

                await processingMessage.edit({ content: '', embeds: [embed] });
            }

        } catch (error) {
            console.error('Error processing crypto payment:', error);
            await message.reply(`❌ Payment failed: ${error.message}`);
        }
    }

    // Check regulatory compliance for user's state
    async handleComplianceCheck(message, args) {
        const userState = args.find(arg => arg.startsWith('state:'))?.substring(6) || 'UNKNOWN';

        try {
            const recommendations = await this.cryptoSystem.getRegulatoryRecommendations(userState);

            const embed = new EmbedBuilder()
                .setTitle(`🏛️ Regulatory Compliance - ${userState}`)
                .setDescription('Current regulatory status and recommendations')
                .setColor(0x0099FF);

            // General recommendations
            embed.addFields({
                name: '📋 General Recommendations',
                value: recommendations.general.map(r => `• ${r}`).join('\n'),
                inline: false
            });

            // State-specific info
            if (recommendations.stateSpecific.length > 0) {
                embed.addFields({
                    name: `🏛️ ${userState} Specific`,
                    value: recommendations.stateSpecific.map(r => `• ${r}`).join('\n'),
                    inline: false
                });
            }

            // Action items
            if (recommendations.actionItems.length > 0) {
                embed.addFields({
                    name: '✅ Action Items',
                    value: recommendations.actionItems.map(r => `• ${r}`).join('\n'),
                    inline: false
                });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error checking compliance:', error);
            await message.reply(`❌ Failed to check compliance: ${error.message}`);
        }
    }

    // Get wallet status
    async handleWalletStatus(message, args) {
        const userId = message.author.id;

        try {
            const userWallet = this.walletCache.get(userId);
            
            if (!userWallet) {
                return message.reply('❌ You don\'t have a wallet yet. Use `!create-wallet` to create one.');
            }

            // Get chain status
            const chainValidation = await this.cryptoSystem.validateChainConnections();
            const userChainStatus = chainValidation.get(userWallet.chain.replace('_', '').toUpperCase());

            const embed = new EmbedBuilder()
                .setTitle('🏦 Your Crypto Wallet Status')
                .setDescription('Current wallet information and status')
                .setColor(0x00FF00)
                .addFields(
                    { name: '📍 Wallet Address', value: `\`${userWallet.address}\``, inline: false },
                    { name: '⛓️ Blockchain', value: userWallet.chainConfig.name, inline: true },
                    { name: '💰 Native Currency', value: userWallet.chainConfig.currency, inline: true },
                    { name: '🛡️ Reliability', value: `${userWallet.chainConfig.reliability}%`, inline: true }
                );

            if (userChainStatus) {
                embed.addFields({
                    name: '📊 Network Status',
                    value: `**Connected:** ${userChainStatus.connected ? '✅' : '❌'}\n**Latency:** ${userChainStatus.latency?.toFixed(2)}ms\n**Block Height:** ${userChainStatus.blockHeight || 'N/A'}`,
                    inline: false
                });
            }

            embed.addFields({
                name: '🔒 Security Features',
                value: '• Private keys encrypted with AES-256\n• Unicode variant attack protection\n• AML/KYC compliance integration\n• Real-time fraud detection',
                inline: false
            });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting wallet status:', error);
            await message.reply(`❌ Failed to get wallet status: ${error.message}`);
        }
    }

    // Get chain comparison
    async handleChainComparison(message, args) {
        try {
            const chains = this.cryptoSystem.supportedChains;
            
            const embed = new EmbedBuilder()
                .setTitle('⛓️ Blockchain Comparison')
                .setDescription('Compare supported blockchains for crypto payments')
                .setColor(0x0099FF);

            // Sort by reliability
            const sortedChains = Object.entries(chains)
                .sort(([,a], [,b]) => b.reliability - a.reliability);

            for (const [chainKey, chainConfig] of sortedChains.slice(0, 6)) {
                const gamblingStatus = chainConfig.gambling_friendly ? '✅' : '❌';
                const regulatoryStatus = chainConfig.regulatory_status === 'COMPLIANT' ? '✅' : '⚠️';
                
                embed.addFields({
                    name: `${chainConfig.name} (${chainConfig.currency})`,
                    value: `**Speed:** ${chainConfig.avgConfirmTime}s | **Fees:** $${chainConfig.avgFees} | **Reliability:** ${chainConfig.reliability}%\n**Gambling:** ${gamblingStatus} | **Regulatory:** ${regulatoryStatus}`,
                    inline: true
                });
            }

            embed.addFields({
                name: '📊 Legend',
                value: '**Speed:** Average confirmation time\n**Fees:** Average transaction cost\n**Reliability:** Network uptime percentage\n**Gambling:** Gambling-friendly status\n**Regulatory:** Compliance status',
                inline: false
            });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting chain comparison:', error);
            await message.reply(`❌ Failed to get chain comparison: ${error.message}`);
        }
    }

    // Crypto help command
    async handleCryptoHelp(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🏦 Crypto Wallet System Help')
            .setDescription('Secure, direct crypto payments without middle wallets')
            .setColor(0x0099FF)
            .addFields(
                {
                    name: '🏦 Wallet Commands',
                    value: '`!create-wallet [chain:POLYGON] [state:CA]` - Create secure wallet\n`!wallet-status` - Check your wallet status\n`!payment-options [amount:100] [state:CA]` - View available options',
                    inline: false
                },
                {
                    name: '💳 Payment Commands',
                    value: '`!crypto-payment to:ADDRESS amount:100 currency:USDC chain:POLYGON state:CA` - Send crypto\n`!compliance-check state:CA` - Check regulatory status',
                    inline: false
                },
                {
                    name: '📊 Information Commands',
                    value: '`!chain-comparison` - Compare blockchain options\n`!crypto-help` - This help message',
                    inline: false
                },
                {
                    name: '🔒 Security Features',
                    value: '• **Direct Transfers:** No middle wallets (bypasses tip.cc issues)\n• **Unicode Protection:** Prevents variant attacks\n• **AML/KYC Compliance:** Regulatory screening\n• **Multi-Chain Support:** 7 reliable blockchains\n• **State Compliance:** Respects local regulations',
                    inline: false
                },
                {
                    name: '⛓️ Supported Chains',
                    value: '🥇 **Tier 1:** Polygon, Arbitrum, BSC (Fast & Cheap)\n🥈 **Tier 2:** Ethereum, Avalanche (Reliable)\n🥉 **Tier 3:** Solana, Tron (Alternative)',
                    inline: false
                },
                {
                    name: '🏛️ Regulatory Benefits',
                    value: '• Helps comply with state gambling regulations\n• Provides audit trail for compliance\n• Supports KYC/AML requirements\n• May help with state re-licensing efforts',
                    inline: false
                }
            )
            .setFooter({ text: 'Use responsibly and in accordance with local laws' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}

module.exports = CryptoWalletManager;

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
 * 💰 JustTheTip Integration Module for TrapHouse Bot
 * 
 * Integrates multi-chain cryptocurrency tipping functionality:
 * - ETH, BTC, MATIC, BNB support
 * - Verified transaction IDs
 * - Non-custodial wallet registration
 * - Seamless crypto tips
 */

const axios = require('axios');
const crypto = require('crypto');

class JustTheTipIntegration {
    constructor(unicodeSafeStorage) {
        this.storage = unicodeSafeStorage;
        this.clientId = process.env.JUSTTHETIP_CLIENT_ID;
        this.webhookUrl = process.env.JUSTTHETIP_WEBHOOK_URL;
        this.webhookSecret = process.env.JUSTTHETIP_WEBHOOK_SECRET;
        this.apiEnabled = process.env.JUSTTHETIP_API_ENABLED === 'true';
        this.supportedChains = (process.env.JUSTTHETIP_SUPPORTED_CHAINS || 'ETH,BTC').split(',');
        this.verificationRequired = process.env.JUSTTHETIP_VERIFICATION_REQUIRED === 'true';
        
        console.log('💰 JustTheTip Integration initialized');
    }
    
    /**
     * Initialize JustTheTip integration
     */
    async initialize() {
        try {
            if (!this.apiEnabled) {
                console.log('💰 JustTheTip integration disabled');
                return false;
            }
            
            // Validate configuration
            this.validateConfiguration();
            
            // Setup webhook verification
            this.setupWebhookVerification();
            
            console.log('✅ JustTheTip integration ready');
            console.log(`🔗 Supported chains: ${this.supportedChains.join(', ')}`);
            
            return true;
        } catch (error) {
            console.error('❌ JustTheTip initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Validate JustTheTip configuration
     */
    validateConfiguration() {
        const required = ['clientId', 'webhookUrl', 'webhookSecret'];
        const missing = required.filter(field => !this[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing JustTheTip configuration: ${missing.join(', ')}`);
        }
        
        console.log('🔐 JustTheTip configuration validated');
    }
    
    /**
     * Setup webhook verification for crypto payments
     */
    setupWebhookVerification() {
        // Store webhook verification method
        this.verifyWebhookSignature = (payload, signature) => {
            try {
                // Remove 'sha256=' prefix if present
                const cleanSignature = signature.replace('sha256=', '');
                
                const expectedSignature = crypto
                    .createHmac('sha256', this.webhookSecret)
                    .update(payload)
                    .digest('hex');
                
                // Ensure both signatures are the same length
                if (cleanSignature.length !== expectedSignature.length) {
                    console.log('❌ Signature length mismatch:', {
                        received: cleanSignature.length,
                        expected: expectedSignature.length
                    });
                    return false;
                }
                
                return crypto.timingSafeEqual(
                    Buffer.from(cleanSignature, 'hex'),
                    Buffer.from(expectedSignature, 'hex')
                );
            } catch (error) {
                console.error('❌ Signature verification error:', error);
                return false;
            }
        };
        
        console.log('🔒 JustTheTip webhook verification ready');
    }
    
    /**
     * Process crypto tip payment
     */
    async processCryptoTip(paymentData) {
        try {
            const {
                fromUserId,
                toUserId,
                amount,
                chain,
                txHash,
                currency,
                verified
            } = paymentData;
            
            // Validate payment data
            if (!this.validatePaymentData(paymentData)) {
                throw new Error('Invalid payment data');
            }
            
            // Require verification for large amounts
            if (this.verificationRequired && !verified) {
                console.log('⚠️ Payment requires verification:', txHash);
                return { success: false, reason: 'verification_required' };
            }
            
            // Record payment in storage
            const payment = await this.recordCryptoPayment({
                id: this.generatePaymentId(),
                fromUserId,
                toUserId,
                amount: parseFloat(amount),
                currency,
                chain,
                txHash,
                timestamp: new Date().toISOString(),
                verified,
                status: 'completed',
                type: 'crypto_tip'
            });
            
            // Update user respect for crypto tips
            await this.updateUserRespectForCrypto(toUserId, amount, currency, chain);
            
            console.log(`✅ Crypto tip processed: ${amount} ${currency} on ${chain}`);
            return { success: true, payment };
            
        } catch (error) {
            console.error('❌ Crypto tip processing failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Validate payment data
     */
    validatePaymentData(data) {
        const required = ['fromUserId', 'toUserId', 'amount', 'chain', 'txHash', 'currency'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            console.error('Missing payment fields:', missing);
            return false;
        }
        
        // Validate chain support
        if (!this.supportedChains.includes(data.chain.toUpperCase())) {
            console.error('Unsupported chain:', data.chain);
            return false;
        }
        
        // Validate amount
        if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
            console.error('Invalid amount:', data.amount);
            return false;
        }
        
        return true;
    }
    
    /**
     * Record crypto payment in storage
     */
    async recordCryptoPayment(payment) {
        try {
            const paymentData = await this.storage.getPaymentData();
            
            if (!paymentData.cryptoPayments) {
                paymentData.cryptoPayments = [];
            }
            
            paymentData.cryptoPayments.push(payment);
            
            await this.storage.savePaymentData(paymentData);
            
            return payment;
        } catch (error) {
            console.error('Error recording crypto payment:', error);
            throw error;
        }
    }
    
    /**
     * Update user respect for crypto payments
     */
    async updateUserRespectForCrypto(userId, amount, currency, chain) {
        try {
            const userData = await this.storage.getUserData(userId);
            
            // Calculate respect bonus for crypto tips
            const cryptoMultiplier = this.getCryptoRespectMultiplier(currency, chain);
            const respectBonus = Math.floor(parseFloat(amount) * cryptoMultiplier);
            
            userData.respect = (userData.respect || 0) + respectBonus;
            userData.cryptoEarnings = (userData.cryptoEarnings || 0) + parseFloat(amount);
            userData.cryptoCurrency = currency;
            userData.preferredChain = chain;
            
            await this.storage.saveUserData(userId, userData);
            
            console.log(`💎 User ${userId} gained ${respectBonus} respect from crypto tip`);
            
            return respectBonus;
        } catch (error) {
            console.error('Error updating crypto respect:', error);
            return 0;
        }
    }
    
    /**
     * Get respect multiplier for different cryptocurrencies
     */
    getCryptoRespectMultiplier(currency, chain) {
        const multipliers = {
            BTC: 10,   // Bitcoin gets highest respect
            ETH: 8,    // Ethereum high respect
            MATIC: 5,  // Polygon moderate respect
            BNB: 6,    // Binance Chain good respect
            USDC: 3,   // Stablecoins lower respect
            USDT: 3
        };
        
        // Chain bonuses
        const chainBonuses = {
            ETH: 1.2,    // Ethereum mainnet bonus
            BTC: 1.5,    // Bitcoin network bonus
            MATIC: 1.0,  // Polygon standard
            BNB: 1.1     // BSC slight bonus
        };
        
        const baseMultiplier = multipliers[currency.toUpperCase()] || 2;
        const chainBonus = chainBonuses[chain.toUpperCase()] || 1.0;
        
        return baseMultiplier * chainBonus;
    }
    
    /**
     * Generate unique payment ID
     */
    generatePaymentId() {
        return `crypto_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }
    
    /**
     * Handle JustTheTip webhook
     */
    async handleWebhook(payload, signature) {
        try {
            // Verify webhook signature
            if (!this.verifyWebhookSignature(payload, signature)) {
                console.error('❌ Invalid webhook signature');
                return { success: false, error: 'invalid_signature' };
            }
            
            const data = JSON.parse(payload);
            
            // Process different webhook events
            switch (data.event) {
                case 'tip.completed':
                    return await this.processCryptoTip(data.payment);
                    
                case 'tip.verified':
                    return await this.handleTipVerification(data);
                    
                case 'wallet.registered':
                    return await this.handleWalletRegistration(data);
                    
                default:
                    console.log('📝 Unknown webhook event:', data.event);
                    return { success: true, message: 'event_ignored' };
            }
            
        } catch (error) {
            console.error('❌ Webhook processing error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle tip verification event
     */
    async handleTipVerification(data) {
        try {
            const { txHash, verified, blockConfirmations } = data;
            
            // Update payment verification status
            const paymentData = await this.storage.getPaymentData();
            const payment = paymentData.cryptoPayments?.find(p => p.txHash === txHash);
            
            if (payment) {
                payment.verified = verified;
                payment.blockConfirmations = blockConfirmations;
                payment.verifiedAt = new Date().toISOString();
                
                await this.storage.savePaymentData(paymentData);
                
                console.log(`✅ Payment verified: ${txHash} (${blockConfirmations} confirmations)`);
            }
            
            return { success: true, verified };
        } catch (error) {
            console.error('Error handling tip verification:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle wallet registration event
     */
    async handleWalletRegistration(data) {
        try {
            const { userId, walletAddress, chain } = data;
            
            // Store user wallet information
            const userData = await this.storage.getUserData(userId);
            
            if (!userData.cryptoWallets) {
                userData.cryptoWallets = {};
            }
            
            userData.cryptoWallets[chain] = walletAddress;
            userData.cryptoWalletRegistered = new Date().toISOString();
            
            await this.storage.saveUserData(userId, userData);
            
            console.log(`👛 Wallet registered for user ${userId}: ${walletAddress} (${chain})`);
            
            return { success: true, wallet: walletAddress };
        } catch (error) {
            console.error('Error handling wallet registration:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get user crypto statistics
     */
    async getUserCryptoStats(userId) {
        try {
            const userData = await this.storage.getUserData(userId);
            const paymentData = await this.storage.getPaymentData();
            
            const userCryptoPayments = paymentData.cryptoPayments?.filter(
                p => p.toUserId === userId || p.fromUserId === userId
            ) || [];
            
            return {
                totalEarnings: userData.cryptoEarnings || 0,
                preferredCurrency: userData.cryptoCurrency || 'ETH',
                preferredChain: userData.preferredChain || 'ETH',
                wallets: userData.cryptoWallets || {},
                paymentCount: userCryptoPayments.length,
                lastPayment: userCryptoPayments[userCryptoPayments.length - 1]?.timestamp
            };
        } catch (error) {
            console.error('Error getting crypto stats:', error);
            return null;
        }
    }
    
    /**
     * Send crypto tip notification to Discord
     */
    async sendCryptoTipNotification(tipData) {
        try {
            if (!this.webhookUrl) return;
            
            const embed = {
                color: 0xFFD700,
                title: '💰 Crypto Tip Received!',
                fields: [
                    {
                        name: '💳 Amount',
                        value: `${tipData.amount} ${tipData.currency}`,
                        inline: true
                    },
                    {
                        name: '🔗 Chain',
                        value: tipData.chain,
                        inline: true
                    },
                    {
                        name: '✅ Status',
                        value: tipData.verified ? 'Verified' : 'Pending',
                        inline: true
                    },
                    {
                        name: '🔍 Transaction',
                        value: `[View on Explorer](https://etherscan.io/tx/${tipData.txHash})`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'JustTheTip Multi-chain Crypto Bot'
                },
                timestamp: new Date().toISOString()
            };
            
            await axios.post(this.webhookUrl, { embeds: [embed] });
            
        } catch (error) {
            console.error('Error sending crypto tip notification:', error);
        }
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            enabled: this.apiEnabled,
            clientId: this.clientId,
            supportedChains: this.supportedChains,
            verificationRequired: this.verificationRequired,
            webhookConfigured: !!this.webhookUrl
        };
    }
}

module.exports = JustTheTipIntegration;

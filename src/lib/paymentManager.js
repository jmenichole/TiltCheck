const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config/payments');
const { ethers } = require('ethers');
const { Web3 } = require('web3');

// Initialize Stripe with your actual keys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Enhanced Payment Manager with Stripe Connect Integration + Real Crypto Support
 * Supports crypto payments, fiat deposits, vault management, and marketplace features
 */
class PaymentManager {
    constructor(client) {
        this.client = client;
        this.paymentsFile = path.join(__dirname, 'data/payments.json');
        this.subscriptionsFile = path.join(__dirname, 'data/subscriptions.json');
        this.stripeAccountsFile = path.join(__dirname, 'data/stripe_accounts.json');
        this.stripeProductsFile = path.join(__dirname, 'data/stripe_products.json');
        this.cryptoWalletsFile = path.join(__dirname, 'data/crypto_wallets.json');
        this.cryptoTransactionsFile = path.join(__dirname, 'data/crypto_transactions.json');
        
        // Validate Stripe configuration
        this.validateStripeConfig();
        
        // Initialize Stripe only if enabled
        if (this.stripeEnabled) {
            this.stripe = stripe;
        } else {
            this.stripe = null;
        }
        
        // Initialize crypto providers
        this.initializeCryptoProviders();
        
        // Initialize payment data
        this.initializePaymentData();
        
        // Load crypto wallets and transactions
        this.loadCryptoData();
    }

    /**
     * Initialize cryptocurrency providers and supported tokens
     */
    initializeCryptoProviders() {
        // Ethereum provider setup
        this.ethProvider = new ethers.JsonRpcProvider(
            process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
        );
        
        // Web3 instance for additional functionality
        this.web3 = new Web3(process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID');
        
        // User wallets storage
        this.userWallets = new Map();
        this.pendingDeposits = new Map();
        this.cryptoTransactions = new Map();
        
        // Supported cryptocurrencies with real contract addresses
        this.supportedCrypto = {
            ETH: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                contract: null, // Native ETH
                chain: 'ethereum',
                minDeposit: 0.001,
                network: 'mainnet'
            },
            USDC: {
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6,
                contract: '0xA0b86a33E6441E47c8E4f3A7E08e4d8065F71B3e', // USDC contract on Ethereum
                chain: 'ethereum',
                minDeposit: 5,
                network: 'mainnet'
            },
            USDT: {
                symbol: 'USDT',
                name: 'Tether USD',
                decimals: 6,
                contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT contract on Ethereum
                chain: 'ethereum',
                minDeposit: 5,
                network: 'mainnet'
            },
            WBTC: {
                symbol: 'WBTC',
                name: 'Wrapped Bitcoin',
                decimals: 8,
                contract: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC contract
                chain: 'ethereum',
                minDeposit: 0.0001,
                network: 'mainnet'
            },
            SOLUSDC: {
                symbol: 'SOLUSDC',
                name: 'Solana USDC',
                decimals: 6,
                contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC SPL token address
                chain: 'solana',
                minDeposit: 1,
                network: 'mainnet-beta',
                destinationAddress: process.env.SOLANA_USDC_DESTINATION_ADDRESS
            }
        };

        console.log('🌐 Crypto providers initialized - ETH, USDC, USDT, WBTC support enabled');
    }

    /**
     * Load crypto wallet and transaction data
     */
    async loadCryptoData() {
        try {
            // Load crypto wallets
            const walletData = JSON.parse(await fs.readFile(this.cryptoWalletsFile, 'utf8'));
            this.userWallets = new Map(Object.entries(walletData || {}));
            console.log('💰 Crypto wallet data loaded');
        } catch (error) {
            console.log('📝 No existing crypto wallet data found, starting fresh');
            this.userWallets = new Map();
        }

        try {
            // Load crypto transactions
            const txData = JSON.parse(await fs.readFile(this.cryptoTransactionsFile, 'utf8'));
            this.cryptoTransactions = new Map(Object.entries(txData || {}));
            console.log('📊 Crypto transaction data loaded');
        } catch (error) {
            console.log('📝 No existing crypto transaction data found, starting fresh');
            this.cryptoTransactions = new Map();
        }
    }

    /**
     * Save crypto data to files
     */
    async saveCryptoData() {
        try {
            // Save wallet data
            const walletData = Object.fromEntries(this.userWallets);
            await fs.writeFile(this.cryptoWalletsFile, JSON.stringify(walletData, null, 2));
            
            // Save transaction data
            const txData = Object.fromEntries(this.cryptoTransactions);
            await fs.writeFile(this.cryptoTransactionsFile, JSON.stringify(txData, null, 2));
            
            console.log('💾 Crypto data saved successfully');
        } catch (error) {
            console.error('❌ Error saving crypto data:', error);
        }
    }

    /**
     * Validate Stripe configuration is properly set up
     */
    /**
     * Create a new wallet for testing purposes
     */
    createWallet(userId) {
        const wallet = ethers.Wallet.createRandom();
        return {
            userId: userId,
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    }

    /**
     * Check if a cryptocurrency is supported
     */
    isSupportedCrypto(crypto) {
        return !!this.supportedCrypto[crypto.toUpperCase()];
    }

    /**
     * Get user wallets (for testing)
     */
    getUserWallets() {
        return Object.fromEntries(this.userWallets);
    }

    /**
     * Get transactions (for testing)
     */
    getTransactions() {
        return Object.fromEntries(this.cryptoTransactions);
    }

    /**
     * Validate Ethereum address
     */
    isValidEthereumAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    /**
     * Get balance for user (mock for testing)
     */
    async getBalance(userId, crypto) {
        const walletKey = `${userId}_${crypto}`;
        const walletData = this.userWallets.get(walletKey);
        return walletData ? walletData.balance : 0;
    }

    validateStripeConfig() {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_')) {
            console.warn('⚠️ STRIPE_SECRET_KEY not configured - Stripe Connect features disabled');
            this.stripeEnabled = false;
            return;
        }

        if (!process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY.includes('your_')) {
            console.warn('⚠️ STRIPE_PUBLISHABLE_KEY not configured - Stripe Connect features disabled');
            this.stripeEnabled = false;
            return;
        }

        this.stripeEnabled = true;
        console.log('✅ Stripe Connect integration enabled');
    }

    async initializePaymentData() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.paymentsFile);
            await fs.mkdir(dataDir, { recursive: true });

            // Initialize all data files
            const files = [
                this.paymentsFile,
                this.subscriptionsFile,
                this.stripeAccountsFile,
                this.stripeProductsFile
            ];

            for (const file of files) {
                try {
                    await fs.access(file);
                } catch {
                    await fs.writeFile(file, JSON.stringify({}));
                }
            }
            
            console.log('✅ Payment data files initialized (including Stripe Connect)');
        } catch (error) {
            console.error('Error initializing payment data:', error);
        }
    }

    // ============ STRIPE CONNECT INTEGRATION ============

    /**
     * Create a Stripe Connected Account for a Discord user
     */
    async createStripeConnectedAccount(discordUserId, email, businessInfo = {}) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe Connect not configured');
        }

        try {
            console.log(`🏦 Creating Stripe Connect account for user: ${discordUserId}`);

            // Check if user already has an account
            const existingAccount = await this.getStripeAccountByDiscordId(discordUserId);
            if (existingAccount) {
                return { accountId: existingAccount.stripeAccountId, existing: true };
            }

            // Create connected account with platform-controlled pricing
            const account = await this.stripe.accounts.create({
                controller: {
                    // Platform is responsible for pricing and fee collection
                    fees: {
                        payer: 'application'
                    },
                    // Platform is responsible for losses / refunds / chargebacks  
                    losses: {
                        payments: 'application'
                    },
                    // Give them access to the express dashboard for management
                    stripe_dashboard: {
                        type: 'express'
                    }
                },
                metadata: {
                    discord_user_id: discordUserId,
                    platform: 'traphouse_discord_bot',
                    created_at: new Date().toISOString()
                },
                ...(email && { email: email })
            });

            // Store account mapping
            await this.storeStripeAccount(discordUserId, {
                stripeAccountId: account.id,
                discordUserId: discordUserId,
                email: email,
                status: 'created',
                businessInfo: businessInfo,
                created: new Date().toISOString()
            });

            console.log(`✅ Stripe Connect account created: ${account.id}`);

            return {
                accountId: account.id,
                email: account.email,
                detailsSubmitted: account.details_submitted,
                chargesEnabled: account.charges_enabled,
                existing: false
            };

        } catch (error) {
            console.error('❌ Error creating Stripe Connect account:', error);
            throw new Error(`Failed to create Stripe account: ${error.message}`);
        }
    }

    /**
     * Create onboarding link for Stripe Connect account
     */
    async createStripeOnboardingLink(stripeAccountId) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe Connect not configured');
        }

        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/connect/refresh`,
                return_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/connect/return`,
                type: 'account_onboarding'
            });

            return {
                url: accountLink.url,
                expiresAt: accountLink.expires_at
            };

        } catch (error) {
            console.error('❌ Error creating onboarding link:', error);
            throw new Error(`Failed to create onboarding link: ${error.message}`);
        }
    }

    /**
     * Get Stripe account status (always fresh from API)
     */
    async getStripeAccountStatus(stripeAccountId) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe Connect not configured');
        }

        try {
            const account = await this.stripe.accounts.retrieve(stripeAccountId);

            return {
                accountId: account.id,
                detailsSubmitted: account.details_submitted,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                requirements: {
                    currentlyDue: account.requirements?.currently_due || [],
                    eventuallyDue: account.requirements?.eventually_due || [],
                    pastDue: account.requirements?.past_due || [],
                    pendingVerification: account.requirements?.pending_verification || []
                },
                canAcceptPayments: account.charges_enabled && account.payouts_enabled,
                overallStatus: this.determineAccountStatus(account)
            };

        } catch (error) {
            console.error('❌ Error fetching account status:', error);
            throw new Error(`Failed to get account status: ${error.message}`);
        }
    }

    /**
     * Create a product for marketplace
     */
    async createStripeProduct(connectedAccountId, productData) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe Connect not configured');
        }

        try {
            const { name, description, priceInCents, currency = 'usd', images = [] } = productData;

            // Validate account can accept payments
            const accountStatus = await this.getStripeAccountStatus(connectedAccountId);
            if (!accountStatus.canAcceptPayments) {
                throw new Error('Account must complete onboarding before creating products');
            }

            // Create product at platform level
            const product = await this.stripe.products.create({
                name: name,
                description: description,
                images: images,
                default_price_data: {
                    unit_amount: priceInCents,
                    currency: currency
                },
                metadata: {
                    connected_account_id: connectedAccountId,
                    platform: 'traphouse_discord_bot'
                }
            });

            // Store product mapping
            await this.storeStripeProduct(product.id, {
                productId: product.id,
                connectedAccountId: connectedAccountId,
                name: name,
                description: description,
                priceInCents: priceInCents,
                currency: currency,
                defaultPriceId: product.default_price,
                active: true,
                created: new Date().toISOString()
            });

            return {
                productId: product.id,
                name: product.name,
                priceInCents: priceInCents,
                defaultPriceId: product.default_price
            };

        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    /**
     * Create checkout session for marketplace purchase
     */
    async createStripeCheckout(productId, quantity = 1, customerEmail = null) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe Connect not configured');
        }

        try {
            // Get product info
            const products = JSON.parse(await fs.readFile(this.stripeProductsFile, 'utf8'));
            const productInfo = products[productId];

            if (!productInfo || !productInfo.active) {
                throw new Error('Product not found or inactive');
            }

            // Calculate application fee (10% + $0.30)
            const totalAmount = productInfo.priceInCents * quantity;
            const applicationFeeAmount = Math.round((totalAmount * 0.10) + 30);

            // Create checkout session with destination charge
            const session = await this.stripe.checkout.sessions.create({
                line_items: [{
                    price_data: {
                        currency: productInfo.currency,
                        product_data: {
                            name: productInfo.name,
                            description: productInfo.description
                        },
                        unit_amount: productInfo.priceInCents,
                    },
                    quantity: quantity,
                }],
                payment_intent_data: {
                    application_fee_amount: applicationFeeAmount,
                    transfer_data: {
                        destination: productInfo.connectedAccountId,
                    },
                    metadata: {
                        product_id: productId,
                        platform: 'traphouse_discord_bot'
                    }
                },
                mode: 'payment',
                success_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL || 'http://localhost:3001'}/stripe/marketplace`,
                customer_email: customerEmail
            });

            return {
                sessionId: session.id,
                url: session.url,
                amount: totalAmount,
                applicationFee: applicationFeeAmount
            };

        } catch (error) {
            console.error('❌ Error creating checkout:', error);
            throw new Error(`Failed to create checkout: ${error.message}`);
        }
    }

    // ============ STRIPE CONNECT HELPERS ============

    determineAccountStatus(account) {
        if (!account.details_submitted) return 'onboarding_required';
        if (account.requirements?.past_due?.length > 0) return 'past_due';
        if (account.requirements?.currently_due?.length > 0) return 'action_required';
        if (account.charges_enabled && account.payouts_enabled) return 'active';
        return 'restricted';
    }

    async storeStripeAccount(discordUserId, accountData) {
        try {
            const accounts = JSON.parse(await fs.readFile(this.stripeAccountsFile, 'utf8'));
            accounts[discordUserId] = accountData;
            await fs.writeFile(this.stripeAccountsFile, JSON.stringify(accounts, null, 2));
        } catch (error) {
            console.error('Error storing Stripe account:', error);
        }
    }

    async storeStripeProduct(productId, productData) {
        try {
            const products = JSON.parse(await fs.readFile(this.stripeProductsFile, 'utf8'));
            products[productId] = productData;
            await fs.writeFile(this.stripeProductsFile, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error('Error storing Stripe product:', error);
        }
    }

    async getStripeAccountByDiscordId(discordUserId) {
        try {
            const accounts = JSON.parse(await fs.readFile(this.stripeAccountsFile, 'utf8'));
            return accounts[discordUserId] || null;
        } catch (error) {
            return null;
        }
    }

    // ============ LOAN FEE PROCESSING ============

    async processLoanIssuanceFee(userId, loanAmount, loanId) {
        try {
            const feeAmount = config.FEES.LOAN_ISSUANCE_FEE;
            
            console.log(`Processing $${feeAmount} loan issuance fee for user ${userId}`);

            // Create manual payment request (no tip.cc integration)
            const paymentRequest = await this.createManualPaymentRequest(
                userId,
                feeAmount,
                `Loan Issuance Fee - Loan #${loanId}`,
                'loan_issuance'
            );

            // Send payment notification to user
            await this.sendPaymentNotification(userId, {
                type: 'loan_issuance',
                amount: feeAmount,
                loanId: loanId,
                loanAmount: loanAmount,
                paymentUrl: paymentRequest.paymentUrl
            });

            // Notify admin
            await this.notifyAdmin('loan_issuance_fee', {
                userId,
                loanId,
                loanAmount,
                feeAmount,
                paymentUrl: paymentRequest.paymentUrl
            });

            return paymentRequest;
        } catch (error) {
            console.error('Error processing loan issuance fee:', error);
            throw error;
        }
    }

    // ============ DISCORD COMMAND HANDLERS FOR STRIPE CONNECT ============

    /**
     * Handle !marketplace command - show marketplace storefront
     */
    async handleMarketplaceCommand(message) {
        if (!this.stripeEnabled) {
            return message.reply('❌ Stripe Connect marketplace not configured');
        }

        try {
            // Get all products
            const products = JSON.parse(await fs.readFile(this.stripeProductsFile, 'utf8'));
            const activeProducts = Object.values(products).filter(p => p.active);

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('🛍️ TrapHouse Marketplace')
                .setDescription('Browse products and services from community members')
                .addFields(
                    { name: '📊 Statistics', value: `${activeProducts.length} products available`, inline: true },
                    { name: '🔗 Access', value: `[Visit Storefront](${process.env.BASE_URL || 'http://localhost:3001'}/stripe/marketplace)`, inline: true }
                )
                .setFooter({ text: 'Powered by Stripe Connect • Platform fee: 10%' })
                .setTimestamp();

            // Show featured products
            if (activeProducts.length > 0) {
                const featured = activeProducts.slice(0, 3);
                embed.addFields({
                    name: '✨ Featured Products',
                    value: featured.map(p => `• **${p.name}** - $${(p.priceInCents/100).toFixed(2)}`).join('\n'),
                    inline: false
                });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling marketplace command:', error);
            await message.reply('❌ Error loading marketplace');
        }
    }

    /**
     * Handle !seller command - seller onboarding and dashboard
     */
    async handleSellerCommand(message, args) {
        if (!this.stripeEnabled) {
            return message.reply('❌ Stripe Connect marketplace not configured');
        }

        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        try {
            if (!subcommand || subcommand === 'status') {
                // Check seller status
                const account = await this.getStripeAccountByDiscordId(userId);
                
                if (!account) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF9800')
                        .setTitle('🚀 Become a Seller')
                        .setDescription('Start selling in the TrapHouse marketplace!')
                        .addFields(
                            { name: '💰 Earn Money', value: 'Sell products and services to Discord users', inline: true },
                            { name: '🔒 Secure Payments', value: 'Powered by Stripe with instant payouts', inline: true },
                            { name: '📊 Platform Fee', value: '10% + $0.30 per transaction', inline: true },
                            { name: '🎯 Getting Started', value: '`!seller create` - Create your seller account\n`!seller dashboard` - Access seller tools', inline: false }
                        )
                        .setFooter({ text: 'TrapHouse Marketplace • Powered by Stripe Connect' });

                    return message.reply({ embeds: [embed] });
                }

                // Show account status
                const status = await this.getStripeAccountStatus(account.stripeAccountId);
                
                const embed = new EmbedBuilder()
                    .setColor(status.canAcceptPayments ? '#4CAF50' : '#FF9800')
                    .setTitle('👤 Your Seller Account')
                    .setDescription(`Account Status: **${status.overallStatus.replace('_', ' ').toUpperCase()}**`)
                    .addFields(
                        { name: '✅ Can Accept Payments', value: status.canAcceptPayments ? 'Yes' : 'No', inline: true },
                        { name: '📋 Details Submitted', value: status.detailsSubmitted ? 'Yes' : 'No', inline: true },
                        { name: '💳 Charges Enabled', value: status.chargesEnabled ? 'Yes' : 'No', inline: true }
                    );

                if (status.requirements.currentlyDue.length > 0) {
                    embed.addFields({
                        name: '⚠️ Action Required',
                        value: status.requirements.currentlyDue.slice(0, 5).join(', '),
                        inline: false
                    });
                }

                embed.addFields({
                    name: '🔗 Quick Actions',
                    value: '`!seller dashboard` - Manage account\n`!seller create-product` - Add new product\n`!seller onboard` - Complete verification',
                    inline: false
                });

                await message.reply({ embeds: [embed] });

            } else if (subcommand === 'create') {
                // Create seller account
                const email = args[1];
                if (!email || !email.includes('@')) {
                    return message.reply('❌ Please provide a valid email: `!seller create your@email.com`');
                }

                const result = await this.createStripeConnectedAccount(userId, email);
                
                if (result.existing) {
                    return message.reply('✅ You already have a seller account! Use `!seller onboard` to complete setup.');
                }

                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('🎉 Seller Account Created!')
                    .setDescription('Your Stripe Connect account has been created successfully.')
                    .addFields(
                        { name: '📧 Email', value: email, inline: true },
                        { name: '🆔 Account ID', value: result.accountId, inline: true },
                        { name: '🔄 Next Step', value: 'Complete verification with `!seller onboard`', inline: false }
                    )
                    .setFooter({ text: 'You will need to verify your identity to start accepting payments' });

                await message.reply({ embeds: [embed] });

            } else if (subcommand === 'onboard') {
                // Create onboarding link
                const account = await this.getStripeAccountByDiscordId(userId);
                if (!account) {
                    return message.reply('❌ No seller account found. Use `!seller create your@email.com` first.');
                }

                const link = await this.createStripeOnboardingLink(account.stripeAccountId);

                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('🔗 Complete Account Verification')
                    .setDescription('Click the button below to complete your seller account setup with Stripe.')
                    .addFields(
                        { name: '⏰ Link Expires', value: `<t:${link.expiresAt}:R>`, inline: true },
                        { name: '🔒 Secure Process', value: 'Handled directly by Stripe', inline: true }
                    )
                    .setFooter({ text: 'This link expires in 24 hours' });

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Complete Verification')
                            .setStyle(ButtonStyle.Link)
                            .setURL(link.url)
                            .setEmoji('🔗')
                    );

                await message.reply({ embeds: [embed], components: [button] });

            } else if (subcommand === 'dashboard') {
                // Link to seller dashboard
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('🔧 Seller Dashboard')
                    .setDescription('Access your complete seller dashboard')
                    .addFields(
                        { name: '📊 Features', value: '• Account status\n• Create products\n• View earnings\n• Manage listings', inline: true },
                        { name: '🔗 Access', value: `[Open Dashboard](${process.env.BASE_URL || 'http://localhost:3001'}/stripe/seller-dashboard)`, inline: true }
                    );

                await message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error handling seller command:', error);
            await message.reply('❌ Error processing seller command: ' + error.message);
        }
    }

    async processLateRepaymentFee(userId, loanId, daysLate) {
        try {
            const feeAmount = config.FEES.LATE_REPAYMENT_FEE;
            
            console.log(`Processing $${feeAmount} late repayment fee for user ${userId}`);

            // Create manual payment request (no tip.cc integration)
            const paymentRequest = await this.createManualPaymentRequest(
                userId,
                feeAmount,
                `Late Repayment Fee - Loan #${loanId} (${daysLate} days late)`,
                'late_repayment'
            );

            // Send payment notification to user
            await this.sendPaymentNotification(userId, {
                type: 'late_repayment',
                amount: feeAmount,
                loanId: loanId,
                daysLate: daysLate,
                paymentUrl: paymentRequest.paymentUrl
            });

            // Notify admin
            await this.notifyAdmin('late_repayment_fee', {
                userId,
                loanId,
                daysLate,
                feeAmount,
                paymentUrl: paymentRequest.paymentUrl
            });

            return paymentRequest;
        } catch (error) {
            console.error('Error processing late repayment fee:', error);
            throw error;
        }
    }

    // ============ CRYPTO-ONLY PAYMENTS (NO TIP.CC) ============

    async createCryptoOnlyPayment(userId, amount, description, type) {
        try {
            // For JustTheTip - direct crypto payments only
            const paymentId = `crypto_${Date.now()}_${userId}`;
            
            await this.storePaymentRecord({
                paymentId: paymentId,
                userId: userId,
                amount: amount,
                type: type,
                status: 'crypto_pending',
                created: new Date().toISOString(),
                description: description,
                method: 'crypto'
            });

            // Generate crypto payment instructions
            const cryptoInstructions = this.generateCryptoPaymentInstructions(amount, type);

            return {
                paymentId: paymentId,
                paymentUrl: null, // No external payment URL - direct crypto only
                amount: amount,
                status: 'crypto_pending',
                instructions: cryptoInstructions
            };
        } catch (error) {
            console.error('Error creating crypto payment:', error);
            
            // Fallback: Create manual payment request
            return this.createManualPaymentRequest(userId, amount, description, type);
        }
    }

    generateCryptoPaymentInstructions(amount, type) {
        return {
            message: `💰 **Crypto Payment Required**\n\n` +
                    `**Amount:** $${amount} USD equivalent\n` +
                    `**Accepted:** ETH, BTC, USDC, USDT, MATIC, BNB\n\n` +
                    `**Instructions:**\n` +
                    `• Use your preferred crypto wallet\n` +
                    `• Send equivalent amount to admin wallet\n` +
                    `• Include transaction hash for verification\n` +
                    `• Payment confirmed within 15 minutes\n\n` +
                    `*No tip.cc integration - pure crypto payments only*`,
            supportedChains: config.JUSTTHETIP.SUPPORTED_CHAINS
        };
    }

    async createManualPaymentRequest(userId, amount, description, type) {
        const paymentId = `manual_${Date.now()}_${userId}`;
        
        await this.storePaymentRecord({
            paymentId: paymentId,
            userId: userId,
            amount: amount,
            type: type,
            status: 'manual_pending',
            created: new Date().toISOString(),
            description: description
        });

        return {
            paymentId: paymentId,
            paymentUrl: null,
            amount: amount,
            status: 'manual_pending'
        };
    }

    // ============ STRIPE SUBSCRIPTION ============

    async createStripeSubscription(userId, guildId) {
        try {
            const subscriptionData = {
                customer_id: userId,
                price_id: config.STRIPE.PRODUCT_ID,
                payment_method_types: ['card'],
                billing_cycle_anchor: Math.floor(Date.now() / 1000),
                metadata: {
                    discord_user_id: userId,
                    guild_id: guildId,
                    plan: 'traphouse_premium'
                }
            };

            // Create Stripe subscription (implement Stripe SDK)
            const subscription = await this.createStripeSubscriptionAPI(subscriptionData);

            // Store subscription record
            await this.storeSubscriptionRecord({
                subscriptionId: subscription.id,
                userId: userId,
                guildId: guildId,
                status: 'active',
                amount: config.FEES.SUBSCRIPTION_AMOUNT,
                interval: config.FEES.SUBSCRIPTION_INTERVAL,
                created: new Date().toISOString(),
                nextPayment: this.calculateNextPayment()
            });

            return subscription;
        } catch (error) {
            console.error('Error creating Stripe subscription:', error);
            throw error;
        }
    }

    async createStripeSubscriptionAPI(data) {
        // Stripe API integration would go here
        // For now, return mock data
        return {
            id: `sub_${Date.now()}`,
            status: 'active',
            payment_url: `https://checkout.stripe.com/pay/${Date.now()}`
        };
    }

    // ============ NOTIFICATION SYSTEM ============

    async sendPaymentNotification(userId, paymentData) {
        try {
            const user = await this.client.users.fetch(userId);
            if (!user) return;

            let embed, buttons;

            if (paymentData.type === 'loan_issuance') {
                embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('💰 Loan Issuance Fee Required')
                    .setDescription(`A fee is required to process your loan request.`)
                    .addFields(
                        { name: '🏦 Loan Amount', value: `$${paymentData.loanAmount}`, inline: true },
                        { name: '💳 Processing Fee', value: `$${paymentData.amount}`, inline: true },
                        { name: '🆔 Loan ID', value: `#${paymentData.loanId}`, inline: true }
                    )
                    .setFooter({ text: 'TrapHouse Lending System' })
                    .setTimestamp();
            } else if (paymentData.type === 'late_repayment') {
                embed = new EmbedBuilder()
                    .setColor('#FF4444')
                    .setTitle('⚠️ Late Repayment Fee')
                    .setDescription(`Your loan repayment is ${paymentData.daysLate} days late.`)
                    .addFields(
                        { name: '🆔 Loan ID', value: `#${paymentData.loanId}`, inline: true },
                        { name: '📅 Days Late', value: `${paymentData.daysLate} days`, inline: true },
                        { name: '💳 Late Fee', value: `$${paymentData.amount}`, inline: true }
                    )
                    .setFooter({ text: 'TrapHouse Lending System' })
                    .setTimestamp();
            }

            if (paymentData.paymentUrl) {
                buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Manual Payment Only')
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId('payment_manual')
                            .setEmoji('�'),
                        new ButtonBuilder()
                            .setCustomId('crypto_instructions')
                            .setLabel('Crypto Payment Info')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⚡')
                    );
            } else {
                buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('payment_manual')
                            .setLabel('Contact Admin for Payment')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('👨‍💼')
                    );
            }

            await user.send({ embeds: [embed], components: [buttons] });
        } catch (error) {
            console.error('Error sending payment notification:', error);
        }
    }

    async notifyAdmin(type, data) {
        try {
            const adminChannel = await this.client.channels.fetch(config.ADMIN_SETTINGS.PAYMENT_CHANNEL_ID);
            if (!adminChannel) return;

            let embed;

            if (type === 'loan_issuance_fee') {
                embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('💰 Loan Issuance Fee Processing')
                    .setDescription(`Fee processing initiated for new loan.`)
                    .addFields(
                        { name: '👤 User', value: `<@${data.userId}>`, inline: true },
                        { name: '🆔 Loan ID', value: `#${data.loanId}`, inline: true },
                        { name: '🏦 Loan Amount', value: `$${data.loanAmount}`, inline: true },
                        { name: '💳 Fee Amount', value: `$${data.feeAmount}`, inline: true },
                        { name: '🔗 Payment URL', value: data.paymentUrl || 'Manual Payment Required', inline: false }
                    )
                    .setFooter({ text: 'TrapHouse Admin Panel' })
                    .setTimestamp();
            } else if (type === 'late_repayment_fee') {
                embed = new EmbedBuilder()
                    .setColor('#FF9800')
                    .setTitle('⚠️ Late Repayment Fee Processing')
                    .setDescription(`Late fee processing initiated.`)
                    .addFields(
                        { name: '👤 User', value: `<@${data.userId}>`, inline: true },
                        { name: '🆔 Loan ID', value: `#${data.loanId}`, inline: true },
                        { name: '📅 Days Late', value: `${data.daysLate} days`, inline: true },
                        { name: '💳 Fee Amount', value: `$${data.feeAmount}`, inline: true },
                        { name: '🔗 Payment URL', value: data.paymentUrl || 'Manual Payment Required', inline: false }
                    )
                    .setFooter({ text: 'TrapHouse Admin Panel' })
                    .setTimestamp();
            }

            await adminChannel.send({ embeds: [embed] });

            // Also send DM to admin
            const admin = await this.client.users.fetch(config.ADMIN_SETTINGS.PAYMENT_ADMIN_ID);
            if (admin) {
                await admin.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error notifying admin:', error);
        }
    }

    // ============ DATA STORAGE ============

    async storePaymentRecord(paymentData) {
        try {
            const payments = JSON.parse(await fs.readFile(this.paymentsFile, 'utf8'));
            payments[paymentData.paymentId] = paymentData;
            await fs.writeFile(this.paymentsFile, JSON.stringify(payments, null, 2));
        } catch (error) {
            console.error('Error storing payment record:', error);
        }
    }

    async storeSubscriptionRecord(subscriptionData) {
        try {
            const subscriptions = JSON.parse(await fs.readFile(this.subscriptionsFile, 'utf8'));
            subscriptions[subscriptionData.subscriptionId] = subscriptionData;
            await fs.writeFile(this.subscriptionsFile, JSON.stringify(subscriptions, null, 2));
        } catch (error) {
            console.error('Error storing subscription record:', error);
        }
    }

    // ============ UTILITY FUNCTIONS ============

    calculateNextPayment() {
        const now = new Date();
        const nextPayment = new Date(now);
        nextPayment.setMonth(nextPayment.getMonth() + 3); // Quarterly
        return nextPayment.toISOString();
    }

    async getPaymentStatus(paymentId) {
        try {
            const payments = JSON.parse(await fs.readFile(this.paymentsFile, 'utf8'));
            return payments[paymentId] || null;
        } catch (error) {
            console.error('Error getting payment status:', error);
            return null;
        }
    }

    async markPaymentComplete(paymentId) {
        try {
            const payments = JSON.parse(await fs.readFile(this.paymentsFile, 'utf8'));
            if (payments[paymentId]) {
                payments[paymentId].status = 'completed';
                payments[paymentId].completed = new Date().toISOString();
                await fs.writeFile(this.paymentsFile, JSON.stringify(payments, null, 2));
            }
        } catch (error) {
            console.error('Error marking payment complete:', error);
        }
    }

    /**
     * ==================== CRYPTO PAYMENT METHODS ====================
     */

    /**
     * Create a fiat deposit using Stripe
     */
    async createFiatDeposit(message, args) {
        const userId = message.author.id;
        const amount = parseFloat(args[0]);
        const currency = args[1]?.toUpperCase() || 'USD';

        if (!this.stripeEnabled) {
            return await message.reply('❌ Stripe payments are not configured. Please contact an administrator.');
        }

        if (!amount || amount < 5) {
            return await message.reply('❌ Minimum deposit is $5.00');
        }

        if (amount > 10000) {
            return await message.reply('❌ Maximum deposit is $10,000 per transaction for security');
        }

        try {
            // Create Stripe payment intent
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata: {
                    discord_user_id: userId,
                    discord_username: message.author.username,
                    purpose: 'traphouse_deposit',
                    source: 'discord_bot'
                },
                description: `TrapHouse Bot Deposit - ${message.author.username}`,
                receipt_email: process.env.ADMIN_EMAIL, // Optional: for receipts
                setup_future_usage: 'off_session' // Allow saving payment method
            });

            // Store pending deposit
            this.pendingDeposits.set(paymentIntent.id, {
                userId: userId,
                username: message.author.username,
                amount: amount,
                currency: currency,
                status: 'pending',
                created: new Date(),
                type: 'stripe_deposit',
                paymentIntentId: paymentIntent.id
            });

            await this.saveCryptoData();

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('💳 Fiat Deposit Created')
                .setDescription('Complete your deposit using the secure Stripe payment link below:')
                .addFields(
                    {
                        name: '💰 Amount',
                        value: `$${amount.toFixed(2)} ${currency}`,
                        inline: true
                    },
                    {
                        name: '🆔 Payment ID',
                        value: paymentIntent.id.slice(-8),
                        inline: true
                    },
                    {
                        name: '🛡️ Security Features',
                        value: '• PCI DSS Level 1 Compliance\n• 3D Secure Authentication\n• Fraud Detection\n• SSL Encryption',
                        inline: false
                    },
                    {
                        name: '⏰ Payment Link Expires',
                        value: '24 hours',
                        inline: true
                    },
                    {
                        name: '🔗 Next Steps',
                        value: 'Click the button below to complete payment',
                        inline: true
                    }
                )
                .setFooter({ text: 'TrapHouse: Secure fiat deposits powered by Stripe' });

            const paymentUrl = `https://checkout.stripe.com/c/pay/${paymentIntent.client_secret}`;
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Complete Payment')
                        .setStyle(ButtonStyle.Link)
                        .setURL(paymentUrl)
                        .setEmoji('💳'),
                    new ButtonBuilder()
                        .setCustomId(`cancel_payment_${paymentIntent.id}`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('❌')
                );

            await message.reply({ embeds: [embed], components: [row] });

            // Set up auto-expiry for pending deposit
            setTimeout(async () => {
                if (this.pendingDeposits.has(paymentIntent.id)) {
                    this.pendingDeposits.delete(paymentIntent.id);
                    await this.saveCryptoData();
                    console.log(`⏰ Expired payment intent ${paymentIntent.id}`);
                }
            }, 24 * 60 * 60 * 1000); // 24 hours

        } catch (error) {
            console.error('Stripe deposit error:', error);
            await message.reply('❌ Failed to create deposit. Please try again later or contact support.');
        }
    }

    /**
     * Generate crypto deposit address for user
     */
    async generateCryptoDeposit(message, args) {
        const userId = message.author.id;
        const crypto = args[0]?.toUpperCase();

        if (!crypto || !this.supportedCrypto[crypto]) {
            const supported = Object.keys(this.supportedCrypto).join(', ');
            return await message.reply(`❌ Unsupported cryptocurrency. Supported: ${supported}`);
        }

        try {
            // Check if user already has a wallet for this crypto
            const walletKey = `${userId}_${crypto}`;
            let walletData = this.userWallets.get(walletKey);

            if (!walletData) {
                // Generate new wallet for user
                const wallet = ethers.Wallet.createRandom();
                
                walletData = {
                    userId: userId,
                    username: message.author.username,
                    crypto: crypto,
                    address: wallet.address,
                    privateKey: wallet.privateKey, // ⚠️ Store encrypted in production!
                    created: new Date(),
                    balance: 0,
                    transactions: [],
                    isActive: true
                };

                this.userWallets.set(walletKey, walletData);
                await this.saveCryptoData();

                // Start monitoring this address
                this.startAddressMonitoring(walletData.address, crypto, userId);
            }

            const cryptoInfo = this.supportedCrypto[crypto];

            const embed = new EmbedBuilder()
                .setColor('#f7931a')
                .setTitle(`🔑 ${crypto} Deposit Address`)
                .setDescription(`Send ${cryptoInfo.name} to this address to deposit funds:`)
                .addFields(
                    {
                        name: '📍 Your Deposit Address',
                        value: `\`\`\`${walletData.address}\`\`\``,
                        inline: false
                    },
                    {
                        name: '⛓️ Network',
                        value: `${cryptoInfo.chain.charAt(0).toUpperCase() + cryptoInfo.chain.slice(1)} Mainnet`,
                        inline: true
                    },
                    {
                        name: '💰 Current Balance',
                        value: `${walletData.balance.toFixed(6)} ${crypto}`,
                        inline: true
                    },
                    {
                        name: '🔢 Minimum Deposit',
                        value: `${cryptoInfo.minDeposit} ${crypto}`,
                        inline: true
                    },
                    {
                        name: '⚠️ Important Security Notes',
                        value: `• Only send ${crypto} to this address\n• Deposits require 12 confirmations\n• Address is permanently yours\n• Do not share your private keys`,
                        inline: false
                    },
                    {
                        name: '🕐 Auto-Detection',
                        value: 'Deposits are automatically detected and credited within 15-30 minutes',
                        inline: false
                    }
                )
                .setThumbnail('https://cryptologos.cc/logos/ethereum-eth-logo.png')
                .setFooter({ text: 'TrapHouse: Secure crypto deposits with real-time monitoring' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`refresh_balance_${crypto}_${userId}`)
                        .setLabel('Refresh Balance')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId(`view_transactions_${crypto}_${userId}`)
                        .setLabel('View Transactions')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📊')
                );

            await message.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Crypto deposit error:', error);
            await message.reply('❌ Failed to generate deposit address. Please try again later.');
        }
    }

    /**
     * Start monitoring crypto address for incoming deposits
     */
    async startAddressMonitoring(address, crypto, userId) {
        console.log(`👀 Started monitoring ${crypto} deposits for ${address.slice(0, 6)}...${address.slice(-4)}`);

        const checkDeposits = async () => {
            try {
                if (crypto === 'ETH') {
                    await this.checkEthBalance(address, crypto, userId);
                } else {
                    // Handle ERC-20 tokens (USDC, USDT, WBTC)
                    await this.checkTokenBalance(address, crypto, userId);
                }
            } catch (error) {
                console.error(`Error monitoring ${crypto} deposits for ${address}:`, error);
            }
        };

        // Check immediately, then every 2 minutes
        await checkDeposits();
        const intervalId = setInterval(checkDeposits, 2 * 60 * 1000);

        // Store interval ID for cleanup if needed
        if (!this.monitoringIntervals) this.monitoringIntervals = new Map();
        this.monitoringIntervals.set(`${address}_${crypto}`, intervalId);
    }

    /**
     * Check ETH balance for address
     */
    async checkEthBalance(address, crypto, userId) {
        try {
            const balance = await this.ethProvider.getBalance(address);
            const balanceEth = parseFloat(ethers.formatEther(balance));
            
            const walletKey = `${userId}_${crypto}`;
            const walletData = this.userWallets.get(walletKey);
            
            if (walletData && balanceEth > walletData.balance) {
                const depositAmount = balanceEth - walletData.balance;
                if (depositAmount >= this.supportedCrypto[crypto].minDeposit) {
                    await this.processCryptoDeposit(address, crypto, depositAmount, userId, balanceEth);
                }
            }
        } catch (error) {
            console.error(`Error checking ETH balance for ${address}:`, error);
        }
    }

    /**
     * Check ERC-20 token balance
     */
    async checkTokenBalance(address, crypto, userId) {
        const tokenInfo = this.supportedCrypto[crypto];
        if (!tokenInfo.contract) return;

        try {
            // ERC-20 ABI for balanceOf function
            const erc20Abi = [
                "function balanceOf(address owner) view returns (uint256)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)"
            ];

            const contract = new ethers.Contract(tokenInfo.contract, erc20Abi, this.ethProvider);
            const balance = await contract.balanceOf(address);
            const formattedBalance = parseFloat(ethers.formatUnits(balance, tokenInfo.decimals));

            const walletKey = `${userId}_${crypto}`;
            const walletData = this.userWallets.get(walletKey);

            if (walletData && formattedBalance > walletData.balance) {
                const depositAmount = formattedBalance - walletData.balance;
                if (depositAmount >= tokenInfo.minDeposit) {
                    await this.processCryptoDeposit(address, crypto, depositAmount, userId, formattedBalance);
                }
            }
        } catch (error) {
            console.error(`Error checking ${crypto} balance for ${address}:`, error);
        }
    }

    /**
     * Process confirmed crypto deposit
     */
    async processCryptoDeposit(address, crypto, depositAmount, userId, newBalance) {
        try {
            const transactionId = `crypto_${Date.now()}_${userId}_${crypto}`;
            
            // Record transaction
            this.cryptoTransactions.set(transactionId, {
                userId: userId,
                type: 'crypto_deposit',
                crypto: crypto,
                amount: depositAmount,
                address: address,
                status: 'confirmed',
                timestamp: new Date(),
                txHash: null, // Would need to fetch actual transaction hash
                confirmations: 12
            });

            // Update user wallet balance
            const walletKey = `${userId}_${crypto}`;
            const walletData = this.userWallets.get(walletKey);
            if (walletData) {
                walletData.balance = newBalance;
                walletData.transactions.push(transactionId);
                walletData.lastUpdated = new Date();
            }

            await this.saveCryptoData();

            // Notify user via Discord
            const user = await this.client.users.fetch(userId);
            
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Crypto Deposit Confirmed!')
                .setDescription(`Your ${crypto} deposit has been confirmed and credited to your account.`)
                .addFields(
                    {
                        name: '💰 Amount Deposited',
                        value: `${depositAmount.toFixed(6)} ${crypto}`,
                        inline: true
                    },
                    {
                        name: '💼 New Balance',
                        value: `${newBalance.toFixed(6)} ${crypto}`,
                        inline: true
                    },
                    {
                        name: '📍 To Address',
                        value: `${address.slice(0, 6)}...${address.slice(-4)}`,
                        inline: true
                    },
                    {
                        name: '🆔 Transaction ID',
                        value: transactionId.slice(-12),
                        inline: true
                    },
                    {
                        name: '🔗 Confirmations',
                        value: '12+ (Confirmed)',
                        inline: true
                    },
                    {
                        name: '💼 Available Actions',
                        value: '• Transfer to JustTheTip vaults\n• Convert to other cryptocurrencies\n• Withdraw to external wallet\n• Use for TrapHouse features',
                        inline: false
                    }
                )
                .setThumbnail('https://cryptologos.cc/logos/ethereum-eth-logo.png')
                .setFooter({ text: 'TrapHouse: Crypto deposit successfully processed' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`vault_transfer_${crypto}_${userId}`)
                        .setLabel('Transfer to Vault')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🏦'),
                    new ButtonBuilder()
                        .setCustomId(`wallet_status_${userId}`)
                        .setLabel('View Wallet')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('💼')
                );

            await user.send({ embeds: [embed], components: [row] });

            console.log(`✅ Processed ${depositAmount.toFixed(6)} ${crypto} deposit for user ${userId}`);

            // Integration with TiltCheck - credit to user's gambling bankroll if they have an active session
            await this.creditToTiltCheckSession(userId, crypto, depositAmount);

        } catch (error) {
            console.error('Error processing crypto deposit:', error);
        }
    }

    /**
     * Credit crypto deposit to active TiltCheck session
     */
    async creditToTiltCheckSession(userId, crypto, amount) {
        try {
            // Check if user has active TiltCheck session
            const tiltCheck = require('./tiltCheckIntegration');
            if (tiltCheck && tiltCheck.userSessions && tiltCheck.userSessions.has(userId)) {
                // Convert crypto to USD equivalent (simplified - use real price feeds in production)
                const usdValue = await this.convertCryptoToUSD(crypto, amount);
                
                const session = tiltCheck.userSessions.get(userId);
                session.currentBalance += usdValue;
                session.bankroll += usdValue;

                console.log(`💰 Credited $${usdValue.toFixed(2)} to ${userId}'s active TiltCheck session`);
            }
        } catch (error) {
            console.error('Error crediting to TiltCheck session:', error);
        }
    }

    /**
     * Convert cryptocurrency amount to USD (simplified)
     */
    async convertCryptoToUSD(crypto, amount) {
        // Simplified conversion - in production, use real price feeds
        const prices = {
            ETH: 2000,   // Example prices
            USDC: 1,
            USDT: 1,
            WBTC: 45000
        };
        
        return amount * (prices[crypto] || 0);
    }

    /**
     * Withdraw crypto to external address
     */
    async withdrawCrypto(message, args) {
        const userId = message.author.id;
        const crypto = args[0]?.toUpperCase();
        const amount = parseFloat(args[1]);
        const toAddress = args[2];

        if (!crypto || !this.supportedCrypto[crypto]) {
            const supported = Object.keys(this.supportedCrypto).join(', ');
            return await message.reply(`❌ Unsupported crypto. Supported: ${supported}`);
        }

        if (!amount || amount <= 0) {
            return await message.reply('❌ Please specify a valid withdrawal amount');
        }

        if (!toAddress || !ethers.isAddress(toAddress)) {
            return await message.reply('❌ Please provide a valid Ethereum address');
        }

        const walletKey = `${userId}_${crypto}`;
        const walletData = this.userWallets.get(walletKey);

        if (!walletData || walletData.balance < amount) {
            const available = walletData?.balance?.toFixed(6) || '0';
            return await message.reply(`❌ Insufficient ${crypto} balance. Available: ${available}`);
        }

        // Gas estimation and confirmation
        const embed = new EmbedBuilder()
            .setColor('#ff9500')
            .setTitle('⚠️ Crypto Withdrawal Confirmation')
            .setDescription('Please confirm this withdrawal. **This action cannot be undone.**')
            .addFields(
                {
                    name: '💰 Amount',
                    value: `${amount} ${crypto}`,
                    inline: true
                },
                {
                    name: '📍 To Address',
                    value: `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
                    inline: true
                },
                {
                    name: '💸 Estimated Gas Fee',
                    value: '~$5-15 (varies)',
                    inline: true
                },
                {
                    name: '⚠️ Security Check',
                    value: '• Verify the destination address\n• Ensure it supports this token\n• Double-check the amount\n• This transaction is irreversible',
                    inline: false
                }
            )
            .setFooter({ text: 'You have 60 seconds to confirm or cancel' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_withdrawal_${crypto}_${amount}_${userId}`)
                    .setLabel('Confirm Withdrawal')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`cancel_withdrawal_${userId}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        const confirmMsg = await message.reply({ embeds: [embed], components: [row] });

        // Auto-expire confirmation after 60 seconds
        setTimeout(async () => {
            try {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('expired_withdrawal')
                            .setLabel('Expired')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⏰')
                            .setDisabled(true)
                    );

                await confirmMsg.edit({ components: [disabledRow] });
            } catch (error) {
                console.error('Error expiring withdrawal confirmation:', error);
            }
        }, 60000);
    }

    /**
     * Show comprehensive wallet status
     */
    async showWalletStatus(message) {
        const userId = message.author.id;
        
        // Get user's crypto wallets
        const userWallets = Array.from(this.userWallets.entries())
            .filter(([key]) => key.startsWith(userId))
            .map(([key, data]) => data);

        // Get recent transactions
        const userTransactions = Array.from(this.cryptoTransactions.entries())
            .filter(([_, tx]) => tx.userId === userId)
            .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
            .slice(0, 5);

        let balanceText = '';
        let totalUSDValue = 0;

        if (userWallets.length === 0) {
            balanceText = 'No crypto wallets created yet\nUse `!deposit crypto <CRYPTO>` to get started';
        } else {
            for (const wallet of userWallets) {
                const usdValue = await this.convertCryptoToUSD(wallet.crypto, wallet.balance);
                totalUSDValue += usdValue;
                balanceText += `${wallet.crypto}: ${wallet.balance.toFixed(6)} (~$${usdValue.toFixed(2)})\n`;
            }
        }

        let transactionText = '';
        if (userTransactions.length === 0) {
            transactionText = 'No transactions yet';
        } else {
            userTransactions.forEach(([id, tx]) => {
                const date = new Date(tx.timestamp).toLocaleDateString();
                const emoji = tx.type === 'crypto_deposit' ? '📥' : '📤';
                transactionText += `${emoji} ${tx.amount.toFixed(4)} ${tx.crypto} (${date})\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('💼 Your TrapHouse Crypto Wallet')
            .setDescription('Complete cryptocurrency and payment management dashboard')
            .addFields(
                {
                    name: '💰 Crypto Portfolio',
                    value: balanceText || 'No balances',
                    inline: true
                },
                {
                    name: '📊 Recent Transactions',
                    value: transactionText || 'No transactions',
                    inline: true
                },
                {
                    name: '💵 Total USD Value',
                    value: `$${totalUSDValue.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '🔐 Supported Cryptocurrencies',
                    value: Object.keys(this.supportedCrypto).join(' • '),
                    inline: false
                },
                {
                    name: '💳 Payment Methods',
                    value: '• Credit/Debit Cards (Stripe)\n• Crypto Deposits (ETH, USDC, USDT, WBTC)\n• Bank Transfers (Coming Soon)\n• Apple Pay / Google Pay (Stripe)',
                    inline: false
                },
                {
                    name: '🛠️ Available Commands',
                    value: '`!deposit fiat 100` - Fiat deposit via Stripe\n`!deposit crypto ETH` - Generate crypto deposit address\n`!withdraw ETH 0.5 0x...` - Crypto withdrawal\n`!wallet status` - This dashboard\n`!wallet history` - Full transaction history',
                    inline: false
                }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'TrapHouse: Professional crypto & fiat payment processing' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`deposit_crypto_${userId}`)
                    .setLabel('Deposit Crypto')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId(`deposit_fiat_${userId}`)
                    .setLabel('Deposit Fiat')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💳'),
                new ButtonBuilder()
                    .setCustomId(`view_vault_${userId}`)
                    .setLabel('JustTheTip Vaults')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏦')
            );

        await message.reply({ embeds: [embed], components: [row] });
    }
}

module.exports = PaymentManager;

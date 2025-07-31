const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config/payments');

// Initialize Stripe with your actual keys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Enhanced Payment Manager with Stripe Connect Integration
 * Supports both crypto payments (JustTheTip) and marketplace (Stripe Connect)
 */
class PaymentManager {
    constructor(client) {
        this.client = client;
        this.paymentsFile = path.join(__dirname, 'data/payments.json');
        this.subscriptionsFile = path.join(__dirname, 'data/subscriptions.json');
        this.stripeAccountsFile = path.join(__dirname, 'data/stripe_accounts.json');
        this.stripeProductsFile = path.join(__dirname, 'data/stripe_products.json');
        
        // Validate Stripe configuration
        this.validateStripeConfig();
        
        // Initialize Stripe with API version
        this.stripe = stripe;
        this.stripe.setApiVersion('2025-07-30.basil');
        
        this.initializePaymentData();
    }

    /**
     * Validate Stripe configuration is properly set up
     */
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

            // Create payment request via tip.cc
            const paymentRequest = await this.createTipccPayment(
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

            // Create payment request via tip.cc
            const paymentRequest = await this.createTipccPayment(
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

    // ============ TIP.CC INTEGRATION ============

    async createTipccPayment(userId, amount, description, type) {
        try {
            const paymentData = {
                amount: amount,
                currency: config.TIPCC.CURRENCY,
                description: description,
                metadata: {
                    userId: userId,
                    type: type,
                    timestamp: Date.now()
                }
            };

            // Create payment request via tip.cc API
            const response = await axios.post(`${config.TIPCC.BASE_URL}/payments`, paymentData, {
                headers: {
                    'Authorization': `Bearer ${config.TIPCC.API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Store payment record
            await this.storePaymentRecord({
                paymentId: response.data.id,
                userId: userId,
                amount: amount,
                type: type,
                status: 'pending',
                created: new Date().toISOString(),
                description: description
            });

            return {
                paymentId: response.data.id,
                paymentUrl: response.data.payment_url,
                amount: amount,
                status: 'pending'
            };
        } catch (error) {
            console.error('Error creating tip.cc payment:', error);
            
            // Fallback: Create manual payment request
            return this.createManualPaymentRequest(userId, amount, description, type);
        }
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
                            .setLabel('Pay with tip.cc')
                            .setStyle(ButtonStyle.Link)
                            .setURL(paymentData.paymentUrl)
                            .setEmoji('💳'),
                        new ButtonBuilder()
                            .setCustomId('payment_manual')
                            .setLabel('Manual Payment')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🏦')
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
}

module.exports = PaymentManager;

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config/payments');

class PaymentManager {
    constructor(client) {
        this.client = client;
        this.paymentsFile = path.join(__dirname, '../data/payments.json');
        this.subscriptionsFile = path.join(__dirname, '../data/subscriptions.json');
        this.initializePaymentData();
    }

    async initializePaymentData() {
        try {
            // Initialize payments data file
            try {
                await fs.access(this.paymentsFile);
            } catch {
                await fs.writeFile(this.paymentsFile, JSON.stringify({}));
            }

            // Initialize subscriptions data file
            try {
                await fs.access(this.subscriptionsFile);
            } catch {
                await fs.writeFile(this.subscriptionsFile, JSON.stringify({}));
            }
        } catch (error) {
            console.error('Error initializing payment data:', error);
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

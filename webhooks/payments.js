const express = require('express');
const crypto = require('crypto');
const PaymentManager = require('./paymentManager');
const config = require('./config/payments');

const router = express.Router();

// tip.cc Webhook Handler
router.post('/tipcc', async (req, res) => {
    try {
        // Verify webhook signature
        const signature = req.headers['x-tipcc-signature'];
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', config.TIPCC.WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        if (signature !== `sha256=${expectedSignature}`) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const { event_type, data } = req.body;

        if (event_type === 'payment.completed') {
            await handleTipccPaymentCompleted(data);
        } else if (event_type === 'payment.failed') {
            await handleTipccPaymentFailed(data);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing tip.cc webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stripe Webhook Handler
router.post('/stripe', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const payload = req.body;

        // Verify Stripe webhook signature
        // const event = stripe.webhooks.constructEvent(payload, signature, config.STRIPE.WEBHOOK_SECRET);

        // For now, handle mock events
        const event = req.body;

        switch (event.type) {
            case 'invoice.payment_succeeded':
                await handleStripePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleStripePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleStripeSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleStripeSubscriptionCancelled(event.data.object);
                break;
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing Stripe webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Discord Boost Tracking
router.post('/discord-boost', async (req, res) => {
    try {
        // Handle Discord server boost events
        const { user_id, guild_id, boost_type } = req.body;
        
        if (boost_type === 'boost_added') {
            await handleDiscordBoostAdded(user_id, guild_id);
        } else if (boost_type === 'boost_removed') {
            await handleDiscordBoostRemoved(user_id, guild_id);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing Discord boost webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============ WEBHOOK HANDLERS ============

async function handleTipccPaymentCompleted(paymentData) {
    try {
        const { id, amount, metadata } = paymentData;
        const { userId, type } = metadata;

        console.log(`tip.cc payment completed: ${id}, $${amount}, type: ${type}`);

        // Mark payment as completed
        const paymentManager = new PaymentManager();
        await paymentManager.markPaymentComplete(id);

        // Send confirmation to user and admin
        await sendPaymentConfirmation(userId, {
            paymentId: id,
            amount: amount,
            type: type,
            method: 'tip.cc',
            status: 'completed'
        });

    } catch (error) {
        console.error('Error handling tip.cc payment completion:', error);
    }
}

async function handleTipccPaymentFailed(paymentData) {
    try {
        const { id, amount, metadata } = paymentData;
        const { userId, type } = metadata;

        console.log(`tip.cc payment failed: ${id}, $${amount}, type: ${type}`);

        // Send failure notification
        await sendPaymentFailureNotification(userId, {
            paymentId: id,
            amount: amount,
            type: type,
            method: 'tip.cc',
            status: 'failed'
        });

    } catch (error) {
        console.error('Error handling tip.cc payment failure:', error);
    }
}

async function handleStripePaymentSucceeded(invoiceData) {
    try {
        const { customer, amount_paid, subscription } = invoiceData;
        
        console.log(`Stripe payment succeeded: ${customer}, $${amount_paid / 100}`);

        // Update subscription status
        await updateSubscriptionStatus(customer, 'active');

        // Send confirmation
        await sendPaymentConfirmation(customer, {
            amount: amount_paid / 100,
            type: 'subscription',
            method: 'stripe',
            status: 'completed',
            subscriptionId: subscription
        });

    } catch (error) {
        console.error('Error handling Stripe payment success:', error);
    }
}

async function handleStripePaymentFailed(invoiceData) {
    try {
        const { customer, amount_due, subscription } = invoiceData;
        
        console.log(`Stripe payment failed: ${customer}, $${amount_due / 100}`);

        // Send failure notification
        await sendPaymentFailureNotification(customer, {
            amount: amount_due / 100,
            type: 'subscription',
            method: 'stripe',
            status: 'failed',
            subscriptionId: subscription
        });

    } catch (error) {
        console.error('Error handling Stripe payment failure:', error);
    }
}

async function handleStripeSubscriptionCreated(subscriptionData) {
    try {
        const { customer, id, status } = subscriptionData;
        
        console.log(`Stripe subscription created: ${customer}, ${id}, ${status}`);

        // Store subscription and activate premium features
        await activatePremiumFeatures(customer, id);

    } catch (error) {
        console.error('Error handling Stripe subscription creation:', error);
    }
}

async function handleStripeSubscriptionCancelled(subscriptionData) {
    try {
        const { customer, id } = subscriptionData;
        
        console.log(`Stripe subscription cancelled: ${customer}, ${id}`);

        // Deactivate premium features
        await deactivatePremiumFeatures(customer, id);

    } catch (error) {
        console.error('Error handling Stripe subscription cancellation:', error);
    }
}

async function handleDiscordBoostAdded(userId, guildId) {
    try {
        console.log(`Discord boost added: ${userId} in ${guildId}`);

        // Activate boost benefits
        await activateBoostBenefits(userId, guildId);

        // Send thank you message
        await sendBoostThankYou(userId);

    } catch (error) {
        console.error('Error handling Discord boost addition:', error);
    }
}

async function handleDiscordBoostRemoved(userId, guildId) {
    try {
        console.log(`Discord boost removed: ${userId} in ${guildId}`);

        // Deactivate boost benefits
        await deactivateBoostBenefits(userId, guildId);

    } catch (error) {
        console.error('Error handling Discord boost removal:', error);
    }
}

// ============ HELPER FUNCTIONS ============

async function sendPaymentConfirmation(userId, paymentData) {
    // Implementation would send Discord DM to user and admin
    console.log(`Payment confirmation sent to ${userId}:`, paymentData);
}

async function sendPaymentFailureNotification(userId, paymentData) {
    // Implementation would send Discord DM to user and admin
    console.log(`Payment failure notification sent to ${userId}:`, paymentData);
}

async function updateSubscriptionStatus(customerId, status) {
    // Implementation would update subscription in database
    console.log(`Subscription status updated: ${customerId} -> ${status}`);
}

async function activatePremiumFeatures(userId, subscriptionId) {
    // Implementation would activate premium features for user
    console.log(`Premium features activated: ${userId}, ${subscriptionId}`);
}

async function deactivatePremiumFeatures(userId, subscriptionId) {
    // Implementation would deactivate premium features for user
    console.log(`Premium features deactivated: ${userId}, ${subscriptionId}`);
}

async function activateBoostBenefits(userId, guildId) {
    // Implementation would activate Discord boost benefits
    console.log(`Boost benefits activated: ${userId}, ${guildId}`);
}

async function deactivateBoostBenefits(userId, guildId) {
    // Implementation would deactivate Discord boost benefits
    console.log(`Boost benefits deactivated: ${userId}, ${guildId}`);
}

async function sendBoostThankYou(userId) {
    // Implementation would send thank you message for boosting
    console.log(`Boost thank you sent to: ${userId}`);
}

module.exports = router;

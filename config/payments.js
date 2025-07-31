// Payment Configuration for TrapHouse Bot
module.exports = {
    // Payment Methods
    PAYMENT_METHODS: {
        JUSTTHETIP: 'justthetip',
        STRIPE: 'stripe',
        DISCORD_NITRO: 'discord'
    },

    // Fee Structure
    FEES: {
        // Per-loan fees (JustTheTip)
        LOAN_ISSUANCE_FEE: 3.00,           // $3 per loan
        LATE_REPAYMENT_FEE: 3.00,          // $3 per late payment
        
        // Subscription fees (Stripe)
        SUBSCRIPTION_TOTAL: 2000.00,        // $2000 total
        SUBSCRIPTION_INSTALLMENTS: 4,       // 4 payments
        SUBSCRIPTION_AMOUNT: 500.00,        // $500 per payment
        SUBSCRIPTION_INTERVAL: 'quarterly', // Every 3 months
        
        // Discord Nitro alternative
        DISCORD_BOOST_EQUIVALENT: 9.99      // Monthly Discord Boost
    },

    // Admin Settings
    ADMIN_SETTINGS: {
        PAYMENT_ADMIN_ID: process.env.PAYMENT_ADMIN_ID || '123456789',
        PAYMENT_CHANNEL_ID: process.env.PAYMENT_CHANNEL_ID || '987654321',
        NOTIFICATION_WEBHOOK: process.env.PAYMENT_WEBHOOK_URL
    },

    // JustTheTip Configuration (Crypto-only, no tip.cc)
    JUSTTHETIP: {
        WEBHOOK_SECRET: process.env.JUSTTHETIP_WEBHOOK_SECRET,
        BASE_URL: 'https://api.justthetip.bot/v1',
        CRYPTO_ONLY: true, // No tip.cc integration
        SUPPORTED_CHAINS: ['ETH', 'BTC', 'MATIC', 'BNB', 'USDC', 'USDT']
    },

    // Stripe Configuration
    STRIPE: {
        PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        PRODUCT_ID: process.env.STRIPE_PRODUCT_ID || 'traphouse_subscription'
    },

    // Payment Tracking
    TRACKING: {
        LOG_PAYMENTS: true,
        STORE_RECEIPTS: true,
        BACKUP_TO_CHANNEL: true
    }
};

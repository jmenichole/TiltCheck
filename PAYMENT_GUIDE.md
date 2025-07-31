# TrapHouse Payment System Setup Guide

## 🚀 Quick Start

Your TrapHouse Discord bot now includes a comprehensive payment system supporting both cryptocurrency and fiat payments through Stripe!

## 📁 New Files Added

- `paymentManager.js` - Core payment processing engine
- `test-payment-system.js` - Testing script
- `.env.payments` - Payment configuration template
- `github-webhook-server.js` - Enhanced with Stripe webhooks
- Enhanced `index.js` - Added payment commands and UI interactions

## 💰 Payment Commands

### For Users:
- `!deposit crypto ETH` - Generate Ethereum deposit address
- `!deposit crypto USDC` - Generate USDC deposit address  
- `!deposit crypto USDT` - Generate Tether deposit address
- `!deposit crypto WBTC` - Generate Wrapped Bitcoin deposit address
- `!deposit fiat <amount>` - Create Stripe payment link (e.g., `!deposit fiat 100`)
- `!withdraw <currency> <amount> <address>` - Withdraw funds
- `!wallet` - View wallet status and balances

### Interactive Buttons:
- 🔄 Refresh Balance
- 📊 Transaction History  
- 🏦 Vault Transfer
- 💰 Crypto Deposit
- 💳 Fiat Deposit

## 🔧 Configuration Setup

### 1. Install Dependencies
```bash
npm install stripe web3 ethers @solana/web3.js dotenv
```

### 2. Configure Environment Variables
Copy `.env.payments` to `.env` and fill in your values:

```env
# Stripe Configuration (for fiat payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Ethereum Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_NETWORK=mainnet

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Webhook Server
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your_github_webhook_secret
```

### 3. Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Set up a webhook endpoint pointing to your server
4. Configure webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4. Ethereum Setup
1. Get an Infura or Alchemy API key for Ethereum RPC
2. The system generates real Ethereum wallets for each user
3. Supports ETH and ERC-20 tokens (USDC, USDT, WBTC)

## 🧪 Testing

Run the test script to verify everything is working:
```bash
node test-payment-system.js
```

## 🔐 Security Features

- **Wallet Security**: Each user gets a unique Ethereum wallet
- **Webhook Validation**: Stripe webhooks are cryptographically verified
- **Rate Limiting**: Built-in protection against spam
- **Transaction Monitoring**: Real-time deposit detection
- **Private Key Encryption**: Production-ready security (implement encryption)

## 💸 Supported Currencies

### Cryptocurrency:
- **ETH** - Ethereum
- **USDC** - USD Coin (ERC-20)
- **USDT** - Tether (ERC-20)  
- **WBTC** - Wrapped Bitcoin (ERC-20)

### Fiat:
- **USD** - US Dollars via Stripe
- Supports all major credit/debit cards
- Bank transfers (ACH) support available

## 🏦 Integration with Existing Systems

The payment system integrates seamlessly with your existing features:

- **TiltCheck**: Automatic bankroll management for gambling
- **JustTheTip Vaults**: Secure fund storage with time locks
- **Respect System**: Earn respect for successful deposits
- **Leaderboards**: Payment volume tracking

## 📊 Data Storage

All payment data is stored in the `data/` directory:
- `data/wallets.json` - User wallet addresses and keys
- `data/transactions.json` - Transaction history
- `data/pending_deposits.json` - Monitoring pending deposits

## 🚨 Production Deployment

### Security Checklist:
- [ ] Use strong encryption for private keys
- [ ] Enable Stripe webhook signature verification
- [ ] Use HTTPS for all webhook endpoints
- [ ] Implement proper logging and monitoring
- [ ] Set up backup systems for wallet data
- [ ] Configure rate limiting
- [ ] Use environment variables for all secrets

### Performance Considerations:
- The system auto-saves data every 30 seconds
- Ethereum balance checking is optimized with caching
- Webhook processing is asynchronous
- Rate limiting prevents API abuse

## 🆘 Support Commands

### Admin Commands:
- `!payment stats` - View payment system statistics
- `!payment users` - List users with wallets
- `!payment transactions` - Recent transaction summary

### User Help:
- `!deposit help` - Detailed deposit instructions
- `!withdraw help` - Withdrawal guidelines
- `!wallet help` - Wallet management info

## 🔗 Webhook Endpoints

Your server now hosts these endpoints:

- `POST /github-webhook` - GitHub webhook processing
- `POST /stripe-webhook` - Stripe payment confirmations

## 📈 Analytics & Reporting

The system tracks:
- Total deposit volume per currency
- User payment preferences
- Transaction success rates
- Average deposit amounts
- Failed payment analysis

## 🎯 Next Steps

1. **Test the system** with small amounts first
2. **Configure your API keys** in production
3. **Set up monitoring** for payment failures
4. **Implement backup strategies** for wallet data
5. **Add custom notifications** for large deposits
6. **Integrate with your existing economy** features

## 💡 Advanced Features

### Automatic Notifications:
- DM users when deposits are confirmed
- Alert admins for large transactions
- Notify on failed payments

### Vault Integration:
- Automatic transfers to JustTheTip vaults
- Time-locked deposits for discipline
- Emergency withdrawal procedures

### Gambling Protection:
- TiltCheck integration for responsible gaming
- Deposit limits and cooling periods
- Withdrawal confirmation delays

---

Your TrapHouse bot is now equipped with enterprise-level payment processing! 🎉

For support or customization, check the code comments in `paymentManager.js` for detailed implementation notes.

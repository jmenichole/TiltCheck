# 🚀 TrapHouse Bot Configuration Guide

## 🔑 Required API Keys & Tokens

### 1. Discord Bot Token
**Status:** 🚨 **REQUIRED** - Bot won't start without this
```
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```
**How to get:**
1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to "Bot" section
4. Copy the token
5. ⚠️ **Keep this secret!**

### 2. Solana USDC Configuration
**Status:** 🟡 **OPTIONAL** - For Solana USDC deposits
```
SOLANA_USDC_DESTINATION_ADDRESS=your_solana_usdc_destination_address_here
```
**How to get:**
1. Create a Solana wallet (Phantom, Solflare, etc.)
2. Copy your wallet's public address
3. This is where USDC deposits will be sent

### 3. TiltCheck API Integration
**Status:** 🟡 **OPTIONAL** - For gambling accountability features
```
TILTCHECK_API_KEY=your_tiltcheck_api_key_here
```
**How to get:**
1. Register at TiltCheck platform
2. Generate API key in dashboard
3. Enables bankroll tracking and tilt protection

### 4. Stake API Integration
**Status:** 🟡 **OPTIONAL** - For JustTheTip vault integration
```
STAKE_API_KEY=your_stake_api_key_here
STAKE_SESSION_TOKEN=your_stake_session_token_here
```
**Note:** Stake operates with a closed API. Each token creation starts a new session.

### 5. Stripe Payment Processing
**Status:** 🟡 **OPTIONAL** - For fiat deposits
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 6. Ethereum/Crypto Configuration
**Status:** 🟡 **OPTIONAL** - For ETH/ERC-20 deposits
```
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

## 🛠️ Quick Setup Commands

### 1. Install Dependencies
```bash
npm install @solana/web3.js
```

### 2. Test Configuration
```bash
node test-payment-system.js
```

### 3. Start Bot
```bash
node index.js
```

## 🔧 Configuration Validation

### Check Discord Token
```bash
# Test if Discord token is valid
curl -H "Authorization: Bot YOUR_TOKEN" https://discord.com/api/v10/users/@me
```

### Check Solana Connection
```bash
# Test Solana RPC connection
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}' https://api.mainnet-beta.solana.com
```

## 🎯 Feature Matrix

| Feature | Required API Keys | Status |
|---------|-------------------|--------|
| Basic Bot | Discord Token | 🚨 Required |
| Crypto Deposits | ETH_RPC_URL | 🟡 Optional |
| Solana USDC | Solana Address | 🟡 Optional |
| Fiat Payments | Stripe Keys | 🟡 Optional |
| TiltCheck | TiltCheck API | 🟡 Optional |
| Stake Integration | Stake API | 🟡 Optional |

## 🚨 Priority Setup Order

1. **Discord Bot Token** - Get this first!
2. **Solana USDC Address** - For your primary deposits
3. **Ethereum RPC** - For ETH/USDC/USDT/WBTC
4. **Stripe** - For credit card deposits
5. **TiltCheck** - For gambling protection
6. **Stake API** - For vault features

## 📝 Example Working Configuration

```env
# Minimal working setup
DISCORD_BOT_TOKEN=OTxxxxxxxxxxxxxxxxxxxxxxxx.Gxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
SOLANA_USDC_DESTINATION_ADDRESS=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Optional enhancements
ETH_RPC_URL=https://mainnet.infura.io/v3/your_project_id
STRIPE_SECRET_KEY=sk_live_your_real_stripe_key
TILTCHECK_API_KEY=tilt_your_api_key
```

## 🔒 Security Best Practices

1. **Never commit .env to git**
2. **Use test keys in development**
3. **Rotate API keys regularly**
4. **Monitor API usage limits**
5. **Enable webhook signature verification**

## 🆘 Troubleshooting

### "TokenInvalid" Error
- Check Discord token is correct
- Ensure no extra spaces/characters
- Token should start with 'OT' or 'MT'

### Solana Connection Issues
- Verify RPC URL is accessible
- Check Solana network status
- Ensure address format is correct

### Stake API Limitations
- Remember: closed API with limited tokens
- Each token creation = new session
- Very limited use cases available

---

**Ready to configure? Start with your Discord bot token! 🚀**

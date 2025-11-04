# TiltCheck + JustTheTip Integration Guide

## 🎯 Overview

TiltCheck and JustTheTip are now fully integrated, providing a cohesive ecosystem for:
- **Authentication & Profiles** (TiltCheck)
- **Smart Tipping & Vaults** (JustTheTip)
- **NFT Verification** (Both)
- **Behavioral Analysis** (JustTheTip → TiltCheck profiles)
- **Unified Secrets Management** (Cross-repo)

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                   TiltCheck                          │
│  ┌────────────────────────────────────────────┐    │
│  │  Authentication & Profile System           │    │
│  │  - JWT Auth                                │    │
│  │  - Profile Management                      │    │
│  │  - AI Onboarding                          │    │
│  │  - NFT Verification                       │    │
│  └────────────────────────────────────────────┘    │
│                      ↕                              │
│  ┌────────────────────────────────────────────┐    │
│  │  JustTheTip Integration                    │    │
│  │  - Behavioral Analysis                     │    │
│  │  - Smart Vaults                           │    │
│  │  - Tipping System                         │    │
│  │  - Accountability Buddies                 │    │
│  └────────────────────────────────────────────┘    │
│                      ↕                              │
│  ┌────────────────────────────────────────────┐    │
│  │  Unified Secrets Manager                   │    │
│  │  - Coinbase Wallet Secrets                │    │
│  │  - TipCC API Keys                         │    │
│  │  - Solana Keys                            │    │
│  │  - Discord Tokens                         │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│              JustTheTip Repository                   │
│  - Shares secrets with TiltCheck                    │
│  - Provides behavioral data                         │
│  - Handles Discord bot commands                     │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Configure Shared Secrets

Create `.env` file in TiltCheck:

```bash
# Point to JustTheTip secrets
JUSTTHETIP_SECRETS_PATH=../justthetip/config/secrets.json

# Or set shared secrets directly
COINBASE_WALLET_SECRET=your_shared_secret
TIPCC_API_KEY=your_shared_key
SOLANA_WALLET_PRIVATE_KEY=your_shared_key

# Coinbase Payment (TiltCheck specific)
COINBASE_APP_ID=ca8b3b06-99e0-4611-affd-b39c2e7ca273
COINBASE_API_KEY=your_api_key
COINBASE_API_SECRET=your_api_secret

# Authentication
JWT_SECRET=your_jwt_secret
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
```

### 2. Start the Server

```bash
npm install
node api-server.js
```

Server will start with all integrations:
```
✅ Authentication API: Enabled
✅ Profile Management: Enabled
✅ AI Onboarding: Enabled
✅ Discord Integration: Ready
✅ Wallet Connection: Ready
✅ NFT Minting: Ready
✅ Coinbase Payment: Ready
✅ JustTheTip Integration: Ready
✅ Unified Secrets Manager: Ready
```

### 3. Test the Integration

```bash
# Check secrets health
curl http://localhost:3000/api/secrets/health

# Get Coinbase config (admin only)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/secrets/config/coinbase

# Access JustTheTip dashboard
open http://localhost:3000/justthetip
```

## 📋 Integration Points

### 1. Shared Authentication

Both systems use the same JWT authentication:

```javascript
// Login to TiltCheck
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Token works for both TiltCheck and JustTheTip endpoints
GET /api/profile (TiltCheck)
GET /api/justthetip/metrics (JustTheTip)
```

### 2. Profile + Behavioral Metrics

TiltCheck profiles include JustTheTip behavioral data:

```javascript
// Get complete profile
GET /api/profile
{
  "profile": {
    // Standard profile fields
    "email": "user@example.com",
    "displayName": "User",
    
    // JustTheTip integration
    "degenMetrics": {
      "level": 45,
      "personality": "Moderate Degen",
      "grassTouchingScore": 75
    }
  },
  "completeness": { ... }
}
```

### 3. NFT Verification Flow

Complete flow integrating payment and minting:

```
User Journey:
1. Register/Login (TiltCheck)
   ↓
2. Complete Onboarding (TiltCheck)
   ↓
3. Connect Wallet (TiltCheck)
   ↓
4. Pay $5 via Coinbase (TiltCheck + Coinbase)
   ↓
5. Mint Verification NFT (Integrated)
   ↓
6. Profile marked as verified (TiltCheck)
   ↓
7. Degen Trust Score unlocked (JustTheTip)
```

### 4. Wallet Sharing

Single wallet connection works for both:

```javascript
// Connect wallet in TiltCheck
POST /api/profile/connect/wallet
{
  "walletAddress": "8x9...abc",
  "walletType": "phantom"
}

// Now wallet is available for:
// - Coinbase payments (TiltCheck)
// - Tip receiving (JustTheTip)
// - NFT minting (Both)
// - Vault creation (JustTheTip)
```

### 5. Tipping Integration

Tips are tracked with TiltCheck profile context:

```javascript
// Send tip through JustTheTip
POST /api/justthetip/tip
{
  "recipientId": "user123",
  "amount": 0.5,
  "currency": "SOL"
}

// Response includes tilt detection
{
  "tip": { ... },
  "behavioralAnalysis": {
    "degenLevel": 67,
    "tiltDetected": true,
    "vaultSuggestion": {
      "type": "Regret Vault",
      "recommendedAmount": 1.0
    }
  }
}
```

## 🔐 Secrets Management

### Priority Order

The SecretsManager checks sources in this order:

1. **Environment Variables** (highest priority)
2. **Local Secrets File** (`config/secrets.json`)
3. **JustTheTip Secrets** (via `JUSTTHETIP_SECRETS_PATH`)
4. **Default Values** (fallback)

### Example: Coinbase Wallet Secret

```javascript
// SecretsManager automatically tries:
1. process.env.COINBASE_WALLET_SECRET
2. config/secrets.json → coinbase.walletSecret
3. ../justthetip/config/secrets.json → coinbase.walletSecret
4. null (no default for sensitive values)

// Usage in code:
const secretsManager = require('./config/secrets-manager');
const coinbase = secretsManager.getCoinbaseConfig();
// Returns: { appId, apiKey, apiSecret, walletSecret }
```

### Shared Secrets

These secrets are automatically shared between repos:

| Secret | Usage | Shared From |
|--------|-------|-------------|
| `COINBASE_WALLET_SECRET` | Wallet operations | JustTheTip |
| `TIPCC_API_KEY` | Tipping system | JustTheTip |
| `SOLANA_WALLET_PRIVATE_KEY` | Blockchain txns | JustTheTip |
| `DISCORD_BOT_TOKEN` | Bot commands | Either |

### API Management

Admin users can manage secrets via API:

```bash
# Get secrets summary
GET /api/secrets/summary

# Check health
GET /api/secrets/health

# Sync from JustTheTip
POST /api/secrets/sync

# Get service config
GET /api/secrets/config/coinbase
GET /api/secrets/config/solana
GET /api/secrets/config/tipcc
```

## 🎮 User Flows

### Flow 1: New User Complete Setup

```
1. Visit /register
2. Create account (email + password)
3. Redirected to /onboarding
4. Complete 8-step AI-guided wizard:
   - Welcome
   - Basic info (name, avatar)
   - Interests & experience level
   - App permissions
   - Connect Discord
   - Connect Phantom wallet
   - Pay $5 for NFT (via Coinbase)
   - Completion celebration
5. Redirected to /justthetip dashboard
6. Can now:
   - Send/receive tips
   - Create vaults
   - Pair with buddy
   - View degen metrics
```

### Flow 2: NFT Minting with Payment

```
1. User has wallet connected
2. Clicks "Mint Verification NFT"
3. Redirected to /nft-payment
4. Sees $5 USD price + benefits
5. Clicks "Pay with Coinbase"
6. Backend creates onramp session:
   POST /api/payment/create-onramp-session
7. User redirected to Coinbase Pay
8. User completes $5 payment (card/bank/crypto)
9. SOL sent to user's wallet
10. User returns to TiltCheck
11. Payment verified:
    POST /api/payment/verify/:sessionId
12. NFT minted and recorded
13. Profile updated with verification
14. User redirected to profile
```

### Flow 3: Behavioral Analysis

```
1. User sends tip via JustTheTip
   POST /api/justthetip/tip
2. System tracks:
   - Time of day (late night activity)
   - Frequency (impulse counter)
   - Amount patterns
3. Calculates degen level (0-100)
4. Assigns personality type
5. Suggests appropriate vault
6. If buddy paired, notifies buddy if tilt detected
7. Updates TiltCheck profile metrics
8. User sees suggestions on dashboard
```

## 📊 Data Flow

### Profile Completeness

TiltCheck tracks completeness including JustTheTip activity:

```javascript
{
  "percentage": 80,
  "checks": {
    "basicInfo": true,      // TiltCheck
    "avatar": true,          // TiltCheck
    "walletLinked": true,    // TiltCheck
    "nftMinted": true,       // TiltCheck + Payment
    "hasBuddy": true,        // JustTheTip
    "hasVault": true,        // JustTheTip
    "tipsSent": true         // JustTheTip
  }
}
```

### Degen Metrics Calculation

JustTheTip calculates behavior score:

```javascript
degenLevel = 
  min(impulseTransactions * 5, 30) +
  min(lateNightActivity * 3, 25) +
  min(rugPullCount * 10, 25) +
  max(0, 20 - grassTouchingScore)
  
// Capped at 100

// Personality mapping:
0-29:   Zen Degen 🧘‍♂️✨
30-49:  Casual Degen 🎮😌
50-69:  Moderate Degen 🎲😎
70-89:  High Energy Degen 🚀😤
90-100: Maximum Overdegen 🔥💀
```

## 🛠️ Development

### Adding New Shared Secrets

1. Add to JustTheTip secrets file:
```json
{
  "newService.apiKey": "your_key"
}
```

2. TiltCheck automatically picks it up:
```javascript
const key = secretsManager.get('justthetip.newService.apiKey');
```

3. Or add to both `.env` files:
```bash
# TiltCheck .env
NEW_SERVICE_API_KEY=your_key

# JustTheTip .env
NEW_SERVICE_API_KEY=your_key
```

### Testing Integration

```bash
# Test secrets loading
node -e "const sm = require('./config/secrets-manager'); console.log(sm.getSummary())"

# Test API health
curl http://localhost:3000/api/secrets/health

# Test JustTheTip endpoints
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/justthetip/dashboard
```

## 📚 API Reference

### TiltCheck APIs

- `/api/auth/*` - Authentication
- `/api/profile/*` - Profile management
- `/api/onboarding/*` - AI onboarding
- `/api/payment/*` - Coinbase payments
- `/api/secrets/*` - Secrets management (admin)

### JustTheTip APIs

- `/api/justthetip/metrics` - Degen metrics
- `/api/justthetip/tip` - Send tips
- `/api/justthetip/vault` - Create vaults
- `/api/justthetip/buddy/*` - Buddy system
- `/api/justthetip/dashboard` - Complete dashboard

### Frontend Pages

- `/login` - Login page
- `/register` - Registration
- `/onboarding` - AI-guided setup
- `/profile-setup` - Quick profile completion
- `/justthetip` - JustTheTip dashboard
- `/nft-payment` - Coinbase payment for NFT

## 🔒 Security

### Secrets Encryption

Local secrets file is encrypted with AES-256-CBC:

```javascript
// Encrypt secrets before saving
const encrypted = secretsManager.encrypt(JSON.stringify(secrets));
fs.writeJSONSync('secrets.json', {
  encrypted: true,
  data: encrypted
});

// Decrypt on load
const decrypted = secretsManager.decrypt(encryptedData);
const secrets = JSON.parse(decrypted);
```

### Access Control

- Public endpoints: health checks, login, register
- User endpoints: profile, tips, vaults (require JWT)
- Admin endpoints: secrets management (require admin role)

### Token Security

```javascript
// JWT tokens include:
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "role": "user|admin",
  "exp": 1234567890
}

// 7-day expiration
// Refresh endpoint available
```

## 🚨 Troubleshooting

### Secrets Not Loading

```bash
# Check secrets health
curl http://localhost:3000/api/secrets/health

# Check JustTheTip path
echo $JUSTTHETIP_SECRETS_PATH

# Verify file exists
ls -la ../justthetip/config/secrets.json

# Check server logs
# Look for: "🔗 Loaded JustTheTip secrets"
```

### Coinbase Payment Issues

```bash
# Verify App ID
echo $COINBASE_APP_ID
# Should be: ca8b3b06-99e0-4611-affd-b39c2e7ca273

# Check payment endpoint
curl -X POST http://localhost:3000/api/payment/create-onramp-session \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"YOUR_WALLET"}'
```

### JustTheTip Integration Issues

```bash
# Check if JustTheTip APIs are enabled
curl http://localhost:3000/health
# Should show: "justTheTip": true

# Test metrics endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/justthetip/metrics
```

## 📈 Production Deployment

### Environment Setup

```bash
# Production .env
NODE_ENV=production
PORT=443
CORS_ORIGIN=https://yourdomain.com

# Use actual secrets
COINBASE_WALLET_SECRET=prod_secret
JWT_SECRET=prod_jwt_secret_32_bytes
SECRETS_ENCRYPTION_KEY=prod_encryption_key

# Point to production JustTheTip
JUSTTHETIP_SECRETS_PATH=/var/secrets/justthetip.json
```

### Security Checklist

- [ ] Use strong JWT_SECRET (32+ bytes)
- [ ] Enable HTTPS/SSL
- [ ] Set proper CORS_ORIGIN
- [ ] Encrypt secrets file
- [ ] Use environment variables for sensitive values
- [ ] Restrict admin endpoints
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Regular secret rotation

## 🎉 Success!

You now have a fully integrated TiltCheck + JustTheTip ecosystem with:

✅ Unified authentication
✅ Shared wallet connections  
✅ Behavioral analysis integration
✅ Cross-repository secrets sharing
✅ Coinbase payment for NFTs
✅ Smart vaults and tipping
✅ Accountability buddy system

**Everything works together seamlessly!** 🚀

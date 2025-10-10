# 🔑 Premium API Configuration Guide

## 🚀 Current Status: FREE TIER CONFIGURED

Your bot is currently running on reliable free-tier APIs. Here's how to upgrade to premium for production use:

---

## 🌐 BLOCKCHAIN RPC UPGRADES

### **1. Alchemy (Recommended - Best Performance)**

**Sign up:** https://dashboard.alchemy.com/

**Free Tier:** 300M requests/month, fast response times

**Steps:**
1. Create account at dashboard.alchemy.com
2. Create apps for each network you need
3. Copy the HTTPS endpoints
4. Update your .env file:

```bash
# Replace these in your .env:
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Keep backups:
ETHEREUM_RPC_URL_BACKUP=https://rpc.ankr.com/eth
POLYGON_RPC_URL_BACKUP=https://rpc.ankr.com/polygon
ARBITRUM_RPC_URL_BACKUP=https://rpc.ankr.com/arbitrum
```

**Cost:** Free up to 300M requests, then $199/month for growth plan

### **2. QuickNode (Enterprise Grade)**

**Sign up:** https://quicknode.com/

**Features:** Custom endpoints, analytics, 99.9% uptime SLA

**Steps:**
1. Create account and choose networks
2. Get custom endpoint URLs
3. Update .env with your custom URLs

**Cost:** $9/month starter, $49/month for production

### **3. Infura (Popular Choice)**

**Sign up:** https://infura.io/

**Free Tier:** 100K requests/day per network

```bash
# Update .env:
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
```

**Cost:** Free tier, then $50/month for growth

---

## 🔍 COMPLIANCE & SECURITY APIS

### **1. Chainalysis (AML/KYC Compliance)**

**Sign up:** https://www.chainalysis.com/

**Features:** 
- Real-time transaction screening
- Sanctions list checking
- Risk scoring
- Compliance reporting

**Configuration:**
```bash
# Update in .env:
CHAINALYSIS_API_KEY=your_actual_chainalysis_api_key
CHAINALYSIS_BASE_URL=https://api.chainalysis.com
```

**Cost:** Contact for enterprise pricing (typically $1000+/month)

### **2. Elliptic (Alternative AML Provider)**

**Sign up:** https://www.elliptic.co/

**Features:**
- Blockchain analytics
- Compliance tools
- Risk assessment

**Configuration:**
```bash
# Update in .env:
ELLIPTIC_API_KEY=your_actual_elliptic_api_key
ELLIPTIC_BASE_URL=https://api.elliptic.co
```

**Cost:** Contact for pricing

### **3. TRM Labs (Comprehensive Compliance)**

**Sign up:** https://www.trmlabs.com/

**Features:**
- Transaction monitoring
- Entity identification
- Compliance automation

---

## 🎰 CASINO API INTEGRATIONS

### **1. Stake.us API (For TiltCheck)**

**Get API Key:** Contact Stake.us support or developer relations

**Configuration:**
```bash
# Update in .env:
STAKE_US_API_KEY=your_actual_stake_api_key
STAKE_US_BASE_URL=https://stake.us/api
```

### **2. TrustDice API**

**Get API Key:** https://trustdice.win/developers

**Configuration:**
```bash
# Update in .env:
TRUSTDICE_API_KEY=your_actual_trustdice_api_key
```

### **3. Rollbit API**

**Get API Key:** https://rollbit.com/api-docs

**Configuration:**
```bash
# Update in .env:
ROLLBIT_API_KEY=your_actual_rollbit_api_key
```

---

## 💳 PAYMENT PROCESSING UPGRADES

### **1. Stripe (Fiat Payments)**

**Sign up:** https://stripe.com/

**Steps:**
1. Create Stripe account
2. Get API keys from dashboard
3. Set up webhooks

**Configuration:**
```bash
# Update in .env:
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Cost:** 2.9% + 30¢ per transaction

---

## 🔐 SECURITY ENHANCEMENTS

### **1. Generate Secure Encryption Keys**

```bash
# Generate new 32-character encryption key:
openssl rand -hex 32

# Update in .env:
WALLET_ENCRYPTION_KEY=your_new_32_character_key_here
ENCRYPTION_KEY=your_new_32_character_key_here
```

### **2. JWT Secret**

```bash
# Generate secure JWT secret:
openssl rand -base64 64

# Update in .env:
JWT_SECRET=your_new_jwt_secret_here
```

---

## 📊 MONITORING & ANALYTICS

### **1. DataDog (System Monitoring)**

**Features:**
- Bot performance monitoring
- API response time tracking
- Error rate monitoring

### **2. New Relic (Application Performance)**

**Features:**
- Real-time performance metrics
- Error tracking
- User experience monitoring

---

## 🎯 PRIORITY UPGRADE ORDER

### **High Priority (Immediate):**
1. **Alchemy API** - Better RPC performance
2. **Secure Encryption Keys** - Security enhancement
3. **Stripe Live Keys** - Production payments

### **Medium Priority (Next 30 days):**
1. **Chainalysis API** - Compliance requirements
2. **Casino APIs** - Enhanced TiltCheck features
3. **Monitoring Tools** - System reliability

### **Low Priority (Future):**
1. **Additional RPC providers** - Redundancy
2. **Advanced analytics** - Business intelligence

---

## 🔧 CONFIGURATION SCRIPT

Here's a script to help you configure premium APIs:

```bash
#!/bin/bash

echo "🔑 Premium API Configuration Helper"
echo "=================================="

echo ""
echo "Current API Status:"
echo "🔗 Ethereum RPC: $(grep 'ETHEREUM_RPC_URL=' .env | cut -d'=' -f2)"
echo "🔑 Chainalysis: $(grep 'CHAINALYSIS_API_KEY=' .env | cut -d'=' -f2)"
echo "💳 Stripe: $(grep 'STRIPE_SECRET_KEY=' .env | cut -d'=' -f2)"

echo ""
echo "To upgrade APIs:"
echo "1. Sign up for premium services"
echo "2. Get your API keys"
echo "3. Update .env file with new keys"
echo "4. Restart bot: pkill -f 'node main.js' && node main.js &"

echo ""
echo "Test API connectivity after updates!"
```

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **Never commit real API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate API keys regularly**
4. **Monitor API usage for unauthorized access**
5. **Set up rate limiting and usage alerts**

---

## 📞 SUPPORT CONTACTS

- **Alchemy:** support@alchemy.com
- **Chainalysis:** support@chainalysis.com
- **Stripe:** support@stripe.com
- **QuickNode:** support@quicknode.com

---

**🎯 Start with Alchemy for immediate RPC performance improvement!**

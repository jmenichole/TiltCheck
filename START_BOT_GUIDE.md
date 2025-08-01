# 🚀 TrapHouse Discord Bot - Complete Startup Guide

## 🔧 **Prerequisites**

### Required Software
```bash
# Install Node.js (v16 or higher)
node --version  # Check if installed

# Install npm dependencies
npm install
```

### Required Environment Variables
Create `.env` file in root directory:

```bash
# === DISCORD BOT CONFIGURATION ===
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=1354450590813655142
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# === SERVER PORTS ===
PORT=3000
GITHUB_WEBHOOK_PORT=3001
COLLECTCLOCK_PORT=3002
BETA_PORT=3333

# === KO-FI INTEGRATION ===
KOFI_VERIFICATION_TOKEN=02740ccf-8e39-4dce-b095-995f8d94bdbb

# === GITHUB INTEGRATION ===
GITHUB_APP_ID=your_github_app_id_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# === COLLECTCLOCK INTEGRATION ===
COLLECTCLOCK_API_URL=https://jmenichole.github.io/CollectClock/
COLLECTCLOCK_DISCORD_BOT_TOKEN=your_collectclock_bot_token_here
COLLECTCLOCK_CLIENT_ID=1336968746450812928
COLLECTCLOCK_WEBHOOK_SECRET=your_collectclock_webhook_secret

# === STRIPE PAYMENT PROCESSING ===
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# === BLOCKCHAIN RPC ENDPOINTS ===
ETH_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
ARB_RPC_URL=https://arbitrum-mainnet.infura.io/v3/your_project_id
OP_RPC_URL=https://optimism-mainnet.infura.io/v3/your_project_id

# === PRODUCTION DOMAIN URLS ===
GITHUB_WEBHOOK_URL=https://api.justthetip.bot/github/webhook
GITHUB_CALLBACK_URL=https://api.justthetip.bot/github/callback
BASE_URL=https://api.justthetip.bot
```

---

## 🎯 **Step 2: Start Individual Services**

### **Method A: Start All Services (Recommended)**

```bash
# Terminal 1: Main Discord Bot
node bot.js

# Terminal 2: Beta Testing Server (Port 3333)
node beta-testing-server.js

# Terminal 3: GitHub Webhook Server (Port 3001)
node github-webhook-server.js

# Terminal 4: CollectClock OAuth Handler (Port 3002)
node collectClockOAuthHandler.js

# Terminal 5: Degens Card Game Bot
node degens_bot.js
```

### **Method B: Single Terminal with PM2 (Production)**

```bash
# Install PM2 globally
npm install -g pm2

# Start ecosystem
pm2 start ecosystem.config.js

# Monitor services
pm2 status
pm2 logs
```

---

## 📊 **Step 3: Verify Services are Running**

### **Health Check URLs**
```bash
# Check each service:
curl http://localhost:3000/health     # Main bot
curl http://localhost:3333/health     # Beta server
curl http://localhost:3001/health     # GitHub server
curl http://localhost:3002/auth/collectclock/health  # CollectClock
```

### **Expected Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-31T00:00:00.000Z",
  "bot": "connected",
  "features": ["crypto", "tiltcheck", "nft_trust"]
}
```

---

## 🎮 **Step 4: Access Dashboards**

### **Beta Testing Dashboard**
```
http://localhost:3333/beta
```

### **AIM Overlay Interface**
```
http://localhost:3333/aim-overlay
```

### **Analytics Dashboard**
```
http://localhost:3333/analytics
```

### **Development Tools**
```
http://localhost:3333/dev-tools
```

---

## 🤖 **Step 5: Install Discord Bot**

### **Main Bot (Full Features)**
```
https://discord.com/api/oauth2/authorize?client_id=1354450590813655142&permissions=274881367104&scope=bot%20applications.commands
```

### **Beta Testing Bot**
```
https://discord.com/api/oauth2/authorize?client_id=1373784722718720090&permissions=274881367104&scope=bot%20applications.commands
```

### **Degens Card Game Bot**
```
https://discord.com/api/oauth2/authorize?client_id=1376113587025739807&permissions=274881367104&scope=bot%20applications.commands
```

---

## 🔧 **Step 6: Configure Discord Developer Portal**

1. **Go to**: [Discord Developer Portal](https://discord.com/developers/applications)
2. **Select your application**: TrapHouse Discord Bot
3. **Add OAuth2 Redirect URIs**:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3002/auth/collectclock/callback`
   - `https://api.justthetip.bot/auth/callback` (Production)

---

## 💳 **Step 7: Configure Payment Webhooks**

### **Ko-fi Dashboard**
- Webhook URL: `https://yourdomain.com/webhook/kofi`
- Verification Token: `02740ccf-8e39-4dce-b095-995f8d94bdbb`

### **Stripe Dashboard**
- Webhook URL: `https://yourdomain.com/webhooks/stripe`
- Events: `payment_intent.succeeded`, `invoice.payment_succeeded`

---

## 🧪 **Step 8: Test Bot Functionality**

### **Discord Commands to Test**
```
!help                    # View all commands
!crypto balance         # Check crypto wallet
!tiltcheck start        # Start gambling session
!cards start            # Begin card game
/beta-trust init        # Initialize NFT trust score
!collectclock status    # Check time tracking
```

### **Webhook Testing**
```bash
# Test Ko-fi webhook
curl -X POST http://localhost:3000/webhook/kofi \
  -H "Content-Type: application/json" \
  -d '{"verification_token":"02740ccf-8e39-4dce-b095-995f8d94bdbb","type":"Donation"}'

# Test GitHub webhook  
curl -X POST http://localhost:3001/github/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"opened","repository":{"name":"test"}}'
```

---

## 🔍 **Step 9: Monitor Logs**

### **Real-time Monitoring**
```bash
# Watch main bot logs
tail -f logs/bot.log

# Monitor beta server
tail -f logs/beta-server.log

# Check error logs
tail -f logs/error.log
```

### **Service Status Commands**
```bash
# Check Discord connection
node -e "console.log('Bot Status:', process.env.DISCORD_BOT_TOKEN ? 'Configured' : 'Missing Token')"

# Verify database connection
node check_status.js

# Test crypto wallet connections
node crypto_test_summary.js
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Bot Not Responding**
```bash
# Check token validity
node -e "
const { Client } = require('discord.js');
const client = new Client({ intents: ['Guilds', 'GuildMessages'] });
client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('✅ Token Valid'))
  .catch(err => console.log('❌ Token Invalid:', err.message));
"
```

#### **Port Already in Use**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9  # Replace 3000 with your port
```

#### **Missing Dependencies**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 **Quick Start Command**

**One-line startup for development:**
```bash
npm install && node bot.js & node beta-testing-server.js & node github-webhook-server.js & node collectClockOAuthHandler.js
```

---

## ✅ **Success Indicators**

You'll know everything is working when you see:

1. **Console Messages**:
   ```
   🎮 TrapHouse Discord Bot is online!
   🧪 Beta Testing Server running on port 3333
   🐙 GitHub Webhook Server running on port 3001
   ⏰ CollectClock OAuth Handler running on port 3002
   ```

2. **Discord Bot Online**: Green status in Discord
3. **Health Checks Pass**: All `/health` endpoints return 200
4. **Dashboard Accessible**: Can view beta dashboard at localhost:3333/beta

---

## 📞 **Support & Resources**

- **GitHub Repository**: https://github.com/jmenichole/trap-house-discord-bot
- **Discord Developer Portal**: https://discord.com/developers/applications
- **CollectClock Integration**: https://jmenichole.github.io/CollectClock/
- **Documentation**: Check `/docs` folder for detailed guides

**Your TrapHouse Discord Bot ecosystem is now ready to dominate Discord servers! 🚀**

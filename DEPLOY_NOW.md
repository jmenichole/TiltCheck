# 🎯 DEPLOY YOUR TRAPHOUSE ECOSYSTEM IN 5 MINUTES

## ⚡ FASTEST OPTION: Railway Web Interface

Since the CLI is having authentication issues, let's use the web interface which is actually easier:

### 🚀 Step 1: Deploy to Railway
1. **Go to**: [railway.app](https://railway.app)
2. **Click**: "Login with GitHub"
3. **Click**: "Deploy from GitHub repo" 
4. **Select**: `jmenichole/trap-house-discord-bot` repository
5. **Click**: "Deploy Now"

### 🔑 Step 2: Set Environment Variables
After deployment starts, you need to add your Discord bot tokens:

**In Railway Dashboard:**
1. Click on your deployed service
2. Go to "Variables" tab
3. Add these variables:

```bash
# REQUIRED: Your Discord Bot Tokens
DISCORD_TOKEN=your_traphouse_bot_token_here
COLLECTCLOCK_TOKEN=your_collectclock_bot_token_here  
DEGENS_TOKEN=your_degens_bot_token_here
JUSTTHETIP_TOKEN=your_justthetip_bot_token_here

# SYSTEM SETTINGS
NODE_ENV=production
PORT=3000
```

### 📱 Step 3: Get Your Discord Bot Tokens

For each bot application, you need to get the token:

1. **Go to**: [Discord Developer Portal](https://discord.com/developers/applications)
2. **Select Application**: TrapHouse Bot (ID: 1354450590813655142)
3. **Go to**: "Bot" section in left sidebar
4. **Click**: "Reset Token" 
5. **Copy**: The new token
6. **Repeat** for each bot:
   - CollectClock Bot (ID: 1336968746450812928)
   - Degens Bot (ID: 1376113587025739807)  
   - JustTheTip Bot (ID: 1373784722718720090)

### 🌐 Step 4: Your Bot URLs
After deployment, Railway will give you URLs like:
- **Main Bot**: `https://trap-house-discord-bot-production.up.railway.app`
- **GitHub Webhook**: `https://trap-house-discord-bot-production.up.railway.app/github/webhook`

### ✅ Step 5: Test Your Ecosystem
In Discord, try these commands:
```bash
!cc start                    # CollectClock daily bonus tracking
!tiltcheck start "Stake US" 100    # TiltCheck gambling accountability  
!vault                       # JustTheTip crypto recommendations
!ecosystem                   # Full system status
```

---

## 🎮 Alternative: Use Render (Also Free!)

If Railway doesn't work:

1. **Go to**: [render.com](https://render.com)
2. **Sign up** with GitHub
3. **Create**: "New Web Service"
4. **Connect**: Your GitHub repository
5. **Configure**:
   - Build Command: `npm install`
   - Start Command: `node index.js`
6. **Add**: Same environment variables as above
7. **Deploy**!

---

## 🔥 Quick Local Test (Optional)

Want to test locally first?

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.deployment .env

# Edit .env with your real tokens
nano .env

# Run the ecosystem
npm start
```

---

## 📞 Need Help?

If you run into issues:

1. **Check Railway logs** in the dashboard
2. **Verify all tokens** are correct
3. **Make sure bots have proper permissions**
4. **Test each bot individually** before running the full ecosystem

**Your "Made for Degens by Degens" accountability ecosystem is ready for deployment!** 🤝

**Next Step**: Go to [railway.app](https://railway.app) and click "Deploy from GitHub repo" to get started! 🚀

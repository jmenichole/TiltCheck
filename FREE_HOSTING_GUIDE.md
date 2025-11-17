# Free Hosting Options for TrapHouse Discord Bot

## 🚀 **Deploy Your TrapHouse Ecosystem for Free**

Since you don't have a domain yet, here are the best free hosting options to get your Discord bot ecosystem live and running webhooks:

### 🆓 **Option 1: Heroku (Recommended for Beginners)**

#### Why Heroku:
- ✅ **Free tier available** (550 hours/month)
- ✅ **Easy deployment** from GitHub
- ✅ **Built-in HTTPS** (SSL certificates included)
- ✅ **Environment variables** management
- ✅ **Automatic restarts** and health monitoring

#### Heroku Setup:
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-traphouse-bot

# Set environment variables
heroku config:set DISCORD_TOKEN=your_bot_token
heroku config:set GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Deploy from GitHub
git add .
git commit -m "Deploy TrapHouse ecosystem"
git push heroku main
```

#### Your Webhook URL:
```
https://your-traphouse-bot.herokuapp.com/github/webhook
```

### 🔧 **Option 2: Railway (Modern Alternative)**

#### Why Railway:
- ✅ **$5/month free credit** (covers most usage)
- ✅ **GitHub integration** built-in
- ✅ **Automatic deployments** on code changes
- ✅ **Custom domains** available on free plan

#### Railway Setup:
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Select your `TiltCheck` repository
4. Add environment variables in dashboard
5. Deploy automatically

#### Your Webhook URL:
```
https://your-app-name.up.railway.app/github/webhook
```

### ⚡ **Option 3: Vercel (Frontend + Serverless)**

#### Why Vercel:
- ✅ **Completely free** for personal projects
- ✅ **Serverless functions** for webhook handling
- ✅ **Automatic HTTPS** and global CDN
- ✅ **GitHub integration** with auto-deploy

#### Vercel Setup:
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Follow prompts to link GitHub repo
```

#### Your Webhook URL:
```
https://your-traphouse-bot.vercel.app/api/github/webhook
```

### 🌐 **Option 4: Render (Simple & Reliable)**

#### Why Render:
- ✅ **Free tier** with automatic SSL
- ✅ **GitHub auto-deploy** on commits
- ✅ **Environment variables** built-in
- ✅ **No sleep mode** (unlike Heroku free tier)

#### Your Webhook URL:
```
https://your-traphouse-bot.onrender.com/github/webhook
```

### 🔄 **Option 5: Local Development with Ngrok**

#### For Testing & Development:
```bash
# Install ngrok
npm install -g ngrok

# Start your bot locally
npm start

# In another terminal, expose port 3001
ngrok http 3001

# Use the HTTPS URL for webhook
# Example: https://abc123.ngrok.io/github/webhook
```

## 📋 **Quick Setup Guide**

### 1. **Choose Your Platform** (Recommended: Heroku for beginners)

### 2. **Update Your Environment Variables**
```env
# Add to your hosting platform
DISCORD_TOKEN=your_discord_bot_token
GITHUB_WEBHOOK_SECRET=generate_with_openssl_rand_hex_20
WEBHOOK_BASE_URL=https://your-chosen-hosting-url.com
```

### 3. **Configure GitHub Webhook**
```
Payload URL: https://your-chosen-hosting-url.com/github/webhook
Content Type: application/json
Secret: [Your generated secret from step 2]
SSL Verification: ✅ Enabled
```

### 4. **Select Events**
✅ `push` - Code commits  
✅ `pull_request` - Code reviews  
✅ `issues` - Issue tracking  
✅ `star` - Repository appreciation  
✅ `fork` - Community growth  

## 🎯 **Recommended Free Setup**

### **For Learning/Testing:**
**Ngrok** (local) → **Heroku** (staging) → **Custom Domain** (production)

### **For Production:**
1. **Start with Heroku** (free, reliable, easy)
2. **Upgrade to Railway** when you need more features
3. **Move to custom domain** when ready to brand

## 💰 **Cost Breakdown**

### Free Forever:
- **Vercel**: Unlimited for personal projects
- **Netlify**: 100GB bandwidth/month
- **GitHub Pages**: Static hosting only

### Free with Limits:
- **Heroku**: 550 hours/month (enough for 1 bot)
- **Railway**: $5 credit/month
- **Render**: 750 hours/month

### When to Upgrade:
- **High traffic**: Move to paid tier
- **Custom domain**: Purchase domain (~$10-15/year)
- **Professional features**: Upgrade hosting plan

## 🔧 **Environment Configuration for Each Platform**

### Heroku Environment Variables:
```bash
heroku config:set DISCORD_TOKEN=your_token
heroku config:set GITHUB_WEBHOOK_SECRET=your_secret
heroku config:set NODE_ENV=production
```

### Railway Environment Variables:
```
DISCORD_TOKEN=your_token
GITHUB_WEBHOOK_SECRET=your_secret
NODE_ENV=production
```

### Vercel Environment Variables:
Add in Vercel dashboard under Settings → Environment Variables

## 🎉 **Quick Start Commands**

### Option 1: Deploy to Heroku Now
```bash
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck
heroku create your-traphouse-bot
heroku config:set DISCORD_TOKEN=your_token
git push heroku main
```

### Option 2: Deploy to Railway Now
1. Visit [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy automatically

## 🌟 **Future Domain Options**

When you're ready to buy a domain:
- **tiltcheck.io** - Perfect for the brand ($12-15/year)
- **traphouse.bot** - Community focused ($10-20/year)  
- **degenshelp.com** - Mission focused ($10-15/year)
- **accountabilitybot.io** - Descriptive ($15-25/year)

### Domain Registrars:
- **Namecheap**: Affordable, good support
- **Google Domains**: Simple, reliable
- **Cloudflare**: Cheap, great performance
- **Porkbun**: Very affordable, quirky

## 🎯 **Recommended Path**

1. **Start**: Deploy to **Heroku** (free, easy)
2. **Test**: Use ngrok for local webhook testing
3. **Scale**: Move to **Railway** when you need more features
4. **Brand**: Buy domain and point to your hosting
5. **Grow**: Upgrade hosting tier as community grows

**Your TrapHouse ecosystem can be live and accepting webhooks in under 30 minutes with any of these free options!** 🚀

---

*Choose the platform that feels most comfortable to you - they all support the full TrapHouse ecosystem with webhooks, environment variables, and automatic HTTPS!*

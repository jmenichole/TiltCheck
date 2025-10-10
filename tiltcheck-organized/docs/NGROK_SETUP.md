# Ngrok Setup Guide for Mischief Manager Ecosystem

## 🎰 **Quick Start with Ngrok - Test Your Accountability Ecosystem Locally**

Ngrok creates a secure tunnel to your localhost, allowing GitHub webhooks to reach your locally running Mischief Manager Discord bot ecosystem. Perfect for testing the complete "Made for Degens by Degens" accountability system!

### 📥 **Installation**

#### Option 1: NPM (Recommended)
```bash
npm install -g ngrok
```

#### Option 2: Direct Download
1. Go to [ngrok.com](https://ngrok.com/)
2. Sign up for free account
3. Download for your OS (macOS/Windows/Linux)
4. Extract and add to PATH

#### Option 3: Package Managers
```bash
# macOS with Homebrew
brew install ngrok/ngrok/ngrok

# Windows with Chocolatey
choco install ngrok

# Linux with Snap
sudo snap install ngrok
```

### 🔑 **Authentication Setup**

1. **Get your auth token** from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. **Configure ngrok**:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### 🎯 **Mischief Manager Ecosystem Setup with Ngrok**

#### Step 1: Start Your Mischief Manager Ecosystem Locally
```bash
cd /Users/fullsail/Desktop/traphouse_discordbot
npm install
npm start
```
Your ecosystem should be running on `http://localhost:3001`

**Active Components:**
- 🎰 **TiltCheck Mischief Manager** - Real-time gambling accountability
- 🕐 **CollectClock Integration** - Daily bonus tracking (15 platforms)
- 💰 **JustTheTip** - Crypto vault recommendations 
- 🤝 **TrapHouse Core** - Community respect system

#### Step 2: Open Ngrok Tunnel
```bash
# In a new terminal window
ngrok http 3001
```

You'll see output like:
```
ngrok by @inconshreveable

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     rt15
                              0       0       0.00    0.00    0.00
```

#### Step 3: Copy Your Mischief Manager Webhook URL
Your webhook URL is: `https://abc123def456.ngrok.io/github/webhook`

**This enables development accountability integration with:**
- Real-time coding discipline tracking
- Gambling session correlation analysis  
- Cross-platform respect point calculations
- Mischief Manager intervention triggers

### 🔧 **GitHub Webhook Configuration**

#### In your GitHub repository settings:

1. **Go to Settings → Webhooks → Add webhook**

2. **Configure webhook**:
```
Payload URL: https://your-unique-id.ngrok.io/github/webhook
Content type: application/json
Secret: your_webhook_secret_here
SSL verification: Enable SSL verification
```

3. **Select events**:
- ✅ `push` - Code commits
- ✅ `pull_request` - Code reviews  
- ✅ `issues` - Issue tracking
- ✅ `star` - Repository stars
- ✅ `fork` - Repository forks

4. **Activate webhook**: ✅ Active

### 🎮 **Testing Your Setup**

#### Test 1: Webhook Ping
GitHub automatically sends a ping when you create the webhook. Check your terminal for:
```
✅ Received GitHub webhook: ping
📡 Webhook validated successfully
```

#### Test 2: Push Event
Make a test commit:
```bash
git add .
git commit -m "Test webhook integration"
git push origin main
```

You should see in your terminal:
```
✅ Received GitHub webhook: push
📊 Processing commit data...
🤖 Sending Discord notification...
```

#### Test 3: Mischief Manager Integration
Check your Discord server for a message like:
```
🎰 **Mischief Manager Alert** - Development Accountability Active
👨‍💻 **Developer**: @your-username
📦 **Repository**: Mischief Manager Ecosystem
💻 **Action**: Pushed 1 commit during gambling session
🔗 **Link**: [View Changes](github-link)

**Accountability Update**:
• Development Discipline: 🔥 Active coding while gambling
• Mischief Manager Status: ⚠️ Monitoring correlation  
• Respect Points: +15 💯 (Bonus for productive multitasking)
• TiltCheck Grade: B+ (Maintained focus)
```

### 🛠️ **Environment Configuration**

#### Update your `.env` file:
```env
# Discord Bot
DISCORD_TOKEN=your_discord_bot_token

# GitHub Webhook (for ngrok testing)
GITHUB_WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
NODE_ENV=development

# TrapHouse Mischief Manager Integrations
TRAPHOUSE_CHANNEL_ID=your_discord_channel_id

# Ecosystem Components
COLLECTCLOCK_ENABLED=true
TILTCHECK_ENABLED=true
JUSTHETIP_ENABLED=true
MISCHIEF_MANAGER_ENABLED=true

# Gambling Platform Integrations
STAKE_US_ENABLED=true
TRUSTDICE_ENABLED=true
METAWIN_ENABLED=true
```

### 📊 **Ngrok Web Interface**

#### Access the web interface at: `http://localhost:4040`

**Features:**
- **Request inspector**: See all incoming webhook requests
- **Request replay**: Resend requests for testing
- **Traffic analysis**: Monitor webhook performance
- **Response codes**: Debug webhook issues

### 🔄 **Development Workflow**

#### Daily Development Routine:
```bash
# Terminal 1: Start Mischief Manager ecosystem
cd /Users/fullsail/Desktop/traphouse_discordbot
npm start

# Terminal 2: Start ngrok tunnel
ngrok http 3001

# Terminal 3: Development work with accountability
git add .
git commit -m "Feature: Enhanced tilt detection algorithm"
git push origin main

# Watch Discord for Mischief Manager accountability notifications!
```

### 🎯 **Advanced Ngrok Configuration**

#### Custom Subdomain (Pro feature):
```bash
ngrok http 3001 --subdomain=mischief-manager-dev
# Creates: https://mischief-manager-dev.ngrok.io
```

#### Configuration File (`~/.ngrok2/ngrok.yml`):
```yaml
version: "2"
authtoken: your_auth_token_here

tunnels:
  mischief-manager:
    proto: http
    addr: 3001
    subdomain: mischief-manager-dev
    host_header: localhost:3001
```

#### Start with config:
```bash
ngrok start mischief-manager
```

### 🚨 **Common Issues & Solutions**

#### Issue 1: "tunnel not found" error
**Solution**: Make sure your Mischief Manager ecosystem is running on port 3001
```bash
# Check if port is in use
lsof -i :3001

# If not running, start your ecosystem
npm start
```

#### Issue 2: Webhook not receiving data
**Solution**: 
1. Check ngrok is forwarding to correct port
2. Verify webhook URL in GitHub settings
3. Check ngrok web interface for incoming requests

#### Issue 3: SSL verification failed
**Solution**: Always use the HTTPS ngrok URL, not HTTP
```
❌ Wrong: http://abc123.ngrok.io/github/webhook
✅ Correct: https://abc123.ngrok.io/github/webhook
```

#### Issue 4: "ngrok command not found"
**Solution**: 
```bash
# Install globally
npm install -g ngrok

# Or use npx
npx ngrok http 3001
```

### 🔐 **Security Considerations**

#### Best Practices:
1. **Use webhook secrets**: Always configure a secret token
2. **Validate signatures**: Verify GitHub's webhook signature
3. **Limit exposure time**: Don't leave ngrok running permanently
4. **Monitor logs**: Watch ngrok web interface for suspicious activity

#### Secret Validation in Your Bot:
```javascript
const crypto = require('crypto');

function validateWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
    
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
    );
}
```

### 📈 **Testing Mischief Manager Ecosystem Features**

#### Test CollectClock Integration:
```bash
# In Discord
!cc start
!cc collect trustdice

# Make a commit, check if respect points increased
git commit -m "Collected daily bonuses consistently"
git push

# Should see: "Development + Gambling discipline = +bonus respect!"
```

#### Test TiltCheck Mischief Manager:
```bash
# In Discord - start gambling session
!tiltcheck start "Stake US" 100

# Make commits during session
git commit -m "Coding while gambling - testing discipline correlation"
git push

# Should see Mischief Manager intervention if patterns detected
```

#### Test JustTheTip Integration:
```bash
# In Discord
!vault

# Make several quality commits
git commit -m "High-quality code contribution"
git push

# Check if crypto recommendations improve with dev discipline
!vault
```

#### Test Cross-Platform Accountability:
```bash
# Start gambling session + development work
!tiltcheck start "MetaWin" 250
git commit -m "Working on accountability features during session"
git push

# Mischief Manager should correlate activities and provide insights
```

### 🎉 **Success Indicators**

#### You'll know it's working when:
1. ✅ **Ngrok tunnel** shows "online" status
2. ✅ **GitHub webhook** shows green checkmarks in delivery history
3. ✅ **Discord notifications** appear for GitHub activity
4. ✅ **Cross-platform integration** shows development affecting respect points
5. ✅ **Mischief Manager** correlates coding discipline with gambling accountability
6. ✅ **TiltCheck grading** improves with consistent development activity
7. ✅ **CollectClock streaks** sync with GitHub commit patterns

### 🚀 **Next Steps After Testing**

Once your local testing works perfectly:

1. **Deploy to Railway/Heroku** for permanent hosting
2. **Configure production webhooks** with hosting URL
3. **Set up monitoring** for webhook health
4. **Scale the ecosystem** based on community growth
5. **Enable enterprise features** through TiltCheck Enterprise

---

## 🎯 **Quick Command Reference**

```bash
# Essential ngrok commands
ngrok http 3001              # Basic tunnel
ngrok http 3001 --log stdout # Show detailed logs
ngrok kill                   # Stop all tunnels
ngrok status                 # Check tunnel status

# TrapHouse Mischief Manager commands
npm start                    # Start complete ecosystem
npm run dev                  # Start with auto-restart
npm test                     # Run integration tests

# Mischief Manager specific commands
!tiltcheck start             # Begin accountability session
!cc collect                  # Daily bonus tracking
!vault                      # Crypto recommendations
!ecosystem                  # Full system status
```

**Your Mischief Manager Discord bot ecosystem is now ready for local testing with real GitHub webhooks!** 🎰

The ngrok tunnel allows you to test the complete accountability system locally, seeing how development activity integrates with gambling discipline tracking in real-time. Perfect for iterating and improving the "made for degens by degens" experience! 🚀

---

## 🏢 **TiltCheck Enterprise Solutions**

### 🎯 **Professional Gambling Accountability**

Ready to take your accountability to the next level? TiltCheck Enterprise provides professional-grade gambling addiction prevention and recovery tools.

#### 🌟 **Enterprise Features**
- **Licensed Counselor Integration** - Connect with certified addiction specialists
- **Advanced Analytics** - Comprehensive gambling pattern analysis
- **Family/Partner Dashboard** - Transparency tools for loved ones
- **Medical Integration** - Work with healthcare providers
- **Custom Intervention Plans** - Personalized accountability strategies

#### 🔗 **Get Started with TiltCheck Enterprise**
- **GitHub Enterprise**: [TiltCheck Organization](https://github.com/enterprises/tiltcheck)
- **Professional Support**: [Enterprise Solutions](https://tiltcheck.io/enterprise)
- **Developer Resources**: [@jmenichole](https://github.com/jmenichole) | [Sponsor Development](https://github.com/sponsors/jmenichole)
- **LinkedIn**: [Connect with Creator](https://linkedin.com/in/jmenichole0) | **Support**: [Ko-fi](https://ko-fi.com/jmenichole)

#### 💼 **Contact for Enterprise**
Transform your gambling accountability with professional-grade tools designed by someone who understands the struggle. TiltCheck Enterprise bridges the gap between peer support and professional intervention.

**Built by degens, for degens, with professional guidance when you need it most.** 🤝

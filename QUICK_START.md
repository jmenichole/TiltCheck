# 🚨 IMMEDIATE SETUP REQUIRED

## Your Bot Cannot Start Without:

### 1. Discord Bot Token
```bash
# Edit .env file and add:
DISCORD_BOT_TOKEN=OTxxxxxxxxxxxxxxxxxxxxxxxxx.Gxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Get your token:**
1. Go to https://discord.com/developers/applications
2. Select your application (or create new one)
3. Go to "Bot" section
4. Click "Reset Token" if needed
5. Copy the token
6. Paste into .env file

### 2. Quick Start Commands
```bash
# Check configuration
./start-bot.sh

# Or manually:
node validate-config.js
node index.js
```

## 🔗 Custom Install Links

### TrapHouse Bot Install URLs:
```
# Basic Install (Recommended)
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot

# Admin Install (Use with caution)
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=8&integration_type=0&scope=bot

# Custom Redirect Install (Your own landing page)
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=https://your-domain.com/install/success
```

### Custom Install Landing Page Setup:
1. **Set up OAuth redirect in Discord Developer Portal:**
   - Go to OAuth2 → General
   - Add redirect URI: `https://your-domain.com/install/success`
   
2. **Configure your custom install flow:**
   ```env
   # Add to .env
   DISCORD_CLIENT_ID=1354450590813655142
   DISCORD_CLIENT_SECRET=your_client_secret_here
   OAUTH_REDIRECT_URI=https://your-domain.com/install/success
   ```

3. **Use the OAuth handler already in your codebase:**
   - File: `oauthRedirect.js` handles custom install flows
   - Webhook server supports custom redirects
   - Landing pages ready at `/auth/success`

## ✅ Optional Enhancements

### Solana USDC Deposits
```env
SOLANA_USDC_DESTINATION_ADDRESS=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

### TiltCheck Integration
```env
TILTCHECK_API_KEY=your_tiltcheck_api_key
```

### Stake API Integration
```env
STAKE_API_KEY=your_stake_api_key
STAKE_SESSION_TOKEN=your_session_token
```

---

**🎯 Priority: Get Discord token first, then customize your install experience!**

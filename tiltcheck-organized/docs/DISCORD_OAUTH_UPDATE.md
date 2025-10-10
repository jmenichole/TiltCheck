# Discord OAuth Redirect URI Update for tiltcheck.it.com

## 🎯 CRITICAL UPDATE REQUIRED

The `.env` file has been updated with the new `tiltcheck.it.com` domain configuration, but **Discord application settings must be updated manually**.

## 📋 Discord Developer Portal Updates Required

### Step 1: Access Discord Developer Portal
1. Go to: https://discord.com/developers/applications
2. Login with your Discord account
3. Select your TrapHouse application

### Step 2: Update OAuth2 Settings
1. Navigate to **OAuth2** → **General** in the left sidebar
2. Find the **Redirects** section
3. **Remove the old redirect URI:**
   ```
   http://localhost:3002/auth/callback
   ```
4. **Add the new redirect URI:**
   ```
   https://tiltcheck.it.com/auth/callback
   ```
5. Click **Save Changes**

## 🔧 Application Details
- **Client ID:** `1373784722718720090`
- **New Base URL:** `https://tiltcheck.it.com`
- **New Redirect URI:** `https://tiltcheck.it.com/auth/callback`

## 🌐 DNS Configuration Required

For `tiltcheck.it.com` domain, add these DNS records:

### A Records (Point to your server IP)
```
@ (root domain) → Your server IP
```

### CNAME Records (Point to root domain or server)
```
dashboard.tiltcheck.it.com → tiltcheck.it.com
api.tiltcheck.it.com → tiltcheck.it.com
collectclock.tiltcheck.it.com → tiltcheck.it.com
cards.tiltcheck.it.com → tiltcheck.it.com
vault.tiltcheck.it.com → tiltcheck.it.com
portal.tiltcheck.it.com → tiltcheck.it.com
bot.tiltcheck.it.com → tiltcheck.it.com
admin.tiltcheck.it.com → tiltcheck.it.com
```

## 🚂 Railway Deployment Configuration

Update Railway project `0gapllg9` with domain mapping:
1. Go to Railway dashboard
2. Select project `0gapllg9`
3. Add custom domain: `tiltcheck.it.com`
4. Configure SSL certificate
5. **Ensure PORT is set to 3000** in Railway environment variables
6. Deploy using `docker-compose.server.yml`

### Railway Environment Variables Required:
```
PORT=3000
NODE_ENV=production
HOST=0.0.0.0
BASE_URL=https://tiltcheck.it.com
```

## 🔗 Service Integration URLs Updated

- **TrapHouse Created.app:** `https://traphousediscordbot.created.app`
- **CollectClock GitHub:** `https://jmenichole.github.io/CollectClock/`
- **CollectClock TiltCheck:** `https://collectclock.tiltcheck.it.com`
- **Railway Deployment:** `https://0gapllg9.up.railway.app`
- **Degens Cards GitHub:** `https://github.com/jmenichole/degensagainstdecency`

## ✅ Configuration Status

- [x] `.env` file updated with new domain
- [x] TiltCheck API URLs updated
- [x] CollectClock integration configured
- [x] Degens card game URLs added
- [x] Railway deployment configuration added
- [ ] **Discord OAuth redirect URI (MANUAL UPDATE REQUIRED)**
- [ ] DNS records configuration (MANUAL SETUP REQUIRED)
- [ ] Railway domain mapping (MANUAL SETUP REQUIRED)

## 🎯 Degen-Mindful Balance Features Enabled

The configuration now supports helping users find balance between degen and mindful approaches:

- `BALANCE_SYSTEM_ENABLED=true`
- `MINDFUL_DEGEN_INTEGRATION=true`
- `TILT_VS_UNTILT_TRACKING=true`
- `COMPASSION_GLITCH_PREVENTION=true`
- `DEGEN_HUMOR_ENABLED=true`
- `WITTY_LIFE_RELEVANCY=true`

This creates the perfect blend of street-smart degen culture with mindful decision-making tools.

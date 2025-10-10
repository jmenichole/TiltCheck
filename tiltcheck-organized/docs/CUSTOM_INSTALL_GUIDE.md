# 🔗 Custom Discord Bot Install Flow Setup Guide

## 🎯 Overview

Set up a custom installation experience where users are redirected to YOUR landing page instead of Discord's default "App Added" message.

## 🚀 Quick Setup (Using Your Existing Infrastructure)

### 1. Discord Developer Portal Configuration

**Go to:** https://discord.com/developers/applications/1354450590813655142

**Navigate to:** OAuth2 → General → Redirects

**Add these redirect URIs:**
```
# Local Development
http://localhost:3002/auth/callback

# Production (when you deploy)
https://your-domain.com/auth/callback
https://your-app-name.herokuapp.com/auth/callback
https://your-app-name.vercel.app/auth/callback
```

### 2. Update Your .env File

Add these OAuth configurations to your existing `.env`:

```env
# Discord OAuth Configuration (Custom Install Flow)
DISCORD_CLIENT_ID=1354450590813655142
DISCORD_CLIENT_SECRET=your_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3002/auth/callback
BASE_URL=http://localhost:3002
OAUTH_PORT=3002
JWT_SECRET=your_32_character_jwt_secret_here
```

### 3. Get Your Client Secret

1. Go to https://discord.com/developers/applications/1354450590813655142
2. Navigate to OAuth2 → General
3. Click "Reset Secret" if needed
4. Copy the Client Secret
5. Add it to your `.env` file

### 4. Custom Install URLs

Use these URLs for your custom install experience:

```
# Development Install URL
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code

# Production Install URL (replace with your domain)
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=https://your-domain.com/auth/callback&response_type=code
```

## 🛠️ Your Existing Infrastructure

You already have these components set up:

### ✅ OAuth Handler (`oauthRedirect.js`)
- Handles Discord OAuth2 flow
- Exchanges authorization codes for tokens
- Creates user sessions with JWT
- Redirects to success page

### ✅ Webhook Server (`github-webhook-server.js`)
- Runs on port 3002 (or 3001 if available)
- Serves OAuth endpoints
- Handles custom redirects

### ✅ Success Pages
- Custom landing pages ready
- User authentication flow
- Payment integration hooks

## 🎨 Customization Options

### Option 1: Simple Success Message
Users see a custom "Bot Added Successfully!" page on your domain.

### Option 2: User Dashboard
Redirect users to a personalized dashboard where they can:
- Configure bot settings
- View payment options
- Access help documentation

### Option 3: Server Setup Wizard
Guide users through:
1. Bot configuration
2. Channel setup
3. Permission verification
4. Feature activation

## 🔧 Testing Your Custom Install Flow

### 1. Start Your Bot with OAuth Server
```bash
# Your bot is already running the OAuth server
node index.js
```

### 2. Test the Custom Install URL
Open this URL in your browser:
```
http://localhost:3002/auth/discord?scope=bot+identify+guilds
```

### 3. Verify OAuth Flow
1. User clicks install link
2. Discord OAuth authorization screen
3. User authorizes bot
4. Redirect to your custom page
5. Success message and next steps

## 🌐 Production Deployment

### 1. Choose a Hosting Platform
- **Heroku**: `https://your-app.herokuapp.com`
- **Vercel**: `https://your-app.vercel.app`
- **Railway**: `https://your-app.up.railway.app`
- **Custom Domain**: `https://your-domain.com`

### 2. Update Discord Redirect URIs
Add your production URL to Discord Developer Portal:
```
https://your-production-domain.com/auth/callback
```

### 3. Update Environment Variables
```env
OAUTH_REDIRECT_URI=https://your-production-domain.com/auth/callback
BASE_URL=https://your-production-domain.com
```

## 🎯 Custom Install Link Examples

### Basic Custom Install
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=https://your-domain.com/auth/callback&response_type=code
```

### Install with User Dashboard
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot+identify+guilds&redirect_uri=https://your-domain.com/auth/callback&response_type=code
```

### Install with Payment Setup
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot+identify&redirect_uri=https://your-domain.com/auth/payment-setup&response_type=code
```

## 📱 Integration Examples

### Website Button
```html
<a href="https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=https://your-domain.com/auth/callback&response_type=code" 
   class="btn btn-discord">
   🤖 Add TrapHouse Bot
</a>
```

### Custom Landing Page
After successful install, redirect users to:
```
https://your-domain.com/welcome?bot=added&server=123456&user=789012
```

## 🔒 Security Features

Your OAuth handler includes:
- **CSRF Protection**: State parameter validation
- **JWT Sessions**: Secure user authentication
- **Token Exchange**: Secure Discord token handling
- **User Verification**: Discord user information validation

## 🚀 Next Steps

1. **Get your Discord Client Secret** from the Developer Portal
2. **Add it to your `.env` file**
3. **Test the OAuth flow locally**
4. **Deploy to your preferred hosting platform**
5. **Update Discord redirect URIs with production URL**
6. **Use your custom install links everywhere**

Your TrapHouse bot now has a professional, branded installation experience! 🎉

---

**Ready to set up your custom install experience? Start by getting your Discord Client Secret!**

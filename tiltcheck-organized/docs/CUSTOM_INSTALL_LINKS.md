# 🔗 TrapHouse Ecosystem - Custom Install Links

## 🎯 Your Custom Install URLs are Ready!

Based on your OAuth configuration, here are your custom install links that will redirect users to YOUR landing page instead of Discord's default flow.

## 🏠 **TrapHouse Main Bot**
**Client ID:** `1354450590813655142`

### Standard Install Link:
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot
```

### Custom Install Link (Redirects to your page):
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code
```

## 💡 **JustTheTip Bot** (Your Current OAuth Setup)
**Client ID:** `1373784722718720090`

### Custom Install Link:
```
https://discord.com/oauth2/authorize?client_id=1373784722718720090&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code
```

## 💧 **CollectClock Bot**
**Client ID:** `1336968746450812928`

### Custom Install Link:
```
https://discord.com/oauth2/authorize?client_id=1336968746450812928&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code
```

## 🎰 **Degens Bot**
**Client ID:** `1376113587025739807`

### Custom Install Link:
```
https://discord.com/oauth2/authorize?client_id=1376113587025739807&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code
```

## 🛠️ **Setup Required in Discord Developer Portal**

For EACH bot application, you need to add the redirect URI:

### 1. JustTheTip Bot (Already configured in your .env)
- Go to: https://discord.com/developers/applications/1373784722718720090
- Navigate: OAuth2 → General → Redirects
- Add: `http://localhost:3002/auth/callback`

### 2. TrapHouse Main Bot
- Go to: https://discord.com/developers/applications/1354450590813655142
- Navigate: OAuth2 → General → Redirects  
- Add: `http://localhost:3002/auth/callback`

### 3. CollectClock Bot
- Go to: https://discord.com/developers/applications/1336968746450812928
- Navigate: OAuth2 → General → Redirects
- Add: `http://localhost:3002/auth/callback`

### 4. Degens Bot
- Go to: https://discord.com/developers/applications/1376113587025739807
- Navigate: OAuth2 → General → Redirects
- Add: `http://localhost:3002/auth/callback`

## 🧪 **Testing Your Custom Install Flow**

Your bot is already running with the OAuth server. Test it:

1. **Open this URL in your browser:**
   ```
   http://localhost:3002/auth/discord
   ```

2. **Or test JustTheTip custom install directly:**
   ```
   https://discord.com/oauth2/authorize?client_id=1373784722718720090&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code
   ```

## 🌐 **For Production Deployment**

When you deploy to Heroku/Vercel/Railway, update:

### 1. Update .env for production:
```env
OAUTH_REDIRECT_URI=https://your-domain.com/auth/callback
BASE_URL=https://your-domain.com
```

### 2. Add production redirect URI to ALL Discord applications:
```
https://your-domain.com/auth/callback
```

### 3. Use production URLs in install links:
```
https://discord.com/oauth2/authorize?client_id=1373784722718720090&permissions=414539926592&scope=bot&redirect_uri=https://your-domain.com/auth/callback&response_type=code
```

## 📱 **Ready-to-Use HTML Buttons**

### JustTheTip Bot Install Button:
```html
<a href="https://discord.com/oauth2/authorize?client_id=1373784722718720090&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code" 
   class="btn btn-discord" target="_blank">
   💡 Add JustTheTip Bot
</a>
```

### TrapHouse Main Bot Install Button:
```html
<a href="https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot&redirect_uri=http://localhost:3002/auth/callback&response_type=code" 
   class="btn btn-discord" target="_blank">
   🏠 Add TrapHouse Bot
</a>
```

## 🎨 **Custom Landing Page Features**

When users install via your custom links, they'll be redirected to your page where you can show:

- ✅ **Installation success message**
- 🛠️ **Setup instructions**
- 💰 **Payment configuration**
- 📚 **Command documentation**
- 🎮 **Server setup wizard**
- 📊 **User dashboard**

## 🔒 **Security Features Enabled**

Your OAuth setup includes:
- ✅ **CSRF Protection** via state parameter
- ✅ **JWT Sessions** for user authentication
- ✅ **Secure token exchange**
- ✅ **User verification**

## ✅ **Next Steps**

1. **Add redirect URIs** to Discord Developer Portal for each bot
2. **Test the OAuth flow** with the JustTheTip bot (already configured)
3. **Customize your landing page** in the OAuth handler
4. **Deploy to production** and update redirect URIs
5. **Use your custom install links** on your website/social media

Your professional, branded Discord bot installation experience is ready! 🚀

---

**Current Status: ✅ JustTheTip Bot OAuth configured and ready to test!**

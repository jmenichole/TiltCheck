# CollectClock Discord Integration Setup Guide

## Discord Developer Portal Configuration

### 1. OAuth2 Settings

**Redirect URIs** (Add these to your Discord application):
```
http://localhost:3002/auth/collectclock/callback
http://localhost:3003/auth/collectclock/callback
https://your-production-domain.com/auth/collectclock/callback
```

**Scopes** (Select these):
- `bot` - For bot functionality
- `identify` - To get user info
- `guilds` - To access guild information

**Bot Permissions** (Minimum required):
- Send Messages
- Read Messages
- Use Slash Commands
- Embed Links
- Attach Files
- Read Message History

### 2. GitHub Pages Integration

**Your CollectClock URLs:**
- Main App: `https://jmenichole.github.io/CollectClock/`
- Auth Page: `https://jmenichole.github.io/CollectClock/auth.html`

**OAuth Authorization URL:**
```
https://discord.com/oauth2/authorize?client_id=1336968746450812928&permissions=8&integration_type=0&scope=bot+identify&redirect_uri=http://localhost:3002/auth/collectclock/callback&response_type=code
```

### 3. Webhook Configuration

**For Discord Developer Portal Webhooks:**
- Webhook URL: `http://localhost:3002/webhook/collectclock`
- Content Type: `application/json`
- Events to Subscribe: (depends on what events CollectClock supports)

**For GitHub Pages → Your Backend:**
- Your CollectClock app will send POST requests to: `http://localhost:3002/webhook/collectclock`
- Format: JSON
- Include user authentication tokens

### 4. Environment Variables

Add these to your `.env` file:
```env
# CollectClock Integration
COLLECTCLOCK_CLIENT_ID=1336968746450812928
COLLECTCLOCK_CLIENT_SECRET=E118DYRj0tJatvicEbDJQMkx4aEK6PQB
COLLECTCLOCK_REDIRECT_URI=http://localhost:3002/auth/collectclock/callback
BASE_URL=http://localhost:3002

# Production URLs (when deployed)
# COLLECTCLOCK_REDIRECT_URI=https://your-domain.com/auth/collectclock/callback
# BASE_URL=https://your-domain.com
```

### 5. Integration Flow

1. **User clicks "Connect Discord" on your CollectClock GitHub Pages site**
2. **Redirect to Discord OAuth:**
   ```
   https://discord.com/oauth2/authorize?client_id=1336968746450812928&scope=bot+identify&redirect_uri=http://localhost:3002/auth/collectclock/callback&response_type=code
   ```
3. **User authorizes the application**
4. **Discord redirects to:** `http://localhost:3002/auth/collectclock/callback?code=AUTH_CODE`
5. **Your backend exchanges code for token**
6. **Redirect user back to:** `https://jmenichole.github.io/CollectClock/?success=true&user=USERNAME`

### 6. Webhook Events

**CollectClock → TrapHouse Bot:**
```json
{
  "event": "clock_in",
  "data": {
    "userId": "123456789",
    "timestamp": "2025-01-15T10:00:00Z",
    "location": "work"
  }
}
```

```json
{
  "event": "clock_out", 
  "data": {
    "userId": "123456789",
    "timestamp": "2025-01-15T18:00:00Z",
    "duration": 28800000,
    "hoursWorked": 8
  }
}
```

### 7. Testing URLs

**Local Development:**
- OAuth Handler: `http://localhost:3003/auth/collectclock/health`
- Webhook Test: `http://localhost:3002/webhook/collectclock`
- Main Ecosystem: `http://localhost:3002/webhook/health`

**GitHub Pages:**
- CollectClock App: `https://jmenichole.github.io/CollectClock/`
- Auth Success: `https://jmenichole.github.io/CollectClock/auth.html`

### 8. Security Considerations

- Use HTTPS in production
- Validate webhook signatures
- Store access tokens securely
- Implement rate limiting
- Use environment variables for secrets

### 9. Respect System Integration

**Clock In Bonus:** 5 respect points
**Hourly Work:** 10 respect points per hour
**Goal Achievement:** 25 respect bonus
**Daily Streak:** Progressive bonus (5, 10, 15, 20, 25...)

### 10. Commands Integration

The CollectClock integration will work with existing TrapHouse commands:
- `!clockin` - Start work session
- `!clockout` - End work session  
- `!timesheet` - View work hours
- `!productivity` - View stats and respect earned
- `!goal <hours>` - Set daily work goals

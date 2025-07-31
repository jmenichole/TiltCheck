# Production Deployment Guide

## 1. Environment Variables for Production

Add these to your production environment:

```env
# Production URLs
BASE_URL=https://your-production-domain.com
COLLECTCLOCK_REDIRECT_URI=https://your-production-domain.com/auth/collectclock/callback

# Discord Developer Portal Settings
COLLECTCLOCK_OAUTH_URL=https://discord.com/oauth2/authorize?client_id=1336968746450812928&scope=bot+identify&redirect_uri=https://your-production-domain.com/auth/collectclock/callback&response_type=code&permissions=8
```

## 2. Discord Developer Portal Configuration

### OAuth2 Redirect URIs:
```
https://your-production-domain.com/auth/collectclock/callback
http://localhost:3002/auth/collectclock/callback (for testing)
```

### Webhook URLs:
```
https://your-production-domain.com/webhook/collectclock
http://localhost:3002/webhook/collectclock (for testing)
```

## 3. GitHub Pages Integration

Your CollectClock app at `https://jmenichole.github.io/CollectClock/` should:

### JavaScript for OAuth:
```javascript
// On "Connect Discord" button click
function connectDiscord() {
    const oauthUrl = 'https://discord.com/oauth2/authorize?client_id=1336968746450812928&scope=bot+identify&redirect_uri=https://your-production-domain.com/auth/collectclock/callback&response_type=code&permissions=8';
    window.location.href = oauthUrl;
}

// Handle OAuth success on auth.html page
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    const username = urlParams.get('user');
    const userId = urlParams.get('id');
    
    // Store user session
    localStorage.setItem('discord_user', JSON.stringify({ username, userId }));
    
    // Redirect to main app
    window.location.href = '/CollectClock/';
}
```

### Webhook Events:
```javascript
// Send clock-in event
async function clockIn() {
    const user = JSON.parse(localStorage.getItem('discord_user'));
    
    await fetch('https://your-production-domain.com/webhook/collectclock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'clock_in',
            data: {
                userId: user.userId,
                timestamp: new Date().toISOString()
            }
        })
    });
}

// Send clock-out event
async function clockOut() {
    const user = JSON.parse(localStorage.getItem('discord_user'));
    
    await fetch('https://your-production-domain.com/webhook/collectclock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'clock_out',
            data: {
                userId: user.userId,
                timestamp: new Date().toISOString(),
                duration: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
                hoursWorked: 8
            }
        })
    });
}
```

## 4. Testing Commands

Test these in Discord:
- `!help` - Main help menu
- `!clockin` - Test time tracking
- `!clockout` - Test work completion
- `!timesheet` - View hours summary
- `!productivity` - View detailed stats
- `!goal 8` - Set 8-hour daily goal

## 5. System Health Checks

Monitor these endpoints:
- `http://localhost:3002/webhook/health` - Webhook server health
- `http://localhost:3002/` - Server status and endpoints
- Discord bot online status in your server

## 6. Respect System Integration

The CollectClock integration automatically awards:
- **+5 respect** for clocking in
- **+10 respect per hour** worked
- **+25 respect bonus** for meeting daily goals
- **Progressive bonuses** for daily streaks

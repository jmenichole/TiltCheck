# 🔐 OAuth Configuration Guide

## Required Environment Variables

Add these to your `.env` file:

```env
# Discord Application Settings
DISCORD_CLIENT_ID=1354450590813655142
DISCORD_CLIENT_SECRET=your_client_secret_here
APPLICATION_ID=1354450590813655142

# OAuth Settings
OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback
BASE_URL=http://localhost:3001
OAUTH_PORT=3001
JWT_SECRET=your_jwt_secret_here

# Admin User (optional)
ADMIN_USER_ID=your_discord_user_id
```

## Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your TrapHouse bot application (ID: 1354450590813655142)
3. Go to **OAuth2** → **General**
4. Add redirect URI: `http://localhost:3001/auth/callback`
5. Copy your Client Secret and add it to `.env`

## OAuth Scopes

The bot requests these Discord permissions:
- `identify` - Basic user info (username, avatar, ID)
- `email` - User's email address
- `guilds` - List of user's Discord servers

## Usage

### Starting OAuth Server

```javascript
const OAuthIntegration = require('./oauthIntegration');

// Initialize with your bot and storage
const oauth = new OAuthIntegration(bot, unicodeSafeStorage);
await oauth.initialize();
```

### Bot Commands

Users can use these commands in Discord:

- `!login` - Get authentication link
- `!auth` - Same as !login
- `!dashboard` - Access user dashboard
- `!payment <payment_id>` - Verify specific payment

### Web Routes

#### Public Routes:
- `GET /` - Redirect to auth page
- `GET /auth/discord` - Start OAuth flow
- `GET /auth/callback` - Handle Discord callback
- `GET /auth/success` - Success page with user dashboard
- `GET /health` - Server health check

#### Protected Routes (require authentication):
- `GET /auth/user` - Get authenticated user info
- `GET /auth/payment/:paymentId` - Verify payment
- `GET /admin/dashboard` - Admin-only dashboard
- `POST /auth/logout` - Logout user

## Security Features

### CSRF Protection
- State parameter validation
- Secure session management
- Token-based authentication

### Data Validation
- Discord ID validation
- Unicode-safe data handling
- JWT token verification

### Access Control
- Role-based permissions
- Admin-only routes
- User data isolation

## Integration Examples

### Manual Authentication URL
```javascript
const oauth = new OAuthIntegration(bot, storage);
const authUrl = oauth.generateOAuthUrl('identify email guilds');
console.log('Auth URL:', authUrl);
```

### Checking User Authentication
```javascript
// In your bot commands
const userData = await storage.getUserData(userId);
const authUrl = oauth.generateOAuthUrl('identify email');

await message.reply(`Login here: ${authUrl}`);
```

### Payment Verification Flow
```javascript
// User initiates payment verification
const paymentUrl = oauth.generateOAuthUrl('identify email', `payment:${paymentId}`);
await message.reply(`Verify payment: ${paymentUrl}`);
```

## Production Deployment

### Environment Variables
```env
# Production settings
BASE_URL=https://your-domain.com
OAUTH_REDIRECT_URI=https://your-domain.com/auth/callback
OAUTH_PORT=3001

# Security
JWT_SECRET=your_secure_random_secret_here
```

### SSL/HTTPS Setup
- Discord requires HTTPS for production OAuth
- Use reverse proxy (nginx) or SSL termination
- Update redirect URI to HTTPS

### Domain Setup
- Point your domain to server IP
- Configure DNS A records
- Set up SSL certificate

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri"**
   - Check Discord app OAuth settings
   - Ensure exact URI match (including protocol)

2. **"Invalid client_secret"**
   - Regenerate secret in Discord Developer Portal
   - Update `.env` file

3. **"State parameter mismatch"**
   - Session not persisting
   - Check session middleware configuration

4. **"Permission denied"**
   - User declined authorization
   - Check requested scopes

### Debug Mode
```javascript
// Enable verbose logging
process.env.DEBUG = 'oauth:*';
```

### Testing
```bash
# Test authentication flow
curl http://localhost:3001/auth/discord

# Test health endpoint
curl http://localhost:3001/health

# Test with token
curl -H "Authorization: Bearer your_jwt_token" http://localhost:3001/auth/user
```

## Integration with Main Bot

Add to your main bot file:

```javascript
const OAuthIntegration = require('./oauthIntegration');

// After bot initialization
const oauth = new OAuthIntegration(client, unicodeSafeStorage);

client.on('ready', async () => {
    console.log('Bot is ready!');
    
    // Initialize OAuth
    const success = await oauth.initialize();
    if (success) {
        console.log('✅ OAuth system ready');
    } else {
        console.log('❌ OAuth system failed to start');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    oauth.shutdown();
    client.destroy();
});
```

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Discord client secret
   - JWT signing secret
   - Session secrets

2. **Validate All Input**
   - Discord IDs
   - State parameters
   - User data

3. **Use HTTPS in Production**
   - All OAuth flows
   - API endpoints
   - Static assets

4. **Implement Rate Limiting**
   - OAuth attempts
   - API requests
   - Bot commands

5. **Monitor Logs**
   - Authentication attempts
   - Failed validations
   - Unusual activity

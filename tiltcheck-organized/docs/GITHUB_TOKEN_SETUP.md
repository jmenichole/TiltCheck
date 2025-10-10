# 🔐 GitHub Access Token Setup Guide

## Quick Setup for GitHub Integration

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure Token Settings**
   ```
   Token Name: TrapHouse Discord Bot
   Expiration: 90 days (or No expiration for testing)
   ```

3. **Select Required Scopes**
   ```
   ✅ repo                    # Full repository access
   ✅ workflow               # GitHub Actions workflow access  
   ✅ write:repo_hook        # Repository webhook management
   ✅ read:org               # Organization information
   ✅ notifications          # Notification access
   ```

4. **Copy the Token**
   ⚠️ **Save this immediately** - GitHub only shows it once!

### Step 2: Add to Environment Variables

Create a `.env` file in your project root:

```bash
# Discord Bot Token  
DISCORD_TOKEN=your_discord_bot_token_here

# GitHub Integration
GITHUB_ACCESS_TOKEN=ghp_your_personal_access_token_here
GITHUB_WEBHOOK_SECRET=your_optional_webhook_secret

# Webhook Configuration
GITHUB_WEBHOOK_URL=https://584a0654c7f9.ngrok-free.app/github/webhook
```

### Step 3: Test the Integration

```bash
# Start the bot with environment variables loaded
node index.js

# Test webhook endpoint
curl -X POST https://584a0654c7f9.ngrok-free.app/github/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"test": "data"}'
```

## Current Webhook URL
```
https://584a0654c7f9.ngrok-free.app/github/webhook
```

## Repository Webhook Setup

1. Go to your repository → **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. **Payload URL**: `https://584a0654c7f9.ngrok-free.app/github/webhook`
4. **Content type**: `application/json`
5. **Secret**: (optional - leave empty for testing)
6. **Events**: Select "Push events", "Pull requests", "Issues"
7. **Active**: ✅ Checked
8. Click **"Add webhook"**

## Security Notes

- 🔒 **Never commit `.env` files** to GitHub
- 🔄 **Rotate tokens regularly** (every 90 days recommended)
- 🛡️ **Use webhook secrets** in production
- 🚨 **Monitor token usage** in GitHub settings

## Testing Commands

Once configured, test with these Discord commands:
- `!github status` - Show GitHub integration status
- `!ecosystem` - Show all system status including GitHub

## Need Help?

- Token not working? Check scopes and expiration
- Webhook failing? Verify URL and secret
- Bot not responding? Check `.env` file loading

# JustTheTip Bot - GitHub Integration

## 🔗 GitHub Repository
**Main Repository:** https://github.com/jmenichole/trap-house-discord-bot

## 🌐 Service URLs

### Production Deployment
- **Main Service:** https://justthetip.bot
- **Dashboard:** https://app.justthetip.bot
- **API Endpoint:** https://api.justthetip.bot

### Development URLs
- **Local Bot:** http://localhost:3000
- **Local Dashboard:** http://localhost:3000/justthetip
- **Webhook Endpoint:** http://localhost:3002/webhook

### GitHub App Integration
- **App URL:** https://github.com/apps/justthetip-bot
- **Installation URL:** https://github.com/apps/justthetip-bot/installations/new
- **Marketplace:** https://github.com/marketplace/justthetip-smart-crypto-assistant

## 📋 GitHub App Configuration

### Required Permissions
```yaml
Repository permissions:
  - Contents: Read
  - Issues: Write
  - Pull requests: Write
  - Metadata: Read

Organization permissions:
  - Members: Read
  - Administration: Read

User permissions:
  - Email addresses: Read
  - Profile: Read
```

### Webhook Events
```yaml
Events:
  - push
  - pull_request
  - issues
  - repository
  - installation
  - installation_repositories
```

### Webhook URL
```
https://api.justthetip.bot/github/webhook
```

## 🚀 GitHub Actions Integration

### Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy JustTheTip Bot
on:
  push:
    branches: [main]
  
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

## 🔧 Environment Variables for GitHub Integration

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Service URLs
GITHUB_APP_URL=https://github.com/apps/justthetip-bot
WEBHOOK_URL=https://api.justthetip.bot/github/webhook
SERVICE_URL=https://justthetip.bot
```

## 📖 Integration Features

### Discord + GitHub Integration
- **Code Reviews:** Bot notifications for PR reviews
- **Issue Tracking:** Create GitHub issues from Discord commands
- **Deployment Status:** Real-time deployment updates in Discord
- **Commit Notifications:** Smart commit summaries with degen humor

### Commands
```bash
!jtt github status        # Check repository status
!jtt github deploy        # Trigger deployment
!jtt github issue "Bug"   # Create GitHub issue
!jtt github pr            # List open pull requests
```

## 🎯 Setup Instructions

### 1. Create GitHub App
1. Go to [GitHub Apps](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Use the configuration above
4. Set webhook URL to your service endpoint

### 2. Install App
1. Generate private key for your app
2. Install app on your repository
3. Configure webhook endpoint
4. Set environment variables

### 3. Deploy Service
1. Deploy your bot to production
2. Configure DNS for custom domain
3. Set up SSL certificates
4. Test webhook connectivity

---

**Ready to integrate with GitHub?** The URL structure above provides everything you need for a professional GitHub App integration with your JustTheTip bot! 🚀

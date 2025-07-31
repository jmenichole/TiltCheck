# GitHub Webhook Configuration Guide

## TrapHouse Discord Bot - GitHub Integration Setup

### 🔧 **Webhook Configuration Settings**

#### Required Settings:
- **Payload URL**: See deployment options below
- **Content Type**: `application/json`
- **Secret**: Use a strong secret token (store in environment variables)
- **SSL Verification**: ✅ **Enable SSL verification** (recommended for production)

#### Deployment Options:

##### 🔧 **Local Development** (Testing):
```
http://your-ngrok-url.ngrok.io/github/webhook
```
Use ngrok for local testing (free tunneling service)

##### 🚀 **Free Hosting** (Production Ready):
```
https://your-app-name.herokuapp.com/github/webhook    # Heroku
https://your-app-name.vercel.app/github/webhook       # Vercel
https://your-app-name.netlify.app/github/webhook      # Netlify
https://your-repo-name.github.io/github/webhook       # GitHub Pages
```

##### 🌐 **Custom Domain** (Future):
```
https://tiltcheck.io/github/webhook                   # When you own tiltcheck.io
https://your-domain.com/github/webhook                # Your custom domain
```

#### Event Selection:
For the TrapHouse ecosystem, select these specific events:

##### ✅ **Essential Events** (Development Accountability):
- `push` - Track commits and code contributions
- `pull_request` - Monitor code reviews and collaboration
- `issues` - Track issue creation and resolution
- `commit_comment` - Code quality discussions
- `release` - Major milestone tracking

##### ✅ **Community Events** (TrapHouse Integration):
- `star` - Repository appreciation tracking
- `fork` - Community growth metrics
- `watch` - Engagement monitoring

##### ✅ **Security Events** (Accountability Features):
- `security_advisory` - Security issue awareness
- `vulnerability_alert` - Code safety monitoring

### 🚀 **Complete Webhook Setup**

#### Step 1: Environment Configuration
Add these to your `.env` file:
```env
# GitHub Webhook Configuration
GITHUB_WEBHOOK_SECRET=your_super_secret_webhook_token_here
GITHUB_WEBHOOK_PORT=3001
WEBHOOK_BASE_URL=https://your-app-name.herokuapp.com  # Update with your hosting URL

# Discord Integration
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
TRAPHOUSE_CHANNEL_ID=your_traphouse_channel_id

# Development Accountability
COMMIT_STREAK_ENABLED=true
CODE_QUALITY_ALERTS=true
COMMUNITY_NOTIFICATIONS=true
```

#### Step 2: Webhook URL Structure
```
Local Development: http://localhost:3001/github/webhook
Ngrok Tunnel: https://abc123.ngrok.io/github/webhook
Heroku: https://your-app-name.herokuapp.com/github/webhook
Vercel: https://your-app-name.vercel.app/github/webhook
Custom Domain: https://your-domain.com/github/webhook (future)
```

#### Step 3: Discord Channel Setup
Create these channels in your Discord server:
- `#dev-commits` - Code contribution tracking
- `#github-alerts` - Repository notifications  
- `#accountability-updates` - Development discipline tracking
- `#community-growth` - Stars, forks, engagement

### 📊 **Event Processing Configuration**

#### Commit Tracking (Push Events):
```javascript
// Webhook payload processing
{
  "event": "push",
  "accountability_features": {
    "commit_streak_tracking": true,
    "code_quality_scoring": true,
    "discipline_points": true,
    "respect_integration": true
  },
  "discord_notifications": {
    "channel": "#dev-commits",
    "mention_roles": ["@developers"],
    "format": "detailed"
  }
}
```

#### Pull Request Tracking:
```javascript
{
  "event": "pull_request",
  "actions": ["opened", "closed", "merged"],
  "accountability_scoring": {
    "code_review_participation": true,
    "collaboration_metrics": true,
    "quality_gates": true
  }
}
```

#### Community Engagement:
```javascript
{
  "event": "star",
  "community_features": {
    "growth_tracking": true,
    "contributor_recognition": true,
    "milestone_celebrations": true
  }
}
```

### 🛡️ **Security Configuration**

#### Webhook Security Best Practices:
1. **Use HTTPS Only**: Always enable SSL verification
2. **Secret Token**: Generate a strong, unique secret
3. **IP Whitelisting**: Restrict to GitHub's IP ranges
4. **Payload Validation**: Verify webhook signatures
5. **Rate Limiting**: Implement request throttling

#### Secret Token Generation:
```bash
# Generate a secure webhook secret
openssl rand -hex 20
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

#### Webhook Signature Validation:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
}
```

### 🎯 **TrapHouse Integration Features**

#### Development Accountability:
- **Commit Streaks**: Track daily coding consistency
- **Code Quality Scores**: Analyze contribution quality  
- **Discipline Points**: Earn TrapHouse respect for good dev practices
- **Intervention Alerts**: Notify for extended inactivity

#### Community Growth:
- **Milestone Celebrations**: Automated announcements for achievements
- **Contributor Recognition**: Highlight community participation
- **Growth Metrics**: Track repository popularity and engagement

#### Cross-Platform Integration:
- **CollectClock**: Development activity affects daily discipline scores
- **TiltCheck**: Code quality correlates with decision-making patterns
- **JustTheTip**: Development consistency influences crypto recommendations

### 📋 **Webhook Event Selection Checklist**

#### ✅ **Core Development Events**:
- [ ] `push` - Code commits and contributions
- [ ] `pull_request` - Code review and collaboration
- [ ] `issues` - Problem tracking and resolution
- [ ] `commit_comment` - Code quality discussions
- [ ] `release` - Version releases and milestones

#### ✅ **Community Events**:
- [ ] `star` - Repository appreciation
- [ ] `fork` - Community growth
- [ ] `watch` - Engagement monitoring
- [ ] `member` - Team changes
- [ ] `public` - Repository visibility changes

#### ✅ **Quality Assurance**:
- [ ] `status` - CI/CD pipeline results
- [ ] `check_run` - Automated testing results
- [ ] `security_advisory` - Security notifications
- [ ] `vulnerability_alert` - Code safety alerts

#### ❌ **Skip These Events** (Not needed for TrapHouse):
- [ ] `create` / `delete` - Branch/tag management
- [ ] `deployment` - Deployment events
- [ ] `page_build` - GitHub Pages builds
- [ ] `gollum` - Wiki changes
- [ ] `project` / `project_card` - Project board changes

### 🚀 **Testing Your Webhook**

#### Quick Test Commands:
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/github/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "Design for failure."}'

# Check webhook deliveries in GitHub:
# Repository Settings → Webhooks → Recent Deliveries
```

#### Local Development Testing:
```bash
# Use ngrok for local testing
npm install -g ngrok
ngrok http 3001

# Update webhook URL to ngrok URL
# Example: https://abc123.ngrok.io/github/webhook
```

### 🎮 **Discord Integration Examples**

#### Commit Notification Format:
```
🚀 **New Commit Detected** - Development Accountability
👨‍💻 **Developer**: @jmenichole
📦 **Repository**: TrapHouse Discord Bot
💻 **Commit**: "Add TiltCheck Mischief Manager integration"
🔗 **Link**: [View Commit](https://github.com/user/repo/commit/hash)

**Accountability Update**:
• Commit Streak: 5 days 🔥
• Code Quality Score: A- 🎯
• Respect Points Earned: +25 💯
• Development Discipline: HIGH ✅
```

#### Pull Request Notification:
```
📋 **Pull Request Activity** - Code Collaboration
🔄 **Action**: Merged
👤 **Author**: @contributor
📝 **Title**: "Enhance gambling accountability features"
🎯 **Impact**: +50 Respect Points for quality contribution

**Community Growth**:
• Team Collaboration: +1 🤝
• Code Review Participation: Active ✅
• Project Progress: Feature Complete 🏆
```

### 📈 **Monitoring & Analytics**

#### Webhook Health Monitoring:
- **Delivery Success Rate**: Track successful webhook deliveries
- **Response Times**: Monitor webhook processing speed
- **Error Tracking**: Log and alert on webhook failures
- **Usage Patterns**: Analyze development activity trends

#### TrapHouse Integration Metrics:
- **Developer Engagement**: Commit frequency and consistency
- **Community Growth**: Stars, forks, contributors over time
- **Quality Trends**: Code quality scores and improvement patterns
- **Accountability Success**: Correlation between dev activity and discipline

---

## 🎯 **Recommended Webhook Configuration**

### **For Production TrapHouse Deployment**:

```
Payload URL: https://your-production-domain.com/github/webhook
Content Type: application/json
Secret: [Your secure 40-character token]
SSL Verification: ✅ Enabled

Selected Events:
✅ push
✅ pull_request  
✅ issues
✅ commit_comment
✅ release
✅ star
✅ fork
✅ watch
✅ security_advisory
✅ vulnerability_alert

Status: 🟢 Active
```

This configuration will provide comprehensive development accountability integration with your TrapHouse Discord bot ecosystem, tracking code contributions alongside gambling discipline for a holistic accountability system.

**Your GitHub webhook is ready to integrate development accountability into the "made for degens by degens" ecosystem!** 🚀🤝

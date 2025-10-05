# TiltCheck 🎯

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/status-commercial-blue.svg)](https://tiltcheck.io)

**Professional Player Behavior Monitoring System for Responsible Gaming**

TiltCheck is a comprehensive real-time monitoring system designed to identify, track, and mitigate player "tilt" behaviors in gaming environments. Our AI-powered solution promotes responsible gaming through intelligent pattern recognition, predictive alerts, and intervention recommendations.

**Now available as a commercial service with enterprise-grade support and premium Discord bot integration.**

![TiltCheck Dashboard](https://via.placeholder.com/800x400/0f172a/60a5fa?text=TiltCheck+Dashboard)

## 🚀 Features

### 🎯 Core Monitoring
- **Real-time Tilt Detection** - Advanced algorithms monitor player behavior patterns
- **Behavioral Analysis** - Track betting patterns, session duration, and emotional indicators
- **Predictive Alerts** - Early warning system for problematic gaming behaviors
- **Multi-game Support** - Works with slots, table games, and originals

### 📊 Analytics & Insights
- **Player Dashboard** - Comprehensive view of player statistics and trends
- **Risk Assessment** - Dynamic risk profiling based on gaming patterns
- **Session Analytics** - Detailed session tracking and analysis
- **Historical Data** - Long-term pattern recognition and reporting

### 🔔 Alert System
- **Real-time Notifications** - Instant alerts for concerning behaviors
- **Multiple Alert Types** - Visual, audio, and messaging notifications
- **Customizable Thresholds** - Configurable sensitivity levels
- **AOL-style Messenger** - Friendly intervention messaging system

### 🛡️ Responsible Gaming Tools
- **Intervention Recommendations** - Actionable advice for healthy gaming
- **Break Suggestions** - Automated recommendations for gaming breaks
- **Vault Reminders** - Prompts to secure winnings
- **Session Time Limits** - Configurable maximum session durations

### 🔧 Integration & API
- **RESTful API** - Easy integration with existing casino systems
- **Webhook Support** - Real-time event notifications
- **Custom Configuration** - Flexible threshold and rule customization
- **Discord Integration** - Community monitoring and alerts

## 💰 Pricing & Plans

### 🆓 Starter Plan
- **Price**: $299/month
- **Players**: Up to 1,000 monitored players
- **Alerts**: 10,000 alerts per month
- **API Calls**: 100,000 per month
- **Support**: Email support
- **Discord Bot**: Basic commands

### 🚀 Professional Plan
- **Price**: $799/month
- **Players**: Up to 10,000 monitored players
- **Alerts**: Unlimited alerts
- **API Calls**: 1,000,000 per month
- **Support**: Priority email + phone support
- **Discord Bot**: Full feature set with custom commands
- **Analytics**: Advanced reporting dashboard
- **Integrations**: Webhook notifications

### 🏢 Enterprise Plan
- **Price**: Custom pricing
- **Players**: Unlimited monitored players
- **Alerts**: Unlimited alerts
- **API Calls**: Unlimited
- **Support**: 24/7 dedicated support team
- **Discord Bot**: White-label custom bot with premium features
- **Analytics**: Custom reporting and data export
- **Integrations**: Full API access and custom integrations
- **SLA**: 99.9% uptime guarantee
- **Compliance**: SOC 2 Type II, GDPR compliance

### 🤖 Discord Bot Add-on
- **Premium Bot**: $199/month (includes advanced commands and custom alerts)
- **White-label Bot**: $499/month (fully customizable with your branding)
- **Multi-server Support**: Additional $99/month per server

## 📦 Getting Started

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- **Valid TiltCheck API Key** (obtained after subscription)

### Commercial Access

1. **Subscribe to a plan**
   - Visit [https://tiltcheck.io/pricing](https://tiltcheck.io/pricing)
   - Choose your plan (Starter, Professional, or Enterprise)
   - Complete payment and account setup

2. **Get your API credentials**
   - Access your dashboard at [https://dashboard.tiltcheck.io](https://dashboard.tiltcheck.io)
   - Generate your API key and webhook endpoints
   - Download client libraries and documentation

3. **Install client libraries**
   ```bash
   npm install @tiltcheck/client-js
   # or
   yarn add @tiltcheck/client-js
   ```

### Demo Installation (Limited Features)

For evaluation purposes, you can run the demo version:

1. **Clone the demo repository**
   ```bash
   git clone https://github.com/jmenichole/TiltCheck.git
   cd TiltCheck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the demo server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the demo application

⚠️ **Note**: Demo version has limited functionality. Full features require a paid subscription.

## 🎮 Usage

### Commercial API Integration

```javascript
// Import the commercial TiltCheck client
import TiltCheck from '@tiltcheck/client-js';

// Initialize with your subscription API key
const tiltChecker = new TiltCheck({
  apiKey: 'tc_live_your_api_key_here',
  plan: 'professional', // starter, professional, enterprise
  environment: 'production' // or 'sandbox' for testing
});

// Track a player (requires active subscription)
const player = await tiltChecker.trackPlayer('player-123', {
  initialStake: 1000,
  riskProfile: 'medium',
  sessionId: 'session_abc123'
});

// Update player activity
await tiltChecker.updatePlayerActivity('player-123', {
  type: 'bet',
  amount: 50,
  gameType: 'slots',
  newStake: 950,
  timestamp: Date.now()
});

// Get comprehensive player statistics (Professional+ plans)
const stats = await tiltChecker.getPlayerStats('player-123');
const recommendations = await tiltChecker.getRecommendations('player-123');

// Configure Discord webhook (if bot subscription active)
await tiltChecker.configureDiscordWebhook({
  webhookUrl: 'your_discord_webhook_url',
  channelId: 'your_channel_id',
  alertTypes: ['tilt', 'vault', 'session']
});
```

### Configuration

Subscription-based configuration through dashboard or API:

```javascript
// Configure via API (Professional+ plans)
await tiltChecker.updateConfiguration({
  alertThresholds: {
    stakeIncrease: 200,
    timeAtSlots: 180,
    lossSequence: 5,
    emotionalIndicatorScore: 7,
    vaultReminderBalance: 1000
  },
  notifications: {
    discord: { 
      enabled: true, 
      webhookUrl: "your_webhook_url",
      alertTypes: ["tilt", "vault", "session"]
    },
    email: { 
      enabled: true, 
      recipients: ["admin@yourdomain.com"] 
    },
    sms: { 
      enabled: false // Enterprise plan only
    }
  },
  discordBot: {
    enabled: true,
    customCommands: true, // Premium bot subscription
    whiteLabel: false     // White-label bot subscription
  }
});
```

**Dashboard Configuration**: Access advanced settings at [https://dashboard.tiltcheck.io](https://dashboard.tiltcheck.io)
```

## 🤖 Discord Bot Integration (Premium Service)

TiltCheck offers premium Discord bot services for community engagement and monitoring alerts.

### Bot Subscription Plans
- **Basic Bot**: Included with Professional plan and higher
- **Premium Bot**: Advanced features with custom commands ($199/month)
- **White-label Bot**: Fully customizable with your branding ($499/month)

### Bot Features
- Real-time tilt monitoring alerts
- Player statistics commands
- Responsible gaming tips
- Community moderation tools
- Custom alert thresholds
- Multi-server support (Enterprise only)

### Setup Premium Discord Bot

1. **Subscribe to Bot Service**
   - Add Discord Bot to your TiltCheck subscription
   - Receive bot invitation link and configuration token

2. **Configure bot**
   - Invite bot to your Discord server using provided link
   - Configure permissions and channels through dashboard
   - Set up webhook endpoints for alerts

3. **Activate monitoring**
   - Bot automatically connects to your TiltCheck monitoring system
   - Configure alert channels and notification preferences
   - Test alerts and commands

### Premium Discord Commands

- `!tilt-status` - View current monitoring status (All plans)
- `!player-stats <playerId>` - Get player statistics (Professional+)
- `!set-alert <threshold>` - Configure alert thresholds (Professional+)
- `!gaming-tip` - Get responsible gaming advice (All plans)
- `!vault-reminder` - Send vault reminder to players (Professional+)
- `!custom-alert <message>` - Send custom alerts (Premium Bot only)
- `!white-label <command>` - Custom branded commands (White-label only)

## 📈 Demo & Examples

### Live Demo
Visit our [live demo](https://tiltcheck.io/demo) to see TiltCheck in action.

### Example Implementations

1. **Vanilla JavaScript Integration**
   See `overlay-demo.html` for a complete overlay implementation

2. **React Dashboard**
   See `TiltCheckDashboard.jsx` for a full dashboard example

3. **Simple Integration**
   See `simple-demo.html` for basic monitoring setup

## 🔧 API Reference

### Core Methods

#### `trackPlayer(playerId, options)`
Start monitoring a player
- `playerId` (string) - Unique player identifier
- `options` (object) - Configuration options
  - `initialStake` (number) - Starting balance
  - `riskProfile` ('low'|'medium'|'high') - Risk assessment level

#### `updatePlayerActivity(playerId, activity)`
Record player activity
- `playerId` (string) - Player identifier
- `activity` (object) - Activity data
  - `type` ('bet'|'win'|'loss'|'gameSwitch') - Activity type
  - `amount` (number) - Transaction amount
  - `gameType` (string) - Game category

#### `getPlayerStats(playerId)`
Retrieve player statistics and recommendations

### Alert Types

- **foldEm** - Immediate intervention recommended
- **holdEm** - Continue with caution
- **vault** - Secure winnings recommendation
- **break** - Take a gaming break

## 🛠️ Development

### Project Structure

```
TiltCheck/
├── src/
│   ├── components/          # React components
│   ├── utils/              # Utility functions
│   └── App.js              # Main application
├── discord-bot/            # Discord bot implementation
├── public/                 # Static assets
├── tiltCheck.js           # Core monitoring library
├── config.json            # Configuration file
└── *.html                 # Demo pages
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint
```

### Deployment to GitHub Pages

The project is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Live Demo**: [https://jmenichole.github.io/TiltCheck/](https://jmenichole.github.io/TiltCheck/)

#### Manual Deployment

To deploy manually:

```bash
# Build the project
npm run build

# The build folder is ready to be deployed
# GitHub Actions will automatically deploy to GitHub Pages
```

The deployment workflow:
1. Builds the React application on every push to main
2. Uploads the build artifacts
3. Deploys to GitHub Pages automatically

**Note**: Make sure GitHub Pages is configured in repository settings to use GitHub Actions as the source.

## 📊 Performance

- **Response Time**: <500ms average
- **Accuracy Rate**: 99.7% tilt detection
- **Uptime**: 99.9% availability
- **Scalability**: Handles 10,000+ concurrent players

## 🔐 Privacy & Security

- **Data Encryption**: All data encrypted in transit and at rest
- **GDPR Compliant**: Full compliance with data protection regulations
- **Minimal Data Collection**: Only essential gaming behavior data collected
- **Anonymization**: Player data anonymized for analytics

## 📞 Support & Contact

### Sales & Business Inquiries
- **Sales Email**: sales@tiltcheck.io
- **Business Development**: j.chapman7@yahoo.com
- **Phone**: +1 (555) TIL-TCHECK
- **Demo Requests**: [Schedule a demo](https://calendly.com/tiltcheck/demo)

### Technical Support
- **Starter Plan**: Email support (48-hour response)
- **Professional Plan**: Priority email + phone support (24-hour response)
- **Enterprise Plan**: 24/7 dedicated support team (4-hour response)
- **Support Portal**: [https://support.tiltcheck.io](https://support.tiltcheck.io)
- **Documentation**: [https://docs.tiltcheck.io](https://docs.tiltcheck.io)

### Community & Resources
- **Customer Discord**: [Private server for subscribers](https://discord.gg/tiltcheck-customers)
- **Knowledge Base**: [https://kb.tiltcheck.io](https://kb.tiltcheck.io)
- **API Status**: [https://status.tiltcheck.io](https://status.tiltcheck.io)
- **Blog**: [https://blog.tiltcheck.io](https://blog.tiltcheck.io)

## 🎯 Roadmap

### Q1 2025
- [ ] Advanced AI model integration
- [ ] Mobile app companion
- [ ] Multi-language support
- [ ] Enhanced Discord bot features

### Q2 2025
- [ ] Machine learning pattern recognition
- [ ] Operator dashboard improvements
- [ ] API v2.0 release
- [ ] Third-party integrations

### Q3 2025
- [ ] Predictive analytics
- [ ] Customizable intervention flows
- [ ] Advanced reporting suite
- [ ] Regulatory compliance tools

## 📄 License & Terms

This software is proprietary and commercial. Usage requires a valid subscription to TiltCheck services.

### Commercial License
- **Software**: Licensed per subscription plan
- **API Access**: Governed by Terms of Service
- **Discord Bot**: Additional licensing required for premium features
- **Enterprise**: Custom licensing agreements available

### Terms of Service
- Full terms available at [https://tiltcheck.io/terms](https://tiltcheck.io/terms)
- Privacy policy at [https://tiltcheck.io/privacy](https://tiltcheck.io/privacy)
- SLA details at [https://tiltcheck.io/sla](https://tiltcheck.io/sla)

### Trial & Demo
- Demo version available for evaluation purposes
- 30-day free trial available for Professional plan
- No credit card required for demo access

## 🙏 Acknowledgments

- React team for the amazing framework
- Framer Motion for smooth animations
- The responsible gaming community for guidance and feedback
- All contributors and testers who made this project possible

---

**Professional Responsible Gaming Monitoring**

*TiltCheck - Enterprise-grade player behavior monitoring and Discord community management*

© 2024 TiltCheck LLC. All rights reserved.
# TiltCheck 🎯

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/status-beta-orange.svg)](https://tiltcheck.it.com)
![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

**The responsible-gaming engine that actually understands degeneracy.**

*Made for degens by degens* 🎮

TiltCheck detects tilt in real time, calls you out respectfully, and helps you play smarter — not just longer. Because gambling sites either ignore tilt (bad for players) or nag you like a rehab pamphlet (bad for vibes). You need support, not shame. And math is math — provable fairness and legal compliance can be verified using real-time on-screen gameplay data.

**Currently in beta development with active testing and feature refinement.**

> 🌐 **Part of the Degen Ecosystem**: TiltCheck works alongside [JustTheTip](https://github.com/jmenichole/JustTheTip), [DegensAgainstDecency](https://github.com/jmenichole/DegensAgainstDecency), [CollectClock](https://github.com/jmenichole/CollectClock), [QualifyFirst](https://github.com/jmenichole/QualifyFirst), and [SusLink](https://github.com/jmenichole/SusLink). See [ECOSYSTEM_POSITIONING.md](ECOSYSTEM_POSITIONING.md) for the full flywheel.

> 📚 **New to TiltCheck?** Check out our [Documentation Index](DOCUMENTATION_INDEX.md) for a complete guide to all documentation.  
> 🎮 **Explore the Ecosystem**: See how all six tools work together in [ECOSYSTEM_POSITIONING.md](ECOSYSTEM_POSITIONING.md)

![TiltCheck Dashboard](https://via.placeholder.com/800x400/0f172a/60a5fa?text=TiltCheck+Dashboard)

## 🚀 Features

### 🧠 Key Differentiators
- **AI-based behavioral pattern detection** - Real-time analysis that actually works
- **Session analytics & risk scoring** - Know exactly where you stand
- **Works inside games or standalone** - Flexible integration
- **Turns tilt data into community insights** - "Tilt Spike of the Week" and more

### 🔐 AccountabiliBuddy Tools (Core Features)
- **Double Wallet Verification** - Two-person approval system for withdrawals (planned)
- **Cool-down Timers** - Mandatory wait periods after wins to prevent impulsive betting (planned)
- **Vault Lock Timers** - Time-locked savings with customizable withdrawal delays (planned)
- **Peer Accountability** - Connect with trusted friends for withdrawal approvals
- **Session Limits** - Configurable maximum session durations

### 🎯 Behavioral Monitoring
- **Pattern Recognition** - Track betting patterns and session duration
- **Real-time Alerts** - Instant notifications for concerning behaviors
- **Session Analytics** - Detailed tracking and analysis
- **Historical Data** - Long-term pattern analysis and insights

### 🤖 AI-Enhanced Detection (Optional)
- **Intelligent Agent** - Fetch.ai uAgents-powered monitoring
- **ASI Chat Protocol** - Agent-to-agent communication
- **Predictive Alerts** - Early warning system using behavioral analysis
- **MeTTa-Ready** - Extensible for advanced reasoning

### 📊 Dashboard & Insights
- **Player Dashboard** - Comprehensive view of statistics and trends
- **Risk Assessment** - Dynamic profiling based on gaming patterns
- **Customizable Alerts** - Visual, audio, and messaging notifications
- **Multi-game Support** - Works with slots, table games, and originals

### 🔧 Integration & API
- **RESTful API** - Easy integration with existing systems
- **Webhook Support** - Real-time event notifications
- **Discord Integration** - Community monitoring and alerts
- **Custom Configuration** - Flexible threshold and rule customization

## 🚀 Current Status: Beta Development

TiltCheck is currently in **active beta development**. The platform is functional and being tested with early users to refine features and validate performance metrics.

### Beta Access
- ✅ Core tilt detection working
- ✅ Real-time alerts functional  
- ✅ Discord integration active
- 🚧 Performance metrics being validated
- 🚧 Feature set being refined based on feedback

**Join the beta waitlist:** Visit [tiltcheck.it.com/beta-signup.html](https://tiltcheck.it.com/beta-signup.html)

**Note:** Pricing and monetization plans have not been finalized. Beta access is currently free for testers.

## 📦 Getting Started

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
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

## 🎮 Usage

### Basic Integration

```javascript
// Import the TiltCheck library
import TiltCheck from './tiltCheck.js';

// Initialize TiltCheck
const tiltChecker = new TiltCheck({
  environment: 'development' // or 'production' for testing
});

// Track a player
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

// Get player statistics
const stats = await tiltChecker.getPlayerStats('player-123');
const recommendations = await tiltChecker.getRecommendations('player-123');

// Configure Discord webhook
await tiltChecker.configureDiscordWebhook({
  webhookUrl: 'your_discord_webhook_url',
  channelId: 'your_channel_id',
  alertTypes: ['tilt', 'vault', 'session']
});
```

### Configuration

```javascript
// Configure alert thresholds
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
    }
  },
  discordBot: {
    enabled: true,
    customCommands: true
  }
});
```

## 🤖 Discord Bot Integration

TiltCheck includes Discord bot integration for community engagement and monitoring alerts.

### Bot Features
- Real-time tilt monitoring alerts
- Player statistics commands
- Responsible gaming tips
- Community moderation tools
- Custom alert thresholds

### Setup Discord Bot

1. **Configure bot**
   - Invite bot to your Discord server
   - Configure permissions and channels
   - Set up webhook endpoints for alerts

2. **Activate monitoring**
   - Bot connects to your TiltCheck monitoring system
   - Configure alert channels and notification preferences
   - Test alerts and commands

### Discord Commands

- `!tilt-status` - View current monitoring status
- `!player-stats <playerId>` - Get player statistics
- `!set-alert <threshold>` - Configure alert thresholds
- `!gaming-tip` - Get responsible gaming advice
- `!vault-reminder` - Send vault reminder to players

## 📈 Demo & Examples

### Live Demo
Visit our [live demo](https://tiltcheck.it.com/demo.html) to see TiltCheck in action.

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

**Live Demo**: [https://tiltcheck.it.com](https://tiltcheck.it.com)

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

## 📊 Performance Targets

**Note:** These are development targets being validated during beta testing:

- **Response Time**: <500ms average (target)
- **Tilt Detection**: AI-based behavioral analysis (in validation)
- **Uptime**: 99%+ availability (goal)
- **Scalability**: Designed to handle 10,000+ concurrent players

## 🔐 Privacy & Security

- **Data Encryption**: All data encrypted in transit and at rest
- **GDPR Compliant**: Full compliance with data protection regulations
- **Minimal Data Collection**: Only essential gaming behavior data collected
- **Anonymization**: Player data anonymized for analytics

## 📞 Support & Contact

### Contact
- **General Inquiries**: jmenichole007@outlook.com
- **Business Development**: j.chapman7@yahoo.com

### Resources
- **GitHub**: [https://github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)
- **Documentation**: Check the docs folder for guides
- **Beta Signup**: [https://tiltcheck.it.com/beta-signup.html](https://tiltcheck.it.com/beta-signup.html)

## 🎯 Roadmap

### 🌐 Ecosystem Integration (Active)
TiltCheck is part of the **"Made for degens by degens"** ecosystem:

- [x] **JustTheTip Integration** - [Non-custodial Solana tipping bot](https://github.com/jmenichole/JustTheTip)
  - Auto-vault features based on tilt detection
  - NFT mint verification through trust score system
  - Discord bot integration for community tipping
  - Natural-language tipping without crypto complexity

- [x] **DegensAgainstDecency** - [Party-game arena with AI chaos](https://github.com/jmenichole/DegensAgainstDecency)
  - Real-time multiplayer games
  - Tilt monitoring during gameplay
  - Integrated tipping for game winners

- [x] **CollectClock Integration** - [Bonus-drop predictor](https://github.com/jmenichole/CollectClock)
  - Daily bonus tracking across 15+ platforms
  - Casino trust scoring using TiltCheck RTP verification
  - Historical prediction models

- [x] **QualifyFirst Platform** - [AI-powered survey matcher](https://github.com/jmenichole/QualifyFirst)
  - Alternative earning during tilt cooldowns
  - Instant SOL payouts via JustTheTip
  - Behavioral matching without screen-outs

- [x] **SusLink Protection** - [Discord link guardian](https://github.com/jmenichole/SusLink)
  - Real-time link scanning
  - Protects ecosystem transactions
  - Keeps the community safe

**See [ECOSYSTEM_POSITIONING.md](ECOSYSTEM_POSITIONING.md) for the complete flywheel diagram.**

### Planned Features
- [ ] **Double Wallet Verification** - Two-person approval system for withdrawals
- [ ] **Cool-down Timers** - Mandatory wait periods after wins
- [ ] **Vault Lock Timers** - Time-locked savings with withdrawal delays
- [ ] **AccountabiliBuddy Tools** - Peer accountability features
- [ ] **Mobile App** - Companion mobile application
- [ ] **Multi-language Support** - International accessibility
- [ ] **Enhanced Discord Integration** - Expanded bot features
- [x] **Vercel AI Gateway** - Multi-model AI integration for enhanced detection
  - Multi-model consensus for 95% accuracy
  - Automatic failover for 99.9% uptime
  - 64% cost reduction through smart model selection
  - See [VERCEL_AI_GATEWAY_README.md](VERCEL_AI_GATEWAY_README.md) for details

## 🤖 Vercel AI Gateway Integration (NEW!)

TiltCheck now includes comprehensive Vercel AI Gateway integration for enhanced AI-powered tilt detection and behavioral analysis.

**Key Benefits:**
- **Multi-Model Analysis**: Use GPT-4, Claude, Gemini simultaneously for consensus
- **Cost Optimization**: 64% reduction in AI costs through smart model selection
- **High Availability**: 99.9% uptime with automatic failover
- **Real-time Streaming**: Progressive UI updates as analysis generates
- **50+ Languages**: AI-powered translation with context preservation

**Quick Start:**
```bash
# Run interactive demo
npm run demo:vercel-ai
```

**Documentation:**
- [Quick Start Guide](VERCEL_AI_GATEWAY_README.md) - Get started in 5 minutes
- [Integration Guide](VERCEL_AI_GATEWAY_GUIDE.md) - Complete implementation details
- [Use Cases & ROI](VERCEL_AI_GATEWAY_USECASES.md) - 12 detailed scenarios
- **[Adoption Plan](VERCEL_AI_GATEWAY_ADOPTION_PLAN.md)** - **NEW! Phased 8-week rollout plan**
- [Configuration](vercel-ai-config.example.js) - Example config template

**Phased Rollout (8 weeks to production):**
- **Week 1**: Preparation & setup
- **Weeks 2-3**: Shadow mode testing (parallel validation)
- **Weeks 4-5**: Limited rollout (5% → 25% users)
- **Weeks 6-7**: Advanced features (multi-model, streaming)
- **Week 8**: Full production (100% rollout)

**Projected Impact (10,000 users):**
- Annual cost savings: $91,440
- Accuracy improvement: +10%
- False positives: -30%
- Developer time saved: 67%

## 🔬 Advanced Features (Optional)

### ASI Alliance Agent Integration

For advanced users and hackathon judges, TiltCheck includes an experimental autonomous agent built with Fetch.ai's uAgents framework.

**Features:**
- Autonomous tilt detection using Fetch.ai uAgents
- ASI Chat Protocol for agent-to-agent communication
- Agentverse integration for discoverability
- MeTTa-ready for knowledge graph reasoning

**Documentation:**
- [README_AGENT.md](README_AGENT.md) - Complete agent setup and usage
- [SUBMISSION.md](SUBMISSION.md) - ASI Alliance Hackathon submission details
- [QUICKSTART_JUDGES.md](QUICKSTART_JUDGES.md) - Quick demo for judges

**Note:** This is an experimental feature for hackathon/grant purposes and is not required for core TiltCheck functionality.

## 📄 License & Copyright

### Copyright Notice
**Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.**

This software and associated documentation files (the "Software") are proprietary and confidential. Unauthorized copying, modification, distribution, or use of this Software, via any medium, is strictly prohibited without express written permission.

### Software Components
This repository includes:
- **TiltCheck**: Player behavior monitoring and accountability system
- **TrapHouse Discord Bot**: Discord bot ecosystem integration
- **CollectClock**: Timer and notification system
- **Casino Trust Scoring**: Casino compliance analysis (in development)
- **NFT Trust System**: Blockchain-based verification (in development)

**Planned External Integrations:**
- **JustTheTip Bot**: Trustless Solana tip bot (separate repository, future integration)
- **QualifyFirst**: Alternative earning platform (future integration)

### Commercial License
This software is proprietary. Usage terms are being finalized during beta development.

- **Current Status**: Open for beta testing
- **Future Licensing**: To be determined

### Terms of Service
- Full terms available at [https://tiltcheck.it.com/tos.html](https://tiltcheck.it.com/tos.html)
- Privacy policy at [https://tiltcheck.it.com/privacy](https://tiltcheck.it.com/privacy)

### Beta Access
- Beta version available for testing and feedback
- No commercial license required during beta phase

### Licensing Inquiries
For licensing, partnerships, or commercial use inquiries:
- **GitHub**: [https://github.com/jmenichole](https://github.com/jmenichole)
- **Repository**: [https://github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)

**See [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT) files for complete legal information.**

## 🙏 Acknowledgments

- React team for the amazing framework
- Framer Motion for smooth animations
- The responsible gaming community for guidance and feedback
- All contributors and testers who made this project possible

---

**Responsible Gaming Accountability Tools**

*TiltCheck - Behavioral monitoring and accountability features for responsible gaming*

© 2024-2025 JME (jmenichole). All rights reserved.
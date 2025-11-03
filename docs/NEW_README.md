# TiltCheck 🎯

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/status-commercial-blue.svg)](https://tiltcheck.io)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](./LICENSE)

**AI-Powered Player Behavior Monitoring for Responsible Gaming**

TiltCheck is a comprehensive real-time monitoring system that combines intelligent tilt detection, blockchain-based trust scoring, and NFT verification to promote responsible gaming across Discord communities and casino platforms.

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Examples](#-usage-examples)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Security](#-security)
- [Contributing](#-contributing)
- [Support](#-support)

---

## ✨ Features

### 🎯 **Core Monitoring**
- **Real-time Tilt Detection** - Advanced behavioral analysis algorithms
- **Multi-game Support** - Slots, table games, and original games
- **Predictive Alerts** - Early warning system for problematic patterns
- **Session Analytics** - Comprehensive session tracking and reporting

### 🔗 **Blockchain Integration**
- **NFT Trust Scores** - On-chain reputation system
- **Solana Integration** - Native Solana Web3 support
- **Wallet Verification** - Secure wallet connection and validation
- **Dynamic NFT Metadata** - Trust scores reflected on-chain

### 🤖 **AI & Automation**
- **Fetch.ai uAgents** - Autonomous monitoring agent
- **ASI Chat Protocol** - Agent-to-agent communication
- **Agentverse Integration** - Discoverable on ASI:One
- **Pattern Recognition** - ML-powered behavior analysis

### 💬 **Discord Integration**
- **Premium Bot** - Full-featured Discord bot
- **Real-time Alerts** - Instant notifications
- **Community Tools** - Moderation and engagement features
- **Custom Commands** - Configurable command sets

### 📊 **Analytics Dashboard**
- **Real-time Metrics** - Live player statistics
- **Historical Analysis** - Long-term pattern tracking
- **Visual Reports** - Charts and graphs
- **Export Capabilities** - Data export for analysis

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Create data directories
mkdir -p data analytics/logs analytics/data

# 5. Start the application
npm start
```

Your TiltCheck instance is now running! 🎉

---

## 📦 Installation

### Standard Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/jmenichole/TiltCheck.git
   cd TiltCheck
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```env
   # API Configuration
   API_KEY=your_api_key_here
   API_ENV=production

   # Discord Bot (Optional)
   DISCORD_TOKEN=your_discord_token
   DISCORD_CLIENT_ID=your_client_id

   # Solana Configuration
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   SOLANA_WALLET_PRIVATE_KEY=your_private_key

   # Database
   MONGODB_URI=mongodb://localhost:27017/tiltcheck

   # Security
   JWT_SECRET=your_jwt_secret_here
   ENCRYPTION_KEY=your_encryption_key
   ```

3. **Initialize Data Directories**
   ```bash
   mkdir -p data analytics/logs analytics/data
   ```

4. **Run Tests** (Optional)
   ```bash
   npm test
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

### Docker Installation

```bash
# Build Docker image
docker build -t tiltcheck:latest .

# Run container
docker run -d \
  --name tiltcheck \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  tiltcheck:latest
```

### Using Docker Compose

```bash
docker-compose up -d
```

---

## ⚙️ Configuration

### Core Configuration

Edit `config.json` to customize thresholds:

```json
{
  "alertThresholds": {
    "stakeIncrease": 200,
    "timeAtSlots": 180,
    "lossSequence": 5,
    "emotionalIndicatorScore": 7,
    "vaultReminderBalance": 1000,
    "rapidBettingThreshold": 10,
    "maxSessionTime": 300
  },
  "notifications": {
    "popup": { "enabled": true },
    "discord": { "enabled": true }
  }
}
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | TiltCheck API key | Yes | - |
| `API_ENV` | Environment (development/production) | No | production |
| `DISCORD_TOKEN` | Discord bot token | No | - |
| `SOLANA_RPC_URL` | Solana RPC endpoint | Yes | mainnet-beta |
| `MONGODB_URI` | MongoDB connection string | No | localhost |
| `JWT_SECRET` | JWT signing secret | Yes | - |

---

## 💻 Usage Examples

### Basic Integration

```javascript
const TiltCheck = require('./tiltCheck');

// Initialize
const tiltChecker = new TiltCheck('your-api-key');

// Track a player
const player = tiltChecker.trackPlayer('player-123', {
  initialStake: 1000,
  riskProfile: 'medium'
});

// Update on each bet
tiltChecker.updatePlayerActivity('player-123', {
  type: 'bet',
  amount: 50,
  gameType: 'slots',
  newStake: 950
});

// Get player stats
const stats = tiltChecker.getPlayerStats('player-123');
console.log('Tilt Risk:', stats.tiltRisk);
```

### With React Component

```javascript
import React, { useState, useEffect } from 'react';
import TiltCheckUI from './TiltCheckUI';

function GameComponent() {
  const [tiltChecker] = useState(() => new TiltCheck('api-key'));
  
  useEffect(() => {
    tiltChecker.trackPlayer('player-123', {
      initialStake: 1000
    });
  }, []);

  return <TiltCheckUI tiltChecker={tiltChecker} playerId="player-123" />;
}
```

### Analytics Logging

```javascript
const AnalyticsLogger = require('./tools/analytics-logger');

const logger = new AnalyticsLogger({
  logPath: './analytics/logs',
  enablePII: false // PII protection enabled
});

// Log a session
logger.logSession('user-123', 'wallet-abc', {
  sessionId: 'session_001',
  initialStake: 1000,
  gameType: 'slots'
});

// Log tilt event
logger.logTiltEvent('user-123', 'warning', {
  tiltScore: 6,
  triggers: ['stakeIncrease', 'lossSequence']
});
```

### Wallet Validation

```javascript
const WalletValidator = require('./tools/wallet-validator');

const validator = new WalletValidator();

// Validate Solana address
const result = validator.validateSolanaAddress(
  '7xKXtg2CW87d97TXJSDpLq2otBKHT8CveFmPY8gSZz8F'
);

if (result.valid) {
  console.log('Valid wallet address');
} else {
  console.log('Errors:', result.errors);
}

// Validate NFT metadata
const metaResult = validator.validateNFTMetadata({
  name: 'TiltCheck Trust NFT',
  symbol: 'TCTRUST',
  uri: 'https://arweave.net/abc123'
});
```

### Security Scanning

```bash
# Run security scanner
node tools/security-scanner.js

# Output will show:
# - API key exposures
# - Unsecured HTTP calls
# - Potential vulnerabilities
```

---

## 📚 Documentation

### Core Documentation

- **[Codebase Summary](./docs/CODEBASE_SUMMARY.md)** - 5-sentence overview and architecture
- **[Trust Score Architecture](./docs/TRUST_SCORE_ARCHITECTURE.md)** - Trust scoring system
- **[React Components Guide](./docs/REACT_COMPONENTS_GUIDE.md)** - State management
- **[Tilt Detection Guide](./docs/guides/ONBOARDING_TILT_DETECTION.md)** - Detection algorithms
- **[Contribution Guidelines](./docs/guides/CONTRIBUTION_GUIDELINES.md)** - How to contribute

### Developer Resources

- **API Reference** - Full API documentation
- **Integration Guides** - Platform-specific guides
- **Security Best Practices** - Security guidelines
- **Testing Guide** - Testing strategies

### Tools Documentation

- **Security Scanner** - `tools/security-scanner.js`
- **Analytics Logger** - `tools/analytics-logger.js`
- **Wallet Validator** - `tools/wallet-validator.js`
- **Changelog Generator** - `tools/changelog-generator.js`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│  React Dashboard │ Discord Bot UI │ Web Components     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    Application Layer                     │
│  TiltCheck Engine │ Trust System │ Analytics Engine    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Integration Layer                      │
│  Solana Web3 │ Discord.js │ MongoDB │ Redis            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Infrastructure Layer                    │
│  Blockchain │ Databases │ Message Queue │ Storage      │
└─────────────────────────────────────────────────────────┘
```

### Key Components

1. **TiltCheck Engine** (`tiltCheck.js`)
   - Real-time monitoring
   - Alert generation
   - Behavioral analysis

2. **Trust Score System** (`userTrustSystem.js`, `nftUserTrustSystem.js`)
   - NFT-based reputation
   - Verified actions tracking
   - Scam reporting

3. **Analytics Engine** (`tools/analytics-logger.js`)
   - Event logging
   - Metrics aggregation
   - PII protection

4. **Security Layer** (`tools/security-scanner.js`, `tools/wallet-validator.js`)
   - Vulnerability scanning
   - Input validation
   - Wallet verification

---

## 🔐 Security

### Security Features

- ✅ **Data Encryption** - All sensitive data encrypted at rest and in transit
- ✅ **Input Validation** - Comprehensive input sanitization
- ✅ **Rate Limiting** - API and bot command rate limiting
- ✅ **XSS Protection** - Cross-site scripting prevention
- ✅ **CSRF Protection** - Cross-site request forgery protection
- ✅ **PII Protection** - Minimal data collection and anonymization
- ✅ **GDPR Compliance** - Full data protection compliance

### Running Security Scans

```bash
# Run security scanner
npm run security:scan

# Run dependency audit
npm audit

# Check for known vulnerabilities
npm run security:check
```

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email security@tiltcheck.io with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](./docs/guides/CONTRIBUTION_GUIDELINES.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
npm test

# Commit with conventional commits
git commit -m "feat: add new tilt detection algorithm"

# Push and create PR
git push origin feature/my-feature
```

### Code Style

- **JavaScript**: ESLint + Prettier
- **Documentation**: Markdown with proper formatting
- **Commits**: Conventional Commits format
- **Tests**: Jest for testing

---

## 📞 Support

### Getting Help

- **Documentation**: [docs/](./docs/)
- **Discord**: [Join our community](https://discord.gg/tiltcheck)
- **GitHub Issues**: For bugs and feature requests
- **Email**: support@tiltcheck.io

### Commercial Support

For commercial inquiries and enterprise support:
- **Sales**: sales@tiltcheck.io
- **Business**: j.chapman7@yahoo.com
- **Enterprise**: enterprise@tiltcheck.io

---

## 📄 License

Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.

This software is proprietary and commercial. Usage requires a valid subscription to TiltCheck services. See [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Solana Foundation for blockchain infrastructure
- Fetch.ai for uAgents framework
- Discord.js for bot integration
- All contributors and testers

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Advanced AI/ML pattern recognition
- [ ] Mobile companion app
- [ ] Multi-language support
- [ ] Enhanced Discord features

### Q2 2025
- [ ] Cross-chain NFT support
- [ ] API v2.0 release
- [ ] Third-party integrations
- [ ] White-label solutions

### Q3 2025
- [ ] Predictive analytics
- [ ] Custom intervention flows
- [ ] Regulatory compliance tools
- [ ] Advanced reporting suite

---

## 📊 Project Status

- **Version**: 2.0.0
- **Status**: Active Development
- **Last Updated**: November 2024
- **Maintainer**: JME (jmenichole)

---

**Built with ❤️ for responsible gaming**

*TiltCheck - Where AI meets responsible gaming*

[![GitHub](https://img.shields.io/badge/GitHub-jmenichole%2FTiltCheck-blue)](https://github.com/jmenichole/TiltCheck)
[![Documentation](https://img.shields.io/badge/Docs-Online-green)](./docs/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-purple)](https://discord.gg/tiltcheck)

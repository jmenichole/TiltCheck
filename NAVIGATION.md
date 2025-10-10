# TiltCheck Navigation Guide

Quick links to find files and functionality in the organized repository.

## 🚀 Getting Started

- **Main Documentation**: [README.md](README.md)
- **Project Structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick Start**: [docs/QUICK_START.md](docs/QUICK_START.md)

## 📦 Core Components

### Discord Bot
- **Main Entry Point**: [bot.js](bot.js)
- **Bot Modules**: [src/bot/](src/bot/)
- **Commands**: [commands/](commands/)
- **Events**: [events/](events/)

### Web Application
- **Next.js App**: [webapp/](webapp/)
- **Landing Pages**: [landing-pages/](landing-pages/)
- **Public Files**: [public/](public/)

### Browser Extension
- **Extension Files**: [extension-screen-reader/](extension-screen-reader/)
- **Install Guide**: [tiltcheck-organized/CHROME_EXTENSION_MAC_INSTALL.md](tiltcheck-organized/CHROME_EXTENSION_MAC_INSTALL.md)

## 🔧 Development

### Source Code
- **Bot Implementation**: [src/bot/](src/bot/)
- **Core Libraries**: [src/lib/](src/lib/)
- **Backend Services**: [src/services/](src/services/)
- **Utilities**: [src/utils/](src/utils/)
- **API Endpoints**: [src/api/](src/api/)

### Testing
- **All Tests**: [tests/](tests/)
- **Test Scripts**: [scripts/testing/](scripts/testing/)

### Configuration
- **Config Files**: [config/](config/)
- **Environment Templates**: `.env.example`, `.env.template`

## 📚 Documentation

### Guides
- **Complete Guide**: [tiltcheck-organized/docs/COMPLETE_GUIDE.md](tiltcheck-organized/docs/COMPLETE_GUIDE.md)
- **Setup Guide**: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
- **Testing Guide**: [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)

### Deployment
- **Deployment Guide**: [tiltcheck-organized/docs/DEPLOYMENT_GUIDE.md](tiltcheck-organized/docs/DEPLOYMENT_GUIDE.md)
- **VPS Setup**: [tiltcheck-organized/docs/VPS_SETUP_GUIDE.md](tiltcheck-organized/docs/VPS_SETUP_GUIDE.md)
- **Quick Deployment**: [tiltcheck-organized/docs/QUICK_FREE_DEPLOYMENT.md](tiltcheck-organized/docs/QUICK_FREE_DEPLOYMENT.md)

### Integration
- **TiltCheck Integration**: [tiltcheck-organized/docs/TILTCHECK_INTEGRATION.md](tiltcheck-organized/docs/TILTCHECK_INTEGRATION.md)
- **Ecosystem Integration**: [tiltcheck-organized/docs/ECOSYSTEM_INTEGRATION.md](tiltcheck-organized/docs/ECOSYSTEM_INTEGRATION.md)
- **GitHub Integration**: [tiltcheck-organized/docs/GITHUB_INTEGRATION.md](tiltcheck-organized/docs/GITHUB_INTEGRATION.md)

### API & Technical
- **API Documentation**: [docs/api/](docs/api/)
- **Technical Documentation**: [tiltcheck-organized/docs/TILTCHECK_TECH_DOCUMENTATION.md](tiltcheck-organized/docs/TILTCHECK_TECH_DOCUMENTATION.md)

## 🛠️ Scripts

### Deployment
- **Deployment Scripts**: [scripts/deployment/](scripts/deployment/)
- **VPS Deploy**: `scripts/deployment/vps-deploy.sh`
- **Auto Deploy**: `scripts/deployment/auto-deploy-vps.sh`

### Setup
- **Setup Scripts**: [scripts/setup/](scripts/setup/)
- **Quick Setup**: `scripts/setup/quick-start.sh`

### Testing
- **Test Scripts**: [scripts/testing/](scripts/testing/)

### Start Scripts
- **Start Bot**: `scripts/start_bot.sh`
- **Start All**: `npm run start:all`

## 🔍 Find Specific Features

### TiltCheck Features
- **TiltCheck Bot**: [src/bot/tiltCheckBot.js](src/bot/tiltCheckBot.js)
- **TiltCheck Integration**: [src/lib/tiltCheckIntegration.js](src/lib/tiltCheckIntegration.js)
- **Verification System**: [src/lib/tiltCheckVerificationSystem.js](src/lib/tiltCheckVerificationSystem.js)
- **Strategy Coach**: [src/lib/tiltcheck_strategy_coach.js](src/lib/tiltcheck_strategy_coach.js)

### Crypto & Payments
- **Crypto Utils**: [src/lib/cryptoUtils.js](src/lib/cryptoUtils.js)
- **Payment Wallets**: [src/lib/cryptoPaymentWallets.js](src/lib/cryptoPaymentWallets.js)
- **Tip Manager**: [src/lib/enhancedCryptoTipManager.js](src/lib/enhancedCryptoTipManager.js)
- **Just The Tip Bot**: [src/bot/justTheTipBot.js](src/bot/justTheTipBot.js)

### Casino Features
- **Casino API**: [src/lib/casinoApiConnector.js](src/lib/casinoApiConnector.js)
- **Transparency Analyzer**: [src/lib/casino_transparency_analyzer.js](src/lib/casino_transparency_analyzer.js)

### CollectClock
- **CollectClock Integration**: [src/lib/collectClockIntegration.js](src/lib/collectClockIntegration.js)
- **OAuth Handler**: [src/lib/collectClockOAuthHandler.js](src/lib/collectClockOAuthHandler.js)

### Trust & Reputation
- **User Trust System**: [src/lib/userTrustSystem.js](src/lib/userTrustSystem.js)
- **NFT Trust**: [src/lib/tiltcheck_nft_legal_system.js](src/lib/tiltcheck_nft_legal_system.js)

### Card Game
- **Degens Card Game**: [src/lib/degensCardGame.js](src/lib/degensCardGame.js)
- **TiltCheck Card Game**: [src/lib/tiltCheckCardGame.js](src/lib/tiltCheckCardGame.js)

## 🔐 Security & Validation

- **Validation Utils**: [src/utils/validate-*.js](src/utils/)
- **Security Analysis**: [tiltcheck-organized/docs/SECURITY_ANALYSIS.md](tiltcheck-organized/docs/SECURITY_ANALYSIS.md)
- **Unicode Security**: [tiltcheck-organized/docs/UNICODE_SECURITY_COMPLETE.md](tiltcheck-organized/docs/UNICODE_SECURITY_COMPLETE.md)

## 📊 Data & Storage

- **Storage Module**: [storage.js](storage.js)
- **Data Directory**: [data/](data/)
- **User Data**: `data/user_data.json`
- **Loans Data**: `data/loans.json`

## 🌐 Services & Servers

- **Main Services**: [src/services/](src/services/)
- **Webhook Server**: [src/services/webhookServer.js](src/services/webhookServer.js)
- **GitHub Webhook**: [src/services/github-webhook-server.js](src/services/github-webhook-server.js)
- **Beta Testing**: [src/services/beta-testing-server.js](src/services/beta-testing-server.js)

## 📱 Integrations

- **Integrations Root**: [integrations/](integrations/)
- **Integration Bridge**: [integrations/shared/integration-bridge.js](integrations/shared/integration-bridge.js)

## 📝 Package Scripts

Quick reference for npm scripts:

```bash
# Start
npm start              # Start main bot
npm run start:all      # Start all services

# Development
npm run dev            # Development mode with hot reload

# Testing
npm run test:all       # Run all tests
npm run health         # Check service health

# Maintenance
npm run status         # Check running processes
npm run stop           # Stop all services
npm run clean          # Clean and reinstall dependencies
```

## 🗺️ Folder Tree

```
TiltCheck/
├── src/              # Organized source code
├── scripts/          # Organized scripts
├── tests/            # All tests
├── docs/             # Root documentation
├── config/           # Configuration files
├── public/           # Static web files
├── commands/         # Bot commands
├── events/           # Event handlers
├── helpers/          # Helper modules
├── utils/            # Shared utilities
├── webhooks/         # Webhook handlers
├── data/             # Runtime data
├── webapp/           # Next.js application
├── extension-screen-reader/  # Browser extension
└── tiltcheck-organized/      # Legacy organized files
```

## 💡 Tips

1. **Can't find something?** Use `grep -r "searchterm" src/` to search source code
2. **Need documentation?** Check `docs/` first, then `tiltcheck-organized/docs/`
3. **Looking for examples?** Check `public/` for HTML demos
4. **Want to add tests?** Put them in `tests/` directory
5. **Adding scripts?** Put them in appropriate `scripts/` subdirectory

## 🔄 Migration Status

The repository has been reorganized from a flat structure. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for details.

If you're looking for a file that used to be in root:
- **Markdown docs** → `docs/` or `tiltcheck-organized/docs/`
- **JavaScript files** → `src/bot/`, `src/lib/`, `src/services/`, or `src/utils/`
- **Shell scripts** → `scripts/deployment/`, `scripts/setup/`, or `scripts/testing/`
- **HTML files** → `public/`
- **Config files** → `config/`
- **Test files** → `tests/`

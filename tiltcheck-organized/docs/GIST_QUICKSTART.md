# 🎯 TrapHouse Discord Bot - Quick Start Gist

## "Made for Degens by Degens" Ecosystem

A complete Discord bot ecosystem featuring:
- **TrapHouse** - Main bot with accountability features
- **CollectClock** - Daily bonus tracking for 15 gambling platforms
- **TiltCheck** - Gambling accountability with "Mischief Manager" personality
- **JustTheTip** - Multi-chain crypto recommendations

## 🚀 Quick Setup

```bash
# Clone the repository
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck

# Install dependencies
npm install

# Copy environment template
cp .env.template .env

# Configure your environment variables
nano .env
```

## 🔧 Required Environment Variables

```bash
# Discord Bot Tokens
DISCORD_BOT_TOKEN=your_main_bot_token
COLLECTCLOCK_DISCORD_BOT_TOKEN=your_collectclock_token
DEGENS_DISCORD_BOT_TOKEN=your_degens_token

# GitHub Integration (Optional)
GITHUB_ACCESS_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret

# Payment Integration (Optional)
STRIPE_SECRET_KEY=your_stripe_key
TIPCC_API_KEY=your_tipcc_key
```

## 🌐 Ngrok Setup for Local Development

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start ngrok tunnel
ngrok http 3001

# Update webhook URLs with your ngrok URL
# Example: https://abc123.ngrok-free.app
```

## 🎰 CollectClock Platforms

Tracks daily bonuses for:
- Stake.com
- Rollbit.com  
- BC.Game
- Roobet.com
- And 11 more platforms!

## 🔐 Security Features

- Unicode attack resistance
- Input sanitization
- Rate limiting
- Secure token storage
- GitHub OAuth integration

## 📚 Documentation

- [Complete Setup Guide](https://github.com/jmenichole/TiltCheck/blob/main/README.md)
- [GitHub OAuth Setup](https://github.com/jmenichole/TiltCheck/blob/main/GITHUB_OAUTH_SETUP.md)
- [Ecosystem Integration](https://github.com/jmenichole/TiltCheck/blob/main/ECOSYSTEM_COMPLETE.md)

## 🎯 Features

### TrapHouse Main Bot
- Lending system with interest tracking
- User reputation management
- Payment processing (Stripe + TipCC)
- Administrative controls

### CollectClock Integration
- Daily bonus reminders
- Streak tracking
- Platform-specific optimizations
- Automated scheduling

### TiltCheck Mischief Manager
- Real-time gambling session monitoring
- Intervention system with personality
- Loss tracking and alerts
- Accountability partnerships

### JustTheTip Crypto Bot
- Multi-chain tipping (ETH, BTC, MATIC, BNB)
- Vault recommendations
- Discipline-based suggestions
- Integration with gambling patterns

## 🚀 Start the Ecosystem

```bash
# Start all bots
npm start

# Start in development mode
npm run dev

# Docker deployment
npm run docker:build
npm run docker:run
```

## 🤝 Contributing

Built for the degen community, by the degen community. 

**Disclaimer**: Use responsibly. Gambling can be addictive.

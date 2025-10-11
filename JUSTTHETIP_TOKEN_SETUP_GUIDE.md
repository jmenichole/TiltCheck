# JustTheTip Token System Setup Guide
# Alternative to Collab.Land SmartTag with Responsible Gaming Features

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Discord Bot created in Discord Developer Portal
- Solana wallet with some SOL for transactions
- Basic familiarity with Discord bots

### Installation

1. **Clone and Setup**
```bash
# Clone the JustTheTip token system files
git clone https://github.com/yourusername/justthetip-tokens
cd justthetip-tokens
npm install

# Copy configuration template
cp .env.justthetip.example .env.justthetip
```

2. **Discord Bot Setup**
```bash
# Create a new application at https://discord.com/developers/applications
# Go to Bot section and create a bot
# Copy the bot token to your .env.tilttag file

# Bot Permissions Required:
# - Send Messages
# - Use Slash Commands  
# - Read Message History
# - Add Reactions
# - Embed Links
```

3. **Configure Tokens and Limits**
```javascript
// Edit .env.tilttag file:
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

// Set responsible gaming limits:
DEFAULT_DAILY_TIP_LIMIT=100        // Max tokens user can tip per day
DEFAULT_WEEKLY_RECEIVE_LIMIT=500   // Max tokens user can receive per week
TILT_PROTECTION_ENABLED=true       // Enable behavioral monitoring
```

4. **Launch the Bot**
```bash
npm start
# or for development:
npm run dev
```

### Key Features vs Collab.Land SmartTag

| Feature | JustTheTip (Free) | Collab.Land SmartTag (Paid) |
|---------|----------------|------------------------------|
| Smart Accounts | ✅ Automatic creation | ✅ Automatic creation |
| Token Tipping | ✅ With limits | ✅ Basic tipping |
| NFT Support | ✅ + DegenTrust integration | ✅ Basic NFT trading |
| Responsible Gaming | ✅ Built-in protections | ❌ Not available |
| Custom Sound System | ✅ blackjackson sounds | ❌ No audio features |
| Community Revenue | ✅ 2% customizable fee | ✅ 2% fixed fee |
| Self-Hosted | ✅ Full control | ❌ SaaS only |
| Subscription Cost | ✅ Free & Open Source | ❌ Requires Exclusive plan |

### Discord Commands

Once setup, users can use these commands in your Discord:

```
/jtt-balance                  - Check account balance and gaming insights
/jtt-send @user 10 SOL       - Send 10 SOL to another user
/jtt-deposit                  - Get wallet address to fund account
/jtt-withdraw addr 5 USDC     - Withdraw 5 USDC to external wallet
/jtt-nft-balance              - Check NFT holdings
/jtt-send-nft @user ...       - Send NFT to another user
/jtt-raindrop 100 SOL 10      - Create 100 SOL giveaway for 10 minutes (Admin)
/jtt-limits view              - Check responsible gaming limits
/jtt-help                     - Get full help guide
```

### Responsible Gaming Features

JustTheTip includes built-in protections that Collab.Land SmartTag lacks:

1. **Daily Tip Limits**: Prevent users from tipping excessive amounts
2. **Weekly Receive Limits**: Protect against accumulation issues  
3. **Behavioral Integration**: Links with TiltCheck monitoring systems
4. **Intervention Alerts**: Warns users approaching limits
5. **Support Resource Links**: Directs users to help when needed

### Integration with Existing Systems

JustTheTip integrates seamlessly with:
- **TiltCheck Community Forum**: User profiles link to tip history
- **DegenTrust NFT Verification**: Verified users get enhanced privileges
- **Sound System**: blackjackson's audio enhances user experience
- **Transparency Reports**: All transactions logged for community trust

### Advanced Configuration

#### Custom Token Support
```javascript
// Add your community token to .env.tilttag:
"COMMUNITY": {
  "name": "Community Token", 
  "decimals": 9,
  "mintAddress": "your_token_mint_address"
}
```

#### Behavioral Monitoring Integration
```javascript
// Enable TiltCheck integration:
TILTCHECK_INTEGRATION_ENABLED=true
TILTCHECK_API_ENDPOINT=https://api.tiltcheck.io
BEHAVIORAL_ALERTS_ENABLED=true
```

#### NFT Verification Setup
```javascript
// Configure DegenTrust NFT collection:
DEGENTRUST_COLLECTION_ADDRESS=your_collection_address
NFT_VERIFICATION_BENEFITS=enhanced_posting,priority_support,beta_access
```

### Security Best Practices

1. **Wallet Security**: Use a dedicated hot wallet for bot operations
2. **Rate Limiting**: Enable rate limiting to prevent abuse
3. **Transaction Monitoring**: Log all transactions for audit trails  
4. **User Verification**: Require NFT verification for high-value operations
5. **Regular Backups**: Backup user account data regularly

### Support and Documentation

- **GitHub Repository**: Full source code and issues
- **Community Forum**: Get help from other TiltTag users
- **Discord Support**: Join our support server
- **Video Tutorials**: Step-by-step setup guides

### Migration from Collab.Land

If you're currently using Collab.Land SmartTag:

1. **Export User Data**: Contact Collab.Land for user wallet addresses
2. **Import to TiltTag**: Use our migration script to create accounts
3. **Notify Users**: Inform community about the switch and new features
4. **Gradual Rollout**: Enable features progressively to ensure smooth transition

### Why Choose JustTheTip?

✅ **Free & Open Source** - No subscription fees like Collab.Land Exclusive plans
✅ **Responsible Gaming** - Built-in protections for community wellbeing
✅ **Full Customization** - Modify features to fit your community's needs
✅ **Enhanced Audio** - blackjackson's sound system integration
✅ **Community Focus** - Built by gamers, for gaming communities
✅ **Transparent Development** - Open source with community input

### Getting Help

- Discord: Join our support server
- GitHub Issues: Report bugs or request features  
- Email: support@tiltcheck.io
- Community Forum: https://tiltcheck.io/community-forum.html

---

**JustTheTip Token System: The Responsible Gaming Alternative to Collab.Land SmartTag**

*Built with ❤️ by the TiltCheck team | Sound by blackjackson*
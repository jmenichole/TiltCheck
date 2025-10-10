# 🏠 TrapHouse Discord Bot Invite URLs

## Current Invite (Administrator - Use with caution)
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=8&integration_type=0&scope=bot
```

## Recommended Secure Invite (Specific Permissions)
```
https://discord.com/oauth2/authorize?client_id=1354450590813655142&permissions=414539926592&scope=bot
```

## Permission Breakdown for TrapHouse Bot:

### Required Permissions:
- **Send Messages** (2048) - Core bot functionality
- **Embed Links** (16384) - Rich embeds for loan info
- **Read Message History** (65536) - Context for commands
- **Use External Emojis** (262144) - Enhanced UI
- **Add Reactions** (64) - Interactive responses
- **Manage Messages** (8192) - Clean up bot messages
- **Attach Files** (32768) - Send loan documents/receipts
- **Use Slash Commands** (2147483648) - Modern Discord commands
- **Connect** (1048576) - Voice channel access if needed
- **Speak** (2097152) - Voice announcements if needed
- **Send Messages in Threads** (274877906944) - Thread support

### Total Permission Value: 414539926592

## Quick Setup Commands:

### 1. Invite Bot to Server
Click one of the invite links above or use this command format:
```
/invite @TrapHouseBot
```

### 2. Test Bot Connection
```bash
cd /Users/fullsail/Desktop/traphouse_discordbot
node test_traphouse_token.js
```

### 3. Start TrapHouse Bot
```bash
cd /Users/fullsail/Desktop/traphouse_discordbot
node main.js
```

## Bot Status Check:
- **Token**: DISCORD_BOT_TOKEN ✅
- **Client ID**: 1354450590813655142 ✅
- **Permissions**: Ready for invite ✅

## Features Available After Invite:
- 💰 Loan management system
- 💳 tip.cc payment integration  
- 📊 Respect point tracking
- 👑 Role management
- 🛡️ Unicode-safe storage
- 💸 Payment webhooks
- 📈 User analytics

## Commands After Invite:
- `!loan` - Loan system commands
- `!respect` - Respect point system
- `!pay` - Payment commands
- `!admin` - Admin functions
- `!help` - Show all commands

## Security Notes:
- Use specific permissions instead of Administrator for production
- Monitor bot usage and permissions regularly
- Keep bot token secure in .env file
- Enable 2FA on Discord developer account

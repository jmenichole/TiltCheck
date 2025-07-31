# 🃏 Degens Against Decency - Setup Instructions

## Prerequisites
1. **Node.js** (v16 or higher)
2. **Discord Bot Token** from Discord Developer Portal
3. **Server permissions** for the bot

## Quick Setup

### 1. Install Dependencies
```bash
cd degens_bot
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Discord bot token
nano .env
```

### 3. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application
3. Go to "Bot" section
4. Create a bot and copy the token
5. Paste the token in your `.env` file

### 4. Bot Permissions
Your bot needs these permissions:
- ✅ Send Messages
- ✅ Use Slash Commands
- ✅ Send Messages in Threads
- ✅ Embed Links
- ✅ Read Message History
- ✅ Use External Emojis
- ✅ Add Reactions

### 5. Run the Bot
```bash
npm start
# or for development
npm run dev
```

## Discord Bot Invite

Generate an invite link with these scopes:
- `bot`
- `applications.commands`

And these permissions:
- Send Messages (2048)
- Embed Links (16384)
- Read Message History (65536)
- Use External Emojis (262144)
- Add Reactions (64)

**Example Invite URL:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=345088&scope=bot%20applications.commands
```

## Commands Overview

### Game Commands
- `!dad start` - Start a new game (3-10 players)
- `!dad join` - Join the current game
- `!dad hand` - View your cards via DM
- `!dad play 1 3` - Play cards 1 and 3 from your hand
- `!dad judge 2` - Judge picks combination 2 as winner
- `!dad scores` - Show current scores
- `!dad status` - Show game status
- `!dad stop` - End the current game

### Custom Content
- `!dad addblack Why is _ so _?` - Add custom black card
- `!dad addwhite your mom` - Add custom white card

### Information
- `!dad help` - Show all commands
- `!dad rules` - Show game rules
- `!dad about` - About the bot

## Game Flow

1. **Start**: Someone uses `!dad start`
2. **Join**: 2-9 other players use `!dad join`
3. **Begin**: Game auto-starts or host uses `!dad begin`
4. **Play**: Players get cards via DM, submit with `!dad play`
5. **Judge**: Rotating judge picks funniest combination
6. **Win**: First to 5 points wins!

## Content Warning ⚠️

This bot contains **highly offensive**, **NSFW**, and **inappropriate** content including:
- Dark humor
- Sexual references  
- Offensive stereotypes
- Vulgar language
- Adult themes

**Use only in appropriate channels and communities that consent to this content.**

## Troubleshooting

### Bot doesn't respond
1. Check bot token in `.env`
2. Ensure bot has permissions in the channel
3. Check bot is online in Discord

### Cards not loading
1. Ensure `cardSets/` folder exists
2. Check `black_cards.json` and `white_cards.json` are present
3. Restart the bot

### Permission errors
1. Re-invite bot with proper permissions
2. Check channel-specific permissions
3. Ensure bot role is high enough in server hierarchy

### Custom cards not saving
1. Check file permissions in `cardSets/` folder
2. Ensure bot has write permissions
3. Check disk space

## File Structure
```
degens_bot/
├── main.js              # Main bot file
├── gameManager.js       # Game logic handler
├── package.json         # Dependencies
├── .env                 # Environment variables (create this)
├── cardSets/
│   ├── black_cards.json # Black card prompts
│   ├── white_cards.json # White card responses  
│   └── custom_cards.json # User-added cards
└── README.md           # This file
```

## Support

This bot is provided as-is for entertainment purposes. Use responsibly and ensure all participants consent to the content.

**Remember: This is an offensive humor game. Use appropriate judgment about where and with whom you play.**

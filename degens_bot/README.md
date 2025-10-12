---
**Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.**  
*This software is proprietary. See [LICENSE](../LICENSE) and [COPYRIGHT](../COPYRIGHT) for details.*

---

# 🃏 Degens Against Decency

**A Discord bot adaptation of Cards Against Humanity for the most degenerate communities on the internet.**

⚠️ **WARNING**: This bot contains highly offensive, NSFW, and inappropriate content. Use only in appropriate communities that consent to this type of humor.

## 🎮 Features

- **Full Cards Against Humanity Gameplay**: Complete game mechanics with black cards, white cards, judging, and scoring
- **Discord Integration**: DM-based hand management, embed-rich displays, and server-wide gameplay
- **Custom Cards**: Players can add their own offensive black and white cards
- **Multi-Server Support**: Each Discord server gets its own independent game instance
- **Rotating Judges**: Fair gameplay with automatic judge rotation
- **Score Tracking**: First player to 5 points wins the game
- **Game Management**: Start, stop, join, and monitor games with easy commands

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)

### Installation
```bash
# Clone or download the degens_bot folder
cd degens_bot

# Install dependencies  
npm install

# Setup environment
cp .env.example .env
# Edit .env and add your DEGENS_BOT_TOKEN

# Start the bot
npm start
```

### Discord Bot Setup
1. Create application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot user and copy the token
3. Invite bot with permissions: Send Messages, Embed Links, Read Message History, Use External Emojis, Add Reactions
4. Add token to `.env` file as `DEGENS_BOT_TOKEN=your_token_here`

## 🎯 How to Play

### Game Commands
- `!dad start` - Start a new game (requires 3-10 players)
- `!dad join` - Join the current game  
- `!dad hand` - View your cards (sent via DM)
- `!dad play 1 3` - Play cards 1 and 3 from your hand
- `!dad judge 2` - Judge picks combination 2 as winner
- `!dad scores` - Show current game scores
- `!dad status` - Show game information
- `!dad stop` - End the current game

### Custom Content
- `!dad addblack Why is _ so _?` - Add custom black card (use _ for blanks)
- `!dad addwhite your mom` - Add custom white card response

### Information  
- `!dad help` - Show all available commands
- `!dad rules` - Display detailed game rules
- `!dad about` - About the bot and content warnings

### Gameplay Flow
1. **Start**: A player uses `!dad start` to begin a new game
2. **Join**: 2-9 additional players use `!dad join` (3-10 players total)
3. **Rounds**: Game automatically begins and deals 7 white cards to each player
4. **Judge**: One player is the judge each round (rotates automatically)
5. **Play**: Non-judge players submit white cards to fill in the black card blanks
6. **Judge**: Judge picks the funniest/most offensive combination
7. **Score**: Winner gets a point, first to 5 points wins the game!

## 🃏 Card System

### Black Cards (Prompts)
- Fill-in-the-blank statements or questions
- Use underscores (_) to indicate where players fill in responses
- Examples: "Why can't I sleep at night? _", "_ + _ = _"

### White Cards (Responses)  
- Nouns, phrases, or responses that complete black cards
- Range from mildly inappropriate to extremely offensive
- Players submit these to complete the prompts

### Custom Cards
Players can add their own cards during gameplay:
- Black cards must contain at least one underscore (_)
- White cards can be any phrase or word
- Custom cards are saved and reused in future games

## ⚠️ Content Warning

This bot is designed for mature audiences and contains:
- **Highly offensive humor**
- **NSFW sexual content**  
- **Dark themes and references**
- **Vulgar language**
- **Inappropriate stereotypes**
- **Adult themes**

**Use responsibly and ensure all participants consent to this type of content.**

## 🛠️ Technical Details

### File Structure
```
degens_bot/
├── main.js              # Main bot entry point
├── gameManager.js       # Complete game logic and state management  
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (create from .env.example)
├── SETUP.md            # Detailed setup instructions
├── cardSets/
│   ├── black_cards.json # 100+ black card prompts
│   ├── white_cards.json # 200+ white card responses
│   └── custom_cards.json # User-added custom cards
└── README.md           # This file
```

### Dependencies
- **discord.js**: Discord API integration
- **dotenv**: Environment variable management
- **nodemon**: Development auto-restart (dev dependency)

### Game State Management
- Each Discord server maintains independent game state
- In-memory game storage with automatic cleanup
- Hand management via Discord DMs
- Real-time scoring and progress tracking

## 🎲 Game Mechanics

### Players
- **Minimum**: 3 players
- **Maximum**: 10 players  
- **Optimal**: 4-8 players for best experience

### Rounds
- Each round has one rotating judge
- Non-judge players submit white cards
- Judge picks winning combination
- Winner receives 1 point

### Victory
- First player to reach **5 points** wins
- Game automatically ends and displays winner
- New game can be started immediately

### Card Management
- Players always have 7 white cards in hand
- Cards automatically replenished after playing
- Black cards randomly selected each round
- Custom cards mixed with default sets

## 🔧 Development

### Scripts
```bash
npm start        # Production start
npm run dev      # Development with auto-restart
npm run setup    # First-time setup helper
```

### Adding Cards
Cards can be added via:
1. **In-game commands**: `!dad addblack` and `!dad addwhite`
2. **Direct file editing**: Modify JSON files in `cardSets/`
3. **Pull requests**: Contribute to the main card collection

### Extending Features
The modular design allows easy extension:
- `gameManager.js`: Core game logic
- `main.js`: Command handling and Discord integration
- Card sets: JSON files for easy modification

## � License

MIT License - Use, modify, and distribute as needed.

## 🤝 Contributing

This bot is part of the larger TrapHouse Discord Bot ecosystem. Contributions welcome for:
- Additional card content
- Bug fixes and improvements  
- New game features
- Code quality enhancements

## ⚖️ Disclaimer

This bot is provided for entertainment purposes only. The developers are not responsible for any offense caused by the content. Users are responsible for ensuring appropriate use within their communities.

**Play responsibly. Offend responsibly. Be a degenerate responsibly.**

---

*Degens Against Decency - Where good taste goes to die. 🃏*

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');
const TiltCheckCardGame = require('./tiltCheckCardGame');

// ========== TILT CHECK THEMED BOT ==========
// A poker/gambling-themed Discord bot with tilt management features

// Tilt levels and their effects
const TILT_LEVELS = {
    CALM: { level: 0, name: 'Calm', emoji: '😌', multiplier: 1.0, color: 0x00ff00 },
    ANNOYED: { level: 1, name: 'Annoyed', emoji: '😤', multiplier: 0.9, color: 0xffff00 },
    FRUSTRATED: { level: 2, name: 'Frustrated', emoji: '😠', multiplier: 0.8, color: 0xff8800 },
    TILTED: { level: 3, name: 'Tilted', emoji: '🤬', multiplier: 0.6, color: 0xff4400 },
    MEGA_TILT: { level: 4, name: 'Mega Tilt', emoji: '💥', multiplier: 0.4, color: 0xff0000 }
};

// Poker hand rankings for games
const POKER_HANDS = [
    'High Card', 'Pair', 'Two Pair', 'Three of a Kind', 
    'Straight', 'Flush', 'Full House', 'Four of a Kind', 
    'Straight Flush', 'Royal Flush'
];

class TiltCheckManager {
    constructor() {
        this.userTiltData = new Map();
        this.activeGames = new Map();
    }

    getTiltLevel(userId) {
        const data = this.userTiltData.get(userId) || { tiltPoints: 0, lastUpdate: Date.now() };
        
        // Decay tilt over time (1 point per hour)
        const hoursPassed = (Date.now() - data.lastUpdate) / (1000 * 60 * 60);
        data.tiltPoints = Math.max(0, data.tiltPoints - Math.floor(hoursPassed));
        data.lastUpdate = Date.now();
        
        this.userTiltData.set(userId, data);

        if (data.tiltPoints >= 100) return TILT_LEVELS.MEGA_TILT;
        if (data.tiltPoints >= 75) return TILT_LEVELS.TILTED;
        if (data.tiltPoints >= 50) return TILT_LEVELS.FRUSTRATED;
        if (data.tiltPoints >= 25) return TILT_LEVELS.ANNOYED;
        return TILT_LEVELS.CALM;
    }

    addTilt(userId, points) {
        const data = this.userTiltData.get(userId) || { tiltPoints: 0, lastUpdate: Date.now() };
        data.tiltPoints = Math.min(100, data.tiltPoints + points);
        data.lastUpdate = Date.now();
        this.userTiltData.set(userId, data);
        return this.getTiltLevel(userId);
    }

    reduceTilt(userId, points) {
        const data = this.userTiltData.get(userId) || { tiltPoints: 0, lastUpdate: Date.now() };
        data.tiltPoints = Math.max(0, data.tiltPoints - points);
        data.lastUpdate = Date.now();
        this.userTiltData.set(userId, data);
        return this.getTiltLevel(userId);
    }
}

const tiltManager = new TiltCheckManager();
const cardGame = new TiltCheckCardGame();

// ========== TILT CHECK MARKETPLACE ==========

async function handleTiltMarketplace(message) {
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    const embed = {
        color: userTilt.color,
        title: '🎰 Tilt Check Casino & Marketplace',
        description: `💜 Made for degens by degens - managing mischief through education\nCurrent tilt level: ${userTilt.emoji} ${userTilt.name}`,
        fields: [
            {
                name: '🎲 Educational Gaming',
                value: '[Mindful Tables](http://localhost:3002/stripe/marketplace)\nPoker • Blackjack • Pattern Analysis',
                inline: true
            },
            {
                name: '🧠 Behavior Tools',
                value: '[Tilt Management Hub](http://localhost:3002/stripe/seller-dashboard)\nEducation • Gamification • Fairness',
                inline: true
            },
            {
                name: '📊 Analytics Dashboard',
                value: '[Pattern Recognition](http://localhost:3002/test)\nTrack behaviors & prevent mistakes',
                inline: true
            },
            {
                name: '🃏 Mindful Games',
                value: 'Use `!poker` for educational Hold\'em\nUse `!tiltcards` for behavior analysis\nUse `!meditation` for willpower training',
                inline: true
            },
            {
                name: '� Your Progress',
                value: `Earnings multiplier: ${(userTilt.multiplier * 100).toFixed(0)}%\n${userTilt.emoji} Mindful management in action!`,
                inline: true
            },
            {
                name: '💜 Mission Statement',
                value: 'Helping degens understand patterns, build willpower, and prevent tilted mistakes through provable fairness and gamified education',
                inline: false
            }
        ],
        footer: {
            text: 'Made for degens by degens • Education through gamification • Mindful mischief management'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

// ========== POKER GAME ==========

async function handlePoker(message, args) {
    const subcommand = args[0]?.toLowerCase();
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    switch (subcommand) {
        case 'start':
            const buyIn = parseInt(args[1]) || 100;
            if (buyIn < 10 || buyIn > 1000) {
                return message.reply('❌ Buy-in must be between $10 and $1000!');
            }
            await startPokerGame(message, buyIn);
            break;
            
        case 'join':
            await joinPokerGame(message);
            break;
            
        case 'fold':
            await foldPokerHand(message);
            break;
            
        case 'call':
            await callPokerBet(message);
            break;
            
        case 'raise':
            const raiseAmount = parseInt(args[1]) || 10;
            await raisePokerBet(message, raiseAmount);
            break;
            
        case 'check':
            await checkTilt(message);
            break;
            
        default:
            const helpEmbed = {
                color: userTilt.color,
                title: '🃏 Tilt Check Poker',
                description: `Texas Hold'em with tilt management! ${userTilt.emoji} Tilt Level: ${userTilt.name}`,
                fields: [
                    {
                        name: '🎮 Game Commands',
                        value: '`!poker start [buy-in]` - Start a poker table\n`!poker join` - Join existing table\n`!poker fold/call/raise/check` - Game actions'
                    },
                    {
                        name: '🧠 Tilt System',
                        value: '• Losing hands increases tilt\n• Winning reduces tilt\n• Higher tilt = lower earnings\n• Take breaks to cool down!'
                    },
                    {
                        name: '💰 Current Multiplier',
                        value: `${(userTilt.multiplier * 100).toFixed(0)}% earnings due to ${userTilt.name} tilt level`
                    },
                    {
                        name: '🎯 Tilt Management',
                        value: 'Use `!poker check` to assess your tilt\nUse `!breathe` to reduce tilt\nUse `!meditation` for major tilt reduction'
                    }
                ],
                footer: {
                    text: 'Know when to hold em, know when to fold em'
                }
            };
            
            await message.reply({ embeds: [helpEmbed] });
    }
}

async function startPokerGame(message, buyIn) {
    const gameId = message.channel.id;
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    const game = {
        id: gameId,
        host: message.author.id,
        players: [{
            id: message.author.id,
            name: message.author.username,
            chips: buyIn,
            hand: [],
            folded: false
        }],
        buyIn: buyIn,
        pot: 0,
        currentBet: 0,
        stage: 'waiting', // waiting, preflop, flop, turn, river, showdown
        communityCards: [],
        deck: generateDeck()
    };
    
    tiltManager.activeGames.set(gameId, game);
    
    const embed = {
        color: userTilt.color,
        title: '🃏 Poker Table Started!',
        description: `${message.author.username} started a poker table with $${buyIn} buy-in`,
        fields: [
            {
                name: '💺 Players (1/8)',
                value: `1. ${message.author.username} - $${buyIn} chips ${userTilt.emoji}`
            },
            {
                name: '🎯 Join the Table',
                value: 'Type `!poker join` to join this table!'
            },
            {
                name: '⚠️ Tilt Warning',
                value: `Host tilt level: ${userTilt.name} (${(userTilt.multiplier * 100).toFixed(0)}% earnings)`
            }
        ],
        footer: {
            text: 'Game starts when 2+ players join'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

// ========== TILT MANAGEMENT COMMANDS ==========

async function handleTiltCheck(message) {
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    const tiltData = tiltManager.userTiltData.get(message.author.id) || { tiltPoints: 0 };
    
    const embed = {
        color: userTilt.color,
        title: '🧠 Tilt Check Analysis - Mindful Behavior Monitoring',
        description: `${message.author.username}'s behavioral pattern analysis\n💜 Education through self-awareness`,
        fields: [
            {
                name: `${userTilt.emoji} Current State`,
                value: `**${userTilt.name}** (${tiltData.tiltPoints}/100 tilt points)\nPattern recognition: ${getTiltPattern(userTilt)}`,
                inline: true
            },
            {
                name: '🎯 Decision Quality',
                value: `${(userTilt.multiplier * 100).toFixed(0)}% optimal decision making\nWillpower effectiveness: ${getWillpowerLevel(userTilt)}`,
                inline: true
            },
            {
                name: '� Educational Insights',
                value: getTiltEducation(userTilt),
                inline: false
            },
            {
                name: '🎮 Gamified Learning',
                value: '`!breathe` - Mindfulness training (+5 willpower)\n`!meditation` - Deep pattern reset (+25 willpower)\n`!analyze` - Behavior pattern study',
                inline: true
            },
            {
                name: '🔬 Provable Fairness',
                value: getProvenStrategies(userTilt),
                inline: true
            },
            {
                name: '💜 Degen Wisdom',
                value: '"Every tilt is a lesson, every pattern a teacher. We\'re here to help you understand the mischief and grow stronger." - Made by degens, for degens',
                inline: false
            }
        ],
        footer: {
            text: 'Tilt decreases 1 point per hour • Education prevents future mistakes • Mindful awareness builds strength'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleBreathe(message) {
    const oldTilt = tiltManager.getTiltLevel(message.author.id);
    const newTilt = tiltManager.reduceTilt(message.author.id, 5);
    
    const breathingPhrases = [
        "Take a deep breath... in through the nose, out through the mouth...",
        "Inhale the good vibes, exhale the tilt...",
        "Remember: it's just a game, variance is temporary...",
        "Deep breathing activated. You're regaining control...",
        "Zen mode engaging... tilt levels decreasing..."
    ];
    
    const randomPhrase = breathingPhrases[Math.floor(Math.random() * breathingPhrases.length)];
    
    const embed = {
        color: newTilt.color,
        title: '🫁 Breathing Exercise',
        description: randomPhrase,
        fields: [
            {
                name: 'Tilt Reduction',
                value: `${oldTilt.emoji} ${oldTilt.name} → ${newTilt.emoji} ${newTilt.name}`,
                inline: true
            },
            {
                name: 'Earnings Impact',
                value: `${(oldTilt.multiplier * 100).toFixed(0)}% → ${(newTilt.multiplier * 100).toFixed(0)}%`,
                inline: true
            }
        ],
        footer: {
            text: 'Regular breathing exercises help maintain emotional control'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleMeditation(message) {
    const oldTilt = tiltManager.getTiltLevel(message.author.id);
    const newTilt = tiltManager.reduceTilt(message.author.id, 25);
    
    const meditationMessages = [
        "🧘‍♂️ **5-Minute Meditation Complete**\nYou've found your center. The tilt has lifted significantly.",
        "🌅 **Mindfulness Session**\nClarity returns. Your emotional state has stabilized.",
        "🕯️ **Deep Meditation**\nInner peace achieved. You're ready to make rational decisions.",
        "⛩️ **Zen State Reached**\nThe chaos in your mind has settled like dust on still water."
    ];
    
    const randomMessage = meditationMessages[Math.floor(Math.random() * meditationMessages.length)];
    
    const embed = {
        color: newTilt.color,
        title: '🧘‍♂️ Meditation Complete',
        description: randomMessage,
        fields: [
            {
                name: 'Major Tilt Reduction',
                value: `${oldTilt.emoji} ${oldTilt.name} → ${newTilt.emoji} ${newTilt.name}`,
                inline: true
            },
            {
                name: 'Earnings Boost',
                value: `${(oldTilt.multiplier * 100).toFixed(0)}% → ${(newTilt.multiplier * 100).toFixed(0)}%`,
                inline: true
            },
            {
                name: '🎯 Cooldown',
                value: 'Can meditate again in 30 minutes',
                inline: false
            }
        ],
        footer: {
            text: 'Regular meditation builds long-term tilt resistance'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

// ========== TILT CHECK CARD GAME ==========

async function handleTiltCards(message, args) {
    const subcommand = args[0]?.toLowerCase();
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    switch (subcommand) {
        case 'start':
            const maxPlayers = parseInt(args[1]) || 6;
            if (maxPlayers < 3 || maxPlayers > 10) {
                return message.reply('❌ Max players must be between 3 and 10!');
            }
            await cardGame.startGame(message, maxPlayers);
            break;
            
        case 'join':
            await cardGame.joinGame(message);
            break;
            
        case 'begin':
            await cardGame.beginGame(message);
            break;
            
        case 'play':
            if (!args[1]) {
                return message.reply('❌ Usage: `!tiltcards play <card number>`');
            }
            await cardGame.playCard(message, args.slice(1));
            break;
            
        case 'pick':
            if (!args[1]) {
                return message.reply('❌ Usage: `!tiltcards pick <submission number>`');
            }
            await cardGame.pickWinner(message, args.slice(1));
            break;
            
        case 'status':
            await cardGame.showStatus(message);
            break;
            
        case 'end':
            const game = cardGame.getGameByChannel(message.channel.id);
            if (game && (message.author.id === game.host || message.member?.permissions.has('Administrator'))) {
                await cardGame.endGame(message, game);
            } else {
                message.reply('❌ Only the host or admin can end the game!');
            }
            break;
            
        default:
            const helpEmbed = {
                color: userTilt.color,
                title: '🎰 Tilt Check Card Game',
                description: 'A poker/gambling-themed Cards Against Humanity style game!',
                fields: [
                    {
                        name: '🎮 Game Commands',
                        value: '`!tiltcards start [max players]` - Start a new game\n`!tiltcards join` - Join an existing game\n`!tiltcards begin` - Begin the game (host only)\n`!tiltcards play <number>` - Play a white card\n`!tiltcards pick <number>` - Pick winning combo (Czar only)\n`!tiltcards status` - Show game status\n`!tiltcards end` - End the game (Host/Admin only)'
                    },
                    {
                        name: '🎯 How to Play',
                        value: '1. One player is the **Card Czar**\n2. Everyone else gets white cards\n3. Czar reads a poker/tilt-themed black card\n4. Players submit their funniest white card\n5. Czar picks the best combo\n6. First to 5 points wins!'
                    },
                    {
                        name: '🎲 Poker/Tilt Theme',
                        value: 'Cards are themed around:\n• Bad beats and variance\n• Tilt management strategies\n• Casino and poker life\n• Emotional control techniques'
                    },
                    {
                        name: `${userTilt.emoji} Your Tilt Status`,
                        value: `Current Level: ${userTilt.name}\nEarnings Multiplier: ${(userTilt.multiplier * 100).toFixed(0)}%`
                    }
                ],
                footer: {
                    text: 'Tilt Check Cards - Where bad beats meet good laughs'
                }
            };
            
            await message.reply({ embeds: [helpEmbed] });
    }
}

// ========== EDUCATIONAL & PATTERN ANALYSIS COMMANDS ==========

async function handlePatternAnalysis(message) {
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    const tiltData = tiltManager.userTiltData.get(message.author.id) || { tiltPoints: 0, lastUpdate: Date.now() };
    
    const embed = {
        color: 0x9932cc,
        title: '🔬 Behavioral Pattern Analysis',
        description: '💜 Made for degens by degens - understanding your mischief patterns',
        fields: [
            {
                name: '📊 Current Analysis',
                value: `Tilt Level: ${userTilt.name} (${tiltData.tiltPoints}/100)\nPattern Type: ${getTiltPattern(userTilt)}\nDecision Quality: ${(userTilt.multiplier * 100).toFixed(0)}%`,
                inline: false
            },
            {
                name: '💜 Degen Learning',
                value: 'Every pattern reveals strength. Every tilt teaches resilience. You\'re not broken - you\'re learning to be unbreakable.',
                inline: false
            }
        ],
        footer: {
            text: 'Pattern analysis helps prevent future tilted mistakes • Education through awareness'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleEducation(message) {
    const embed = {
        color: 0x9932cc,
        title: '🎓 Tilt Check University - Degen Education Center',
        description: '💜 Made for degens by degens - comprehensive mischief management education',
        fields: [
            {
                name: '📚 Core Philosophy',
                value: '"We don\'t judge the tilt - we study it. We don\'t shame the mistakes - we learn from them. Every degen deserves the tools to manage their mischief mindfully."',
                inline: false
            },
            {
                name: '🎮 Learning Methods',
                value: '• Pattern recognition training\n• Mindfulness practice\n• Behavioral analysis\n• Community support\n• Gamified progress tracking',
                inline: false
            }
        ],
        footer: {
            text: 'Use !patterns for pattern study • !analyze for personal analysis • !degen for wisdom'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handleDegenWisdom(message) {
    const wisdomQuotes = [
        "💜 \"Every tilt is a teacher, every mistake a mentor. The strongest degens are those who learn fastest.\"",
        "🧠 \"Your brain on tilt isn't broken - it's human. Understanding it is the first step to mastering it.\"",
        "✨ \"Made for degens by degens - because we know the struggle, and we know the way out.\"",
        "🔥 \"Mischief managed mindfully becomes wisdom. Chaos channeled correctly becomes strength.\"",
        "💪 \"You're not addicted to losing - you're addicted to the possibility of winning. Channel that energy.\""
    ];
    
    const randomWisdom = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    const embed = {
        color: 0xFF69B4,
        title: '💜 Degen Wisdom - Made by Degens, for Degens',
        description: randomWisdom,
        fields: [
            {
                name: '🎯 Your Current Journey',
                value: `Tilt Level: ${userTilt.emoji} ${userTilt.name}\nRemember: Every degen has been here. The key is learning from it.`,
                inline: false
            }
        ],
        footer: {
            text: 'Wisdom shared is wisdom multiplied • Use !education for learning modules'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

async function handlePatternLearning(message) {
    const userTilt = tiltManager.getTiltLevel(message.author.id);
    
    const embed = {
        color: 0x6A5ACD,
        title: '🔍 Pattern Learning Laboratory',
        description: '💜 Understanding the science behind degen behavior patterns',
        fields: [
            {
                name: '⚠️ Common Triggers',
                value: '• Bad beats and variance\n• Time pressure decisions\n• Bankroll anxiety\n• Social pressure\n• Fatigue and stress',
                inline: true
            },
            {
                name: '✅ Healthy Responses', 
                value: '• Mindful breathing\n• Pattern analysis\n• Taking breaks\n• Community support\n• Educational reflection',
                inline: true
            },
            {
                name: '💜 Degen Truth',
                value: 'Every degen has patterns. The successful ones study theirs, understand them, and gradually reshape them through mindful practice.',
                inline: false
            }
        ],
        footer: {
            text: 'Use !analyze for personal pattern analysis • Practice makes patterns permanent'
        }
    };
    
    await message.reply({ embeds: [embed] });
}

// ========== UTILITY FUNCTIONS ==========

function getTiltRecommendations(tiltLevel) {
    switch (tiltLevel.level) {
        case 0: return "✅ You're in optimal condition! Perfect time for learning new strategies and taking calculated risks.";
        case 1: return "⚠️ Early warning detected. This is the perfect teaching moment - practice mindful breathing and pattern recognition.";
        case 2: return "🚨 Educational opportunity! Your brain is showing classic tilt patterns. Time to practice what you've learned about self-control.";
        case 3: return "⛔ High tilt teaching moment! Step away and analyze what triggered this. Every degen's been here - it's how we learn.";
        case 4: return "🆘 MAXIMUM LEARNING OPPORTUNITY! Stop immediately. This is when the most important lessons happen. Rest, reflect, grow stronger.";
        default: return "Status unknown - even this is a learning experience!";
    }
}

function getTiltEducation(tiltLevel) {
    switch (tiltLevel.level) {
        case 0: return "🎓 **Optimal Learning State**: Your mind is clear and ready to absorb new concepts. Great time to study advanced strategies, review past sessions, and build new positive patterns.";
        case 1: return "📖 **Early Recognition Training**: You're experiencing the first signs of emotional interference. This is valuable - most people miss this stage. Practice identifying these early warning signs.";
        case 2: return "🔍 **Pattern Analysis Mode**: Your emotional state is affecting decision-making. Study this feeling - what triggered it? What thoughts are racing? This awareness prevents future escalation.";
        case 3: return "🎯 **Critical Learning Moment**: High tilt is a teacher, not an enemy. Every degen faces this. The ones who succeed learn to recognize it faster and have better exit strategies.";
        case 4: return "🧪 **Advanced Tilt Studies**: This is graduate-level emotional management. You're in the lab now. Study everything - what led here, what it feels like, how to exit gracefully.";
        default: return "📚 Every state is a learning opportunity for mindful degens.";
    }
}

function getTiltPattern(tiltLevel) {
    const patterns = {
        0: "Baseline stable",
        1: "Early emotional interference",
        2: "Moderate decision impairment", 
        3: "High emotional volatility",
        4: "Critical emotional overload"
    };
    return patterns[tiltLevel.level] || "Unknown pattern";
}

function getWillpowerLevel(tiltLevel) {
    const willpower = {
        0: "Maximum strength",
        1: "Slightly diminished", 
        2: "Moderately impaired",
        3: "Significantly weakened",
        4: "Critical depletion"
    };
    return willpower[tiltLevel.level] || "Unknown";
}

function getProvenStrategies(tiltLevel) {
    switch (tiltLevel.level) {
        case 0: return "✅ Proven: Take calculated risks\n✅ Proven: Learn new concepts\n✅ Proven: Analyze past sessions";
        case 1: return "⚠️ Proven: Practice breathing\n⚠️ Proven: Reduce bet sizes\n⚠️ Proven: Take micro-breaks";
        case 2: return "🚨 Proven: Step down stakes\n🚨 Proven: Focus on fundamentals\n🚨 Proven: Limit session time";
        case 3: return "⛔ Proven: Stop playing immediately\n⛔ Proven: Analyze triggers\n⛔ Proven: Practice meditation";
        case 4: return "🆘 Proven: Complete session stop\n🆘 Proven: Long-term break\n🆘 Proven: Seek pattern help";
        default: return "📊 Building your proven strategy database...";
    }
}

function getTiltGameImpact(tiltLevel) {
    switch (tiltLevel.level) {
        case 0: return "✅ Perfect decision making\n✅ Maximum learning absorption\n✅ Optimal pattern recognition";
        case 1: return "⚠️ 90% decision quality\n⚠️ Slight learning interference\n⚠️ Early pattern disruption";
        case 2: return "🚨 80% decision quality\n🚨 Moderate learning blocks\n🚨 Pattern recognition impaired";
        case 3: return "⛔ 60% decision quality\n⛔ Major learning disruption\n⛔ Poor pattern recognition";
        case 4: return "🆘 40% decision quality\n🆘 Learning completely blocked\n🆘 Pattern recognition failed";
        default: return "📊 Impact analysis in progress...";
    }
}

function generateDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit, value: rank === 'A' ? 14 : (rank === 'K' ? 13 : (rank === 'Q' ? 12 : (rank === 'J' ? 11 : parseInt(rank)))) });
        }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

// ========== MAIN BOT SETUP ==========

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});

client.once('ready', () => {
    console.log('🎰 Tilt Check Casino Bot is online! Know when to hold em! 🃏');
    console.log('💜 Made for degens by degens - helping manage mischief through education & mindful behavior');
    global.discordClient = client; // Make client globally available for card game
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // Tilt Check themed commands
    if (command === '!casino' || command === '!marketplace') {
        await handleTiltMarketplace(message);
    } else if (command === '!poker') {
        await handlePoker(message, args);
    } else if (command === '!tilt' || command === '!check') {
        await handleTiltCheck(message);
    } else if (command === '!breathe') {
        await handleBreathe(message);
    } else if (command === '!meditation' || command === '!meditate') {
        await handleMeditation(message);
    } else if (command === '!tiltcards') {
        await handleTiltCards(message, args);
    } else if (command === '!analyze') {
        await handlePatternAnalysis(message);
    } else if (command === '!education') {
        await handleEducation(message);
    } else if (command === '!degen') {
        await handleDegenWisdom(message);
    } else if (command === '!patterns') {
        await handlePatternLearning(message);
    } else if (command === '!walk') {
        await message.reply('🚶‍♂️ **Take a Walk Suggestion**\n\nStep away from the screen for 10-15 minutes. Fresh air and movement help reset your mental state.\n\n*Your games will be here when you return with a clearer mind.*');
    } else if (command === '!badbeat') {
        // Simulate a bad beat for testing
        const newTilt = tiltManager.addTilt(message.author.id, 20);
        await message.reply(`💔 **Bad Beat Detected!** \n\n${newTilt.emoji} Tilt increased to: ${newTilt.name}\nEarnings multiplier: ${(newTilt.multiplier * 100).toFixed(0)}%\n\n*Consider taking a break or doing some breathing exercises.*`);
    } else if (command === '!win') {
        // Simulate a win for testing
        const newTilt = tiltManager.reduceTilt(message.author.id, 10);
        await message.reply(`🎉 **Big Win!** \n\n${newTilt.emoji} Tilt reduced to: ${newTilt.name}\nEarnings multiplier: ${(newTilt.multiplier * 100).toFixed(0)}%\n\n*Riding the positive wave!*`);
    }
    
    // Keep original TrapHouse commands for comparison
    else if (command === '!street' || command === '!streetname') {
        await roleManager.assignRole(message);
    } else if (command === '!work') {
        // Add tilt-based work earnings
        const userTilt = tiltManager.getTiltLevel(message.author.id);
        const baseEarnings = 10;
        const actualEarnings = Math.floor(baseEarnings * userTilt.multiplier);
        
        await addRespectPoints(message);
        if (userTilt.level > 0) {
            await message.reply(`🎰 **Tilt Impact**: Earned $${actualEarnings} instead of $${baseEarnings} due to ${userTilt.name} tilt level ${userTilt.emoji}`);
        }
    }
});

// Export for use
module.exports = { tiltManager, TiltCheckManager, TILT_LEVELS };

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Tilt Check Bot logged in successfully!'))
  .catch(err => console.error('Failed to log in:', err));

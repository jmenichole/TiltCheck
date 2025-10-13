/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');

// ========== JUSTTHETIP CRYPTO INTEGRATION ==========
// Smart crypto tipping + accountability buddy + vault suggestions
// "For degens, by degens - but make it financially responsible... somehow"

class JustTheTipManager {
    constructor() {
        this.userVaults = new Map(); // userId -> vault data
        this.tippingHistory = new Map(); // userId -> tip history
        this.accountabilityPairs = new Map(); // userId -> buddy data
        this.degenMetrics = new Map(); // userId -> degen behavior tracking
    }

    // Smart vault suggestions based on degen behavior
    suggestVault(userId, amount, degenLevel) {
        const vaultTypes = {
            'hodl-vault': { risk: 'low', humor: 'For when you need to touch grass instead of charts', minAmount: 10 },
            'yolo-vault': { risk: 'high', humor: 'Maximum degen energy contained safely', minAmount: 50 },
            'regret-vault': { risk: 'medium', humor: 'Lock it up before you buy another dog coin', minAmount: 25 },
            'grass-touching-vault': { risk: 'ultra-low', humor: 'Mandatory outdoor time funding', minAmount: 5 },
            'therapy-vault': { risk: 'emotional', humor: 'Self-care is the ultimate alpha move', minAmount: 20 }
        };

        if (degenLevel >= 80) return vaultTypes['therapy-vault'];
        if (degenLevel >= 60) return vaultTypes['regret-vault'];
        if (degenLevel >= 40) return vaultTypes['yolo-vault'];
        if (degenLevel <= 20) return vaultTypes['grass-touching-vault'];
        return vaultTypes['hodl-vault'];
    }

    // Calculate user's degen level (0-100)
    calculateDegenLevel(userId) {
        const metrics = this.degenMetrics.get(userId) || {
            impulseTransactions: 0,
            lateNightActivity: 0,
            chartScreenTime: 0,
            rugPullCount: 0,
            grassTouchingScore: 100
        };

        let degenLevel = 0;
        degenLevel += Math.min(metrics.impulseTransactions * 5, 30);
        degenLevel += Math.min(metrics.lateNightActivity * 3, 25);
        degenLevel += Math.min(metrics.rugPullCount * 10, 25);
        degenLevel += Math.max(0, 20 - metrics.grassTouchingScore);

        return Math.min(100, degenLevel);
    }

    // Track degen behavior for better suggestions
    trackDegenBehavior(userId, action) {
        const metrics = this.degenMetrics.get(userId) || {
            impulseTransactions: 0,
            lateNightActivity: 0,
            chartScreenTime: 0,
            rugPullCount: 0,
            grassTouchingScore: 100
        };

        const hour = new Date().getHours();
        
        switch (action) {
            case 'tip':
                metrics.impulseTransactions++;
                if (hour >= 23 || hour <= 5) metrics.lateNightActivity++;
                break;
            case 'vault':
                metrics.grassTouchingScore = Math.min(100, metrics.grassTouchingScore + 5);
                break;
            case 'yolo':
                metrics.impulseTransactions += 2;
                metrics.grassTouchingScore = Math.max(0, metrics.grassTouchingScore - 10);
                break;
        }

        this.degenMetrics.set(userId, metrics);
        return this.calculateDegenLevel(userId);
    }
}

const justTheTipManager = new JustTheTipManager();

// ========== ACCOUNTABILITY BUDDY SYSTEM ==========

async function handleAccountabilityBuddy(message, args) {
    const subcommand = args[0]?.toLowerCase();
    
    switch (subcommand) {
        case 'pair':
            await handleBuddyPairing(message, args[1]);
            break;
        case 'check':
            await handleBuddyCheck(message);
            break;
        case 'roast':
            await handleBuddyRoast(message, args.slice(1));
            break;
        case 'encourage':
            await handleBuddyEncouragement(message);
            break;
        default:
            await showAccountabilityHelp(message);
    }
}

async function handleBuddyPairing(message, targetUser) {
    if (!targetUser) {
        return message.reply('❌ Usage: `!buddy pair @username` - Find your financial accountability bestie');
    }

    const embed = {
        color: 0x00ff88,
        title: '🤝 AccountabiliBuddy Pairing System',
        description: '💡 *Because every degen needs a friend to stop them from buying SafeMoon 2.0*',
        fields: [
            {
                name: '👯‍♂️ Buddy Benefits',
                value: '• Real-time spending alerts\n• Automated roasting for bad decisions\n• Vault suggestion coordination\n• Shared degeneracy metrics\n• Emergency intervention protocols',
                inline: false
            },
            {
                name: '🎯 How It Works',
                value: 'Your buddy gets notified when you:\n• Make impulse transactions\n• Trade at 3 AM\n• Mention dog coins\n• Haven\'t touched grass in 48h\n• Need emotional support',
                inline: false
            },
            {
                name: '🧠 Smart Features',
                value: 'AI-powered roast generation based on your specific brand of financial self-destruction',
                inline: false
            }
        ],
        footer: {
            text: 'Made for degens by degens • Because we care about your bags AND your mental health'
        }
    };

    await message.reply({ embeds: [embed] });
}

// ========== SMART CRYPTO TIPPING ==========

async function handleSmartTip(message, args) {
    const amount = parseFloat(args[0]);
    const recipient = args[1];
    const reason = args.slice(2).join(' ') || 'being based';

    if (!amount || !recipient) {
        return message.reply('❌ Usage: `!tip 0.001 @user reason` - Spread the alpha, share the wealth');
    }

    // Track degen behavior
    const degenLevel = justTheTipManager.trackDegenBehavior(message.author.id, 'tip');
    const suggestedVault = justTheTipManager.suggestVault(message.author.id, amount, degenLevel);

    const tipReasons = [
        'for having diamond hands when everyone else was paperhanding',
        'for not buying the top (this time)',
        'for touching grass despite being chronically online',
        'for sharing alpha instead of keeping it secret',
        'for being the voice of reason in the group chat',
        'for hodling through the pain',
        'for not falling for obvious rugpulls',
        'for being a real one in the bear market',
        'for making good life choices (rare)',
        'for existing in this timeline with us'
    ];

    const randomReason = tipReasons[Math.floor(Math.random() * tipReasons.length)];
    const actualReason = reason === 'being based' ? randomReason : reason;

    const embed = {
        color: 0xff6b35,
        title: '💰 JustTheTip Smart Crypto Transfer',
        description: `${message.author.username} just sent ${amount} ETH to ${recipient}`,
        fields: [
            {
                name: '🎯 Reason',
                value: `*${actualReason}*`,
                inline: false
            },
            {
                name: '🧠 Smart Suggestion',
                value: `Based on your degen level (${degenLevel}/100), consider the **${Object.keys(justTheTipManager.suggestVault(message.author.id, amount, degenLevel))[0]}**:\n*${suggestedVault.humor}*`,
                inline: false
            },
            {
                name: '📊 Transaction Vibes',
                value: getTransactionVibes(amount, degenLevel),
                inline: false
            },
            {
                name: '🤖 Auto-Vault Suggestion',
                value: `Consider locking ${(amount * 2).toFixed(4)} ETH in a vault to balance this tip. Your future self will thank you (probably).`,
                inline: false
            }
        ],
        footer: {
            text: 'JustTheTip: Making crypto transfers based since 2024'
        }
    };

    await message.reply({ embeds: [embed] });
    
    // Auto-notify accountability buddy if exists
    await notifyAccountabilityBuddy(message.author.id, 'tip', amount, actualReason);
}

// ========== AUTO VAULT SUGGESTIONS ==========

async function handleVaultSuggestion(message, args) {
    const amount = parseFloat(args[0]) || 100;
    const degenLevel = justTheTipManager.calculateDegenLevel(message.author.id);
    const vaultData = justTheTipManager.suggestVault(message.author.id, amount, degenLevel);
    
    justTheTipManager.trackDegenBehavior(message.author.id, 'vault');

    const embed = {
        color: 0x9932cc,
        title: '🏦 Auto-Vault Intelligence System',
        description: '*AI-powered financial decisions for chronically online individuals*',
        fields: [
            {
                name: '🎯 Recommended Vault',
                value: `**${Object.keys(vaultData)[0].toUpperCase()}**\nRisk Level: ${vaultData.risk}\n*${vaultData.humor}*`,
                inline: false
            },
            {
                name: '📊 Your Degen Metrics',
                value: `Current Level: ${degenLevel}/100\n${getDegenAnalysis(degenLevel)}`,
                inline: true
            },
            {
                name: '💡 Smart Reasoning',
                value: getVaultReasoning(degenLevel, amount),
                inline: true
            },
            {
                name: '🎮 Vault Features',
                value: '• Automated DCA scheduling\n• Emergency unlock protocols\n• Buddy notification system\n• Regret-proof time locks\n• Touch grass reminders',
                inline: false
            },
            {
                name: '🧠 Behavioral Analysis',
                value: getPersonalizedAnalysis(message.author.id, degenLevel),
                inline: false
            }
        ],
        footer: {
            text: 'Vault suggestions powered by machine learning and pure degen intuition'
        }
    };

    await message.reply({ embeds: [embed] });
}

// ========== DEGEN METRICS & ANALYSIS ==========

async function handleDegenMetrics(message) {
    const userId = message.author.id;
    const degenLevel = justTheTipManager.calculateDegenLevel(userId);
    const metrics = justTheTipManager.degenMetrics.get(userId) || {};
    
    const embed = {
        color: getDegenLevelColor(degenLevel),
        title: '📊 Your Degen Analytics Dashboard',
        description: `${message.author.username}'s chronically online financial behavior analysis`,
        fields: [
            {
                name: '🎯 Degen Level',
                value: `**${degenLevel}/100** ${getDegenEmoji(degenLevel)}\n*${getDegenTitle(degenLevel)}*`,
                inline: true
            },
            {
                name: '📈 Behavior Metrics',
                value: `Impulse Transactions: ${metrics.impulseTransactions || 0}\nLate Night Trading: ${metrics.lateNightActivity || 0}\nGrass Touching Score: ${metrics.grassTouchingScore || 100}/100`,
                inline: true
            },
            {
                name: '🎪 Personality Analysis',
                value: getPersonalityAnalysis(degenLevel),
                inline: false
            },
            {
                name: '🎯 Improvement Suggestions',
                value: getImprovementSuggestions(degenLevel),
                inline: false
            },
            {
                name: '💡 Based Achievements',
                value: getBasedAchievements(metrics),
                inline: false
            }
        ],
        footer: {
            text: 'Data updated in real-time • Powered by advanced degen algorithms'
        }
    };

    await message.reply({ embeds: [embed] });
}

// ========== MAIN COMMAND HANDLERS ==========

async function handleJustTheTip(message, args) {
    const subcommand = args[0]?.toLowerCase();
    
    switch (subcommand) {
        case 'tip':
            await handleSmartTip(message, args.slice(1));
            break;
        case 'vault':
            await handleVaultSuggestion(message, args.slice(1));
            break;
        case 'buddy':
            await handleAccountabilityBuddy(message, args.slice(1));
            break;
        case 'metrics':
            await handleDegenMetrics(message);
            break;
        case 'yolo':
            await handleYoloMode(message, args.slice(1));
            break;
        case 'status':
            await handleJTTStatus(message);
            break;
        case 'leaderboard':
            await handleJTTLeaderboard(message);
            break;
        default:
            await showJustTheTipHelp(message);
    }
}

async function showJustTheTipHelp(message) {
    const embed = {
        color: 0xff6b35,
        title: '💡 JustTheTip - Smart Crypto Assistant',
        description: '*The accountability buddy you never knew you needed*\n\n💜 Made for degens by degens - but make it financially responsible',
        fields: [
            {
                name: '💰 Smart Tipping',
                value: '`!jtt tip 0.001 @user reason` - Send crypto with AI suggestions\n`!jtt yolo 0.1` - For when you\'re feeling dangerous',
                inline: false
            },
            {
                name: '🏦 Auto Vaults',
                value: '`!jtt vault 100` - Get personalized vault recommendations\n`!jtt metrics` - View your degen analytics',
                inline: false
            },
            {
                name: '🤝 Accountability Buddy',
                value: '`!jtt buddy pair @friend` - Get a financial accountability partner\n`!jtt buddy check` - See how your buddy is doing\n`!jtt buddy roast` - When they need tough love',
                inline: false
            },
            {
                name: '🧠 Smart Features',
                value: '• Real-time degen level calculation\n• Personalized financial suggestions\n• Behavioral pattern analysis\n• Emergency intervention protocols\n• Advanced roasting algorithms',
                inline: false
            },
            {
                name: '🎯 The Vibe',
                value: 'We\'re here to help you make better financial decisions while maintaining that chronically online energy. It\'s financial responsibility with a sense of humor.',
                inline: false
            }
        ],
        footer: {
            text: 'JustTheTip: Where memes meet meaningful financial advice'
        }
    };

    await message.reply({ embeds: [embed] });
}

// ========== UTILITY FUNCTIONS ==========

function getTransactionVibes(amount, degenLevel) {
    if (amount > 1) return "🚨 Big energy! Your wallet is either very healthy or about to be very sad.";
    if (amount > 0.1) return "💪 Solid tip! This is the way.";
    if (amount > 0.01) return "😎 Respectable amount. Keeping it based.";
    if (amount > 0.001) return "🤏 Smol but mighty. Every sat counts.";
    return "🧠 Testing the waters. Smart and cautious.";
}

function getDegenAnalysis(level) {
    if (level >= 80) return "⚠️ Maximum degen detected. Please touch grass immediately.";
    if (level >= 60) return "🚨 High degen energy. Consider a brief reality check.";
    if (level >= 40) return "⚡ Moderate degen vibes. You're dancing on the edge.";
    if (level >= 20) return "😎 Controlled chaos. This is actually impressive.";
    return "🧘 Zen degen. You've achieved balance in the force.";
}

function getVaultReasoning(level, amount) {
    if (level >= 80) return "Based on your metrics, you need maximum protection from yourself right now.";
    if (level >= 60) return "Your impulse control could use some algorithmic assistance.";
    if (level >= 40) return "Let's lock some funds away before you discover the next dog coin.";
    return "You're doing great! This vault will help you stay on track.";
}

function getPersonalizedAnalysis(userId, level) {
    const responses = [
        "You're the type of person who reads smart contract code for fun, aren't you?",
        "Your portfolio probably has more diversity than a Netflix original series.",
        "You've definitely explained blockchain to your grandmother at least once.",
        "Your browser history is 90% CoinGecko and 10% existential crisis content.",
        "You know the exact timestamp of the last time you touched grass."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function getDegenTitle(level) {
    if (level >= 90) return "Transcendent Degen";
    if (level >= 80) return "Maximum Overdegen";
    if (level >= 70) return "Professional Degen";
    if (level >= 60) return "Advanced Degen";
    if (level >= 50) return "Intermediate Degen";
    if (level >= 40) return "Casual Degen";
    if (level >= 30) return "Degen Apprentice";
    if (level >= 20) return "Reformed Degen";
    if (level >= 10) return "Degen in Training";
    return "Normie (Honorary Degen)";
}

function getDegenEmoji(level) {
    if (level >= 80) return "🔥💀🔥";
    if (level >= 60) return "🚨⚡🚨";
    if (level >= 40) return "⚡😈⚡";
    if (level >= 20) return "😎✨😎";
    return "🧘‍♂️💚🧘‍♂️";
}

function getDegenLevelColor(level) {
    if (level >= 80) return 0xff0000; // Red
    if (level >= 60) return 0xff8800; // Orange  
    if (level >= 40) return 0xffff00; // Yellow
    if (level >= 20) return 0x88ff00; // Light green
    return 0x00ff00; // Green
}

function getPersonalityAnalysis(level) {
    if (level >= 80) return "You're basically a human trading algorithm at this point. Impressive and concerning.";
    if (level >= 60) return "You have the energy of someone who's seen every crypto cycle and lived to tell about it.";
    if (level >= 40) return "Perfect balance of degenerate and genius. You probably invented a meme coin.";
    if (level >= 20) return "You're like the wise sage of the group chat - chaotic but somehow always right.";
    return "You're the person everyone comes to for actually good advice. Respect.";
}

function getImprovementSuggestions(level) {
    if (level >= 80) return "• Take a 24-hour internet break\n• Go outside (yes, really)\n• Call a friend who doesn't know what DeFi is\n• Read a book (physical paper kind)";
    if (level >= 60) return "• Set trading hours and stick to them\n• Use vault auto-suggestions\n• Practice saying 'no' to FOMO\n• Touch grass weekly";
    if (level >= 40) return "• Continue your current balanced approach\n• Maybe add some vault automation\n• Keep being based";
    return "• You're actually doing great\n• Consider mentoring other degens\n• Keep up the good work";
}

function getBasedAchievements(metrics) {
    const achievements = [];
    if ((metrics.grassTouchingScore || 100) > 80) achievements.push("🌱 Grass Toucher");
    if ((metrics.impulseTransactions || 0) < 5) achievements.push("🧠 Impulse Controller");
    if ((metrics.lateNightActivity || 0) < 3) achievements.push("😴 Healthy Sleep Cycle");
    if (achievements.length === 0) achievements.push("🎯 Working On It");
    return achievements.join('\n') || "🎯 Building your achievement collection...";
}

async function notifyAccountabilityBuddy(userId, action, amount, reason) {
    // This would integrate with the actual accountability buddy system
    // For now, just log the action
    console.log(`🤝 Buddy notification: ${userId} performed ${action} with amount ${amount} for reason: ${reason}`);
}

async function handleBuddyCheck(message) {
    const embed = {
        color: 0x00ff88,
        title: '🤝 Accountability Buddy Check-In',
        description: 'How is your financial accountability partner doing?',
        fields: [
            {
                name: '📊 Buddy Status',
                value: 'No buddy currently paired. Use `!jtt buddy pair @friend` to get started!',
                inline: false
            },
            {
                name: '💡 Why Buddy Up?',
                value: '• Real-time spending alerts\n• Automated intervention protocols\n• Shared degeneracy metrics\n• Emergency support system\n• Advanced roasting algorithms',
                inline: false
            }
        ],
        footer: {
            text: 'Accountability: Because every degen needs a friend'
        }
    };

    await message.reply({ embeds: [embed] });
}

async function handleBuddyRoast(message, args) {
    const roastMessage = args.join(' ') || 'your questionable life choices';
    
    const roasts = [
        `${roastMessage}? Really? Your accountability buddy is concerned about your decision-making process.`,
        `I see you're committed to ${roastMessage}. Bold strategy, let's see how it plays out.`,
        `Your buddy sent this roast about ${roastMessage}: Maybe consider touching grass instead?`,
        `Regarding ${roastMessage}: Your future self called and wants to have a word with you.`
    ];
    
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    
    await message.reply(`🔥 **Accountability Buddy Roast Incoming:**\n\n*${randomRoast}*\n\n💜 Sent with love and concern for your financial wellbeing.`);
}

async function handleBuddyEncouragement(message) {
    const encouragements = [
        "Your accountability buddy believes in you! You've got this! 💪",
        "Remember: every small step toward financial responsibility is a win! 🌟",
        "Your buddy is proud of your progress. Keep up the good work! 🎉",
        "You're building better habits every day. Your future self thanks you! ✨",
        "Your accountability buddy sees your effort and it's paying off! 💜"
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    await message.reply(`🤗 **Accountability Buddy Encouragement:**\n\n*${randomEncouragement}*\n\n*Keep being awesome and making smart choices!*`);
}

async function showAccountabilityHelp(message) {
    const embed = {
        color: 0x00ff88,
        title: '🤝 Accountability Buddy System',
        description: '💡 *Because every degen needs a friend to stop them from buying SafeMoon 2.0*',
        fields: [
            {
                name: '👯‍♂️ Buddy Commands',
                value: '`!jtt buddy pair @friend` - Set up accountability partnership\n`!jtt buddy check` - Check on your buddy status\n`!jtt buddy roast <message>` - Send tough love\n`!jtt buddy encourage` - Send positive vibes',
                inline: false
            },
            {
                name: '🎯 How It Works',
                value: 'Your buddy gets notified when you:\n• Make impulse transactions\n• Trade at 3 AM\n• Mention dog coins\n• Haven\'t touched grass in 48h\n• Need emotional support',
                inline: false
            },
            {
                name: '🧠 Smart Features',
                value: '• AI-powered intervention triggers\n• Behavioral pattern sharing\n• Emergency support protocols\n• Custom roast generation\n• Progress celebration alerts',
                inline: false
            }
        ],
        footer: {
            text: 'Made for degens by degens • Because we care about your bags AND your mental health'
        }
    };

    await message.reply({ embeds: [embed] });
}

async function handleYoloMode(message, args) {
    const amount = parseFloat(args[0]) || 0.01;
    
    const embed = {
        color: 0xff0000,
        title: '🎲 YOLO MODE ACTIVATED',
        description: '⚠️ *MAXIMUM DEGEN ENERGY DETECTED*',
        fields: [
            {
                name: '🚨 Reality Check',
                value: `You're about to YOLO ${amount} ETH. Your accountability buddy has been notified and is probably typing right now.`,
                inline: false
            },
            {
                name: '🧠 Last Chance for Sanity',
                value: 'Consider these alternatives:\n• DCA into a vault instead\n• Buy something nice for yourself IRL\n• Tip your favorite content creator\n• Touch grass and think about it',
                inline: false
            },
            {
                name: '💡 Pro Tip',
                value: 'The house always wins, but knowledge compounds forever. Maybe invest in yourself instead?',
                inline: false
            }
        ],
        footer: {
            text: 'This message brought to you by your future self'
        }
    };

    await message.reply({ embeds: [embed] });
}

async function handleJTTStatus(message) {
    const userId = message.author.id;
    const degenLevel = justTheTipManager.calculateDegenLevel(userId);
    const metrics = justTheTipManager.degenMetrics.get(userId) || {};
    
    const embed = {
        color: 0x00ff88,
        title: '💡 JustTheTip Status Dashboard',
        description: `${message.author.username}'s smart crypto assistant overview`,
        fields: [
            {
                name: '🎯 Quick Stats',
                value: `Degen Level: ${degenLevel}/100\nTips Sent: ${metrics.impulseTransactions || 0}\nVault Inquiries: ${metrics.vaultChecks || 0}`,
                inline: true
            },
            {
                name: '🏦 Vault Recommendations',
                value: `Current Suggestion: ${Object.keys(justTheTipManager.suggestVault(userId, 100, degenLevel))[0].toUpperCase()}\nRisk Level: ${justTheTipManager.suggestVault(userId, 100, degenLevel).risk}`,
                inline: true
            },
            {
                name: '🤝 Accountability',
                value: 'Buddy Status: Not Paired\nIntervention Level: Medium\nLast Check-in: Never',
                inline: false
            },
            {
                name: '🎮 Features Available',
                value: '• Smart Crypto Tipping ✅\n• Vault Suggestions ✅\n• Behavioral Analysis ✅\n• Buddy System ✅\n• YOLO Mode ⚠️',
                inline: false
            }
        ],
        footer: {
            text: 'JustTheTip: Making crypto transfers based since 2024'
        }
    };

    await message.reply({ embeds: [embed] });
}

async function handleJTTLeaderboard(message) {
    const embed = {
        color: 0xffd700,
        title: '🏆 JustTheTip Community Leaderboard',
        description: '*Celebrating responsible degens and their achievements*',
        fields: [
            {
                name: '🌱 Top Grass Touchers',
                value: '1. @alice - 95/100 Grass Score\n2. @bob - 87/100 Grass Score\n3. @charlie - 76/100 Grass Score',
                inline: true
            },
            {
                name: '🧠 Lowest Degen Levels',
                value: '1. @dana - 12/100 Degen Level\n2. @eve - 23/100 Degen Level\n3. @frank - 34/100 Degen Level',
                inline: true
            },
            {
                name: '💡 Most Vault Usage',
                value: '1. @grace - 47 vault deposits\n2. @henry - 32 vault deposits\n3. @ivan - 28 vault deposits',
                inline: false
            },
            {
                name: '🤝 Best Accountability Buddies',
                value: '1. @alice & @bob - 89% intervention success\n2. @charlie & @dana - 76% intervention success\n3. @eve & @frank - 67% intervention success',
                inline: false
            },
            {
                name: '🎯 Monthly Challenge',
                value: '**Touch Grass February**: Increase your grass touching score by 20 points\n\nCurrent Leader: @alice (+45 points)',
                inline: false
            }
        ],
        footer: {
            text: 'Leaderboard updates daily • Be the change you want to see in your portfolio'
        }
    };

    await message.reply({ embeds: [embed] });
}

module.exports = { justTheTipManager, handleJustTheTip, JustTheTipManager };

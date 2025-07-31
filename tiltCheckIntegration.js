const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

class TiltCheckIntegration {
    constructor() {
        this.userTiltData = new Map();
        this.userSessions = new Map(); // Track active gambling sessions
        this.alertThresholds = {
            stakeIncrease: 200,     // 200% stake increase triggers alert
            timeAtTable: 180,       // 3 hours continuous play triggers alert  
            lossSequence: 5,        // 5 consecutive losses triggers alert
            rapidBetting: 10,       // 10 bets in 5 minutes triggers alert
            emotionalMessages: 3,   // 3 angry/frustrated messages triggers alert
            velocityAlert: 10,      // bets per minute threshold
            balanceDepletion: 80    // % of bankroll lost threshold
        };
        
        // Mischief Manager integration endpoints
        this.integrations = {
            casinoManagementApi: process.env.CASINO_MANAGEMENT_API || "https://api.example.com/casino",
            notificationEndpoint: process.env.NOTIFICATION_ENDPOINT || "https://alerts.example.com/notify",
            stakeUsApi: process.env.STAKE_US_API || "https://stake.us/api"
        };

        // Mischief Manager personality responses
        this.mischiefResponses = {
            tiltWarning: [
                "🚨 **TILT ALERT** 🚨\nYour inner degen is showing! Time to step back before you become a cautionary tale.",
                "⚠️ **MISCHIEF MANAGER INTERVENTION** ⚠️\nI'm detecting some serious FOMO energy. Let's pump the brakes, champ.",
                "🛑 **ACCOUNTABILITY BUDDY CHECK** 🛑\nYour gambling pattern is screaming 'main character in a sob story.' Plot twist: You're smarter than this."
            ],
            encouragement: [
                "💚 **GOOD DECISION DETECTED** 💚\nLook at you being all responsible! Your future self is literally applauding.",
                "🎯 **DISCIPLINE SPOTTED** 🎯\nThis is the energy we need! Controlled chaos, not chaotic chaos.",
                "⭐ **BIG BRAIN MOMENT** ⭐\nYou just made a choice your bank account will thank you for. Keep this energy!"
            ],
            intervention: [
                "🆘 **INTERVENTION TIME** 🆘\nFriend, we need to talk. Your patterns are concerning and I care about your financial well-being.",
                "🚑 **EMERGENCY ACCOUNTABILITY** 🚑\nThis is your Mischief Manager speaking: STOP. Breathe. Think. Your future depends on this moment.",
                "💊 **REALITY CHECK PRESCRIBED** 💊\nTime for some tough love: You're about to make a decision you'll regret. Don't be that person."
            ]
        };
        
        // Load TiltCheck module from cloned repo
        this.loadTiltCheckModule();
    }

    loadTiltCheckModule() {
        try {
            const tiltCheckPath = path.join(__dirname, 'TiltCheck-audit-stakeus');
            if (fs.existsSync(tiltCheckPath)) {
                console.log('✅ TiltCheck module found and loaded');
                this.tiltCheckAvailable = true;
            } else {
                console.log('⚠️ TiltCheck module not found - using basic implementation');
                this.tiltCheckAvailable = false;
            }
        } catch (error) {
            console.error('Error loading TiltCheck module:', error);
            this.tiltCheckAvailable = false;
        }
    }

    // Main TiltCheck command handler with Mischief Manager personality
    async handleTiltCheck(message, args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'start':
                await this.startSession(message, args.slice(1));
                break;
            case 'bet':
                await this.logBet(message, args.slice(1));
                break;
            case 'end':
                await this.endSession(message);
                break;
            case 'status':
                await this.showSessionStatus(message);
                break;
            case 'audit':
                await this.generateTiltReport(message, args.slice(1));
                break;
            case 'alerts':
                await this.setTiltThresholds(message, args.slice(1));
                break;
            case 'intervention':
                await this.triggerIntervention(message);
                break;
            case 'reset':
                await this.resetTiltData(message);
                break;
            case 'help':
            default:
                await this.showTiltCheckHelp(message);
        }
    }

    // Start gambling session tracking
    async startSession(message, args) {
        const platform = args[0] || 'Unknown';
        const bankroll = parseFloat(args[1]) || 100;
        
        const userId = message.author.id;
        const sessionData = {
            platform,
            bankroll,
            currentBalance: bankroll,
            startTime: new Date(),
            bets: [],
            totalWagered: 0,
            netPnL: 0,
            consecutiveLosses: 0,
            maxStake: 0,
            sessionAlerts: []
        };
        
        this.userSessions.set(userId, sessionData);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎰 TiltCheck Session Started - Mischief Manager Activated!')
            .setDescription('*Your accountability buddy is now watching your back with love and sass!*')
            .addFields(
                {
                    name: '🎯 Platform',
                    value: platform,
                    inline: true
                },
                {
                    name: '💰 Starting Bankroll',
                    value: `$${bankroll.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '⏰ Session Start',
                    value: new Date().toLocaleTimeString(),
                    inline: true
                },
                {
                    name: '🛡️ Active Protections',
                    value: `• Stake escalation monitoring (${this.alertThresholds.stakeIncrease}%)\n• Time limit tracking (${this.alertThresholds.timeAtTable} min)\n• Loss sequence alerts (${this.alertThresholds.lossSequence} losses)\n• Velocity monitoring (${this.alertThresholds.velocityAlert} bets/min)\n• Balance protection (${this.alertThresholds.balanceDepletion}% depletion)`,
                    inline: false
                },
                {
                    name: '🤝 Mischief Manager Promise',
                    value: 'I\'m here to help you make decisions your future self will be proud of. Built by someone who\'s been there. ❤️',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Made for degens by degens who learned the hard way' });

        await message.reply({ embeds: [embed] });
        
        // Set automatic monitoring
        setTimeout(() => this.checkSessionTime(userId), 60000);
    }

    // Log individual bets with personality
    async logBet(message, args) {
        const stake = parseFloat(args[0]);
        const outcome = args[1]?.toLowerCase();
        const payout = parseFloat(args[2]) || 0;
        
        if (!stake || !outcome || !['win', 'loss'].includes(outcome)) {
            return await message.reply('❌ Usage: `!tiltcheck bet <stake> <win/loss> [payout]`\n\n💡 Example: `!tiltcheck bet 25 win 75` or `!tiltcheck bet 25 loss`');
        }
        
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session! Start one with `!tiltcheck start <platform> <bankroll>`\n\n🎯 Pro tip: Tracking starts with intention!');
        }
        
        // Process bet
        const bet = {
            stake,
            outcome,
            payout,
            time: new Date(),
            netResult: outcome === 'win' ? (payout - stake) : -stake
        };
        
        session.bets.push(bet);
        session.totalWagered += stake;
        session.currentBalance += bet.netResult;
        session.netPnL += bet.netResult;
        session.maxStake = Math.max(session.maxStake, stake);
        
        // Update loss tracking
        if (outcome === 'loss') {
            session.consecutiveLosses++;
        } else {
            session.consecutiveLosses = 0;
        }
        
        // Check for alerts with Mischief Manager intervention
        await this.checkAlertsWithPersonality(message, session, bet);
        
        // Show bet result with encouraging/warning tone
        const isPositiveResult = outcome === 'win';
        const encouragingMessage = isPositiveResult ? 
            this.mischiefResponses.encouragement[Math.floor(Math.random() * this.mischiefResponses.encouragement.length)] :
            "💸 That's gambling for you! Remember: it's about the long game, not individual hands.";
        
        const embed = new EmbedBuilder()
            .setColor(isPositiveResult ? '#00ff88' : '#ff6b6b')
            .setTitle(`${isPositiveResult ? '🎉' : '💸'} Bet ${outcome === 'win' ? 'Won' : 'Lost'}`)
            .setDescription(encouragingMessage)
            .addFields(
                {
                    name: '💰 Bet Details',
                    value: `Stake: $${stake}\n${outcome === 'win' ? `Payout: $${payout}\nProfit: $${(payout - stake).toFixed(2)}` : `Loss: $${stake}`}`,
                    inline: true
                },
                {
                    name: '📊 Session Stats',
                    value: `Balance: $${session.currentBalance.toFixed(2)}\nNet P&L: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}\nConsecutive Losses: ${session.consecutiveLosses}`,
                    inline: true
                }
            )
            .setFooter({ text: 'TiltCheck: Every bet is data, every decision matters' });
            
        await message.reply({ embeds: [embed] });
    }
                await this.resetTiltData(message);
                break;
            case 'help':
            default:
                await this.showTiltCheckHelp(message);
        }
    }

    // Show current tilt status with JustTheTip humor
    async showTiltStatus(message) {
        const userData = this.getUserTiltData(message.author.id);
        const tiltRisk = this.calculateTiltRisk(userData);
        
        const embed = new EmbedBuilder()
            .setColor(this.getTiltColor(tiltRisk.level))
            .setTitle('🎰 TiltCheck Analysis - Degen Behavior Assessment')
            .setDescription('*JustTheTip: Knowing when to fold is part of the game, degen*')
            .addFields(
                {
                    name: '📊 Tilt Risk Level',
                    value: `**${tiltRisk.level}** ${this.getTiltEmoji(tiltRisk.level)}\n${tiltRisk.advice}`,
                    inline: false
                },
                {
                    name: '⏱️ Session Analytics',
                    value: `**Session Time:** ${userData.sessionTime || 0} minutes\n**Bets Placed:** ${userData.betsToday || 0}\n**Last Activity:** ${userData.lastActivity || 'Never'}`,
                    inline: true
                },
                {
                    name: '💰 Stake Behavior',
                    value: `**Current Stake:** $${userData.currentStake || 0}\n**Average Stake:** $${userData.averageStake || 0}\n**Max Stake:** $${userData.maxStake || 0}`,
                    inline: true
                },
                {
                    name: '📈 Pattern Analysis',
                    value: `**Win Streak:** ${userData.winStreak || 0}\n**Loss Streak:** ${userData.lossStreak || 0}\n**Emotional State:** ${this.getEmotionalState(userData)}`,
                    inline: true
                }
            )
            .setFooter({ text: 'TiltCheck: Protecting degens from themselves since 2025' })
            .setTimestamp();

        // Add JustTheTip vault recommendation based on tilt risk
        if (tiltRisk.level === 'HIGH') {
            embed.addFields({
                name: '🏦 JustTheTip Emergency Protocol',
                value: '**THERAPY VAULT ACTIVATED** 🚨\nForced 7-day lockup recommended\n*"Time to step back and touch some grass, degen"*',
                inline: false
            });
        } else if (tiltRisk.level === 'MEDIUM') {
            embed.addFields({
                name: '🏦 JustTheTip Recommendation',
                value: '**GRASS TOUCHING VAULT** 🌱\n24-hour cooldown suggested\n*"Take a breather before you become the casino\'s favorite customer"*',
                inline: false
            });
        } else {
            embed.addFields({
                name: '🏦 JustTheTip Assessment',
                value: '**HODL VAULT** 💎\nYou\'re playing it cool\n*"Disciplined degeneracy is sustainable degeneracy"*',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    // Generate detailed tilt report
    async generateTiltReport(message, args) {
        const period = args[0] || 'today'; // today, week, month
        const userData = this.getUserTiltData(message.author.id);
        
        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle(`📊 TiltCheck Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`)
            .setDescription('*Comprehensive degen behavior analysis*')
            .addFields(
                {
                    name: '🎯 Key Metrics',
                    value: `**Total Sessions:** ${userData.totalSessions || 0}\n**Average Session:** ${userData.avgSessionTime || 0} min\n**Longest Session:** ${userData.longestSession || 0} min\n**Tilt Events:** ${userData.tiltEvents || 0}`,
                    inline: true
                },
                {
                    name: '💸 Financial Behavior',
                    value: `**Total Wagered:** $${userData.totalWagered || 0}\n**Stake Escalations:** ${userData.stakeEscalations || 0}\n**Biggest Loss:** $${userData.biggestLoss || 0}\n**Recovery Rate:** ${userData.recoveryRate || 0}%`,
                    inline: true
                },
                {
                    name: '🧠 Psychological Patterns',
                    value: `**Frustration Level:** ${userData.frustrationLevel || 'Low'}\n**Impulse Betting:** ${userData.impulseBets || 0}\n**Revenge Betting:** ${userData.revengeBets || 0}\n**Self-Control Score:** ${userData.selfControlScore || 85}/100`,
                    inline: true
                },
                {
                    name: '🔥 Tilt Triggers Identified',
                    value: this.getTiltTriggers(userData),
                    inline: false
                },
                {
                    name: '💡 JustTheTip Recommendations',
                    value: this.getTiltRecommendations(userData),
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Data-driven degen management' });

        await message.reply({ embeds: [embed] });
    }

    // Set custom tilt thresholds
    async setTiltThresholds(message, args) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('⚙️ TiltCheck Threshold Configuration')
                .addFields(
                    {
                        name: '🎛️ Available Settings',
                        value: '`!tiltcheck set stakeIncrease 200` - % increase to trigger alert\n`!tiltcheck set timeAtTable 180` - Minutes before break warning\n`!tiltcheck set lossSequence 5` - Consecutive losses trigger\n`!tiltcheck set rapidBetting 10` - Bets per 5 min trigger',
                        inline: false
                    },
                    {
                        name: '📊 Current Thresholds',
                        value: `**Stake Increase:** ${this.alertThresholds.stakeIncrease}%\n**Time at Table:** ${this.alertThresholds.timeAtTable} min\n**Loss Sequence:** ${this.alertThresholds.lossSequence}\n**Rapid Betting:** ${this.alertThresholds.rapidBetting}`,
                        inline: false
                    }
                );
            
            return await message.reply({ embeds: [embed] });
        }

        const setting = args[0].toLowerCase();
        const value = parseInt(args[1]);

        if (this.alertThresholds.hasOwnProperty(setting) && !isNaN(value)) {
            this.alertThresholds[setting] = value;
            await message.reply(`✅ **${setting}** threshold updated to **${value}**\n\n*JustTheTip: Custom limits for custom degens*`);
        } else {
            await message.reply('❌ Invalid setting or value. Use `!tiltcheck set help` for options.');
        }
    }

    // Reset user tilt data
    async resetTiltData(message) {
        this.userTiltData.delete(message.author.id);
        await message.reply('🔄 **Tilt data reset!**\n\n*JustTheTip: Fresh start, same degen energy*');
    }

    // Show TiltCheck help
    async showTiltCheckHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎰 TiltCheck Integration - Degen Behavior Management')
            .setDescription('*Advanced tilt detection for responsible degeneracy*')
            .addFields(
                {
                    name: '🎮 TiltCheck Commands',
                    value: '`!tiltcheck` - Show this help\n`!tiltcheck status` - Current tilt analysis\n`!tiltcheck report [period]` - Detailed behavior report\n`!tiltcheck set <setting> <value>` - Configure thresholds\n`!tiltcheck reset` - Reset your tilt data',
                    inline: false
                },
                {
                    name: '🔍 What We Monitor',
                    value: '• **Stake Escalation** - Rapid bet size increases\n• **Session Duration** - Time spent gambling\n• **Loss Sequences** - Consecutive losing streaks\n• **Emotional State** - Message sentiment analysis\n• **Betting Patterns** - Frequency and timing',
                    inline: false
                },
                {
                    name: '🏦 JustTheTip Integration',
                    value: '• **Vault Recommendations** based on tilt risk\n• **Emergency Protocols** for high-risk behavior\n• **Accountability Buddy** alerts for concerning patterns\n• **Respect Penalties** for ignoring tilt warnings',
                    inline: false
                },
                {
                    name: '🎯 Tilt Risk Levels',
                    value: '🟢 **LOW** - Disciplined play, HODL vault recommended\n🟡 **MEDIUM** - Some risk, Grass Touching vault suggested\n🔴 **HIGH** - Danger zone, Therapy vault mandatory',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Because even degens need guardrails' });

        await message.reply({ embeds: [embed] });
    }

    // Helper functions
    getUserTiltData(userId) {
        if (!this.userTiltData.has(userId)) {
            this.userTiltData.set(userId, {
                sessionTime: 0,
                betsToday: 0,
                currentStake: 0,
                averageStake: 0,
                maxStake: 0,
                winStreak: 0,
                lossStreak: 0,
                lastActivity: null,
                totalSessions: 0,
                tiltEvents: 0,
                frustrationLevel: 'Low',
                selfControlScore: 85
            });
        }
        return this.userTiltData.get(userId);
    }

    calculateTiltRisk(userData) {
        let riskScore = 0;
        let triggers = [];

        // Session time risk
        if (userData.sessionTime > this.alertThresholds.timeAtTable) {
            riskScore += 30;
            triggers.push('Extended session time');
        }

        // Stake escalation risk
        if (userData.currentStake > userData.averageStake * (this.alertThresholds.stakeIncrease / 100)) {
            riskScore += 25;
            triggers.push('Stake escalation detected');
        }

        // Loss sequence risk
        if (userData.lossStreak >= this.alertThresholds.lossSequence) {
            riskScore += 20;
            triggers.push('Consecutive losses');
        }

        // Emotional state risk
        if (userData.frustrationLevel === 'High') {
            riskScore += 15;
            triggers.push('High frustration detected');
        }

        // Rapid betting risk
        if (userData.betsToday > this.alertThresholds.rapidBetting) {
            riskScore += 10;
            triggers.push('Rapid betting pattern');
        }

        let level, advice;
        if (riskScore >= 50) {
            level = 'HIGH';
            advice = '*DANGER: Step away from the table immediately*';
        } else if (riskScore >= 25) {
            level = 'MEDIUM';
            advice = '*CAUTION: Consider taking a break*';
        } else {
            level = 'LOW';
            advice = '*STABLE: Keep playing responsibly*';
        }

        return { level, advice, score: riskScore, triggers };
    }

    getTiltColor(level) {
        switch (level) {
            case 'HIGH': return '#ff0000';
            case 'MEDIUM': return '#ffa500';
            case 'LOW': return '#00ff00';
            default: return '#808080';
        }
    }

    getTiltEmoji(level) {
        switch (level) {
            case 'HIGH': return '🚨';
            case 'MEDIUM': return '⚠️';
            case 'LOW': return '✅';
            default: return '❓';
        }
    }

    getEmotionalState(userData) {
        if (userData.frustrationLevel === 'High') return '😡 Frustrated';
        if (userData.lossStreak > 3) return '😤 Annoyed';
        if (userData.winStreak > 3) return '😎 Confident';
        return '😐 Neutral';
    }

    getTiltTriggers(userData) {
        const triggers = [];
        if (userData.sessionTime > 120) triggers.push('🕐 Long sessions');
        if (userData.lossStreak > 3) triggers.push('📉 Loss streaks');
        if (userData.stakeEscalations > 2) triggers.push('💸 Stake chasing');
        if (userData.impulseBets > 5) triggers.push('⚡ Impulse betting');
        
        return triggers.length > 0 ? triggers.join('\n') : '✅ No major triggers identified';
    }

    getTiltRecommendations(userData) {
        const recommendations = [];
        
        if (userData.sessionTime > 180) {
            recommendations.push('🛑 Take mandatory 30-minute breaks');
        }
        if (userData.lossStreak > 3) {
            recommendations.push('💰 Reduce stake size by 50%');
        }
        if (userData.frustrationLevel === 'High') {
            recommendations.push('🧘 Practice mindfulness before betting');
        }
        if (userData.impulseBets > 5) {
            recommendations.push('⏰ Implement 5-second bet delay');
        }
        
        recommendations.push('🏦 Consider JustTheTip vault strategy');
        
        return recommendations.join('\n');
    }

    // Track user betting behavior (called from other systems)
    trackBet(userId, amount, outcome) {
        const userData = this.getUserTiltData(userId);
        userData.betsToday++;
        userData.currentStake = amount;
        userData.lastActivity = new Date().toISOString();
        
        if (userData.averageStake === 0) {
            userData.averageStake = amount;
        } else {
            userData.averageStake = (userData.averageStake + amount) / 2;
        }
        
        userData.maxStake = Math.max(userData.maxStake, amount);
        
        if (outcome === 'win') {
            userData.winStreak++;
            userData.lossStreak = 0;
        } else {
            userData.lossStreak++;
            userData.winStreak = 0;
        }

        // Check for tilt triggers
        this.checkTiltTriggers(userId, userData);
    }

    checkTiltTriggers(userId, userData) {
        const risk = this.calculateTiltRisk(userData);
        
        if (risk.level === 'HIGH' && userData.tiltEvents < 3) {
            userData.tiltEvents++;
            // Trigger alert in Discord (implement notification system)
            console.log(`🚨 HIGH TILT RISK for user ${userId}: ${risk.triggers.join(', ')}`);
        }
    }
}

module.exports = TiltCheckIntegration;

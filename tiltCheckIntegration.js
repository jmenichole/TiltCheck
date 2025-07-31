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
        
        // Load existing data on startup
        this.loadTiltData();
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

    // Load existing tilt data from file
    async loadTiltData() {
        try {
            const fs = require('fs').promises;
            const data = JSON.parse(await fs.readFile('tiltcheck-data.json', 'utf8'));
            
            // Convert stored objects back to Maps
            this.userTiltData = new Map(Object.entries(data.userTiltData || {}));
            this.userSessions = new Map(Object.entries(data.userSessions || {}));
            
            console.log('✅ TiltCheck data loaded successfully');
        } catch (error) {
            console.log('📝 No existing tilt data found, starting fresh');
            this.userTiltData = new Map();
            this.userSessions = new Map();
        }
    }

    // Save tilt data to file
    async saveTiltData() {
        try {
            const fs = require('fs').promises;
            const data = {
                userTiltData: Object.fromEntries(this.userTiltData),
                userSessions: Object.fromEntries(this.userSessions),
                lastSaved: new Date().toISOString()
            };
            
            await fs.writeFile('tiltcheck-data.json', JSON.stringify(data, null, 2));
            console.log('💾 TiltCheck data saved successfully');
        } catch (error) {
            console.error('❌ Error saving tilt data:', error);
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
                break;
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
        
        // Save data after session creation
        await this.saveTiltData();
        
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

    // Critical function: Check session time with interventions
    async checkSessionTime(userId) {
        const session = this.userSessions.get(userId);
        if (!session) return;
        
        const sessionDuration = (Date.now() - session.startTime) / (1000 * 60); // minutes
        
        // Check various time thresholds
        if (sessionDuration > this.alertThresholds.timeAtTable) {
            try {
                // Try to get user and send intervention
                const user = await this.client?.users?.fetch(userId);
                if (user) {
                    const interventionMessage = this.mischiefResponses.intervention[
                        Math.floor(Math.random() * this.mischiefResponses.intervention.length)
                    ];
                    
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🚨 SESSION TIME INTERVENTION')
                        .setDescription(interventionMessage)
                        .addFields(
                            {
                                name: '⏰ Session Duration',
                                value: `${Math.floor(sessionDuration)} minutes`,
                                inline: true
                            },
                            {
                                name: '🎯 Recommended Action',
                                value: 'Take a 30-minute break minimum',
                                inline: true
                            },
                            {
                                name: '🏦 JustTheTip Suggestion',
                                value: '**GRASS TOUCHING VAULT** activated\nTime to step away and reset',
                                inline: false
                            }
                        )
                        .setFooter({ text: 'TiltCheck: Your future self will thank you' });
                    
                    await user.send({ embeds: [embed] });
                    
                    // Log the intervention
                    session.sessionAlerts.push({
                        type: 'TIME_INTERVENTION',
                        time: new Date(),
                        duration: sessionDuration
                    });
                    
                    await this.saveTiltData();
                }
            } catch (error) {
                console.log('Could not send DM to user, they may have DMs disabled');
            }
        }
        
        // Continue monitoring if session is still active
        if (this.userSessions.has(userId)) {
            setTimeout(() => this.checkSessionTime(userId), 60000);
        }
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
        
        // Save data after bet logging
        await this.saveTiltData();
        
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

    // Critical function: Alert system with Mischief Manager personality
    async checkAlertsWithPersonality(message, session, bet) {
        const alerts = [];
        const userId = message.author.id;
        
        // 1. Check stake escalation (200% increase)
        if (bet.stake > session.maxStake * (this.alertThresholds.stakeIncrease / 100)) {
            alerts.push({
                type: 'STAKE_ESCALATION',
                severity: 'HIGH',
                message: this.mischiefResponses.tiltWarning[0],
                embed: {
                    color: '#ff6b6b',
                    title: '🚨 STAKE ESCALATION DETECTED',
                    description: `Your bet size just increased by ${Math.round((bet.stake / session.maxStake) * 100)}%!\n\n${this.mischiefResponses.tiltWarning[0]}`,
                    fields: [
                        { name: 'Previous Max Stake', value: `$${session.maxStake.toFixed(2)}`, inline: true },
                        { name: 'Current Stake', value: `$${bet.stake.toFixed(2)}`, inline: true },
                        { name: '🏦 JustTheTip Recommendation', value: '**REGRET VAULT** - Lock funds before you chase losses', inline: false }
                    ]
                }
            });
        }
        
        // 2. Check consecutive losses (5+ losses)
        if (session.consecutiveLosses >= this.alertThresholds.lossSequence) {
            alerts.push({
                type: 'LOSS_SEQUENCE',
                severity: 'CRITICAL',
                message: this.mischiefResponses.intervention[0],
                embed: {
                    color: '#ff0000',
                    title: '🆘 LOSS STREAK INTERVENTION',
                    description: `${session.consecutiveLosses} consecutive losses detected!\n\n${this.mischiefResponses.intervention[0]}`,
                    fields: [
                        { name: 'Consecutive Losses', value: `${session.consecutiveLosses}`, inline: true },
                        { name: 'Total Lost', value: `$${(session.bankroll - session.currentBalance).toFixed(2)}`, inline: true },
                        { name: '🏦 Emergency Protocol', value: '**THERAPY VAULT** - 7-day forced lockup recommended', inline: false }
                    ]
                }
            });
        }
        
        // 3. Check balance depletion (80% of bankroll lost)
        const depletionPercentage = ((session.bankroll - session.currentBalance) / session.bankroll) * 100;
        if (depletionPercentage >= this.alertThresholds.balanceDepletion) {
            alerts.push({
                type: 'BALANCE_DEPLETION',
                severity: 'EMERGENCY',
                message: '🆘 EMERGENCY: 80% of bankroll depleted. STOP NOW!',
                embed: {
                    color: '#8B0000',
                    title: '🚨 EMERGENCY STOP - BALANCE CRITICAL',
                    description: `You've lost ${depletionPercentage.toFixed(1)}% of your bankroll!\n\n🆘 **IMMEDIATE INTERVENTION REQUIRED**`,
                    fields: [
                        { name: 'Original Bankroll', value: `$${session.bankroll.toFixed(2)}`, inline: true },
                        { name: 'Current Balance', value: `$${session.currentBalance.toFixed(2)}`, inline: true },
                        { name: '🏦 Crisis Management', value: '**ALL VAULTS LOCKED** - Contact accountability buddy immediately', inline: false }
                    ]
                }
            });
        }
        
        // 4. Check rapid betting velocity (10 bets in 5 minutes)
        const velocityCheck = this.checkBettingVelocity(session);
        if (velocityCheck.alert) {
            alerts.push({
                type: 'RAPID_BETTING',
                severity: 'HIGH',
                message: velocityCheck.message,
                embed: {
                    color: '#ff9500',
                    title: '⚡ RAPID BETTING DETECTED',
                    description: `${velocityCheck.betsCount} bets in 5 minutes!\n\n${velocityCheck.message}`,
                    fields: [
                        { name: 'Betting Velocity', value: `${velocityCheck.betsCount} bets/5min`, inline: true },
                        { name: 'Recommended Pace', value: 'Max 6 bets/5min', inline: true },
                        { name: '🏦 Velocity Control', value: '**HODL VAULT** - Slow down and think', inline: false }
                    ]
                }
            });
        }
        
        // Send alerts with escalating urgency
        for (const alert of alerts) {
            // Log alert to session
            session.sessionAlerts.push({
                type: alert.type,
                severity: alert.severity,
                time: new Date(),
                betStake: bet.stake,
                sessionBalance: session.currentBalance
            });
            
            // Send alert message
            const alertEmbed = new EmbedBuilder()
                .setColor(alert.embed.color)
                .setTitle(alert.embed.title)
                .setDescription(alert.embed.description)
                .addFields(alert.embed.fields)
                .setFooter({ text: 'TiltCheck: Made for degens by degens who learned the hard way' })
                .setTimestamp();
            
            await message.channel.send({ embeds: [alertEmbed] });
            
            // For critical/emergency alerts, also try to DM
            if (alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY') {
                try {
                    await message.author.send({ embeds: [alertEmbed] });
                } catch (error) {
                    console.log('Could not send DM to user for critical alert');
                }
            }
        }
        
        return alerts.length > 0;
    }

    // Helper function: Check betting velocity
    checkBettingVelocity(session) {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentBets = session.bets.filter(bet => 
            new Date(bet.time).getTime() > fiveMinutesAgo
        );
        
        if (recentBets.length >= this.alertThresholds.rapidBetting) {
            return {
                alert: true,
                betsCount: recentBets.length,
                message: "🚨 RAPID BETTING DETECTED - Slow down, degen! Your brain needs time to process each decision."
            };
        }
        return { alert: false, betsCount: recentBets.length };
    }

    // Show session status with detailed analytics
    async showSessionStatus(message) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session! Start one with `!tiltcheck start <platform> <bankroll>`');
        }
        
        const sessionDuration = (Date.now() - session.startTime) / (1000 * 60); // minutes
        const winRate = session.bets.length > 0 ? 
            (session.bets.filter(bet => bet.outcome === 'win').length / session.bets.length * 100).toFixed(1) : 0;
        
        const embed = new EmbedBuilder()
            .setColor(session.netPnL >= 0 ? '#00ff88' : '#ff6b6b')
            .setTitle('📊 TiltCheck Session Status')
            .setDescription(`**${session.platform}** - Active for ${Math.floor(sessionDuration)} minutes`)
            .addFields(
                {
                    name: '💰 Financial Status',
                    value: `Starting: $${session.bankroll.toFixed(2)}\nCurrent: $${session.currentBalance.toFixed(2)}\nNet P&L: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '🎯 Betting Stats',
                    value: `Total Bets: ${session.bets.length}\nTotal Wagered: $${session.totalWagered.toFixed(2)}\nWin Rate: ${winRate}%\nMax Stake: $${session.maxStake.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '⚠️ Risk Indicators',
                    value: `Consecutive Losses: ${session.consecutiveLosses}\nSession Alerts: ${session.sessionAlerts.length}\nTime at Table: ${Math.floor(sessionDuration)}min`,
                    inline: true
                }
            )
            .setFooter({ text: 'TiltCheck: Knowledge is power, awareness is protection' });
        
        await message.reply({ embeds: [embed] });
    }

    // Generate comprehensive tilt report
    async generateTiltReport(message, args) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session data for audit!');
        }
        
        // Calculate risk score
        const riskScore = this.calculateTiltRisk(session);
        const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
        const riskColor = riskScore >= 70 ? '#ff0000' : riskScore >= 40 ? '#ff9500' : '#00ff88';
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(session, riskScore);
        
        const embed = new EmbedBuilder()
            .setColor(riskColor)
            .setTitle('🔍 TiltCheck Audit Report')
            .setDescription(`**Risk Level: ${riskLevel}** (Score: ${riskScore}/100)`)
            .addFields(
                {
                    name: '📈 Session Summary',
                    value: `Duration: ${Math.floor((Date.now() - session.startTime) / (1000 * 60))}min\nBets: ${session.bets.length}\nAlerts: ${session.sessionAlerts.length}`,
                    inline: true
                },
                {
                    name: '🎯 Behavior Analysis',
                    value: `Max Stake: $${session.maxStake.toFixed(2)}\nConsecutive Losses: ${session.consecutiveLosses}\nVelocity: ${this.checkBettingVelocity(session).betsCount} bets/5min`,
                    inline: true
                },
                {
                    name: '🏦 JustTheTip Recommendations',
                    value: recommendations,
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Data-driven decisions for better outcomes' });
        
        await message.reply({ embeds: [embed] });
    }

    // Calculate comprehensive tilt risk score
    calculateTiltRisk(session) {
        let riskScore = 0;
        const sessionDuration = (Date.now() - session.startTime) / (1000 * 60);
        
        // Time factor (max 25 points)
        if (sessionDuration > this.alertThresholds.timeAtTable) {
            riskScore += Math.min(25, (sessionDuration / this.alertThresholds.timeAtTable) * 15);
        }
        
        // Stake escalation (max 25 points)
        if (session.bets.length > 0) {
            const avgStake = session.totalWagered / session.bets.length;
            if (session.maxStake > avgStake * 2) {
                riskScore += Math.min(25, ((session.maxStake / avgStake) - 1) * 10);
            }
        }
        
        // Loss sequence (max 20 points)
        riskScore += Math.min(20, (session.consecutiveLosses / this.alertThresholds.lossSequence) * 20);
        
        // Balance depletion (max 20 points)
        const depletionPercentage = ((session.bankroll - session.currentBalance) / session.bankroll) * 100;
        riskScore += Math.min(20, (depletionPercentage / this.alertThresholds.balanceDepletion) * 20);
        
        // Alert count (max 10 points)
        riskScore += Math.min(10, session.sessionAlerts.length * 2);
        
        return Math.round(riskScore);
    }

    // Generate personalized recommendations
    generateRecommendations(session, riskScore) {
        if (riskScore >= 70) {
            return '🆘 **EMERGENCY LOCKDOWN**\n• THERAPY VAULT (7-day lockup)\n• Contact accountability buddy\n• Take 24-hour break minimum';
        } else if (riskScore >= 40) {
            return '⚠️ **HIGH RISK DETECTED**\n• GRASS TOUCHING VAULT recommended\n• Reduce stake sizes by 50%\n• Take 2-hour break';
        } else {
            return '✅ **HEALTHY PATTERNS**\n• HODL VAULT for profits\n• Continue current strategy\n• Stay aware of limits';
        }
    }

    // End session with comprehensive summary
    async endSession(message) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session to end!');
        }
        
        // Generate final report
        const sessionDuration = (Date.now() - session.startTime) / (1000 * 60);
        const winRate = session.bets.length > 0 ? 
            (session.bets.filter(bet => bet.outcome === 'win').length / session.bets.length * 100).toFixed(1) : 0;
        const riskScore = this.calculateTiltRisk(session);
        
        // Archive session data to user's history
        if (!this.userTiltData.has(userId)) {
            this.userTiltData.set(userId, { sessions: [], totalSessions: 0 });
        }
        
        const userData = this.userTiltData.get(userId);
        userData.sessions.push({
            ...session,
            endTime: new Date(),
            finalRiskScore: riskScore,
            sessionDuration: sessionDuration
        });
        userData.totalSessions++;
        
        // Remove active session
        this.userSessions.delete(userId);
        
        // Save data
        await this.saveTiltData();
        
        const embed = new EmbedBuilder()
            .setColor(session.netPnL >= 0 ? '#00ff88' : '#ff6b6b')
            .setTitle('🏁 Session Ended - Final Report')
            .setDescription(`**${session.platform}** session completed`)
            .addFields(
                {
                    name: '⏰ Session Stats',
                    value: `Duration: ${Math.floor(sessionDuration)} minutes\nTotal Bets: ${session.bets.length}\nWin Rate: ${winRate}%`,
                    inline: true
                },
                {
                    name: '💰 Financial Summary',
                    value: `Started: $${session.bankroll.toFixed(2)}\nEnded: $${session.currentBalance.toFixed(2)}\nNet Result: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '🎯 Risk Assessment',
                    value: `Final Risk Score: ${riskScore}/100\nAlerts Triggered: ${session.sessionAlerts.length}\nMax Consecutive Losses: ${session.consecutiveLosses}`,
                    inline: false
                },
                {
                    name: '🏦 Post-Session Recommendation',
                    value: this.generateRecommendations(session, riskScore),
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Every session is a learning opportunity' });
        
        await message.reply({ embeds: [embed] });
    }

    // Show comprehensive help guide
    async showTiltCheckHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎰 TiltCheck - Your Gambling Accountability Buddy')
            .setDescription('**Made for degens by degens who learned the hard way** ❤️')
            .addFields(
                {
                    name: '🎯 Session Commands',
                    value: '`!tiltcheck start <platform> <bankroll>` - Start tracking\n`!tiltcheck bet <stake> <win/loss> [payout]` - Log a bet\n`!tiltcheck status` - Check current session\n`!tiltcheck end` - End session with report',
                    inline: false
                },
                {
                    name: '📊 Analysis Commands',
                    value: '`!tiltcheck audit` - Generate risk report\n`!tiltcheck alerts` - View alert thresholds\n`!tiltcheck intervention` - Manual intervention mode',
                    inline: false
                },
                {
                    name: '🛠️ Management Commands',
                    value: '`!tiltcheck reset` - Reset user data\n`!tiltcheck help` - Show this guide',
                    inline: false
                },
                {
                    name: '🚨 Auto-Protection Features',
                    value: '• **Stake Escalation**: Alerts at 200% increase\n• **Time Monitoring**: Warnings after 3 hours\n• **Loss Streaks**: Intervention after 5 losses\n• **Rapid Betting**: Alerts for 10+ bets/5min\n• **Balance Depletion**: Emergency at 80% loss',
                    inline: false
                },
                {
                    name: '🏦 JustTheTip Integration',
                    value: '• **HODL Vault**: For disciplined profits\n• **REGRET Vault**: Stop loss chasing\n• **GRASS TOUCHING**: Time-based breaks\n• **THERAPY Vault**: 7-day emergency lockup',
                    inline: false
                },
                {
                    name: '💡 Example Usage',
                    value: '```\n!tiltcheck start "Stake.us" 500\n!tiltcheck bet 25 win 75\n!tiltcheck bet 50 loss\n!tiltcheck status\n!tiltcheck end\n```',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Your future self will thank you for using this' });
        
        await message.reply({ embeds: [embed] });
    }

    // Reset user tilt data (with confirmation)
    async resetTiltData(message) {
        const userId = message.author.id;
        
        // Check if user has active session
        if (this.userSessions.has(userId)) {
            return await message.reply('❌ Please end your current session first with `!tiltcheck end` before resetting data.');
        }
        
        // Clear user data
        this.userTiltData.delete(userId);
        await this.saveTiltData();
        
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🗑️ TiltCheck Data Reset')
            .setDescription('Your gambling history has been cleared. Fresh start activated!')
            .addFields(
                {
                    name: '✅ Data Cleared',
                    value: '• Session history\n• Risk profiles\n• Alert records\n• Performance statistics',
                    inline: true
                },
                {
                    name: '🎯 Next Steps',
                    value: '• Start new session anytime\n• All protections still active\n• Learning from fresh baseline',
                    inline: true
                }
            )
            .setFooter({ text: 'TiltCheck: Every day is a chance to build better habits' });
        
        await message.reply({ embeds: [embed] });
    }

    // Manual intervention trigger
    async triggerIntervention(message) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session for intervention. Start one first!');
        }
        
        // Force intervention protocols
        const interventionMessage = this.mischiefResponses.intervention[
            Math.floor(Math.random() * this.mischiefResponses.intervention.length)
        ];
        
        const riskScore = this.calculateTiltRisk(session);
        const recommendations = this.generateRecommendations(session, Math.max(riskScore, 70)); // Force high-risk recommendations
        
        const embed = new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('🆘 MANUAL INTERVENTION ACTIVATED')
            .setDescription(`**You or someone who cares about you triggered this intervention.**\n\n${interventionMessage}`)
            .addFields(
                {
                    name: '🎯 Current Session Risk',
                    value: `Risk Score: ${riskScore}/100\nConsecutive Losses: ${session.consecutiveLosses}\nTime Playing: ${Math.floor((Date.now() - session.startTime) / (1000 * 60))} minutes`,
                    inline: false
                },
                {
                    name: '🏦 Emergency Protocols',
                    value: recommendations,
                    inline: false
                },
                {
                    name: '🤝 Remember',
                    value: 'Someone cares about your wellbeing. This intervention comes from a place of love and concern for your future.',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Sometimes we need someone else to hit the brakes' });
        
        // Log manual intervention
        session.sessionAlerts.push({
            type: 'MANUAL_INTERVENTION',
            time: new Date(),
            severity: 'EMERGENCY',
            triggeredBy: 'USER_REQUEST'
        });
        
        await this.saveTiltData();
        await message.reply({ embeds: [embed] });
        
        // Also try to DM the intervention
        try {
            await message.author.send({ embeds: [embed] });
        } catch (error) {
            console.log('Could not send intervention DM to user');
        }
    }

    // Set custom alert thresholds (admin feature)
    async setTiltThresholds(message, args) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('⚙️ Current TiltCheck Thresholds')
                .setDescription('These are your current protection settings:')
                .addFields(
                    {
                        name: '📊 Alert Thresholds',
                        value: `**Stake Increase**: ${this.alertThresholds.stakeIncrease}% escalation\n**Time at Table**: ${this.alertThresholds.timeAtTable} minutes\n**Loss Sequence**: ${this.alertThresholds.lossSequence} consecutive losses\n**Rapid Betting**: ${this.alertThresholds.rapidBetting} bets in 5 minutes\n**Balance Depletion**: ${this.alertThresholds.balanceDepletion}% of bankroll`,
                        inline: false
                    },
                    {
                        name: '🛠️ Modify Thresholds',
                        value: 'Usage: `!tiltcheck alerts <setting> <value>`\n\nSettings: `stake`, `time`, `losses`, `velocity`, `depletion`',
                        inline: false
                    }
                )
                .setFooter({ text: 'TiltCheck: Customize your protection levels' });
            
            return await message.reply({ embeds: [embed] });
        }
        
        const setting = args[0].toLowerCase();
        const value = parseInt(args[1]);
        
        if (isNaN(value) || value <= 0) {
            return await message.reply('❌ Please provide a valid positive number for the threshold value.');
        }
        
        // Update thresholds based on setting
        switch (setting) {
            case 'stake':
                this.alertThresholds.stakeIncrease = value;
                break;
            case 'time':
                this.alertThresholds.timeAtTable = value;
                break;
            case 'losses':
                this.alertThresholds.lossSequence = value;
                break;
            case 'velocity':
                this.alertThresholds.rapidBetting = value;
                break;
            case 'depletion':
                this.alertThresholds.balanceDepletion = Math.min(value, 100); // Cap at 100%
                break;
            default:
                return await message.reply('❌ Invalid setting. Use: `stake`, `time`, `losses`, `velocity`, or `depletion`');
        }
        
        await message.reply(`✅ **${setting}** threshold updated to **${value}**\n\n🛡️ Your protection levels have been adjusted. Stay safe out there!`);
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

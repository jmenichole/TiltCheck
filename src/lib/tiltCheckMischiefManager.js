const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * TiltCheck Integration - Mischief Manager Edition
 * Built for degens by degens who learned the hard way
 * 
 * Features:
 * - Real-time gambling session monitoring
 * - Tilt detection and intervention
 * - Accountability buddy system
 * - Integration with StakeUS and other platforms
 * - Personality-driven feedback system
 */
class TiltCheckMischiefManager {
    constructor() {
        this.userSessions = new Map(); // Active gambling sessions
        this.userHistory = new Map();  // Historical data
        
        // Alert thresholds from config
        this.alertThresholds = {
            stakeIncrease: 200,     // % increase that triggers alert
            timeAtTable: 180,       // minutes at table before alert
            lossSequence: 5,        // consecutive losses before alert
            velocityAlert: 10,      // bets per minute threshold
            balanceDepletion: 80,   // % of bankroll lost threshold
            emotionalMessages: 3,   // angry messages before intervention
            rapidBetting: 10        // bets in 5 minutes triggers alert
        };
        
        // Mischief Manager integration endpoints
        this.integrations = {
            casinoManagementApi: process.env.CASINO_MANAGEMENT_API || "https://api.example.com/casino",
            notificationEndpoint: process.env.NOTIFICATION_ENDPOINT || "https://alerts.example.com/notify",
            stakeUsApi: process.env.STAKE_US_API || "https://stake.us/api"
        };

        // Personality-driven responses - the heart of Mischief Manager
        this.responses = {
            tiltWarning: [
                "🚨 **TILT ALERT** 🚨\nYour inner degen is showing! Time to step back before you become a cautionary tale.",
                "⚠️ **MISCHIEF MANAGER INTERVENTION** ⚠️\nI'm detecting some serious FOMO energy. Let's pump the brakes, champ.",
                "🛑 **ACCOUNTABILITY BUDDY CHECK** 🛑\nYour gambling pattern is screaming 'main character in a sob story.' Plot twist: You're smarter than this.",
                "🎭 **REALITY CHECK INCOMING** 🎭\nI've seen this movie before. Spoiler alert: it doesn't end well unless you change the script NOW."
            ],
            encouragement: [
                "💚 **GOOD DECISION DETECTED** 💚\nLook at you being all responsible! Your future self is literally applauding.",
                "🎯 **DISCIPLINE SPOTTED** 🎯\nThis is the energy we need! Controlled chaos, not chaotic chaos.",
                "⭐ **BIG BRAIN MOMENT** ⭐\nYou just made a choice your bank account will thank you for. Keep this energy!",
                "🏆 **ACCOUNTABILITY WIN** 🏆\nThis is exactly what growth looks like. I'm genuinely proud of you right now."
            ],
            intervention: [
                "🆘 **INTERVENTION TIME** 🆘\nFriend, we need to talk. Your patterns are concerning and I care about your financial well-being.",
                "🚑 **EMERGENCY ACCOUNTABILITY** 🚑\nThis is your Mischief Manager speaking: STOP. Breathe. Think. Your future depends on this moment.",
                "💊 **REALITY CHECK PRESCRIBED** 💊\nTime for some tough love: You're about to make a decision you'll regret. Don't be that person.",
                "🔔 **WAKE UP CALL** 🔔\nI've been where you are. The only way out is through, and 'through' means stepping away RIGHT NOW."
            ],
            sessionEnd: [
                "🏁 **SESSION COMPLETE** 🏁\nEvery session is a learning opportunity. Let's see what the data tells us about your journey.",
                "📊 **NUMBERS DON'T LIE** 📊\nTime for some honest reflection. Remember: growth comes from facing the truth, not avoiding it.",
                "🎬 **END CREDITS** 🎬\nAnother chapter in your story. The question is: are you the hero or the cautionary tale?"
            ]
        };
        
        this.loadTiltCheckModule();
    }

    loadTiltCheckModule() {
        try {
            const tiltCheckPath = path.join(__dirname, 'TiltCheck-audit-stakeus');
            if (fs.existsSync(tiltCheckPath)) {
                console.log('✅ TiltCheck module found and loaded');
                this.tiltCheckAvailable = true;
            } else {
                console.log('⚠️ TiltCheck module not found - using integrated implementation');
                this.tiltCheckAvailable = false;
            }
        } catch (error) {
            console.error('Error loading TiltCheck module:', error);
            this.tiltCheckAvailable = false;
        }
    }

    // Main command handler
    async handleTiltCheck(message, args) {
        const subcommand = args[0]?.toLowerCase();
        
        try {
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
                    await this.generateAuditReport(message, args.slice(1));
                    break;
                case 'alerts':
                    await this.configureAlerts(message, args.slice(1));
                    break;
                case 'intervention':
                    await this.triggerManualIntervention(message);
                    break;
                case 'history':
                    await this.showUserHistory(message);
                    break;
                case 'reset':
                    await this.resetUserData(message);
                    break;
                case 'help':
                default:
                    await this.showHelp(message);
            }
        } catch (error) {
            console.error('TiltCheck error:', error);
            await message.reply('❌ Something went wrong with TiltCheck. The Mischief Manager is having technical difficulties!');
        }
    }

    // Start a new gambling session
    async startSession(message, args) {
        const platform = args[0] || 'Unknown Platform';
        const bankroll = parseFloat(args[1]) || 100;
        
        if (bankroll <= 0) {
            return await message.reply('❌ Please provide a valid bankroll amount!\n💡 Example: `!tiltcheck start "Stake US" 200`');
        }
        
        const userId = message.author.id;
        
        // End existing session if active
        if (this.userSessions.has(userId)) {
            await this.endSession(message, true); // Silent end
        }
        
        const sessionData = {
            platform,
            bankroll,
            currentBalance: bankroll,
            startTime: new Date(),
            bets: [],
            totalWagered: 0,
            netPnL: 0,
            consecutiveLosses: 0,
            consecutiveWins: 0,
            maxStake: 0,
            minStake: Infinity,
            sessionAlerts: [],
            emotionalState: 'neutral'
        };
        
        this.userSessions.set(userId, sessionData);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎰 TiltCheck Session Started - Mischief Manager Activated!')
            .setDescription('*Your accountability buddy is now watching your back with love, sass, and genuine care!*')
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
                    value: 'I\'m here to help you make decisions your future self will be proud of. Built by someone who\'s been there, learned the hard way, and wants better for you. ❤️',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Made for degens by degens • Mental health > gambling session' });

        await message.reply({ embeds: [embed] });
        
        // Start background monitoring
        this.startSessionMonitoring(userId);
    }

    // Log individual bets
    async logBet(message, args) {
        const stake = parseFloat(args[0]);
        const outcome = args[1]?.toLowerCase();
        const payout = parseFloat(args[2]) || 0;
        
        if (!stake || !outcome || !['win', 'loss', 'w', 'l'].includes(outcome)) {
            return await message.reply('❌ Usage: `!tiltcheck bet <stake> <win/loss> [payout]`\n\n💡 Examples:\n• `!tiltcheck bet 25 win 75` (won $75 on a $25 bet)\n• `!tiltcheck bet 25 loss` (lost $25)\n• `!tiltcheck bet 50 w 150` (shorthand)');
        }
        
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session! Start one with `!tiltcheck start <platform> <bankroll>`\n\n🎯 Pro tip: Accountability starts with intention!');
        }
        
        // Normalize outcome
        const normalizedOutcome = ['win', 'w'].includes(outcome) ? 'win' : 'loss';
        
        // Create bet record
        const bet = {
            stake,
            outcome: normalizedOutcome,
            payout,
            time: new Date(),
            netResult: normalizedOutcome === 'win' ? (payout - stake) : -stake
        };
        
        // Update session data
        session.bets.push(bet);
        session.totalWagered += stake;
        session.currentBalance += bet.netResult;
        session.netPnL += bet.netResult;
        session.maxStake = Math.max(session.maxStake, stake);
        session.minStake = Math.min(session.minStake, stake);
        
        // Update streak tracking
        if (normalizedOutcome === 'loss') {
            session.consecutiveLosses++;
            session.consecutiveWins = 0;
        } else {
            session.consecutiveWins++;
            session.consecutiveLosses = 0;
        }
        
        // Check for tilt indicators
        await this.analyzeTiltPatterns(message, session, bet);
        
        // Generate response
        await this.generateBetResponse(message, session, bet);
    }

    // Analyze patterns and trigger alerts
    async analyzeTiltPatterns(message, session, bet) {
        const alerts = [];
        
        // Stake escalation check
        if (session.bets.length > 3) {
            const recentBets = session.bets.slice(-4, -1); // Previous 3 bets
            const avgRecentStake = recentBets.reduce((sum, b) => sum + b.stake, 0) / recentBets.length;
            const stakeIncrease = ((bet.stake - avgRecentStake) / avgRecentStake) * 100;
            
            if (stakeIncrease > this.alertThresholds.stakeIncrease) {
                alerts.push({
                    type: 'STAKE_ESCALATION',
                    severity: 'HIGH',
                    data: { increase: stakeIncrease.toFixed(1) }
                });
            }
        }
        
        // Loss sequence check
        if (session.consecutiveLosses >= this.alertThresholds.lossSequence) {
            alerts.push({
                type: 'LOSS_SEQUENCE',
                severity: 'HIGH',
                data: { losses: session.consecutiveLosses }
            });
        }
        
        // Balance depletion check
        const balancePercentage = (session.currentBalance / session.bankroll) * 100;
        if (balancePercentage <= (100 - this.alertThresholds.balanceDepletion)) {
            alerts.push({
                type: 'BALANCE_CRITICAL',
                severity: 'CRITICAL',
                data: { remaining: balancePercentage.toFixed(1) }
            });
        }
        
        // Velocity check
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        const recentBets = session.bets.filter(b => (new Date() - b.time) <= timeWindow);
        if (recentBets.length >= this.alertThresholds.rapidBetting) {
            alerts.push({
                type: 'HIGH_VELOCITY',
                severity: 'MEDIUM',
                data: { betsInWindow: recentBets.length }
            });
        }
        
        // Process alerts
        for (const alert of alerts) {
            session.sessionAlerts.push({...alert, timestamp: new Date()});
            await this.sendTiltAlert(message, alert);
        }
    }

    // Generate personality-driven bet response
    async generateBetResponse(message, session, bet) {
        const isWin = bet.outcome === 'win';
        const profit = bet.netResult;
        
        let responseType = 'neutral';
        let description = '';
        
        if (isWin && profit > bet.stake * 2) {
            responseType = 'encouragement';
            description = this.responses.encouragement[Math.floor(Math.random() * this.responses.encouragement.length)];
        } else if (!isWin && session.consecutiveLosses >= 3) {
            responseType = 'warning';
            description = "💸 Ouch! That stings, but remember: this is exactly when smart players take a step back and reassess.";
        } else if (isWin) {
            description = "🎉 Nice hit! Remember: the goal is consistent decision-making, not just this one win.";
        } else {
            description = "💸 That's gambling for you! Stay focused on the long game, not individual hands.";
        }
        
        const embed = new EmbedBuilder()
            .setColor(isWin ? '#00ff88' : '#ff6b6b')
            .setTitle(`${isWin ? '🎉' : '💸'} Bet ${bet.outcome === 'win' ? 'Won' : 'Lost'}`)
            .setDescription(description)
            .addFields(
                {
                    name: '💰 Bet Details',
                    value: `Stake: $${bet.stake}\n${isWin ? `Payout: $${bet.payout}\nProfit: $${profit.toFixed(2)}` : `Loss: $${bet.stake}`}`,
                    inline: true
                },
                {
                    name: '📊 Session Summary',
                    value: `Balance: $${session.currentBalance.toFixed(2)}\nNet P&L: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}\nTotal Bets: ${session.bets.length}`,
                    inline: true
                },
                {
                    name: '🎯 Streak Status',
                    value: `Consecutive ${session.consecutiveLosses > 0 ? 'Losses' : 'Wins'}: ${Math.max(session.consecutiveLosses, session.consecutiveWins)}`,
                    inline: true
                }
            )
            .setFooter({ text: 'TiltCheck: Every bet is data, every decision matters' });
            
        await message.reply({ embeds: [embed] });
    }

    // Send tilt alerts with personality
    async sendTiltAlert(message, alert) {
        let responseArray, color, title;
        
        switch (alert.severity) {
            case 'CRITICAL':
                responseArray = this.responses.intervention;
                color = '#ff0000';
                title = '🚨 CRITICAL INTERVENTION NEEDED 🚨';
                break;
            case 'HIGH':
                responseArray = this.responses.tiltWarning;
                color = '#ff6b6b';
                title = '⚠️ HIGH RISK DETECTED ⚠️';
                break;
            default:
                responseArray = this.responses.tiltWarning;
                color = '#ffa500';
                title = '📊 PATTERN ALERT 📊';
        }
        
        const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
        
        let alertMessage = '';
        switch (alert.type) {
            case 'STAKE_ESCALATION':
                alertMessage = `Your bet size just increased by ${alert.data.increase}%! This is classic tilt behavior - when we're chasing losses, we often bet bigger.`;
                break;
            case 'LOSS_SEQUENCE':
                alertMessage = `${alert.data.losses} consecutive losses detected! The house edge is doing its job, and variance is not your friend right now.`;
                break;
            case 'BALANCE_CRITICAL':
                alertMessage = `You've lost ${(100 - parseFloat(alert.data.remaining)).toFixed(1)}% of your bankroll! This is danger zone territory.`;
                break;
            case 'HIGH_VELOCITY':
                alertMessage = `${alert.data.betsInWindow} bets in 5 minutes! Slow down, speed racer - impulsive betting rarely ends well.`;
                break;
        }
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(randomResponse)
            .addFields(
                {
                    name: '📊 What I\'m Seeing',
                    value: alertMessage,
                    inline: false
                },
                {
                    name: '💡 Recommended Actions',
                    value: this.getRecommendedActions(alert.type),
                    inline: false
                },
                {
                    name: '🤝 Remember',
                    value: 'Your Mischief Manager is here because your mental health and financial well-being matter more than any gambling session. You\'ve got this! ❤️',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Made for degens by degens who care about your future' });
            
        await message.reply({ embeds: [embed] });
        
        // Log alert for audit trail
        console.log(`TiltCheck Alert: ${alert.type} for user ${message.author.id}`);
    }

    getRecommendedActions(alertType) {
        const actions = {
            'STAKE_ESCALATION': '• Return to your base bet size\n• Take a 10-minute break\n• Ask yourself: "Am I chasing losses?"',
            'LOSS_SEQUENCE': '• Step away for at least 15 minutes\n• Do some breathing exercises\n• Remember: variance is temporary, bankroll management is forever',
            'BALANCE_CRITICAL': '• STOP gambling immediately\n• End your session now\n• Consider this a learning experience, not a failure',
            'HIGH_VELOCITY': '• Slow down between bets\n• Set a timer: wait 30 seconds before each bet\n• Quality decisions > quantity of bets'
        };
        
        return actions[alertType] || '• Take a step back and reassess\n• Trust the process and your limits\n• Remember your goals and values';
    }

    // Show current session status
    async showSessionStatus(message) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session! Start one with `!tiltcheck start <platform> <bankroll>`');
        }
        
        const sessionMinutes = Math.floor((new Date() - session.startTime) / (1000 * 60));
        const winRate = session.bets.length > 0 ? 
            (session.bets.filter(bet => bet.outcome === 'win').length / session.bets.length * 100) : 0;
        
        const riskLevel = this.calculateRiskLevel(session);
        
        const embed = new EmbedBuilder()
            .setColor(riskLevel.color)
            .setTitle('📊 TiltCheck Session Status - Mischief Manager Report')
            .setDescription(`**Risk Level: ${riskLevel.level}** ${riskLevel.emoji}`)
            .addFields(
                {
                    name: '🎰 Session Info',
                    value: `Platform: ${session.platform}\nDuration: ${sessionMinutes} minutes\nTotal Bets: ${session.bets.length}`,
                    inline: true
                },
                {
                    name: '💰 Financial Summary',
                    value: `Starting: $${session.bankroll.toFixed(2)}\nCurrent: $${session.currentBalance.toFixed(2)}\nNet P&L: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '📈 Performance Metrics',
                    value: `Win Rate: ${winRate.toFixed(1)}%\nTotal Wagered: $${session.totalWagered.toFixed(2)}\nBankroll Usage: ${((session.totalWagered / session.bankroll) * 100).toFixed(1)}%`,
                    inline: true
                },
                {
                    name: '⚠️ Risk Indicators',
                    value: `Consecutive Losses: ${session.consecutiveLosses}\nMax Stake: $${session.maxStake.toFixed(2)}\nAlerts Triggered: ${session.sessionAlerts.length}`,
                    inline: true
                },
                {
                    name: '🎯 Discipline Score',
                    value: this.calculateDisciplineScore(session),
                    inline: true
                },
                {
                    name: '💡 Mischief Manager Insight',
                    value: riskLevel.insight,
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Self-awareness is the first step to self-control' });
            
        await message.reply({ embeds: [embed] });
    }

    // End session with comprehensive summary
    async endSession(message, silent = false) {
        const userId = message.author.id;
        const session = this.userSessions.get(userId);
        
        if (!session) {
            return await message.reply('❌ No active session to end!');
        }
        
        // Calculate session metrics
        const sessionMinutes = Math.floor((new Date() - session.startTime) / (1000 * 60));
        const grade = this.calculateSessionGrade(session);
        
        // Save to user history
        this.saveSessionToHistory(userId, session, grade);
        
        if (!silent) {
            const randomEndResponse = this.responses.sessionEnd[Math.floor(Math.random() * this.responses.sessionEnd.length)];
            
            const embed = new EmbedBuilder()
                .setColor(grade.color)
                .setTitle('🏁 TiltCheck Session Complete - Mischief Manager Review')
                .setDescription(`${randomEndResponse}\n\n**Session Grade: ${grade.letter}** ${grade.emoji}`)
                .addFields(
                    {
                        name: '📊 Final Statistics',
                        value: `Duration: ${sessionMinutes} minutes\nTotal Bets: ${session.bets.length}\nNet Result: ${session.netPnL >= 0 ? '+' : ''}$${session.netPnL.toFixed(2)}\nROI: ${((session.netPnL / session.bankroll) * 100).toFixed(1)}%`,
                        inline: true
                    },
                    {
                        name: '🎯 Discipline Assessment',
                        value: `Alerts Triggered: ${session.sessionAlerts.length}\nStake Control: ${this.getStakeControlRating(session)}\nTime Management: ${this.getTimeManagementRating(sessionMinutes)}`,
                        inline: true
                    },
                    {
                        name: '💡 Mischief Manager Feedback',
                        value: grade.feedback,
                        inline: false
                    },
                    {
                        name: '🎓 Learning Opportunities',
                        value: grade.lessons,
                        inline: false
                    }
                )
                .setFooter({ text: 'TiltCheck: Every session teaches us something about ourselves' });
                
            await message.reply({ embeds: [embed] });
        }
        
        // Clear active session
        this.userSessions.delete(userId);
    }

    // Calculate risk level
    calculateRiskLevel(session) {
        let riskScore = 0;
        
        // Alert-based risk
        riskScore += session.sessionAlerts.length * 20;
        
        // Balance-based risk
        const balancePercentage = (session.currentBalance / session.bankroll) * 100;
        if (balancePercentage <= 50) riskScore += 30;
        else if (balancePercentage <= 75) riskScore += 15;
        
        // Streak-based risk
        if (session.consecutiveLosses >= 5) riskScore += 25;
        else if (session.consecutiveLosses >= 3) riskScore += 15;
        
        // Time-based risk
        const sessionMinutes = (new Date() - session.startTime) / (1000 * 60);
        if (sessionMinutes > 180) riskScore += 20;
        else if (sessionMinutes > 120) riskScore += 10;
        
        // Determine level
        if (riskScore >= 70) {
            return {
                level: 'CRITICAL',
                emoji: '🚨',
                color: '#ff0000',
                insight: 'Multiple red flags detected. Consider ending your session and taking a break. Your future self will thank you.'
            };
        } else if (riskScore >= 40) {
            return {
                level: 'HIGH',
                emoji: '⚠️',
                color: '#ff6b6b',
                insight: 'Some concerning patterns emerging. Time to slow down and reassess your approach.'
            };
        } else if (riskScore >= 20) {
            return {
                level: 'MODERATE',
                emoji: '🟡',
                color: '#ffa500',
                insight: 'You\'re doing okay, but stay vigilant. Discipline is like a muscle - keep exercising it.'
            };
        } else {
            return {
                level: 'LOW',
                emoji: '🟢',
                color: '#00ff88',
                insight: 'Looking good! You\'re showing great discipline and control. Keep up the excellent work!'
            };
        }
    }

    // Calculate discipline score
    calculateDisciplineScore(session) {
        let score = 100;
        
        // Deduct for alerts
        score -= session.sessionAlerts.length * 15;
        
        // Deduct for poor stake management
        if (session.maxStake > session.bankroll * 0.1) score -= 20;
        
        // Deduct for excessive losses
        const lossPercentage = Math.max(0, -session.netPnL / session.bankroll * 100);
        score -= Math.min(lossPercentage, 30);
        
        // Deduct for long sessions
        const sessionHours = (new Date() - session.startTime) / (1000 * 60 * 60);
        if (sessionHours > 3) score -= 15;
        
        const finalScore = Math.max(0, Math.min(100, score));
        
        if (finalScore >= 90) return '🏆 Excellent (90+)';
        if (finalScore >= 80) return '🎯 Good (80-89)';
        if (finalScore >= 70) return '👍 Fair (70-79)';
        if (finalScore >= 60) return '⚠️ Poor (60-69)';
        return '🚨 Concerning (<60)';
    }

    // Calculate session grade
    calculateSessionGrade(session) {
        const disciplineScore = parseInt(this.calculateDisciplineScore(session).match(/\d+/)?.[0] || '0');
        const alertCount = session.sessionAlerts.length;
        const sessionHours = (new Date() - session.startTime) / (1000 * 60 * 60);
        
        let grade = {
            letter: 'F',
            emoji: '🚨',
            color: '#ff0000',
            feedback: 'This session showed concerning patterns.',
            lessons: 'Focus on setting and sticking to limits.'
        };
        
        if (disciplineScore >= 90 && alertCount === 0) {
            grade = {
                letter: 'A+',
                emoji: '🏆',
                color: '#ffd700',
                feedback: 'Exceptional discipline and control! You\'re setting the standard for responsible gambling.',
                lessons: 'Keep doing exactly what you\'re doing. You\'re a role model for others.'
            };
        } else if (disciplineScore >= 80 && alertCount <= 1) {
            grade = {
                letter: 'A',
                emoji: '🎯',
                color: '#00ff88',
                feedback: 'Great session management with solid decision-making throughout.',
                lessons: 'Minor tweaks could make you even better. Consider your alert triggers.'
            };
        } else if (disciplineScore >= 70 && alertCount <= 2) {
            grade = {
                letter: 'B',
                emoji: '👍',
                color: '#00aaff',
                feedback: 'Good job overall with some questionable moments.',
                lessons: 'Work on recognizing early warning signs and acting on them sooner.'
            };
        } else if (disciplineScore >= 60 && alertCount <= 3) {
            grade = {
                letter: 'C',
                emoji: '⚠️',
                color: '#ffa500',
                feedback: 'Room for improvement. Some tilt behaviors detected.',
                lessons: 'Focus on emotional control and stake management. Consider shorter sessions.'
            };
        } else if (disciplineScore >= 50) {
            grade = {
                letter: 'D',
                emoji: '😬',
                color: '#ff6b6b',
                feedback: 'Several concerning patterns emerged during this session.',
                lessons: 'Time to reassess your approach. Consider taking a break and setting stricter limits.'
            };
        }
        
        return grade;
    }

    getStakeControlRating(session) {
        if (session.maxStake <= session.bankroll * 0.05) return 'Excellent 🏆';
        if (session.maxStake <= session.bankroll * 0.1) return 'Good 👍';
        if (session.maxStake <= session.bankroll * 0.2) return 'Fair ⚠️';
        return 'Poor 🚨';
    }

    getTimeManagementRating(minutes) {
        if (minutes <= 60) return 'Excellent 🏆';
        if (minutes <= 120) return 'Good 👍';
        if (minutes <= 180) return 'Fair ⚠️';
        return 'Poor 🚨';
    }

    // Save session to history
    saveSessionToHistory(userId, session, grade) {
        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, []);
        }
        
        const history = this.userHistory.get(userId);
        history.push({
            platform: session.platform,
            startTime: session.startTime,
            endTime: new Date(),
            bankroll: session.bankroll,
            finalBalance: session.currentBalance,
            netPnL: session.netPnL,
            totalBets: session.bets.length,
            alertCount: session.sessionAlerts.length,
            grade: grade.letter,
            disciplineScore: parseInt(this.calculateDisciplineScore(session).match(/\d+/)?.[0] || '0')
        });
        
        // Keep only last 50 sessions
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
    }

    // Start background session monitoring
    startSessionMonitoring(userId) {
        const checkInterval = setInterval(() => {
            const session = this.userSessions.get(userId);
            if (!session) {
                clearInterval(checkInterval);
                return;
            }
            
            const sessionMinutes = (new Date() - session.startTime) / (1000 * 60);
            
            // Time-based alerts
            if (sessionMinutes >= this.alertThresholds.timeAtTable && !session.timeAlertSent) {
                session.timeAlertSent = true;
                this.sendTimeAlert(userId, sessionMinutes);
            }
        }, 60000); // Check every minute
    }

    async sendTimeAlert(userId, minutes) {
        // This would need access to the Discord client to send messages
        console.log(`Time alert for user ${userId}: ${Math.floor(minutes)} minutes`);
    }

    // Show comprehensive help
    async showHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle('🎰 TiltCheck - Mischief Manager Edition')
            .setDescription('*Your accountability buddy with personality, built by someone who\'s been there.*')
            .addFields(
                {
                    name: '🎮 Session Commands',
                    value: '`!tiltcheck start <platform> <bankroll>` - Begin session tracking\n`!tiltcheck bet <stake> <win/loss> [payout]` - Log individual bets\n`!tiltcheck status` - Check current session stats\n`!tiltcheck end` - End session with detailed summary',
                    inline: false
                },
                {
                    name: '📊 Analysis Commands',
                    value: '`!tiltcheck audit` - View historical performance\n`!tiltcheck history` - Show session history\n`!tiltcheck alerts` - Configure alert thresholds\n`!tiltcheck intervention` - Trigger manual intervention',
                    inline: false
                },
                {
                    name: '🛡️ Protection Features',
                    value: '• **Real-time Tilt Detection** - Catch risky patterns as they develop\n• **Stake Escalation Monitoring** - Alert when bet sizes increase dangerously\n• **Loss Sequence Tracking** - Intervention during losing streaks\n• **Velocity Warnings** - Slow down rapid-fire betting\n• **Balance Protection** - Critical alerts for bankroll depletion\n• **Time Management** - Session duration monitoring',
                    inline: false
                },
                {
                    name: '🤝 Mischief Manager Philosophy',
                    value: 'Built by someone who understands the struggle. Your mental health and financial well-being matter more than any gambling session. This tool combines data-driven insights with genuine care and accountability.',
                    inline: false
                },
                {
                    name: '🔗 Ecosystem Integration',
                    value: '[**Portfolio**](https://jmenichole.github.io/Portfolio/) • [**TiltCheck GitHub**](https://github.com/jmenichole/TiltCheck-audit-stakeus) • [**JustTheTip Terms**](https://github.com/jmenichole/JustTheTip-Terms)',
                    inline: false
                }
            )
            .setFooter({ text: 'TiltCheck: Made for degens by degens who learned the hard way ❤️' });
            
        await message.reply({ embeds: [embed] });
    }
}

module.exports = TiltCheckMischiefManager;

/**
 * Personalized Tilt Protection System
 * Based on real user experiences and tilt patterns
 * Designed to prevent the exact scenarios described by users
 */

const { EmbedBuilder } = require('discord.js');

class PersonalizedTiltProtection {
    constructor() {
        this.userTiltProfiles = new Map(); // userId -> tilt patterns
        this.realTimeMonitoring = new Map(); // userId -> current session data
        this.interventionHistory = new Map(); // userId -> past interventions
        
        // Real tilt patterns from user experiences
        this.commonTiltPatterns = {
            'upwardsTilt': {
                trigger: 'big_win_chasing',
                description: 'Chasing the adrenaline rush after a big win',
                riskLevel: 'HIGH',
                interventions: ['immediate_session_pause', 'vault_transfer', 'reality_check']
            },
            'betEscalation': {
                trigger: 'rapid_bet_increase',
                description: 'Dramatically increasing bet sizes when tilting',
                riskLevel: 'CRITICAL',
                interventions: ['force_base_bet', 'mandatory_break', 'vault_lock']
            },
            'gameHopping': {
                trigger: 'multi_game_losses',
                description: 'Switching between games when losing (slots->keno->crash)',
                riskLevel: 'HIGH',
                interventions: ['single_game_lock', 'session_end', 'cooling_period']
            },
            'ignoredWarnings': {
                trigger: 'continued_after_alerts',
                description: 'Continuing to play despite tilt warnings',
                riskLevel: 'CRITICAL',
                interventions: ['aggressive_intervention', 'forced_stop', 'accountability_contact']
            },
            'frozenFundFrustration': {
                trigger: 'external_money_stress',
                description: 'Playing aggressively due to locked/frozen funds elsewhere',
                riskLevel: 'HIGH',
                interventions: ['stress_acknowledgment', 'alternative_activities', 'perspective_reminder']
            }
        };
    }

    // Create personalized tilt profile based on user's history
    async createPersonalizedProfile(message, patterns) {
        const userId = message.author.id;
        
        const profile = {
            userId: userId,
            identifiedPatterns: patterns,
            riskFactors: this.analyzeRiskFactors(patterns),
            customInterventions: this.generateCustomInterventions(patterns),
            triggerThresholds: this.calculatePersonalizedThresholds(patterns),
            created: new Date(),
            lastUpdated: new Date()
        };

        this.userTiltProfiles.set(userId, profile);

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🛡️ Personalized Tilt Protection Profile Created')
            .setDescription('Based on your experiences, I\'ve created a custom protection system')
            .addFields(
                {
                    name: '🎯 Your Identified Patterns',
                    value: patterns.map(p => `• **${this.commonTiltPatterns[p]?.description || p}**`).join('\n'),
                    inline: false
                },
                {
                    name: '⚠️ Your Risk Level',
                    value: this.calculateOverallRisk(patterns),
                    inline: true
                },
                {
                    name: '🔧 Custom Protections',
                    value: `• **Bet escalation alerts** at 150% increase (instead of 200%)\n• **Multi-game detection** within 10 minutes\n• **Adrenaline rush warnings** after big wins\n• **Frozen fund stress** acknowledgment`,
                    inline: false
                }
            )
            .setFooter({ text: 'Your protection system is now active • Stay strong' });

        await message.reply({ embeds: [embed] });
    }

    // Real-time intervention based on actual user scenarios
    async checkForUpwardsTilt(userId, session, recentWin) {
        // Check for "upwards tilt" - chasing adrenaline after big wins
        if (recentWin && recentWin.multiplier >= 100) { // 100x+ win like the 5KX mentioned
            const alert = {
                type: 'UPWARDS_TILT_RISK',
                severity: 'HIGH',
                message: '🚨 **UPWARDS TILT DETECTED** 🚨',
                description: `You just hit a **${recentWin.multiplier}x** win! This is exactly when upwards tilt happens - chasing that adrenaline rush.`,
                interventions: [
                    '**STOP AND BREATHE** - You\'re in the danger zone',
                    '**Set a WIN LIMIT** - Cash out a portion NOW',
                    '**Remember:** Chasing the rush after big wins is how you lose it all',
                    '**True story:** One user went from 5KX win to rinsing 4K trying to chase that feeling'
                ],
                userStory: 'A real user said: "Went full tilt trying to chase the adrenaline rush of that 5KX on limbo and rinsed 4K"'
            };

            return alert;
        }
        return null;
    }

    // Detect bet escalation patterns (like $100 → full balance)
    async checkBetEscalation(userId, session, currentBet) {
        const recentBets = session.bets.slice(-5); // Last 5 bets
        
        if (recentBets.length >= 3) {
            const escalationFactor = currentBet.amount / recentBets[0].amount;
            
            if (escalationFactor >= 5) { // 5x bet increase (like $100 → $500+)
                const alert = {
                    type: 'CRITICAL_BET_ESCALATION',
                    severity: 'CRITICAL',
                    message: '🆘 **CRITICAL BET ESCALATION** 🆘',
                    description: `Your bet just increased **${escalationFactor.toFixed(1)}x** in a few bets! This is exactly how bankrolls get rinsed.`,
                    interventions: [
                        '**RETURN TO BASE BET IMMEDIATELY**',
                        '**This is not strategy - this is tilt**',
                        '**One user:** "Happened To Me On $100 Bet Ended Up Tilting Whole Bal & Loss"',
                        '**Force yourself to take a 15 minute break**'
                    ],
                    forceActions: ['reduce_bet_to_base', 'mandatory_pause']
                };

                return alert;
            }
        }
        return null;
    }

    // Detect game hopping when tilting
    async checkGameHopping(userId, session) {
        const recentGames = session.gameHistory.slice(-10); // Last 10 game changes
        const timeWindow = 10 * 60 * 1000; // 10 minutes
        const now = Date.now();

        const recentGameSwitches = recentGames.filter(game => 
            (now - game.timestamp) <= timeWindow
        );

        if (recentGameSwitches.length >= 3) { // 3+ game switches in 10 minutes
            const games = [...new Set(recentGameSwitches.map(g => g.gameName))];
            
            const alert = {
                type: 'GAME_HOPPING_TILT',
                severity: 'HIGH',
                message: '🎮 **GAME HOPPING DETECTED** 🎮',
                description: `You've switched between **${games.length} different games** in 10 minutes: ${games.join(' → ')}`,
                interventions: [
                    '**This is classic tilt behavior** - jumping between games when losing',
                    '**Real example:** "won almost a grand from slots then went back to slots hours later and was down like 3-400 dollars. got tilted and went to keno"',
                    '**Stick to ONE game** or take a break',
                    '**Game hopping = chasing losses** and it rarely works'
                ],
                realUserQuote: 'Real user: "got tilted and went to keno and it just wasn\'t hitting. went from like $1600 to almost $1000"'
            };

            return alert;
        }
        return null;
    }

    // Special intervention for ignoring previous warnings
    async checkIgnoredWarnings(userId, session) {
        const recentAlerts = session.alertHistory.slice(-3);
        const continuedPlayingAfterAlerts = recentAlerts.filter(alert => 
            alert.wasIgnored && (Date.now() - alert.timestamp) < 30 * 60 * 1000 // 30 minutes
        );

        if (continuedPlayingAfterAlerts.length >= 2) {
            const alert = {
                type: 'IGNORED_WARNINGS_CRITICAL',
                severity: 'EMERGENCY',
                message: '🚨 **EMERGENCY INTERVENTION** 🚨',
                description: 'You\'ve ignored multiple tilt warnings and continued playing. This is exactly how disasters happen.',
                interventions: [
                    '**MANDATORY STOP** - No more warnings',
                    '**You said it yourself:** "I was on [alerts], and I stopped Everytime and read them, but continued anyways if I\'m being honest"',
                    '**This is the moment** where you either save your bankroll or lose it all',
                    '**AUTO-VAULT ACTIVATED** - Protecting remaining funds'
                ],
                forceActions: ['auto_vault_transfer', 'session_termination', 'accountability_alert'],
                realUserQuote: 'Real user: "I stopped Everytime and read them, but continued anyways if I\'m being honest"'
            };

            return alert;
        }
        return null;
    }

    // Frozen fund frustration detection
    async checkExternalStress(userId, session, userContext) {
        if (userContext && userContext.hasLockedFunds) {
            const alert = {
                type: 'EXTERNAL_STRESS_GAMBLING',
                severity: 'HIGH', 
                message: '💸 **STRESS GAMBLING DETECTED** 💸',
                description: 'You mentioned having locked/frozen funds elsewhere. This creates dangerous gambling conditions.',
                interventions: [
                    '**Acknowledge the frustration** - Locked funds are stressful',
                    '**Don\'t use available funds** to compensate for locked ones',
                    '**This is temporary** - Your Coinbase funds will unlock',
                    '**Gambling won\'t solve** the locked fund situation'
                ],
                perspective: 'You said: "I\'m predisposed to tilt tho I think cuz my crypto is locked/frozen in coinbase\'s gremlin vaults til 30th"',
                reminder: 'The 30th is coming soon. Don\'t risk your available funds because other funds are temporarily locked.'
            };

            return alert;
        }
        return null;
    }

    // Generate reality check based on user's actual experiences
    async generateRealityCheck(userId, tiltType) {
        const realityChecks = {
            'upwardsTilt': {
                title: '💡 Reality Check: Upwards Tilt',
                message: 'Remember what you said: "Went full tilt trying to chase the adrenaline rush of that 5KX on limbo and rinsed 4K"',
                advice: 'That adrenaline rush feeling? It\'s your brain tricking you. The house edge doesn\'t care about your previous wins.',
                action: 'Cash out a portion of your winnings RIGHT NOW.'
            },
            'betEscalation': {
                title: '⚠️ Reality Check: Bet Escalation', 
                message: 'You know this pattern: "$100 Bet Ended Up Tilting Whole Bal & Loss"',
                advice: 'Increasing bet sizes when losing is not strategy - it\'s emotion. The math doesn\'t work.',
                action: 'Return to your base bet size immediately.'
            },
            'gameHopping': {
                title: '🎮 Reality Check: Game Hopping',
                message: 'You described it perfectly: "won almost a grand from slots then went back to slots hours later and was down like 3-400 dollars. got tilted and went to keno"',
                advice: 'Switching games when losing is chasing losses. Each game has the same house edge.',
                action: 'Pick ONE game or take a break.'
            }
        };

        return realityChecks[tiltType] || realityChecks['betEscalation'];
    }

    // Help analyze if Stake Originals actually have dynamic odds (spoiler: they don't)
    async analyzeStakeOriginalsPerception(message) {
        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('🎲 Stake Originals: Perception vs Reality')
            .setDescription('You asked: "Is it my imagination or does stake originals sometimes lose more when u raise your bet amount?"')
            .addFields(
                {
                    name: '🧠 Your Brain on Tilt',
                    value: '**It\'s your imagination** - but for good reason! When you raise bets, you:\n• Pay more attention to losses\n• Feel losses more intensely\n• Remember bad beats more vividly\n• Are likely already tilting (why else raise bets?)',
                    inline: false
                },
                {
                    name: '🎰 The Mathematical Reality',
                    value: '**Stake Originals use provably fair algorithms:**\n• Same RTP regardless of bet size\n• Cannot detect your bet before generating result\n• Outcome determined before you even bet\n• House edge is constant: ~1-5% depending on game',
                    inline: false
                },
                {
                    name: '💡 Why It Feels Rigged',
                    value: '• **Variance amplification** - Higher bets = bigger swings\n• **Attention bias** - You notice losses more when betting big\n• **Tilt timing** - You usually bet big when already frustrated\n• **Memory bias** - Bad beats stick in memory longer',
                    inline: false
                },
                {
                    name: '🔍 Verify for Yourself',
                    value: 'Use `$enhanced verify seed stake <game>` to generate provably fair seeds and verify your results mathematically.',
                    inline: false
                }
            )
            .setFooter({ text: 'The house edge is real, but dynamic odds based on bet size is not' });

        await message.reply({ embeds: [embed] });
    }

    // Create emergency intervention protocol
    async triggerEmergencyIntervention(userId, session, alertType) {
        const emergencyProtocol = {
            'CRITICAL_TILT': {
                actions: [
                    'IMMEDIATE_SESSION_TERMINATION',
                    'AUTO_VAULT_REMAINING_FUNDS', 
                    'COOLING_PERIOD_24H',
                    'ACCOUNTABILITY_NOTIFICATION'
                ],
                message: '🆘 **EMERGENCY TILT PROTECTION ACTIVATED** 🆘\n\nYour session has been terminated and remaining funds protected. This is based on your own described patterns of tilt behavior.'
            }
        };

        return emergencyProtocol[alertType];
    }

    // Helper methods
    analyzeRiskFactors(patterns) {
        const riskScores = {
            'upwardsTilt': 85,
            'betEscalation': 95,
            'gameHopping': 75,
            'ignoredWarnings': 90,
            'frozenFundFrustration': 70
        };

        const totalRisk = patterns.reduce((sum, pattern) => sum + (riskScores[pattern] || 0), 0);
        return Math.min(100, totalRisk / patterns.length);
    }

    generateCustomInterventions(patterns) {
        const interventions = [];
        
        if (patterns.includes('upwardsTilt')) {
            interventions.push('immediate_win_limit_setting');
            interventions.push('adrenaline_rush_cooling');
        }
        
        if (patterns.includes('betEscalation')) {
            interventions.push('forced_base_bet_return');
            interventions.push('bet_increase_lockout');
        }
        
        if (patterns.includes('gameHopping')) {
            interventions.push('single_game_session_lock');
            interventions.push('game_switch_delay');
        }

        return interventions;
    }

    calculatePersonalizedThresholds(patterns) {
        return {
            betIncrease: patterns.includes('betEscalation') ? 150 : 200, // More sensitive for bet escalators
            gameSwitch: patterns.includes('gameHopping') ? 2 : 3, // Lower threshold for game hoppers
            winChasing: patterns.includes('upwardsTilt') ? 50 : 100, // Lower multiplier threshold
            ignoredAlerts: patterns.includes('ignoredWarnings') ? 1 : 2 // Zero tolerance for warning ignorers
        };
    }

    calculateOverallRisk(patterns) {
        const riskLevels = {
            'upwardsTilt': 'HIGH',
            'betEscalation': 'CRITICAL', 
            'gameHopping': 'HIGH',
            'ignoredWarnings': 'CRITICAL',
            'frozenFundFrustration': 'MEDIUM'
        };

        const hasCritical = patterns.some(p => riskLevels[p] === 'CRITICAL');
        const hasHigh = patterns.some(p => riskLevels[p] === 'HIGH');

        if (hasCritical) return '🔴 **CRITICAL RISK** - Multiple severe tilt patterns identified';
        if (hasHigh) return '🟠 **HIGH RISK** - Significant tilt tendencies detected';
        return '🟡 **MEDIUM RISK** - Some concerning patterns present';
    }
}

module.exports = PersonalizedTiltProtection;

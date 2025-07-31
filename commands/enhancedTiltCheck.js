/**
 * Enhanced TiltCheck Commands with Comprehensive Verification
 * Integrates verification system, CollectClock tracking, and multi-platform monitoring
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const EnhancedTiltCheckIntegration = require('../enhancedTiltCheckIntegration');

// Initialize the enhanced TiltCheck system
const tiltCheck = new EnhancedTiltCheckIntegration();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tiltcheck')
        .setDescription('Enhanced TiltCheck commands with verification')
        .addSubcommand(subcommand =>
            subcommand
                .setName('verify')
                .setDescription('Start comprehensive verification for enhanced tilt monitoring')
                .addStringOption(option =>
                    option.setName('wallets')
                        .setDescription('Comma-separated wallet addresses (ETH, BTC, SOL formats)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('stake_account')
                        .setDescription('Your Stake account ID')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('casino_sessions')
                        .setDescription('JSON of casino session data')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('enable_collectclock')
                        .setDescription('Enable CollectClock bonus tracking')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start enhanced tilt monitoring (requires verification)')
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('Monitoring duration in hours (default: 24)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check your current tilt monitoring status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop tilt monitoring'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('patterns')
                .setDescription('View detected tilt patterns')
                .addBooleanOption(option =>
                    option.setName('detailed')
                        .setDescription('Show detailed pattern analysis')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('collectclock')
                .setDescription('View CollectClock bonus tracking status')
                .addStringOption(option =>
                    option.setName('casino')
                        .setDescription('Specific casino to check')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('wallet')
                .setDescription('Check wallet verification and monitoring status')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Specific wallet address to check')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('casino')
                .setDescription('Manage casino session tracking')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to perform')
                        .addChoices(
                            { name: 'add', value: 'add' },
                            { name: 'remove', value: 'remove' },
                            { name: 'list', value: 'list' },
                            { name: 'verify', value: 'verify' }
                        )
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('casino_name')
                        .setDescription('Casino name (stake.us, trustdice, rollbit, etc.)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('alerts')
                .setDescription('Configure tilt detection alerts')
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Alert level threshold')
                        .addChoices(
                            { name: 'Low (30%)', value: 'LOW' },
                            { name: 'Medium (50%)', value: 'MEDIUM' },
                            { name: 'High (70%)', value: 'HIGH' },
                            { name: 'Critical (85%)', value: 'CRITICAL' }
                        )
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('enable_dm')
                        .setDescription('Enable direct message alerts')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case 'verify':
                    await handleVerifyCommand(interaction, userId);
                    break;
                case 'start':
                    await handleStartCommand(interaction, userId);
                    break;
                case 'status':
                    await handleStatusCommand(interaction, userId);
                    break;
                case 'stop':
                    await handleStopCommand(interaction, userId);
                    break;
                case 'patterns':
                    await handlePatternsCommand(interaction, userId);
                    break;
                case 'collectclock':
                    await handleCollectClockCommand(interaction, userId);
                    break;
                case 'wallet':
                    await handleWalletCommand(interaction, userId);
                    break;
                case 'casino':
                    await handleCasinoCommand(interaction, userId);
                    break;
                case 'alerts':
                    await handleAlertsCommand(interaction, userId);
                    break;
                default:
                    await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
            }
        } catch (error) {
            console.error('TiltCheck command error:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing your TiltCheck command.', 
                ephemeral: true 
            });
        }
    }
};

// Handle verification command
async function handleVerifyCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const wallets = interaction.options.getString('wallets');
    const stakeAccount = interaction.options.getString('stake_account');
    const casinoSessions = interaction.options.getString('casino_sessions');
    const enableCollectClock = interaction.options.getBoolean('enable_collectclock') ?? true;

    // Build verification data
    const verificationData = {
        discordSession: {
            sessionId: interaction.guild?.id || 'dm',
            servers: [], // Would be populated from Discord API
            averageOnlineHours: 8, // Mock data
            lateNightSessions: 0
        }
    };

    // Parse wallet addresses
    if (wallets) {
        verificationData.wallets = wallets.split(',').map(address => ({
            address: address.trim(),
            chain: detectChainFromAddress(address.trim())
        }));
    }

    // Add Stake account if provided
    if (stakeAccount) {
        verificationData.stakeAccount = {
            accountId: stakeAccount,
            sessionToken: 'user_provided' // In real implementation, user would provide this securely
        };
    }

    // Parse casino sessions
    if (casinoSessions) {
        try {
            verificationData.casinoCookies = JSON.parse(casinoSessions);
        } catch (error) {
            await interaction.editReply({
                content: '❌ Invalid casino session data format. Please provide valid JSON.',
            });
            return;
        }
    }

    // Add CollectClock preference
    verificationData.enableCollectClock = enableCollectClock;

    try {
        // Start verification process
        const result = await tiltCheck.startVerifiedTiltMonitoring(userId, interaction.user, verificationData);

        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('🔍 TiltCheck Verification Complete')
                .setDescription('Your comprehensive verification has been completed!')
                .setColor(0x00FF00)
                .addFields(
                    { 
                        name: '✅ Trust Score', 
                        value: `${result.verification.trustScore}/100`, 
                        inline: true 
                    },
                    { 
                        name: '🔐 Verified Methods', 
                        value: result.verification.verifiedMethods.join(', ') || 'None', 
                        inline: true 
                    },
                    { 
                        name: '🎰 Connected Casinos', 
                        value: result.verification.connectedCasinos.toString(), 
                        inline: true 
                    },
                    { 
                        name: '💰 Tracked Wallets', 
                        value: result.verification.trackedWallets.toString(), 
                        inline: true 
                    },
                    { 
                        name: '📊 Monitoring Status', 
                        value: `TiltCheck: ${result.monitoring.tiltCheck}\nCollectClock: ${result.monitoring.collectClock}`, 
                        inline: false 
                    },
                    { 
                        name: '🎯 Pattern Detection', 
                        value: result.monitoring.patterns.join(', '), 
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: `Session ID: ${result.sessionId}` 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Verification Failed')
                .setDescription(result.error)
                .setColor(0xFF0000)
                .addFields(
                    { 
                        name: 'Trust Score', 
                        value: `${result.trustScore || 0}/100 (Required: ${result.requiredScore || 50})`, 
                        inline: true 
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        await interaction.editReply({
            content: `❌ Verification failed: ${error.message}`
        });
    }
}

// Handle start monitoring command
async function handleStartCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const duration = interaction.options.getInteger('duration') || 24;

    // Check if user is already verified
    const status = tiltCheck.getMonitoringStatus(userId);

    if (!status.monitoring) {
        await interaction.editReply({
            content: '❌ You must complete verification first using `/tiltcheck verify`'
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🚀 Enhanced TiltCheck Monitoring Active')
        .setDescription('Your comprehensive tilt monitoring is now active!')
        .setColor(0x00FF00)
        .addFields(
            { 
                name: '⏱️ Duration', 
                value: `${duration} hours`, 
                inline: true 
            },
            { 
                name: '🔍 Trust Score', 
                value: `${status.session.trustScore}/100`, 
                inline: true 
            },
            { 
                name: '🎰 Tracked Casinos', 
                value: status.collectClock.trackedCasinos.toString(), 
                inline: true 
            },
            { 
                name: '💰 Wallets', 
                value: status.verification.trackedWallets.toString(), 
                inline: true 
            },
            { 
                name: '📊 Patterns Monitoring', 
                value: status.patterns.monitoring.join(', '), 
                inline: false 
            },
            { 
                name: '🕐 Started', 
                value: `<t:${Math.floor(status.session.startTime.getTime() / 1000)}:R>`, 
                inline: true 
            }
        )
        .setFooter({ 
            text: 'Real-time monitoring includes wallet activity, casino sessions, and bonus collection patterns' 
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

// Handle status command
async function handleStatusCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const status = tiltCheck.getMonitoringStatus(userId);

    if (!status.monitoring) {
        await interaction.editReply({
            content: '❌ You are not currently being monitored. Use `/tiltcheck verify` to start.'
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('📊 TiltCheck Monitoring Status')
        .setDescription('Your current monitoring overview')
        .setColor(0x0099FF)
        .addFields(
            { 
                name: '🟢 Status', 
                value: status.session.status, 
                inline: true 
            },
            { 
                name: '🔍 Trust Score', 
                value: `${status.session.trustScore}/100`, 
                inline: true 
            },
            { 
                name: '⏱️ Runtime', 
                value: `<t:${Math.floor(status.session.startTime.getTime() / 1000)}:R>`, 
                inline: true 
            },
            { 
                name: '🔐 Verification', 
                value: `${status.verification.verifiedMethods} methods\n${status.verification.trackedWallets} wallets\n${status.verification.connectedCasinos} casinos`, 
                inline: true 
            },
            { 
                name: '🎰 CollectClock', 
                value: `${status.collectClock.trackedCasinos} casinos\n${status.collectClock.bonusSchedules} schedules`, 
                inline: true 
            },
            { 
                name: '🎯 Patterns', 
                value: `${status.patterns.detected} detected\nMonitoring: ${status.patterns.monitoring.join(', ')}`, 
                inline: true 
            }
        );

    if (status.lastAnalysis) {
        embed.addFields({
            name: '🔍 Last Analysis',
            value: `<t:${Math.floor(status.lastAnalysis.getTime() / 1000)}:R>`,
            inline: true
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

// Handle stop command
async function handleStopCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const stopped = tiltCheck.stopMonitoring(userId);

    if (stopped) {
        const embed = new EmbedBuilder()
            .setTitle('🛑 Monitoring Stopped')
            .setDescription('Your TiltCheck monitoring has been stopped.')
            .setColor(0xFF9900)
            .addFields(
                { 
                    name: 'Note', 
                    value: 'All real-time monitoring, wallet tracking, and pattern detection has been disabled. Use `/tiltcheck verify` to restart.', 
                    inline: false 
                }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply({
            content: '❌ You are not currently being monitored.'
        });
    }
}

// Handle patterns command
async function handlePatternsCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const detailed = interaction.options.getBoolean('detailed') || false;
    const status = tiltCheck.getMonitoringStatus(userId);

    if (!status.monitoring) {
        await interaction.editReply({
            content: '❌ No active monitoring session. Use `/tiltcheck verify` to start.'
        });
        return;
    }

    // This would get actual pattern data from the monitoring session
    const mockPatterns = [
        {
            type: 'verified_loss_chasing',
            confidence: 75,
            detected: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
            evidence: ['3 rapid deposits to Stake after losses', 'Wallet balance depleted twice']
        },
        {
            type: 'bonus_hunting_tilt',
            confidence: 60,
            detected: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            evidence: ['Collected bonuses from 4 casinos within 10 minutes', 'All bonuses immediately lost']
        }
    ];

    const embed = new EmbedBuilder()
        .setTitle('🎯 Detected Tilt Patterns')
        .setDescription(`Analysis of your gambling patterns with ${status.session.trustScore}% verification confidence`)
        .setColor(mockPatterns.length > 0 ? 0xFF6600 : 0x00FF00);

    if (mockPatterns.length === 0) {
        embed.addFields({
            name: '✅ No Patterns Detected',
            value: 'Your gambling behavior appears to be within normal parameters.',
            inline: false
        });
    } else {
        for (const pattern of mockPatterns) {
            const severity = pattern.confidence > 70 ? '🔴 HIGH' : pattern.confidence > 50 ? '🟡 MEDIUM' : '🟢 LOW';
            
            embed.addFields({
                name: `${pattern.type.replace(/_/g, ' ').toUpperCase()}`,
                value: `**Severity:** ${severity}\n**Confidence:** ${pattern.confidence}%\n**Detected:** <t:${Math.floor(pattern.detected.getTime() / 1000)}:R>`,
                inline: !detailed
            });

            if (detailed) {
                embed.addFields({
                    name: 'Evidence',
                    value: pattern.evidence.join('\n• '),
                    inline: false
                });
            }
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

// Handle CollectClock command
async function handleCollectClockCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const casino = interaction.options.getString('casino');
    
    // Mock CollectClock data
    const collectClockData = {
        'stake.us': {
            dailyBonus: { available: true, amount: '$0.50', nextReset: '4h 32m' },
            weeklyBonus: { available: false, amount: '$5.00', nextReset: '2d 4h' },
            collectionPattern: { consistency: 95, avgTime: '08:30', risk: 'obsessive' }
        },
        'trustdice': {
            dailyBonus: { available: false, amount: '$0.20', nextReset: '18h 15m' },
            hourlyFaucet: { available: true, amount: '$0.03', nextReset: '23m' },
            collectionPattern: { consistency: 78, avgTime: '12:45', risk: 'normal' }
        }
    };

    const embed = new EmbedBuilder()
        .setTitle('🕐 CollectClock Bonus Tracking')
        .setDescription('Your bonus collection monitoring status')
        .setColor(0x9932CC);

    if (casino && collectClockData[casino]) {
        const data = collectClockData[casino];
        embed.addFields(
            { 
                name: `🎰 ${casino.toUpperCase()}`, 
                value: `**Daily Bonus:** ${data.dailyBonus.available ? '✅ Available' : '❌ Collected'} (${data.dailyBonus.amount})\n**Next Reset:** ${data.dailyBonus.nextReset}`, 
                inline: false 
            }
        );

        if (data.hourlyFaucet) {
            embed.addFields({
                name: 'Hourly Faucet',
                value: `${data.hourlyFaucet.available ? '✅ Available' : '❌ Collected'} (${data.hourlyFaucet.amount})\n**Next:** ${data.hourlyFaucet.nextReset}`,
                inline: true
            });
        }

        embed.addFields({
            name: 'Collection Pattern',
            value: `**Consistency:** ${data.collectionPattern.consistency}%\n**Avg Time:** ${data.collectionPattern.avgTime}\n**Risk Level:** ${data.collectionPattern.risk}`,
            inline: true
        });
    } else {
        for (const [casinoName, data] of Object.entries(collectClockData)) {
            const riskEmoji = data.collectionPattern.risk === 'obsessive' ? '🔴' : data.collectionPattern.risk === 'high' ? '🟡' : '🟢';
            
            embed.addFields({
                name: `${riskEmoji} ${casinoName.toUpperCase()}`,
                value: `Daily: ${data.dailyBonus.available ? '✅' : '❌'} ${data.dailyBonus.amount}\nConsistency: ${data.collectionPattern.consistency}%`,
                inline: true
            });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

// Handle wallet command
async function handleWalletCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const address = interaction.options.getString('address');
    
    // Mock wallet data
    const walletData = {
        'verified_wallets': 2,
        'total_balance': '$1,234.56',
        'gambling_transactions': 15,
        'risk_score': 45,
        'wallets': [
            {
                address: '0x1234...5678',
                chain: 'Ethereum',
                balance: '$890.12',
                gambling_activity: 'Medium',
                last_gambling_tx: '2 hours ago'
            },
            {
                address: 'bc1q9876...4321',
                chain: 'Bitcoin',
                balance: '$344.44',
                gambling_activity: 'Low',
                last_gambling_tx: '1 day ago'
            }
        ]
    };

    const embed = new EmbedBuilder()
        .setTitle('💰 Wallet Verification Status')
        .setDescription('Your verified wallet monitoring overview')
        .setColor(0x32CD32)
        .addFields(
            { 
                name: '📊 Overview', 
                value: `**Verified Wallets:** ${walletData.verified_wallets}\n**Total Balance:** ${walletData.total_balance}\n**Risk Score:** ${walletData.risk_score}/100`, 
                inline: true 
            },
            { 
                name: '🎲 Gambling Activity', 
                value: `**Total Transactions:** ${walletData.gambling_transactions}\n**Risk Level:** ${walletData.risk_score > 70 ? '🔴 High' : walletData.risk_score > 40 ? '🟡 Medium' : '🟢 Low'}`, 
                inline: true 
            }
        );

    if (address) {
        const wallet = walletData.wallets.find(w => w.address.includes(address.slice(-4)));
        if (wallet) {
            embed.addFields({
                name: `🔍 Wallet: ${wallet.address}`,
                value: `**Chain:** ${wallet.chain}\n**Balance:** ${wallet.balance}\n**Gambling Activity:** ${wallet.gambling_activity}\n**Last Gambling TX:** ${wallet.last_gambling_tx}`,
                inline: false
            });
        }
    } else {
        for (const wallet of walletData.wallets) {
            embed.addFields({
                name: `${wallet.chain}: ${wallet.address}`,
                value: `Balance: ${wallet.balance}\nActivity: ${wallet.gambling_activity}`,
                inline: true
            });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

// Handle casino command
async function handleCasinoCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.options.getString('action');
    const casinoName = interaction.options.getString('casino_name');

    // Mock casino management
    switch (action) {
        case 'list':
            const embed = new EmbedBuilder()
                .setTitle('🎰 Connected Casinos')
                .setDescription('Your verified casino connections')
                .setColor(0xFF6347)
                .addFields(
                    { name: '✅ Stake.us', value: 'Active session\nBonus tracking: ON', inline: true },
                    { name: '✅ TrustDice', value: 'Active session\nBonus tracking: ON', inline: true },
                    { name: '❌ Rollbit', value: 'No session\nBonus tracking: OFF', inline: true }
                );
            await interaction.editReply({ embeds: [embed] });
            break;

        case 'add':
            if (!casinoName) {
                await interaction.editReply({ content: '❌ Please specify a casino name.' });
                return;
            }
            await interaction.editReply({ 
                content: `✅ Added ${casinoName} to your tracking list. Please provide session cookies for verification.` 
            });
            break;

        case 'remove':
            if (!casinoName) {
                await interaction.editReply({ content: '❌ Please specify a casino name.' });
                return;
            }
            await interaction.editReply({ 
                content: `❌ Removed ${casinoName} from your tracking list.` 
            });
            break;

        case 'verify':
            await interaction.editReply({
                content: '🔍 Casino verification requires providing session cookies and API tokens. This process ensures accurate tracking of your gambling activity across platforms.'
            });
            break;

        default:
            await interaction.editReply({ content: '❌ Unknown action.' });
    }
}

// Handle alerts command
async function handleAlertsCommand(interaction, userId) {
    await interaction.deferReply({ ephemeral: true });

    const level = interaction.options.getString('level');
    const enableDM = interaction.options.getBoolean('enable_dm');

    const embed = new EmbedBuilder()
        .setTitle('🚨 TiltCheck Alert Configuration')
        .setDescription('Your alert settings have been updated')
        .setColor(0xFF4500);

    if (level) {
        embed.addFields({
            name: 'Alert Threshold',
            value: `Set to: **${level}**\n\nYou will receive alerts when tilt patterns reach this confidence level.`,
            inline: false
        });
    }

    if (enableDM !== null) {
        embed.addFields({
            name: 'Direct Messages',
            value: enableDM ? '✅ Enabled - You will receive DM alerts' : '❌ Disabled - Alerts will only appear in this channel',
            inline: false
        });
    }

    embed.addFields({
        name: 'Current Settings',
        value: `**Threshold:** ${level || 'MEDIUM (50%)'}\n**DM Alerts:** ${enableDM ? 'Enabled' : 'Disabled'}\n**Real-time:** Enabled\n**Cross-platform:** Enabled`,
        inline: false
    });

    await interaction.editReply({ embeds: [embed] });
}

// Helper function to detect blockchain from address format
function detectChainFromAddress(address) {
    if (address.startsWith('0x')) return 'Ethereum';
    if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) return 'Bitcoin';
    if (address.length === 44 && !address.startsWith('0x')) return 'Solana';
    return 'Unknown';
}

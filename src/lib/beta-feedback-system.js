// TrapHouse Beta Testing - Feedback & UX Helper System
class BetaFeedbackManager {
    constructor(client) {
        this.client = client;
        this.userInteractions = {};
        this.feedbackData = new Map();
        this.promptQueue = [];
        this.metricsCollector = new BetaMetricsCollector();
        this.initialize();
    }

    initialize() {
        console.log('🔔 Initializing Beta Feedback & UX System...');
        this.setupFeedbackTracking();
        this.setupPromptScheduler();
        this.metricsCollector.startTracking();
        console.log('✅ Beta Feedback System Ready');
    }

    setupFeedbackTracking() {
        // Track command usage for smart prompting
        this.client.on('interactionCreate', (interaction) => {
            if (!interaction.isCommand()) return;
            this.trackCommandUsage(interaction);
        });

        // Track message reactions for feedback
        this.client.on('messageReactionAdd', (reaction, user) => {
            if (user.bot) return;
            this.handleReactionFeedback(reaction, user);
        });
    }

    // Feedback Collection System
    async collectFeedback(userId, command, experience, details = {}) {
        const feedbackId = `${userId}-${Date.now()}`;
        const feedback = {
            id: feedbackId,
            userId: userId,
            command: command,
            experience: experience, // 'excellent', 'good', 'neutral', 'poor', 'broken'
            details: details,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        this.feedbackData.set(feedbackId, feedback);
        await this.processFeedback(feedback);
        this.metricsCollector.trackFeedback(feedback);
        
        console.log(`📝 Feedback collected: ${command} - ${experience} by ${userId}`);
        return feedbackId;
    }

    // Smart Prompt System
    async shouldShowPrompt(userId, context) {
        const userHistory = this.userInteractions.get(userId) || {
            commands: 0,
            lastPrompt: 0,
            feedbackGiven: 0,
            sessionStart: Date.now()
        };

        // Show prompts based on usage patterns
        const timeSinceLastPrompt = Date.now() - userHistory.lastPrompt;
        const commandThreshold = userHistory.commands % 5 === 0 && userHistory.commands > 0;
        const timeThreshold = timeSinceLastPrompt > 900000; // 15 minutes
        const firstTimeUser = userHistory.commands === 3; // After 3 commands for new users

        return commandThreshold || timeThreshold || firstTimeUser;
    }

    async showFeedbackPrompt(message, context = {}) {
        const userId = message.author.id;
        
        if (!(await this.shouldShowPrompt(userId, context))) {
            return;
        }

        const prompts = this.getFeedbackPrompts(context);
        const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('🌟 Quick Feedback - Help Us Improve!')
            .setDescription(selectedPrompt.message)
            .addFields(
                {
                    name: '⚡ Quick Rate',
                    value: '😍 Excellent | 😊 Good | 😐 Okay | 😕 Poor | 💥 Broken',
                    inline: false
                },
                {
                    name: '💬 Optional Details',
                    value: 'Reply with any additional feedback or suggestions',
                    inline: false
                }
            )
            .setFooter({ text: 'Your feedback helps improve the beta experience!' });

        const feedbackMsg = await message.channel.send({ embeds: [embed] });
        
        // Add reaction collectors
        const reactions = ['😍', '😊', '😐', '😕', '💥'];
        for (const reaction of reactions) {
            await feedbackMsg.react(reaction);
        }

        this.setupReactionCollector(feedbackMsg, message.author, context);
        this.updateUserPromptHistory(userId);
    }

    getFeedbackPrompts(context) {
        const prompts = [
            {
                type: 'general',
                message: 'How was your experience with the last command you used?'
            },
            {
                type: 'crypto',
                message: 'How easy was it to set up and use the crypto features?',
                condition: context.command?.includes('crypto')
            },
            {
                type: 'tiltcheck',
                message: 'How helpful did you find the TiltCheck monitoring features?',
                condition: context.command?.includes('tiltcheck')
            },
            {
                type: 'navigation',
                message: 'How intuitive is the command system and navigation?'
            },
            {
                type: 'performance',
                message: 'How would you rate the speed and responsiveness?'
            },
            {
                type: 'features',
                message: 'Which features are you finding most/least useful?'
            }
        ];

        return prompts.filter(p => !p.condition || p.condition);
    }

    setupReactionCollector(message, user, context) {
        const filter = (reaction, reactUser) => {
            return ['😍', '😊', '😐', '😕', '💥'].includes(reaction.emoji.name) && 
                   reactUser.id === user.id;
        };

        const collector = message.createReactionCollector({ filter, time: 300000 }); // 5 minutes

        collector.on('collect', async (reaction, reactUser) => {
            const experienceMap = {
                '😍': 'excellent',
                '😊': 'good', 
                '😐': 'neutral',
                '😕': 'poor',
                '💥': 'broken'
            };

            const experience = experienceMap[reaction.emoji.name];
            await this.collectFeedback(user.id, context.command || 'general', experience, {
                promptType: 'reaction',
                context: context
            });

            // Show thank you message
            const thankYouEmbed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('🙏 Thank You!')
                .setDescription(`Feedback received: ${reaction.emoji.name} We appreciate your input!`)
                .setFooter({ text: 'Your feedback helps us improve the beta experience' });

            await message.edit({ embeds: [thankYouEmbed] });
            
            // Remove reactions after feedback
            setTimeout(() => message.reactions.removeAll().catch(console.error), 3000);
        });
    }

    // UX Helper Pop-ups
    async showHelpPopup(message, commandType) {
        const helpers = {
            'crypto-first-time': {
                title: '💡 Crypto Feature Helper',
                description: 'First time using crypto features? Here\'s what you need to know:',
                tips: [
                    '🔹 Start with `!crypto-wallet create polygon` for lower fees',
                    '🔹 Fund your wallet with real crypto (small amounts for testing)',
                    '🔹 Use `!crypto-chains` to see all supported networks',
                    '🔹 Beta mode: No minimum balances required!'
                ]
            },
            'tiltcheck-intro': {
                title: '🎰 TiltCheck Getting Started',
                description: 'TiltCheck helps monitor your gambling patterns:',
                tips: [
                    '🔹 Use `!tiltcheck start` to begin monitoring',
                    '🔹 Set spending limits with `!tiltcheck limits`',
                    '🔹 View your patterns with `!tiltcheck patterns`',
                    '🔹 Beta mode: All premium features unlocked!'
                ]
            },
            'beta-welcome': {
                title: '🧪 Welcome to Beta Testing!',
                description: 'You\'re now in the exclusive beta program:',
                tips: [
                    '🔹 All features unlocked (except crypto funding)',
                    '🔹 Your session lasts 7 days',
                    '🔹 Use `!beta-help` to see all available commands',
                    '🔹 Share feedback to help us improve!'
                ]
            }
        };

        const helper = helpers[commandType];
        if (!helper) return;

        const embed = new EmbedBuilder()
            .setColor('#2196F3')
            .setTitle(helper.title)
            .setDescription(helper.description)
            .addFields({
                name: '💡 Quick Tips',
                value: helper.tips.join('\n'),
                inline: false
            })
            .setFooter({ text: 'Need more help? Use the help command or ask in chat!' });

        await message.channel.send({ embeds: [embed] });
        
        // Track helper usage
        this.metricsCollector.trackHelperUsage(message.author.id, commandType);
    }

    // User Experience Metrics
    trackUserInteraction(userId, command, duration = null) {
        if (!this.userInteractions.has(userId)) {
            this.userInteractions.set(userId, {
                commands: 0,
                lastPrompt: 0,
                feedbackGiven: 0,
                sessionStart: Date.now(),
                averageCommandTime: 0,
                commandHistory: []
            });
        }

        const userStats = this.userInteractions.get(userId);
        userStats.commands++;
        userStats.commandHistory.push({
            command: command,
            timestamp: Date.now(),
            duration: duration
        });

        if (duration) {
            const totalTime = userStats.averageCommandTime * (userStats.commands - 1) + duration;
            userStats.averageCommandTime = totalTime / userStats.commands;
        }

        // Keep only last 50 commands
        if (userStats.commandHistory.length > 50) {
            userStats.commandHistory = userStats.commandHistory.slice(-50);
        }

        this.userInteractions.set(userId, userStats);
        this.metricsCollector.trackInteraction(userId, command, duration);
    }

    updateUserPromptHistory(userId) {
        const userStats = this.userInteractions.get(userId);
        if (userStats) {
            userStats.lastPrompt = Date.now();
            this.userInteractions.set(userId, userStats);
        }
    }

    // Contextual Help System
    async provideContextualHelp(message, errorType) {
        const contextualHelps = {
            'wallet-not-found': {
                title: '💼 Wallet Not Found',
                solution: 'Create a wallet first with `!crypto-wallet create [chain]`',
                example: '`!crypto-wallet create polygon`'
            },
            'insufficient-balance': {
                title: '💰 Insufficient Balance',
                solution: 'Fund your wallet with crypto to continue',
                tip: 'Beta testing: Use small amounts for testing'
            },
            'command-not-found': {
                title: '❓ Command Not Recognized',
                solution: 'Use `!beta-help` to see all available commands',
                tip: 'Make sure to include the ! prefix'
            },
            'session-expired': {
                title: '⏰ Session Expired',
                solution: 'Use `!beta-register` to start a new 7-day session',
                tip: 'Beta sessions automatically renew for verified users'
            }
        };

        const help = contextualHelps[errorType];
        if (!help) return;

        const embed = new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle(`🆘 ${help.title}`)
            .setDescription(help.solution)
            .addFields(
                help.example ? {
                    name: '📝 Example',
                    value: help.example,
                    inline: false
                } : null,
                help.tip ? {
                    name: '💡 Tip',
                    value: help.tip,
                    inline: false
                } : null
            ).filter(field => field !== null)
            .setFooter({ text: 'Need more help? Use !beta-help or ask for assistance!' });

        await message.channel.send({ embeds: [embed] });
    }

    // Performance Metrics Dashboard
    generateMetricsReport() {
        const totalUsers = this.userInteractions.size;
        const totalFeedback = this.feedbackData.size;
        const avgCommandsPerUser = Array.from(this.userInteractions.values())
            .reduce((sum, user) => sum + user.commands, 0) / totalUsers || 0;

        const feedbackBreakdown = {};
        for (const feedback of this.feedbackData.values()) {
            feedbackBreakdown[feedback.experience] = (feedbackBreakdown[feedback.experience] || 0) + 1;
        }

        return {
            userMetrics: {
                totalUsers,
                avgCommandsPerUser: Math.round(avgCommandsPerUser * 100) / 100,
                activeUsers: Array.from(this.userInteractions.values())
                    .filter(user => Date.now() - user.sessionStart < 24 * 60 * 60 * 1000).length
            },
            feedbackMetrics: {
                totalFeedback,
                breakdown: feedbackBreakdown,
                responseRate: totalFeedback / (totalUsers || 1) * 100
            },
            topCommands: this.getTopCommands(),
            avgResponseTime: this.calculateAverageResponseTime()
        };
    }

    getTopCommands() {
        const commandCounts = {};
        for (const user of this.userInteractions.values()) {
            for (const cmd of user.commandHistory) {
                commandCounts[cmd.command] = (commandCounts[cmd.command] || 0) + 1;
            }
        }
        
        return Object.entries(commandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([command, count]) => ({ command, count }));
    }

    calculateAverageResponseTime() {
        const allTimes = [];
        for (const user of this.userInteractions.values()) {
            if (user.averageCommandTime > 0) {
                allTimes.push(user.averageCommandTime);
            }
        }
        
        return allTimes.length > 0 
            ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
            : 0;
    }

    startFeedbackLoop() {
        // Periodic feedback prompts for active users
        setInterval(() => {
            this.checkForFeedbackOpportunities();
        }, 300000); // Every 5 minutes
        
        // Daily metrics summary
        setInterval(() => {
            console.log('📊 Daily Metrics Summary:', this.generateMetricsReport());
        }, 24 * 60 * 60 * 1000); // Daily
    }

    checkForFeedbackOpportunities() {
        for (const [userId, userStats] of this.userInteractions.entries()) {
            const timeSinceLastPrompt = Date.now() - userStats.lastPrompt;
            const isActive = userStats.commands > 0 && timeSinceLastPrompt > 900000; // 15 min
            
            if (isActive && userStats.feedbackGiven < 3) {
                // Queue for next interaction
                this.promptQueue.push({
                    userId,
                    type: 'periodic',
                    priority: 'low'
                });
            }
        }
    }

    setupPromptScheduler() {
        // Schedule contextual prompts based on user behavior
        setInterval(() => {
            this.processScheduledPrompts();
        }, 60000); // Check every minute
    }

    processScheduledPrompts() {
        // Process any scheduled prompts for users
        for (const [userId, userData] of Object.entries(this.userInteractions)) {
            if (this.shouldShowFeedbackPrompt(userId, userData)) {
                this.showSmartPrompt(userId, userData);
            }
        }
    }

    trackCommandUsage(interaction) {
        const userId = interaction.user.id;
        if (!this.userInteractions[userId]) {
            this.userInteractions[userId] = {
                commands: [],
                feedback: [],
                helpShown: false,
                firstSeen: Date.now(),
                lastActive: Date.now()
            };
        }

        this.userInteractions[userId].commands.push({
            name: interaction.commandName,
            timestamp: Date.now()
        });
        this.userInteractions[userId].lastActive = Date.now();

        // Show contextual help for new users
        if (!this.userInteractions[userId].helpShown && 
            this.userInteractions[userId].commands.length === 1) {
            this.showFirstTimeHelp(interaction);
        }
    }

    handleReactionFeedback(reaction, user) {
        const userId = user.id;
        const emoji = reaction.emoji.name;
        
        // Map reactions to feedback
        const feedbackMap = {
            '😍': 'excellent',
            '😊': 'good',
            '😐': 'neutral',
            '😕': 'poor',
            '💥': 'broken'
        };

        if (feedbackMap[emoji]) {
            this.recordFeedback(userId, feedbackMap[emoji], 'reaction');
        }
    }

    async showFirstTimeHelp(interaction) {
        this.userInteractions[interaction.user.id].helpShown = true;
        
        const helpEmbed = new EmbedBuilder()
            .setColor('#00D4FF')
            .setTitle('🎉 Welcome to TrapHouse Beta!')
            .setDescription('Thanks for joining our beta test! Here are some quick tips:')
            .addFields(
                { name: '💡 Getting Started', value: 'Use `!help` to see all available commands' },
                { name: '🎰 Casino Features', value: 'Try `!front` for TiltCheck and addiction monitoring' },
                { name: '💰 Crypto Features', value: 'Use `!crypto-wallet create` to get started with crypto' },
                { name: '📊 Feedback', value: 'Use `!beta-feedback` anytime to share your experience' }
            )
            .setFooter({ text: 'This message will auto-delete in 30 seconds' });

        const helpMessage = await interaction.followUp({ 
            embeds: [helpEmbed], 
            ephemeral: true 
        });

        setTimeout(() => helpMessage.delete().catch(console.error), 30000);
    }
}

// Metrics Collection Helper
class BetaMetricsCollector {
    constructor() {
        this.metrics = {
            commands: new Map(),
            errors: [],
            feedback: [],
            helpers: new Map(),
            interactions: []
        };
    }

    trackFeedback(feedback) {
        this.metrics.feedback.push(feedback);
        console.log(`📈 Feedback metric: ${feedback.experience} for ${feedback.command}`);
    }

    trackHelperUsage(userId, helperType) {
        const count = this.metrics.helpers.get(helperType) || 0;
        this.metrics.helpers.set(helperType, count + 1);
        console.log(`🆘 Helper used: ${helperType} by ${userId}`);
    }

    trackInteraction(userId, command, duration) {
        this.metrics.interactions.push({
            userId,
            command,
            duration,
            timestamp: Date.now()
        });
        
        const commandCount = this.metrics.commands.get(command) || 0;
        this.metrics.commands.set(command, commandCount + 1);
    }

    exportMetrics() {
        return {
            summary: {
                totalCommands: Array.from(this.metrics.commands.values()).reduce((a, b) => a + b, 0),
                totalFeedback: this.metrics.feedback.length,
                totalHelpers: Array.from(this.metrics.helpers.values()).reduce((a, b) => a + b, 0),
                totalErrors: this.metrics.errors.length
            },
            detailed: {
                commands: Object.fromEntries(this.metrics.commands),
                helpers: Object.fromEntries(this.metrics.helpers),
                feedback: this.metrics.feedback.slice(-100), // Last 100
                interactions: this.metrics.interactions.slice(-500) // Last 500
            }
        };
    }

    startTracking() {
        console.log('📊 Beta metrics tracking started');
        // Initialize tracking intervals
        setInterval(() => {
            this.cleanOldData();
        }, 300000); // Clean old data every 5 minutes
    }

    cleanOldData() {
        const oneDay = 24 * 60 * 60 * 1000;
        const cutoff = Date.now() - oneDay;
        
        // Keep only recent interactions
        this.metrics.interactions = this.metrics.interactions.filter(
            interaction => interaction.timestamp > cutoff
        );
        
        // Keep only recent feedback
        this.metrics.feedback = this.metrics.feedback.filter(
            feedback => feedback.timestamp > cutoff
        );
    }
}

module.exports = { BetaFeedbackManager, BetaMetricsCollector };

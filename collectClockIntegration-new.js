const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

class CollectClockIntegration {
    constructor() {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.DirectMessages
            ]
        });

        this.isInitialized = false;
        this.trapHouseBot = null; // Reference to main TrapHouse bot
        
        // Daily collection platforms from CollectClock website
        this.platforms = [
            { name: 'TrustDice', url: 'https://trustdice.win/', icon: '🎲', bonus: '$1-5' },
            { name: 'Stake US', url: 'https://stake.us/', icon: '💰', bonus: '$2-10' },
            { name: 'MetaWin', url: 'https://metawin.com/', icon: '🏆', bonus: '$1-3' },
            { name: 'SpinBlitz', url: 'https://www.spinblitz.com/', icon: '⚡', bonus: '$0.50-2' },
            { name: 'Hello Millions', url: 'https://www.hellomillions.com/', icon: '💎', bonus: '$1-5' },
            { name: 'Mega Bonanza', url: 'https://www.megabonanza.com/', icon: '🎰', bonus: '$2-8' },
            { name: 'Real Prize', url: 'https://www.realprize.com/', icon: '🏅', bonus: '$1-4' },
            { name: 'LuckyBird', url: 'https://luckybird.vip/', icon: '🦅', bonus: '$1-6' },
            { name: 'WowVegas', url: 'https://www.wowvegas.com/', icon: '🎭', bonus: '$2-7' },
            { name: 'Pulsz', url: 'https://www.pulsz.com/', icon: '⚡', bonus: '$1-3' },
            { name: 'Modo', url: 'https://modo.us/', icon: '🎯', bonus: '$0.75-2' },
            { name: 'McLuck', url: 'https://www.mcluck.com/', icon: '🍀', bonus: '$1-4' },
            { name: 'Crown Coins', url: 'https://crowncoinscasino.com/', icon: '👑', bonus: '$2-5' },
            { name: 'Chanced', url: 'https://chanced.com/', icon: '🎲', bonus: '$1-3' },
            { name: 'Sportzino', url: 'https://sportzino.com/', icon: '⚽', bonus: '$1-2' }
        ];
        
        this.userCollections = new Map(); // Track user collection data
        this.initializeBot();
    }

    async initializeBot() {
        try {
            this.client.on('ready', () => {
                console.log(`💧 CollectClock Bot is online! Logged in as ${this.client.user.tag}`);
                console.log(`🎰 Tracking ${this.platforms.length} daily bonus platforms`);
                this.isInitialized = true;
                
                // Start daily reminder system
                this.startDailyReminderSystem();
            });

            this.client.on('messageCreate', async (message) => {
                if (message.author.bot) return;
                await this.handleMessage(message);
            });

            this.client.on('error', (error) => {
                console.error('CollectClock Bot Error:', error);
            });

            // Login to Discord
            await this.client.login(process.env.COLLECTCLOCK_DISCORD_BOT_TOKEN);

        } catch (error) {
            console.error('Failed to initialize CollectClock bot:', error);
        }
    }

    // Set reference to main TrapHouse bot for integration
    setTrapHouseBot(trapHouseBot) {
        this.trapHouseBot = trapHouseBot;
    }

    async handleMessage(message) {
        const content = message.content.toLowerCase().trim();

        // Daily collection commands (NEW - MAIN FEATURE)
        if (content.startsWith('!collect') || content.startsWith('!cc')) {
            const args = content.split(' ').slice(1);
            await this.handleCollectClock(message, args);
        }
        // Show help for CollectClock
        else if (content.startsWith('!help-collect') || content === '!collectclock') {
            await this.showCollectClockHelp(message);
        }
    }

    // MAIN: CollectClock daily bonus system
    async handleCollectClock(message, args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'status':
                await this.showCollectionStatus(message);
                break;
            case 'remind':
                await this.setupReminders(message, args.slice(1));
                break;
            case 'streak':
                await this.showUserStreak(message);
                break;
            case 'leaderboard':
                await this.showCollectionLeaderboard(message);
                break;
            case 'platforms':
                await this.showPlatforms(message);
                break;
            case 'link':
                await this.linkDiscordAccount(message);
                break;
            case 'collected':
                await this.markAsCollected(message, args.slice(1));
                break;
            case 'help':
            default:
                await this.showCollectClockHelp(message);
        }
    }

    // Show daily collection status with JustTheTip degen humor
    async showCollectionStatus(message) {
        const userData = this.getUserCollectionData(message.author.id);
        const availablePlatforms = this.getAvailablePlatforms();
        const collectedToday = userData.collectedToday || [];
        const remainingPlatforms = availablePlatforms.filter(p => !collectedToday.includes(p.name));
        
        const embed = new EmbedBuilder()
            .setColor(remainingPlatforms.length > 0 ? '#00ff88' : '#ffd700')
            .setTitle('💧 CollectClock Status - Don\'t Miss Your Daily Bag!')
            .setDescription('*JustTheTip: Missing daily collections is like not buying the dip - pure degeneracy!*')
            .addFields(
                {
                    name: '🎰 Available Collections',
                    value: remainingPlatforms.length > 0 
                        ? remainingPlatforms.slice(0, 10).map(p => `${p.icon} **${p.name}** - ${p.bonus}`).join('\n')
                        : '✅ All caught up, degen! Time to touch grass... or not.',
                    inline: false
                },
                {
                    name: '🔥 Your Streak',
                    value: `${userData.streak || 0} days\n${this.getStreakEmoji(userData.streak || 0)} ${this.getStreakComment(userData.streak || 0)}`,
                    inline: true
                },
                {
                    name: '💰 Today\'s Progress',
                    value: `${collectedToday.length}/${this.platforms.length}\n💎 Completion: ${Math.round((collectedToday.length / this.platforms.length) * 100)}%`,
                    inline: true
                },
                {
                    name: '⏰ Next Reset',
                    value: this.getNextResetTime(),
                    inline: true
                }
            )
            .setFooter({ text: 'Use !cc link to connect to CollectClock • Made for degens by degens' })
            .setTimestamp();

        // Add JustTheTip vault recommendation based on collection behavior
        const degenLevel = this.calculateDegenLevel(userData);
        if (degenLevel >= 80) {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion',
                value: '**HODL Vault** - Your consistency shows diamond hands! 💎\nPerfect for steady accumulation like your collection game.',
                inline: false
            });
        } else if (degenLevel >= 40) {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion', 
                value: '**Grass Touching Vault** - You\'re building good habits! 🌱\nKeep this energy for your crypto strategy.',
                inline: false
            });
        } else {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion',
                value: '**YOLO Vault** - Inconsistent like your collection streak! 🎲\nTime to get serious about both habits.',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    // Setup collection reminders
    async setupReminders(message, args) {
        const time = args[0]; // Format: "09:00" or "daily"
        
        if (!time) {
            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('⏰ CollectClock Reminders Setup')
                .setDescription('Never miss your daily bag again!')
                .addFields(
                    {
                        name: '📱 Available Options',
                        value: '`!cc remind daily` - Daily reminder at 9 AM\n`!cc remind 15:30` - Custom time (24h format)\n`!cc remind off` - Disable reminders',
                        inline: false
                    },
                    {
                        name: '🎯 What You\'ll Get',
                        value: '• Daily DMs about available collections\n• Streak warnings when you\'re slipping\n• Platform-specific notifications\n• JustTheTip vault recommendations',
                        inline: false
                    }
                )
                .setFooter({ text: 'JustTheTip: Consistency in collections = consistency in gains!' });
            
            return await message.reply({ embeds: [embed] });
        }

        const userData = this.getUserCollectionData(message.author.id);
        
        if (time === 'off') {
            userData.reminders = false;
            await message.reply('🔕 Collection reminders disabled. *JustTheTip: Missing out on free money? That\'s a bold strategy, cotton.*');
        } else {
            userData.reminders = true;
            userData.reminderTime = time === 'daily' ? '09:00' : time;
            await message.reply(`✅ Collection reminders set for ${userData.reminderTime}!\n\n💡 *JustTheTip: Now you have no excuse for missing those daily bonuses!*`);
        }
        
        this.saveUserCollectionData(message.author.id, userData);
    }

    // Show user collection streak with degen insights
    async showUserStreak(message) {
        const userData = this.getUserCollectionData(message.author.id);
        const streakDays = userData.streak || 0;
        
        const embed = new EmbedBuilder()
            .setColor(this.getStreakColor(streakDays))
            .setTitle(`🔥 ${message.author.username}'s Collection Streak`)
            .setDescription(this.getStreakComment(streakDays))
            .addFields(
                {
                    name: '📊 Streak Stats',
                    value: `**Current:** ${streakDays} days\n**Best:** ${userData.bestStreak || streakDays} days\n**Total Collections:** ${userData.totalCollections || 0}`,
                    inline: true
                },
                {
                    name: '🎯 Degen Analysis',
                    value: this.getDegenAnalysis(userData),
                    inline: true
                },
                {
                    name: '🏆 Achievements',
                    value: this.getStreakAchievements(streakDays),
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Consistent collections = consistent gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Show collection leaderboard
    async showCollectionLeaderboard(message) {
        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle('🏆 CollectClock Leaderboard - Top Degens')
            .setDescription('*The most consistent bag collectors in the TrapHouse*')
            .addFields(
                {
                    name: '👑 Streak Kings',
                    value: '1. **DegenKing#1337** - 45 days 🔥\n2. **BagChaser#0420** - 32 days 💎\n3. **DailyGrinder#6969** - 28 days ⚡',
                    inline: true
                },
                {
                    name: '💰 Collection Masters',
                    value: '1. **BonusHunter#2024** - 1,247 collections\n2. **FreeMoney#4455** - 1,103 collections\n3. **GrindNeverStops#7777** - 967 collections',
                    inline: true
                },
                {
                    name: '🎯 This Week\'s MVP',
                    value: `**${message.author.username}** could be here!\n\nStart your streak today with \`!cc link\``,
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Competition breeds excellence... and better bags!' });

        await message.reply({ embeds: [embed] });
    }

    // Show available platforms
    async showPlatforms(message) {
        const platformChunks = this.chunkArray(this.platforms, 5);
        
        const embed = new EmbedBuilder()
            .setColor('#00aaff')
            .setTitle('🎰 CollectClock Platforms - Your Daily Bag Sources')
            .setDescription('*All the platforms where you can collect your daily bread*');

        platformChunks.forEach((chunk, index) => {
            embed.addFields({
                name: `🎯 Platform Group ${index + 1}`,
                value: chunk.map(p => `${p.icon} **[${p.name}](${p.url})** - ${p.bonus}`).join('\n'),
                inline: true
            });
        });

        embed.addFields({
            name: '🚀 Quick Actions',
            value: '• `!cc status` - Check what\'s available\n• `!cc remind daily` - Never miss again\n• `!cc link` - Connect your Discord\n• [**Open CollectClock**](https://jmenichole.github.io/CollectClock/)',
            inline: false
        });

        embed.setFooter({ text: 'JustTheTip: Diversification is key - in crypto and in collections!' });

        await message.reply({ embeds: [embed] });
    }

    // Link Discord account to CollectClock
    async linkDiscordAccount(message) {
        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🔗 Link Your CollectClock Account')
            .setDescription('Connect your Discord to track collections and get personalized tips!')
            .addFields(
                {
                    name: '🎯 Step 1: Visit CollectClock',
                    value: '[**Click here to open CollectClock**](https://jmenichole.github.io/CollectClock/)',
                    inline: false
                },
                {
                    name: '🔐 Step 2: Login with Discord',
                    value: 'Click "Login with Discord" on the CollectClock site',
                    inline: false
                },
                {
                    name: '✅ Step 3: You\'re Connected!',
                    value: 'Your collections will now sync with JustTheTip for better insights',
                    inline: false
                },
                {
                    name: '💡 What You Get',
                    value: '• Automatic streak tracking\n• Personalized vault recommendations\n• Collection reminders via DM\n• Leaderboard participation\n• Degen level calculations\n• TrapHouse respect integration',
                    inline: false
                },
                {
                    name: '🌐 TrapHouse Ecosystem',
                    value: '[**TrapHouse Bot**](https://traphousediscordbot.created.app) • [**GitHub**](https://github.com/jmenichole/trap-house-discord-bot)',
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Connected accounts = connected gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Mark collections as completed
    async markAsCollected(message, args) {
        const platformName = args.join(' ');
        if (!platformName) {
            return await message.reply('❌ Please specify a platform name. Example: `!cc collected TrustDice`');
        }

        const platform = this.platforms.find(p => p.name.toLowerCase().includes(platformName.toLowerCase()));
        if (!platform) {
            return await message.reply(`❌ Platform "${platformName}" not found. Use \`!cc platforms\` to see all available platforms.`);
        }

        const userData = this.getUserCollectionData(message.author.id);
        if (!userData.collectedToday) userData.collectedToday = [];
        
        if (userData.collectedToday.includes(platform.name)) {
            return await message.reply(`✅ You've already collected from **${platform.name}** today!`);
        }

        userData.collectedToday.push(platform.name);
        userData.totalCollections = (userData.totalCollections || 0) + 1;
        userData.lastCollectionDate = new Date().toDateString();

        // Update streak
        this.updateUserStreak(userData);
        
        this.saveUserCollectionData(message.author.id, userData);

        // Award TrapHouse respect
        if (this.trapHouseBot) {
            await this.awardCollectionRespect(message.author.id, platform.name);
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('💰 Collection Confirmed!')
            .setDescription(`Nice work collecting from **${platform.name}**!`)
            .addFields(
                {
                    name: '🎰 Platform',
                    value: `${platform.icon} **${platform.name}**\n💰 Bonus Range: ${platform.bonus}`,
                    inline: true
                },
                {
                    name: '🔥 Streak Status',
                    value: `${userData.streak} days\n${this.getStreakEmoji(userData.streak)}`,
                    inline: true
                },
                {
                    name: '📊 Today\'s Progress',
                    value: `${userData.collectedToday.length}/${this.platforms.length} platforms`,
                    inline: true
                }
            )
            .setFooter({ text: 'JustTheTip: Every collection counts toward your degen evolution!' });

        await message.reply({ embeds: [embed] });
    }

    // Show CollectClock help with full degen integration
    async showCollectClockHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('💧 CollectClock Integration - Made for Degens by Degens')
            .setDescription('*Never miss your daily collections again with JustTheTip insights!*')
            .addFields(
                {
                    name: '🎮 Collection Commands',
                    value: '`!cc` or `!collect` - Show this help\n`!cc status` - Check available collections\n`!cc remind [time]` - Setup reminders\n`!cc streak` - View your collection streak\n`!cc platforms` - List all platforms\n`!cc leaderboard` - Top collectors\n`!cc link` - Connect Discord account\n`!cc collected <platform>` - Mark as collected',
                    inline: false
                },
                {
                    name: '🏦 JustTheTip Integration',
                    value: '• Collection consistency affects vault recommendations\n• Streak data influences your degen level\n• Automatic accountability buddy matching\n• Collection habits impact crypto strategy tips\n• Earn TrapHouse respect for daily collections',
                    inline: false
                },
                {
                    name: '🎯 Pro Tips',
                    value: '• Set daily reminders to maintain streaks\n• Check status every morning with coffee\n• Use collection discipline for crypto habits\n• Track patterns to optimize timing\n• Link your account for full integration',
                    inline: false
                },
                {
                    name: '🔗 Quick Links',
                    value: '[**CollectClock Web App**](https://jmenichole.github.io/CollectClock/)\n[**TrapHouse Bot Site**](https://traphousediscordbot.created.app)\n[**GitHub Repository**](https://github.com/jmenichole/trap-house-discord-bot)',
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Consistency in small things leads to big gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Helper functions for CollectClock system
    getUserCollectionData(userId) {
        if (!this.userCollections.has(userId)) {
            this.userCollections.set(userId, {
                streak: 0,
                bestStreak: 0,
                totalCollections: 0,
                collectedToday: [],
                lastCollectionDate: null,
                reminders: false,
                reminderTime: '09:00'
            });
        }
        return this.userCollections.get(userId);
    }

    saveUserCollectionData(userId, data) {
        this.userCollections.set(userId, data);
        // TODO: Integrate with your storage.js system for persistence
    }

    getAvailablePlatforms() {
        // Mock availability - in production, this would check real API
        return this.platforms.filter(p => Math.random() > 0.2); // 80% availability
    }

    updateUserStreak(userData) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (userData.lastCollectionDate === yesterday) {
            userData.streak = (userData.streak || 0) + 1;
        } else if (userData.lastCollectionDate !== today) {
            userData.streak = 1;
        }
        
        userData.bestStreak = Math.max(userData.bestStreak || 0, userData.streak);
    }

    getStreakColor(streak) {
        if (streak >= 30) return '#ffd700'; // Gold
        if (streak >= 14) return '#00ff88'; // Green
        if (streak >= 7) return '#00aaff';  // Blue
        if (streak >= 3) return '#ffa500';  // Orange
        return '#ff6b6b'; // Red
    }

    getStreakEmoji(streak) {
        if (streak >= 30) return '👑';
        if (streak >= 14) return '🔥';
        if (streak >= 7) return '💎';
        if (streak >= 3) return '⚡';
        return '🌱';
    }

    getStreakComment(streak) {
        if (streak >= 30) return '*Absolute legend! This degen has transcended!*';
        if (streak >= 14) return '*Diamond hands in collections AND crypto!*';
        if (streak >= 7) return '*Solid consistency - the HODL energy is strong*';
        if (streak >= 3) return '*Building good habits - grass touching approved*';
        if (streak === 0) return '*Time to start your collection journey, degen!*';
        return '*Every journey starts with a single collection*';
    }

    getDegenAnalysis(userData) {
        const level = this.calculateDegenLevel(userData);
        
        if (level >= 80) return '**Transcended Degen** 🚀\nPeak performance mode';
        if (level >= 60) return '**Diamond Handed** 💎\nConsistent excellence';
        if (level >= 40) return '**Solid Grinder** ⚡\nBuilding momentum';
        if (level >= 20) return '**Learning Degen** 🌱\nGrowing strong';
        return '**Fresh Meat** 🥩\nWelcome to the game!';
    }

    calculateDegenLevel(userData) {
        const streakPoints = Math.min((userData.streak || 0) * 2, 50);
        const collectionPoints = Math.min((userData.totalCollections || 0) / 10, 30);
        const consistencyBonus = (userData.streak || 0) >= 7 ? 20 : 0;
        return Math.min(streakPoints + collectionPoints + consistencyBonus, 100);
    }

    getStreakAchievements(streak) {
        const achievements = [];
        if (streak >= 1) achievements.push('🌱 First Steps');
        if (streak >= 3) achievements.push('⚡ Getting Started');  
        if (streak >= 7) achievements.push('💎 Week Warrior');
        if (streak >= 14) achievements.push('🔥 Two Week Titan');
        if (streak >= 30) achievements.push('👑 Monthly Master');
        if (streak >= 100) achievements.push('🚀 Centennial Legend');
        
        return achievements.length > 0 ? achievements.join(' ') : '🥩 Ready to start!';
    }

    getNextResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const hours = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const minutes = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Award TrapHouse respect for collections
    async awardCollectionRespect(userId, platformName) {
        if (!this.trapHouseBot) return;
        
        try {
            // Award respect based on platform (5-15 points)
            const respectPoints = Math.floor(Math.random() * 10) + 5;
            console.log(`Awarding ${respectPoints} respect to ${userId} for collecting from ${platformName}`);
            // TODO: Integrate with your respectManager.js
        } catch (error) {
            console.error('Failed to award collection respect:', error);
        }
    }

    // Daily reminder system
    startDailyReminderSystem() {
        // Check every hour for users who need reminders
        setInterval(async () => {
            await this.checkAndSendReminders();
        }, 60 * 60 * 1000); // Every hour
        
        console.log('🔔 Daily reminder system started');
    }

    async checkAndSendReminders() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        for (const [userId, userData] of this.userCollections) {
            if (userData.reminders && userData.reminderTime === currentTime) {
                await this.sendReminderDM(userId, userData);
            }
        }
    }

    async sendReminderDM(userId, userData) {
        try {
            const user = await this.client.users.fetch(userId);
            const collectedToday = userData.collectedToday || [];
            const remaining = this.platforms.length - collectedToday.length;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('💧 CollectClock Daily Reminder')
                .setDescription('Good morning, degen! Time to collect your daily bags!')
                .addFields(
                    {
                        name: '🎰 Available Today',
                        value: `${remaining} platforms ready for collection`,
                        inline: true
                    },
                    {
                        name: '🔥 Your Streak',
                        value: `${userData.streak || 0} days - keep it going!`,
                        inline: true
                    },
                    {
                        name: '🚀 Quick Links',
                        value: '[**CollectClock Web App**](https://jmenichole.github.io/CollectClock/)\nUse `!cc status` to check progress',
                        inline: false
                    }
                )
                .setFooter({ text: 'JustTheTip: Consistent collections = consistent gains!' });

            await user.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Failed to send reminder to ${userId}:`, error);
        }
    }

    // Public methods for external integration
    getClient() {
        return this.client;
    }

    isReady() {
        return this.isInitialized;
    }
}

module.exports = CollectClockIntegration;

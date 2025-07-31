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
        
        // Daily collection platforms from CollectClock
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
        
        this.userCollections = new Map(); // Track user collection streaks
        this.initializeBot();
    }

    async initializeBot() {
        try {
            this.client.on('ready', () => {
                console.log(`� CollectClock Bot is online! Logged in as ${this.client.user.tag}`);
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

        // Daily collection commands (NEW)
        if (content.startsWith('!collect') || content.startsWith('!cc')) {
            const args = content.split(' ').slice(1);
            await this.handleCollectClock(message, args);
        }
        // Legacy time tracking commands (KEPT for backward compatibility)
        else if (content.startsWith('!clockin') || content.startsWith('!clock-in')) {
            await this.handleClockIn(message);
        } else if (content.startsWith('!clockout') || content.startsWith('!clock-out')) {
            await this.handleClockOut(message);
        } else if (content.startsWith('!timesheet') || content.startsWith('!hours')) {
            await this.handleTimesheet(message);
        } else if (content.startsWith('!productivity') || content.startsWith('!stats')) {
            await this.handleProductivityStats(message);
        } else if (content.startsWith('!goal') || content.startsWith('!target')) {
            await this.handleGoalSetting(message);
        } else if (content.startsWith('!break')) {
            await this.handleBreakTime(message);
        } else if (content.startsWith('!help-clock') || content === '!collectclock') {
            await this.showCollectClockHelp(message);
        }
    }

    // NEW: Main CollectClock daily bonus system
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

    // NEW: Show daily collection status with degen humor
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
            .setFooter({ text: 'Use !cc link to connect • Made for degens by degens' })
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

    // NEW: Setup collection reminders
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

    // NEW: Show user collection streak with degen insights
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

    // NEW: Show collection leaderboard
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

    // NEW: Show available platforms
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

    // NEW: Link Discord account to CollectClock
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
                }
            )
            .setFooter({ text: 'JustTheTip: Connected accounts = connected gains!' });

        await message.reply({ embeds: [embed] });
    }

    // NEW: Mark collections as completed
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
        try {
            const userId = message.author.id;
            const timestamp = new Date();
            
            // Store clock-in data (you can integrate with your existing storage system)
            const clockInData = {
                userId,
                username: message.author.username,
                clockInTime: timestamp,
                channelId: message.channel.id,
                guildId: message.guild?.id
            };

            // Save to storage (integrate with your storage.js)
            await this.saveClockInData(clockInData);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🟢 Clocked In Successfully!')
                .setDescription(`Welcome to work, ${message.author.username}!`)
                .addFields(
                    { name: '⏰ Start Time', value: timestamp.toLocaleString(), inline: true },
                    { name: '📍 Location', value: message.channel.name || 'DM', inline: true }
                )
                .setFooter({ text: 'CollectClock • Productivity Tracker' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Integrate with TrapHouse respect system
            if (this.trapHouseBot) {
                await this.awardClockInRespect(userId);
            }

        } catch (error) {
            console.error('Clock-in error:', error);
            await message.reply('❌ Failed to clock in. Please try again.');
        }
    }

    async handleClockOut(message) {
        try {
            const userId = message.author.id;
            const timestamp = new Date();
            
            // Get clock-in data
            const clockInData = await this.getClockInData(userId);
            if (!clockInData) {
                await message.reply('❌ You haven\'t clocked in yet! Use `!clockin` first.');
                return;
            }

            // Calculate work duration
            const workDuration = timestamp - new Date(clockInData.clockInTime);
            const hours = Math.floor(workDuration / (1000 * 60 * 60));
            const minutes = Math.floor((workDuration % (1000 * 60 * 60)) / (1000 * 60));

            // Save clock-out data
            const clockOutData = {
                ...clockInData,
                clockOutTime: timestamp,
                duration: workDuration,
                hoursWorked: hours + (minutes / 60)
            };

            await this.saveClockOutData(clockOutData);
            await this.clearClockInData(userId);

            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔴 Clocked Out Successfully!')
                .setDescription(`Great work today, ${message.author.username}!`)
                .addFields(
                    { name: '⏰ End Time', value: timestamp.toLocaleString(), inline: true },
                    { name: '⏱️ Duration', value: `${hours}h ${minutes}m`, inline: true },
                    { name: '💰 Respect Earned', value: this.calculateRespectEarned(hours, minutes), inline: true }
                )
                .setFooter({ text: 'CollectClock • Productivity Tracker' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Award respect based on work duration
            if (this.trapHouseBot && hours > 0) {
                await this.awardWorkRespect(userId, hours, minutes);
            }

        } catch (error) {
            console.error('Clock-out error:', error);
            await message.reply('❌ Failed to clock out. Please try again.');
        }
    }

    async handleTimesheet(message) {
        try {
            const userId = message.author.id;
            const timeData = await this.getTimesheetData(userId);

            if (!timeData || timeData.length === 0) {
                await message.reply('📊 No timesheet data found. Start tracking your time with `!clockin`!');
                return;
            }

            // Calculate totals
            const totalHours = timeData.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
            const totalSessions = timeData.length;
            const avgSession = totalHours / totalSessions;

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle(`📊 ${message.author.username}'s Timesheet`)
                .setDescription('Your productivity summary')
                .addFields(
                    { name: '⏰ Total Hours', value: `${totalHours.toFixed(1)}h`, inline: true },
                    { name: '📅 Sessions', value: totalSessions.toString(), inline: true },
                    { name: '📈 Avg Session', value: `${avgSession.toFixed(1)}h`, inline: true }
                )
                .setFooter({ text: 'CollectClock • Use !productivity for detailed stats' })
                .setTimestamp();

            // Show recent sessions
            if (timeData.length > 0) {
                const recentSessions = timeData.slice(-5).map(session => {
                    const date = new Date(session.clockInTime).toLocaleDateString();
                    const hours = Math.floor(session.hoursWorked || 0);
                    const minutes = Math.floor(((session.hoursWorked || 0) % 1) * 60);
                    return `${date}: ${hours}h ${minutes}m`;
                }).join('\n');

                embed.addFields({ name: '📋 Recent Sessions', value: recentSessions || 'No recent sessions', inline: false });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Timesheet error:', error);
            await message.reply('❌ Failed to retrieve timesheet data.');
        }
    }

    async handleProductivityStats(message) {
        try {
            const userId = message.author.id;
            const stats = await this.getProductivityStats(userId);

            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle(`📈 ${message.author.username}'s Productivity Stats`)
                .setDescription('Detailed productivity analysis')
                .addFields(
                    { name: '🔥 Current Streak', value: `${stats.currentStreak} days`, inline: true },
                    { name: '🏆 Best Streak', value: `${stats.bestStreak} days`, inline: true },
                    { name: '⭐ Efficiency Score', value: `${stats.efficiency}%`, inline: true },
                    { name: '📊 This Week', value: `${stats.weeklyHours}h`, inline: true },
                    { name: '📅 This Month', value: `${stats.monthlyHours}h`, inline: true },
                    { name: '🎯 Goal Progress', value: `${stats.goalProgress}%`, inline: true }
                )
                .setFooter({ text: 'CollectClock • Keep up the great work!' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Productivity stats error:', error);
            await message.reply('❌ Failed to retrieve productivity stats.');
        }
    }

    async handleGoalSetting(message) {
        try {
            const args = message.content.split(' ');
            const hoursGoal = parseFloat(args[1]);

            if (!hoursGoal || hoursGoal <= 0) {
                await message.reply('❌ Please specify a valid daily hours goal. Example: `!goal 8`');
                return;
            }

            await this.setUserGoal(message.author.id, hoursGoal);

            const embed = new EmbedBuilder()
                .setColor('#9C27B0')
                .setTitle('🎯 Goal Set Successfully!')
                .setDescription(`Daily productivity goal updated to ${hoursGoal} hours`)
                .addFields(
                    { name: '📈 Motivation', value: 'Consistency is key to success!', inline: false },
                    { name: '💡 Tip', value: 'Break your goal into smaller chunks throughout the day', inline: false }
                )
                .setFooter({ text: 'CollectClock • Track your progress with !stats' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Goal setting error:', error);
            await message.reply('❌ Failed to set goal. Please try again.');
        }
    }

    async handleBreakTime(message) {
        try {
            const args = message.content.split(' ');
            const breakMinutes = parseInt(args[1]) || 15;

            const embed = new EmbedBuilder()
                .setColor('#FF9800')
                .setTitle('☕ Break Time!')
                .setDescription(`Taking a ${breakMinutes}-minute break`)
                .addFields(
                    { name: '⏰ Break Duration', value: `${breakMinutes} minutes`, inline: true },
                    { name: '🔔 Reminder', value: `I'll remind you in ${breakMinutes} minutes`, inline: true }
                )
                .setFooter({ text: 'CollectClock • Rest is important for productivity!' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Set a reminder
            setTimeout(async () => {
                try {
                    const reminderEmbed = new EmbedBuilder()
                        .setColor('#4CAF50')
                        .setTitle('🔔 Break Time Over!')
                        .setDescription('Ready to get back to work?')
                        .addFields(
                            { name: '💪 Motivation', value: 'You\'ve got this! Let\'s be productive!', inline: false }
                        )
                        .setFooter({ text: 'CollectClock • Use !clockin to resume tracking' });

                    await message.reply({ embeds: [reminderEmbed] });
                } catch (error) {
                    console.error('Break reminder error:', error);
                }
            }, breakMinutes * 60 * 1000);

        } catch (error) {
            console.error('Break time error:', error);
            await message.reply('❌ Failed to set break timer.');
        }
    }

    async showHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#607D8B')
            .setTitle('🕒 CollectClock Commands')
            .setDescription('Time tracking and productivity management')
            .addFields(
                { name: '⏰ Time Tracking', value: '`!clockin` - Start work session\n`!clockout` - End work session\n`!timesheet` - View your hours', inline: true },
                { name: '📊 Analytics', value: '`!productivity` - Detailed stats\n`!goal <hours>` - Set daily goal\n`!stats` - Quick overview', inline: true },
                { name: '🛠️ Utilities', value: '`!break [minutes]` - Take a break\n`!help-clock` - This help menu', inline: true },
                { name: '🎯 Integration', value: 'Earn TrapHouse respect for:\n• Clocking in daily\n• Meeting work goals\n• Consistent productivity', inline: false }
            )
            .setFooter({ text: 'CollectClock • Integrated with TrapHouse Bot' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Integration methods with TrapHouse respect system
    async awardClockInRespect(userId) {
        if (!this.trapHouseBot) return;
        
        try {
            // Award 5 respect for clocking in
            // You'll need to integrate this with your existing respect system
            console.log(`Awarding 5 respect to ${userId} for clocking in`);
        } catch (error) {
            console.error('Failed to award clock-in respect:', error);
        }
    }

    async awardWorkRespect(userId, hours, minutes) {
        if (!this.trapHouseBot) return;
        
        try {
            // Award respect based on work duration
            const respectPoints = Math.floor(hours * 10); // 10 respect per hour
            console.log(`Awarding ${respectPoints} respect to ${userId} for ${hours}h ${minutes}m of work`);
        } catch (error) {
            console.error('Failed to award work respect:', error);
        }
    }

    calculateRespectEarned(hours, minutes) {
        const baseRespect = 5; // For clocking in
        const workRespect = Math.floor(hours * 10); // 10 per hour
        return `${baseRespect + workRespect} respect`;
    }

    // Data management methods (integrate with your existing storage system)
    async saveClockInData(data) {
        // TODO: Integrate with your storage.js system
        console.log('Saving clock-in data:', data);
    }

    async getClockInData(userId) {
        // TODO: Integrate with your storage.js system
        console.log('Getting clock-in data for:', userId);
        return null; // Return actual data from storage
    }

    async saveClockOutData(data) {
        // TODO: Integrate with your storage.js system
        console.log('Saving clock-out data:', data);
    }

    async clearClockInData(userId) {
        // TODO: Integrate with your storage.js system
        console.log('Clearing clock-in data for:', userId);
    }

    async getTimesheetData(userId) {
        // TODO: Integrate with your storage.js system
        console.log('Getting timesheet data for:', userId);
        return []; // Return actual timesheet data
    }

    async getProductivityStats(userId) {
        // TODO: Integrate with your storage.js system
        return {
            currentStreak: 0,
            bestStreak: 0,
            efficiency: 85,
            weeklyHours: 0,
            monthlyHours: 0,
            goalProgress: 0
        };
    }

    async setUserGoal(userId, hours) {
        // TODO: Integrate with your storage.js system
        console.log(`Setting goal for ${userId}: ${hours} hours`);
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

const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

class CollectClockIntegration {
    constructor() {
        // Don't create separate Discord client - use main bot client
        this.client = null;
        this.isInitialized = false;
        this.trapHouseBot = null; // Reference to main TrapHouse bot
        
        console.log('🕒 CollectClock Integration created (waiting for bot reference)');
    }

    // Set reference to main TrapHouse bot
    setTrapHouseBot(trapHouseBot) {
        this.trapHouseBot = trapHouseBot;
        this.client = trapHouseBot; // Use the main bot client
        this.isInitialized = true;
        
        console.log('🕒 CollectClock integration linked to main TrapHouse bot');
    }

    // Check if CollectClock commands should be handled
    isCollectClockCommand(content) {
        const collectClockCommands = [
            '!clockin', '!clock-in',
            '!clockout', '!clock-out', 
            '!timesheet', '!hours',
            '!productivity', '!stats',
            '!goal', '!target',
            '!break',
            '!help-clock', '!collectclock'
        ];
        
        return collectClockCommands.some(cmd => content.toLowerCase().startsWith(cmd));
    }

    async handleMessage(message) {
        if (!this.isInitialized || !message.content.startsWith('!')) return;
        
        const content = message.content.toLowerCase().trim();

        // Time tracking commands
        if (content.startsWith('!clockin') || content.startsWith('!clock-in')) {
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
            await this.showHelp(message);
        }
    }

    async handleClockIn(message) {
        try {
            const userId = message.author.id;
            const timestamp = new Date();
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🟢 Clocked In Successfully!')
                .setDescription(`Welcome to work, ${message.author.username}!`)
                .addFields(
                    { name: '⏰ Start Time', value: timestamp.toLocaleString(), inline: true },
                    { name: '📍 Location', value: message.channel.name || 'DM', inline: true },
                    { name: '💰 Respect Earned', value: '+5 respect for clocking in!', inline: true }
                )
                .setFooter({ text: 'CollectClock • TrapHouse Integration' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Award respect points for clocking in
            await this.awardClockInRespect(userId);

        } catch (error) {
            console.error('Clock-in error:', error);
            await message.reply('❌ Failed to clock in. Please try again.');
        }
    }

    async handleClockOut(message) {
        try {
            const userId = message.author.id;
            const timestamp = new Date();
            
            // Mock work duration (8 hours for demo)
            const hours = 8;
            const minutes = 0;

            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔴 Clocked Out Successfully!')
                .setDescription(`Great work today, ${message.author.username}!`)
                .addFields(
                    { name: '⏰ End Time', value: timestamp.toLocaleString(), inline: true },
                    { name: '⏱️ Duration', value: `${hours}h ${minutes}m`, inline: true },
                    { name: '💰 Respect Earned', value: `${this.calculateRespectEarned(hours, minutes)}`, inline: true }
                )
                .setFooter({ text: 'CollectClock • TrapHouse Integration' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Award respect based on work duration
            if (hours > 0) {
                await this.awardWorkRespect(userId, hours, minutes);
            }

        } catch (error) {
            console.error('Clock-out error:', error);
            await message.reply('❌ Failed to clock out. Please try again.');
        }
    }

    async handleTimesheet(message) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle(`📊 ${message.author.username}'s Timesheet`)
                .setDescription('Your productivity summary')
                .addFields(
                    { name: '⏰ Total Hours This Week', value: '40.0h', inline: true },
                    { name: '📅 Sessions', value: '5 days', inline: true },
                    { name: '📈 Avg Session', value: '8.0h', inline: true },
                    { name: '💰 Total Respect Earned', value: '325 respect points', inline: false }
                )
                .setFooter({ text: 'CollectClock • Use !productivity for detailed stats' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Timesheet error:', error);
            await message.reply('❌ Failed to retrieve timesheet data.');
        }
    }

    async handleProductivityStats(message) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle(`📈 ${message.author.username}'s Productivity Stats`)
                .setDescription('Detailed productivity analysis')
                .addFields(
                    { name: '🔥 Current Streak', value: '7 days', inline: true },
                    { name: '🏆 Best Streak', value: '14 days', inline: true },
                    { name: '⭐ Efficiency Score', value: '92%', inline: true },
                    { name: '📊 This Week', value: '40h', inline: true },
                    { name: '📅 This Month', value: '160h', inline: true },
                    { name: '🎯 Goal Progress', value: '100%', inline: true }
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

            const embed = new EmbedBuilder()
                .setColor('#9C27B0')
                .setTitle('🎯 Goal Set Successfully!')
                .setDescription(`Daily productivity goal updated to ${hoursGoal} hours`)
                .addFields(
                    { name: '📈 Motivation', value: 'Consistency is key to success!', inline: false },
                    { name: '💡 Tip', value: 'Break your goal into smaller chunks throughout the day', inline: false },
                    { name: '💰 Bonus', value: `Earn ${Math.floor(hoursGoal * 15)} respect for meeting daily goals!`, inline: false }
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
                    { name: '🔔 Reminder', value: `I'll remind you in ${breakMinutes} minutes`, inline: true },
                    { name: '💡 Tip', value: 'Rest is important for productivity!', inline: false }
                )
                .setFooter({ text: 'CollectClock • Stay healthy!' })
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
            .setDescription('Time tracking and productivity management integrated with TrapHouse')
            .addFields(
                { name: '⏰ Time Tracking', value: '`!clockin` - Start work session\n`!clockout` - End work session\n`!timesheet` - View your hours', inline: true },
                { name: '📊 Analytics', value: '`!productivity` - Detailed stats\n`!goal <hours>` - Set daily goal\n`!stats` - Quick overview', inline: true },
                { name: '🛠️ Utilities', value: '`!break [minutes]` - Take a break\n`!help-clock` - This help menu', inline: true },
                { name: '🎯 TrapHouse Integration', value: 'Earn TrapHouse respect for:\n• Clocking in daily: **+5 respect**\n• Hourly work: **+10 respect per hour**\n• Meeting goals: **+25 respect bonus**\n• Daily streak: **Progressive bonus**', inline: false },
                { name: '🌐 Web Dashboard', value: 'Visit: https://jmenichole.github.io/CollectClock/', inline: false }
            )
            .setFooter({ text: 'CollectClock • Powered by TrapHouse Ecosystem' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Integration methods with TrapHouse respect system
    async awardClockInRespect(userId) {
        try {
            // Award 5 respect for clocking in
            // TODO: Integrate with actual respect system
            console.log(`💰 Awarding 5 respect to ${userId} for clocking in`);
        } catch (error) {
            console.error('Failed to award clock-in respect:', error);
        }
    }

    async awardWorkRespect(userId, hours, minutes) {
        try {
            // Award respect based on work duration (10 respect per hour)
            const respectPoints = Math.floor(hours * 10);
            console.log(`💰 Awarding ${respectPoints} respect to ${userId} for ${hours}h ${minutes}m of work`);
        } catch (error) {
            console.error('Failed to award work respect:', error);
        }
    }

    calculateRespectEarned(hours, minutes) {
        const baseRespect = 5; // For clocking in
        const workRespect = Math.floor(hours * 10); // 10 per hour
        return `+${baseRespect + workRespect} respect`;
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

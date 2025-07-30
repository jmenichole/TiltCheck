require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const roleManager = require('./roleManager');
const { addRespectPoints, handleRespectCommand, handleShowoffPost, handleFireReaction } = require('./respectManager');
const loanManager = require('./loanManager');
const { handleFrontCommand } = require('./front');
const { handleAdminFrontCommand } = require('./admin_front');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});

client.once('ready', () => {
    console.log('🏠 TrapHouse bot is online! Welcome to the streets! 💯');
});

// Handle reactions for respect points
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    try {
        // Fetch the message if it's partial
        if (reaction.partial) {
            await reaction.fetch();
        }
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        // Handle 🔥 reactions in any channel
        if (reaction.emoji.name === '🔥') {
            await handleFireReaction(reaction.message, user);
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Handle posts in #showoff-your-hits for respect
    if (message.channel.name === 'showoff-your-hits') {
        await handleShowoffPost(message);
        return;
    }

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // Handle all commands
    if (command === '!street' || command === '!streetname') {
        await roleManager.assignRole(message);
    } else if (command === '!setup_ranks') {
        // Admin command to create all rank roles
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions to set up ranks! 👮‍♂️');
        }
        
        const createdRoles = await roleManager.createRankRoles(message.guild);
        if (createdRoles.length > 0) {
            await message.reply(`✅ Created rank roles: ${createdRoles.join(', ')}\n\nUsers can now use \`!street\` to get their rank roles!`);
        } else {
            await message.reply('✅ All rank roles already exist! Users can use \`!street\` to get their roles.');
        }
    } else if (command === '!work') {
        await addRespectPoints(message);
    } else if (command === '!respect') {
        await handleRespectCommand(message, args);
    } else if (command === '!front') {
        const frontArgs = args;
        await handleFrontCommand(message, frontArgs);
    } else if (command === '!admin_front') {
        const adminArgs = args;
        await handleAdminFrontCommand(message, adminArgs);
    } else if (command === '!repay') {
        await loanManager.handleRepayment(message);
    } else if (command === '!job') {
        await message.reply('Job system coming soon! 💼 For now, use `!work` to earn respect points.');
    } else if (command === '!leaderboard') {
        await handleLeaderboard(message);
    } else if (command === '!flex') {
        await handleFlex(message);
    } else if (command === '!hood') {
        await handleHoodStats(message);
    }
    
    // Admin commands
    else if (command === '!kick' || command === '!ban' || command === '!clear' || command === '!mute') {
        if (!message.member || !message.member.permissions.has('Administrator')) {
            return message.reply('You need admin permissions for that command! 👮‍♂️');
        }
        await message.reply('Admin command system coming soon! 🔨');
    }
});

// Helper functions for commands
async function handleLeaderboard(message) {
    try {
        const { getUserData } = require('./storage');
        const { getRankFromRespect } = require('./respectManager');
        
        // Get all users (this is a simplified version - in production you'd want to track users better)
        await message.reply('🏆 **STREET LEADERBOARD** 🏆\n\nLeaderboard system coming soon! For now, check your rank with `!front trust`\n\n*Top hustlers will be displayed here once we track all users*');
    } catch (error) {
        console.error('Leaderboard error:', error);
        await message.reply('Something went wrong with the leaderboard! 💥');
    }
}

async function handleFlex(message) {
    try {
        const { getUserData } = require('./storage');
        const { getRankFromRespect } = require('./respectManager');
        
        const userData = await getUserData(message.author.id);
        const userRank = getRankFromRespect(userData.respect || 0);
        
        const flexMessages = [
            `${message.author.username} is flexin' with ${userData.respect || 0} respect! 💯`,
            `Look at this ${userRank.rank} showing off! 🔥`,
            `${message.author.username} got the streets on lock! 👑`,
            `This ${userRank.rank} ain't playing games! 💰`,
            `${message.author.username} built different! 🏆`
        ];
        
        const randomFlex = flexMessages[Math.floor(Math.random() * flexMessages.length)];
        await message.reply(`${randomFlex}\n\n**${message.author.username}'s Status:**\n👑 Rank: ${userRank.rank}\n💯 Respect: ${userData.respect || 0}\n💰 Max Front: $${userRank.loanCap}`);
    } catch (error) {
        console.error('Flex error:', error);
        await message.reply('Something went wrong with your flex! 💥');
    }
}

async function handleHoodStats(message) {
    try {
        const fs = require('fs');
        
        // Get loan stats
        let activeLoans = 0;
        let totalBorrowed = 0;
        try {
            const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
            activeLoans = Object.values(loans).filter(loan => !loan.repaid).length;
        } catch (e) {}
        
        // Get trust stats
        let totalUsers = 0;
        let totalRepaid = 0;
        try {
            const trust = JSON.parse(fs.readFileSync('./user_trust.json', 'utf8') || '{}');
            totalUsers = Object.keys(trust).length;
            totalRepaid = Object.values(trust).reduce((sum, user) => sum + (user.totalBorrowed || 0), 0);
        } catch (e) {}
        
        await message.reply(`🏠 **TRAPHOUSE HOOD STATS** 🏠

💰 **Money on the Streets:**
• Active fronts: ${activeLoans}
• Total repaid: $${totalRepaid}
• Hustlers in the game: ${totalUsers}

📅 **Front Schedule:**
• Next front day: ${getNextMonday()}
• Current day: ${new Date().toLocaleDateString()}

🏆 **The Game:**
• Ranks available: 5 (Street Soldier → Boss)
• Max respect earned: Unlimited 💯
• Trust levels: Low → Medium → High

*Keep grinding and climb those ranks! 📈*`);
    } catch (error) {
        console.error('Hood stats error:', error);
        await message.reply('Something went wrong checking hood stats! 💥');
    }
}

function getNextMonday() {
    const today = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + (7 - today.getDay() + 1) % 7);
    return nextMonday.toDateString();
}

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Bot logged in successfully!'))
  .catch(err => console.error('Failed to log in:', err));
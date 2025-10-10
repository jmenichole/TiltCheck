const { getUserData, updateUserRole } = require('./storage');
const { getRankFromRespect } = require('./respectManager');

async function assignRole(message) {
    try {
        const userData = await getUserData(message.author.id);
        const respect = userData.respect || 0;
        const rankData = getRankFromRespect(respect);
        
        // Try to find the Discord role that matches the rank
        const role = message.guild.roles.cache.find(r => r.name === rankData.rank);
        
        if (role) {
            // Add the role if user doesn't have it
            if (!message.member.roles.cache.has(role.id)) {
                await message.member.roles.add(role);
                await updateUserRole(message.author.id, rankData.rank);
                
                return message.reply(`🏆 You've been assigned the **${rankData.rank}** role! 
                
**Your Stats:**
💯 Respect: ${respect}
👑 Rank: ${rankData.rank}
💰 Max Loan: $${rankData.loanCap}

*Keep grinding to climb the ranks!*`);
            } else {
                return message.reply(`You already have the **${rankData.rank}** role! 

**Your Stats:**
💯 Respect: ${respect}
👑 Rank: ${rankData.rank}  
💰 Max Loan: $${rankData.loanCap}

Use \`!work\` to earn more respect and climb higher!`);
            }
        } else {
            // Role doesn't exist in server, but still show user their rank
            await updateUserRole(message.author.id, rankData.rank);
            
            return message.reply(`**Your Street Name:** ${rankData.rank} 🏆

**Your Stats:**
💯 Respect: ${respect}
👑 Rank: ${rankData.rank}
💰 Max Loan: $${rankData.loanCap}

*Note: Discord role "${rankData.rank}" not found in server. Ask an admin to create these roles:*
• Street Soldier
• Corner Boy  
• Hustler
• Shot Caller
• Boss`);
        }
    } catch (error) {
        console.error('Role assignment error:', error);
        return message.reply('Something went wrong assigning your role! Try again or contact an admin. 💥');
    }
}

// Helper function for admins to create all rank roles
async function createRankRoles(guild) {
    const ranks = [
        { name: 'Street Soldier', color: '#808080' },    // Gray
        { name: 'Corner Boy', color: '#CD7F32' },        // Bronze  
        { name: 'Hustler', color: '#C0C0C0' },           // Silver
        { name: 'Shot Caller', color: '#FFD700' },       // Gold
        { name: 'Boss', color: '#FF0000' }               // Red
    ];
    
    const createdRoles = [];
    
    for (const rankInfo of ranks) {
        try {
            // Check if role already exists
            const existingRole = guild.roles.cache.find(r => r.name === rankInfo.name);
            
            if (!existingRole) {
                const role = await guild.roles.create({
                    name: rankInfo.name,
                    color: rankInfo.color,
                    reason: 'TrapHouse Bot rank system setup'
                });
                createdRoles.push(role.name);
            }
        } catch (error) {
            console.error(`Failed to create role ${rankInfo.name}:`, error);
        }
    }
    
    return createdRoles;
}

module.exports = { assignRole, createRankRoles };

const { getUserData, saveUserData } = require('./userData');

const addRespect = async (userId, amount, guild) => {
    try {
        const user = getUserData(userId);
        user.respect += amount;

        const member = await guild.members.fetch(userId);

        // Role assignment logic
        if (user.respect >= RESPECT_THRESHOLDS.BOSS && !user.roles.includes(ROLES.BOSS)) {
            const bossRole = guild.roles.cache.find(r => r.name === ROLES.BOSS);
            if (bossRole) {
                await member.roles.add(bossRole);
                user.roles.push(ROLES.BOSS);
            }
        } else if (user.respect >= RESPECT_THRESHOLDS.UNDERBOSS && !user.roles.includes(ROLES.UNDERBOSS)) {
            const underbossRole = guild.roles.cache.find(r => r.name === ROLES.UNDERBOSS);
            if (underbossRole) {
                await member.roles.add(underbossRole);
                user.roles.push(ROLES.UNDERBOSS);
            }
        } else if (user.respect >= RESPECT_THRESHOLDS.SHOT_CALLER && !user.roles.includes(ROLES.SHOT_CALLER)) {
            const shotCallerRole = guild.roles.cache.find(r => r.name === ROLES.SHOT_CALLER);
            if (shotCallerRole) {
                await member.roles.add(shotCallerRole);
                user.roles.push(ROLES.SHOT_CALLER);
            }
        }

        // Save updated user data
        saveUserData();

        return user.respect;
    } catch (error) {
        console.error('Error in addRespect function:', error);
        throw new Error('Failed to add respect points.');
    }
};

module.exports = addRespect;

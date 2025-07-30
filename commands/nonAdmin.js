const users = {}; // Temporary in-memory storage for user data (replace with a database in production)

module.exports = {
    handleNonAdminCommand: (command, args, message) => {
        const userId = message.author.id;

        // Initialize user data if not present
        if (!users[userId]) {
            users[userId] = {
                streetName: `Street Soldier ${message.author.username}`,
                respect: 0,
                activeJob: null,
                earnings: 0
            };
        }

        const user = users[userId];

        switch (command) {
            case '!street':
                message.reply(`Your street name is: ${user.streetName}`);
                break;

            case '!job':
                if (user.activeJob) {
                    message.reply(`You already have an active job: ${user.activeJob}`);
                } else {
                    user.activeJob = 'Deliver packages';
                    message.reply('You got a new job: Deliver packages!');
                }
                break;

            case '!work':
                if (user.activeJob) {
                    const respectEarned = Math.floor(Math.random() * 21) + 30; // Random between 30-50
                    user.respect += respectEarned;
                    user.earnings += 500; // Example earnings
                    message.reply(`You completed your job (${user.activeJob}) and earned $500 and ${respectEarned} respect!`);
                    user.activeJob = null; // Clear the active job
                } else {
                    message.reply('You do not have an active job. Use !job to get one.');
                }
                break;

            case '!respect':
                if (args.length && message.mentions.users.size) {
                    const targetUser = message.mentions.users.first();
                    if (targetUser.id !== userId) {
                        user.respect += 100;
                        message.reply(`You gave respect to ${targetUser.username}. (+100 Respect)`);
                    } else {
                        message.reply('You cannot give respect to yourself.');
                    }
                } else {
                    message.reply('Please mention a user to give respect.');
                }
                break;

            case '!leaderboard':
                const leaderboard = Object.entries(users)
                    .sort(([, a], [, b]) => b.respect - a.respect)
                    .slice(0, 5)
                    .map(([id, data], index) => `${index + 1}. ${data.streetName} - ${data.respect} Respect`)
                    .join('\n');
                message.reply(`Leaderboard:\n${leaderboard}`);
                break;

            case '!flex':
                message.reply(`You flexed your success: $${user.earnings} earned and ${user.respect} respect!`);
                break;

            case '!hood':
                const totalRespect = Object.values(users).reduce((sum, u) => sum + u.respect, 0);
                const totalEarnings = Object.values(users).reduce((sum, u) => sum + u.earnings, 0);
                message.reply(`Trap House Stats:\nTotal Respect: ${totalRespect}\nTotal Earnings: $${totalEarnings}`);
                break;

            default:
                message.reply('Unknown command.');
        }
    }
};

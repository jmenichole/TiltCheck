const { resetAllUsers } = require('../helpers/userData');

module.exports = {
    name: 'reset',
    description: 'Resets all user data (admin-only).',
    async execute(message) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You don't have permission to use this command.");
        }

        try {
            resetAllUsers();
            message.channel.send('All user data has been reset.');
        } catch (error) {
            console.error('Error resetting user data:', error);
            message.reply('Failed to reset user data.');
        }
    }
};

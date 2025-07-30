const { getUserData } = require('../helpers/userData');
const addRespect = require('../helpers/addRespect');

module.exports = {
    name: 'respect',
    description: 'Give respect to another user.',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1], 10);

        if (!target || isNaN(amount)) {
            return message.reply('Usage: !respect @user <amount>');
        }

        try {
            const newPoints = await addRespect(target.id, amount, message.guild);
            message.channel.send(`${target.username} just earned ${amount} respect! Total: ${newPoints} 💯`);
        } catch (error) {
            console.error('Error in respect command:', error);
            message.reply(`Failed to give respect: ${error.message}`);
        }
    },
};

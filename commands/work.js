const addRespect = require('../helpers/addRespect');

module.exports = {
    name: 'work',
    description: 'Earn respect points by working.',
    async execute(message) {
        const respectEarned = Math.floor(Math.random() * 10) + 1; // Example: 1-10 points
        await addRespect(message.author.id, respectEarned, message.guild);
        message.channel.send(`${message.author.username} earned ${respectEarned} respect points from working!`);
    },
};

const calculateJobPayout = require('../jobs');
const addRespect = require('../helpers/addRespect');

module.exports = {
    name: 'job',
    description: 'Complete a job to earn respect points.',
    async execute(message) {
        const payout = calculateJobPayout();
        await addRespect(message.author.id, payout, message.guild);
        message.channel.send(`${message.author.username} earned ${payout} respect points from the job!`);
    },
};

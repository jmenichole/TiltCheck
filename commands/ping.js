module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  async execute(message) {
    message.reply('Pong!');
  },
};

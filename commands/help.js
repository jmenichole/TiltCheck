module.exports = {
  name: 'help',
  description: 'Lists all available commands.',
  async execute(message) {
    const commands = message.client.commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');
    message.channel.send(`Available commands:\n${commands}`);
  },
};

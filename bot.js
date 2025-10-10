const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('messageCreate', (message) => {
    // Ignore messages from bots or messages without the command prefix
    if (message.author.bot || !message.content.startsWith('!')) return;

    // Extract the command and arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle specific commands
    if (command === 'ping') {
        message.reply('Pong!');
    } else if (command === 'hello') {
        message.reply('Hello there!');
    } else if (command === 'help') {
        message.reply('Available commands: !ping, !hello, !help');
    }
    // Add more commands as needed
});

client.login('YOUR_BOT_TOKEN');

require('dotenv').config(); // Load environment variables from .env file
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const { handleGeneralCommand } = require('./commands/general');
const { handleAdminCommand } = require('./commands/admin');
const { handleNonAdminCommand } = require('./commands/nonAdmin');

// Ensure the bot is logged in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageReactionAdd', async (reaction, user) => {
    // ...existing code...

    try {
        const message = reaction.message;
        const channel = message.channel;

        if (channel.name === 'showoff-your-hits' && message.author.id !== user.id) {
            const respectToAdd = 5; // +5 respect per reaction
            await addRespect(message.author.id, respectToAdd, message.guild); // Add respect to the message author
            await channel.send(`${message.author.username} earned +${respectToAdd} respect for a reaction on their message!`);
        }
    } catch (error) {
        console.error('Error updating respect:', error);
        await reaction.message.channel.send(`Something went wrong: ${error.message}`);
    }

    // ...existing code...
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command.startsWith('!')) {
        if (['!kick', '!ban', '!clear', '!mute'].includes(command)) {
            handleAdminCommand(command, args, message);
        } else {
            handleGeneralCommand(command, args, message);
        }
    }
});

client.on('message', (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command.startsWith('!')) {
        handleNonAdminCommand(command, args, message);
    }
});

// Log in the bot
client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
    console.error('Failed to login:', err);
});

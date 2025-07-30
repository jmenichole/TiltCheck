const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Purges all messages in the channel except pinned ones.',
    async execute(message, args) {
        // Check if the user has admin permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You don't have permission to use this command.");
        }

        // Confirm the channel is a text channel
        if (!message.channel.isTextBased()) {
            return message.reply("This command can only be used in text channels.");
        }

        try {
            // Fetch messages in the channel
            const messages = await message.channel.messages.fetch({ limit: 100 });

            // Filter out pinned messages
            const messagesToDelete = messages.filter(msg => !msg.pinned);

            if (messagesToDelete.size === 0) {
                return message.reply('No messages to purge.');
            }

            // Bulk delete messages
            await message.channel.bulkDelete(messagesToDelete, true);

            message.channel.send(`Purged ${messagesToDelete.size} messages.`).then(msg => {
                setTimeout(() => msg.delete(), 5000); // Auto-delete confirmation message
            });
        } catch (error) {
            console.error('Error during purge command:', error);
            message.reply('An error occurred while trying to purge messages. Ensure messages are not older than 14 days.');
        }
    },
};

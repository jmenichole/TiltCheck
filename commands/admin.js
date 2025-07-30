
module.exports = {
    handleAdminCommand: (command, args, message) => {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            return message.reply('You do not have permission to use admin commands.');
        }

        switch (command) {
            case '!kick':
                if (message.mentions.users.size) {
                    const user = message.mentions.users.first();
                    message.guild.members.kick(user)
                        .then(() => message.reply(`${user.username} has been kicked.`))
                        .catch(err => message.reply('Failed to kick the user.'));
                } else {
                    message.reply('Please mention a user to kick.');
                }
                break;
            case '!ban':
                if (message.mentions.users.size) {
                    const user = message.mentions.users.first();
                    message.guild.members.ban(user)
                        .then(() => message.reply(`${user.username} has been banned.`))
                        .catch(err => message.reply('Failed to ban the user.'));
                } else {
                    message.reply('Please mention a user to ban.');
                }
                break;
            case '!clear':
                const amount = parseInt(args[0]);
                if (!isNaN(amount) && amount > 0) {
                    message.channel.bulkDelete(amount)
                        .then(() => message.reply(`${amount} messages cleared.`))
                        .catch(err => message.reply('Failed to clear messages.'));
                } else {
                    message.reply('Please specify a valid number of messages to clear.');
                }
                break;
            case '!mute':
                if (message.mentions.users.size) {
                    const user = message.mentions.users.first();
                    const member = message.guild.members.cache.get(user.id);
                    if (member) {
                        member.voice.setMute(true)
                            .then(() => message.reply(`${user.username} has been muted.`))
                            .catch(err => message.reply('Failed to mute the user.'));
                    } else {
                        message.reply('User not found in the server.');
                    }
                } else {
                    message.reply('Please mention a user to mute.');
                }
                break;
            default:
                message.reply('Unknown admin command.');
        }
    }
};

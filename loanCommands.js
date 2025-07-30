const { PermissionsBitField } = require('discord.js');

module.exports = {
    front: (interaction) => {
        const amount = interaction.options.getInteger('amount');
        interaction.reply(`You have been fronted ${amount} credits.`);
    },
    repay: (interaction) => {
        const amount = interaction.options.getInteger('amount');
        interaction.reply(`You have repaid ${amount} credits.`);
    },
    check: (interaction) => {
        interaction.reply(`Your current loan balance is X credits.`);
    },
    forgive: (interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply('You do not have permission to use this command.');
        }
        const user = interaction.options.getUser('user');
        interaction.reply(`The loan for ${user.username} has been forgiven.`);
    }
};

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

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

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

const { resetAllUsers } = require('../helpers/userData');

module.exports = {
    name: 'reset',
    description: 'Resets all user data (admin-only).',
    async execute(message) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You don't have permission to use this command.");
        }

        try {
            resetAllUsers();
            message.channel.send('All user data has been reset.');
        } catch (error) {
            console.error('Error resetting user data:', error);
            message.reply('Failed to reset user data.');
        }
    }
};

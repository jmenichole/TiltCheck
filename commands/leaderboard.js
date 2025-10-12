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

const { PermissionsBitField } = require('discord.js');
const { getUserData, saveUserData } = require('../helpers/userData');

module.exports = {
    name: 'leaderboard',
    description: 'Displays the top users by respect.',
    async execute(message, args) {
        if (args[0] === 'clear' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const userData = getUserData();
            Object.keys(userData).forEach(userId => {
                userData[userId].respect = 0;
            });
            saveUserData(userData);
            return message.channel.send('Leaderboard has been cleared by the admin.');
        }

        const userData = getUserData();
        const sorted = Object.entries(userData)
            .sort(([, a], [, b]) => b.respect - a.respect)
            .slice(0, 10);

        if (!sorted.length) {
            return message.channel.send('No one has earned any respect yet!');
        }

        const board = sorted.map(([id, data], index) =>
            `${index + 1}. <@${id}> - ${data.respect} respect`
        ).join('\n');

        message.channel.send(`🏆 TrapHouse Leaderboard:\n${board}`);
    },
};

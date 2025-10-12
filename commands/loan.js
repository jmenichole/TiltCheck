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

const { takeLoan, repayLoan, handleDefault } = require('../loanManager');

module.exports = {
    name: 'loan',
    description: 'Manage loans (take, repay, or default).',
    execute(message, args) {
        const userId = message.author.id;
        const user = { respectLevel: 30, crewRole: 'member' }; // Example user data

        try {
            if (args[0] === 'take') {
                const amount = parseFloat(args[1]);
                if (isNaN(amount)) throw new Error('Invalid loan amount.');
                message.reply(takeLoan(userId, amount, user));
            } else if (args[0] === 'repay') {
                const payment = parseFloat(args[1]);
                if (isNaN(payment)) throw new Error('Invalid payment amount.');
                message.reply(repayLoan(userId, payment));
            } else if (args[0] === 'default') {
                message.reply(handleDefault(userId));
            } else {
                message.reply('Invalid command. Use "take", "repay", or "default".');
            }
        } catch (error) {
            message.reply(error.message);
        }
    },
};

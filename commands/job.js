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

const calculateJobPayout = require('../jobs');
const addRespect = require('../helpers/addRespect');

module.exports = {
    name: 'job',
    description: 'Complete a job to earn respect points.',
    async execute(message) {
        const payout = calculateJobPayout();
        await addRespect(message.author.id, payout, message.guild);
        message.channel.send(`${message.author.username} earned ${payout} respect points from the job!`);
    },
};

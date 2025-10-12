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

const { updateUserRespectPoints, getUserData } = require('./storage');
const fs = require('fs');

// Respect point values
const RESPECT_VALUES = {
    SHOWOFF_POST: 50,
    BUSTED_POST: 75, // Higher points for busted-and-disgusted posts
    FIRE_REACTION: 10,
    JOB_COMPLETE: 25, // varies by job
    RESPECT_GIVEN: 100,
    WORK_COMMAND: 15
};

// Rank thresholds
const RANKS = {
    'Street Soldier': { min: 0, max: 499, loanCap: 20 },
    'Corner Boy': { min: 500, max: 999, loanCap: 35 },
    'Hustler': { min: 1000, max: 1999, loanCap: 50 },
    'Shot Caller': { min: 2000, max: 4999, loanCap: 75 },
    'Boss': { min: 5000, max: Infinity, loanCap: 100 }
};

function getRankFromRespect(respect) {
    for (const [rank, data] of Object.entries(RANKS)) {
        if (respect >= data.min && respect <= data.max) {
            return { rank, ...data };
        }
    }
    return { rank: 'Street Soldier', ...RANKS['Street Soldier'] };
}

function getLoanCapFromRespect(respect) {
    const rankData = getRankFromRespect(respect);
    return rankData.loanCap;
}

async function addRespectPoints(message, points = null, reason = 'work') {
    // Use predefined points or random work points
    const earnedPoints = points || RESPECT_VALUES.WORK_COMMAND;
    
    await updateUserRespectPoints(message.author.id, earnedPoints);
    const userData = await getUserData(message.author.id);
    const newRank = getRankFromRespect(userData.respect || 0);
    
    let response = `You earned ${earnedPoints} respect points! 💯`;
    
    // Check for rank up
    const oldRespect = (userData.respect || 0) - earnedPoints;
    const oldRank = getRankFromRespect(oldRespect);
    
    if (oldRank.rank !== newRank.rank) {
        response += `\n🎉 **RANK UP!** You're now a ${newRank.rank}! 👑`;
        response += `\nNew loan cap: $${newRank.loanCap}`;
    }
    
    response += `\nTotal respect: ${userData.respect || 0} | Rank: ${newRank.rank}`;
    
    message.reply(response);
}

async function handleRespectCommand(message, args) {
    const mentionedUser = message.mentions.users.first();
    
    if (!mentionedUser) {
        return message.reply('Tag someone to give them respect! Usage: `!respect @user`');
    }
    
    if (mentionedUser.id === message.author.id) {
        return message.reply("You can't give respect to yourself! 😤");
    }
    
    // Check cooldown (once per hour per user)
    const respectData = loadRespectCooldowns();
    const cooldownKey = `${message.author.id}-${mentionedUser.id}`;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (respectData[cooldownKey] && (now - respectData[cooldownKey]) < oneHour) {
        const timeLeft = Math.ceil((oneHour - (now - respectData[cooldownKey])) / (60 * 1000));
        return message.reply(`You already gave respect to ${mentionedUser.username} recently. Wait ${timeLeft} more minutes.`);
    }
    
    // Give respect
    await updateUserRespectPoints(mentionedUser.id, RESPECT_VALUES.RESPECT_GIVEN);
    respectData[cooldownKey] = now;
    saveRespectCooldowns(respectData);
    
    const userData = await getUserData(mentionedUser.id);
    const newRank = getRankFromRespect(userData.respect || 0);
    
    message.reply(`💯 You gave ${mentionedUser.username} respect! They now have ${userData.respect || 0} respect points (${newRank.rank})`);
}

async function handleChannelPost(message) {
    // Called when someone posts in specific channels for respect
    const channelName = message.channel.name;
    
    if (channelName === 'showoff-your-hits') {
        await addRespectPoints(message, RESPECT_VALUES.SHOWOFF_POST, 'showoff post');
    } else if (channelName === 'busted-and-disgusted') {
        await addRespectPoints(message, RESPECT_VALUES.BUSTED_POST, 'busted post');
    }
}

async function handleShowoffPost(message) {
    // Called when someone posts in #showoff-your-hits (legacy function - redirects to handleChannelPost)
    await handleChannelPost(message);
}

async function handleFireReaction(message, user) {
    // Called when someone gets a 🔥 reaction
    if (message.author.id !== user.id) { // Don't give points for self-reactions
        await updateUserRespectPoints(message.author.id, RESPECT_VALUES.FIRE_REACTION);
        const userData = await getUserData(message.author.id);
        const rank = getRankFromRespect(userData.respect || 0);
        
        message.channel.send(`🔥 ${message.author.username} earned ${RESPECT_VALUES.FIRE_REACTION} respect from that fire reaction! Total: ${userData.respect || 0} (${rank.rank})`);
    }
}

function loadRespectCooldowns() {
    const path = './respect_cooldowns.json';
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(path));
}

function saveRespectCooldowns(data) {
    const path = './respect_cooldowns.json';
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { 
    addRespectPoints, 
    handleRespectCommand,
    handleShowoffPost,
    handleChannelPost,
    handleFireReaction,
    getRankFromRespect,
    getLoanCapFromRespect,
    RESPECT_VALUES,
    RANKS
};

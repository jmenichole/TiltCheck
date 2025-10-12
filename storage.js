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

const fs = require('fs');
const path = './user_data.json';

function loadUserData() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (error) {
        console.error('Error loading user data:', error);
        return {};
    }
}

function saveUserData(data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function getUserData(userId) {
    const users = loadUserData();
    return users[userId] || { respect: 0, loans: [], role: 'Street Soldier' };
}

async function updateUserRespectPoints(userId, points) {
    const users = loadUserData();
    if (!users[userId]) users[userId] = { respect: 0, loans: [], role: 'Street Soldier' };
    users[userId].respect = (users[userId].respect || 0) + points;
    saveUserData(users);
}

async function updateUserRole(userId, role) {
    const users = loadUserData();
    if (!users[userId]) users[userId] = { respect: 0, loans: [], role: 'Street Soldier' };
    users[userId].role = role;
    saveUserData(users);
}

async function storeLoan(userId, amount) {
    const users = loadUserData();
    if (!users[userId]) users[userId] = { respect: 0, loans: [], role: 'Street Soldier' };
    if (!users[userId].loans) users[userId].loans = [];
    users[userId].loans.push({ amount, date: new Date() });
    saveUserData(users);
}

module.exports = { getUserData, updateUserRespectPoints, updateUserRole, storeLoan };

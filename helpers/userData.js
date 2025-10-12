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
const path = './data/userData.json';

function getUserData() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function saveUserData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function addRespect(userId, amount, guild) {
  const data = getUserData();
  if (!data[userId]) {
    data[userId] = { respect: 0 };
  }
  data[userId].respect += amount;
  saveUserData(data);
  return data[userId].respect;
}

function resetAllUsers() {
  saveUserData({});
}

module.exports = { getUserData, saveUserData, addRespect, resetAllUsers };

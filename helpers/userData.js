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

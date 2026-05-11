const fs = require('fs').promises;
const path = require('path');

const usersPath = path.join(__dirname, '..', 'users.json');

// Handles persistence for user records in users.json.
async function readUsers() {
  const raw = await fs.readFile(usersPath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeUsers(users) {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

async function findByEmail(email) {
  const users = await readUsers();
  const normalized = String(email || '').trim().toLowerCase();
  return users.find((user) => String(user.email || '').trim().toLowerCase() === normalized) || null;
}

function getNextId(users) {
  const maxId = users.reduce((max, user) => {
    const id = Number(user.id);
    return Number.isFinite(id) && id > max ? id : max;
  }, 0);
  return maxId + 1;
}

async function addUser(user) {
  const users = await readUsers();
  const newUser = { ...user, id: getNextId(users) };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

module.exports = {
  readUsers,
  writeUsers,
  findByEmail,
  addUser
};

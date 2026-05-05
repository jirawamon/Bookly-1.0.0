const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataPath = path.join(__dirname, 'users.json');
const saltRounds = 10;

function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2') && value.length >= 59;
}

async function convertUsers() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const users = JSON.parse(raw);

  if (!Array.isArray(users)) {
    throw new Error('users.json must be an array of users');
  }

  const updated = await Promise.all(
    users.map(async (user) => {
      const password = String(user.password || '');
      if (isBcryptHash(password)) {
        return user;
      }

      const hashed = await bcrypt.hash(password, saltRounds);
      return { ...user, password: hashed };
    })
  );

  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2));
  console.log('users.json updated with bcrypt hashes.');
}

convertUsers().catch((err) => {
  console.error('Failed to convert users:', err.message);
  process.exit(1);
});

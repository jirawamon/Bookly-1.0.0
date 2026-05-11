const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const configuredPath = process.env.DB_PATH;
if (!configuredPath) {
  throw new Error('DB_PATH is required. Set it in the .env file.');
}

// Centralized SQLite connection for order storage.
const dbPath = path.resolve(__dirname, '..', configuredPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  const initSql = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;
  db.run(initSql);
});

function createOrder({ user_id, product_id, quantity, total_price }) {
  const sql = `
    INSERT INTO orders (user_id, product_id, quantity, total_price)
    VALUES (?, ?, ?, ?)
  `;
  const params = [user_id, product_id, quantity, total_price];

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID });
    });
  });
}

module.exports = { db, createOrder };

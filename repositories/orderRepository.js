const fs = require('fs').promises;
const path = require('path');
const { createOrder } = require('../config/db');

const ordersPath = path.join(__dirname, '..', 'orders.json');

// Persists order rows to SQLite.
async function createOrderRecord(payload) {
  return createOrder(payload);
}

// Appends a summary order record to orders.json.
async function appendOrderSnapshot(order) {
  let existing = [];
  try {
    const raw = await fs.readFile(ordersPath, 'utf8');
    const parsed = JSON.parse(raw);
    existing = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    existing = [];
  }

  existing.push(order);
  await fs.writeFile(ordersPath, JSON.stringify(existing, null, 2));
  return order;
}

module.exports = {
  createOrderRecord,
  appendOrderSnapshot
};

const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'project.json');

async function getAllProducts() {
  const raw = await fs.readFile(dataPath, 'utf8');
  const parsed = JSON.parse(raw);

  // If the file is an array, return it. If it has a `products` key, return that.
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.products)) return parsed.products;
  return parsed;
}

module.exports = { getAllProducts };

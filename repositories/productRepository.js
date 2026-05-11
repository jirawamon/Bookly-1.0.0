const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'project.json');

// Reads raw product data from the JSON source.
async function readProducts() {
  const raw = await fs.readFile(dataPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.products)) return parsed.products;
  return [];
}

async function getProductById(productId) {
  const products = await readProducts();
  const idNumber = Number(productId);
  if (!Number.isFinite(idNumber)) {
    return null;
  }
  return products.find((product) => Number(product.id) === idNumber) || null;
}

module.exports = { readProducts, getProductById };

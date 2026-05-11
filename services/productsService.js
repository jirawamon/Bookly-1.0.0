const productRepository = require('../repositories/productRepository');

// Provides product filtering and business logic.
async function getAllProducts(category) {
  const products = await productRepository.readProducts();
  const normalizedCategory = String(category || '').trim().toLowerCase();

  if (!normalizedCategory) {
    return products;
  }

  return products.filter((product) => {
    const productCategory = String(product.category || '').trim().toLowerCase();
    return productCategory === normalizedCategory;
  });
}

module.exports = { getAllProducts };

const productsService = require('../services/productsService');

async function getProducts(req, res, next) {
  try {
    const data = await productsService.getAllProducts();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts };

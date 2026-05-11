const productsService = require('../services/productsService');

// Handles product queries from HTTP requests.
async function getProducts(req, res, next) {
  try {
    const products = await productsService.getAllProducts(req.query.category);
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products loaded.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts };

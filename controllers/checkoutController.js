const checkoutService = require('../services/checkoutService');

// Handles checkout requests and responses.
async function checkout(req, res, next) {
  try {
    const result = await checkoutService.checkout(req.body || {});
    res.status(200).json({
      success: true,
      data: result,
      message: 'Checkout completed.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout };

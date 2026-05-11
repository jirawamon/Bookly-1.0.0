const ordersService = require('../services/ordersService');

// Handles order creation for single-product order API.
async function createOrder(req, res, next) {
  const { user_id, product_id, quantity, total_price } = req.body || {};
  const errors = {};

  const userIdNumber = Number(user_id);
  const productIdNumber = Number(product_id);
  const quantityNumber = Number(quantity);
  const totalPriceNumber = Number(total_price);

  if (!Number.isFinite(userIdNumber) || userIdNumber <= 0) {
    errors.user_id = 'user_id is required.';
  }

  if (!Number.isFinite(productIdNumber) || productIdNumber <= 0) {
    errors.product_id = 'product_id is required.';
  }

  if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
    errors.quantity = 'quantity is required.';
  }

  if (!Number.isFinite(totalPriceNumber) || totalPriceNumber < 0) {
    errors.total_price = 'total_price is required.';
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Validation failed.',
      errors
    });
  }

  try {
    const result = await ordersService.createOrder({
      user_id: userIdNumber,
      product_id: productIdNumber,
      quantity: quantityNumber,
      total_price: totalPriceNumber
    });

    return res.status(201).json({
      success: true,
      data: { orderId: result.id },
      message: 'Order created.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder };

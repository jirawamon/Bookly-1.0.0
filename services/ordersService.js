const orderRepository = require('../repositories/orderRepository');

// Coordinates order creation for the orders API.
async function createOrder(payload) {
  return orderRepository.createOrderRecord(payload);
}

module.exports = { createOrder };

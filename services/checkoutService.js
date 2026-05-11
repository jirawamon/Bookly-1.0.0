const orderRepository = require('../repositories/orderRepository');

// Handles checkout validation and persistence across storage layers.
async function checkout({ cartItems, email, cardNumber, user_id }) {
  const errors = {};
  const userIdNumber = Number(user_id);

  if (!Number.isFinite(userIdNumber) || userIdNumber <= 0) {
    errors.user_id = 'user_id is required.';
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    errors.cartItems = 'Cart is empty.';
  } else {
    const hasInvalidItem = cartItems.some((item) => {
      const productId = Number(item?.product_id ?? item?.id);
      const price = Number(item?.price ?? item?.sale_price);
      const quantity = Number(item?.quantity ?? 1);
      return (
        !Number.isFinite(productId) ||
        productId <= 0 ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      );
    });
    if (hasInvalidItem) {
      errors.cartItems = 'Cart items are invalid.';
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    errors.email = 'Email is invalid.';
  }

  const digits = String(cardNumber || '').replace(/\D/g, '');
  if (digits.length !== 16) {
    errors.cardNumber = 'Credit card number must be 16 digits.';
  }

  if (Object.keys(errors).length) {
    const error = new Error('Checkout validation failed.');
    error.status = 400;
    error.errors = errors;
    throw error;
  }

  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.price ?? item.sale_price);
    const quantity = Number(item.quantity ?? 1);
    return sum + price * quantity;
  }, 0);

  const sqliteOrders = await Promise.all(
    cartItems.map((item) => {
      const productId = Number(item?.product_id ?? item?.id);
      const price = Number(item?.price ?? item?.sale_price);
      const quantity = Number(item?.quantity ?? 1);

      return orderRepository.createOrderRecord({
        user_id: userIdNumber,
        product_id: productId,
        quantity,
        total_price: Number((price * quantity).toFixed(2))
      });
    })
  );

  const orderSnapshot = {
    id: Date.now(),
    email: String(email).trim(),
    items: cartItems,
    total: Number(total.toFixed(2)),
    createdAt: new Date().toISOString()
  };

  await orderRepository.appendOrderSnapshot(orderSnapshot);

  return {
    orderId: orderSnapshot.id,
    sqliteOrderIds: sqliteOrders.map((result) => result.id),
    total: orderSnapshot.total
  };
}

module.exports = { checkout };

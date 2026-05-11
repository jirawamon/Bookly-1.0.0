const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

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
      const quantity = Number(item?.quantity ?? 1);
      return (
        !Number.isFinite(productId) ||
        productId <= 0 ||
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

  const normalizedItems = [];
  for (const item of cartItems) {
    const productId = Number(item?.product_id ?? item?.id);
    const quantity = Math.floor(Number(item?.quantity ?? 1));

    if (!Number.isFinite(productId) || productId <= 0) {
      errors.cartItems = 'Cart items are invalid.';
      break;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.cartItems = 'Cart items are invalid.';
      break;
    }

    const product = await productRepository.getProductById(productId);
    if (!product) {
      errors.cartItems = 'Product not found.';
      break;
    }

    const unitPrice = Number(product.sale_price ?? product.original_price ?? product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.cartItems = 'Product price is invalid.';
      break;
    }

    normalizedItems.push({
      product_id: productId,
      title: product.title,
      price: unitPrice,
      quantity
    });
  }

  if (Object.keys(errors).length) {
    const error = new Error('Checkout validation failed.');
    error.status = 400;
    error.errors = errors;
    throw error;
  }

  const total = normalizedItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const sqliteOrders = await Promise.all(
    normalizedItems.map((item) => {
      return orderRepository.createOrderRecord({
        user_id: userIdNumber,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: Number((item.price * item.quantity).toFixed(2))
      });
    })
  );

  const orderSnapshot = {
    id: Date.now(),
    email: String(email).trim(),
    items: normalizedItems,
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

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const productsRoutes = require('./routes/productsRoutes');
const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Set it in the .env file.');
  process.exit(1);
}

if (!process.env.DB_PATH) {
  console.error('DB_PATH is required. Set it in the .env file.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Serve frontend (index.html + assets) from project root
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/products', productsRoutes);
app.use('/api', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/checkout', checkoutRoutes);

// Basic error handler with consistent response format
app.use((err, req, res, next) => {
  if (NODE_ENV === 'development') {
    console.error(err);
  }
  const status = err.status || 500;
  const message = status >= 500
    ? 'Internal Server Error'
    : (err.message || 'Request failed');
  const safeErrors = status >= 500 && NODE_ENV !== 'development'
    ? { error: 'Internal Server Error' }
    : (err.errors || { error: message });

  res.status(status).json({
    success: false,
    data: null,
    message,
    errors: safeErrors
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
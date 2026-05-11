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

app.use(cors());
app.use(express.json());

// Serve frontend (index.html + assets) from project root
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/products', productsRoutes);
app.use('/api', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/checkout', checkoutRoutes);

// Basic error handler with consistent response format
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error',
    errors: err.errors || { error: 'Internal Server Error' }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
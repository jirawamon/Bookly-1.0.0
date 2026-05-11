const express = require('express');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

// Checkout endpoint for cart purchases.
router.post('/', checkoutController.checkout);

module.exports = router;

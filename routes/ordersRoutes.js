const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

// Order endpoints for direct order creation.
router.post('/', ordersController.createOrder);

module.exports = router;

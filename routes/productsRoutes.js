const express = require('express');
const productsController = require('../controllers/productsController');

const router = express.Router();

// Product browsing endpoints.
router.get('/', productsController.getProducts);

module.exports = router;

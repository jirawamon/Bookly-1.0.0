const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Auth endpoints for login/register.
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;

const authService = require('../services/authService');

// Handles login and registration HTTP requests.
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body || {});
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful.'
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body || {});
    res.status(201).json({
      success: true,
      data: { user },
      message: 'Registration successful.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register };

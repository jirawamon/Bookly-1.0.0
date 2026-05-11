const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  special: /[!@#$%^&*]/
};

function buildSafeUser(user) {
  if (!user) return null;
  const fullName = user.fullName || user.name || user.firstName || '';
  const firstName = fullName.split(' ')[0] || user.firstName || '';
  return {
    id: user.id,
    email: user.email,
    fullName,
    firstName
  };
}

function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  if (!PASSWORD_REGEX.uppercase.test(password || '')) {
    errors.push('Password must include at least 1 uppercase letter.');
  }
  if (!PASSWORD_REGEX.special.test(password || '')) {
    errors.push('Password must include at least 1 special character (!@#$%^&*).');
  }
  return errors;
}

async function login({ email, password }) {
  const errors = {};
  const resolvedEmail = String(email || '').trim();
  const resolvedPassword = String(password || '');

  if (!resolvedEmail) {
    errors.email = 'Email is required.';
  }
  if (!resolvedPassword) {
    errors.password = 'Password is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (resolvedEmail && !emailRegex.test(resolvedEmail)) {
    errors.email = 'Email is invalid.';
  }

  if (Object.keys(errors).length) {
    const error = new Error('Validation failed.');
    error.status = 400;
    error.errors = errors;
    throw error;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.errors = { auth: 'Invalid email or password.' };
    throw error;
  }

  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password || '', user.password || '');
  } catch (err) {
    isMatch = false;
  }

  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.errors = { auth: 'Invalid email or password.' };
    throw error;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    const error = new Error('JWT_SECRET is not configured.');
    error.status = 500;
    error.errors = { auth: 'JWT secret missing.' };
    throw error;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: buildSafeUser(user)
  };
}

async function register({ fullName, name, email, password }) {
  const errors = {};
  const resolvedName = (fullName || name || '').trim();
  const resolvedEmail = String(email || '').trim();

  if (!resolvedName) {
    errors.fullName = 'Full name is required.';
  }
  if (!resolvedEmail) {
    errors.email = 'Email is required.';
  }

  const passwordErrors = validatePassword(password || '');
  if (passwordErrors.length) {
    errors.password = passwordErrors.join(' ');
  }

  if (Object.keys(errors).length) {
    const error = new Error('Validation failed.');
    error.status = 400;
    error.errors = errors;
    throw error;
  }

  const existing = await userRepository.findByEmail(resolvedEmail);
  if (existing) {
    const error = new Error('Email already exists.');
    error.status = 409;
    error.errors = { email: 'Email already exists.' };
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const createdUser = await userRepository.addUser({
    email: resolvedEmail,
    password: hashedPassword,
    fullName: resolvedName,
    firstName: resolvedName.split(' ')[0] || resolvedName,
    registeredAt: now
  });

  return buildSafeUser(createdUser);
}

module.exports = {
  login,
  register
};

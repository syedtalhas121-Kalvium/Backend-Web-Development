const bcrypt = require('bcryptjs');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

// A valid bcrypt hash used only to keep the unknown-email login path doing
// comparable work. The comparison result is always discarded.
const DUMMY_PASSWORD_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

function validateFields(fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new AppError(400, 'INVALID_INPUT', `${field} must be a non-empty string`);
    }
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function invalidCredentials() {
  return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}

async function register({ name, email, password } = {}) {
  validateFields({ name, email, password });

  const normalizedEmail = normalizeEmail(email);
  const normalizedName = name.trim();

  // The unique database constraint is the final protection against races.
  if (await userRepository.findByEmail(normalizedEmail)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptCostFactor);

  try {
    const user = await userRepository.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
    });
    return toSafeUser(user);
  } catch (error) {
    // Two concurrent registrations can both pass the pre-check.
    if (error && error.code === 'P2002') {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login({ email, password } = {}) {
  validateFields({ email, password });

  const user = await userRepository.findByEmail(normalizeEmail(email));

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    throw invalidCredentials();
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw invalidCredentials();
  }

  return toSafeUser(user);
}

module.exports = { register, login, toSafeUser };

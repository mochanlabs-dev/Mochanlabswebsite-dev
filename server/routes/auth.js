const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const logger = require('../services/logger');
const { issue, TTL_HOURS } = require('../services/adminToken');
const authMiddleware = require('../middleware/authMiddleware');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  logger.error('Admin credentials not configured in environment variables');
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables');
}

// Constant-time comparison (hashing first makes the lengths equal).
const same = (a, b) =>
  crypto.timingSafeEqual(
    crypto.createHash('sha256').update(String(a)).digest(),
    crypto.createHash('sha256').update(String(b)).digest()
  );

// At most 10 login attempts per IP every 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const clientIP = req.ip;

  if (!username || !password) {
    logger.warn('Login attempt with missing credentials', { ip: clientIP });
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Evaluate both so timing doesn't reveal which one was wrong.
  const userOk = same(username, ADMIN_USERNAME);
  const passOk = same(password, ADMIN_PASSWORD);
  if (userOk && passOk) {
    logger.info('Admin login successful', { username, ip: clientIP });
    return res.json({ success: true, message: 'Login successful', token: issue(username), expiresInHours: TTL_HOURS });
  }

  logger.warn('Failed login attempt', { username, ip: clientIP });
  return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Lets admin pages confirm their token is still valid.
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, username: req.adminUser });
});

module.exports = router;

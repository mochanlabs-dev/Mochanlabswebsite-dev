const { verify } = require('../services/adminToken');

// Requires a valid admin session token: "Authorization: Bearer <token>".
const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const username = verify(token);

  if (!username) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  req.adminUser = username;
  next();
};

module.exports = authMiddleware;

const crypto = require('crypto');
const logger = require('./logger');

// Admin session tokens: base64url(JSON payload) + "." + HMAC-SHA256 signature.
// They can't be forged without ADMIN_TOKEN_SECRET and expire after TTL_HOURS.

const TTL_HOURS = 8;

let secret = process.env.ADMIN_TOKEN_SECRET;
if (!secret) {
  // Works, but every restart signs everyone out. Set the variable in production.
  secret = crypto.randomBytes(32).toString('hex');
  logger.warn('ADMIN_TOKEN_SECRET is not set; using a temporary secret (admins are signed out on restart)');
}

const sign = (data) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

function issue(username) {
  const payload = Buffer.from(
    JSON.stringify({ sub: username, exp: Date.now() + TTL_HOURS * 3600 * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

// Returns the username for a valid, unexpired token, otherwise null.
function verify(token) {
  if (typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof sub === 'string' && Date.now() < exp ? sub : null;
  } catch {
    return null;
  }
}

module.exports = { issue, verify, TTL_HOURS };

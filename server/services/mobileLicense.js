// The mobile app's side of the licence portal (port of the standalone portal's lib/mobile.ts: same behaviour,
// same wire format, same rate limits).
//
// The Weighbridge mobile cloud (a separate service) never sees this database. It calls two server-to-server endpoints,
// each authorised by a shared secret (MOBILE_SERVICE_SECRET):
//
//   POST /api/v1/mobile/login         the owner typed a username and password on the phone: are they right, and is the
//                                     licence still entitled to the mobile app?
//   POST /api/v1/mobile/entitlement   plain facts about a licence (by id, or by key + machine), re-checked by the cloud
//                                     on every plant-PC request and phone session.
//
// One mobile account per licence, created from the licence page. Passwords are generated, shown once and stored only as
// a bcrypt hash.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query, queryOne } = require('./licenseDb');
const { logActivity, normalizeKey } = require('./licensing');

const MOBILE_FEATURE = 'mobile';

// No 0/O/1/I/L: credentials get read aloud and typed by hand.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const pick = (n) => Array.from({ length: n }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');

const generateUsername = () => `wbm-${pick(6).toLowerCase()}`;
/** XXXX-XXXX-XXXX, about 59 bits. Fine behind a rate limit, and typeable on a phone. */
const generatePassword = () => `${pick(4)}-${pick(4)}-${pick(4)}`;

/** Passwords are generated, so dashes, spaces and case typed on a phone keyboard must not matter. */
const normalizePassword = (raw) => String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');

const BCRYPT_COST = 12;
const hashPassword = (password) => bcrypt.hash(normalizePassword(password), BCRYPT_COST);

// Compared against when the username is unknown, so a wrong username and a wrong password take the same time.
let dummyHash = null;
const getDummyHash = () => (dummyHash = dummyHash || bcrypt.hash('NOTAREALPASSWORD', BCRYPT_COST));

// ---- service authentication ---------------------------------------------------------------------------------

const digest = (s) => crypto.createHash('sha256').update(s).digest();

/** 'unconfigured' when the secret is not set on this deployment: the endpoints stay closed rather than open. */
function serviceAuth(req) {
  const secret = process.env.MOBILE_SERVICE_SECRET || '';
  if (secret.length < 32) return 'unconfigured';
  const header = String(req.headers.authorization || '');
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  return crypto.timingSafeEqual(digest(given), digest(secret)) ? 'ok' : 'denied';
}

// ---- request validation (same limits as the portal's zod schemas) -------------------------------------------

const isStr = (v, min, max) => typeof v === 'string' && v.length >= min && v.length <= max;
const isObj = (b) => b !== null && typeof b === 'object' && !Array.isArray(b);
const optIp = (v) => v === undefined || isStr(v, 0, 100);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** { username, password, ip? } or null. */
function parseLogin(b) {
  if (!isObj(b) || !isStr(b.username, 1, 100) || !isStr(b.password, 1, 200) || !optIp(b.ip)) return null;
  return { username: b.username, password: b.password, ip: b.ip };
}

/** { licenseId } or { licenseKey, machineId, ip? } or null. */
function parseEntitlement(b) {
  if (!isObj(b)) return null;
  if (typeof b.licenseId === 'string' && UUID.test(b.licenseId)) return { licenseId: b.licenseId };
  if (isStr(b.licenseKey, 1, 64) && isStr(b.machineId, 8, 200) && optIp(b.ip)) {
    return { licenseKey: b.licenseKey, machineId: b.machineId, ip: b.ip };
  }
  return null;
}

// ---- login ----------------------------------------------------------------------------------------------------

// All mobile attempts share portal.login_attempts with the admin login, told apart by the 'mobile:' prefix.
async function tooManyMobileAttempts(username, ip) {
  const row = await queryOne(
    `select
       count(*) filter (where ip = $1)::int       as by_ip,
       count(*) filter (where username = $2)::int as by_user
     from portal.login_attempts
     where success = false and username like 'mobile:%' and at > now() - interval '15 minutes'`,
    [ip, `mobile:${username.toLowerCase()}`],
  );
  return (row ? row.by_ip : 0) >= 10 || (row ? row.by_user : 0) >= 20;
}

const recordMobileAttempt = (username, ip, success) =>
  query('insert into portal.login_attempts (username, ip, success) values ($1, $2, $3)', [`mobile:${username.toLowerCase()}`, ip, success]);

/** Resolves to { ok: true, licenseId, customerName, expiresAt } or { ok: false, reason }. */
async function mobileLogin(body) {
  const username = body.username.trim();
  const ip = body.ip || 'unknown';
  if (await tooManyMobileAttempts(username, ip)) return { ok: false, reason: 'too-many-attempts' };

  const account = await queryOne('select * from weighbridge.mobile_accounts where lower(username) = lower($1)', [username]);
  const passOk = await bcrypt.compare(normalizePassword(body.password), account ? account.password_hash : await getDummyHash());
  if (!account || !passOk) {
    await recordMobileAttempt(username, ip, false);
    return { ok: false, reason: 'bad-credentials' };
  }
  await recordMobileAttempt(username, ip, true);

  // The password was right, so it is now safe to say what is wrong with the account or licence.
  if (account.disabled_at) return { ok: false, reason: 'account-disabled' };
  const license = await queryOne('select * from weighbridge.licenses where id = $1', [account.license_id]);
  if (!license) return { ok: false, reason: 'bad-credentials' };
  if (license.revoked_at) return { ok: false, reason: 'license-revoked' };
  if (license.expires_at.getTime() <= Date.now()) return { ok: false, reason: 'license-expired' };
  if (!license.features.includes(MOBILE_FEATURE)) return { ok: false, reason: 'mobile-not-enabled' };

  await query('update weighbridge.mobile_accounts set last_login_at = now() where license_id = $1', [account.license_id]);
  return { ok: true, licenseId: license.id, customerName: license.customer_name, expiresAt: license.expires_at.toISOString() };
}

// ---- entitlement ----------------------------------------------------------------------------------------------

const NOT_FOUND = {
  found: false, licenseId: null, customerName: null, expiresAt: null,
  revoked: false, expired: false, mobile: false, accountDisabled: null, machineActive: null,
};

const INVALID_KEY_LIMIT = 20; // per address per 10 minutes, same as the app's own protocol

/** Plain facts; the mobile cloud decides what they mean for each request. Resolves to an object, or 'too-many-attempts'. */
async function getEntitlement(body) {
  let license;
  let machineId = null;

  if (body.licenseId) {
    license = await queryOne('select * from weighbridge.licenses where id = $1', [body.licenseId]);
  } else {
    const ip = body.ip || 'unknown';
    const recent = await queryOne(
      `select count(*)::int as n from weighbridge.activity_log
       where action = 'invalid-key' and ip = $1 and at > now() - interval '10 minutes'`, [ip]);
    if ((recent ? recent.n : 0) >= INVALID_KEY_LIMIT) return 'too-many-attempts';

    const key = normalizeKey(body.licenseKey);
    license = await queryOne('select * from weighbridge.licenses where key = $1', [key]);
    if (!license) await logActivity('mobile', 'invalid-key', null, `Unknown key starting ${key.slice(0, 7)} (mobile enrol)`, ip);
    machineId = body.machineId;
  }
  if (!license) return { ...NOT_FOUND };

  const account = await queryOne('select disabled_at from weighbridge.mobile_accounts where license_id = $1', [license.id]);
  let machineActive = null;
  if (machineId !== null) {
    const m = await queryOne(
      'select id from weighbridge.activations where license_id = $1 and machine_id = $2 and deactivated_at is null', [license.id, machineId]);
    machineActive = m !== null;
  }

  return {
    found: true,
    licenseId: license.id,
    customerName: license.customer_name,
    expiresAt: license.expires_at.toISOString(),
    revoked: license.revoked_at !== null,
    expired: license.expires_at.getTime() <= Date.now(),
    mobile: license.features.includes(MOBILE_FEATURE),
    accountDisabled: account ? account.disabled_at !== null : null,
    machineActive,
  };
}

module.exports = {
  MOBILE_FEATURE, generateUsername, generatePassword, normalizePassword, hashPassword,
  serviceAuth, parseLogin, parseEntitlement, tooManyMobileAttempts, mobileLogin, getEntitlement,
};

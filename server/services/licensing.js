// Licensing for Mochan Labs applications (ported from the standalone license
// portal, same database, same signed-answer protocol, so installed apps keep
// working unchanged).
const crypto = require('crypto');
const { query, queryOne, withTransaction } = require('./licenseDb');

// ---------------------------------------------------------------- keys + dates

// No 0/O/1/I/L: keys get read aloud and typed by hand.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** WB-XXXX-XXXX-XXXX-XXXX: 16 characters from a 31-symbol alphabet. */
function generateKey() {
  const groups = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join(''));
  return `WB-${groups.join('-')}`;
}

/** Accepts a key typed with stray spaces, lowercase or missing dashes. */
function normalizeKey(raw) {
  const compact = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = compact.startsWith('WB') ? compact.slice(2) : compact;
  if (body.length !== 16) return String(raw).trim().toUpperCase();
  return `WB-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 30;

function licenseStatus(l, now = new Date()) {
  if (l.revoked_at) return 'revoked';
  if (new Date(l.expires_at).getTime() <= now.getTime()) return 'expired';
  if (new Date(l.expires_at).getTime() - now.getTime() <= EXPIRING_SOON_DAYS * DAY_MS) return 'expiring';
  return 'active';
}

function addMonths(from, months) {
  const d = new Date(from.getTime());
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  // Jan 31 + 1 month must land on Feb 28/29, not spill into March.
  if (d.getUTCDate() !== day) d.setUTCDate(0);
  return d;
}

/** A date typed as yyyy-mm-dd means "valid through the end of that day" in India time. */
function endOfDayIst(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return null;
  const d = new Date(`${isoDate}T23:59:59+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Turns plan fields into an expiry date, counting months from `from`. */
function expiryFrom(body, from) {
  const plan = String(body.plan || '');
  if (plan === '6m') return { date: addMonths(from, 6) };
  if (plan === '1y') return { date: addMonths(from, 12) };
  if (plan === 'custom') {
    const date = endOfDayIst(body.custom_date);
    if (!date) return { error: 'Pick a valid custom date.' };
    if (date.getTime() <= Date.now()) return { error: 'The expiry date must be in the future.' };
    return { date };
  }
  return { error: 'Choose how long the license is valid for.' };
}

// -------------------------------------------------------------------- activity

/** Appends to the audit trail. Never throws into the caller. */
async function logActivity(actor, action, licenseId, detail, ip) {
  try {
    await query(
      'insert into weighbridge.activity_log (actor, action, license_id, detail, ip) values ($1, $2, $3, $4, $5)',
      [actor, action, licenseId, detail || null, ip || null],
    );
  } catch (err) {
    console.error('[activity] failed to write log entry:', err.message);
  }
}

// ----------------------------------------------------- app <-> portal protocol

/**
 * RSA-SHA256 (PKCS#1 v1.5) over the exact JSON text, base64. The app verifies it
 * against the public key it ships with, over the SAME string.
 */
function signPayload(payloadJson) {
  const pem = (process.env.LICENSE_SIGNING_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!pem.includes('PRIVATE KEY')) throw new Error('LICENSE_SIGNING_PRIVATE_KEY is not configured.');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(payloadJson, 'utf8');
  return signer.sign(pem, 'base64');
}

function sign(payload) {
  const json = JSON.stringify(payload);
  return { payload: json, signature: signPayload(json) };
}

const str = (v, min, max) => typeof v === 'string' && v.length >= min && v.length <= max;
const optStr = (v, max) => v == null || (typeof v === 'string' && v.length <= max);

/** Returns the cleaned request body, or null when it is not a valid app request. */
function parseAppRequest(b) {
  if (!b || typeof b !== 'object') return null;
  if (!str(b.licenseKey, 1, 64) || !str(b.machineId, 8, 200) || !str(b.nonce, 8, 100)) return null;
  if (!optStr(b.machineName, 200) || !optStr(b.os, 200) || !optStr(b.appVersion, 50) || !optStr(b.localIp, 100)) return null;
  return {
    licenseKey: b.licenseKey, machineId: b.machineId, nonce: b.nonce,
    machineName: b.machineName ?? null, os: b.os ?? null, appVersion: b.appVersion ?? null, localIp: b.localIp ?? null,
  };
}

const INVALID_KEY_LIMIT = 20; // per address per 10 minutes: stops key guessing

async function tooManyInvalidKeys(ip) {
  const row = await queryOne(
    `select count(*)::int as n from weighbridge.activity_log
     where action = 'invalid-key' and ip = $1 and at > now() - interval '10 minutes'`,
    [ip],
  );
  return (row ? row.n : 0) >= INVALID_KEY_LIMIT;
}

async function processRequest(kind, body, ip) {
  const key = normalizeKey(body.licenseKey);
  const base = { machineId: body.machineId, nonce: body.nonce, issuedAt: new Date().toISOString() };

  const license = await queryOne('select * from weighbridge.licenses where key = $1', [key]);
  if (!license) {
    await logActivity('app', 'invalid-key', null, `Unknown key starting ${key.slice(0, 7)}`, ip);
    return { ...base, valid: false, reason: 'invalid-key', licenseId: null, customerName: null, expiresAt: null, graceDays: 0 };
  }

  const answer = (valid, reason) => ({
    ...base, valid, reason,
    licenseId: license.id,
    customerName: license.customer_name,
    expiresAt: license.expires_at.toISOString(),
    graceDays: license.grace_days,
  });

  const blocked = license.revoked_at ? 'revoked' : license.expires_at.getTime() <= Date.now() ? 'expired' : null;

  if (kind === 'activate') {
    if (blocked) return answer(false, blocked);
    return activate(license, body, ip, answer);
  }

  // check: refresh what we know about this machine; never creates an activation by itself.
  const updated = await query(
    `update weighbridge.activations set
        machine_name = coalesce($3, machine_name), os = coalesce($4, os),
        app_version  = coalesce($5, app_version),  local_ip = coalesce($6, local_ip),
        last_ip = $7, last_seen_at = now()
      where license_id = $1 and machine_id = $2 and deactivated_at is null
      returning id`,
    [license.id, body.machineId, body.machineName, body.os, body.appVersion, body.localIp, ip],
  );
  if (updated.length === 0) return answer(false, 'not-activated');
  if (blocked) return answer(false, blocked);
  return answer(true, null);
}

async function activate(license, body, ip, answer) {
  const { result, event } = await withTransaction(async (client) => {
    // Serialise concurrent activations of the same license so two machines can't
    // both slip in under the limit at once.
    await client.query('select id from weighbridge.licenses where id = $1 for update', [license.id]);

    const existing = await client.query(
      'select deactivated_at from weighbridge.activations where license_id = $1 and machine_id = $2',
      [license.id, body.machineId],
    );
    const others = await client.query(
      `select count(*)::int as n from weighbridge.activations
       where license_id = $1 and deactivated_at is null and machine_id <> $2`,
      [license.id, body.machineId],
    );
    if ((others.rows[0] ? others.rows[0].n : 0) >= license.max_machines) {
      return { result: answer(false, 'machine-limit'), event: 'machine-limit' };
    }

    await client.query(
      `insert into weighbridge.activations (license_id, machine_id, machine_name, os, app_version, local_ip, last_ip)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (license_id, machine_id) do update set
         machine_name = excluded.machine_name, os = excluded.os, app_version = excluded.app_version,
         local_ip = excluded.local_ip, last_ip = excluded.last_ip, last_seen_at = now(),
         activated_at = case when activations.deactivated_at is not null then now() else activations.activated_at end,
         deactivated_at = null`,
      [license.id, body.machineId, body.machineName, body.os, body.appVersion, body.localIp, ip],
    );

    const wasDeactivated = existing.rows.length > 0 && existing.rows[0].deactivated_at !== null;
    const isNew = existing.rows.length === 0;
    return { result: answer(true, null), event: isNew ? 'activated' : wasDeactivated ? 'reactivated' : null };
  });

  if (event) {
    const who = body.machineName || 'unknown computer';
    await logActivity('app', event, license.id,
      event === 'machine-limit' ? `${who} was refused: already active on ${license.max_machines} machine(s)` : who, ip);
  }
  return result;
}

// ------------------------------------------------------------- applications

const CODE_PATTERN = /^[a-z][a-z0-9-]{1,29}$/;
const RESERVED = new Set(['new', 'api', 'login', 'admin', 'portal', 'public', 'information-schema', 'information_schema']);
const schemaNameFor = (code) => code.replace(/-/g, '_');

/** Null when the code is usable, otherwise a message for the form. */
function codeProblem(code) {
  if (!CODE_PATTERN.test(code)) return 'App code must be 2-30 characters: lowercase letters, numbers and hyphens, starting with a letter.';
  if (RESERVED.has(code) || RESERVED.has(schemaNameFor(code)) || schemaNameFor(code).startsWith('pg_')) {
    return `"${code}" is reserved. Choose another code.`;
  }
  return null;
}

const APP_COLORS = ['blue', 'emerald', 'violet', 'amber', 'rose', 'teal', 'slate', 'orange'];
const MAX_ICON_BYTES = 200 * 1024;
const ICON_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/** Validates an uploaded icon sent as a data: URL. Returns { icon } or { error }. */
function checkIcon(dataUrl) {
  const m = /^data:([a-z+\/]+);base64,([A-Za-z0-9+\/=]+)$/.exec(String(dataUrl || ''));
  if (!m || !ICON_TYPES.includes(m[1])) return { error: 'The icon must be a PNG, JPEG, WebP or SVG image.' };
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > MAX_ICON_BYTES) {
    return { error: `The icon is too large (${Math.ceil(bytes.length / 1024)} KB). The limit is ${MAX_ICON_BYTES / 1024} KB.` };
  }
  if (m[1] === 'image/svg+xml') {
    const svg = bytes.toString('utf8');
    if (!/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(svg) || /<script|on\w+\s*=/i.test(svg)) {
      return { error: 'That SVG can\'t be used (it must be a plain image, with no scripts).' };
    }
  }
  return { icon: String(dataUrl) };
}

// Only Weighbridge is wired up so far; new applications get the same panels,
// shown as "not connected yet" until their code is added here.
const CONNECTED = { weighbridge: { licenses: true } };
const isConnected = (code) => code in CONNECTED;

function panelsFor(code) {
  const c = CONNECTED[code] || {};
  return [
    {
      slug: 'licenses', name: 'Licensing', connected: Boolean(c.licenses),
      description: 'Issue, extend and revoke licenses, see which computers they run on and when each last checked in.',
    },
    { slug: 'users', name: 'Users', connected: false, description: 'People who can sign in to this application.' },
  ];
}

module.exports = {
  generateKey, normalizeKey, licenseStatus, addMonths, endOfDayIst, expiryFrom, EXPIRING_SOON_DAYS,
  logActivity, sign, parseAppRequest, tooManyInvalidKeys, processRequest,
  codeProblem, schemaNameFor, APP_COLORS, checkIcon, isConnected, panelsFor,
};

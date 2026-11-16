// Tests for the mobile-app additions to the licence portal.
//
// They need a throwaway Postgres, never a real database. Easiest is pglite over a socket:
//   npx pglite-server --db=memory:// --port=5434 --max-connections=5       (from any project that has pglite-server)
//   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5434/postgres DATABASE_SSL=disable node --test server/test
// Without DATABASE_URL every test is skipped. With one, the test REFUSES to run unless the host is local, because it
// creates schemas and rows.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');

const URL_ENV = process.env.DATABASE_URL || '';
const skip = !URL_ENV;
if (!skip) {
  const host = new URL(URL_ENV).hostname;
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    throw new Error(`Refusing to run the licence tests against a non-local database host (${host}).`);
  }
}

// Environment for the code under test (set before it is loaded).
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const PUBLIC_PEM = publicKey.export({ type: 'spki', format: 'pem' });
process.env.LICENSE_SIGNING_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' });
const SECRET = 'test-mobile-service-secret-0123456789-abcdefghijkl';
process.env.MOBILE_SERVICE_SECRET = SECRET;
process.env.ADMIN_TOKEN_SECRET = 'test-admin-token-secret';
process.env.VERCEL = '1'; // logger: console only, no log files
process.env.DATABASE_SSL = 'disable';

let pg, server, base, db, adminToken;
const sqlDir = path.join(__dirname, '..', 'db');
const BASE_SQL = () => fs.readFileSync(path.join(__dirname, 'fixtures', 'base-schema.sql'), 'utf8');
const MIGRATION_SQL = () => fs.readFileSync(path.join(sqlDir, 'licensing-mobile.sql'), 'utf8');

before(async () => {
  if (skip) return;
  const express = require('express');
  const { Client } = require('pg');
  pg = Client;
  db = new Client({ connectionString: URL_ENV, ssl: false });
  await db.connect();
  await db.query('drop schema if exists weighbridge cascade; drop schema if exists portal cascade;');
  await db.query(BASE_SQL()); // the schema as it is in production TODAY (no features, no mobile_accounts)

  const app = express();
  app.use(express.json());
  app.use('/api/v1/mobile', require('../routes/mobileApp'));
  app.use('/api/v1', require('../routes/licenseApp'));
  app.use('/api/projects', require('../routes/projects'));
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  adminToken = require('../services/adminToken').issue('test-admin');
});

after(async () => {
  if (skip) return;
  await new Promise((r) => server.close(r));
  await db.end();
  await require('../services/licenseDb').end();
});

// ------------------------------------------------------------------ helpers

async function post(url, body, { auth, headers } = {}) {
  const res = await fetch(base + url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}), ...(headers || {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, json: await res.json().catch(() => null) };
}
const svc = (url, body, secret = SECRET) => post(url, body, { auth: secret });
const admin = (url, body, method = 'POST') => fetch(base + '/api/projects' + url, {
  method, headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` }, body: body === undefined ? undefined : JSON.stringify(body),
}).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => null) }));

const nonce = () => crypto.randomBytes(8).toString('hex');
const machine = (id) => ({ machineId: id, machineName: 'TEST-PC', os: 'Windows 11', appVersion: '0.2.27', localIp: '10.0.0.5' });

/** Calls /activate or /check like the installed app does and verifies the signature over the exact payload text. */
async function appCall(kind, key, machineId) {
  const r = await post(`/api/v1/${kind}`, { licenseKey: key, ...machine(machineId), nonce: nonce() });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(r.json.payload, 'utf8');
  assert.equal(verifier.verify(PUBLIC_PEM, r.json.signature, 'base64'), true, 'signature must verify with the public key over the exact payload text');
  return JSON.parse(r.json.payload);
}

async function newLicense(over = {}) {
  const key = 'WB-' + Array.from({ length: 4 }, () => crypto.randomBytes(2).toString('hex').toUpperCase()).join('-');
  const row = (await db.query(
    `insert into weighbridge.licenses (key, customer_name, max_machines, grace_days, expires_at)
     values ($1, $2, $3, 7, now() + interval '200 days') returning id`,
    [key, over.name || 'Test Co', over.max || 2])).rows[0];
  return { id: row.id, key };
}

const LEGACY_KEYS = ['customerName', 'expiresAt', 'graceDays', 'issuedAt', 'licenseId', 'machineId', 'nonce', 'reason', 'valid'];

// ------------------------------------------------------------------ the existing protocol must not change

test('old-style activate and check still work BEFORE the migration (production today)', { skip }, async () => {
  const lic = await newLicense({ name: 'Legacy Co' });
  const a = await appCall('activate', lic.key, 'machine-legacy-1');
  assert.equal(a.valid, true);
  assert.equal(a.reason, null);
  assert.equal(a.customerName, 'Legacy Co');
  assert.equal(a.graceDays, 7);
  assert.equal(a.licenseId, lic.id);
  // the only addition is `features`; every existing field is still there with the same meaning
  assert.deepEqual(Object.keys(a).filter((k) => k !== 'features').sort(), LEGACY_KEYS);
  assert.deepEqual(a.features, []);
  const c = await appCall('check', lic.key, 'machine-legacy-1');
  assert.equal(c.valid, true);
  const c2 = await appCall('check', lic.key, 'machine-not-activated');
  assert.equal(c2.valid, false);
  assert.equal(c2.reason, 'not-activated');
  const bad = await appCall('check', 'WB-AAAA-BBBB-CCCC-DDDD', 'machine-legacy-1');
  assert.equal(bad.valid, false);
  assert.equal(bad.reason, 'invalid-key');
  assert.equal(bad.licenseId, null);
  assert.deepEqual(bad.features, []);
});

test('the migration is additive and can be run twice', { skip }, async () => {
  await db.query(MIGRATION_SQL());
  await db.query(MIGRATION_SQL());
  const col = await db.query(`select data_type, is_nullable, column_default from information_schema.columns where table_schema = 'weighbridge' and table_name = 'licenses' and column_name = 'features'`);
  assert.equal(col.rows.length, 1);
  assert.equal(col.rows[0].is_nullable, 'NO');
  const tbl = await db.query(`select to_regclass('weighbridge.mobile_accounts') as t`);
  assert.ok(tbl.rows[0].t);
  // existing licences got the default
  const lic = await db.query(`select features from weighbridge.licenses limit 1`);
  assert.deepEqual(lic.rows[0].features, []);
});

test('old-style activate and check are unchanged AFTER the migration; features appear only when switched on', { skip }, async () => {
  const lic = await newLicense();
  const a = await appCall('activate', lic.key, 'machine-after-1');
  assert.equal(a.valid, true);
  assert.deepEqual(Object.keys(a).filter((k) => k !== 'features').sort(), LEGACY_KEYS);
  assert.deepEqual(a.features, []);
  await db.query(`update weighbridge.licenses set features = '{mobile}' where id = $1`, [lic.id]);
  const c = await appCall('check', lic.key, 'machine-after-1');
  assert.equal(c.valid, true);
  assert.deepEqual(c.features, ['mobile']);
  // machine limit and revoke/expiry still answer the same way
  await newLicense();
  const full = await newLicense({ max: 1 });
  await appCall('activate', full.key, 'machine-x');
  const refused = await appCall('activate', full.key, 'machine-y');
  assert.equal(refused.valid, false);
  assert.equal(refused.reason, 'machine-limit');
  await db.query(`update weighbridge.licenses set revoked_at = now() where id = $1`, [lic.id]);
  assert.equal((await appCall('check', lic.key, 'machine-after-1')).reason, 'revoked');
});

// ------------------------------------------------------------------ service endpoints

test('service endpoints: no secret, wrong secret, unconfigured, malformed', { skip }, async () => {
  assert.equal((await post('/api/v1/mobile/login', { username: 'a', password: 'b' })).status, 401);
  assert.equal((await svc('/api/v1/mobile/login', { username: 'a', password: 'b' }, 'x'.repeat(48))).status, 401);
  assert.equal((await svc('/api/v1/mobile/login', { username: 'a' })).status, 400);
  assert.equal((await svc('/api/v1/mobile/login', { username: 'a', password: 'b', ip: null })).status, 400);
  assert.equal((await svc('/api/v1/mobile/entitlement', { licenseId: 'not-a-uuid' })).status, 400);
  assert.equal((await svc('/api/v1/mobile/entitlement', {})).status, 400);
  const saved = process.env.MOBILE_SERVICE_SECRET;
  process.env.MOBILE_SERVICE_SECRET = 'short';
  assert.equal((await svc('/api/v1/mobile/login', { username: 'a', password: 'b' }, 'short')).status, 503);
  delete process.env.MOBILE_SERVICE_SECRET;
  assert.equal((await svc('/api/v1/mobile/entitlement', { licenseId: crypto.randomUUID() }, SECRET)).status, 503);
  process.env.MOBILE_SERVICE_SECRET = saved;
});

test('login: every outcome', { skip }, async () => {
  const bcrypt = require('bcryptjs');
  const lic = await newLicense({ name: 'Login Co' });
  await db.query(`update weighbridge.licenses set features = '{mobile}' where id = $1`, [lic.id]);
  const username = 'wbm-test01';
  await db.query('insert into weighbridge.mobile_accounts (license_id, username, password_hash) values ($1, $2, $3)', [lic.id, username, bcrypt.hashSync('ABCDEFGHJKMN', 4)]);
  const login = (pw, ip = 'login-ip-1', who = username) => svc('/api/v1/mobile/login', { username: who, password: pw, ip });

  let m = await login('WRONG-WRONG-WRONG');
  assert.deepEqual(m.json, { ok: false, reason: 'bad-credentials' });
  m = await login('x', 'login-ip-1', 'nobody-here');
  assert.deepEqual(m.json, { ok: false, reason: 'bad-credentials' });
  m = await login('abcd efgh jkmn');
  assert.equal(m.status, 200);
  assert.equal(m.json.ok, true);
  assert.equal(m.json.licenseId, lic.id);
  assert.equal(m.json.customerName, 'Login Co');
  assert.ok(m.json.expiresAt);
  assert.ok((await db.query('select last_login_at from weighbridge.mobile_accounts where license_id = $1', [lic.id])).rows[0].last_login_at);
  assert.equal((await login('ABCD-EFGH-JKMN', 'login-ip-1', username.toUpperCase())).json.ok, true, 'username is case-insensitive');

  await db.query('update weighbridge.mobile_accounts set disabled_at = now() where license_id = $1', [lic.id]);
  assert.equal((await login('ABCD-EFGH-JKMN')).json.reason, 'account-disabled');
  await db.query('update weighbridge.mobile_accounts set disabled_at = null where license_id = $1', [lic.id]);
  await db.query(`update weighbridge.licenses set features = '{}' where id = $1`, [lic.id]);
  assert.equal((await login('ABCD-EFGH-JKMN')).json.reason, 'mobile-not-enabled');
  await db.query(`update weighbridge.licenses set features = '{mobile}', revoked_at = now() where id = $1`, [lic.id]);
  assert.equal((await login('ABCD-EFGH-JKMN')).json.reason, 'license-revoked');
  await db.query(`update weighbridge.licenses set revoked_at = null, expires_at = now() - interval '1 day' where id = $1`, [lic.id]);
  assert.equal((await login('ABCD-EFGH-JKMN')).json.reason, 'license-expired');
});

test('login: brute force is limited per address and per username', { skip }, async () => {
  for (let i = 0; i < 10; i++) await svc('/api/v1/mobile/login', { username: 'victim-a', password: 'nope', ip: 'rl-ip-1' });
  const blocked = await svc('/api/v1/mobile/login', { username: 'someone-else', password: 'nope', ip: 'rl-ip-1' });
  assert.equal(blocked.json.reason, 'too-many-attempts');
  for (let i = 0; i < 20; i++) await svc('/api/v1/mobile/login', { username: 'victim-b', password: 'nope', ip: `rl-ip-b-${i}` });
  const blockedUser = await svc('/api/v1/mobile/login', { username: 'victim-b', password: 'nope', ip: 'rl-ip-fresh' });
  assert.equal(blockedUser.json.reason, 'too-many-attempts');
});

test('entitlement: by id, by key + machine, unknown key, disabled account, rate limit', { skip }, async () => {
  const lic = await newLicense();
  await appCall('activate', lic.key, 'machine-ent-1234');
  let m = await svc('/api/v1/mobile/entitlement', { licenseId: lic.id });
  assert.equal(m.json.found, true);
  assert.equal(m.json.mobile, false);
  assert.equal(m.json.accountDisabled, null);
  assert.equal(m.json.machineActive, null);
  await db.query(`update weighbridge.licenses set features = '{mobile}' where id = $1`, [lic.id]);
  await db.query('insert into weighbridge.mobile_accounts (license_id, username, password_hash) values ($1, $2, $3)', [lic.id, 'wbm-ent001', 'x']);
  m = await svc('/api/v1/mobile/entitlement', { licenseId: lic.id });
  assert.deepEqual([m.json.mobile, m.json.accountDisabled, m.json.revoked, m.json.expired], [true, false, false, false]);
  m = await svc('/api/v1/mobile/entitlement', { licenseKey: lic.key.toLowerCase(), machineId: 'machine-ent-1234', ip: 'ent-ip-1' });
  assert.equal(m.json.machineActive, true);
  m = await svc('/api/v1/mobile/entitlement', { licenseKey: lic.key, machineId: 'machine-never-seen', ip: 'ent-ip-1' });
  assert.equal(m.json.machineActive, false);
  m = await svc('/api/v1/mobile/entitlement', { licenseKey: 'WB-NOPE-NOPE-NOPE-NOPE', machineId: 'machine-ent-1234', ip: 'ent-ip-1' });
  assert.equal(m.status, 200);
  assert.equal(m.json.found, false);
  await db.query('update weighbridge.mobile_accounts set disabled_at = now() where license_id = $1', [lic.id]);
  assert.equal((await svc('/api/v1/mobile/entitlement', { licenseId: lic.id })).json.accountDisabled, true);

  for (let i = 0; i < 20; i++) await db.query(`insert into weighbridge.activity_log (actor, action, license_id, ip) values ('app', 'invalid-key', null, 'ent-ip-limit')`);
  assert.equal((await svc('/api/v1/mobile/entitlement', { licenseKey: lic.key, machineId: 'machine-ent-1234', ip: 'ent-ip-limit' })).status, 429);
});

// ------------------------------------------------------------------ admin: the "Mobile app" box

test('admin API: feature switch, create login, reset, disable, delete, and what the owner sees', { skip }, async () => {
  assert.equal((await post('/api/projects/weighbridge/licenses/' + crypto.randomUUID() + '/features', { mobile: true })).status, 401, 'needs an admin');

  const created = await admin('/weighbridge/licenses', { customer_name: 'Admin Test Co', plan: '1y', max_machines: 1, grace_days: 7 });
  assert.equal(created.status, 201);
  const id = created.json.data.id;
  const key = created.json.data.key;

  // no login before the feature is on
  let r = await admin(`/weighbridge/licenses/${id}/mobile/credentials`);
  assert.equal(r.status, 400);

  r = await admin(`/weighbridge/licenses/${id}/features`, { mobile: true });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json.data.features, ['mobile']);
  assert.deepEqual((await appCall('check', key, 'machine-admin-1')).features ?? [], ['mobile']);

  r = await admin(`/weighbridge/licenses/${id}/mobile/credentials`);
  assert.equal(r.status, 201);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  const { username, password } = r.json.data;
  assert.equal(r.json.data.created, true);
  assert.match(username, /^wbm-[a-z2-9]{6}$/);
  assert.match(password, /^[2-9A-HJKMN-Z]{4}-[2-9A-HJKMN-Z]{4}-[2-9A-HJKMN-Z]{4}$/);
  const stored = (await db.query('select password_hash from weighbridge.mobile_accounts where license_id = $1', [id])).rows[0].password_hash;
  assert.ok(stored.startsWith('$2'), 'only a bcrypt hash is stored');
  assert.ok(!stored.includes(password.replace(/-/g, '')));

  // the owner can sign in with it (the cloud's call)
  const ok = await svc('/api/v1/mobile/login', { username, password: password.toLowerCase().replace(/-/g, ' '), ip: 'admin-ip' });
  assert.equal(ok.json.ok, true);
  assert.equal(ok.json.licenseId, id);

  // the licence page data never contains the hash or the password
  r = await admin(`/weighbridge/licenses/${id}`, undefined, 'GET');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.mobile.username, username);
  assert.ok(!('password_hash' in r.json.data.mobile));
  assert.ok(!JSON.stringify(r.json).includes(password));

  // reset: same username, new password, old one stops working
  r = await admin(`/weighbridge/licenses/${id}/mobile/credentials`);
  assert.equal(r.status, 200);
  assert.equal(r.json.data.created, false);
  assert.equal(r.json.data.username, username);
  assert.notEqual(r.json.data.password, password);
  assert.equal((await svc('/api/v1/mobile/login', { username, password, ip: 'admin-ip' })).json.reason, 'bad-credentials');
  assert.equal((await svc('/api/v1/mobile/login', { username, password: r.json.data.password, ip: 'admin-ip' })).json.ok, true);

  // disable / enable
  assert.equal((await admin(`/weighbridge/licenses/${id}/mobile/disabled`, { disabled: true })).status, 200);
  assert.equal((await svc('/api/v1/mobile/login', { username, password: r.json.data.password, ip: 'admin-ip' })).json.reason, 'account-disabled');
  assert.equal((await admin(`/weighbridge/licenses/${id}/mobile/disabled`, { disabled: false })).status, 200);

  // feature off: the phone is refused, the account is kept
  assert.equal((await admin(`/weighbridge/licenses/${id}/features`, { mobile: false })).status, 200);
  assert.equal((await svc('/api/v1/mobile/login', { username, password: r.json.data.password, ip: 'admin-ip' })).json.reason, 'mobile-not-enabled');
  assert.equal((await svc('/api/v1/mobile/entitlement', { licenseId: id })).json.mobile, false);

  // delete
  assert.equal((await admin(`/weighbridge/licenses/${id}/mobile`, undefined, 'DELETE')).status, 200);
  assert.equal((await admin(`/weighbridge/licenses/${id}/mobile/disabled`, { disabled: true })).status, 404);

  // every step left a line in the activity log, and none of them contains the password
  const log = (await db.query('select action, detail from weighbridge.activity_log where license_id = $1', [id])).rows;
  const actions = log.map((l) => l.action);
  for (const a of ['features-updated', 'mobile-account-created', 'mobile-password-reset', 'mobile-account-disabled', 'mobile-account-enabled', 'mobile-account-removed']) {
    assert.ok(actions.includes(a), `activity log has ${a}`);
  }
  assert.ok(!JSON.stringify(log).includes(password));
});

test('admin API: two creates at once give one login', { skip }, async () => {
  const lic = await newLicense();
  await db.query(`update weighbridge.licenses set features = '{mobile}' where id = $1`, [lic.id]);
  const [a, b] = await Promise.all([
    admin(`/weighbridge/licenses/${lic.id}/mobile/credentials`),
    admin(`/weighbridge/licenses/${lic.id}/mobile/credentials`),
  ]);
  assert.ok([a.status, b.status].every((s) => s === 200 || s === 201), `${a.status} ${b.status}`);
  assert.equal(a.json.data.username, b.json.data.username);
  assert.equal((await db.query('select count(*)::int as n from weighbridge.mobile_accounts where license_id = $1', [lic.id])).rows[0].n, 1);
});

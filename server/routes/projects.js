// Admin API for the Projects area: the registry of Mochan Labs applications and,
// for Weighbridge, its licensing. Every route needs a signed-in admin.
const express = require('express');
const logger = require('../services/logger');
const authMiddleware = require('../middleware/authMiddleware');
const { query, queryOne, withTransaction } = require('../services/licenseDb');
const L = require('../services/licensing');

const router = express.Router();
router.use(authMiddleware);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const intIn = (v, min, max, fallback) => {
  const n = Number.parseInt(String(v == null ? '' : v), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};
const fail = (res, status, message) => res.status(status).json({ success: false, message });
const clientIp = (req) => (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : req.ip);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

// Express 4 does not catch rejected promises, so every handler goes through this.
const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  logger.error(`[projects] ${req.method} ${req.originalUrl} failed: ${err.message}`);
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
});

// ------------------------------------------------------------ applications

const withPanels = (app) => ({ ...app, connected: L.isConnected(app.code), panels: L.panelsFor(app.code) });

router.get('/', wrap(async (req, res) => {
  const apps = await query(
    `select * from portal.apps where archived_at is null order by (code = 'weighbridge') desc, name`);
  // Licensing numbers for the app tiles (only Weighbridge is connected).
  const lic = await query('select expires_at, revoked_at from weighbridge.licenses');
  const statuses = lic.map((l) => L.licenseStatus(l));
  const stats = {
    weighbridge: {
      licenses: lic.length,
      inForce: statuses.filter((s) => s === 'active' || s === 'expiring').length,
      expiring: statuses.filter((s) => s === 'expiring').length,
    },
  };
  res.json({ success: true, data: apps.map((a) => ({ ...withPanels(a), stats: stats[a.code] || null })) });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  const name = text(b.name, 60);
  const code = text(b.code, 30).toLowerCase();
  const color = L.APP_COLORS.includes(b.color) ? b.color : 'blue';
  const status = b.status === 'live' ? 'live' : 'planned';

  if (!name) return fail(res, 400, 'Project name is required.');
  const problem = L.codeProblem(code);
  if (problem) return fail(res, 400, problem);

  let icon = null;
  if (b.icon) {
    const checked = L.checkIcon(b.icon);
    if (checked.error) return fail(res, 400, checked.error);
    icon = checked.icon;
  }

  const schema = L.schemaNameFor(code);
  const clash = await query('select 1 from portal.apps where code = $1 or schema_name = $2', [code, schema]);
  if (clash.length > 0) return fail(res, 409, `A project with the code "${code}" already exists.`);

  // The app's row and its own empty schema are created together. `schema` is validated to
  // [a-z][a-z0-9_]{1,29} above, so using it as an identifier is safe.
  await withTransaction(async (client) => {
    await client.query(
      `insert into portal.apps (code, name, description, schema_name, icon_data, color, status)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [code, name, text(b.description, 300), schema, icon, color, status],
    );
    await client.query(`create schema if not exists "${schema}"`);
  });
  const created = await queryOne('select * from portal.apps where code = $1', [code]);
  res.status(201).json({ success: true, data: withPanels(created) });
}));

// ------------------------------------------------------ Weighbridge licensing
// (declared before '/:code' so "weighbridge/..." is never read as a project code)

async function licenseRows() {
  const rows = await query(
    `select l.*,
            coalesce(a.active_count, 0)::int as active_count,
            a.last_seen
       from weighbridge.licenses l
       left join (
         select license_id,
                count(*) filter (where deactivated_at is null) as active_count,
                max(last_seen_at) as last_seen
           from weighbridge.activations group by license_id
       ) a on a.license_id = l.id
      order by l.created_at desc`);
  return rows.map((r) => ({ ...r, status: L.licenseStatus(r) }));
}

router.get('/weighbridge/overview', wrap(async (req, res) => {
  const rows = await licenseRows();
  const count = (fn) => rows.filter(fn).length;
  const counts = {
    total: rows.length,
    inForce: count((r) => r.status === 'active' || r.status === 'expiring'),
    expiring: count((r) => r.status === 'expiring'),
    expired: count((r) => r.status === 'expired'),
    revoked: count((r) => r.status === 'revoked'),
    // Opened in the last 24 hours.
    online: count((r) => r.last_seen && Date.now() - new Date(r.last_seen).getTime() < 24 * 3600 * 1000),
  };
  const attention = rows
    .filter((r) => r.status === 'expiring')
    .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))
    .slice(0, 6)
    .map((r) => ({ id: r.id, customer_name: r.customer_name, expires_at: r.expires_at }));
  const activity = await query(
    `select a.id, a.at, a.actor, a.action, a.license_id, a.detail, l.customer_name
       from weighbridge.activity_log a left join weighbridge.licenses l on l.id = a.license_id
      where a.action <> 'invalid-key' and a.action not like 'admin-login%'
      order by a.at desc limit 12`);
  res.json({ success: true, data: { counts, attention, activity } });
}));

router.get('/weighbridge/licenses', wrap(async (req, res) => {
  res.json({ success: true, data: await licenseRows() });
}));

router.post('/weighbridge/licenses', wrap(async (req, res) => {
  const b = req.body || {};
  const customer = text(b.customer_name, 200);
  if (!customer) return fail(res, 400, 'Customer name is required.');
  const expiry = L.expiryFrom(b, new Date());
  if (expiry.error) return fail(res, 400, expiry.error);

  const row = await queryOne(
    `insert into weighbridge.licenses (key, customer_name, notes, max_machines, grace_days, expires_at)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [L.generateKey(), customer, text(b.notes, 2000) || null, intIn(b.max_machines, 1, 50, 1), intIn(b.grace_days, 1, 60, 7), expiry.date],
  );
  await L.logActivity(req.adminUser, 'license-created', row.id, `${customer}, valid until ${fmtDate(expiry.date)}`, clientIp(req));
  res.status(201).json({ success: true, data: { ...row, status: L.licenseStatus(row) } });
}));

router.get('/weighbridge/licenses/:id', wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return fail(res, 404, 'License not found.');
  const license = await queryOne('select * from weighbridge.licenses where id = $1', [req.params.id]);
  if (!license) return fail(res, 404, 'License not found.');
  const machines = await query(
    'select * from weighbridge.activations where license_id = $1 order by (deactivated_at is not null), last_seen_at desc', [license.id]);
  const log = await query(
    'select * from weighbridge.activity_log where license_id = $1 order by at desc limit 40', [license.id]);
  res.json({ success: true, data: { license: { ...license, status: L.licenseStatus(license) }, machines, log } });
}));

router.put('/weighbridge/licenses/:id', wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return fail(res, 404, 'License not found.');
  const b = req.body || {};
  const customer = text(b.customer_name, 200);
  if (!customer) return fail(res, 400, 'Customer name is required.');
  const row = await queryOne(
    `update weighbridge.licenses set customer_name = $2, notes = $3, max_machines = $4, grace_days = $5
      where id = $1 returning id`,
    [req.params.id, customer, text(b.notes, 2000) || null, intIn(b.max_machines, 1, 50, 1), intIn(b.grace_days, 1, 60, 7)],
  );
  if (!row) return fail(res, 404, 'License not found.');
  await L.logActivity(req.adminUser, 'license-updated', row.id, null, clientIp(req));
  res.json({ success: true });
}));

router.post('/weighbridge/licenses/:id/extend', wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return fail(res, 404, 'License not found.');
  const license = await queryOne('select * from weighbridge.licenses where id = $1', [req.params.id]);
  if (!license) return fail(res, 404, 'License not found.');
  // Presets add time on top of whatever is left (or from today if it already lapsed), so
  // extending an almost-expired license never throws away the days the customer paid for.
  const from = license.expires_at.getTime() > Date.now() ? license.expires_at : new Date();
  const expiry = L.expiryFrom(req.body || {}, from);
  if (expiry.error) return fail(res, 400, expiry.error);
  await query('update weighbridge.licenses set expires_at = $2 where id = $1', [license.id, expiry.date]);
  await L.logActivity(req.adminUser, 'license-extended', license.id, `Now valid until ${fmtDate(expiry.date)}`, clientIp(req));
  res.json({ success: true, data: { expires_at: expiry.date } });
}));

router.post('/weighbridge/licenses/:id/revoke', wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return fail(res, 404, 'License not found.');
  await query('update weighbridge.licenses set revoked_at = now() where id = $1 and revoked_at is null', [req.params.id]);
  await L.logActivity(req.adminUser, 'license-revoked', req.params.id, null, clientIp(req));
  res.json({ success: true });
}));

router.post('/weighbridge/licenses/:id/reinstate', wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return fail(res, 404, 'License not found.');
  await query('update weighbridge.licenses set revoked_at = null where id = $1', [req.params.id]);
  await L.logActivity(req.adminUser, 'license-reinstated', req.params.id, null, clientIp(req));
  res.json({ success: true });
}));

router.post('/weighbridge/licenses/:id/machines/:aid/deactivate', wrap(async (req, res) => {
  if (!UUID.test(req.params.id) || !UUID.test(req.params.aid)) return fail(res, 404, 'Computer not found.');
  const row = await queryOne(
    `update weighbridge.activations set deactivated_at = now()
      where id = $1 and license_id = $2 and deactivated_at is null returning machine_name`,
    [req.params.aid, req.params.id],
  );
  if (row) await L.logActivity(req.adminUser, 'machine-deactivated', req.params.id, row.machine_name || 'unknown computer', clientIp(req));
  res.json({ success: true });
}));

// --------------------------------------------------- one application (by code)

router.get('/:code', wrap(async (req, res) => {
  const app = await queryOne('select * from portal.apps where code = $1', [req.params.code]);
  if (!app) return fail(res, 404, 'Project not found.');
  res.json({ success: true, data: withPanels(app) });
}));

router.put('/:code', wrap(async (req, res) => {
  const app = await queryOne('select * from portal.apps where code = $1', [req.params.code]);
  if (!app) return fail(res, 404, 'Project not found.');
  const b = req.body || {};
  const name = text(b.name, 60);
  if (!name) return fail(res, 400, 'Project name is required.');

  let icon = null;
  if (b.icon) {
    const checked = L.checkIcon(b.icon);
    if (checked.error) return fail(res, 400, checked.error);
    icon = checked.icon;
  }
  // The code (and with it the schema) is fixed once a project exists; the rest can change.
  await query(
    `update portal.apps set name = $2, description = $3, color = $4, status = $5,
            icon_data = case when $7::boolean then null when $6::text is not null then $6::text else icon_data end
      where code = $1`,
    [app.code, name, text(b.description, 300), L.APP_COLORS.includes(b.color) ? b.color : 'blue',
      b.status === 'live' ? 'live' : 'planned', icon, b.removeIcon === true],
  );
  const updated = await queryOne('select * from portal.apps where code = $1', [app.code]);
  res.json({ success: true, data: withPanels(updated) });
}));

router.post('/:code/archive', wrap(async (req, res) => {
  // A connected application has live installations checking in; hiding it would only confuse.
  if (L.isConnected(req.params.code)) return fail(res, 400, 'A project with live installations can\'t be archived.');
  await query('update portal.apps set archived_at = now() where code = $1', [req.params.code]);
  res.json({ success: true });
}));

module.exports = router;

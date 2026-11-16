// Applies server/db/licensing-mobile.sql to the database in DATABASE_URL (inside one transaction).
//   node server/scripts/apply-licensing-mobile.js            apply
//   node server/scripts/apply-licensing-mobile.js --dry-run  print the SQL and the target host, run nothing
// Never prints the connection string, only the host and database name.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'licensing-mobile.sql'), 'utf8');
const dry = process.argv.includes('--dry-run');
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set.'); process.exit(1); }

let target = 'unknown';
try { const u = new URL(url); target = `${u.hostname}${u.pathname}`; } catch { /* leave as unknown */ }

(async () => {
  console.log(`Target: ${target}`);
  if (dry) { console.log('--dry-run: nothing will be run. The script would execute:\n'); console.log(sql); return; }
  const client = new Client({
    connectionString: url,
    ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    const cols = await client.query(
      `select column_name from information_schema.columns where table_schema = 'weighbridge' and table_name = 'licenses' and column_name = 'features'`);
    const tbl = await client.query(
      `select to_regclass('weighbridge.mobile_accounts') as t`);
    console.log(`Applied. licenses.features: ${cols.rows.length ? 'present' : 'MISSING'}; mobile_accounts: ${tbl.rows[0].t ? 'present' : 'MISSING'}`);
  } catch (err) {
    await client.query('rollback').catch(() => {});
    console.error('Failed, rolled back:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();

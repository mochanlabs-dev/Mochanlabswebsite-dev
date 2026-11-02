// Postgres (Neon) connection for the licensing module. One small pool per server
// instance; every query names its schema (portal.apps, weighbridge.licenses ...),
// so nothing depends on search_path, which poolers tend to strip.
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      // Neon requires TLS. DATABASE_SSL=disable is for a throwaway local database only.
      ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
    });
    pool.on('error', (err) => console.error('[licenseDb] idle client error:', err.message));
  }
  return pool;
}

async function query(text, params = []) {
  const result = await getPool().query(text, params);
  return result.rows;
}

async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

/** Runs fn(client) inside a transaction; rolls back if it throws. */
async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, queryOne, withTransaction };

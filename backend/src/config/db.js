import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});

let schemaEnsured = false;
async function ensureSchema() {
  if (schemaEnsured) return;
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS base_currency TEXT NOT NULL DEFAULT 'USD';`);
    schemaEnsured = true;
  } catch {
    // If users table is not created yet, migrate script will handle it
  }
}

export async function query(text, params) {
  if (!schemaEnsured) {
    await ensureSchema();
  }
  const start = Date.now();
  const result = await pool.query(text, params);
  if (env.nodeEnv === 'development') {
    console.log('query', { text, duration: Date.now() - start, rows: result.rowCount });
  }
  return result;
}

export async function withTransaction(callback) {
  if (!schemaEnsured) {
    await ensureSchema();
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

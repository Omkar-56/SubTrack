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
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS base_currency TEXT NOT NULL DEFAULT 'USD';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_days_before INT NOT NULL DEFAULT 3;
      
      DO $$ BEGIN
        CREATE TYPE billing_cycle AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_days_before INT NOT NULL DEFAULT 3;
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS payments (\n        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
        billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        due_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        sent_at TIMESTAMPTZ,
        channel TEXT NOT NULL DEFAULT 'in_app',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    schemaEnsured = true;
  } catch (err) {
    if (env.nodeEnv === 'development') {
      console.log('ensureSchema note:', err.message);
    }
  }
}

export async function query(text, params) {
  if (!schemaEnsured) {
    await ensureSchema();
  }
  return pool.query(text, params);
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

import pg from 'pg';
import { env } from './env.js';

const isProduction = env.nodeEnv === 'production';
const isSupabase = env.databaseUrl.includes('supabase.co');

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: isProduction || isSupabase ? { rejectUnauthorized: false } : false,
});

let schemaPromise = null;

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      try {
        await pool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle') THEN
              CREATE TYPE billing_cycle AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
              CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');
            END IF;
          END
          $$;

          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            google_id TEXT UNIQUE,
            avatar_url TEXT,
            base_currency TEXT NOT NULL DEFAULT 'USD',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );

          ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
          CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

          CREATE TABLE IF NOT EXISTS subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'other',
            amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
            currency TEXT NOT NULL DEFAULT 'USD',
            billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
            next_renewal_date DATE NOT NULL,
            status subscription_status NOT NULL DEFAULT 'active',
            notes TEXT,
            reminder_days_before INT NOT NULL DEFAULT 3,
            last_reminder_sent_at TIMESTAMPTZ,
            is_free_trial BOOLEAN NOT NULL DEFAULT FALSE,
            trial_end_date DATE,
            cancellation_deadline DATE,
            post_trial_amount NUMERIC(10, 2),
            post_trial_currency TEXT DEFAULT 'USD',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );

          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_days_before INT NOT NULL DEFAULT 3;
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_free_trial BOOLEAN NOT NULL DEFAULT FALSE;
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end_date DATE;
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_deadline DATE;
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS post_trial_amount NUMERIC(10, 2);
          ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS post_trial_currency TEXT DEFAULT 'USD';

          CREATE INDEX IF NOT EXISTS idx_subscriptions_trial ON subscriptions(is_free_trial, trial_end_date);

          -- Category harmonization migrations
          UPDATE subscriptions SET category = 'entertainment' WHERE LOWER(category) IN ('streaming');
          UPDATE subscriptions SET category = 'software / AI' WHERE LOWER(category) IN ('software', 'cloud', 'infrastructure', 'utilities');
          UPDATE subscriptions SET category = 'news and media' WHERE LOWER(category) IN ('news');
          UPDATE subscriptions SET category = 'health & fitness' WHERE LOWER(category) IN ('fitness', 'health');

          CREATE TABLE IF NOT EXISTS price_history (\n            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
            old_amount NUMERIC(10, 2) NOT NULL,
            new_amount NUMERIC(10, 2) NOT NULL,
            changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      } catch (err) {
        console.error('[ensureSchema error]', err.message);
        schemaPromise = null;
        throw err;
      }
    })();
  }
  return schemaPromise;
}

export async function query(text, params) {
  await ensureSchema();
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  await ensureSchema();
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

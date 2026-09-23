-- SubTrack schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  reminder_days_before INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure base_currency exists for existing tables
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
  -- Free-Trial Expiry Sentinel & Cancellation Deadline columns
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

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal ON subscriptions(next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial ON subscriptions(is_free_trial, trial_end_date);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  old_amount NUMERIC(10, 2) NOT NULL,
  new_amount NUMERIC(10, 2) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_subscription_id ON price_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON price_history(changed_at);

-- Payment confirmations / history
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

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_date ON payments(paid_date);

-- Reminders log / queue
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

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_subscription_id ON reminders(subscription_id);

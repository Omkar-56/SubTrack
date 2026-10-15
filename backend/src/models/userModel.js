import { query } from '../config/db.js';

const USER_COLUMNS = `
  id, name, email,
  google_id AS "googleId",
  avatar_url AS "avatarUrl",
  COALESCE(base_currency, 'USD') AS "baseCurrency",
  COALESCE(plan, 'starter') AS "plan",
  COALESCE(plan_status, 'active') AS "planStatus",
  billing_cycle AS "billingCycle",
  current_period_start AS "currentPeriodStart",
  current_period_end AS "currentPeriodEnd",
  trial_ends_at AS "trialEndsAt",
  COALESCE(cancel_at_period_end, FALSE) AS "cancelAtPeriodEnd",
  COALESCE(ai_scans_used, 0) AS "aiScansUsed",
  COALESCE(ai_scans_reset_at, now()) AS "aiScansResetAt",
  created_at AS "createdAt"
`;

export const userModel = {
  async create({
    name,
    email,
    passwordHash = null,
    googleId = null,
    avatarUrl = null,
    baseCurrency = 'USD',
    plan = 'starter',
    planStatus = 'active',
    billingCycle = null,
  }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, google_id, avatar_url, base_currency, plan, plan_status, billing_cycle)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${USER_COLUMNS}`,
      [name, email, passwordHash, googleId, avatarUrl, baseCurrency, plan, planStatus, billingCycle]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query(
      `SELECT id, name, email, password_hash,
              google_id AS "googleId",
              avatar_url AS "avatarUrl",
              COALESCE(base_currency, 'USD') AS "baseCurrency",
              COALESCE(plan, 'starter') AS "plan",
              COALESCE(plan_status, 'active') AS "planStatus",
              billing_cycle AS "billingCycle",
              current_period_start AS "currentPeriodStart",
              current_period_end AS "currentPeriodEnd",
              trial_ends_at AS "trialEndsAt",
              COALESCE(cancel_at_period_end, FALSE) AS "cancelAtPeriodEnd",
              COALESCE(ai_scans_used, 0) AS "aiScansUsed",
              COALESCE(ai_scans_reset_at, now()) AS "aiScansResetAt",
              created_at AS "createdAt"
       FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  },

  async findByGoogleId(googleId) {
    const { rows } = await query(
      `SELECT id, name, email, password_hash,
              google_id AS "googleId",
              avatar_url AS "avatarUrl",
              COALESCE(base_currency, 'USD') AS "baseCurrency",
              COALESCE(plan, 'starter') AS "plan",
              COALESCE(plan_status, 'active') AS "planStatus",
              billing_cycle AS "billingCycle",
              current_period_start AS "currentPeriodStart",
              current_period_end AS "currentPeriodEnd",
              trial_ends_at AS "trialEndsAt",
              COALESCE(cancel_at_period_end, FALSE) AS "cancelAtPeriodEnd",
              COALESCE(ai_scans_used, 0) AS "aiScansUsed",
              COALESCE(ai_scans_reset_at, now()) AS "aiScansResetAt",
              created_at AS "createdAt"
       FROM users WHERE google_id = $1`,
      [googleId]
    );
    return rows[0] || null;
  },

  async linkGoogleAccount(id, { googleId, avatarUrl }) {
    const { rows } = await query(
      `UPDATE users 
       SET google_id = $2, 
           avatar_url = COALESCE(avatar_url, $3)
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [id, googleId, avatarUrl]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async updateBaseCurrency(id, baseCurrency) {
    const { rows } = await query(
      `UPDATE users SET base_currency = $2 WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [id, baseCurrency]
    );
    return rows[0] || null;
  },

  async updatePlan(id, {
    plan = 'starter',
    planStatus = 'active',
    billingCycle = null,
    currentPeriodStart = new Date(),
    currentPeriodEnd = null,
    trialEndsAt = null,
    cancelAtPeriodEnd = false,
    customerId = null,
    subscriptionExternalId = null,
  }) {
    const { rows } = await query(
      `UPDATE users
       SET plan = $2,
           plan_status = $3,
           billing_cycle = $4,
           current_period_start = $5,
           current_period_end = $6,
           trial_ends_at = $7,
           cancel_at_period_end = $8,
           customer_id = COALESCE($9, customer_id),
           subscription_external_id = COALESCE($10, subscription_external_id)
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [
        id,
        plan,
        planStatus,
        billingCycle,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
        cancelAtPeriodEnd,
        customerId,
        subscriptionExternalId,
      ]
    );
    return rows[0] || null;
  },

  /**
   * Check and auto-refresh 30-day AI scan quota cycle for a user.
   */
  async getAiScanQuota(id) {
    // Reset if last reset was more than 30 days ago
    await query(
      `UPDATE users
       SET ai_scans_used = 0,
           ai_scans_reset_at = now()
       WHERE id = $1 AND ai_scans_reset_at < now() - interval '30 days'`,
      [id]
    );

    const { rows } = await query(
      `SELECT COALESCE(plan, 'starter') AS "plan",
              COALESCE(plan_status, 'active') AS "planStatus",
              COALESCE(ai_scans_used, 0) AS "aiScansUsed",
              ai_scans_reset_at AS "aiScansResetAt"
       FROM users
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async incrementAiScan(id) {
    const { rows } = await query(
      `UPDATE users
       SET ai_scans_used = COALESCE(ai_scans_used, 0) + 1
       WHERE id = $1
       RETURNING COALESCE(ai_scans_used, 0) AS "aiScansUsed"`,
      [id]
    );
    return rows[0]?.aiScansUsed || 1;
  },
};

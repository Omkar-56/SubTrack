import { query } from '../config/db.js';

const COLUMNS = `
  id, user_id AS "userId", name, category, amount, currency,
  billing_cycle AS "billingCycle", next_renewal_date AS "nextRenewalDate",
  status, notes,
  COALESCE(reminder_days_before, 3) AS "reminderDaysBefore",
  last_reminder_sent_at AS "lastReminderSentAt",
  COALESCE(is_free_trial, FALSE) AS "isFreeTrial",
  trial_end_date AS "trialEndDate",
  cancellation_deadline AS "cancellationDeadline",
  post_trial_amount AS "postTrialAmount",
  post_trial_currency AS "postTrialCurrency",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

export const subscriptionModel = {
  async create(userId, data) {
    const isFreeTrial = Boolean(data.isFreeTrial);
    const trialEndDate = isFreeTrial && data.trialEndDate ? String(data.trialEndDate).slice(0, 10) : null;
    const cancellationDeadline = isFreeTrial && data.cancellationDeadline ? String(data.cancellationDeadline).slice(0, 10) : null;
    const postTrialAmount = isFreeTrial && data.postTrialAmount !== undefined && data.postTrialAmount !== null ? Number(data.postTrialAmount) : null;
    const postTrialCurrency = isFreeTrial && data.postTrialCurrency ? data.postTrialCurrency : data.currency;

    const { rows } = await query(
      `INSERT INTO subscriptions
        (user_id, name, category, amount, currency, billing_cycle, next_renewal_date, status, notes, reminder_days_before,
         is_free_trial, trial_end_date, cancellation_deadline, post_trial_amount, post_trial_currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING ${COLUMNS}`,
      [
        userId,
        data.name,
        data.category,
        data.amount,
        data.currency,
        data.billingCycle,
        data.nextRenewalDate,
        data.status,
        data.notes ?? null,
        data.reminderDaysBefore ?? 3,
        isFreeTrial,
        trialEndDate,
        cancellationDeadline,
        postTrialAmount,
        postTrialCurrency,
      ]
    );
    return rows[0];
  },

  async findAllForUser(userId) {
    const { rows } = await query(
      `SELECT ${COLUMNS} FROM subscriptions WHERE user_id = $1 ORDER BY next_renewal_date ASC`,
      [userId]
    );
    return rows;
  },

  async findById(userId, id) {
    const { rows } = await query(
      `SELECT ${COLUMNS} FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async update(userId, id, data) {
    const isFreeTrial = Boolean(data.isFreeTrial);
    const trialEndDate = isFreeTrial && data.trialEndDate ? String(data.trialEndDate).slice(0, 10) : null;
    const cancellationDeadline = isFreeTrial && data.cancellationDeadline ? String(data.cancellationDeadline).slice(0, 10) : null;
    const postTrialAmount = isFreeTrial && data.postTrialAmount !== undefined && data.postTrialAmount !== null ? Number(data.postTrialAmount) : null;
    const postTrialCurrency = isFreeTrial && data.postTrialCurrency ? data.postTrialCurrency : data.currency;

    const { rows } = await query(
      `UPDATE subscriptions SET
        name = $3, category = $4, amount = $5, currency = $6,
        billing_cycle = $7, next_renewal_date = $8, status = $9, notes = $10,
        reminder_days_before = COALESCE($11, reminder_days_before),
        is_free_trial = $12, trial_end_date = $13, cancellation_deadline = $14,
        post_trial_amount = $15, post_trial_currency = $16,
        updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING ${COLUMNS}`,
      [
        id,
        userId,
        data.name,
        data.category,
        data.amount,
        data.currency,
        data.billingCycle,
        data.nextRenewalDate,
        data.status,
        data.notes ?? null,
        data.reminderDaysBefore ?? null,
        isFreeTrial,
        trialEndDate,
        cancellationDeadline,
        postTrialAmount,
        postTrialCurrency,
      ]
    );
    return rows[0] || null;
  },

  async convertTrialToActive(userId, id, newRenewalDate) {
    const { rows } = await query(
      `UPDATE subscriptions SET
        amount = COALESCE(post_trial_amount, amount),
        currency = COALESCE(post_trial_currency, currency),
        is_free_trial = FALSE,
        trial_end_date = NULL,
        cancellation_deadline = NULL,
        next_renewal_date = COALESCE($3, next_renewal_date),
        status = 'active',
        updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING ${COLUMNS}`,
      [id, userId, newRenewalDate]
    );
    return rows[0] || null;
  },

  async updateRenewalDate(userId, id, nextRenewalDate) {
    const { rows } = await query(
      `UPDATE subscriptions SET
        next_renewal_date = $3,
        updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING ${COLUMNS}`,
      [id, userId, nextRenewalDate]
    );
    return rows[0] || null;
  },

  async updateReminderSentAt(userId, id, sentAt = new Date()) {
    const { rows } = await query(
      `UPDATE subscriptions SET
        last_reminder_sent_at = $3,
        updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING ${COLUMNS}`,
      [id, userId, sentAt]
    );
    return rows[0] || null;
  },

  async remove(userId, id) {
    const { rowCount } = await query(
      'DELETE FROM subscriptions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },
};

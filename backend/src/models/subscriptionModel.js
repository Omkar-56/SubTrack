import { query } from '../config/db.js';

const COLUMNS = `
  id, user_id AS "userId", name, category, amount, currency,
  billing_cycle AS "billingCycle", next_renewal_date AS "nextRenewalDate",
  status, notes, created_at AS "createdAt", updated_at AS "updatedAt"
`;

export const subscriptionModel = {
  async create(userId, data) {
    const { rows } = await query(
      `INSERT INTO subscriptions
        (user_id, name, category, amount, currency, billing_cycle, next_renewal_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    const { rows } = await query(
      `UPDATE subscriptions SET
        name = $3, category = $4, amount = $5, currency = $6,
        billing_cycle = $7, next_renewal_date = $8, status = $9, notes = $10,
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
      ]
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

  async remove(userId, id) {
    const { rowCount } = await query(
      'DELETE FROM subscriptions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },
};

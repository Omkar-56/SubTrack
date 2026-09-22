import { query } from '../config/db.js';

const PAYMENT_COLUMNS = `
  id, user_id AS "userId", subscription_id AS "subscriptionId",
  amount, currency, paid_date AS "paidDate", billing_cycle AS "billingCycle",
  notes, created_at AS "createdAt"
`;

export const paymentModel = {
  async create({ userId, subscriptionId, amount, currency, paidDate, billingCycle, notes = null }) {
    const { rows } = await query(
      `INSERT INTO payments
        (user_id, subscription_id, amount, currency, paid_date, billing_cycle, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${PAYMENT_COLUMNS}`,
      [userId, subscriptionId, amount, currency, paidDate, billingCycle, notes]
    );
    return rows[0];
  },

  async findBySubscriptionId(userId, subscriptionId) {
    const { rows } = await query(
      `SELECT ${PAYMENT_COLUMNS}
       FROM payments
       WHERE user_id = $1 AND subscription_id = $2
       ORDER BY paid_date DESC, created_at DESC`,
      [userId, subscriptionId]
    );
    return rows;
  },

  async findRecentForUser(userId, limit = 50) {
    const { rows } = await query(
      `SELECT p.id, p.user_id AS "userId", p.subscription_id AS "subscriptionId",
              p.amount, p.currency, p.paid_date AS "paidDate", p.billing_cycle AS "billingCycle",
              p.notes, p.created_at AS "createdAt", s.name AS "subscriptionName", s.category
       FROM payments p
       JOIN subscriptions s ON s.id = p.subscription_id
       WHERE p.user_id = $1
       ORDER BY p.paid_date DESC, p.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },
};

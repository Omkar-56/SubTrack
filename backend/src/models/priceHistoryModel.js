import { query } from '../config/db.js';

export const priceHistoryModel = {
  async record(subscriptionId, oldAmount, newAmount) {
    const { rows } = await query(
      `INSERT INTO price_history (subscription_id, old_amount, new_amount)
       VALUES ($1, $2, $3)
       RETURNING id, subscription_id AS "subscriptionId", old_amount AS "oldAmount",
                 new_amount AS "newAmount", changed_at AS "changedAt"`,
      [subscriptionId, oldAmount, newAmount]
    );
    return rows[0];
  },

  async findForSubscription(userId, subscriptionId) {
    const { rows } = await query(
      `SELECT ph.id, ph.old_amount AS "oldAmount", ph.new_amount AS "newAmount",
              ph.changed_at AS "changedAt"
       FROM price_history ph
       JOIN subscriptions s ON s.id = ph.subscription_id
       WHERE ph.subscription_id = $1 AND s.user_id = $2
       ORDER BY ph.changed_at DESC`,
      [subscriptionId, userId]
    );
    return rows;
  },

  async findRecentIncreasesForUser(userId, withinDays = 30) {    const { rows } = await query(
      `SELECT ph.id, s.id AS "subscriptionId", s.name, s.currency,
              ph.old_amount AS "oldAmount", ph.new_amount AS "newAmount",
              ph.changed_at AS "changedAt"
       FROM price_history ph
       JOIN subscriptions s ON s.id = ph.subscription_id
       WHERE s.user_id = $1
         AND ph.new_amount > ph.old_amount
         AND ph.changed_at >= now() - ($2 || ' days')::interval
       ORDER BY ph.changed_at DESC`,
      [userId, withinDays]
    );
    return rows;
  },

  async findAllForUser(userId) {
    const { rows } = await query(
      `SELECT ph.subscription_id AS "subscriptionId", ph.old_amount AS "oldAmount",
              ph.new_amount AS "newAmount", ph.changed_at AS "changedAt"
       FROM price_history ph
       JOIN subscriptions s ON s.id = ph.subscription_id
       WHERE s.user_id = $1
       ORDER BY ph.changed_at ASC`,
      [userId]
    );
    return rows;
  },
};

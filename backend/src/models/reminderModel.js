import { query } from '../config/db.js';

const REMINDER_COLUMNS = `
  r.id, r.user_id AS "userId", r.subscription_id AS "subscriptionId",
  r.due_date AS "dueDate", r.status, r.sent_at AS "sentAt",
  r.channel, r.message, r.created_at AS "createdAt"
`;

export const reminderModel = {
  async create({ userId, subscriptionId, dueDate, status = 'pending', sentAt = new Date(), channel = 'in_app', message }) {
    const { rows } = await query(
      `INSERT INTO reminders
        (user_id, subscription_id, due_date, status, sent_at, channel, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id AS "userId", subscription_id AS "subscriptionId",
                 due_date AS "dueDate", status, sent_at AS "sentAt", channel, message, created_at AS "createdAt"`,
      [userId, subscriptionId, dueDate, status, sentAt, channel, message]
    );
    return rows[0];
  },

  async findPendingForUser(userId) {
    const { rows } = await query(
      `SELECT ${REMINDER_COLUMNS}, s.name AS "subscriptionName", s.amount, s.currency, s.category, s.billing_cycle AS "billingCycle"
       FROM reminders r
       JOIN subscriptions s ON s.id = r.subscription_id
       WHERE r.user_id = $1 AND r.status = 'pending' AND s.status = 'active'
       ORDER BY r.due_date ASC`,
      [userId]
    );
    return rows;
  },

  async findRecentForSubscription(userId, subscriptionId, dueDate) {
    const { rows } = await query(
      `SELECT id, status, due_date AS "dueDate", sent_at AS "sentAt"
       FROM reminders
       WHERE user_id = $1 AND subscription_id = $2 AND due_date = $3
       LIMIT 1`,
      [userId, subscriptionId, dueDate]
    );
    return rows[0] || null;
  },

  async markPaidForSubscription(userId, subscriptionId) {
    const { rows } = await query(
      `UPDATE reminders
       SET status = 'paid'
       WHERE user_id = $1 AND subscription_id = $2 AND status = 'pending'
       RETURNING id`,
      [userId, subscriptionId]
    );
    return rows;
  },

  async dismiss(userId, id) {
    const { rows } = await query(
      `UPDATE reminders
       SET status = 'dismissed'
       WHERE user_id = $1 AND id = $2
       RETURNING id`,
      [userId, id]
    );
    return rows[0] || null;
  },
};

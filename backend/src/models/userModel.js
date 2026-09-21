import { query } from '../config/db.js';

const USER_COLUMNS = 'id, name, email, COALESCE(base_currency, \'USD\') AS "baseCurrency", created_at AS "createdAt"';

export const userModel = {
  async create({ name, email, passwordHash, baseCurrency = 'USD' }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, base_currency)
       VALUES ($1, $2, $3, $4)
       RETURNING ${USER_COLUMNS}`,
      [name, email, passwordHash, baseCurrency]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, COALESCE(base_currency, 'USD') AS "baseCurrency", created_at AS "createdAt" FROM users WHERE email = $1`,
      [email]
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
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export const authService = {
  async register({ name, email, password, baseCurrency = 'USD' }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ name, email, passwordHash, baseCurrency });
    return { user, token: signToken(user) };
  },

  async login({ email, password }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      baseCurrency: user.baseCurrency || 'USD',
    };
    return { user: safeUser, token: signToken(safeUser) };
  },

  async me(userId) {
    const user = await userModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateCurrency(userId, currency) {
    const validCurrency = (currency || 'USD').toUpperCase();
    const updated = await userModel.updateBaseCurrency(userId, validCurrency);
    return updated;
  },
};

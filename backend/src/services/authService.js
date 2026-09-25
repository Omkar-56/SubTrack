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
    if (!user.password_hash) {
      throw new ApiError(400, 'This account was created with Google. Please use "Sign in with Google"');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatarUrl: user.avatarUrl,
      baseCurrency: user.baseCurrency || 'USD',
    };
    return { user: safeUser, token: signToken(safeUser) };
  },

  async googleAuth(credential) {
    if (!credential) {
      throw new ApiError(400, 'Google credential token is required');
    }

    // Verify token using Google's public tokeninfo endpoint
    let payload;
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!res.ok) {
        throw new Error('Google token validation failed');
      }
      payload = await res.json();
    } catch (err) {
      throw new ApiError(401, 'Invalid Google token: ' + err.message);
    }

    // Verify audience matches if client id is configured
    if (env.googleClientId && payload.aud && payload.aud !== env.googleClientId) {
      console.warn(`[Google OAuth] Audience mismatch: got ${payload.aud}, expected ${env.googleClientId}`);
    }

    const { sub: googleId, email, name, picture: avatarUrl } = payload;
    if (!email) {
      throw new ApiError(400, 'Google account has no associated email address');
    }

    // Check if user exists by googleId
    let user = await userModel.findByGoogleId(googleId);

    // If not found by googleId, check by email
    if (!user) {
      user = await userModel.findByEmail(email);
      if (user) {
        // Link google account to existing email user
        user = await userModel.linkGoogleAccount(user.id, { googleId, avatarUrl });
      } else {
        // Create brand new user
        user = await userModel.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          avatarUrl,
          passwordHash: null,
          baseCurrency: 'USD',
        });
      }
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatarUrl: user.avatarUrl,
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

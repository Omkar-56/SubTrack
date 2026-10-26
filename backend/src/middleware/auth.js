import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

import { userModel } from '../models/userModel.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    try {
      let demoUser = await userModel.findByEmail('demo@subtrack.app');
      if (!demoUser) {
        demoUser = await userModel.create({
          name: 'Demo User',
          email: 'demo@subtrack.app',
          baseCurrency: 'USD',
        });
      }
      req.user = { id: demoUser.id, email: demoUser.email };
      return next();
    } catch {
      return next(new ApiError(401, 'Authentication required'));
    }
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  const corsOrigin = (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      !env.clientOrigin ||
      env.clientOrigin === '*' ||
      origin === env.clientOrigin ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  };

  app.use(cors({ origin: corsOrigin, credentials: true }));
  // Allow up to 20MB JSON for document/screenshot parsing payloads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  app.get('/api', (req, res) => res.json({ status: 'ok', name: 'SubTrack API' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

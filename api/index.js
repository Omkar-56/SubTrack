import { createApp } from '../backend/src/app.js';
import { ensureSchema } from '../backend/src/config/db.js';

let app;

export default async function handler(req, res) {
  if (!app) {
    try {
      await ensureSchema();
    } catch (err) {
      console.warn('Vercel serverless ensureSchema check:', err.message);
    }
    app = createApp();
  }
  return app(req, res);
}

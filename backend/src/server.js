import { createApp } from './app.js';
import { env } from './config/env.js';
import { ensureSchema } from './config/db.js';

const app = createApp();

async function startServer() {
  try {
    await ensureSchema();
  } catch (err) {
    console.warn('Initial ensureSchema check note:', err.message);
  }

  app.listen(env.port, () => {
    console.log(`SubTrack API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

startServer();

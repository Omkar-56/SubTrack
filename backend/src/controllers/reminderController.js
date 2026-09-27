import { reminderService } from '../services/reminderService.js';
import { env } from '../config/env.js';

export const reminderController = {
  /**
   * Vercel Cron handler (invoked automatically via Vercel Cron Job schedule)
   */
  async handleCron(req, res, next) {
    try {
      // Optional security: if CRON_SECRET is configured, require Bearer token
      if (env.cronSecret) {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s+/i, '');
        if (token !== env.cronSecret) {
          return res.status(401).json({ error: 'Unauthorized cron request' });
        }
      }

      const outcome = await reminderService.sendDueReminders();
      return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        ...outcome,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Authenticated user manual trigger to check and email their due reminders
   */
  async sendDueForUser(req, res, next) {
    try {
      const outcome = await reminderService.sendDueReminders({ userId: req.user.id });
      return res.json({
        status: 'ok',
        ...outcome,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Authenticated user test email
   */
  async sendTestEmail(req, res, next) {
    try {
      const outcome = await reminderService.sendTestEmail(req.user.id);
      return res.json({
        status: 'ok',
        ...outcome,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List pending/recent reminders for user
   */
  async getReminders(req, res, next) {
    try {
      const reminders = await reminderService.getPendingReminders(req.user.id);
      return res.json({ reminders });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Dismiss a reminder
   */
  async dismiss(req, res, next) {
    try {
      const dismissed = await reminderService.dismissReminder(req.user.id, req.params.id);
      return res.json({ dismissed });
    } catch (err) {
      next(err);
    }
  },
};

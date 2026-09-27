import { Router } from 'express';
import { reminderController } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Vercel Cron routes (GET or POST called by Vercel scheduler)
router.get('/cron', reminderController.handleCron);
router.post('/cron', reminderController.handleCron);

// Authenticated user reminder routes
router.use(requireAuth);
router.get('/', reminderController.getReminders);
router.post('/send-due', reminderController.sendDueForUser);
router.post('/test-email', reminderController.sendTestEmail);
router.patch('/:id/dismiss', reminderController.dismiss);

export default router;

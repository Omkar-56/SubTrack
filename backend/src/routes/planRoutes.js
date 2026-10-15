import { Router } from 'express';
import { planController } from '../controllers/planController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public route to view plan catalog
router.get('/catalog', planController.getCatalog);

// Authenticated routes for user plan management
router.get('/me', requireAuth, planController.getMyPlan);
router.post('/subscribe', requireAuth, planController.subscribe);
router.post('/cancel', requireAuth, planController.cancel);
router.get('/invoices', requireAuth, planController.getInvoices);

export default router;

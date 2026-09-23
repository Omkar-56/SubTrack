import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { subscriptionSchema } from '../validators/subscriptionValidators.js';

const router = Router();

router.use(requireAuth);

// Collection routes
router.get('/', subscriptionController.list);
router.post('/', validate(subscriptionSchema), subscriptionController.create);
router.get('/reminders', subscriptionController.reminders);
router.post('/reminders/:id/dismiss', subscriptionController.dismissReminder);
router.get('/payments/recent', subscriptionController.allPayments);

// Individual item routes
router.get('/:id', subscriptionController.get);
router.get('/:id/price-history', subscriptionController.priceHistory);
router.get('/:id/payments', subscriptionController.payments);
router.post('/:id/advance', subscriptionController.advanceCycle);
router.post('/:id/confirm-payment', subscriptionController.confirmPayment);
router.post('/:id/convert-trial', subscriptionController.convertTrial);
router.post('/:id/remind', subscriptionController.triggerReminder);
router.put('/:id', validate(subscriptionSchema), subscriptionController.update);
router.delete('/:id', subscriptionController.remove);

export default router;

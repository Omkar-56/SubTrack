import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { subscriptionSchema } from '../validators/subscriptionValidators.js';

const router = Router();

router.use(requireAuth);
router.get('/', subscriptionController.list);
router.post('/', validate(subscriptionSchema), subscriptionController.create);
router.get('/:id', subscriptionController.get);
router.get('/:id/price-history', subscriptionController.priceHistory);
router.post('/:id/advance', subscriptionController.advanceCycle);
router.put('/:id', validate(subscriptionSchema), subscriptionController.update);
router.delete('/:id', subscriptionController.remove);

export default router;

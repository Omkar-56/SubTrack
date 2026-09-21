import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
router.put('/currency', requireAuth, authController.updateCurrency);

export default router;

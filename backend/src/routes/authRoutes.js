import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

/**
 * Auth routes — no business logic here,
 * routes only map HTTP verbs + paths to controller functions.
 */
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);   // protected

export default router;

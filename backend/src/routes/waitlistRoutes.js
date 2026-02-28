import { Router } from 'express';
import {
    joinWaitlist,
    leaveWaitlist,
    getMyWaitlist,
} from '../controllers/waitlistController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../config/constants.js';

const router = Router();

/**
 * Waitlist routes — all require authentication and the "user" role.
 */
router.get('/my', authenticate, authorize(ROLES.USER), getMyWaitlist);
router.post('/:eventId', authenticate, authorize(ROLES.USER), joinWaitlist);
router.delete('/:eventId', authenticate, authorize(ROLES.USER), leaveWaitlist);

export default router;

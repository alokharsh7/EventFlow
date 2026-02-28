import { Router } from 'express';
import {
    bookEvent,
    getMyBookings,
    cancelBooking,
    getEventBookings,
} from '../controllers/bookingController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../config/constants.js';

const router = Router();

/**
 * Booking routes.
 *
 * All routes are protected (require authentication).
 * Role-based access restricts who can hit each endpoint.
 */

// ── User endpoints ──
router.post('/', authenticate, authorize(ROLES.USER), bookEvent);
router.get('/my', authenticate, authorize(ROLES.USER), getMyBookings);
router.delete('/:id/cancel', authenticate, authorize(ROLES.USER), cancelBooking);

// ── Organizer endpoint ──
router.get(
    '/event/:eventId',
    authenticate,
    authorize(ROLES.ORGANIZER),
    getEventBookings
);

export default router;

import { Router } from 'express';
import {
    getOverview,
    getRevenue,
    getBookingsByEvent,
    getPeakHours,
    getEventDetail,
} from '../controllers/analyticsController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../config/constants.js';

const router = Router();

/**
 * Analytics routes — organizer only.
 * All routes require authentication + organizer role.
 */
const guard = [authenticate, authorize(ROLES.ORGANIZER)];

router.get('/overview', ...guard, getOverview);
router.get('/revenue', ...guard, getRevenue);
router.get('/bookings-by-event', ...guard, getBookingsByEvent);
router.get('/peak-hours', ...guard, getPeakHours);
router.get('/event/:eventId/detail', ...guard, getEventDetail);

export default router;

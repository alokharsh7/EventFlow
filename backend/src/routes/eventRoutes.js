import { Router } from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getMyEvents,
} from '../controllers/eventController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../config/constants.js';

const router = Router();

/**
 * Event routes.
 *
 * Public routes come first, then protected routes.
 * The same router is mounted twice in server.js:
 *   app.use('/api/events',     eventRouter)  → CRUD
 *   app.use('/api/organizer',  eventRouter)  → organizer-specific
 */

// ── Public ──
router.get('/', getAllEvents);
router.get('/events', getAllEvents);        // matches /api/organizer/events path
router.get('/:id', getEventById);

// ── Organizer only ──
router.post('/', authenticate, authorize(ROLES.ORGANIZER), createEvent);
router.put('/:id', authenticate, authorize(ROLES.ORGANIZER), updateEvent);
router.delete('/:id', authenticate, authorize(ROLES.ORGANIZER), deleteEvent);

export default router;

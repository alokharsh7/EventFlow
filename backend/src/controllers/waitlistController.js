import * as WaitlistModel from '../models/waitlistModel.js';
import * as EventModel from '../models/eventModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ──────────────────────────────────────────────
// POST /api/waitlist/:eventId  (user only)
// ──────────────────────────────────────────────
export const joinWaitlist = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);
    if (!event) throw new ApiError(404, 'Event not found');

    // Only allow joining waitlist if the event is sold out
    if (event.available_seats > 0) {
        throw new ApiError(400, 'Seats are still available — book directly instead');
    }

    // Check if already on the waitlist
    const existingPos = await WaitlistModel.getWaitlistPosition(req.user.id, eventId);
    if (existingPos !== null) {
        throw new ApiError(409, `You are already on the waitlist at position ${existingPos}`);
    }

    const entry = await WaitlistModel.addToWaitlist(req.user.id, eventId);

    res.status(201).json(
        new ApiResponse(201, { position: entry.position }, 'Added to waitlist')
    );
});

// ──────────────────────────────────────────────
// DELETE /api/waitlist/:eventId  (user only)
// ──────────────────────────────────────────────
export const leaveWaitlist = asyncHandler(async (req, res) => {
    const removed = await WaitlistModel.removeFromWaitlist(req.user.id, req.params.eventId);

    if (!removed) {
        throw new ApiError(404, 'You are not on the waitlist for this event');
    }

    res.status(200).json(
        new ApiResponse(200, null, 'Removed from waitlist')
    );
});

// ──────────────────────────────────────────────
// GET /api/waitlist/my  (user only)
// ──────────────────────────────────────────────
export const getMyWaitlist = asyncHandler(async (req, res) => {
    const entries = await WaitlistModel.getByUser(req.user.id);

    res.status(200).json(
        new ApiResponse(200, { waitlist: entries }, 'Waitlist entries fetched')
    );
});

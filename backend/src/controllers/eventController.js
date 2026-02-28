import * as EventModel from '../models/eventModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ──────────────────────────────────────────────
// POST /api/events  (organizer only)
// ──────────────────────────────────────────────
export const createEvent = asyncHandler(async (req, res) => {
    const {
        title, description, category, location,
        event_date, total_seats, base_price,
    } = req.body;

    if (!title || !event_date || !total_seats) {
        throw new ApiError(400, 'Title, event_date, and total_seats are required');
    }

    const event = await EventModel.create({
        organizer_id: req.user.id,
        title,
        description: description || null,
        category: category || null,
        location: location || null,
        event_date,
        total_seats,
        available_seats: total_seats,             // all seats available initially
        base_price: base_price || 0,
        current_price: base_price || 0,           // pricing engine adjusts later
        status: 'published',                      // default status
    });

    res.status(201).json(
        new ApiResponse(201, { event }, 'Event created successfully')
    );
});

// ──────────────────────────────────────────────
// GET /api/events  (public)
// ──────────────────────────────────────────────
export const getAllEvents = asyncHandler(async (req, res) => {
    // Read optional query params for filtering
    const filters = {
        category: req.query.category,
        location: req.query.location,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        status: req.query.status,
    };

    const events = await EventModel.findAll(filters);

    res.status(200).json(
        new ApiResponse(200, { events }, 'Events fetched successfully')
    );
});

// ──────────────────────────────────────────────
// GET /api/events/:id  (public)
// ──────────────────────────────────────────────
export const getEventById = asyncHandler(async (req, res) => {
    const event = await EventModel.findById(req.params.id);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    res.status(200).json(
        new ApiResponse(200, { event }, 'Event fetched successfully')
    );
});

// ──────────────────────────────────────────────
// PUT /api/events/:id  (organizer only, must own)
// ──────────────────────────────────────────────
export const updateEvent = asyncHandler(async (req, res) => {
    const event = await EventModel.findById(req.params.id);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Ownership check — organiser can only edit their own events
    if (event.organizer_id !== req.user.id) {
        throw new ApiError(403, 'Forbidden — you do not own this event');
    }

    // Only allow updating specific fields
    const allowedFields = [
        'title', 'description', 'category', 'location',
        'event_date', 'total_seats', 'base_price', 'current_price', 'status',
    ];

    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    const updated = await EventModel.update(req.params.id, updates);

    res.status(200).json(
        new ApiResponse(200, { event: updated }, 'Event updated successfully')
    );
});

// ──────────────────────────────────────────────
// DELETE /api/events/:id  (organizer only, soft delete)
// ──────────────────────────────────────────────
export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await EventModel.findById(req.params.id);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    if (event.organizer_id !== req.user.id) {
        throw new ApiError(403, 'Forbidden — you do not own this event');
    }

    // Soft delete: set status to 'cancelled' rather than removing the row
    await EventModel.update(req.params.id, { status: 'cancelled' });

    res.status(200).json(
        new ApiResponse(200, null, 'Event cancelled successfully')
    );
});

// ──────────────────────────────────────────────
// GET /api/organizer/events  (organizer only)
// ──────────────────────────────────────────────
export const getMyEvents = asyncHandler(async (req, res) => {
    const events = await EventModel.findByOrganizer(req.user.id);

    res.status(200).json(
        new ApiResponse(200, { events }, 'Organizer events fetched')
    );
});

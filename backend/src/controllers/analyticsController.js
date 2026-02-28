import { pool } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ──────────────────────────────────────────────────
// GET /api/analytics/overview
// Aggregate stats for the current organizer's events.
// ──────────────────────────────────────────────────
export const getOverview = asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
        `SELECT
       COUNT(DISTINCT e.id)                         AS totalEvents,
       COALESCE(SUM(b.seats_booked), 0)             AS totalBookings,
       COALESCE(SUM(b.amount_paid), 0)              AS totalRevenue,
       ROUND(
         COALESCE(
           (1 - SUM(e.available_seats) / NULLIF(SUM(e.total_seats), 0)) * 100,
           0
         ), 1
       )                                            AS averageOccupancy
     FROM events e
     LEFT JOIN bookings b
       ON b.event_id = e.id AND b.status = 'confirmed'
     WHERE e.organizer_id = ?`,
        [req.user.id]
    );

    res.status(200).json(
        new ApiResponse(200, rows[0], 'Overview fetched')
    );
});

// ──────────────────────────────────────────────────
// GET /api/analytics/revenue?period=7d|30d|90d
// Daily revenue breakdown for the chosen period.
// ──────────────────────────────────────────────────
export const getRevenue = asyncHandler(async (req, res) => {
    const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = periodMap[req.query.period] || 30;

    const [rows] = await pool.execute(
        `SELECT
       DATE(b.created_at) AS date,
       SUM(b.amount_paid) AS revenue
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE e.organizer_id = ?
       AND b.status = 'confirmed'
       AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(b.created_at)
     ORDER BY date ASC`,
        [req.user.id, days]
    );

    res.status(200).json(
        new ApiResponse(200, { revenue: rows }, 'Revenue data fetched')
    );
});

// ──────────────────────────────────────────────────
// GET /api/analytics/bookings-by-event
// Per-event booking breakdown.
// ──────────────────────────────────────────────────
export const getBookingsByEvent = asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
        `SELECT
       e.id                                       AS event_id,
       e.title,
       COALESCE(SUM(b.seats_booked), 0)           AS confirmed_bookings,
       e.total_seats,
       ROUND(
         COALESCE(SUM(b.seats_booked) / NULLIF(e.total_seats, 0) * 100, 0), 1
       )                                          AS occupancy_pct,
       COALESCE(SUM(b.amount_paid), 0)            AS revenue
     FROM events e
     LEFT JOIN bookings b
       ON b.event_id = e.id AND b.status = 'confirmed'
     WHERE e.organizer_id = ?
     GROUP BY e.id
     ORDER BY e.event_date DESC`,
        [req.user.id]
    );

    res.status(200).json(
        new ApiResponse(200, { events: rows }, 'Bookings by event fetched')
    );
});

// ──────────────────────────────────────────────────
// GET /api/analytics/peak-hours
// Hour-of-day distribution of confirmed bookings.
// ──────────────────────────────────────────────────
export const getPeakHours = asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
        `SELECT
       HOUR(b.created_at)         AS hour,
       COUNT(*)                   AS booking_count
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE e.organizer_id = ?
       AND b.status = 'confirmed'
     GROUP BY HOUR(b.created_at)
     ORDER BY hour ASC`,
        [req.user.id]
    );

    res.status(200).json(
        new ApiResponse(200, { peakHours: rows }, 'Peak hours fetched')
    );
});

// ──────────────────────────────────────────────────
// GET /api/analytics/event/:eventId/detail
// Deep-dive stats for a single event (must belong to organizer).
// ──────────────────────────────────────────────────
export const getEventDetail = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    // Verify ownership
    const [eventRows] = await pool.execute(
        'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
        [eventId, req.user.id]
    );

    if (eventRows.length === 0) {
        throw new ApiError(404, 'Event not found or you do not own it');
    }

    const event = eventRows[0];

    // Booking counts by status
    const [statusRows] = await pool.execute(
        `SELECT
       COUNT(*)                                          AS total,
       SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)  AS confirmed,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)  AS cancelled
     FROM bookings WHERE event_id = ?`,
        [eventId]
    );

    // Revenue
    const [revRows] = await pool.execute(
        `SELECT COALESCE(SUM(amount_paid), 0) AS revenue
     FROM bookings WHERE event_id = ? AND status = 'confirmed'`,
        [eventId]
    );

    // Waitlist count
    const [wlRows] = await pool.execute(
        'SELECT COUNT(*) AS waitlist_count FROM waitlist WHERE event_id = ?',
        [eventId]
    );

    // Bookings over time
    const [timeRows] = await pool.execute(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM bookings WHERE event_id = ? AND status = 'confirmed'
     GROUP BY DATE(created_at) ORDER BY date ASC`,
        [eventId]
    );

    res.status(200).json(
        new ApiResponse(200, {
            event: {
                title: event.title,
                event_date: event.event_date,
                total_seats: event.total_seats,
                available_seats: event.available_seats,
                current_price: event.current_price,
            },
            bookings: statusRows[0],
            revenue: revRows[0].revenue,
            waitlist_count: wlRows[0].waitlist_count,
            bookings_over_time: timeRows,
        }, 'Event detail analytics fetched')
    );
});

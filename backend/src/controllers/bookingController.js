import { pool } from '../config/db.js';
import * as BookingModel from '../models/bookingModel.js';
import * as EventModel from '../models/eventModel.js';
import { getPrice, updateEventPrice } from '../services/pricingService.js';
import { generateQR } from '../services/qrService.js';
import * as WaitlistModel from '../models/waitlistModel.js';
import { sendWaitlistNotification } from '../services/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ──────────────────────────────────────────────
// POST /api/bookings  (user only)
//
// TRANSACTION FLOW (concurrent-safe):
//   1. Acquire a dedicated connection from the pool
//   2. BEGIN transaction
//   3. SELECT available_seats … FOR UPDATE  ← row-level lock
//   4. Validate seat availability
//   5. UPDATE events  (decrement available_seats)
//   6. INSERT booking
//   7. COMMIT
//   On error → ROLLBACK, release connection
// ──────────────────────────────────────────────
export const bookEvent = asyncHandler(async (req, res) => {
    const { event_id, seats_requested } = req.body;

    if (!event_id || !seats_requested || seats_requested < 1) {
        throw new ApiError(400, 'event_id and seats_requested (≥ 1) are required');
    }

    // Step 1: Get a dedicated connection (NOT pool.execute — we need
    //         the SAME connection for every statement in the transaction)
    const conn = await pool.getConnection();

    try {
        // Step 2: Start the transaction
        await conn.beginTransaction();

        // Step 3: Lock the event row so no other transaction can modify
        //         available_seats until we commit or rollback.
        //         SELECT … FOR UPDATE acquires an exclusive row-level lock.
        const [eventRows] = await conn.execute(
            'SELECT * FROM events WHERE id = ? FOR UPDATE',
            [event_id]
        );

        if (eventRows.length === 0) {
            throw new ApiError(404, 'Event not found');
        }

        const event = eventRows[0];

        // Step 4: Check if enough seats are available
        if (event.available_seats < seats_requested) {
            throw new ApiError(
                400,
                `Only ${event.available_seats} seat(s) available — requested ${seats_requested}`
            );
        }

        // Step 4b: Calculate price using the dynamic pricing engine
        const { totalPrice, pricePerSeat, tag } = getPrice(event, seats_requested);

        // Step 5: Decrement available seats atomically
        await conn.execute(
            'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
            [seats_requested, event_id]
        );

        // Step 6: Insert the booking record
        const bookingId = await BookingModel.createBooking(conn, {
            user_id: req.user.id,
            event_id,
            seats_booked: seats_requested,
            amount_paid: totalPrice,
            status: 'confirmed',
            qr_code: null,          // generated after commit
            expires_at: null,
        });

        // Step 7: Everything succeeded — commit the transaction
        await conn.commit();

        // Generate QR code AFTER commit (not inside the transaction)
        const qrCode = await generateQR(bookingId, req.user.id, event_id);
        await pool.execute('UPDATE bookings SET qr_code = ? WHERE id = ?', [qrCode, bookingId]);

        // Update the event's current_price after seat change
        await updateEventPrice(event_id);

        // Fetch the full booking to return to the client
        const booking = await BookingModel.findById(bookingId);

        res.status(201).json(
            new ApiResponse(201, { booking, pricing: { pricePerSeat, tag } }, 'Booking confirmed')
        );
    } catch (err) {
        // ROLLBACK on any failure so we never leave the DB in a partial state
        await conn.rollback();
        throw err;                // re-throw so the global error handler responds
    } finally {
        // ALWAYS release the connection back to the pool,
        // whether the transaction succeeded or failed
        conn.release();
    }
});

// ──────────────────────────────────────────────
// GET /api/bookings/my  (user)
// ──────────────────────────────────────────────
export const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await BookingModel.findByUser(req.user.id);

    res.status(200).json(
        new ApiResponse(200, { bookings }, 'Bookings fetched')
    );
});

// ──────────────────────────────────────────────
// DELETE /api/bookings/:id/cancel  (user)
//
// Cancellation also runs in a transaction because we need to
// restore the seats atomically.
// ──────────────────────────────────────────────
export const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    // Users can only cancel their own bookings
    if (booking.user_id !== req.user.id) {
        throw new ApiError(403, 'Forbidden — not your booking');
    }

    if (booking.status === 'cancelled') {
        throw new ApiError(400, 'Booking is already cancelled');
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Cancel the booking
        await BookingModel.cancelBooking(conn, booking.id);

        // Restore seats back to the event
        await conn.execute(
            'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
            [booking.seats_booked, booking.event_id]
        );

        await conn.commit();

        // Recalculate dynamic price after seat restoration
        await updateEventPrice(booking.event_id);

        // Notify the top waitlisted user (if any)
        const topUser = await WaitlistModel.getTopOfWaitlist(booking.event_id);
        if (topUser) {
            const holdExpiry = new Date(Date.now() + 15 * 60 * 1000);
            await WaitlistModel.setHoldExpiry(topUser.user_id, booking.event_id, holdExpiry);

            const [eventRows] = await pool.execute('SELECT title FROM events WHERE id = ?', [booking.event_id]);
            const eventTitle = eventRows[0]?.title || 'an event';
            const holdLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${booking.event_id}?hold=true`;

            // Fire and forget — email failure shouldn't block the response
            sendWaitlistNotification(topUser.email, eventTitle, holdLink).catch(() => { });
        }

        res.status(200).json(
            new ApiResponse(200, null, 'Booking cancelled and seats restored')
        );
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
});

// ──────────────────────────────────────────────
// GET /api/bookings/event/:eventId  (organizer)
// ──────────────────────────────────────────────
export const getEventBookings = asyncHandler(async (req, res) => {
    // Verify the organizer owns the event
    const event = await EventModel.findById(req.params.eventId);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    if (event.organizer_id !== req.user.id) {
        throw new ApiError(403, 'Forbidden — you do not own this event');
    }

    const bookings = await BookingModel.getEventBookings(req.params.eventId);

    res.status(200).json(
        new ApiResponse(200, { bookings }, 'Event bookings fetched')
    );
});

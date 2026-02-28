import { pool } from '../config/db.js';

/**
 * Booking model — data-access layer for the bookings table.
 *
 * Methods that participate in a transaction accept a `conn` (connection)
 * parameter instead of using the pool directly. This is critical for
 * the SELECT … FOR UPDATE + INSERT atomic booking flow.
 */

/**
 * Insert a new booking using an existing transactional connection.
 * @param {import('mysql2/promise').PoolConnection} conn
 */
export const createBooking = async (conn, {
    user_id, event_id, seats_booked, amount_paid, status, qr_code, expires_at,
}) => {
    const [result] = await conn.execute(
        `INSERT INTO bookings
       (user_id, event_id, seats_booked, amount_paid, status, qr_code, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, event_id, seats_booked, amount_paid, status, qr_code || null, expires_at || null]
    );

    return result.insertId;
};

/**
 * All bookings for a given user, including event details.
 */
export const findByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT b.*, e.title AS event_title, e.event_date, e.location
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Single booking by ID.
 */
export const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT b.*, e.title AS event_title, e.event_date, e.location
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.id = ?`,
        [id]
    );
    return rows[0];
};

/**
 * Cancel a booking inside a transaction (uses connection, not pool).
 * @param {import('mysql2/promise').PoolConnection} conn
 */
export const cancelBooking = async (conn, bookingId) => {
    await conn.execute(
        `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
        [bookingId]
    );
};

/**
 * All bookings for a specific event (organizer dashboard view).
 */
export const getEventBookings = async (eventId) => {
    const [rows] = await pool.execute(
        `SELECT b.*, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.event_id = ?
     ORDER BY b.created_at DESC`,
        [eventId]
    );
    return rows;
};

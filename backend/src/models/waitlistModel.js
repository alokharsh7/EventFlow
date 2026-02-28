import { pool } from '../config/db.js';

/**
 * Waitlist model — data-access layer.
 *
 * Waitlist table schema:
 *   id, user_id, event_id, position, hold_expires_at, created_at
 */

/**
 * Add a user to the end of an event's waitlist.
 * Position = current max position + 1.
 */
export const addToWaitlist = async (userId, eventId) => {
    // Get the current highest position for this event
    const [maxRows] = await pool.execute(
        'SELECT COALESCE(MAX(position), 0) AS maxPos FROM waitlist WHERE event_id = ?',
        [eventId]
    );
    const nextPosition = maxRows[0].maxPos + 1;

    const [result] = await pool.execute(
        'INSERT INTO waitlist (user_id, event_id, position) VALUES (?, ?, ?)',
        [userId, eventId, nextPosition]
    );

    return { id: result.insertId, position: nextPosition };
};

/**
 * Get a user's position on a specific event's waitlist.
 * Returns null if user is not on the waitlist.
 */
export const getWaitlistPosition = async (userId, eventId) => {
    const [rows] = await pool.execute(
        'SELECT position FROM waitlist WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
    );
    return rows[0] ? rows[0].position : null;
};

/**
 * Return the user at position 1 for a given event (next in line).
 */
export const getTopOfWaitlist = async (eventId) => {
    const [rows] = await pool.execute(
        `SELECT w.*, u.email, u.name
     FROM waitlist w
     JOIN users u ON w.user_id = u.id
     WHERE w.event_id = ? AND w.position = 1`,
        [eventId]
    );
    return rows[0] || null;
};

/**
 * Remove a specific user from an event's waitlist.
 */
export const removeFromWaitlist = async (userId, eventId) => {
    // Get the position before deleting so we can shift others
    const [rows] = await pool.execute(
        'SELECT position FROM waitlist WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
    );

    if (rows.length === 0) return false;

    const removedPosition = rows[0].position;

    await pool.execute(
        'DELETE FROM waitlist WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
    );

    // Shift everyone behind them up by 1
    await pool.execute(
        'UPDATE waitlist SET position = position - 1 WHERE event_id = ? AND position > ?',
        [eventId, removedPosition]
    );

    return true;
};

/**
 * After the top user is notified (or skipped), promote everyone:
 * remove position 1 and shift all others down by 1.
 */
export const promoteWaitlist = async (eventId) => {
    // Delete position 1
    await pool.execute(
        'DELETE FROM waitlist WHERE event_id = ? AND position = 1',
        [eventId]
    );

    // Shift remaining positions down
    await pool.execute(
        'UPDATE waitlist SET position = position - 1 WHERE event_id = ?',
        [eventId]
    );
};

/**
 * Set a hold expiry on a waitlist entry (used by the cron job).
 */
export const setHoldExpiry = async (userId, eventId, expiresAt) => {
    await pool.execute(
        'UPDATE waitlist SET hold_expires_at = ? WHERE user_id = ? AND event_id = ?',
        [expiresAt, userId, eventId]
    );
};

/**
 * Get all waitlist entries for a user (with event details).
 */
export const getByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT w.*, e.title AS event_title, e.event_date, e.location
     FROM waitlist w
     JOIN events e ON w.event_id = e.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
        [userId]
    );
    return rows;
};

import { pool } from '../config/db.js';

/**
 * Event model — data-access layer for the events table.
 * All queries are parameterised to prevent SQL injection.
 */

/**
 * Insert a new event and return the created row.
 */
export const create = async (eventData) => {
    const {
        organizer_id, title, description, category, location,
        event_date, total_seats, available_seats, base_price,
        current_price, status,
    } = eventData;

    const [result] = await pool.execute(
        `INSERT INTO events
       (organizer_id, title, description, category, location,
        event_date, total_seats, available_seats, base_price,
        current_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            organizer_id, title, description, category, location,
            event_date, total_seats, available_seats, base_price,
            current_price, status,
        ]
    );

    return findById(result.insertId);
};

/**
 * Return a filtered list of events.
 * Builds a dynamic WHERE clause from the provided filter object.
 */
export const findAll = async (filters = {}) => {
    const conditions = [];
    const params = [];

    if (filters.category) {
        conditions.push('e.category = ?');
        params.push(filters.category);
    }
    if (filters.location) {
        conditions.push('e.location LIKE ?');
        params.push(`%${filters.location}%`);
    }
    if (filters.dateFrom) {
        conditions.push('e.event_date >= ?');
        params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
        conditions.push('e.event_date <= ?');
        params.push(filters.dateTo);
    }
    if (filters.minPrice) {
        conditions.push('e.current_price >= ?');
        params.push(Number(filters.minPrice));
    }
    if (filters.maxPrice) {
        conditions.push('e.current_price <= ?');
        params.push(Number(filters.maxPrice));
    }
    if (filters.status) {
        conditions.push('e.status = ?');
        params.push(filters.status);
    }

    const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.execute(
        `SELECT e.*, u.name AS organizer_name
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     ${whereClause}
     ORDER BY e.event_date ASC`,
        params
    );

    return rows;
};

/**
 * Fetch a single event by ID, JOINing the organizer's name.
 */
export const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT e.*, u.name AS organizer_name
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     WHERE e.id = ?`,
        [id]
    );
    return rows[0];
};

/**
 * Partial update — only overwrites the fields provided.
 */
export const update = async (id, fields) => {
    const keys = Object.keys(fields);
    if (keys.length === 0) return findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);

    await pool.execute(
        `UPDATE events SET ${setClause} WHERE id = ?`,
        [...values, id]
    );

    return findById(id);
};

/**
 * Hard-delete an event row (for admin use; controllers use soft delete).
 */
export const remove = async (id) => {
    const [result] = await pool.execute(
        'DELETE FROM events WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

/**
 * All events belonging to a specific organizer.
 */
export const findByOrganizer = async (organizerId) => {
    const [rows] = await pool.execute(
        `SELECT e.*, u.name AS organizer_name
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     WHERE e.organizer_id = ?
     ORDER BY e.created_at DESC`,
        [organizerId]
    );
    return rows;
};

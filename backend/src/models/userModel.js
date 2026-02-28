import { pool } from '../config/db.js';

/**
 * User model — thin data-access layer.
 * Every method runs a parameterised query and returns plain objects.
 */

/**
 * Look up a user by their email address.
 * Used during login to verify credentials.
 */
export const findByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0]; // undefined when not found
};

/**
 * Look up a user by primary key.
 * Used by the getMe controller to return profile data.
 */
export const findById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0];
};

/**
 * Insert a new user and return the created record (minus password).
 */
export const create = async ({ name, email, password, role = 'user' }) => {
    const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
    );

    // Return the freshly created user (excluding password)
    return findById(result.insertId);
};

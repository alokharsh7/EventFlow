import { pool } from '../config/db.js';

/**
 * Dynamic Pricing Service
 *
 * Rules:
 *  1. Early-bird: event >30 days away AND <20% sold → 15% discount
 *  2. Surge:      >80% seats sold → 20% markup
 *  3. Default:    base_price
 */

/**
 * Calculate the per-seat price for a booking.
 * @param {object} event   — event row from DB
 * @param {number} seatsRequested
 * @returns {{ pricePerSeat: number, totalPrice: number, tag: string }}
 */
export const getPrice = (event, seatsRequested) => {
    const basePrice = Number(event.base_price);
    const totalSeats = Number(event.total_seats);
    const availableSeats = Number(event.available_seats);
    const soldSeats = totalSeats - availableSeats;
    const soldPct = totalSeats > 0 ? (soldSeats / totalSeats) * 100 : 0;

    // Days until the event
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysAway = Math.ceil((eventDate - now) / msPerDay);

    let pricePerSeat = basePrice;
    let tag = 'standard';

    // Rule 1: Early-bird discount
    if (daysAway > 30 && soldPct < 20) {
        pricePerSeat = basePrice * 0.85;           // 15% off
        tag = 'early-bird';
    }
    // Rule 2: Surge pricing
    else if (soldPct > 80) {
        pricePerSeat = basePrice * 1.20;           // 20% extra
        tag = 'surge';
    }

    // Round to 2 decimal places
    pricePerSeat = Math.round(pricePerSeat * 100) / 100;
    const totalPrice = Math.round(pricePerSeat * seatsRequested * 100) / 100;

    return { pricePerSeat, totalPrice, tag };
};

/**
 * Recalculate and persist the current_price for a given event.
 * Called after any booking/cancellation so the listed price stays accurate.
 */
export const updateEventPrice = async (eventId) => {
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (rows.length === 0) return;

    const event = rows[0];
    const { pricePerSeat } = getPrice(event, 1);   // 1 seat just to get per-seat price

    await pool.execute(
        'UPDATE events SET current_price = ? WHERE id = ?',
        [pricePerSeat, eventId]
    );
};

import cron from 'node-cron';
import { pool } from '../config/db.js';
import * as WaitlistModel from '../models/waitlistModel.js';
import { sendWaitlistNotification } from './emailService.js';
import { updateEventPrice } from './pricingService.js';

/**
 * Cron Service — runs every minute.
 *
 * Job:
 *  1. Find bookings that are 'pending' and past their hold window (expires_at < NOW())
 *  2. Mark them 'expired'
 *  3. Restore seats to the event
 *  4. Recalculate dynamic price
 *  5. Notify the next person on the waitlist (if any) with a 15-minute hold
 */
export const startCronJobs = () => {
    // ────────── Every minute: expire stale holds ──────────
    cron.schedule('* * * * *', async () => {
        try {
            // Step 1: Find expired pending bookings
            const [expired] = await pool.execute(
                `SELECT * FROM bookings
         WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < NOW()`
            );

            if (expired.length === 0) return; // nothing to do

            for (const booking of expired) {
                const conn = await pool.getConnection();
                try {
                    await conn.beginTransaction();

                    // Step 2: Mark booking as expired
                    await conn.execute(
                        `UPDATE bookings SET status = 'expired' WHERE id = ?`,
                        [booking.id]
                    );

                    // Step 3: Restore seats
                    await conn.execute(
                        `UPDATE events SET available_seats = available_seats + ? WHERE id = ?`,
                        [booking.seats_booked, booking.event_id]
                    );

                    await conn.commit();

                    console.log(`⏰ Booking #${booking.id} expired — ${booking.seats_booked} seat(s) restored to event #${booking.event_id}`);

                    // Step 4: Update dynamic price after seat change
                    await updateEventPrice(booking.event_id);

                    // Step 5: Notify top-of-waitlist user
                    const topUser = await WaitlistModel.getTopOfWaitlist(booking.event_id);
                    if (topUser) {
                        // Set a 15-minute hold on their waitlist entry
                        const holdExpiry = new Date(Date.now() + 15 * 60 * 1000);
                        await WaitlistModel.setHoldExpiry(topUser.user_id, booking.event_id, holdExpiry);

                        // Build a placeholder hold link (frontend would build real URL)
                        const holdLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${booking.event_id}?hold=true`;

                        // Fetch event title for the email
                        const [eventRows] = await pool.execute('SELECT title FROM events WHERE id = ?', [booking.event_id]);
                        const eventTitle = eventRows[0]?.title || 'an event';

                        await sendWaitlistNotification(topUser.email, eventTitle, holdLink);
                        console.log(`📧 Waitlist notification sent to ${topUser.email} for event #${booking.event_id}`);
                    }
                } catch (err) {
                    await conn.rollback();
                    console.error(`❌ Cron error for booking #${booking.id}:`, err.message);
                } finally {
                    conn.release();
                }
            }
        } catch (err) {
            console.error('❌ Cron job failed:', err.message);
        }
    });

    console.log('⏲️  Cron jobs started (every minute)');
};

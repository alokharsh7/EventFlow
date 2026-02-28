import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env BEFORE any other module that reads process.env
dotenv.config();

import { pool } from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import waitlistRoutes from './src/routes/waitlistRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { startCronJobs } from './src/services/cronService.js';

const app = express();

// ──────────────── Global middleware ────────────────
app.use(cors());                       // allow cross-origin requests
app.use(express.json());               // parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // parse form bodies

// ──────────────── API routes ────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/organizer', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/analytics', analyticsRoutes);

// ──────────────── Health check ────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────── Global error handler (must be LAST) ────────────────
app.use(errorHandler);

// ──────────────── Start server ────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Verify database connectivity at startup
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('✅ MySQL connected');

        // Start cron jobs only after DB is confirmed ready
        startCronJobs();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
    }
});

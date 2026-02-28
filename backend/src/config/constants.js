/**
 * Centralised constants used across the application.
 * Keeps magic strings out of controllers and models.
 */

export const ROLES = Object.freeze({
    USER: 'user',
    ORGANIZER: 'organizer',
    ADMIN: 'admin',
});

export const BOOKING_STATUS = Object.freeze({
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
});

export const EVENT_STATUS = Object.freeze({
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
});

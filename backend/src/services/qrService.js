import QRCode from 'qrcode';

/**
 * QR Code Service
 *
 * Generates a base64 data-URL QR code for a confirmed booking.
 * The QR payload contains booking metadata that can be scanned
 * at the venue for check-in.
 */

/**
 * @param {number} bookingId
 * @param {number} userId
 * @param {number} eventId
 * @returns {Promise<string>} base64 data URL (image/png)
 */
export const generateQR = async (bookingId, userId, eventId) => {
    const payload = JSON.stringify({
        bookingId,
        userId,
        eventId,
        issuedAt: Date.now(),
    });

    // toDataURL returns "data:image/png;base64,..."
    const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        width: 300,
    });

    return dataUrl;
};

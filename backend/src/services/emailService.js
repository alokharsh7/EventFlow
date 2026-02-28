import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service — uses nodemailer with a configurable SMTP transport.
 *
 * For development use Ethereal (https://ethereal.email) or Mailtrap:
 *   EMAIL_HOST=smtp.ethereal.email
 *   EMAIL_PORT=587
 *   EMAIL_USER=<ethereal user>
 *   EMAIL_PASS=<ethereal pass>
 */

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a waitlist notification email.
 * @param {string} userEmail
 * @param {string} eventTitle
 * @param {string} holdLink — URL the user can click to confirm booking
 */
export const sendWaitlistNotification = async (userEmail, eventTitle, holdLink) => {
    const mailOptions = {
        from: `"EventFlow" <noreply@eventflow.com>`,
        to: userEmail,
        subject: `🎟 A seat is available for "${eventTitle}"!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Great news!</h2>
        <p>A seat has opened up for <strong>${eventTitle}</strong>.</p>
        <p>You have <strong>15 minutes</strong> to confirm your booking before it's offered to the next person on the waitlist.</p>
        <a href="${holdLink}"
           style="display:inline-block; padding:12px 24px; background:#6366f1;
                  color:#fff; text-decoration:none; border-radius:6px; margin-top:12px;">
          Confirm My Seat
        </a>
        <p style="color:#888; margin-top:24px; font-size:12px;">
          If you don't book within 15 minutes, your spot will be released automatically.
        </p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Waitlist email sent to ${userEmail} — messageId: ${info.messageId}`);
        return info;
    } catch (err) {
        // Log but don't crash — email failure shouldn't kill the cron job
        console.error('❌ Email send failed:', err.message);
        return null;
    }
};

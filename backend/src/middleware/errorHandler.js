import ApiError from '../utils/ApiError.js';

/**
 * Global Express error handler.
 * All errors (thrown or passed via next()) end up here.
 *
 * Must have the (err, req, res, next) signature so Express
 * recognises it as an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    // If the error is one we threw intentionally, use its status code
    let statusCode = err instanceof ApiError ? err.statusCode : 500;
    let message = err.message || 'Internal Server Error';

    // Log the full error in development for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        // Include stack trace only in development
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default errorHandler;

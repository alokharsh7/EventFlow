/**
 * Custom error class for operational errors.
 * Carries an HTTP status code so the global error handler
 * knows what to send to the client.
 */
class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong') {
        super(message);
        this.statusCode = statusCode;
        this.success = false;

        // Capture the stack trace, excluding the constructor call itself
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;

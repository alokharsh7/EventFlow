/**
 * Wraps an async controller function so that any thrown error
 * is automatically forwarded to Express's next() error handler.
 * Eliminates repetitive try/catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

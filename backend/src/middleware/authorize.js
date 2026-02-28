import ApiError from '../utils/ApiError.js';

/**
 * Factory middleware that restricts access to the listed roles.
 *
 * Usage:  router.get('/admin', authenticate, authorize('admin'), handler)
 *
 * Must be placed AFTER authenticate so that req.user is available.
 */
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, 'Forbidden — insufficient permissions');
        }

        next();
    };
};

export default authorize;

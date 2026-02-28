import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware: verifies the JWT from the Authorization header
 * and attaches the decoded payload to req.user.
 *
 * Expected header format:  Authorization: Bearer <token>
 */
const authenticate = asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Not authenticated — token missing');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach minimal user info for downstream middleware / controllers
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    } catch {
        throw new ApiError(401, 'Not authenticated — token invalid or expired');
    }
});

export default authenticate;

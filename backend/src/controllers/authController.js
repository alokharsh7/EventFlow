import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/userModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a signed JWT containing the user's id, email, and role.
 * Expires in 7 days as specified by the project requirements.
 */
const signToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ──────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email, and password are required');
    }

    // --- Uniqueness check ---
    const existing = await UserModel.findByEmail(email);
    if (existing) {
        throw new ApiError(409, 'Email already registered');
    }

    // --- Hash password with cost factor 10 ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create user ---
    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',           // default role
    });

    const token = signToken(user);

    res.status(201).json(
        new ApiResponse(201, { user, token }, 'Registration successful')
    );
});

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    // findByEmail returns the full row including the hashed password
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = signToken(user);

    // Exclude password from the response
    const { password: _pwd, ...userData } = user;

    res.status(200).json(
        new ApiResponse(200, { user: userData, token }, 'Login successful')
    );
});

// ──────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ──────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    // req.user was attached by the authenticate middleware
    const user = await UserModel.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
        new ApiResponse(200, { user }, 'User profile fetched')
    );
});

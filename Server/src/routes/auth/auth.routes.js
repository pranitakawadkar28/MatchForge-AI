import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";

import { 
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema, 
} from "../../validators/auth.validator.js";

import { 
    forgotPasswordController,
    getProfileController,
    loginController,
    logoutAllController,
    logoutController,
    refreshTokenController,
    registerController,
    resetPasswordController,
    verifyEmailController
 } from "../../controllers/auth/auth.controller.js";
 
import { protect } from "../../middlewares/auth.middleware.js";

const authRouter = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send email verification link
 * @access  Public
 */
authRouter.post(
    "/register",
    validate(registerSchema), 
    registerController
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return access & refresh tokens
 * @access  Public
 */
authRouter.post(
    "/login", 
    validate(loginSchema), 
    loginController
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email using token sent via email
 * @access  Public
 */
authRouter.get(
    "/verify-email/:token", 
    verifyEmailController
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
authRouter.post(
    "/forgot-password", 
    validate(forgotPasswordSchema), 
    forgotPasswordController
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset user password using reset token
 * @access  Public
 */
authRouter.post(
    "/reset-password/:token", 
    validate(resetPasswordSchema), 
    resetPasswordController
);

/**
 * @route   GET /api/auth/get-me
 * @desc    Get current logged-in user profile
 * @access  Private
 */
authRouter.get(
    "/get-me", 
    protect, 
    getProfileController
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Generate new access token using refresh token
 * @access  Public (uses httpOnly cookie)
 */
authRouter.post(
    "/refresh-token", 
    refreshTokenController
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by clearing cookies and invalidating session
 * @access  Private
 */
authRouter.post(
    "/logout", 
    protect,
    logoutController
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices by incrementing tokenVersion
 * @access  Private
 */
authRouter.post(
    "/logout-all",
    protect,
    logoutAllController
)
export default authRouter;
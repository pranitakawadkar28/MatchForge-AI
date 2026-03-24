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
 * POST /api/auth/register
 */
authRouter.post(
    "/register",
    validate(registerSchema), 
    registerController
);

/**
 * POST /api/auth/login
 */
authRouter.post(
    "/login", 
    validate(loginSchema), 
    loginController
);

/**
 * GET /api/auth/verify-email
 */
authRouter.get(
    "/verify-email/:token", 
    verifyEmailController
);

/**
 * POST /api/auth/forgot-password
 */
authRouter.post(
    "/forgot-password", 
    validate(forgotPasswordSchema), 
    forgotPasswordController
);

/**
 * POST /api/auth/reset-password
 */
authRouter.post(
    "/reset-password/:token", 
    validate(resetPasswordSchema), 
    resetPasswordController
);

/**
 * GET /api/auth/get-me
 */
authRouter.get(
    "/get-me", 
    protect, 
    getProfileController
);

/**
 * POST /api/auth/refresh
 */
authRouter.post(
    "/refresh", 
    refreshTokenController
);

/**
 * POST /api/auth/logout
 */
authRouter.post(
    "/logout", 
    logoutController
);

/**
 * POST /api/auth/logout-all
 */
authRouter.post(
    "/logout-all",
    protect,
    logoutAllController
)
export default authRouter;
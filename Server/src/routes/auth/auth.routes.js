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
    loginController,
    registerController,
    resetPasswordController,
    verifyEmailController
 } from "../../controllers/auth/auth.controller.js";

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

export default authRouter;
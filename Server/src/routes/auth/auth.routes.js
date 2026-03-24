import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";

import { 
    loginSchema,
    registerSchema, 
} from "../../validators/auth.validator.js";

import { 
    loginController,
    registerController,
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

export default authRouter;
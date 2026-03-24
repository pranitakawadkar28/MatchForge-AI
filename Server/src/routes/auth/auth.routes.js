import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";

import { 
    loginSchema,
    registerSchema, 
} from "../../validators/auth.validator.js";

import { 
    loginController,
    registerController
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

export default authRouter;
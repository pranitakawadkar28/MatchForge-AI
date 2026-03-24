import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";

import { 
    registerSchema, 
} from "../../validators/auth.validator.js";

import { 
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

export default authRouter;
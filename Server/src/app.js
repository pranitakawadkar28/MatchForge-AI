import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth/auth.routes.js"

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
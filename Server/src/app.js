import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth/auth.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js";
import { FRONTEND_URL } from "./config/env.js";

const app = express();

app.use(cors({
  origin: FRONTEND_URL,   
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
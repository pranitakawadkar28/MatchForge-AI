import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth/auth.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000"], 
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
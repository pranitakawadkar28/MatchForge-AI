import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI IS NOT DEFINED IN ENVIRONMENT VARIABLES");
}

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
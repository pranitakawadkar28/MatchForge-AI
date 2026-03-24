import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI IS NOT DEFINED IN ENVIRONMENT VARIABLES");
}

// if(!JWT_SECRET){
//     throw new Error("JWT_SECRET IS NOT DEFINED IN ENVIRONMENT VARIABLES");
// }

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const NODE_ENV = process.env.NODE_ENV;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FRONTEND_URL = process.env.FRONTEND_URL;

export const EMAIL_TOKEN_EXPIRY = 10 * 60 * 1000;
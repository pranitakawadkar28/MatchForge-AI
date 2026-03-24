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
// export const JWT_SECRET = process.env.JWT_SECRET;
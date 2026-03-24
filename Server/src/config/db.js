import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

async function connectToDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("DATABASE CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED:", error.message.toUpperCase());
        process.exit(1); 
    }
}

export default connectToDB;
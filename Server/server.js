import app from "./src/app.js";
import { PORT } from "./src/config/env.js";
import connectToDB from "./src/config/db.js";
import redisClient from "./src/config/redis.js";

async function startServer() {
    try {
        await connectToDB();
        // await redisClient.connect();

        app.listen(PORT, () => {
            console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
        });

    } catch (error) {
        console.error("FAILED TO START SERVER:", error.message);
        process.exit(1);
    }
}

startServer();
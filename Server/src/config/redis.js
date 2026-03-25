import { createClient } from 'redis';

const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Redis Connected'));

await redisClient.connect();

export default redisClient;
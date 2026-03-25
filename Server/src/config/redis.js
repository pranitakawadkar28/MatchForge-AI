import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT } from './env.js';

const redisClient = createClient({
  host: REDIS_HOST || 'localhost',
  port: REDIS_PORT || 6379,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Redis Connected'));

await redisClient.connect();

export default redisClient;
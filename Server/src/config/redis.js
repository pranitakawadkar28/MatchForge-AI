import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT } from './env.js';

const redisClient = createClient({
  url: `redis://${REDIS_HOST || 'localhost'}:${REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Redis Connected'));

export default redisClient;
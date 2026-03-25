import redisClient from '../config/redis.js';

// Add token to blacklist with auto-expiry
export const blacklistToken = async (token, expiresInSeconds) => {
  await redisClient.setEx(`blacklist:${token}`, expiresInSeconds, 'true');
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
  const result = await redisClient.get(`blacklist:${token}`);
  return result === 'true';
};
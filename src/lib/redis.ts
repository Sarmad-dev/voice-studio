import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Check if Redis is connected and working
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    // Ping Redis to check connection
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis connection error:', error);
    return false;
  }
} 
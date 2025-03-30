import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import { RateLimitError } from './exceptions';

// Different limiters for different purposes
const limiters = {
  // 5 requests per minute for authentication (signin, signup)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  
  // More strict rate limiting for failed login attempts to prevent brute force
  // 3 failed attempts per 10 minutes
  failedAuth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    analytics: true,
    prefix: 'ratelimit:failed-auth',
  }),
};

/**
 * Rate limit a specific operation
 * @param identifier The unique identifier to rate limit (e.g. IP address, user ID)
 * @param type The type of rate limit to apply
 * @param errorMessage Custom error message to display when rate limited
 */
export async function rateLimit(
  identifier: string,
  type: keyof typeof limiters = 'auth',
  errorMessage?: string
): Promise<void> {
  try {
    const limiter = limiters[type];
    const { success, limit, reset, remaining } = await limiter.limit(identifier);
    
    if (!success) {
      const resetSeconds = Math.ceil((reset - Date.now()) / 1000);
      throw new RateLimitError(
        errorMessage || 
        `Too many requests. Try again in ${resetSeconds} seconds. Remaining: ${remaining}/${limit}.`
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    
    // If Redis is down, we should not block the request
    console.error('Rate limiting error:', error);
  }
} 
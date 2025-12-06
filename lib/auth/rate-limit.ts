/**
 * In-memory rate limiter for auth endpoints
 *
 * This provides protection against brute force attacks on authentication endpoints.
 * For multi-server deployments, consider using Redis-backed rate limiting instead.
 */

type RateLimitEntry = {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Maximum attempts before blocking
  maxAttempts: 5,
  // Time window for counting attempts (15 minutes)
  windowMs: 15 * 60 * 1000,
  // Block duration after exceeding limit (15 minutes)
  blockDurationMs: 15 * 60 * 1000,
  // Cleanup interval (5 minutes)
  cleanupIntervalMs: 5 * 60 * 1000,
};

// Cleanup old entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove entries that are outside the window and not blocked
      if (
        now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs &&
        (!entry.blockedUntil || now > entry.blockedUntil)
      ) {
        rateLimitStore.delete(key);
      }
    }
  }, RATE_LIMIT_CONFIG.cleanupIntervalMs);

  // Don't prevent process from exiting
  cleanupInterval.unref?.();
}

// Start cleanup on module load
startCleanup();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt?: Date;
  retryAfterSeconds?: number;
};

/**
 * Check rate limit for a given identifier (e.g., IP address or email)
 * Returns whether the request should be allowed
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No previous attempts
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return {
      success: true,
      remaining: RATE_LIMIT_CONFIG.maxAttempts - 1,
    };
  }

  // Currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.blockedUntil),
      retryAfterSeconds,
    };
  }

  // Block expired, reset
  if (entry.blockedUntil && now >= entry.blockedUntil) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return {
      success: true,
      remaining: RATE_LIMIT_CONFIG.maxAttempts - 1,
    };
  }

  // Window expired, reset
  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return {
      success: true,
      remaining: RATE_LIMIT_CONFIG.maxAttempts - 1,
    };
  }

  // Within window, increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_CONFIG.maxAttempts) {
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    rateLimitStore.set(identifier, entry);

    const retryAfterSeconds = Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.blockedUntil),
      retryAfterSeconds,
    };
  }

  rateLimitStore.set(identifier, entry);
  return {
    success: true,
    remaining: RATE_LIMIT_CONFIG.maxAttempts - entry.count,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Create a composite key for rate limiting by both IP and email
 * This prevents attackers from bypassing rate limits by using different IPs
 */
export function getRateLimitKey(type: 'ip' | 'email' | 'combined', ...parts: string[]): string {
  return `${type}:${parts.join(':')}`;
}

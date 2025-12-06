import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, resetRateLimit, getRateLimitKey } from '@/lib/auth/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limits between tests by using unique keys
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const key = `test-${Date.now()}-1`;
      const result = checkRateLimit(key);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4); // 5 max - 1 used
    });

    it('should track multiple attempts', () => {
      const key = `test-${Date.now()}-2`;

      // First 5 attempts should succeed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(key);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }

      // 6th attempt should fail
      const blocked = checkRateLimit(key);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should return retry after seconds when blocked', () => {
      const key = `test-${Date.now()}-3`;

      // Exhaust limit
      for (let i = 0; i <= 5; i++) {
        checkRateLimit(key);
      }

      const result = checkRateLimit(key);
      expect(result.success).toBe(false);
      expect(result.retryAfterSeconds).toBeDefined();
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      const key = `test-${Date.now()}-4`;

      // Use up some attempts
      checkRateLimit(key);
      checkRateLimit(key);
      checkRateLimit(key);

      // Reset
      resetRateLimit(key);

      // Should have full allowance again
      const result = checkRateLimit(key);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('getRateLimitKey', () => {
    it('should create correct key format', () => {
      expect(getRateLimitKey('ip', '192.168.1.1')).toBe('ip:192.168.1.1');
      expect(getRateLimitKey('email', 'test@example.com')).toBe('email:test@example.com');
      expect(getRateLimitKey('combined', '192.168.1.1', 'test@example.com')).toBe('combined:192.168.1.1:test@example.com');
    });
  });
});

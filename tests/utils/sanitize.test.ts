import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskPhone,
  maskName,
  maskToken,
  maskIp,
  redact,
  sanitizeForLogging
} from '@/lib/utils/sanitize';

describe('PII Sanitization', () => {
  describe('maskEmail', () => {
    it('should mask email keeping first 2 chars and domain', () => {
      expect(maskEmail('john.doe@example.com')).toBe('jo***@example.com');
      expect(maskEmail('test@test.de')).toBe('te***@test.de');
    });

    it('should handle short local parts', () => {
      expect(maskEmail('a@example.com')).toBe('a***@example.com');
      expect(maskEmail('ab@example.com')).toBe('ab***@example.com');
    });

    it('should handle invalid emails', () => {
      expect(maskEmail('invalid-email')).toBe('[invalid-email]');
      expect(maskEmail('')).toBe('[invalid-email]');
    });
  });

  describe('maskPhone', () => {
    it('should show only last 4 digits', () => {
      expect(maskPhone('+49 123 456 7890')).toBe('***7890');
      expect(maskPhone('0176-12345678')).toBe('***5678');
    });

    it('should handle short numbers', () => {
      expect(maskPhone('123')).toBe('***');
    });
  });

  describe('maskName', () => {
    it('should mask names keeping first char', () => {
      expect(maskName('John Doe')).toBe('J*** D***');
      expect(maskName('Jane')).toBe('J***');
    });
  });

  describe('maskToken', () => {
    it('should show first and last 4 chars', () => {
      expect(maskToken('abc123def456ghi789jkl')).toBe('abc1...9jkl');
    });

    it('should redact short tokens', () => {
      expect(maskToken('short')).toBe('[REDACTED]');
    });
  });

  describe('maskIp', () => {
    it('should mask last octet of IPv4', () => {
      expect(maskIp('192.168.1.100')).toBe('192.168.1.***');
    });

    it('should mask IPv6', () => {
      expect(maskIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:***');
    });
  });

  describe('redact', () => {
    it('should return [REDACTED] for any input', () => {
      expect(redact('secret')).toBe('[REDACTED]');
      expect(redact(12345)).toBe('[REDACTED]');
      expect(redact({ key: 'value' })).toBe('[REDACTED]');
    });
  });

  describe('sanitizeForLogging', () => {
    it('should mask email fields', () => {
      const input = { userEmail: 'john@example.com', name: 'Test' };
      const result = sanitizeForLogging(input);

      expect(result.userEmail).toBe('jo***@example.com');
      expect(result.name).toBe('T***');
    });

    it('should redact password fields', () => {
      const input = { password: 'secret123', passwordHash: 'hash123' };
      const result = sanitizeForLogging(input);

      expect(result.password).toBe('[REDACTED]');
      expect(result.passwordHash).toBe('[REDACTED]');
    });

    it('should redact token fields', () => {
      const input = {
        accessToken: 'abc123',
        apiKey: 'key123',
        secretKey: 'secret123'
      };
      const result = sanitizeForLogging(input);

      expect(result.accessToken).toBe('[REDACTED]');
      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.secretKey).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          email: 'test@example.com',
          password: 'secret'
        }
      };
      const result = sanitizeForLogging(input);

      expect((result.user as Record<string, unknown>).email).toBe('te***@example.com');
      expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const input = {
        users: [
          { email: 'a@test.com' },
          { email: 'b@test.com' }
        ]
      };
      const result = sanitizeForLogging(input);
      const users = result.users as Array<Record<string, unknown>>;

      expect(users[0].email).toBe('a***@test.com');
      expect(users[1].email).toBe('b***@test.com');
    });

    it('should preserve non-sensitive fields', () => {
      const input = { orderId: 123, status: 'PAID', count: 5 };
      const result = sanitizeForLogging(input);

      expect(result.orderId).toBe(123);
      expect(result.status).toBe('PAID');
      expect(result.count).toBe(5);
    });
  });
});

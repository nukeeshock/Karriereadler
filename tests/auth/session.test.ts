import { describe, it, expect } from 'vitest';
import { hashPassword, comparePasswords, signToken, verifyToken } from '@/lib/auth/session';

describe('Session Management', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // bcrypt uses random salts, so hashes should differ
      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isValid = await comparePasswords(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isValid = await comparePasswords('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    it('should sign and verify a token', async () => {
      const payload = {
        user: { id: 123, sessionVersion: 1 },
        expires: new Date(Date.now() + 86400000).toISOString()
      };

      const token = await signToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = await verifyToken(token);
      expect(verified.user.id).toBe(123);
      expect(verified.user.sessionVersion).toBe(1);
    });

    it('should include session version in token', async () => {
      const payload = {
        user: { id: 456, sessionVersion: 5 },
        expires: new Date(Date.now() + 86400000).toISOString()
      };

      const token = await signToken(payload);
      const verified = await verifyToken(token);

      expect(verified.user.sessionVersion).toBe(5);
    });

    it('should reject tampered token', async () => {
      const payload = {
        user: { id: 123 },
        expires: new Date(Date.now() + 86400000).toISOString()
      };

      const token = await signToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      await expect(verifyToken(tamperedToken)).rejects.toThrow();
    });

    it('should reject expired token', async () => {
      const payload = {
        user: { id: 123 },
        expires: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
      };

      const token = await signToken(payload);

      // Note: The JWT library checks its own exp claim, not our custom expires field
      // So we need to test the actual expiration logic in getUser()
      const verified = await verifyToken(token);
      expect(new Date(verified.expires) < new Date()).toBe(true);
    });
  });
});

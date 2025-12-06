import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateDownloadToken,
  verifyDownloadToken,
  generateSignedDownloadUrl
} from '@/lib/utils/signed-url';

describe('Signed URLs', () => {
  describe('generateDownloadToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateDownloadToken(
        123, // orderId
        456, // userId
        'https://blob.example.com/file.pdf',
        60 // 60 minutes
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload', async () => {
      const orderId = 123;
      const userId = 456;
      const fileUrl = 'https://blob.example.com/file.pdf';

      const token = await generateDownloadToken(orderId, userId, fileUrl, 60);
      const payload = await verifyDownloadToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.orderId).toBe(orderId);
      expect(payload!.userId).toBe(userId);
      expect(payload!.fileUrl).toBe(fileUrl);
    });
  });

  describe('verifyDownloadToken', () => {
    it('should verify valid token', async () => {
      const token = await generateDownloadToken(123, 456, 'https://example.com/file.pdf', 60);
      const payload = await verifyDownloadToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.orderId).toBe(123);
    });

    it('should return null for invalid token', async () => {
      const result = await verifyDownloadToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for tampered token', async () => {
      const token = await generateDownloadToken(123, 456, 'https://example.com/file.pdf', 60);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      const result = await verifyDownloadToken(tamperedToken);
      expect(result).toBeNull();
    });

    it('should return null for empty token', async () => {
      const result = await verifyDownloadToken('');
      expect(result).toBeNull();
    });
  });

  describe('generateSignedDownloadUrl', () => {
    it('should generate complete URL with token', async () => {
      const url = await generateSignedDownloadUrl(
        'https://karriereadler.com',
        123,
        456,
        'https://blob.example.com/file.pdf',
        60
      );

      expect(url).toContain('https://karriereadler.com/api/orders/123/download');
      expect(url).toContain('token=');
    });

    it('should include order ID in URL path', async () => {
      const url = await generateSignedDownloadUrl(
        'https://karriereadler.com',
        999,
        456,
        'https://blob.example.com/file.pdf',
        60
      );

      expect(url).toContain('/orders/999/download');
    });

    it('should URL-encode the token', async () => {
      const url = await generateSignedDownloadUrl(
        'https://karriereadler.com',
        123,
        456,
        'https://blob.example.com/file.pdf',
        60
      );

      // Token should be properly encoded (no raw special characters)
      const tokenPart = url.split('token=')[1];
      expect(tokenPart).toBeDefined();
      // JWT tokens contain dots which should remain (they're URL-safe)
      expect(tokenPart.split('.')).toHaveLength(3);
    });
  });

  describe('Token Expiry', () => {
    it('should set expiry based on minutes parameter', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const token = await generateDownloadToken(123, 456, 'https://example.com/file.pdf', 60);
      const payload = await verifyDownloadToken(token);

      // exp should be roughly 60 minutes from now (with some tolerance)
      const expectedExp = Math.floor(now / 1000) + 60 * 60;
      expect(payload!.exp).toBeGreaterThanOrEqual(expectedExp - 5);
      expect(payload!.exp).toBeLessThanOrEqual(expectedExp + 5);

      vi.useRealTimers();
    });
  });
});

import { SignJWT, jwtVerify } from 'jose';

/**
 * Signed URL Utility
 *
 * Generates time-limited, signed tokens for secure file downloads.
 * Since Vercel Blob doesn't support native signed URLs, we create
 * JWT tokens that encode the file info and expiry.
 */

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

type DownloadTokenPayload = {
  orderId: number;
  userId: number;
  fileUrl: string;
  exp: number;
};

/**
 * Generate a signed download token for a file
 * @param orderId - The order ID
 * @param userId - The user ID who owns the order
 * @param fileUrl - The actual Blob URL
 * @param expiresInMinutes - How long the token is valid (default: 60 minutes)
 */
export async function generateDownloadToken(
  orderId: number,
  userId: number,
  fileUrl: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  const token = await new SignJWT({
    orderId,
    userId,
    fileUrl,
    exp: expiresAt
  } as DownloadTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);

  return token;
}

/**
 * Verify a download token and return the payload
 * @param token - The signed token to verify
 * @returns The payload if valid, null if invalid/expired
 */
export async function verifyDownloadToken(
  token: string
): Promise<DownloadTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256']
    });

    return payload as unknown as DownloadTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Generate a complete signed download URL
 * @param baseUrl - The base URL of the application
 * @param orderId - The order ID
 * @param userId - The user ID
 * @param fileUrl - The actual Blob URL
 * @param expiresInMinutes - Token validity in minutes
 */
export async function generateSignedDownloadUrl(
  baseUrl: string,
  orderId: number,
  userId: number,
  fileUrl: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const token = await generateDownloadToken(orderId, userId, fileUrl, expiresInMinutes);
  return `${baseUrl}/api/orders/${orderId}/download?token=${encodeURIComponent(token)}`;
}

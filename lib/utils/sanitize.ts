/**
 * PII Sanitization Utilities
 *
 * Use these functions to mask sensitive data before logging.
 * This helps prevent accidental PII exposure in logs.
 */

/**
 * Mask an email address, showing only the first 2 characters and domain
 * Example: "john.doe@example.com" -> "jo***@example.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '[invalid-email]';

  const [local, domain] = email.split('@');
  if (!domain) return '[invalid-email]';

  const visibleChars = Math.min(2, local.length);
  const maskedLocal = local.slice(0, visibleChars) + '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask a phone number, showing only the last 4 digits
 * Example: "+49 123 456 7890" -> "***7890"
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '[invalid-phone]';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';

  return `***${digits.slice(-4)}`;
}

/**
 * Mask a name, showing only the first character
 * Example: "John Doe" -> "J*** D***"
 */
export function maskName(name: string): string {
  if (!name || typeof name !== 'string') return '[invalid-name]';

  return name
    .split(' ')
    .map(part => (part.length > 0 ? part[0] + '***' : ''))
    .join(' ');
}

/**
 * Completely mask a sensitive value
 * Example: "secret123" -> "[REDACTED]"
 */
export function redact(_value: unknown): string {
  return '[REDACTED]';
}

/**
 * Mask a token, showing only the first and last 4 characters
 * Example: "abc123def456ghi789" -> "abc1...i789"
 */
export function maskToken(token: string): string {
  if (!token || typeof token !== 'string') return '[invalid-token]';

  if (token.length <= 8) return '[REDACTED]';

  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Mask an IP address, hiding the last octet
 * Example: "192.168.1.100" -> "192.168.1.***"
 */
export function maskIp(ip: string): string {
  if (!ip || typeof ip !== 'string') return '[invalid-ip]';

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
  }

  // IPv6 - just show first 4 chars
  if (ip.includes(':')) {
    return `${ip.slice(0, 4)}:***`;
  }

  return '[invalid-ip]';
}

/**
 * Sanitize an object for logging, masking common PII fields
 */
export function sanitizeForLogging<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();

    // Skip null/undefined
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    // Completely redact sensitive fields
    if (
      keyLower.includes('password') ||
      keyLower.includes('secret') ||
      keyLower.includes('token') ||
      keyLower.includes('key') ||
      keyLower.includes('auth') ||
      keyLower.includes('credential') ||
      keyLower.includes('creditcard') ||
      keyLower.includes('cvv') ||
      keyLower.includes('ssn')
    ) {
      sanitized[key] = redact(value);
      continue;
    }

    // Mask email fields
    if (keyLower.includes('email') && typeof value === 'string') {
      sanitized[key] = maskEmail(value);
      continue;
    }

    // Mask phone fields
    if ((keyLower.includes('phone') || keyLower.includes('mobile') || keyLower.includes('tel')) && typeof value === 'string') {
      sanitized[key] = maskPhone(value);
      continue;
    }

    // Mask name fields
    if ((keyLower === 'name' || keyLower.includes('firstname') || keyLower.includes('lastname')) && typeof value === 'string') {
      sanitized[key] = maskName(value);
      continue;
    }

    // Mask IP addresses
    if ((keyLower.includes('ip') || keyLower === 'ipaddress') && typeof value === 'string') {
      sanitized[key] = maskIp(value);
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForLogging(value as Record<string, unknown>);
      continue;
    }

    // Arrays - sanitize each element if it's an object
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizeForLogging(item as Record<string, unknown>)
          : item
      );
      continue;
    }

    // Default: keep as-is
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Create a safe logger that automatically sanitizes PII
 */
export function createSafeLogger(prefix: string = '') {
  const formatPrefix = prefix ? `[${prefix}] ` : '';

  return {
    info: (message: string, data?: Record<string, unknown>) => {
      console.log(`${formatPrefix}${message}`, data ? sanitizeForLogging(data) : '');
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      console.warn(`${formatPrefix}${message}`, data ? sanitizeForLogging(data) : '');
    },
    error: (message: string, data?: Record<string, unknown>) => {
      console.error(`${formatPrefix}${message}`, data ? sanitizeForLogging(data) : '');
    },
    debug: (message: string, data?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`${formatPrefix}${message}`, data ? sanitizeForLogging(data) : '');
      }
    }
  };
}

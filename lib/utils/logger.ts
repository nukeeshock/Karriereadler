/**
 * Structured Logger with Context
 *
 * Provides structured logging with automatic PII sanitization,
 * context tracking, and consistent formatting.
 */

import { sanitizeForLogging } from './sanitize';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = {
  requestId?: string;
  userId?: number;
  orderId?: number;
  action?: string;
  [key: string]: unknown;
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    name: string;
    stack?: string;
  };
};

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Format a log entry as JSON for structured logging
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Create a logger instance with shared context
 */
export function createLogger(baseContext: LogContext = {}) {
  const context = { ...baseContext };

  const log = (level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: Object.keys(context).length > 0 ? context : undefined,
      data: data ? sanitizeForLogging(data) : undefined,
      error: error
        ? {
            message: error.message,
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        : undefined
    };

    const formatted = formatLogEntry(entry);

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formatted);
        }
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };

  return {
    /**
     * Add context to this logger instance
     */
    withContext(additionalContext: LogContext) {
      return createLogger({ ...context, ...additionalContext });
    },

    /**
     * Debug level log (only in development)
     */
    debug(message: string, data?: Record<string, unknown>) {
      log('debug', message, data);
    },

    /**
     * Info level log
     */
    info(message: string, data?: Record<string, unknown>) {
      log('info', message, data);
    },

    /**
     * Warning level log
     */
    warn(message: string, data?: Record<string, unknown>) {
      log('warn', message, data);
    },

    /**
     * Error level log
     */
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
      const err = error instanceof Error ? error : undefined;
      log('error', message, data, err);
    },

    /**
     * Log the start of an operation (returns a function to log completion)
     */
    startOperation(operationName: string, data?: Record<string, unknown>) {
      const startTime = Date.now();
      log('info', `${operationName} started`, data);

      return {
        success: (resultData?: Record<string, unknown>) => {
          const duration = Date.now() - startTime;
          log('info', `${operationName} completed`, { ...resultData, durationMs: duration });
        },
        failure: (error: Error | unknown, resultData?: Record<string, unknown>) => {
          const duration = Date.now() - startTime;
          const err = error instanceof Error ? error : undefined;
          log('error', `${operationName} failed`, { ...resultData, durationMs: duration }, err);
        }
      };
    }
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Create a logger for API route handlers
 */
export function createApiLogger(routeName: string, requestId?: string) {
  return createLogger({
    requestId: requestId || generateRequestId(),
    action: routeName
  });
}

/**
 * Create a logger for server actions
 */
export function createActionLogger(actionName: string, userId?: number) {
  return createLogger({
    requestId: generateRequestId(),
    action: actionName,
    userId
  });
}

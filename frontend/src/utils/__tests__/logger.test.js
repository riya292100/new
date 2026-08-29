import { describe, it, expect, vi } from 'vitest';
import { createLogger, logger, sanitizeContext, formatLog } from '../logger';

describe('Structured Frontend Logger', () => {
  it('formats and outputs info logs with structured module, level, message, and context', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const customLogger = createLogger('OrderFlow');

    const payload = customLogger.info('Cart checkout initialized', { cartId: 101 });

    expect(payload).toBeDefined();
    expect(payload.level).toBe('info');
    expect(payload.module).toBe('OrderFlow');
    expect(payload.message).toBe('Cart checkout initialized');
    expect(payload.context).toEqual({ cartId: 101 });
    expect(payload.timestamp).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles error logs with Error instances and context properly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customLogger = createLogger('AuthService');
    const err = new Error('Invalid token signature');

    const payload = customLogger.error('Authentication failure', err, { userId: 42 });

    expect(payload).toBeDefined();
    expect(payload.level).toBe('error');
    expect(payload.module).toBe('AuthService');
    expect(payload.context.error.errorMessage).toBe('Invalid token signature');
    expect(payload.context.userId).toBe(42);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('automatically redacts sensitive keys such as passwords, tokens, secrets, and card numbers', () => {
    const rawData = {
      user: 'john_doe',
      password: 'SuperSecretPassword123!',
      token: 'jwt.token.here',
      creditCard: '4111-2222-3333-4444',
      nested: {
        apiKey: 'secret-api-key',
        safeProperty: 'public_value',
      },
    };

    const sanitized = sanitizeContext(rawData);

    expect(sanitized.user).toBe('john_doe');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.creditCard).toBe('[REDACTED]');
    expect(sanitized.nested.apiKey).toBe('[REDACTED]');
    expect(sanitized.nested.safeProperty).toBe('public_value');
  });

  it('handles circular references in context gracefully', () => {
    const circularObj = { name: 'test' };
    circularObj.self = circularObj;

    const sanitized = sanitizeContext(circularObj);
    expect(sanitized.name).toBe('test');
    expect(sanitized.self).toBe('[Circular]');
  });

  it('supports direct logger methods with module names or direct messages', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const warnPayload = logger.warn('ProductDetailModal', 'Failed to fetch recommendations', {
      id: 10,
    });
    expect(warnPayload.level).toBe('warn');
    expect(warnPayload.module).toBe('ProductDetailModal');
    expect(warnPayload.message).toBe('Failed to fetch recommendations');

    const debugPayload = logger.debug('Telemetry', 'GPS updated', { lat: 12.93, lng: 77.62 });
    expect(debugPayload.level).toBe('debug');
    expect(debugPayload.module).toBe('Telemetry');

    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('provides a default logger instance with all methods', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});

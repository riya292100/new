import { describe, it, expect, vi } from 'vitest';
import { createLogger, logger } from '../logger';

describe('Structured Frontend Logger', () => {
  it('formats and outputs info logs with context', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const customLogger = createLogger('OrderFlow');

    const payload = customLogger.info('Cart checkout initialized', { cartId: 101 });

    expect(payload).toBeDefined();
    expect(payload.level).toBe('INFO');
    expect(payload.context).toBe('OrderFlow');
    expect(payload.message).toBe('Cart checkout initialized');
    expect(payload.meta).toEqual({ cartId: 101 });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles error logs with Error instances properly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customLogger = createLogger('AuthService');
    const err = new Error('Invalid token signature');

    const payload = customLogger.error('Authentication failure', err, { userId: 42 });

    expect(payload).toBeDefined();
    expect(payload.level).toBe('ERROR');
    expect(payload.meta.errorMessage).toBe('Invalid token signature');
    expect(payload.meta.userId).toBe(42);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('provides a default logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger from '../logger';

describe('Structured Logger Utility', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats and outputs warn logs with context and timestamp', () => {
    const log = logger.warn('OrderTracking', 'Polling fallback triggered', { orderId: 101 });
    expect(log).toBeDefined();
    expect(log.level).toBe('WARN');
    expect(log.context).toBe('OrderTracking');
    expect(log.message).toBe('Polling fallback triggered');
    expect(log.metadata).toEqual({ orderId: 101 });
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('formats and outputs error logs with error object stack and message', () => {
    const sampleError = new Error('Network timeout');
    const log = logger.error('AuthService', 'Failed to authenticate user', sampleError);

    expect(log).toBeDefined();
    expect(log.level).toBe('ERROR');
    expect(log.context).toBe('AuthService');
    expect(log.message).toBe('Failed to authenticate user');
    expect(log.metadata.message).toBe('Network timeout');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

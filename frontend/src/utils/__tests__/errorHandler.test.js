import { describe, it, expect, vi } from 'vitest';
import {
  ErrorCategory,
  generateErrorId,
  normalizeError,
  handleError,
  withRetry,
} from '../errorHandler.js';

describe('errorHandler Utility Suite', () => {
  it('generates a formatted error ID', () => {
    const id = generateErrorId();
    expect(id).toMatch(/^ERR-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('normalizes 400 validation errors', () => {
    const error = { status: 400, message: 'Invalid product quantity' };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.VALIDATION);
    expect(normalized.status).toBe(400);
    expect(normalized.userMessage).toBe('Invalid product quantity');
  });

  it('normalizes 401 authentication errors', () => {
    const error = { response: { status: 401, data: { message: 'Token expired' } } };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(normalized.userMessage).toBe('Your session has expired. Please sign in again.');
  });

  it('normalizes 403 authorization errors', () => {
    const error = { status: 403 };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.AUTHORIZATION);
    expect(normalized.userMessage).toBe('You do not have permission to perform this action.');
  });

  it('normalizes 404 not found errors', () => {
    const error = { response: { status: 404, data: { message: 'Product not found' } } };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.NOT_FOUND);
    expect(normalized.userMessage).toBe('Product not found');
  });

  it('normalizes 500 server errors', () => {
    const error = { status: 500, message: 'Internal DB timeout' };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.SERVER);
    expect(normalized.userMessage).toBe(
      'Our servers are experiencing issues. Please try again shortly.'
    );
  });

  it('normalizes network connectivity errors', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' };
    const normalized = normalizeError(error);

    expect(normalized.category).toBe(ErrorCategory.NETWORK);
    expect(normalized.userMessage).toBe(
      'Unable to connect. Please check your internet connection.'
    );
  });

  it('handles and logs error correctly', () => {
    const error = new Error('Random failure');
    const handled = handleError(error, 'TestComponent', { orderId: 101 });

    expect(handled.rawMessage).toBe('Random failure');
    expect(handled.context.orderId).toBe(101);
  });

  it('withRetry resolves successfully on initial attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('withRetry retries on transient errors and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Transient 503'))
      .mockResolvedValueOnce('recovered');

    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('withRetry does not retry 4xx client errors', async () => {
    const clientErr = { status: 400, message: 'Bad request' };
    const fn = vi.fn().mockRejectedValue(clientErr);

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })).rejects.toEqual(clientErr);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

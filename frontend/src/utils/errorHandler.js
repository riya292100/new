/**
 * Centralized Enterprise Error Handler for QuickCart.
 * Provides error normalization, category detection, user-friendly messages,
 * structured logging, correlation IDs, and retry utilities for idempotent requests.
 */

import { logger } from './logger.js';

export const ErrorCategory = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Generate a unique client-side error correlation ID if none is supplied.
 */
export function generateErrorId() {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Normalizes an unknown error into a structured QuickCartError object.
 *
 * @param {Error|Object|string} error - The caught error
 * @param {Object} [context={}] - Optional metadata/context
 * @returns {Object} Normalized error details
 */
export function normalizeError(error, context = {}) {
  const errorId = error?.response?.data?.correlationId || error?.correlationId || generateErrorId();
  let status = error?.status || error?.response?.status || 0;
  let rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    String(error);
  let category = ErrorCategory.UNKNOWN;
  let userMessage = 'An unexpected error occurred. Please try again.';

  if (status === 400) {
    category = ErrorCategory.VALIDATION;
    userMessage = rawMessage || 'Please check your input and try again.';
  } else if (status === 401) {
    category = ErrorCategory.AUTHENTICATION;
    userMessage = 'Your session has expired. Please sign in again.';
  } else if (status === 403) {
    category = ErrorCategory.AUTHORIZATION;
    userMessage = 'You do not have permission to perform this action.';
  } else if (status === 404) {
    category = ErrorCategory.NOT_FOUND;
    userMessage = rawMessage || 'The requested resource could not be found.';
  } else if (status >= 500) {
    category = ErrorCategory.SERVER;
    userMessage = 'Our servers are experiencing issues. Please try again shortly.';
  } else if (
    !status &&
    (error?.code === 'ERR_NETWORK' ||
      !navigator.onLine ||
      error?.message?.includes?.('Network Error'))
  ) {
    category = ErrorCategory.NETWORK;
    userMessage = 'Unable to connect. Please check your internet connection.';
  } else {
    category = ErrorCategory.CLIENT;
    userMessage = rawMessage || userMessage;
  }

  return {
    id: errorId,
    category,
    status,
    rawMessage,
    userMessage,
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handles an error by logging it and returning a normalized payload.
 *
 * @param {Error|Object|string} error - Caught error
 * @param {string} [source='Application'] - Identifier of component/service
 * @param {Object} [context={}] - Additional context
 * @returns {Object} Normalized error
 */
export function handleError(error, source = 'Application', context = {}) {
  const normalized = normalizeError(error, context);

  logger.error(
    `[${source}] ${normalized.category} error (${normalized.id}): ${normalized.rawMessage}`,
    {
      ...context,
      errorId: normalized.id,
      status: normalized.status,
      category: normalized.category,
    }
  );

  return normalized;
}

/**
 * Executes an async operation with automatic exponential-backoff retry for retryable errors.
 *
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} [options={}] - Retry options
 * @param {number} [options.maxRetries=2] - Number of retry attempts
 * @param {number} [options.baseDelayMs=300] - Initial delay before retry
 * @param {string} [options.source='Operation'] - Context name
 * @returns {Promise<*>} Result of asyncFn
 */
export async function withRetry(asyncFn, options = {}) {
  const { maxRetries = 2, baseDelayMs = 300, source = 'Operation' } = options;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.response?.status;
      // Do not retry 4xx errors (client faults, invalid requests)
      if (status >= 400 && status < 500) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        logger.warn(
          `[${source}] Retrying operation (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default {
  ErrorCategory,
  generateErrorId,
  normalizeError,
  handleError,
  withRetry,
};

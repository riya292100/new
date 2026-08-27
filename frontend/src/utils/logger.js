/**
 * Structured Frontend Logger
 * Provides ISO timestamping, log levels, correlation IDs, and contextual metadata.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL =
  typeof window !== 'undefined' && window.__LOG_LEVEL__
    ? (LOG_LEVELS[window.__LOG_LEVEL__] ?? LOG_LEVELS.DEBUG)
    : LOG_LEVELS.DEBUG;

const formatLog = (level, context, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    context,
    message,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
};

export const createLogger = (context = 'App') => {
  return {
    debug: (message, meta) => {
      if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
        const payload = formatLog('DEBUG', context, message, meta);
        console.debug(`[${payload.timestamp}] [DEBUG] [${context}]:`, message, meta || '');
        return payload;
      }
      return null;
    },
    info: (message, meta) => {
      if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
        const payload = formatLog('INFO', context, message, meta);
        console.info(`[${payload.timestamp}] [INFO] [${context}]:`, message, meta || '');
        return payload;
      }
      return null;
    },
    warn: (message, meta) => {
      if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
        const payload = formatLog('WARN', context, message, meta);
        console.warn(`[${payload.timestamp}] [WARN] [${context}]:`, message, meta || '');
        return payload;
      }
      return null;
    },
    error: (message, error, meta = {}) => {
      if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
        const errorMeta =
          error instanceof Error
            ? { errorMessage: error.message, stack: error.stack, ...meta }
            : { rawError: error, ...meta };
        const payload = formatLog('ERROR', context, message, errorMeta);
        console.error(`[${payload.timestamp}] [ERROR] [${context}]:`, message, error, meta || '');
        return payload;
      }
      return null;
    },
  };
};

export const logger = createLogger('QuickCart');
export default logger;

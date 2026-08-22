/**
 * QuickCart Structured Client Logger
 * Provides level-based logging with context tagging, timestamping, and structured metadata.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Current active level based on environment
const currentLevel =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
    ? LOG_LEVELS.WARN
    : LOG_LEVELS.DEBUG;

const formatLog = (level, context, message, meta) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    context: context || 'QuickCartApp',
    message,
    ...(meta ? { metadata: meta } : {}),
  };
};

export const logger = {
  debug(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      const log = formatLog('DEBUG', context, message, meta);
      console.debug(`[${log.timestamp}] [DEBUG] [${log.context}]:`, log.message, meta || '');
      return log;
    }
    return null;
  },

  info(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      const log = formatLog('INFO', context, message, meta);
      console.info(`[${log.timestamp}] [INFO] [${log.context}]:`, log.message, meta || '');
      return log;
    }
    return null;
  },

  warn(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      const log = formatLog('WARN', context, message, meta);
      console.warn(`[${log.timestamp}] [WARN] [${log.context}]:`, log.message, meta || '');
      return log;
    }
    return null;
  },

  error(context, message, errorOrMeta) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const isError = errorOrMeta instanceof Error;
      const meta = isError
        ? { name: errorOrMeta.name, message: errorOrMeta.message, stack: errorOrMeta.stack }
        : errorOrMeta;

      const log = formatLog('ERROR', context, message, meta);
      console.error(`[${log.timestamp}] [ERROR] [${log.context}]:`, log.message, meta || '');
      return log;
    }
    return null;
  },
};

export default logger;

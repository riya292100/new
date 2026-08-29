/**
 * Centralized Structured Frontend Logger
 * Outputs structured JSON logs: { timestamp, level, module, message, context }
 * Automatically sanitizes and redacts sensitive credentials, tokens, and payment data.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'token',
  'jwt',
  'quickcart_token',
  'authorization',
  'auth',
  'secret',
  'jwtsecret',
  'apikey',
  'api_key',
  'creditcard',
  'cardnumber',
  'cvv',
  'pin',
  'ssn',
  'privatekey',
]);

/**
 * Recursively sanitize objects and redact sensitive fields
 * @param {*} data
 * @param {WeakSet} seen
 * @returns {*}
 */
export const sanitizeContext = (data, seen = new WeakSet()) => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  // Prevent circular references
  if (seen.has(data)) return '[Circular]';
  seen.add(data);

  if (data instanceof Error) {
    return {
      name: data.name,
      errorName: data.name,
      message: data.message,
      errorMessage: data.message,
      stack: data.stack,
    };
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(normalizedKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value, seen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const getCurrentLogLevel = () => {
  if (typeof window !== 'undefined' && window.__LOG_LEVEL__) {
    const configured = String(window.__LOG_LEVEL__).toLowerCase();
    if (configured in LOG_LEVELS) return LOG_LEVELS[configured];
  }
  return LOG_LEVELS.debug;
};

/**
 * Format structured log payload
 */
export const formatLog = (level, moduleName, message, rawContext = {}) => {
  let contextObj = {};
  if (rawContext instanceof Error) {
    contextObj = {
      errorMessage: rawContext.message,
      errorName: rawContext.name,
      stack: rawContext.stack,
    };
  } else if (typeof rawContext === 'object' && rawContext !== null) {
    contextObj = rawContext;
  } else if (rawContext !== undefined) {
    contextObj = { value: rawContext };
  }

  return {
    timestamp: new Date().toISOString(),
    level: level.toLowerCase(),
    module: moduleName || 'QuickCart',
    message: String(message || ''),
    context: sanitizeContext(contextObj),
  };
};

const parseLogArgs = (defaultModule, arg1, arg2, arg3) => {
  let moduleName = defaultModule;
  let message = '';
  let context = {};

  if (arg3 !== undefined) {
    // Called as (module, message, context)
    moduleName = arg1 || defaultModule;
    message = arg2;
    context = arg3;
  } else if (arg2 !== undefined) {
    // Could be (module, message) or (message, context/error)
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      moduleName = arg1;
      message = arg2;
    } else {
      message = arg1;
      context = arg2;
    }
  } else {
    // Called as (message)
    message = arg1;
  }

  return { moduleName, message, context };
};

/**
 * Factory to create module-specific structured loggers
 * @param {string} moduleName
 */
export const createLogger = (moduleName = 'QuickCart') => {
  return {
    debug: (arg1, arg2, arg3) => {
      const minLevel = getCurrentLogLevel();
      if (minLevel <= LOG_LEVELS.debug) {
        const { moduleName: mod, message, context } = parseLogArgs(moduleName, arg1, arg2, arg3);
        const payload = formatLog('debug', mod, message, context);
        console.debug(
          `[${payload.timestamp}] [DEBUG] [${payload.module}]:`,
          payload.message,
          payload.context
        );
        return payload;
      }
      return null;
    },
    info: (arg1, arg2, arg3) => {
      const minLevel = getCurrentLogLevel();
      if (minLevel <= LOG_LEVELS.info) {
        const { moduleName: mod, message, context } = parseLogArgs(moduleName, arg1, arg2, arg3);
        const payload = formatLog('info', mod, message, context);
        console.info(
          `[${payload.timestamp}] [INFO] [${payload.module}]:`,
          payload.message,
          payload.context
        );
        return payload;
      }
      return null;
    },
    warn: (arg1, arg2, arg3) => {
      const minLevel = getCurrentLogLevel();
      if (minLevel <= LOG_LEVELS.warn) {
        const { moduleName: mod, message, context } = parseLogArgs(moduleName, arg1, arg2, arg3);
        const payload = formatLog('warn', mod, message, context);
        console.warn(
          `[${payload.timestamp}] [WARN] [${payload.module}]:`,
          payload.message,
          payload.context
        );
        return payload;
      }
      return null;
    },
    error: (arg1, arg2, arg3, arg4) => {
      const minLevel = getCurrentLogLevel();
      if (minLevel <= LOG_LEVELS.error) {
        let mod = moduleName;
        let message = '';
        let context = {};

        if (arg4 !== undefined) {
          mod = arg1;
          message = arg2;
          context = { error: arg3, ...arg4 };
        } else if (arg3 !== undefined) {
          if (typeof arg1 === 'string' && (typeof arg2 === 'string' || typeof arg2 === 'number')) {
            mod = arg1;
            message = arg2;
            context = arg3;
          } else {
            message = arg1;
            context = { error: arg2, ...(typeof arg3 === 'object' ? arg3 : { extra: arg3 }) };
          }
        } else if (arg2 !== undefined) {
          if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            mod = arg1;
            message = arg2;
          } else {
            message = arg1;
            context = arg2;
          }
        } else {
          message = arg1;
        }

        const payload = formatLog('error', mod, message, context);
        console.error(
          `[${payload.timestamp}] [ERROR] [${payload.module}]:`,
          payload.message,
          payload.context
        );
        return payload;
      }
      return null;
    },
  };
};

export const logger = createLogger('QuickCart');
export default logger;

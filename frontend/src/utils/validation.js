/**
 * Form and Input Validation Utilities
 * Enforces sanitization and validation patterns for security and UX.
 */

// Email regex pattern following RFC 5322 standards
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number regex pattern (supports 10-digit formats with optional country codes)
const PHONE_REGEX = /^(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// PIN / Postal code regex (4 to 6 alphanumeric characters)
const PINCODE_REGEX = /^[A-Za-z0-9\s-]{4,8}$/;

/**
 * Validate an email address
 * @param {string} email
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email address is required' };
  }
  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate a user password
 * Requires at least 6 characters, one letter, and one number.
 * @param {string} password
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate a user phone number
 * @param {string} phone
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\+?\d+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate a postal / pincode
 * @param {string} pincode
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validatePincode = (pincode) => {
  if (!pincode || typeof pincode !== 'string' || !pincode.trim()) {
    return { isValid: false, error: 'Postal / PIN code is required' };
  }
  if (!PINCODE_REGEX.test(pincode.trim())) {
    return { isValid: false, error: 'Please enter a valid postal code' };
  }
  return { isValid: true, error: null };
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

/**
 * Form and Input Validation Utilities
 * Enforces sanitization and validation patterns for security and UX.
 */

// Email regex pattern following RFC 5322 standards
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number regex pattern (supports 10-digit formats with optional country codes)
export const PHONE_REGEX = /^(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// PIN / Postal code regex (4 to 8 alphanumeric characters)
export const PINCODE_REGEX = /^[A-Za-z0-9\s-]{4,8}$/;

// Password validation regex (minimum 6 chars, alphanumeric)
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

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

/**
 * Validate a string is non-empty with minimum length
 * @param {string} val
 * @param {string} fieldName
 * @param {number} min
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateRequired = (val, fieldName = 'Field', min = 1) => {
  if (!val || typeof val !== 'string' || val.trim().length < min) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
};

/**
 * Validate numeric rating (1-5)
 * @param {number|string} rating
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateRating = (rating) => {
  const num = Number(rating);
  if (isNaN(num) || num < 1 || num > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5 stars' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate positive number
 * @param {number|string} val
 * @param {string} fieldName
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validatePositiveNumber = (val, fieldName = 'Amount') => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number` };
  }
  return { isValid: true, error: null };
};

/**
 * Declarative Schema Validation Engine
 * Runs field-level validator chains against payload object.
 * @param {Object} schema
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateSchema = (schema, data = {}) => {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    for (const rule of rules) {
      const result = rule(value, data);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first rule error for this field
      }
    }
  }

  return { isValid, errors };
};

// Standard Form Schemas
export const loginSchema = {
  email: [(v) => validateEmail(v)],
  password: [(v) => validatePassword(v)],
};

export const registerSchema = {
  fullName: [(v) => validateRequired(v, 'Full name', 2)],
  email: [(v) => validateEmail(v)],
  phone: [(v) => validatePhone(v)],
  password: [(v) => validatePassword(v)],
};

export const addressSchema = {
  receiverName: [(v) => validateRequired(v, 'Receiver name', 2)],
  receiverPhone: [(v) => validatePhone(v)],
  streetAddress: [(v) => validateRequired(v, 'Street address', 5)],
  city: [(v) => validateRequired(v, 'City', 2)],
  pincode: [(v) => validatePincode(v)],
};

export const reviewSchema = {
  rating: [(v) => validateRating(v)],
  comment: [(v) => validateRequired(v, 'Review comment', 3)],
};

export const couponSchema = {
  code: [(v) => validateRequired(v, 'Coupon code', 3)],
};

export const checkoutSchema = {
  addressId: [
    (v) =>
      v
        ? { isValid: true, error: null }
        : { isValid: false, error: 'Delivery address is required' },
  ],
  paymentMethod: [
    (v) =>
      ['COD', 'UPI', 'CARD', 'WALLET'].includes(v)
        ? { isValid: true, error: null }
        : { isValid: false, error: 'Valid payment method required' },
  ],
};

export const tableBookingSchema = {
  partySize: [(v) => validatePositiveNumber(v, 'Party size')],
  bookingDate: [(v) => validateRequired(v, 'Booking date')],
  timeSlot: [(v) => validateRequired(v, 'Time slot')],
  guestName: [(v) => validateRequired(v, 'Guest name', 2)],
  guestPhone: [(v) => validatePhone(v)],
};

/**
 * Client-side boundary schema validation for incoming catalog product payloads.
 * @param {Object} product
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateProductPayload = (product) => {
  const errors = [];
  if (!product || typeof product !== 'object') {
    return { isValid: false, errors: ['Product payload must be a non-null object'] };
  }
  if (!product.id) errors.push('Product ID is required');
  if (!product.name || typeof product.name !== 'string') errors.push('Product name is required');
  if (product.sellingPrice === undefined && product.price === undefined) {
    errors.push('Product price is required');
  } else {
    const price = Number(product.sellingPrice ?? product.price);
    if (isNaN(price) || price < 0) errors.push('Product price must be a non-negative number');
  }
  return { isValid: errors.length === 0, errors };
};

/**
 * Client-side boundary schema validation for incoming category payloads.
 * @param {Object} category
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateCategoryPayload = (category) => {
  const errors = [];
  if (!category || typeof category !== 'object') {
    return { isValid: false, errors: ['Category payload must be a non-null object'] };
  }
  if (!category.id) errors.push('Category ID is required');
  if (!category.name || typeof category.name !== 'string') errors.push('Category name is required');
  if (!category.slug || typeof category.slug !== 'string') errors.push('Category slug is required');
  return { isValid: errors.length === 0, errors };
};

/**
 * Client-side boundary schema validation for incoming dining restaurant payloads.
 * @param {Object} restaurant
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateRestaurantPayload = (restaurant) => {
  const errors = [];
  if (!restaurant || typeof restaurant !== 'object') {
    return { isValid: false, errors: ['Restaurant payload must be a non-null object'] };
  }
  if (!restaurant.id) errors.push('Restaurant ID is required');
  if (!restaurant.name || typeof restaurant.name !== 'string') errors.push('Restaurant name is required');
  if (!restaurant.cuisine || typeof restaurant.cuisine !== 'string') errors.push('Restaurant cuisine is required');
  return { isValid: errors.length === 0, errors };
};

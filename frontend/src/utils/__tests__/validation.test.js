import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validatePincode,
  sanitizeInput,
  validateSchema,
  loginSchema,
  registerSchema,
  addressSchema,
  reviewSchema,
  checkoutSchema,
} from '../validation';

describe('Validation Utility Suite', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('customer@quickcart.com').isValid).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('invalid-email').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6 or more characters', () => {
      expect(validatePassword('Pass123').isValid).toBe(true);
      expect(validatePassword('secret12345').isValid).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      expect(validatePassword('12345').isValid).toBe(false);
      expect(validatePassword('').isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid 10-digit phone numbers', () => {
      expect(validatePhone('9876543210').isValid).toBe(true);
      expect(validatePhone('+91 98765 43210').isValid).toBe(true);
      expect(validatePhone('(555) 123-4567').isValid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123').isValid).toBe(false);
      expect(validatePhone('abcdefghij').isValid).toBe(false);
      expect(validatePhone('').isValid).toBe(false);
    });
  });

  describe('validatePincode', () => {
    it('should accept valid postal codes', () => {
      expect(validatePincode('110001').isValid).toBe(true);
      expect(validatePincode('90210').isValid).toBe(true);
      expect(validatePincode('SW1A 1AA').isValid).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(validatePincode('12').isValid).toBe(false);
      expect(validatePincode('').isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML/XSS characters', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });
  });

  describe('validateSchema Engine', () => {
    it('validates login schema correctly', () => {
      const valid = { email: 'user@quickcart.com', password: 'password123' };
      expect(validateSchema(loginSchema, valid).isValid).toBe(true);

      const invalid = { email: 'bad-email', password: '123' };
      const res = validateSchema(loginSchema, invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.email).toBeDefined();
      expect(res.errors.password).toBeDefined();
    });

    it('validates register schema correctly', () => {
      const valid = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'securePassword1',
      };
      expect(validateSchema(registerSchema, valid).isValid).toBe(true);

      const invalid = { fullName: '', email: '', phone: '', password: '' };
      const res = validateSchema(registerSchema, invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.fullName).toBeDefined();
    });

    it('validates address schema correctly', () => {
      const valid = {
        label: 'Home',
        streetAddress: '123 MG Road, Apt 4B',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      };
      expect(validateSchema(addressSchema, valid).isValid).toBe(true);

      const invalid = { label: '', streetAddress: '12', city: '', state: '', pincode: 'abc' };
      const res = validateSchema(addressSchema, invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.label).toBeDefined();
      expect(res.errors.streetAddress).toBeDefined();
    });

    it('validates review schema correctly', () => {
      expect(validateSchema(reviewSchema, { rating: 5, comment: 'Great product!' }).isValid).toBe(
        true
      );
      expect(validateSchema(reviewSchema, { rating: 0, comment: '' }).isValid).toBe(false);
    });

    it('validates checkout schema correctly', () => {
      expect(validateSchema(checkoutSchema, { addressId: 1, paymentMethod: 'UPI' }).isValid).toBe(
        true
      );
      expect(
        validateSchema(checkoutSchema, { addressId: null, paymentMethod: 'INVALID' }).isValid
      ).toBe(false);
    });
  });

  describe('Regex Pattern Exports', () => {
    it('matches valid patterns with exported regex constants', async () => {
      const { EMAIL_REGEX, PHONE_REGEX, PINCODE_REGEX, PASSWORD_REGEX } =
        await import('../validation');
      expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
      expect(PHONE_REGEX.test('9876543210')).toBe(true);
      expect(PINCODE_REGEX.test('110001')).toBe(true);
      expect(PASSWORD_REGEX.test('Secret123')).toBe(true);
    });
  });
});

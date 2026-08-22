import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validatePhone, validatePincode, sanitizeInput } from '../validation';

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
});

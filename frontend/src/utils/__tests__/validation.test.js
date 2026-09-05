import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validatePincode,
  validateRequired,
  validateRating,
  validatePositiveNumber,
  sanitizeInput,
  validateSchema,
  loginSchema,
  registerSchema,
  addressSchema,
  reviewSchema,
  couponSchema,
  checkoutSchema,
  tableBookingSchema,
  validateProductPayload,
  validateCategoryPayload,
  validateRestaurantPayload,
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
      expect(validateEmail(null).isValid).toBe(false);
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
      expect(validatePassword(null).isValid).toBe(false);
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
      expect(validatePhone(null).isValid).toBe(false);
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
      expect(validatePincode(null).isValid).toBe(false);
    });
  });

  describe('validateRequired and validateRating', () => {
    it('validates required fields and minimum length', () => {
      expect(validateRequired('QuickCart', 'Brand', 3).isValid).toBe(true);
      expect(validateRequired('QC', 'Brand', 3).isValid).toBe(false);
      expect(validateRequired('', 'Brand').isValid).toBe(false);
    });

    it('validates ratings in 1-5 star bounds', () => {
      expect(validateRating(5).isValid).toBe(true);
      expect(validateRating('4').isValid).toBe(true);
      expect(validateRating(0).isValid).toBe(false);
      expect(validateRating(6).isValid).toBe(false);
      expect(validateRating('invalid').isValid).toBe(false);
    });

    it('validates positive numbers', () => {
      expect(validatePositiveNumber(4, 'Party size').isValid).toBe(true);
      expect(validatePositiveNumber(0, 'Party size').isValid).toBe(false);
      expect(validatePositiveNumber(-2, 'Party size').isValid).toBe(false);
      expect(validatePositiveNumber('abc', 'Party size').isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML/XSS characters', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    it('handles non-string inputs safely', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(123)).toBe('');
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
        receiverName: 'John Doe',
        receiverPhone: '9876543210',
        streetAddress: '123 MG Road, Apt 4B',
        city: 'Bengaluru',
        pincode: '560001',
      };
      expect(validateSchema(addressSchema, valid).isValid).toBe(true);

      const invalid = {
        receiverName: '',
        receiverPhone: '12',
        streetAddress: '12',
        city: '',
        pincode: 'abc',
      };
      const res = validateSchema(addressSchema, invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.receiverName).toBeDefined();
      expect(res.errors.streetAddress).toBeDefined();
    });

    it('validates coupon schema correctly', () => {
      expect(validateSchema(couponSchema, { code: 'SAVE50' }).isValid).toBe(true);
      expect(validateSchema(couponSchema, { code: '' }).isValid).toBe(false);
    });

    it('validates table booking schema correctly', () => {
      const valid = {
        partySize: 4,
        bookingDate: '2026-09-01',
        timeSlot: '19:30',
        guestName: 'Sarah Smith',
        guestPhone: '9876543210',
      };
      expect(validateSchema(tableBookingSchema, valid).isValid).toBe(true);

      const invalid = {
        partySize: 0,
        bookingDate: '',
        timeSlot: '',
        guestName: '',
        guestPhone: '123',
      };
      const res = validateSchema(tableBookingSchema, invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.partySize).toBeDefined();
      expect(res.errors.guestName).toBeDefined();
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

  describe('Client-Side Boundary Schema Validation', () => {
    it('validates product payloads correctly', () => {
      const validProduct = { id: 101, name: 'Fresh Milk', sellingPrice: 30 };
      expect(validateProductPayload(validProduct).isValid).toBe(true);

      const invalidProduct = { name: 'No ID' };
      const res = validateProductPayload(invalidProduct);
      expect(res.isValid).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
    });

    it('validates category payloads correctly', () => {
      const validCategory = { id: 1, name: 'Fruits', slug: 'fruits' };
      expect(validateCategoryPayload(validCategory).isValid).toBe(true);

      const invalidCategory = { id: 1 };
      expect(validateCategoryPayload(invalidCategory).isValid).toBe(false);
    });

    it('validates restaurant payloads correctly', () => {
      const validRestaurant = { id: 'r1', name: 'Trattoria Roma', cuisine: 'Italian' };
      expect(validateRestaurantPayload(validRestaurant).isValid).toBe(true);

      const invalidRestaurant = { id: 'r1', name: 'Incomplete' };
      expect(validateRestaurantPayload(invalidRestaurant).isValid).toBe(false);
    });
  });
});

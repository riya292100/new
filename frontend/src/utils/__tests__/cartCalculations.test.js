import { describe, it, expect } from 'vitest';
import {
  calculateItemTotal,
  calculateDeliveryFee,
  calculateDiscount,
  calculateBillBreakdown,
  FREE_DELIVERY_THRESHOLD,
  BASE_DELIVERY_FEE,
  PLATFORM_FEE,
} from '../cartCalculations';

describe('cartCalculations Utility', () => {
  const mockItems = [
    { product: { sellingPrice: 50 }, quantity: 2 }, // 100
    { product: { sellingPrice: 30 }, quantity: 1 }, // 30
  ];

  it('calculates item subtotal correctly', () => {
    expect(calculateItemTotal(mockItems)).toBe(130);
    expect(calculateItemTotal([])).toBe(0);
  });

  it('calculates delivery fee below and above free delivery threshold', () => {
    expect(calculateDeliveryFee(100)).toBe(BASE_DELIVERY_FEE);
    expect(calculateDeliveryFee(FREE_DELIVERY_THRESHOLD)).toBe(0);
    expect(calculateDeliveryFee(300)).toBe(0);
    expect(calculateDeliveryFee(0)).toBe(0);
  });

  it('calculates percentage coupon discounts with max caps', () => {
    const coupon = {
      isValid: true,
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minOrderValue: 100,
      maxDiscountAmount: 40,
    };

    // 50% of 200 is 100, but cap is 40
    expect(calculateDiscount(200, coupon)).toBe(40);

    // Below min order value
    expect(calculateDiscount(80, coupon)).toBe(0);
  });

  it('calculates flat coupon discounts correctly', () => {
    const coupon = {
      isValid: true,
      discountType: 'FLAT',
      discountValue: 50,
      minOrderValue: 150,
    };

    expect(calculateDiscount(200, coupon)).toBe(50);
    expect(calculateDiscount(100, coupon)).toBe(0);
  });

  it('computes complete bill breakdown', () => {
    const bill = calculateBillBreakdown(mockItems, null);

    expect(bill.itemTotal).toBe(130);
    expect(bill.deliveryFee).toBe(BASE_DELIVERY_FEE);
    expect(bill.platformFee).toBe(PLATFORM_FEE);
    expect(bill.isFreeDelivery).toBe(false);
    expect(bill.amountToFreeDelivery).toBe(FREE_DELIVERY_THRESHOLD - 130);
    expect(bill.finalTotal).toBeGreaterThan(130);
  });

  it('handles empty cart breakdown', () => {
    const bill = calculateBillBreakdown([], null);
    expect(bill.itemTotal).toBe(0);
    expect(bill.deliveryFee).toBe(0);
    expect(bill.platformFee).toBe(0);
    expect(bill.tax).toBe(0);
    expect(bill.finalTotal).toBe(0);
  });
});

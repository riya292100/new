import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminCouponManager from '../AdminCouponManager';

describe('AdminCouponManager Component', () => {
  const mockSetShowCouponModal = vi.fn();
  const mockSetCouponForm = vi.fn();
  const mockOnCreateCoupon = vi.fn();

  const dummyCoupons = [
    {
      id: 1,
      code: 'QUICK100',
      description: 'Flat ₹100 Off on orders above ₹499',
      discountType: 'FLAT_AMOUNT',
      discountAmount: 100,
      minOrderAmount: 499,
      active: true,
    },
  ];

  const dummyForm = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountPercentage: 20,
    discountAmount: 0,
    minOrderAmount: 199,
    maxDiscountAmount: 100,
    expiryDate: '2026-12-31',
    active: true,
  };

  it('renders coupon list and opens creation modal on button click', () => {
    render(
      <AdminCouponManager
        coupons={dummyCoupons}
        showCouponModal={false}
        setShowCouponModal={mockSetShowCouponModal}
        couponForm={dummyForm}
        setCouponForm={mockSetCouponForm}
        onCreateCoupon={mockOnCreateCoupon}
      />
    );

    expect(screen.getByText(/Active Promo Discounts/i)).toBeInTheDocument();
    expect(screen.getByText('QUICK100')).toBeInTheDocument();

    const createBtn = screen.getByRole('button', { name: /Create Coupon/i });
    fireEvent.click(createBtn);

    expect(mockSetShowCouponModal).toHaveBeenCalledWith(true);
  });
});

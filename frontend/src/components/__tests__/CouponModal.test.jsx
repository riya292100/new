import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CouponModal from '../CouponModal';
import * as CartContextModule from '../../context/CartContext';
import { couponApi } from '../../services/api';

describe('CouponModal Component', () => {
  const mockSetCouponModalOpen = vi.fn();
  const mockApplyCoupon = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      couponModalOpen: true,
      setCouponModalOpen: mockSetCouponModalOpen,
      applyCoupon: mockApplyCoupon,
      appliedCoupon: null,
    });

    vi.spyOn(couponApi, 'getActiveCoupons').mockResolvedValue({
      data: [
        {
          id: 1,
          code: 'FRESH50',
          title: '50% Flat Discount',
          description: 'Save 50% on fresh vegetables',
          discountPercentage: 50,
          minOrderAmount: 199,
        },
      ],
    });
  });

  it('renders available promo coupons and allows custom coupon application', async () => {
    render(<CouponModal />);

    expect(screen.getByText('Apply Promo Coupon')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/ENTER PROMO CODE/i);
    fireEvent.change(input, { target: { value: 'WELCOME100' } });

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyBtn);

    expect(mockApplyCoupon).toHaveBeenCalledWith('WELCOME100');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartBillSummary from '../CartBillSummary';

describe('CartBillSummary Component', () => {
  it('renders bill details without coupon and triggers coupon modal open', () => {
    const onOpenCouponModal = vi.fn();
    const onRemoveCoupon = vi.fn();
    const cart = {
      itemTotal: 300,
      deliveryFee: 0,
      platformFee: 2,
      taxAmount: 15,
      freeDeliveryUnlocked: true,
    };

    render(
      <CartBillSummary
        cart={cart}
        appliedCoupon={null}
        onRemoveCoupon={onRemoveCoupon}
        onOpenCouponModal={onOpenCouponModal}
        finalPayableAmount={317}
      />
    );

    expect(screen.getByText('₹300')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('₹317')).toBeInTheDocument();

    const couponBtn = screen.getByRole('button', { name: /Have a coupon code\?/i });
    fireEvent.click(couponBtn);
    expect(onOpenCouponModal).toHaveBeenCalled();
  });

  it('renders applied coupon with discount and remove button', () => {
    const onRemoveCoupon = vi.fn();
    const cart = {
      itemTotal: 300,
      deliveryFee: 25,
      platformFee: 2,
      taxAmount: 15,
      freeDeliveryUnlocked: false,
    };
    const appliedCoupon = { code: 'SAVE50', discountAmount: 50 };

    render(
      <CartBillSummary
        cart={cart}
        appliedCoupon={appliedCoupon}
        onRemoveCoupon={onRemoveCoupon}
        onOpenCouponModal={vi.fn()}
        finalPayableAmount={292}
      />
    );

    expect(screen.getByText(/'SAVE50' applied \(-₹50\)/i)).toBeInTheDocument();
    expect(screen.getByText('₹292')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeBtn);
    expect(onRemoveCoupon).toHaveBeenCalled();
  });
});

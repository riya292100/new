import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckoutOrderSummary from '../CheckoutOrderSummary';

describe('CheckoutOrderSummary Component', () => {
  const mockCart = {
    totalItems: 3,
    totalPrice: 450,
    deliveryFee: 0,
    discountAmount: 50,
    finalPrice: 400,
    items: [{ id: 1 }, { id: 2 }, { id: 3 }],
  };

  it('renders order summary, applied coupon, tip selectors, and pay total', () => {
    const handlePlaceOrder = vi.fn();
    const handleSetTip = vi.fn();

    render(
      <CheckoutOrderSummary
        cart={mockCart}
        appliedCoupon={{ code: 'SAVE50' }}
        removeCoupon={vi.fn()}
        setCouponModalOpen={vi.fn()}
        selectedTip={20}
        setSelectedTip={handleSetTip}
        finalPayableAmount={400}
        placingOrder={false}
        onPlaceOrder={handlePlaceOrder}
      />
    );

    expect(screen.getByText(/Order Summary \(3 items\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Code SAVE50 Applied/i)).toBeInTheDocument();
    expect(screen.getByText(/Item Total/i)).toBeInTheDocument();
    expect(screen.getByText('₹450')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText(/Place Express Order/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Place Express Order/i));
    expect(handlePlaceOrder).toHaveBeenCalledTimes(1);
  });
});

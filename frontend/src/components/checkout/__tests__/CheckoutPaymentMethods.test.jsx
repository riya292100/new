import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckoutPaymentMethods from '../CheckoutPaymentMethods';

describe('CheckoutPaymentMethods Component', () => {
  it('renders UPI, Card, and Cash on Delivery payment options', () => {
    const handleSetPayment = vi.fn();

    render(<CheckoutPaymentMethods paymentMethod="UPI" setPaymentMethod={handleSetPayment} />);

    expect(screen.getByText(/UPI \(Instant Refund\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Credit \/ Debit Card/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cash on Delivery/i));
    expect(handleSetPayment).toHaveBeenCalledWith('CASH_ON_DELIVERY');
  });
});

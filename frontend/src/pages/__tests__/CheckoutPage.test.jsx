import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../CheckoutPage';
import * as AuthContextModule from '../../context/AuthContext';
import * as CartContextModule from '../../context/CartContext';
import * as ToastContextModule from '../../context/ToastContext';
import { addressApi } from '../../services/api';

describe('CheckoutPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      cart: {
        totalItems: 2,
        totalPrice: 250,
        discountAmount: 0,
        deliveryFee: 0,
        finalPrice: 250,
        items: [{ id: 1, productName: 'Organic Milk', quantity: 2, unitPrice: 125 }],
      },
      appliedCoupon: null,
      removeCoupon: vi.fn(),
      setCouponModalOpen: vi.fn(),
      finalPayableAmount: 250,
      clearCart: vi.fn(),
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });

    vi.spyOn(addressApi, 'getAddresses').mockResolvedValue({
      data: [
        {
          id: 1,
          label: 'Home',
          receiverName: 'John Doe',
          receiverPhone: '9876543210',
          streetAddress: '123 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: true,
        },
      ],
    });
  });

  it('renders checkout page layout with express delivery banner and payment methods', async () => {
    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/1-Hour SuperFast/i)).toBeInTheDocument();
    expect(screen.getByText('Choose Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Place Express Order')).toBeInTheDocument();
  });
});

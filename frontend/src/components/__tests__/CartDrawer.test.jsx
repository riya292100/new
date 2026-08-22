import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CartDrawer from '../CartDrawer';
import * as CartContextModule from '../../context/CartContext';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('CartDrawer Component', () => {
  const mockCartValues = {
    cart: {
      items: [
        {
          id: 1,
          quantity: 2,
          productName: 'Fresh Strawberries',
          unitPrice: 120,
          mrp: 150,
          productImage: '',
          unitQuantity: '250g',
        },
      ],
      totalItems: 2,
      itemTotal: 240,
      deliveryFee: 0,
      platformFee: 5,
      tax: 12,
      finalTotal: 257,
      freeDeliveryUnlocked: true,
      amountToFreeDelivery: 0,
    },
    cartDrawerOpen: true,
    setCartDrawerOpen: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    appliedCoupon: null,
    removeCoupon: vi.fn(),
    setCouponModalOpen: vi.fn(),
    finalPayableAmount: 257,
  };

  const mockAuthValues = {
    user: { id: 1, fullName: 'Jane' },
    openAuthModal: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue(mockCartValues);
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(mockAuthValues);
  });

  it('renders cart drawer items and bill details', () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <CartDrawer />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/My Cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Fresh Strawberries/i)).toBeInTheDocument();
    expect(screen.getByText(/Item Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
  });

  it('renders empty cart state when no items exist', () => {
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      ...mockCartValues,
      cart: {
        items: [],
        totalItems: 0,
        itemTotal: 0,
        deliveryFee: 0,
        platformFee: 0,
        tax: 0,
        finalTotal: 0,
        freeDeliveryUnlocked: false,
        amountToFreeDelivery: 199,
      },
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <CartDrawer />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Groceries/i)).toBeInTheDocument();
  });
});

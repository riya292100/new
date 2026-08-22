import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { ToastProvider } from '../ToastContext';
import { AuthProvider } from '../AuthContext';

const TestComponent = () => {
  const { cart, finalPayableAmount } = useCart();
  return (
    <div>
      <span data-testid="cart-items">{cart?.totalItems || 0}</span>
      <span data-testid="cart-total">{finalPayableAmount || 0}</span>
    </div>
  );
};

describe('CartContext Suite', () => {
  it('initializes default cart with 0 items', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <TestComponent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByTestId('cart-items').textContent).toBe('0');
  });
});

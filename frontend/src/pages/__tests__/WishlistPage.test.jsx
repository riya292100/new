import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WishlistPage from '../WishlistPage';
import { WishlistProvider } from '../../context/WishlistContext';
import { CartProvider } from '../../context/CartContext';
import { LocationProvider } from '../../context/LocationContext';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('WishlistPage', () => {
  it('renders empty wishlist state when empty', () => {
    localStorage.removeItem('quickcart_wishlist');

    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <WishlistProvider>
                  <WishlistPage />
                </WishlistProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Wishlist is Empty/i)).toBeInTheDocument();
  });
});

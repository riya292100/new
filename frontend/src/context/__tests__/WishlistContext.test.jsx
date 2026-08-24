import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import { CartProvider } from '../CartContext';
import { LocationProvider } from '../LocationContext';
import { AuthProvider } from '../AuthContext';
import { ToastProvider } from '../ToastContext';

const wrapper = ({ children }) => (
  <ToastProvider>
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  </ToastProvider>
);

describe('WishlistContext', () => {
  it('initializes with empty or stored wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(Array.isArray(result.current.wishlist)).toBe(true);
  });

  it('toggles product in and out of wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    const product = { id: 101, name: 'iPhone 15 Pro', sellingPrice: 127999 };

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.isInWishlist(101)).toBe(true);
    expect(result.current.wishlistCount).toBeGreaterThan(0);

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.isInWishlist(101)).toBe(false);
  });

  it('clears all wishlist items', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    const product = { id: 102, name: 'boAt Rockerz', sellingPrice: 1799 };

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.wishlist.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearWishlist();
    });

    expect(result.current.wishlist.length).toBe(0);
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import * as api from '../../services/api';
import * as AuthContextModule from '../../context/AuthContext';
import * as CartContextModule from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { ToastProvider } from '../../context/ToastContext';

describe('HomePage Component (Isolated Unit Tests)', () => {
  const mockCategories = [
    { id: 1, name: 'Mobiles & Tablets', slug: 'mobiles-tablets', imageUrl: 'https://example.com/phone.jpg' },
    { id: 2, name: 'Electronics & Audio', slug: 'electronics-audio', imageUrl: 'https://example.com/audio.jpg' },
  ];

  const mockProducts = [
    {
      id: 101,
      name: 'Apple iPhone 15 Pro (128 GB)',
      slug: 'iphone-15-pro',
      brand: 'Apple',
      sellingPrice: 127999,
      mrp: 134900,
      discountPercentage: 5,
      inStock: true,
      unitQuantity: '1 Unit',
      imageUrl: 'https://example.com/iphone.jpg',
      rating: 4.8,
      ratingCount: 120,
      isFeatured: true,
      isDailyDeal: true,
      categoryId: 1,
    },
  ];

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Riya Gope' },
      isAuthenticated: true,
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn().mockReturnValue(0),
      getItemCartId: vi.fn().mockReturnValue(null),
    });

    vi.spyOn(api.catalogApi, 'getCategories').mockResolvedValue({ data: mockCategories });
    vi.spyOn(api.catalogApi, 'getProducts').mockResolvedValue({ data: mockProducts });
    vi.spyOn(api.catalogApi, 'getFeaturedProducts').mockResolvedValue({ data: mockProducts });
    vi.spyOn(api.catalogApi, 'getDailyDeals').mockResolvedValue({ data: mockProducts });
  });

  it('renders hero banner, categories, and marketplace sections', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <WishlistProvider>
            <HomePage />
          </WishlistProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/1-Hour SuperFast Pan-India Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Popular Marketplace Categories/i)).toBeInTheDocument();

    await waitFor(() => {
      const items = screen.getAllByText(/Apple iPhone 15 Pro/i);
      expect(items.length).toBeGreaterThan(0);
    });
  });
});

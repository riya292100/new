import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CategoryPage from '../CategoryPage';
import * as api from '../../services/api';
import * as CartContextModule from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';

describe('CategoryPage Component (Isolated Unit Tests)', () => {
  const mockProducts = [
    {
      id: 301,
      name: 'Organic Bananas Robusta',
      slug: 'organic-bananas',
      sellingPrice: 48,
      mrp: 60,
      discountPercentage: 20,
      inStock: true,
      unitQuantity: '500g',
      imageUrl: 'https://example.com/banana.jpg',
      rating: 4.6,
      ratingCount: 85,
    },
  ];

  beforeEach(() => {
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn().mockReturnValue(0),
      getItemCartId: vi.fn().mockReturnValue(null),
    });

    vi.spyOn(api.catalogApi, 'getCategoryBySlug').mockResolvedValue({
      data: { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    });
    vi.spyOn(api.catalogApi, 'getProducts').mockResolvedValue({
      data: { content: mockProducts, totalElements: 1 },
    });
    vi.spyOn(api.catalogApi, 'getCategories').mockResolvedValue({
      data: [{ id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }],
    });
    vi.spyOn(api.catalogApi, 'getDailyDeals').mockResolvedValue({
      data: mockProducts,
    });
  });

  it('renders category page with products list and filters', async () => {
    render(
      <MemoryRouter initialEntries={['/category/fruits-vegetables']}>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/category/:slug" element={<CategoryPage />} />
              </Routes>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Organic Bananas Robusta/i)).toBeInTheDocument();
    });
  });
});

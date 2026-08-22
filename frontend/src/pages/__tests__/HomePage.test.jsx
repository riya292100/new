import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import * as api from '../../services/api';
import * as AuthContextModule from '../../context/AuthContext';
import * as CartContextModule from '../../context/CartContext';

describe('HomePage Component (Isolated Unit Tests)', () => {
  const mockCategories = [
    { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎' },
    { id: 2, name: 'Dairy & Breakfast', slug: 'dairy-breakfast', icon: '🥛' },
  ];

  const mockProducts = [
    {
      id: 101,
      name: 'Fresh Alphonso Mangoes',
      slug: 'alphonso-mangoes',
      sellingPrice: 450,
      mrp: 550,
      discountPercentage: 18,
      inStock: true,
      unitQuantity: '1 kg box',
      imageUrl: 'https://example.com/mango.jpg',
      rating: 4.8,
      ratingCount: 120,
    },
  ];

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Demo User' },
      isAuthenticated: true,
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn().mockReturnValue(0),
      getItemCartId: vi.fn().mockReturnValue(null),
    });

    vi.spyOn(api.catalogApi, 'getCategories').mockResolvedValue(mockCategories);
    vi.spyOn(api.catalogApi, 'getFeaturedProducts').mockResolvedValue(mockProducts);
    vi.spyOn(api.catalogApi, 'getDailyDeals').mockResolvedValue(mockProducts);
  });

  it('renders hero banner, categories, and featured product sections', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Instant Delivery in 10–30 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop By Category/i)).toBeInTheDocument();

    await waitFor(() => {
      const mangoes = screen.getAllByText(/Fresh Alphonso Mangoes/i);
      expect(mangoes.length).toBeGreaterThan(0);
    });
  });
});

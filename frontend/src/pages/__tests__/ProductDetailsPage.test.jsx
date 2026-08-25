import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetailsPage from '../ProductDetailsPage';
import { catalogApi, reviewApi } from '../../services/api';
import * as CartContextModule from '../../context/CartContext';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('ProductDetailsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(catalogApi, 'getProductById').mockResolvedValue({
      data: {
        id: 99,
        name: 'Farm Fresh Organic Eggs',
        brand: 'QuickFarm',
        unitQuantity: 'Pack of 6',
        price: 90,
        sellingPrice: 90,
        mrp: 110,
        discountPercentage: 18,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/eggs',
        description: 'Fresh farm eggs delivered in safe cartons.',
      },
    });

    vi.spyOn(catalogApi, 'getRelatedProducts').mockResolvedValue({ data: [] });
    vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue({ data: [] });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn().mockReturnValue(0),
      getItemCartId: vi.fn().mockReturnValue(null),
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1 },
      openAuthModal: vi.fn(),
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });
  });

  it('fetches and renders product detail modal for matched product id route', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/product/99']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Farm Fresh Organic Eggs')).toBeInTheDocument();
    expect(screen.getByText('Pack of 6')).toBeInTheDocument();
  });
});

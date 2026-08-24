import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductDetailModal from '../ProductDetailModal';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { WishlistProvider } from '../../context/WishlistContext';

vi.mock('../../services/api', () => ({
  reviewApi: {
    getProductReviews: vi.fn().mockResolvedValue({ data: [] }),
    addReview: vi.fn(),
  },
  catalogApi: {
    getRelatedProducts: vi.fn().mockResolvedValue({ data: [] }),
  },
  pincodeApi: {
    check: vi.fn().mockResolvedValue({
      data: { city: 'New Delhi', estimatedEta: '45-60 mins', isOneHourAvailable: true },
    }),
  },
}));

const mockProduct = {
  id: 1,
  name: 'Organic Avocados',
  brand: 'FreshFarm',
  sellingPrice: 160,
  mrp: 200,
  unitQuantity: '2 pcs',
  rating: 4.8,
  description: 'Fresh organic hass avocados rich in nutrients.',
  imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578',
};

describe('ProductDetailModal Component', () => {
  it('renders product information properly', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductDetailModal product={mockProduct} onClose={vi.fn()} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByText('Organic Avocados')).toBeInTheDocument();
    expect(screen.getByText('FreshFarm')).toBeInTheDocument();
    expect(screen.getByText('₹160')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
    expect(screen.getByText(/Fresh organic hass avocados/i)).toBeInTheDocument();
  });

  it('renders nothing if product prop is null', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductDetailModal product={null} onClose={vi.fn()} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.queryByText('Organic Avocados')).not.toBeInTheDocument();
  });
});

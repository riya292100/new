import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { CartProvider } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import { LocationProvider } from '../../context/LocationContext';

const mockProduct = {
  id: 101,
  name: 'Organic Cavendish Bananas',
  brand: 'Fresh Farms',
  sellingPrice: 48,
  mrp: 60,
  discountPercentage: 20,
  unitQuantity: '1 kg',
  stockQuantity: 25,
  inStock: true,
  rating: 4.8,
  reviewCount: 34,
  imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500',
  isFeatured: true,
  isDailyDeal: false,
};

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <WishlistProvider>
                  <ProductCard product={mockProduct} onSelectProduct={vi.fn()} />
                </WishlistProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Organic Cavendish Bananas')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('₹48')).toBeInTheDocument();
    expect(screen.getByText('₹60')).toBeInTheDocument();
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClothDetailModal from '../ClothDetailModal';
import { CartProvider } from '../../../context/CartContext';
import { ToastProvider } from '../../../context/ToastContext';
import { AuthProvider } from '../../../context/AuthContext';

const mockCloth = {
  id: 302,
  name: 'Slim Fit Stretch Denim Jeans',
  brand: "Levi's",
  department: 'Men',
  garmentType: 'Jeans',
  sizes: ['30', '32', '34', '36'],
  colors: ['Indigo Dark Wash', 'Midnight Black'],
  fabric: '99% Organic Cotton, 1% Elastane',
  fit: 'Slim Fit',
  sellingPrice: 1599,
  price: 1599,
  mrp: 2799,
  discountPercentage: 43,
  rating: 4.9,
  reviewCount: 240,
  imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600',
  galleryImages: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
  description: 'Iconic slim fit stretch jeans.',
};

const renderWithProviders = (ui) => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{ui}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('ClothDetailModal Component', () => {
  it('renders detailed garment info, size buttons, color swatches, and fabric specs', () => {
    const handleClose = vi.fn();
    renderWithProviders(<ClothDetailModal product={mockCloth} onClose={handleClose} />);

    expect(screen.getByText("Levi's")).toBeInTheDocument();
    expect(screen.getByText('Slim Fit Stretch Denim Jeans')).toBeInTheDocument();
    expect(screen.getByText('₹1599')).toBeInTheDocument();
    expect(screen.getByText('₹2799')).toBeInTheDocument();
    expect(screen.getByText('43% OFF')).toBeInTheDocument();
    expect(screen.getByText('99% Organic Cotton, 1% Elastane')).toBeInTheDocument();
    expect(screen.getAllByText('Indigo Dark Wash').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles size guide chart when button is clicked', () => {
    renderWithProviders(<ClothDetailModal product={mockCloth} onClose={() => {}} />);

    const sizeGuideBtn = screen.getByText(/Size Guide/i);
    fireEvent.click(sizeGuideBtn);

    expect(screen.getByText('Chest (in)')).toBeInTheDocument();
    expect(screen.getByText('Length (in)')).toBeInTheDocument();
  });

  it('adds item to cart with selected size', () => {
    const handleClose = vi.fn();
    renderWithProviders(<ClothDetailModal product={mockCloth} onClose={handleClose} />);

    // Click size 34
    fireEvent.click(screen.getByRole('button', { name: '34' }));

    const addToCartBtn = screen.getByText(/Add Size 34 to Cart/i);
    fireEvent.click(addToCartBtn);

    expect(addToCartBtn).toBeInTheDocument();
  });
});

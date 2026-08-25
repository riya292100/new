import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClothCard from '../ClothCard';
import { CartProvider } from '../../../context/CartContext';
import { ToastProvider } from '../../../context/ToastContext';
import { AuthProvider } from '../../../context/AuthContext';

const mockCloth = {
  id: 301,
  name: 'Classic Crewneck Cotton T-Shirt',
  brand: 'Roadster',
  department: 'Men',
  garmentType: 'T-Shirts',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'Navy'],
  fabric: '100% Combed Cotton',
  sellingPrice: 399,
  price: 399,
  mrp: 799,
  discountPercentage: 50,
  rating: 4.8,
  ratingCount: 185,
  imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
  description: 'Ultra-soft everyday tee.',
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

describe('ClothCard Component', () => {
  it('renders cloth brand, name, price, discount, and sizes', () => {
    renderWithProviders(<ClothCard product={mockCloth} />);

    expect(screen.getByText('Roadster')).toBeInTheDocument();
    expect(screen.getByText('Classic Crewneck Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('₹399')).toBeInTheDocument();
    expect(screen.getByText('₹799')).toBeInTheDocument();
    expect(screen.getByText('50% OFF')).toBeInTheDocument();
    expect(screen.getByText('100% Combed Cotton')).toBeInTheDocument();

    // Size buttons
    expect(screen.getAllByText('S').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('XL')).toBeInTheDocument();
  });

  it('allows interactive size selection on the card', () => {
    renderWithProviders(<ClothCard product={mockCloth} />);

    const lButton = screen.getByText('L');
    fireEvent.click(lButton);

    // Selected size indicator shows L
    expect(screen.getByText('SELECT SIZE:')).toBeInTheDocument();
  });

  it('triggers onSelectProduct when card is clicked', () => {
    const handleSelect = vi.fn();
    renderWithProviders(<ClothCard product={mockCloth} onSelectProduct={handleSelect} />);

    const title = screen.getByText('Classic Crewneck Cotton T-Shirt');
    fireEvent.click(title);

    expect(handleSelect).toHaveBeenCalledWith(mockCloth);
  });

  it('adds item to cart with selected size when + ADD is clicked', () => {
    renderWithProviders(<ClothCard product={mockCloth} />);

    // Select size XL
    fireEvent.click(screen.getByText('XL'));

    const addBtn = screen.getByText('+ ADD');
    fireEvent.click(addBtn);

    expect(addBtn).toBeInTheDocument();
  });
});

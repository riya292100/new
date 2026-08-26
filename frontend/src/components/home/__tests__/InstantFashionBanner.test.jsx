import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InstantFashionBanner from '../InstantFashionBanner';
import * as AuthContextModule from '../../../context/AuthContext';
import * as CartContextModule from '../../../context/CartContext';
import * as ToastContextModule from '../../../context/ToastContext';

const mockClothes = [
  {
    id: 1,
    name: 'Classic White Crewneck Tee',
    brand: 'QuickFashion',
    sellingPrice: 499,
    mrp: 999,
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Navy'],
    images: ['https://example.com/tee.jpg'],
  },
];

describe('InstantFashionBanner Component', () => {
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

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      showToast: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
    });
  });

  it('renders section title, explore link and cloth items', () => {
    const handleSelect = vi.fn();
    render(
      <MemoryRouter>
        <InstantFashionBanner clothes={mockClothes} onSelectCloth={handleSelect} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('instant-fashion-section')).toBeInTheDocument();
    expect(screen.getByText(/15-Min Instant Clothes & Fashion/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Clothes Store/i })).toBeInTheDocument();
    expect(screen.getByText(/Classic White Crewneck Tee/i)).toBeInTheDocument();
  });
});

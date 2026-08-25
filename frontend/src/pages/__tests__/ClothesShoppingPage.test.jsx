import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClothesShoppingPage from '../ClothesShoppingPage';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import { productApi } from '../../services/api';
import { FALLBACK_CLOTHES } from '../../utils/demoConfig';

vi.mock('../../services/api', () => ({
  productApi: {
    getProducts: vi.fn(),
  },
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('ClothesShoppingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productApi.getProducts.mockResolvedValue({
      data: { content: FALLBACK_CLOTHES, totalElements: FALLBACK_CLOTHES.length },
    });
  });

  it('renders hero title, department filter buttons, size dropdown, and apparel items', async () => {
    renderWithProviders(<ClothesShoppingPage />);

    expect(screen.getByText(/Trending Clothes & Daily Apparel/i)).toBeInTheDocument();
    expect(screen.getByText("Men's Wear")).toBeInTheDocument();
    expect(screen.getByText("Women's Wear")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Classic Crewneck Cotton T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Slim Fit Stretch Denim Jeans')).toBeInTheDocument();
    });
  });

  it('filters apparel by department when clicked', async () => {
    renderWithProviders(<ClothesShoppingPage />);

    await waitFor(() => {
      expect(screen.getByText('Classic Crewneck Cotton T-Shirt')).toBeInTheDocument();
    });

    // Filter Women's Wear
    const womensTab = screen.getByText("Women's Wear");
    fireEvent.click(womensTab);

    // Women item should be present, Men item should be hidden
    expect(screen.getByText('Floral Print Summer Cotton Midi Dress')).toBeInTheDocument();
    expect(screen.queryByText('Slim Fit Stretch Denim Jeans')).not.toBeInTheDocument();
  });

  it('opens detailed cloth modal on clicking an item', async () => {
    renderWithProviders(<ClothesShoppingPage />);

    await waitFor(() => {
      expect(screen.getByText('Classic Crewneck Cotton T-Shirt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Classic Crewneck Cotton T-Shirt'));

    expect(screen.getByText('⚡ Instant 15-Min Delivery')).toBeInTheDocument();
  });
});

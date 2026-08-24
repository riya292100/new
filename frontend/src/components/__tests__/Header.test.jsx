import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import * as AuthContextModule from '../../context/AuthContext';
import * as CartContextModule from '../../context/CartContext';
import * as LocationContextModule from '../../context/LocationContext';
import * as WishlistContextModule from '../../context/WishlistContext';

describe('Header Component (Isolated Unit Tests)', () => {
  const handleOpenCart = vi.fn();
  const handleOpenAuth = vi.fn();
  const handleOpenLoc = vi.fn();

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Rahul Verma', email: 'rahul@example.com' },
      isAuthenticated: true,
      openAuthModal: handleOpenAuth,
      logout: vi.fn(),
      isAdmin: false,
      isSeller: false,
      isDeliveryPartner: false,
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      cart: { totalItems: 4, grandTotal: 320 },
      setCartDrawerOpen: handleOpenCart,
      getItemQuantity: vi.fn().mockReturnValue(0),
    });

    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      selectedLocation: {
        label: 'Home',
        streetAddress: 'Koramangala, Bengaluru',
        city: 'Bengaluru',
        pincode: '560001',
      },
      setLocationModalOpen: handleOpenLoc,
    });

    vi.spyOn(WishlistContextModule, 'useWishlist').mockReturnValue({
      wishlist: [],
      wishlistCount: 2,
      isInWishlist: vi.fn().mockReturnValue(false),
      toggleWishlist: vi.fn(),
    });
  });

  it('renders branding, location selector, user greeting, and cart trigger', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const quickElements = screen.getAllByText(/Quick/i);
    expect(quickElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/1-Hour SuperFast Express Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahul/i)).toBeInTheDocument();
    expect(screen.getByText(/4 items/i)).toBeInTheDocument();

    const diningElements = screen.getAllByText(/Dining/i);
    expect(diningElements.length).toBeGreaterThan(0);
  });

  it('toggles user dropdown on button click', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userBtn = screen.getByText(/Rahul/i);
    fireEvent.click(userBtn);
    expect(screen.getByText(/My Orders & Deliveries/i)).toBeInTheDocument();
  });
});

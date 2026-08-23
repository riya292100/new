import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import * as AuthContextModule from '../../context/AuthContext';
import * as CartContextModule from '../../context/CartContext';
import * as LocationContextModule from '../../context/LocationContext';

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
      isDeliveryPartner: false,
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      cart: { totalItems: 4, finalPrice: 320 },
      setCartDrawerOpen: handleOpenCart,
      getItemQuantity: vi.fn().mockReturnValue(0),
    });

    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      selectedLocation: { label: 'Home', streetAddress: 'Koramangala, Bengaluru' },
      setLocationModalOpen: handleOpenLoc,
    });
  });

  it('renders branding, location selector, user greeting, and cart trigger', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/Quick/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery in 15 mins/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahul/i)).toBeInTheDocument();
    expect(screen.getByText(/4 items/i)).toBeInTheDocument();
    expect(screen.getByText(/Dining & Tables/i)).toBeInTheDocument();
  });

  it('toggles user dropdown on button click', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userBtn = screen.getByText(/Rahul/i);
    fireEvent.click(userBtn);
    expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Table Bookings/i)).toBeInTheDocument();
  });
});

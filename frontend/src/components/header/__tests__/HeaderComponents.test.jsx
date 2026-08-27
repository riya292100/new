import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrandLogo from '../BrandLogo';
import LocationPickerTrigger from '../LocationPickerTrigger';
import NavCategoryLinks from '../NavCategoryLinks';
import UserMenuDropdown from '../UserMenuDropdown';
import CartNavButton from '../CartNavButton';

describe('Header Subcomponents', () => {
  describe('BrandLogo', () => {
    it('renders QuickCart brand name, logo, and delivery badge', () => {
      render(
        <MemoryRouter>
          <BrandLogo />
        </MemoryRouter>
      );
      expect(screen.getByText('Quick')).toBeInTheDocument();
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText(/12-15 MINS/)).toBeInTheDocument();
    });
  });

  describe('LocationPickerTrigger', () => {
    it('renders selected location and handles click', () => {
      const handleOpen = vi.fn();
      render(
        <LocationPickerTrigger
          selectedLocation={{ label: 'Home', streetAddress: '123 Tech Park' }}
          onOpenModal={handleOpen}
        />
      );
      expect(screen.getByText('Home: 123 Tech Park')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it('renders fallback when no location is selected', () => {
      render(<LocationPickerTrigger selectedLocation={null} onOpenModal={vi.fn()} />);
      expect(screen.getByText('Select Location')).toBeInTheDocument();
    });
  });

  describe('NavCategoryLinks', () => {
    it('renders navigation shortcut links for Clothes and Dining', () => {
      render(
        <MemoryRouter>
          <NavCategoryLinks />
        </MemoryRouter>
      );
      expect(screen.getByText('Clothes Shopping')).toBeInTheDocument();
      expect(screen.getByText('Dining & Tables')).toBeInTheDocument();
    });
  });

  describe('UserMenuDropdown', () => {
    it('renders Sign In button when unauthenticated', () => {
      const handleOpenAuth = vi.fn();
      render(<UserMenuDropdown user={null} logout={vi.fn()} openAuthModal={handleOpenAuth} />);
      const btn = screen.getByText('Sign In');
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleOpenAuth).toHaveBeenCalledWith('login');
    });

    it('renders user menu and toggles dropdown on click', () => {
      const handleLogout = vi.fn();
      const mockUser = {
        email: 'riya@example.com',
        fullName: 'Riya Gope',
      };
      render(
        <MemoryRouter>
          <UserMenuDropdown
            user={mockUser}
            logout={handleLogout}
            openAuthModal={vi.fn()}
            isAdmin={true}
            isDeliveryPartner={true}
          />
        </MemoryRouter>
      );
      expect(screen.getByText('Riya')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Riya'));
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Order History')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Rider Portal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Logout'));
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('CartNavButton', () => {
    it('renders empty cart label when total items is 0', () => {
      const handleOpenCart = vi.fn();
      render(<CartNavButton totalItems={0} totalPrice={0} onOpenCart={handleOpenCart} />);
      expect(screen.getByText('My Cart')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(handleOpenCart).toHaveBeenCalledTimes(1);
    });

    it('renders item badge and total price when cart has items', () => {
      render(<CartNavButton totalItems={3} totalPrice={450} onOpenCart={vi.fn()} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('₹450')).toBeInTheDocument();
    });
  });
});

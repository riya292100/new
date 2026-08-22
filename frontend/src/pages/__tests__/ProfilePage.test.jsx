import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';
import * as api from '../../services/api';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('ProfilePage Component (Isolated Unit Tests)', () => {
  const mockUser = {
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9988776655',
    roles: ['ROLE_CUSTOMER'],
  };

  const mockAddresses = [
    {
      id: 501,
      label: 'Home',
      receiverName: 'Priya Sharma',
      receiverPhone: '+91 9988776655',
      streetAddress: '123 Palm Grove Lane',
      apartmentUnit: 'Apt 4B',
      city: 'New Delhi',
      pincode: '110001',
    },
  ];

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    vi.spyOn(api.addressApi, 'getAddresses').mockResolvedValue({ data: mockAddresses });
  });

  it('renders profile card with user details and saved address list', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <ProfilePage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('priya@example.com')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Saved Addresses \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Palm Grove Lane/i)).toBeInTheDocument();
    });
  });
});

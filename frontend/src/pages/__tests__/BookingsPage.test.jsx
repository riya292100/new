import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookingsPage from '../BookingsPage';
import { bookingApi } from '../../services/bookingApi';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('BookingsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
      openAuthModal: vi.fn(),
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });

    vi.spyOn(bookingApi, 'getMyBookings').mockResolvedValue({
      data: {
        data: [
          {
            id: 101,
            bookingReference: 'QC-DINE-9821',
            restaurantId: 1,
            restaurantName: 'Trattoria da Enzo',
            restaurantAddress: 'Via dei Vascellari, 29',
            restaurantCity: 'Rome',
            bookingDate: '2026-08-30',
            bookingTime: '19:30',
            numberOfGuests: 2,
            seatingPreference: 'Indoor Dining',
            status: 'CONFIRMED',
          },
        ],
      },
    });
  });

  it('renders my reservations list and reservation cards', async () => {
    render(
      <BrowserRouter>
        <BookingsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('My Table Reservations')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Trattoria da Enzo')).toBeInTheDocument();
      expect(screen.getByText('#QC-DINE-9821')).toBeInTheDocument();
    });
  });
});

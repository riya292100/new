import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TableBookingModal from '../TableBookingModal';
import * as AuthContextModule from '../../../context/AuthContext';
import * as ToastContextModule from '../../../context/ToastContext';
import { bookingApi } from '../../../services/bookingApi';

describe('TableBookingModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const dummyRestaurant = {
    id: 1,
    name: 'Trattoria da Enzo',
    city: 'Rome',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
      openAuthModal: vi.fn(),
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });

    vi.spyOn(bookingApi, 'createBooking').mockResolvedValue({
      data: {
        data: {
          id: 101,
          bookingReference: 'QC-DINE-9821',
          bookingDate: '2026-08-30',
          bookingTime: '19:30',
          numberOfGuests: 2,
          seatingPreference: 'Indoor Dining',
          status: 'CONFIRMED',
        },
      },
    });
  });

  it('renders booking form and submits table reservation successfully', async () => {
    render(
      <TableBookingModal
        restaurant={dummyRestaurant}
        onClose={mockOnClose}
        onBookingSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Reserve a Table')).toBeInTheDocument();
    expect(screen.getByText(/Trattoria da Enzo • Rome/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Confirm Table Reservation/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Reservation Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('QC-DINE-9821')).toBeInTheDocument();
    });
  });
});

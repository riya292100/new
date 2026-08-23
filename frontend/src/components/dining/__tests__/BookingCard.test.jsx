import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookingCard from '../BookingCard';

describe('BookingCard Component', () => {
  const mockCancel = vi.fn();

  const dummyBooking = {
    id: 101,
    bookingReference: 'QC-DINE-9821',
    restaurantId: 1,
    restaurantName: 'Trattoria da Enzo',
    restaurantAddress: 'Via dei Vascellari, 29',
    restaurantCity: 'Rome',
    restaurantPhone: '+39 06 581 2260',
    bookingDate: '2026-08-30',
    bookingTime: '19:30',
    numberOfGuests: 2,
    seatingPreference: 'Indoor Dining',
    specialRequest: 'Anniversary Dinner',
    status: 'CONFIRMED',
  };

  it('renders booking details and handles cancellation trigger', () => {
    render(
      <BrowserRouter>
        <BookingCard booking={dummyBooking} onCancelBooking={mockCancel} />
      </BrowserRouter>
    );

    expect(screen.getByText('#QC-DINE-9821')).toBeInTheDocument();
    expect(screen.getByText('Trattoria da Enzo')).toBeInTheDocument();
    expect(screen.getByText('2 Guests')).toBeInTheDocument();
    expect(screen.getByText(/Anniversary Dinner/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel Reservation/i });
    fireEvent.click(cancelBtn);
    expect(mockCancel).toHaveBeenCalledWith(101);
  });
});

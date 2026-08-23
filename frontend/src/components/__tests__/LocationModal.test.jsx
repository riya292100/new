import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationModal from '../LocationModal';
import * as LocationContextModule from '../../context/LocationContext';
import * as AuthContextModule from '../../context/AuthContext';
import { addressApi } from '../../services/api';

describe('LocationModal Component', () => {
  const mockSetLocationModalOpen = vi.fn();
  const mockUpdateLocation = vi.fn();
  const mockDetectGPS = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      selectedLocation: { label: 'Home', streetAddress: '123 MG Road', city: 'Bengaluru' },
      locationModalOpen: true,
      setLocationModalOpen: mockSetLocationModalOpen,
      updateLocation: mockUpdateLocation,
      detectGPSLocation: mockDetectGPS,
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'Test User' },
    });

    vi.spyOn(addressApi, 'getAddresses').mockResolvedValue({
      data: [
        {
          id: 10,
          label: 'Work',
          streetAddress: 'Prestige Tech Park',
          city: 'Bengaluru',
          pincode: '560103',
        },
      ],
    });
  });

  it('renders modal and checks serviceable pincode correctly', async () => {
    render(<LocationModal />);

    expect(screen.getByText(/Select Delivery Location/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
    fireEvent.change(input, { target: { value: '560001' } });

    const checkBtn = screen.getByRole('button', { name: /Check/i });
    fireEvent.click(checkBtn);

    expect(
      screen.getByText(/Superfast 12-min delivery is available in your area!/i)
    ).toBeInTheDocument();
  });

  it('handles GPS location detection click', async () => {
    render(<LocationModal />);

    const gpsBtn = screen.getByRole('button', { name: /Use Current Live GPS Location/i });
    fireEvent.click(gpsBtn);

    expect(mockDetectGPS).toHaveBeenCalled();
  });
});

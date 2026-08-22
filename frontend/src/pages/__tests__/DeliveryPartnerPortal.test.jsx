import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DeliveryPartnerPortal from '../DeliveryPartnerPortal';
import * as api from '../../services/api';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('DeliveryPartnerPortal Component (Isolated Unit Tests)', () => {
  const mockProfile = {
    id: 1,
    fullName: 'Raju Express Rider',
    phone: '+91 98765 43210',
    vehicleNumber: 'KA-01-EQ-9921',
    isAvailable: true,
    totalDeliveries: 142,
    rating: 4.9,
    todayEarnings: 850,
  };

  const mockAssignedOrders = [
    {
      id: 201,
      orderNumber: 'QC-4491',
      status: 'OUT_FOR_DELIVERY',
      totalAmount: 340,
      deliveryAddress: {
        addressLine1: 'Flat 402, Green Glen Layout',
        city: 'Bengaluru',
        pincode: '560103',
      },
      items: [{ id: 1, productName: 'Fresh Milk 1L', quantity: 2, price: 60 }],
    },
  ];

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Raju Express Rider', role: 'ROLE_DELIVERY_PARTNER' },
      isDeliveryPartner: true,
    });

    vi.spyOn(api.deliveryApi, 'getProfile').mockResolvedValue({ data: mockProfile });
    vi.spyOn(api.deliveryApi, 'getAssignedOrders').mockResolvedValue({ data: mockAssignedOrders });
  });

  it('renders driver dashboard with profile metrics and assigned orders', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <DeliveryPartnerPortal />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Raju Express Rider/i)).toBeInTheDocument();
      expect(screen.getByText(/KA-01-EQ-9921/i)).toBeInTheDocument();
      expect(screen.getByText(/QC-4491/i)).toBeInTheDocument();
    });
  });
});

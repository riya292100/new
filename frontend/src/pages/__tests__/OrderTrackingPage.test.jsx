import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderTrackingPage from '../OrderTrackingPage';
import { ToastProvider } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import wsService from '../../services/websocket';

vi.mock('../../services/api', () => ({
  orderApi: {
    trackOrder: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

vi.mock('../../services/websocket', () => {
  const mockWs = {
    subscribeToOrder: vi.fn(() => vi.fn()),
  };
  return {
    default: mockWs,
    wsService: mockWs,
  };
});

vi.mock('../../components/LiveRadarMap', () => ({
  default: () => <div data-testid="live-radar-map">Live Radar Map</div>,
}));

describe('OrderTrackingPage', () => {
  const mockOrder = {
    id: 42,
    orderNumber: 'QC-10042',
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    deliveryPartnerName: 'Ramesh Kumar',
    vehicleNumber: 'KA-01-EQ-9876',
    partnerRating: '4.95',
    deliveryOtp: '7821',
    finalTotal: 450,
    paymentMethod: 'UPI',
    items: [{ id: 1, productName: 'Fresh Apples', quantity: 2, price: 100 }],
    address: {
      fullName: 'John Doe',
      phone: '9876543210',
      houseNumber: 'Flat 402',
      areaDetails: 'Green Valley',
      city: 'Bangalore',
      pincode: '560001',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then displays order tracking details', async () => {
    orderApi.trackOrder.mockResolvedValueOnce({ data: mockOrder });

    render(
      <MemoryRouter initialEntries={['/order-tracking/QC-10042']}>
        <ToastProvider>
          <Routes>
            <Route path="/order-tracking/:orderNumber" element={<OrderTrackingPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Connecting to live dark store GPS/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Live Order #/i)).toBeInTheDocument();
      expect(screen.getByText(/Ramesh Kumar/i)).toBeInTheDocument();
      expect(screen.getByText(/Delivery Progress Timeline/i)).toBeInTheDocument();
    });

    expect(wsService.subscribeToOrder).toHaveBeenCalledWith(42, expect.any(Function));
  });

  it('displays not found message when order does not exist', async () => {
    orderApi.trackOrder.mockResolvedValueOnce({ data: null });

    render(
      <MemoryRouter initialEntries={['/order-tracking/QC-99999']}>
        <ToastProvider>
          <Routes>
            <Route path="/order-tracking/:orderNumber" element={<OrderTrackingPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Order #QC-99999 not found/i)).toBeInTheDocument();
    });
  });
});

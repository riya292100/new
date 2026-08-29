import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderTrackingPage from '../OrderTrackingPage';
import { ToastProvider } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import wsService from '../../services/websocket';

vi.mock('../../components/LiveRadarMap', () => ({
  default: () => <div data-testid="live-radar-map">Live Radar Map</div>,
}));

describe('OrderTrackingPage Suite', () => {
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
    vi.spyOn(orderApi, 'trackOrder').mockResolvedValue({ data: mockOrder });
    vi.spyOn(wsService, 'subscribeToOrder').mockReturnValue(vi.fn());

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
  });

  it('displays not found message when order does not exist', async () => {
    vi.spyOn(orderApi, 'trackOrder').mockResolvedValue({ data: null });
    vi.spyOn(wsService, 'subscribeToOrder').mockReturnValue(vi.fn());

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

  it('handles API error state gracefully by presenting error alert and retry button', async () => {
    vi.spyOn(orderApi, 'trackOrder').mockRejectedValue(new Error('Backend service unavailable'));
    vi.spyOn(wsService, 'subscribeToOrder').mockReturnValue(vi.fn());

    render(
      <MemoryRouter initialEntries={['/order-tracking/QC-500']}>
        <ToastProvider>
          <Routes>
            <Route path="/order-tracking/:orderNumber" element={<OrderTrackingPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to load live tracking details/i)).toBeInTheDocument();
      expect(screen.getByText(/Retry Tracking/i)).toBeInTheDocument();
    });
  });

  it('listens for live WebSocket updates and dynamically updates order status and partner info', async () => {
    let wsCallback = null;
    vi.spyOn(orderApi, 'trackOrder').mockResolvedValue({ data: mockOrder });
    vi.spyOn(wsService, 'subscribeToOrder').mockImplementation((orderId, cb) => {
      wsCallback = cb;
      return vi.fn();
    });

    render(
      <MemoryRouter initialEntries={['/order-tracking/QC-10042']}>
        <ToastProvider>
          <Routes>
            <Route path="/order-tracking/:orderNumber" element={<OrderTrackingPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ramesh Kumar/i)).toBeInTheDocument();
    });

    // Simulate incoming WebSocket update payload
    act(() => {
      if (wsCallback) {
        wsCallback({
          ...mockOrder,
          status: 'OUT_FOR_DELIVERY',
          deliveryPartnerName: 'Vikram Singh',
        });
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/Vikram Singh/i)).toBeInTheDocument();
    });
  });
});

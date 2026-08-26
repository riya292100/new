import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AssignedOrderCard from '../AssignedOrderCard';

const mockOrder = {
  id: 101,
  orderNumber: 'QC-10001',
  status: 'ORDER_PLACED',
  estimatedDeliveryTime: new Date(Date.now() + 900000).toISOString(),
  customerName: 'Aarav Sharma',
  customerPhone: '+919876543210',
  deliveryInstructions: 'Ring doorbell twice',
  totalAmount: 499,
  paymentMethod: 'UPI',
  address: {
    streetAddress: 'Flat 402, Sunshine Apts, 12th Main',
    city: 'Bengaluru',
    pincode: '560034',
  },
  items: [
    { productName: 'Fresh Milk 500ml', quantity: 2 },
    { productName: 'Whole Wheat Bread', quantity: 1 },
  ],
};

describe('AssignedOrderCard Component', () => {
  it('renders order number, customer details, destination address and items', () => {
    const handleAccept = vi.fn();
    const handleReject = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <AssignedOrderCard
        order={mockOrder}
        onAcceptOrder={handleAccept}
        onRejectOrder={handleReject}
        onUpdateOrderStatus={handleUpdate}
      />
    );

    expect(screen.getByTestId('assigned-order-101')).toBeInTheDocument();
    expect(screen.getByText(/Order #QC-10001/i)).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText(/Sunshine Apts/i)).toBeInTheDocument();
    expect(screen.getByText(/Ring doorbell twice/i)).toBeInTheDocument();

    const acceptBtn = screen.getByTestId('accept-delivery-btn');
    fireEvent.click(acceptBtn);
    expect(handleAccept).toHaveBeenCalledWith(101);
  });

  it('renders lifecycle action button for PACKED status', () => {
    const handleUpdate = vi.fn();
    const packedOrder = { ...mockOrder, status: 'PACKED' };

    render(
      <AssignedOrderCard
        order={packedOrder}
        onAcceptOrder={vi.fn()}
        onRejectOrder={vi.fn()}
        onUpdateOrderStatus={handleUpdate}
      />
    );

    const startBtn = screen.getByTestId('start-delivery-btn');
    fireEvent.click(startBtn);
    expect(handleUpdate).toHaveBeenCalledWith(101, 'OUT_FOR_DELIVERY');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InvoiceModal from '../InvoiceModal';

const mockOrder = {
  orderNumber: 'QC-123456',
  createdAt: '2026-08-24T12:00:00Z',
  customerName: 'Riya Gope',
  customerPhone: '9876543210',
  customerEmail: 'customer@quickcart.com',
  totalAmount: 1499,
  paymentMethod: 'UPI Instant',
  address: {
    label: 'Home',
    streetAddress: 'Flat 402, Green Valley Heights',
    city: 'New Delhi',
    pincode: '110001',
  },
  items: [
    {
      productName: 'Wireless Noise Cancelling Headphones',
      unitQuantity: '1 Unit',
      quantity: 1,
      unitPrice: 1499,
      totalPrice: 1499,
    },
  ],
};

describe('InvoiceModal Component', () => {
  it('renders official tax invoice details correctly', () => {
    render(<InvoiceModal order={mockOrder} onClose={vi.fn()} />);

    expect(screen.getAllByText(/Tax Invoice/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/INV-QC-123456/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Riya Gope')).toBeInTheDocument();
    expect(screen.getByText(/Flat 402, Green Valley Heights/i)).toBeInTheDocument();
    expect(screen.getByText('Wireless Noise Cancelling Headphones')).toBeInTheDocument();
    expect(screen.getAllByText('₹1499').length).toBeGreaterThan(0);
  });

  it('renders nothing when order is null', () => {
    const { container } = render(<InvoiceModal order={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});

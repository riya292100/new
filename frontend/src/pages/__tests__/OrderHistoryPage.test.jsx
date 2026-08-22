import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderHistoryPage from '../OrderHistoryPage';
import * as api from '../../services/api';
import * as AuthContextModule from '../../context/AuthContext';

describe('OrderHistoryPage Component (Isolated Unit Tests)', () => {
  const mockOrders = [
    {
      id: 401,
      orderNumber: 'QC-7890',
      status: 'DELIVERED',
      totalAmount: 520,
      createdAt: '2026-08-22T10:00:00Z',
      items: [
        {
          id: 1,
          productName: 'Organic Whole Milk',
          quantity: 2,
          productImage: 'https://example.com/milk.jpg',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Demo Customer' },
    });

    vi.spyOn(api.orderApi, 'getUserOrders').mockResolvedValue({ data: mockOrders });
  });

  it('renders order history with order cards, status badges, and tracking CTA', async () => {
    render(
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Order #QC-7890/i)).toBeInTheDocument();
      expect(screen.getByText(/DELIVERED/i)).toBeInTheDocument();
      expect(screen.getByText(/Track Live/i)).toBeInTheDocument();
    });
  });
});

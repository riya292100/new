import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';
import { adminApi, catalogApi } from '../../services/api';
import * as ToastContextModule from '../../context/ToastContext';
import logger from '../../utils/logger';

describe('AdminDashboard Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminApi, 'getDashboardStats').mockResolvedValue({
      data: {
        totalRevenue: 254000,
        totalOrders: 1420,
        lowStockItems: 3,
        totalCustomers: 850,
      },
    });

    vi.spyOn(catalogApi, 'getProducts').mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            name: 'Fresh Organic Milk',
            brand: 'Amul',
            price: 60,
            stockQuantity: 40,
          },
        ],
      },
    });

    vi.spyOn(catalogApi, 'getCategories').mockResolvedValue({
      data: [{ id: 1, name: 'Dairy & Eggs' }],
    });

    vi.spyOn(adminApi, 'getAllCoupons').mockResolvedValue({
      data: [{ id: 1, code: 'SAVE20', discountType: 'PERCENTAGE', discountValue: 20 }],
    });

    vi.spyOn(adminApi, 'getLowStockProducts').mockResolvedValue({
      data: [],
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });
  });

  it('renders admin control center and statistics overview', async () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Admin Control Center')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Admin Control Center')).toBeInTheDocument();
    });
  });

  it('logs structured error via logger.error when getDashboardStats rejects', async () => {
    const loggerSpy = vi.spyOn(logger, 'error');
    const networkErr = new Error('Database connection failed');
    vi.spyOn(adminApi, 'getDashboardStats').mockRejectedValue(networkErr);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(loggerSpy).toHaveBeenCalledWith(
        'AdminDashboard',
        'getDashboardStats failed',
        networkErr
      );
    });
  });

  it('surfaces an error toast when getDashboardStats rejects', async () => {
    const mockAddToast = vi.fn();
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: mockAddToast,
    });
    vi.spyOn(adminApi, 'getDashboardStats').mockRejectedValue(new Error('Internal Server Error'));

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/failed to load dashboard/i),
        'error'
      );
    });
  });
});

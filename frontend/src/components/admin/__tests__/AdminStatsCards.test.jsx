import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminStatsCards from '../AdminStatsCards';

describe('AdminStatsCards Component', () => {
  const mockStats = {
    totalRevenue: 85400,
    totalOrders: 320,
    lowStockProductsCount: 4,
    totalUsers: 150,
  };

  it('renders stats properly with revenue, orders, low stock, customers', () => {
    render(<AdminStatsCards stats={mockStats} />);

    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText('₹85400')).toBeInTheDocument();
    expect(screen.getByText(/Total Orders/i)).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText(/Low Stock Items/i)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Total Customers/i)).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders nothing when stats is null', () => {
    const { container } = render(<AdminStatsCards stats={null} />);
    expect(container.firstChild).toBeNull();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminLowStockAlerts from '../AdminLowStockAlerts';

describe('AdminLowStockAlerts Component', () => {
  it('renders healthy message when no products are low in stock', () => {
    render(<AdminLowStockAlerts lowStockProducts={[]} onRestock={vi.fn()} />);

    expect(screen.getByText(/All items healthy!/i)).toBeInTheDocument();
  });

  it('renders low stock items with restock action button', () => {
    const handleRestock = vi.fn();
    const mockLowStock = [
      { id: 101, name: 'Amul Butter', stockQuantity: 2, lowStockThreshold: 10, imageUrl: '' },
    ];

    render(<AdminLowStockAlerts lowStockProducts={mockLowStock} onRestock={handleRestock} />);

    expect(screen.getByText(/Amul Butter/i)).toBeInTheDocument();
    expect(screen.getByText(/Restock \+50/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Restock \+50/i));
    expect(handleRestock).toHaveBeenCalledWith(101, 50);
  });
});

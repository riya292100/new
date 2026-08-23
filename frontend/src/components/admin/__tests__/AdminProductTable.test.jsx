import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminProductTable from '../AdminProductTable';

describe('AdminProductTable Component', () => {
  const mockOnAddProduct = vi.fn();
  const mockOnEditProduct = vi.fn();
  const mockOnDeleteProduct = vi.fn();

  const dummyProducts = [
    {
      id: 1,
      name: 'Organic Whole Milk',
      brand: 'Amul',
      unitQuantity: '1 L',
      categoryName: 'Dairy & Eggs',
      price: 64,
      sellingPrice: 64,
      stockQuantity: 40,
      imageUrl: 'https://images.unsplash.com/milk',
      isFeatured: true,
      isDailyDeal: false,
    },
  ];

  it('renders table headers, product list items, and triggers action callbacks', () => {
    render(
      <AdminProductTable
        products={dummyProducts}
        onAddProduct={mockOnAddProduct}
        onEditProduct={mockOnEditProduct}
        onDeleteProduct={mockOnDeleteProduct}
      />
    );

    expect(screen.getByText('Catalog Products (1)')).toBeInTheDocument();
    expect(screen.getByText('Organic Whole Milk')).toBeInTheDocument();
    expect(screen.getByText('Dairy & Eggs')).toBeInTheDocument();
    expect(screen.getByText('40 in stock')).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /Add Product/i });
    fireEvent.click(addBtn);
    expect(mockOnAddProduct).toHaveBeenCalled();

    const editBtn = screen.getByTitle('Edit Product');
    fireEvent.click(editBtn);
    expect(mockOnEditProduct).toHaveBeenCalledWith(dummyProducts[0]);

    const deleteBtn = screen.getByTitle('Delete Product');
    fireEvent.click(deleteBtn);
    expect(mockOnDeleteProduct).toHaveBeenCalledWith(1);
  });
});

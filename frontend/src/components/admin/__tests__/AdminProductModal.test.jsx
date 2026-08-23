import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminProductModal from '../AdminProductModal';

describe('AdminProductModal Component', () => {
  const mockSetProductForm = vi.fn();
  const mockOnSave = vi.fn((e) => e.preventDefault());
  const mockOnClose = vi.fn();

  const dummyCategories = [{ id: 1, name: 'Fresh Fruits & Vegetables' }];

  const dummyForm = {
    name: 'Fresh Alphonso Mangoes',
    slug: 'fresh-alphonso-mangoes',
    brand: 'QuickFarm',
    unitQuantity: '1 kg',
    mrp: 499,
    price: 399,
    discountPercentage: 20,
    stockQuantity: 100,
    lowStockThreshold: 10,
    categoryId: 1,
    imageUrl: 'https://images.unsplash.com/mango',
    description: 'Sweet and juicy seasonal mangoes',
    active: true,
    featured: true,
    dailyDeal: false,
  };

  it('renders modal form in add mode and calls onSave on submit', () => {
    render(
      <AdminProductModal
        show={true}
        editingProduct={null}
        productForm={dummyForm}
        setProductForm={mockSetProductForm}
        categories={dummyCategories}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fresh Alphonso Mangoes')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Create Product/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('calls onClose when close icon button is clicked', () => {
    render(
      <AdminProductModal
        show={true}
        editingProduct={dummyForm}
        productForm={dummyForm}
        setProductForm={mockSetProductForm}
        categories={dummyCategories}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Edit Catalog Product')).toBeInTheDocument();
    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

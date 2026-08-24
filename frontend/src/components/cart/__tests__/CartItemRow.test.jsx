import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartItemRow from '../CartItemRow';

describe('CartItemRow Component', () => {
  it('renders item details, unit, pricing and handles increment/decrement', () => {
    const onUpdateQuantity = vi.fn();
    const item = {
      id: 101,
      productName: 'Organic Whole Milk',
      unitQuantity: '1 Litre',
      unitPrice: 65,
      mrp: 75,
      quantity: 2,
      productImage: 'https://example.com/milk.png',
    };

    render(<CartItemRow item={item} onUpdateQuantity={onUpdateQuantity} />);

    expect(screen.getByText('Organic Whole Milk')).toBeInTheDocument();
    expect(screen.getByText('1 Litre')).toBeInTheDocument();
    expect(screen.getByText('₹130')).toBeInTheDocument();
    expect(screen.getByText('₹150')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    const increaseBtn = screen.getByLabelText(/Increase Organic Whole Milk quantity/i);
    fireEvent.click(increaseBtn);
    expect(onUpdateQuantity).toHaveBeenCalledWith(101, 3);

    const decreaseBtn = screen.getByLabelText(/Decrease Organic Whole Milk quantity/i);
    fireEvent.click(decreaseBtn);
    expect(onUpdateQuantity).toHaveBeenCalledWith(101, 1);
  });
});

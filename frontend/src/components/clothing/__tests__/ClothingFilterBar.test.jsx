import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClothingFilterBar from '../ClothingFilterBar';

describe('ClothingFilterBar Component', () => {
  it('renders department, garment type, size, and sort selectors and fires callbacks', () => {
    const handleSelectDepartment = vi.fn();
    const handleSelectGarmentType = vi.fn();
    const handleSelectSize = vi.fn();
    const handleSelectSortBy = vi.fn();

    render(
      <ClothingFilterBar
        selectedDepartment="All"
        onSelectDepartment={handleSelectDepartment}
        selectedGarmentType="All Types"
        onSelectGarmentType={handleSelectGarmentType}
        selectedSize="All Sizes"
        onSelectSize={handleSelectSize}
        sortBy="featured"
        onSelectSortBy={handleSelectSortBy}
      />
    );

    expect(screen.getByTestId('clothing-filter-bar')).toBeInTheDocument();
    expect(screen.getByText("Men's Wear")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Men's Wear"));
    expect(handleSelectDepartment).toHaveBeenCalledWith("Men's Wear");

    fireEvent.click(screen.getByText('T-Shirts'));
    expect(handleSelectGarmentType).toHaveBeenCalledWith('T-Shirts');

    fireEvent.change(screen.getByTestId('size-selector'), { target: { value: 'M' } });
    expect(handleSelectSize).toHaveBeenCalledWith('M');

    fireEvent.change(screen.getByTestId('sort-selector'), { target: { value: 'price-low' } });
    expect(handleSelectSortBy).toHaveBeenCalledWith('price-low');
  });
});

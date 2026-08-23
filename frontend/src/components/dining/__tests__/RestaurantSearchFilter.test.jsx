import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantSearchFilter from '../RestaurantSearchFilter';

describe('RestaurantSearchFilter Component', () => {
  const mockSetQuery = vi.fn();
  const mockSetCity = vi.fn();
  const mockSetPrice = vi.fn();
  const mockSetVeg = vi.fn();
  const mockSetVegan = vi.fn();
  const mockSetDineIn = vi.fn();
  const mockReset = vi.fn();

  const cities = ['Rome', 'Tokyo', 'New York', 'Paris', 'London'];

  it('renders search controls, options, and handles filter changes', () => {
    render(
      <RestaurantSearchFilter
        searchQuery="Pasta"
        setSearchQuery={mockSetQuery}
        selectedCity="Rome"
        setSelectedCity={mockSetCity}
        cities={cities}
        priceFilter="$$"
        setPriceFilter={mockSetPrice}
        vegetarianOnly={true}
        setVegetarianOnly={mockSetVeg}
        veganOnly={false}
        setVeganOnly={mockSetVegan}
        dineInOnly={true}
        setDineInOnly={mockSetDineIn}
        onResetFilters={mockReset}
      />
    );

    const input = screen.getByPlaceholderText(/Search sushi, pasta, bistro.../i);
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Pasta');

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);
    expect(mockReset).toHaveBeenCalled();
  });
});

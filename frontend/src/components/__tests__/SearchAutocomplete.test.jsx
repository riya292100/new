import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchAutocomplete from '../SearchAutocomplete';
import { catalogApi } from '../../services/api';
import * as CartContextModule from '../../context/CartContext';

describe('SearchAutocomplete Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(catalogApi, 'getSearchSuggestions').mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Amul Taaza Milk',
          price: 28,
          sellingPrice: 28,
          imageUrl: 'https://images.unsplash.com/milk',
        },
      ],
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      addToCart: vi.fn(),
      getItemQuantity: vi.fn().mockReturnValue(0),
    });
  });

  it('renders search input and popular search chips', () => {
    render(
      <BrowserRouter>
        <SearchAutocomplete />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/Search/i);
    expect(input).toBeInTheDocument();

    fireEvent.focus(input);
    expect(screen.getByText('Popular Searches')).toBeInTheDocument();
    expect(screen.getByText('Amul Milk')).toBeInTheDocument();
  });
});

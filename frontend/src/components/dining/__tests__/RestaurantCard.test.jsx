import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RestaurantCard from '../RestaurantCard';

describe('RestaurantCard Component', () => {
  const mockToggleFav = vi.fn();
  const mockBookTable = vi.fn();

  const dummyRestaurant = {
    id: 1,
    name: 'Trattoria da Enzo al 29',
    description: 'Authentic Roman trattoria with fresh pasta.',
    cuisine: 'Italian',
    country: 'Italy',
    city: 'Rome',
    rating: 4.9,
    reviewCount: 340,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/rome',
    isVegetarianFriendly: true,
    isVeganFriendly: false,
    isDineInAvailable: true,
    isFavorite: false,
  };

  it('renders restaurant information, dietary badges, and triggers callbacks', () => {
    render(
      <BrowserRouter>
        <RestaurantCard
          restaurant={dummyRestaurant}
          onToggleFavorite={mockToggleFav}
          onBookTable={mockBookTable}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Trattoria da Enzo al 29')).toBeInTheDocument();
    expect(screen.getByText(/Rome, Italy/i)).toBeInTheDocument();
    expect(screen.getByText('Veg Friendly')).toBeInTheDocument();

    const bookBtn = screen.getByRole('button', { name: /Book Table/i });
    fireEvent.click(bookBtn);
    expect(mockBookTable).toHaveBeenCalledWith(dummyRestaurant);

    const favBtn = screen.getByTitle('Save Restaurant');
    fireEvent.click(favBtn);
    expect(mockToggleFav).toHaveBeenCalledWith(1);
  });
});

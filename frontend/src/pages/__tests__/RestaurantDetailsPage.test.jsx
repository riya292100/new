import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RestaurantDetailsPage from '../RestaurantDetailsPage';
import { restaurantApi } from '../../services/restaurantApi';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('RestaurantDetailsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
      openAuthModal: vi.fn(),
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });

    vi.spyOn(restaurantApi, 'getRestaurantById').mockResolvedValue({
      data: {
        data: {
          id: 1,
          name: 'Trattoria da Enzo al 29',
          description: 'Authentic Roman trattoria with fresh pasta.',
          cuisine: 'Italian',
          country: 'Italy',
          city: 'Rome',
          address: 'Via dei Vascellari, 29',
          rating: 4.9,
          reviewCount: 340,
          priceLevel: '$$',
          imageUrl: 'https://images.unsplash.com/rome',
          galleryImages: ['https://images.unsplash.com/g1'],
          openingHours: '12:30 PM - 11:00 PM',
          phone: '+39 06 581 2260',
          website: 'https://trattoriadaenzo.it',
          isVegetarianFriendly: true,
          isVeganFriendly: false,
          isDineInAvailable: true,
          isFavorite: false,
        },
      },
    });

    vi.spyOn(restaurantApi, 'getReviews').mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            userName: 'Marco Rossi',
            rating: 5,
            comment: 'Best Carbonara in Trastevere!',
          },
        ],
      },
    });
  });

  it('renders restaurant details, opening hours, contact info, and reviews', async () => {
    render(
      <MemoryRouter initialEntries={['/restaurant/1']}>
        <Routes>
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trattoria da Enzo al 29')).toBeInTheDocument();
      expect(screen.getByText(/About the Restaurant/i)).toBeInTheDocument();
      expect(screen.getByText('Best Carbonara in Trastevere!')).toBeInTheDocument();
      expect(screen.getByText('Reserve Table Now')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DiningDiscoveryPage from '../DiningDiscoveryPage';
import { restaurantApi } from '../../services/restaurantApi';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('DiningDiscoveryPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
    });

    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: vi.fn(),
    });

    vi.spyOn(restaurantApi, 'getCuisines').mockResolvedValue({
      data: { data: ['Italian', 'Japanese', 'Indian'] },
    });

    vi.spyOn(restaurantApi, 'getCities').mockResolvedValue({
      data: { data: ['Rome', 'Tokyo', 'Bengaluru'] },
    });

    vi.spyOn(restaurantApi, 'getRestaurants').mockResolvedValue({
      data: {
        data: [
          {
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
          },
        ],
      },
    });
  });

  it('renders hero banner, cuisine pills, filters, and restaurant cards', async () => {
    render(
      <BrowserRouter>
        <DiningDiscoveryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Discover & Reserve Top Restaurants Worldwide/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Trattoria da Enzo al 29')).toBeInTheDocument();
      expect(screen.getByText('All Cuisines')).toBeInTheDocument();
    });
  });
});

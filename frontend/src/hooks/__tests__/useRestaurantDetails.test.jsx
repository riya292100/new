import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRestaurantDetails } from '../useRestaurantDetails';
import { restaurantApi } from '../../services/restaurantApi';

vi.mock('../../services/restaurantApi', () => ({
  restaurantApi: {
    getRestaurantById: vi.fn(),
    getReviews: vi.fn(),
    toggleFavorite: vi.fn(),
    submitReview: vi.fn(),
  },
}));

describe('useRestaurantDetails hook', () => {
  const mockUser = { id: 1, name: 'Alice' };
  const mockAddToast = vi.fn();
  const mockOpenAuthModal = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    restaurantApi.getRestaurantById.mockResolvedValue({
      data: {
        data: {
          id: 10,
          name: 'The French Laundry',
          cuisine: 'French',
          priceLevel: '$$$$',
          address: '6640 Washington St',
          city: 'Yountville',
          country: 'USA',
          isFavorite: false,
        },
      },
    });
    restaurantApi.getReviews.mockResolvedValue({
      data: {
        data: [{ id: 101, rating: 5, comment: 'Exceptional wine pairing and duck confit!' }],
      },
    });
  });

  it('fetches restaurant details and reviews on mount', async () => {
    const { result } = renderHook(() =>
      useRestaurantDetails(10, mockUser, mockAddToast, mockOpenAuthModal, mockNavigate)
    );

    // Initial state
    expect(result.current.loading).toBe(true);

    // Wait for resolution
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.restaurant).toBeDefined();
    expect(result.current.restaurant.name).toBe('The French Laundry');
    expect(result.current.reviews.length).toBe(1);
  });

  it('toggles restaurant favorite status when user is signed in', async () => {
    restaurantApi.toggleFavorite.mockResolvedValue({
      data: { data: true },
    });

    const { result } = renderHook(() =>
      useRestaurantDetails(10, mockUser, mockAddToast, mockOpenAuthModal, mockNavigate)
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleToggleFavorite();
    });

    expect(restaurantApi.toggleFavorite).toHaveBeenCalledWith(10);
    expect(result.current.restaurant.isFavorite).toBe(true);
    expect(mockAddToast).toHaveBeenCalledWith('Added to favorites', 'success');
  });

  it('submits a new review and prepends it to reviews list', async () => {
    restaurantApi.submitReview.mockResolvedValue({
      data: {
        data: { id: 102, rating: 5, comment: 'Incredible experience and service!' },
      },
    });

    const { result } = renderHook(() =>
      useRestaurantDetails(10, mockUser, mockAddToast, mockOpenAuthModal, mockNavigate)
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setNewComment('Incredible experience and service!');
      result.current.setNewRating(5);
    });

    await act(async () => {
      await result.current.handleReviewSubmit({ preventDefault: vi.fn() });
    });

    expect(restaurantApi.submitReview).toHaveBeenCalledWith({
      restaurantId: 10,
      rating: 5,
      comment: 'Incredible experience and service!',
    });
    expect(result.current.reviews.length).toBe(2);
    expect(result.current.newComment).toBe('');
  });
});

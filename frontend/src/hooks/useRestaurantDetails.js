import { useState, useEffect, useCallback } from 'react';
import { restaurantApi } from '../services/restaurantApi';
import { FALLBACK_RESTAURANTS } from '../utils/demoConfig';
import { createLogger } from '../utils/logger';

const log = createLogger('useRestaurantDetails');

export const useRestaurantDetails = (id, user, addToast, openAuthModal, navigate) => {
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);
    log.info('Fetching restaurant details and reviews', { restaurantId: id });

    restaurantApi
      .getRestaurantById(id)
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.data) {
          setRestaurant(res.data.data);
        } else {
          const fb = FALLBACK_RESTAURANTS.find((r) => String(r.id) === String(id));
          if (fb) setRestaurant(fb);
          else if (navigate) navigate('/dining');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        log.warn('Failed to fetch restaurant API, falling back to mock catalog', { err });
        const fb = FALLBACK_RESTAURANTS.find((r) => String(r.id) === String(id));
        if (fb) setRestaurant(fb);
        else if (navigate) navigate('/dining');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    restaurantApi
      .getReviews(id)
      .then((res) => {
        if (isMounted && res?.data?.data) {
          setReviews(res.data.data);
        }
      })
      .catch((err) => {
        log.debug('No reviews found or error fetching reviews', { err });
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleToggleFavorite = useCallback(async () => {
    if (!user) {
      if (addToast) addToast('Sign in to favorite this restaurant', 'info');
      return;
    }

    try {
      const res = await restaurantApi.toggleFavorite(restaurant.id);
      const isFav = res?.data?.data;
      setRestaurant((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
      log.info('Toggled restaurant favorite state', {
        restaurantId: restaurant.id,
        isFavorite: isFav,
      });
      if (addToast) addToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (err) {
      log.error('Failed to toggle favorite', err, { restaurantId: restaurant?.id });
      if (addToast) addToast('Failed to update favorite', 'error');
    }
  }, [user, restaurant, addToast]);

  const handleReviewSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      if (!user) {
        if (openAuthModal) openAuthModal('LOGIN');
        return;
      }

      if (!newComment.trim() || newComment.length < 5) {
        if (addToast) addToast('Review must be at least 5 characters', 'error');
        return;
      }

      setSubmittingReview(true);
      try {
        const res = await restaurantApi.submitReview({
          restaurantId: restaurant.id,
          rating: newRating,
          comment: newComment,
        });

        if (res?.data?.data) {
          setReviews((prev) => [res.data.data, ...prev]);
          setNewComment('');
          setNewRating(5);
          log.info('Submitted new verified restaurant review', {
            restaurantId: restaurant.id,
            rating: newRating,
          });
          if (addToast) addToast('Review submitted successfully!', 'success');
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to submit review';
        log.error('Review submission failed', err, { restaurantId: restaurant?.id });
        if (addToast) addToast(msg, 'error');
      } finally {
        setSubmittingReview(false);
      }
    },
    [user, newComment, newRating, restaurant, openAuthModal, addToast]
  );

  const handleShare = useCallback(() => {
    if (navigator.share && restaurant) {
      navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name} on QuickCart Dining!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      if (addToast) addToast('Link copied to clipboard!', 'success');
    }
  }, [restaurant, addToast]);

  return {
    restaurant,
    reviews,
    loading,
    showBookingModal,
    setShowBookingModal,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    submittingReview,
    handleToggleFavorite,
    handleReviewSubmit,
    handleShare,
  };
};

export default useRestaurantDetails;

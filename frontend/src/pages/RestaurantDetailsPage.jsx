import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Utensils, Share2, ChevronLeft, MessageSquare } from 'lucide-react';
import { restaurantApi } from '../services/restaurantApi';
import { FALLBACK_RESTAURANTS } from '../utils/demoConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DietaryBadge from '../components/dining/DietaryBadge';
import TableBookingModal from '../components/dining/TableBookingModal';
import RestaurantGallery from './restaurant-details/RestaurantGallery';
import RestaurantReviewForm from './restaurant-details/RestaurantReviewForm';
import RestaurantReviewList from './restaurant-details/RestaurantReviewList';
import RestaurantInfoCards from './restaurant-details/RestaurantInfoCards';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      restaurantApi
        .getRestaurantById(id)
        .then((res) => {
          if (res?.data?.data) {
            setRestaurant(res.data.data);
          } else {
            const fb = FALLBACK_RESTAURANTS.find((r) => String(r.id) === String(id));
            if (fb) setRestaurant(fb);
            else navigate('/dining');
          }
        })
        .catch(() => {
          const fb = FALLBACK_RESTAURANTS.find((r) => String(r.id) === String(id));
          if (fb) setRestaurant(fb);
          else navigate('/dining');
        })
        .finally(() => setLoading(false));

      restaurantApi
        .getReviews(id)
        .then((res) => {
          if (res?.data?.data) setReviews(res.data.data);
        })
        .catch(() => {});
    }
  }, [id, navigate]);

  const handleToggleFavorite = async () => {
    if (!user) {
      addToast('Sign in to favorite this restaurant', 'info');
      return;
    }

    try {
      const res = await restaurantApi.toggleFavorite(restaurant.id);
      const isFav = res?.data?.data;
      setRestaurant({ ...restaurant, isFavorite: isFav });
      addToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      addToast('Failed to update favorite', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('LOGIN');
      return;
    }

    if (!newComment.trim() || newComment.length < 5) {
      addToast('Review must be at least 5 characters', 'error');
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
        setReviews([res.data.data, ...reviews]);
        setNewComment('');
        setNewRating(5);
        addToast('Review submitted successfully!', 'success');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review';
      addToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name} on QuickCart Dining!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <Utensils
          size={36}
          className="animate-spin"
          color="#059669"
          style={{ margin: '0 auto 16px' }}
        />
        <h3>Loading restaurant details...</h3>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      {/* Navigation Breadcrumb */}
      <Link
        to="/dining"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: '600',
          marginBottom: '16px',
        }}
      >
        <ChevronLeft size={16} /> Back to Dining Discovery
      </Link>

      {/* Hero Visual Gallery */}
      <RestaurantGallery
        imageUrl={restaurant.imageUrl}
        name={restaurant.name}
        galleryImages={restaurant.galleryImages}
      />

      {/* Layout Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
        }}
      >
        {/* Left: Metadata, Description, Information & Verified Reviews */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#059669',
                    textTransform: 'uppercase',
                  }}
                >
                  {restaurant.cuisine} Cuisine
                </span>
                <span>•</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>
                  {restaurant.priceLevel}
                </span>
              </div>
              <h1
                style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '800', margin: '0 0 6px' }}
              >
                {restaurant.name}
              </h1>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={15} color="#059669" /> {restaurant.address}, {restaurant.city},{' '}
                {restaurant.country}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="btn btn-outline"
                style={{
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Favorite"
              >
                <Heart
                  size={20}
                  fill={restaurant.isFavorite ? '#ef4444' : 'none'}
                  color={restaurant.isFavorite ? '#ef4444' : '#64748b'}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="btn btn-outline"
                style={{
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Share"
              >
                <Share2 size={18} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Dietary Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 24px' }}>
            {restaurant.isVegetarian && <DietaryBadge type="VEGETARIAN" />}
            {restaurant.isVegan && <DietaryBadge type="VEGAN" />}
            {restaurant.isDineInAvailable && <DietaryBadge type="DINE_IN" />}
          </div>

          {/* Editorial Description */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
              About the Restaurant
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
              {restaurant.description}
            </p>
          </div>

          {/* Practical Info Grid */}
          <RestaurantInfoCards
            openingHours={restaurant.openingHours}
            phone={restaurant.phone}
            website={restaurant.website}
          />

          {/* Verified Diner Reviews */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <h3
              style={{
                fontSize: '1.2rem',
                color: '#0f172a',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MessageSquare size={20} color="#059669" /> Verified Diner Reviews ({reviews.length})
            </h3>

            <RestaurantReviewForm
              user={user}
              newRating={newRating}
              setNewRating={setNewRating}
              newComment={newComment}
              setNewComment={setNewComment}
              submittingReview={submittingReview}
              onSubmit={handleReviewSubmit}
              onOpenAuth={openAuthModal}
            />

            <RestaurantReviewList reviews={reviews} />
          </div>
        </div>

        {/* Right: Sticky Booking CTA Card */}
        <div>
          <div
            style={{
              position: 'sticky',
              top: '100px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Instant Reservation
                </span>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '2px 0 0' }}>
                  Book a Table
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#fef3c7',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  color: '#d97706',
                }}
              >
                <Star size={14} fill="#d97706" /> {restaurant.rating || '4.8'}
              </div>
            </div>

            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                marginBottom: '20px',
                lineHeight: '1.5',
              }}
            >
              Reserve your table with guaranteed seating. Instant confirmation with booking
              reference code.
            </p>

            <button
              onClick={() => setShowBookingModal(true)}
              className="btn btn-primary btn-block"
              style={{
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Utensils size={18} /> Reserve Table Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <TableBookingModal
          restaurant={restaurant}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default RestaurantDetailsPage;

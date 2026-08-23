import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Utensils,
  Share2,
  ChevronLeft,
  MessageSquare,
  Send,
} from 'lucide-react';
import { restaurantApi } from '../services/restaurantApi';
import { FALLBACK_RESTAURANTS } from '../utils/demoConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DietaryBadge from '../components/dining/DietaryBadge';
import TableBookingModal from '../components/dining/TableBookingModal';
import logger from '../utils/logger';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Review form
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
    } catch (err) {
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
      {/* Back button */}
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

      {/* Hero Gallery Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        <div style={{ height: '360px', position: 'relative' }}>
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {restaurant.galleryImages && restaurant.galleryImages.length > 0 && (
          <div
            style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px', height: '360px' }}
          >
            {restaurant.galleryImages.slice(0, 2).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Details & Booking Action Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
        }}
      >
        {/* Left Column: Details, Highlights, Description, Reviews */}
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

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 24px' }}>
            {restaurant.isVegetarianFriendly && <DietaryBadge type="VEGETARIAN" />}
            {restaurant.isVeganFriendly && <DietaryBadge type="VEGAN" />}
            {restaurant.isDineInAvailable && <DietaryBadge type="DINE_IN" />}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '10px' }}>
              About the Restaurant
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6' }}>
              {restaurant.description}
            </p>
          </div>

          {/* Opening Hours & Contact Details */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              marginBottom: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                <Clock size={14} /> Opening Hours
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                {restaurant.openingHours || '11:00 AM - 11:00 PM Daily'}
              </p>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                <Phone size={14} /> Telephone
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                {restaurant.phone || '+1 800-555-DINE'}
              </p>
            </div>

            {restaurant.website && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  <Globe size={14} /> Official Site
                </div>
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.9rem',
                    color: '#059669',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

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

            {/* Review Submission Form */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '20px',
                border: '1px solid #f1f5f9',
              }}
            >
              {user ? (
                <form onSubmit={handleReviewSubmit}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                      Your Rating:
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <Star
                            size={20}
                            fill={s <= newRating ? '#f59e0b' : 'none'}
                            color={s <= newRating ? '#f59e0b' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Share details of your dining experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submittingReview}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Post Review
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '8px' }}>
                    Sign in to leave a verified dining review.
                  </p>
                  <button onClick={() => openAuthModal('LOGIN')} className="btn btn-outline btn-sm">
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.length === 0 ? (
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.88rem',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  No reviews yet for this restaurant. Be the first to review!
                </p>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '14px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{r.userName}</strong>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Table Reservation Card */}
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

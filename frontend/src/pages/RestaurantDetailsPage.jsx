import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Utensils, Share2, ChevronLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DietaryBadge from '../components/dining/DietaryBadge';
import TableBookingModal from '../components/dining/TableBookingModal';
import RestaurantGallery from './restaurant-details/RestaurantGallery';
import RestaurantReviewForm from './restaurant-details/RestaurantReviewForm';
import RestaurantReviewList from './restaurant-details/RestaurantReviewList';
import RestaurantInfoCards from './restaurant-details/RestaurantInfoCards';
import useRestaurantDetails from '../hooks/useRestaurantDetails';
import styles from './RestaurantDetailsPage.module.css';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const {
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
  } = useRestaurantDetails(id, user, addToast, openAuthModal, navigate);

  if (loading) {
    return (
      <div className={`container ${styles.loadingContainer}`}>
        <Utensils size={36} className={`animate-spin ${styles.loadingSpinner}`} color="#059669" />
        <h3>Loading restaurant details...</h3>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className={`container ${styles.pageContainer}`}>
      {/* Navigation Breadcrumb */}
      <Link to="/dining" className={styles.backLink}>
        <ChevronLeft size={16} /> Back to Dining Discovery
      </Link>

      {/* Hero Visual Gallery */}
      <RestaurantGallery
        imageUrl={restaurant.imageUrl}
        name={restaurant.name}
        galleryImages={restaurant.galleryImages}
      />

      {/* Layout Columns */}
      <div className={styles.layoutGrid}>
        {/* Left Column: Metadata, Description, Information & Verified Reviews */}
        <div className={styles.leftColumn}>
          <div className={styles.headerRow}>
            <div>
              <div className={styles.metaRow}>
                <span className={styles.cuisineBadge}>{restaurant.cuisine} Cuisine</span>
                <span className={styles.dotSeparator}>•</span>
                <span className={styles.priceLevel}>{restaurant.priceLevel}</span>
              </div>
              <h1 className={styles.restaurantTitle}>{restaurant.name}</h1>
              <p className={styles.addressText}>
                <MapPin size={15} color="#059669" /> {restaurant.address}, {restaurant.city},{' '}
                {restaurant.country}
              </p>
            </div>

            <div className={styles.actionsGroup}>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`btn btn-outline ${styles.circleBtn}`}
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
                className={`btn btn-outline ${styles.circleBtn}`}
                title="Share"
              >
                <Share2 size={20} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className={styles.statsBar}>
            <div className={styles.ratingBox}>
              <Star size={16} fill="#ffffff" />{' '}
              {restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}
            </div>
            <span className={styles.ratingCount}>
              ({restaurant.totalRatings || reviews.length || 0} reviews)
            </span>
            <span className={styles.dotSeparator}>•</span>
            <span className={styles.openingHours}>
              Open Today: {restaurant.openingHours || '11:00 AM - 11:00 PM'}
            </span>
          </div>

          {/* Tags */}
          <div className={styles.tagsContainer}>
            {restaurant.pureVeg && <DietaryBadge isVeg />}
            {restaurant.isMichelinStarred && (
              <span className={styles.tagBadge}>⭐ Michelin Guide</span>
            )}
            {restaurant.hasOutdoorSeating && (
              <span className={styles.tagBadge}>🌿 Outdoor Seating</span>
            )}
            {restaurant.hasValetParking && (
              <span className={styles.tagBadge}>🚗 Valet Parking</span>
            )}
          </div>

          {/* About the Restaurant */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              About the Restaurant
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
              {restaurant.description ||
                'Experience exquisite gourmet culinary artistry with curated seasonal farm-to-table dishes.'}
            </p>
          </div>

          {/* Structured Detail Cards */}
          <RestaurantInfoCards
            openingHours={restaurant.openingHours}
            phone={restaurant.phone}
            website={restaurant.website}
          />

          {/* Customer Reviews Section */}
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

        {/* Right Column: Sticky Table Reservation Card */}
        <div>
          <div className={styles.bookingStickyCard}>
            <h3 className={styles.bookingHeading}>Reserve a Table</h3>
            <p className={styles.bookingSubtitle}>
              Instant confirmation • Direct restaurant booking
            </p>
            <div className={styles.bookingPerk}>
              <MessageSquare size={16} color="#059669" />
              <span>Special dietary requests supported</span>
            </div>
            <div className={styles.bookingPerk}>
              <Utensils size={16} color="#059669" />
              <span>Priority seating on arrival</span>
            </div>
            <button
              type="button"
              className={`btn btn-primary ${styles.bookTableBtn}`}
              onClick={() => setShowBookingModal(true)}
            >
              Reserve Table Now
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <TableBookingModal restaurant={restaurant} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

export default RestaurantDetailsPage;

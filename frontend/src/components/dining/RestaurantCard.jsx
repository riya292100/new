import React from 'react';
import PropTypes from 'prop-types';
import { Star, MapPin, Heart, Clock, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import DietaryBadge from './DietaryBadge';

const RestaurantCard = ({ restaurant, onToggleFavorite = () => {}, onBookTable = () => {} }) => {
  if (!restaurant) return null;

  return (
    <div className="qc-dining-card">
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(restaurant.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
          title={restaurant.isFavorite ? 'Remove Favorite' : 'Save Restaurant'}
        >
          <Heart
            size={18}
            fill={restaurant.isFavorite ? '#ef4444' : 'none'}
            color={restaurant.isFavorite ? '#ef4444' : '#64748b'}
          />
        </button>

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{restaurant.rating || '4.8'}</span>
          <span style={{ color: '#94a3b8' }}>({restaurant.reviewCount || 0})</span>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
          }}
        >
          <h3
            style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}
          >
            <Link
              to={`/restaurant/${restaurant.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {restaurant.name}
            </Link>
          </h3>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#059669',
              background: '#ecfdf5',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            {restaurant.priceLevel || '$$'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: '#64748b',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontWeight: '600', color: '#334155' }}>{restaurant.cuisine}</span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <MapPin size={12} /> {restaurant.city}, {restaurant.country}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.82rem',
            color: '#64748b',
            lineHeight: '1.4',
            marginBottom: '12px',
            flex: 1,
          }}
        >
          {restaurant.description}
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {restaurant.isVegetarianFriendly && <DietaryBadge type="VEGETARIAN" />}
          {restaurant.isVeganFriendly && <DietaryBadge type="VEGAN" />}
          {restaurant.isDineInAvailable && <DietaryBadge type="DINE_IN" />}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link
            to={`/restaurant/${restaurant.id}`}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
          >
            View Details
          </Link>
          {restaurant.isDineInAvailable && (
            <button
              type="button"
              onClick={() => onBookTable(restaurant)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Utensils size={14} /> Book Table
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    cuisine: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    priceLevel: PropTypes.string,
    imageUrl: PropTypes.string,
    isVegetarianFriendly: PropTypes.bool,
    isVeganFriendly: PropTypes.bool,
    isDineInAvailable: PropTypes.bool,
    isFavorite: PropTypes.bool,
  }).isRequired,
  onToggleFavorite: PropTypes.func,
  onBookTable: PropTypes.func,
};

export default RestaurantCard;

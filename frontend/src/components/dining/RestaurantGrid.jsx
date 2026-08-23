import React from 'react';
import PropTypes from 'prop-types';
import RestaurantCard from './RestaurantCard';
import { UtensilsCrossed } from 'lucide-react';

const RestaurantGrid = ({
  restaurants = [],
  loading = false,
  onToggleFavorite = () => {},
  onBookTable = () => {},
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
          <UtensilsCrossed size={32} color="#059669" />
        </div>
        <p style={{ fontWeight: '600' }}>Discovering global dining experiences...</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <UtensilsCrossed size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '8px' }}>
          No matching dining spots found
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
          Try clearing some filters or searching for another cuisine, city, or restaurant name.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
      }}
    >
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onToggleFavorite={onToggleFavorite}
          onBookTable={onBookTable}
        />
      ))}
    </div>
  );
};

RestaurantGrid.propTypes = {
  restaurants: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
  onBookTable: PropTypes.func,
};

export default RestaurantGrid;

import React from 'react';
import PropTypes from 'prop-types';
import { Leaf, Utensils, Sparkles } from 'lucide-react';

const DietaryBadge = ({ type }) => {
  if (type === 'VEGETARIAN') {
    return (
      <span className="qc-nutrition-badge organic" style={{ fontSize: '0.72rem' }}>
        <Leaf size={12} /> Veg Friendly
      </span>
    );
  }
  if (type === 'VEGAN') {
    return (
      <span className="qc-nutrition-badge vegan" style={{ fontSize: '0.72rem' }}>
        <Sparkles size={12} /> 100% Vegan
      </span>
    );
  }
  if (type === 'DINE_IN') {
    return (
      <span className="qc-nutrition-badge protein" style={{ fontSize: '0.72rem' }}>
        <Utensils size={12} /> Dine-In & Booking
      </span>
    );
  }
  return null;
};

DietaryBadge.propTypes = {
  type: PropTypes.oneOf(['VEGETARIAN', 'VEGAN', 'DINE_IN']).isRequired,
};

export default DietaryBadge;

import React from 'react';
import PropTypes from 'prop-types';

const CuisinePills = ({ cuisines = [], selectedCuisine = '', onSelectCuisine = () => {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0 12px',
        scrollbarWidth: 'none',
      }}
    >
      <button
        type="button"
        className={`qc-cuisine-pill ${selectedCuisine === '' ? 'active' : ''}`}
        onClick={() => onSelectCuisine('')}
      >
        All Cuisines
      </button>
      {cuisines.map((cuisine) => (
        <button
          type="button"
          key={cuisine}
          className={`qc-cuisine-pill ${selectedCuisine.toLowerCase() === cuisine.toLowerCase() ? 'active' : ''}`}
          onClick={() => onSelectCuisine(cuisine)}
        >
          {cuisine}
        </button>
      ))}
    </div>
  );
};

CuisinePills.propTypes = {
  cuisines: PropTypes.arrayOf(PropTypes.string),
  selectedCuisine: PropTypes.string,
  onSelectCuisine: PropTypes.func,
};

export default CuisinePills;

import React from 'react';
import PropTypes from 'prop-types';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';

const RestaurantSearchFilter = ({
  searchQuery = '',
  setSearchQuery = () => {},
  selectedCity = '',
  setSelectedCity = () => {},
  cities = [],
  priceFilter = '',
  setPriceFilter = () => {},
  vegetarianOnly = false,
  setVegetarianOnly = () => {},
  veganOnly = false,
  setVeganOnly = () => {},
  dineInOnly = false,
  setDineInOnly = () => {},
  onResetFilters = () => {},
}) => {
  const hasActiveFilters =
    searchQuery || selectedCity || priceFilter || vegetarianOnly || veganOnly || dineInOnly;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Keyword Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '12px' }}
          />
          <input
            type="text"
            className="input-control"
            placeholder="Search sushi, pasta, bistro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>

        {/* Global City Dropdown */}
        <div style={{ position: 'relative' }}>
          <MapPin
            size={18}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '12px' }}
          />
          <select
            className="input-control"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          >
            <option value="">All Global Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Price Level Filter */}
        <div>
          <select
            className="input-control"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            style={{ height: '42px' }}
          >
            <option value="">All Price Levels</option>
            <option value="$">$ (Inexpensive / Casual)</option>
            <option value="$$">$$ (Moderate Dining)</option>
            <option value="$$$">$$$ (Upscale)</option>
            <option value="$$$$">$$$$ (Fine Dining)</option>
          </select>
        </div>
      </div>

      {/* Dietary & Service Checkbox Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={vegetarianOnly}
              onChange={(e) => setVegetarianOnly(e.target.checked)}
            />
            Vegetarian Options
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={veganOnly}
              onChange={(e) => setVeganOnly(e.target.checked)}
            />
            100% Vegan
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={dineInOnly}
              onChange={(e) => setDineInOnly(e.target.checked)}
            />
            Table Booking Available
          </label>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

RestaurantSearchFilter.propTypes = {
  searchQuery: PropTypes.string,
  setSearchQuery: PropTypes.func,
  selectedCity: PropTypes.string,
  setSelectedCity: PropTypes.func,
  cities: PropTypes.arrayOf(PropTypes.string),
  priceFilter: PropTypes.string,
  setPriceFilter: PropTypes.func,
  vegetarianOnly: PropTypes.bool,
  setVegetarianOnly: PropTypes.func,
  veganOnly: PropTypes.bool,
  setVeganOnly: PropTypes.func,
  dineInOnly: PropTypes.bool,
  setDineInOnly: PropTypes.func,
  onResetFilters: PropTypes.func,
};

export default RestaurantSearchFilter;

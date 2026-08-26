import React from 'react';
import PropTypes from 'prop-types';

export const DEPARTMENTS = ['All', "Men's Wear", "Women's Wear", 'Unisex'];
export const GARMENT_TYPES = [
  'All Types',
  'T-Shirts',
  'Jeans',
  'Shirts',
  'Dresses',
  'Activewear',
  'Hoodies',
  'Ethnic Wear',
  'Trousers',
];
export const SIZES = ['All Sizes', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36'];

const ClothingFilterBar = ({
  selectedDepartment,
  onSelectDepartment,
  selectedGarmentType,
  onSelectGarmentType,
  selectedSize,
  onSelectSize,
  sortBy,
  onSelectSortBy,
}) => {
  return (
    <div
      data-testid="clothing-filter-bar"
      className="glass-card"
      style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Department Pills */}
      <div
        data-testid="department-pills"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '14px',
        }}
      >
        <span
          style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', marginRight: '4px' }}
        >
          DEPARTMENT:
        </span>
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedDepartment === dept;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => onSelectDepartment(dept)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                background: isSelected ? '#ecfdf5' : '#f8fafc',
                color: isSelected ? '#065f46' : '#334155',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {dept}
            </button>
          );
        })}
      </div>

      {/* Garment Type & Size Filter Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Garment Type Pills */}
        <div
          data-testid="garment-type-pills"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            flex: 1,
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>TYPE:</span>
          {GARMENT_TYPES.map((type) => {
            const isSelected = selectedGarmentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectGarmentType(type)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  border: isSelected ? '1px solid #059669' : '1px solid #e2e8f0',
                  background: isSelected ? '#059669' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Size Filter Dropdown / Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>SIZE:</span>
            <select
              data-testid="size-selector"
              aria-label="Filter by size"
              value={selectedSize}
              onChange={(e) => onSelectSize(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>SORT:</span>
            <select
              data-testid="sort-selector"
              aria-label="Sort products by"
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <option value="featured">✨ Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated (★)</option>
              <option value="discount">Biggest Savings (%)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

ClothingFilterBar.propTypes = {
  selectedDepartment: PropTypes.string.isRequired,
  onSelectDepartment: PropTypes.func.isRequired,
  selectedGarmentType: PropTypes.string.isRequired,
  onSelectGarmentType: PropTypes.func.isRequired,
  selectedSize: PropTypes.string.isRequired,
  onSelectSize: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSelectSortBy: PropTypes.func.isRequired,
};

export default ClothingFilterBar;

import React from 'react';
import PropTypes from 'prop-types';
import { Ruler } from 'lucide-react';
import ClothSizeGuideTable from './ClothSizeGuideTable';

const ClothGarmentSpecs = ({
  availableSizes,
  selectedSize,
  setSelectedSize,
  availableColors,
  selectedColor,
  setSelectedColor,
  showSizeChart,
  setShowSizeChart,
  product,
}) => {
  return (
    <>
      {/* Interactive Size Selector */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
            Select Size: <span style={{ color: '#059669', fontWeight: '800' }}>{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowSizeChart(!showSizeChart)}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Ruler size={13} /> {showSizeChart ? 'Hide Size Guide' : 'Size Guide'}
          </button>
        </div>

        {/* Size Chart Popup */}
        {showSizeChart && <ClothSizeGuideTable />}

        {/* Size Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: isSelected ? '#ecfdf5' : '#ffffff',
                  color: isSelected ? '#065f46' : '#1e293b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Swatches */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '8px',
          }}
        >
          Color: <span style={{ color: '#059669', fontWeight: '800' }}>{selectedColor}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableColors.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                  background: isSelected ? '#f0fdf4' : '#f8fafc',
                  color: isSelected ? '#15803d' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric & Fit Specifications */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '0.82rem',
          color: '#334155',
        }}
      >
        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
          Fabric & Care:
        </div>
        <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.5' }}>
          <li>{product.fabric || '100% Breathable Combed Cotton'}</li>
          <li>{product.fit || 'Regular Fit · Pre-Shrunk Material'}</li>
          <li>Easy 7-day doorstep exchange & return guarantee</li>
        </ul>
      </div>
    </>
  );
};

ClothGarmentSpecs.propTypes = {
  availableSizes: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedSize: PropTypes.string.isRequired,
  setSelectedSize: PropTypes.func.isRequired,
  availableColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedColor: PropTypes.string.isRequired,
  setSelectedColor: PropTypes.func.isRequired,
  showSizeChart: PropTypes.bool.isRequired,
  setShowSizeChart: PropTypes.func.isRequired,
  product: PropTypes.shape({
    fabric: PropTypes.string,
    fit: PropTypes.string,
  }).isRequired,
};

export default ClothGarmentSpecs;

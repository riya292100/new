import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../ProductCard';

const RelatedProductsRow = ({ relatedProducts = [], onSelectProduct = () => {} }) => {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div style={{ marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
      <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px' }}>
        Frequently Bought Together
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {relatedProducts.slice(0, 4).map((p) => (
          <div key={p.id} onClick={() => onSelectProduct(p)} style={{ cursor: 'pointer' }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

RelatedProductsRow.propTypes = {
  relatedProducts: PropTypes.arrayOf(PropTypes.object),
  onSelectProduct: PropTypes.func,
};

export default RelatedProductsRow;

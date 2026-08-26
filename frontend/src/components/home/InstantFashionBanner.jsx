import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Shirt, Sparkles, ArrowRight } from 'lucide-react';
import ClothCard from '../clothing/ClothCard';

const InstantFashionBanner = ({ clothes = [], onSelectCloth }) => {
  return (
    <div data-testid="instant-fashion-section" style={{ marginBottom: '40px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shirt size={20} color="#059669" />
            <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
              ⚡ 15-Min Instant Clothes & Fashion
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Everyday cotton tees, stretch denims, hoodies & ethnic fits with instant delivery
          </p>
        </div>
        <Link
          to="/clothes"
          style={{
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#059669',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Explore Clothes Store <ArrowRight size={16} />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '18px',
        }}
      >
        {clothes.slice(0, 4).map((cloth) => (
          <ClothCard
            key={cloth.id}
            product={cloth}
            onSelectProduct={(p) => onSelectCloth && onSelectCloth(p)}
          />
        ))}
      </div>
    </div>
  );
};

InstantFashionBanner.propTypes = {
  clothes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      brand: PropTypes.string,
      sellingPrice: PropTypes.number,
    })
  ),
  onSelectCloth: PropTypes.func,
};

export default InstantFashionBanner;

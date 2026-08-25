import React from 'react';
import PropTypes from 'prop-types';
import { Star, Plus, Minus, Clock, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product = {}, onSelectProduct = null }) => {
  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();
  const quantity = getItemQuantity(product?.id);
  const cartItemId = getItemCartId(product?.id);

  return (
    <div
      className="hover-elevate"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => onSelectProduct && onSelectProduct(product)}
    >
      {/* Top Badges */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        {product.discountPercentage > 0 ? (
          <span className="badge badge-discount">{product.discountPercentage}% OFF</span>
        ) : (
          <span />
        )}

        <span className="badge badge-delivery" style={{ fontSize: '0.62rem' }}>
          ⚡ 12 MINS
        </span>
      </div>

      {/* Image with subtle zoom */}
      <div
        style={{
          width: '100%',
          height: '140px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '16px',
          marginBottom: '10px',
        }}
      >
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          {product.brand || 'QuickCart Direct'}
        </div>
        <h4
          style={{
            fontSize: '0.92rem',
            color: '#0f172a',
            lineHeight: '1.3',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px',
          }}
        >
          {product.name}
        </h4>

        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
          {product.unitQuantity || 'Standard Pack'}
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            <Star size={12} fill="#059669" /> {product.rating || '4.8'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            ({product.ratingCount || product.reviewCount || 45})
          </span>
        </div>
      </div>

      {/* Price & Quantity Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              ₹{product.sellingPrice ?? product.price ?? 99}
            </span>
            {product.mrp && product.mrp > (product.sellingPrice ?? product.price ?? 99) && (
              <span
                style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}
              >
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Stepper */}
        <div onClick={(e) => e.stopPropagation()}>
          {quantity > 0 ? (
            <div className="qty-stepper">
              <button
                type="button"
                onClick={() => {
                  if (cartItemId) updateQuantity(cartItemId, quantity - 1);
                }}
              >
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  if (cartItemId) updateQuantity(cartItemId, quantity + 1);
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="btn btn-outline-primary btn-sm"
              style={{
                padding: '6px 14px',
                fontWeight: '700',
                borderRadius: '8px',
              }}
            >
              + ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    unitQuantity: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mrp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercentage: PropTypes.number,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    imageUrl: PropTypes.string,
    inStock: PropTypes.bool,
    stockQuantity: PropTypes.number,
  }),
  onSelectProduct: PropTypes.func,
};

export default ProductCard;

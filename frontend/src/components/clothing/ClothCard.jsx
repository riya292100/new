import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Star, Plus, Minus, Check, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ClothCard = ({ product = {}, onSelectProduct = null }) => {
  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();
  const quantity = getItemQuantity(product?.id);
  const cartItemId = getItemCartId(product?.id);

  // Extract sizes from product.sizes array or parse from unitQuantity string
  const availableSizes =
    product.sizes && Array.isArray(product.sizes)
      ? product.sizes
      : product.unitQuantity && product.unitQuantity.includes('Size')
        ? product.unitQuantity
            .replace(/Sizes?:\s*/i, '')
            .split(/[,/]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : ['S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(
      {
        ...product,
        selectedSize,
        unitQuantity: `Size: ${selectedSize}`,
      },
      1
    );
  };

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

        <span
          className="badge badge-delivery"
          style={{ fontSize: '0.62rem', background: '#ecfdf5', color: '#059669' }}
        >
          ⚡ 15 MINS
        </span>
      </div>

      {/* Garment Image */}
      <div
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '16px',
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontWeight: '600',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Eye size={11} /> Quick View
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {product.brand || 'QuickFashion'}
          </span>
          {product.department && (
            <span
              style={{
                fontSize: '0.68rem',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: '600',
              }}
            >
              {product.department}
            </span>
          )}
        </div>

        <h4
          style={{
            fontSize: '0.92rem',
            color: '#0f172a',
            lineHeight: '1.3',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px',
          }}
        >
          {product.name}
        </h4>

        {/* Rating and Fabric */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          {product.fabric && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px',
              }}
              title={product.fabric}
            >
              {product.fabric}
            </span>
          )}
        </div>

        {/* Interactive Size Selector */}
        <div style={{ marginBottom: '12px' }} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#475569',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>SELECT SIZE:</span>
            <span style={{ color: '#059669', fontWeight: '800' }}>{selectedSize}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                    background: isSelected ? '#ecfdf5' : '#ffffff',
                    color: isSelected ? '#065f46' : '#334155',
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
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
              ₹{product.sellingPrice ?? product.price ?? 499}
            </span>
            {product.mrp && product.mrp > (product.sellingPrice ?? product.price ?? 499) && (
              <span
                style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}
              >
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Stepper / Add button */}
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
              onClick={handleAddToCart}
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

ClothCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    brand: PropTypes.string,
    department: PropTypes.string,
    garmentType: PropTypes.string,
    sizes: PropTypes.arrayOf(PropTypes.string),
    colors: PropTypes.arrayOf(PropTypes.string),
    fabric: PropTypes.string,
    unitQuantity: PropTypes.string,
    sellingPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mrp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercentage: PropTypes.number,
    rating: PropTypes.number,
    ratingCount: PropTypes.number,
    reviewCount: PropTypes.number,
    imageUrl: PropTypes.string,
    description: PropTypes.string,
    inStock: PropTypes.bool,
    stockQuantity: PropTypes.number,
  }),
  onSelectProduct: PropTypes.func,
};

export default ClothCard;

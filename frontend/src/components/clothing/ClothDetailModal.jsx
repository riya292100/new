import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Star, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ClothGarmentSpecs from './ClothGarmentSpecs';

const ClothDetailModal = ({ product, onClose }) => {
  const { addToCart, setCartDrawerOpen } = useCart();

  const availableSizes =
    product?.sizes && Array.isArray(product.sizes)
      ? product.sizes
      : product?.unitQuantity && product.unitQuantity.includes('Size')
        ? product.unitQuantity
            .replace(/Sizes?:\s*/i, '')
            .split(/[,/]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : ['S', 'M', 'L', 'XL', 'XXL'];

  const availableColors =
    product?.colors && Array.isArray(product.colors)
      ? product.colors
      : ['Midnight Black', 'Classic Navy', 'Pure White', 'Heather Grey'];

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || 'Default');
  const [selectedImage, setSelectedImage] = useState(product?.imageUrl);
  const [showSizeChart, setShowSizeChart] = useState(false);

  if (!product) return null;

  const images = product?.galleryImages?.length
    ? [product.imageUrl, ...product.galleryImages]
    : [
        product.imageUrl,
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
      ];

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        selectedSize,
        selectedColor,
        unitQuantity: `Size: ${selectedSize} · ${selectedColor}`,
      },
      1
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            zIndex: 10,
          }}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px' }}>
          {/* Left: Garment Photography */}
          <div>
            <div
              style={{
                width: '100%',
                height: '320px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#f8fafc',
                marginBottom: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <img
                src={selectedImage || product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2px solid #059669' : '1px solid #e2e8f0',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>

            {/* Fast Delivery Badge */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '12px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Zap size={20} color="#059669" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#065f46' }}>
                  ⚡ Instant 15-Min Delivery
                </div>
                <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                  Delivered fresh &amp; pressed directly from your nearest QuickCart hub
                </div>
              </div>
            </div>
          </div>

          {/* Right: Garment Specifications & Actions */}
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#059669',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {product.brand || 'QuickFashion Original'}
            </div>

            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.25',
                marginBottom: '8px',
              }}
            >
              {product.name}
            </h2>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                }}
              >
                <Star size={13} fill="#059669" /> {product.rating || '4.8'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({product.ratingCount || product.reviewCount || 120} verified customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0f172a' }}>
                ₹{product.sellingPrice ?? product.price ?? 499}
              </span>
              {product.mrp && product.mrp > (product.sellingPrice ?? product.price ?? 499) && (
                <span
                  style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                  }}
                >
                  ₹{product.mrp}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-discount" style={{ fontSize: '0.82rem' }}>
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Garment Specifications & Size Selector */}
            <ClothGarmentSpecs
              availableSizes={availableSizes}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              availableColors={availableColors}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              showSizeChart={showSizeChart}
              setShowSizeChart={setShowSizeChart}
              product={product}
            />

            {/* Add to Cart CTA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <ShoppingBag size={18} /> Add Size {selectedSize} to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToCart();
                  setCartDrawerOpen(true);
                  onClose();
                }}
                className="btn btn-accent"
                style={{
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  borderRadius: '12px',
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ClothDetailModal.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ClothDetailModal;

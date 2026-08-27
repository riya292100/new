import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Star, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ClothGarmentSpecs from './ClothGarmentSpecs';
import styles from './ClothDetailModal.module.css';

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
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`glass-card ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div className={styles.grid}>
          {/* Left: Garment Photography */}
          <div>
            <div className={styles.imageWrapper}>
              <img
                src={selectedImage || product.imageUrl}
                alt={product.name}
                className={styles.mainImage}
              />
            </div>

            {/* Thumbnail Row */}
            <div className={styles.thumbnailRow}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`${styles.thumbnailBtn} ${selectedImage === img ? styles.thumbnailBtnActive : ''}`}
                >
                  <img src={img} alt="" className={styles.thumbnailImg} />
                </button>
              ))}
            </div>

            {/* Fast Delivery Badge */}
            <div className={styles.deliveryBadge}>
              <Zap size={20} color="#059669" />
              <div>
                <div className={styles.badgeTitle}>⚡ Instant 15-Min Delivery</div>
                <div className={styles.badgeSubtitle}>
                  Delivered fresh &amp; pressed directly from your nearest QuickCart hub
                </div>
              </div>
            </div>
          </div>

          {/* Right: Garment Specifications & Actions */}
          <div>
            <div className={styles.brandLabel}>
              {product.brand || 'QuickFashion Original'}
            </div>

            <h2 className={styles.title}>
              {product.name}
            </h2>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <span className={styles.ratingTag}>
                <Star size={13} fill="#059669" /> {product.rating || '4.8'}
              </span>
              <span className={styles.reviewsText}>
                ({product.ratingCount || product.reviewCount || 120} verified customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className={styles.priceBox}>
              <span className={styles.sellingPrice}>
                ₹{product.sellingPrice ?? product.price ?? 499}
              </span>
              {product.mrp && product.mrp > (product.sellingPrice ?? product.price ?? 499) && (
                <span className={styles.mrp}>
                  ₹{product.mrp}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-discount">
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
            <div className={styles.ctaRow}>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`btn btn-primary ${styles.addToCartBtn}`}
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
                className={`btn btn-accent ${styles.buyNowBtn}`}
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

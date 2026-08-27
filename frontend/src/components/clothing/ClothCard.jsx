import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ClothCard.module.css';

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

  const currentPrice = product.price ?? product.sellingPrice ?? 0;
  const originalPrice = product.mrp ?? product.originalPrice ?? currentPrice;

  return (
    <div
      className={`hover-elevate ${styles.cardContainer}`}
      onClick={() => onSelectProduct && onSelectProduct(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelectProduct && onSelectProduct(product)}
    >
      {/* Top Badges */}
      <div className={styles.topBadges}>
        {product.discountPercentage > 0 ? (
          <span className="badge badge-discount">{product.discountPercentage}% OFF</span>
        ) : (
          <span />
        )}

        <span className={`badge badge-delivery ${styles.deliveryBadge}`}>⚡ 15 MINS</span>
      </div>

      {/* Garment Image */}
      <div className={styles.imageWrapper}>
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          className={styles.garmentImage}
          loading="lazy"
        />
      </div>

      {/* Meta & Branding */}
      <div className={styles.metaSection}>
        <div className={styles.brandRatingRow}>
          <span className={styles.brandText}>{product.brand || 'QuickFashion'}</span>
          <div className={styles.ratingTag}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating || '4.5'}</span>
          </div>
        </div>

        <h3 className={styles.productName}>{product.name}</h3>
        {product.fabric && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 6px' }}>
            {product.fabric}
          </p>
        )}

        {/* Size Selector */}
        <div className={styles.sizeSelectorRow}>
          <span className={styles.sizeLabel}>SELECT SIZE:</span>
          {availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              className={`${styles.sizePill} ${selectedSize === size ? styles.sizePillActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSize(size);
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price and Cart Action */}
      <div className={styles.priceActionRow}>
        <div className={styles.priceGroup}>
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>₹{currentPrice}</span>
            {originalPrice > currentPrice && (
              <span className={styles.originalPrice}>₹{originalPrice}</span>
            )}
          </div>
          <span className={styles.unitQuantityText}>{product.unitQuantity || '1 piece'}</span>
        </div>

        {quantity === 0 ? (
          <button
            type="button"
            className={`btn btn-primary ${styles.addBtn}`}
            onClick={handleAddToCart}
          >
            + ADD
          </button>
        ) : (
          <div className={styles.qtyControls} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => updateQuantity(cartItemId || product.id, quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => updateQuantity(cartItemId || product.id, quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ClothCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.number,
    sellingPrice: PropTypes.number,
    mrp: PropTypes.number,
    originalPrice: PropTypes.number,
    discountPercentage: PropTypes.number,
    rating: PropTypes.number,
    imageUrl: PropTypes.string,
    unitQuantity: PropTypes.string,
    sizes: PropTypes.arrayOf(PropTypes.string),
    fabric: PropTypes.string,
  }),
  onSelectProduct: PropTypes.func,
};

export default ClothCard;

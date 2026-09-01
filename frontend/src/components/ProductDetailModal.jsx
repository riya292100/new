import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Star, Plus, Minus, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { catalogApi, reviewApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateSchema, reviewSchema } from '../utils/validation';
import logger from '../utils/logger';
import ProductNutritionalTable from './product/ProductNutritionalTable';
import RelatedProductsRow from './product/RelatedProductsRow';
import ProductReviewList from './product/ProductReviewList';
import modalStyles from '../styles/modal.module.css';

const ProductDetailModal = ({ product, onClose }) => {
  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const quantity = product ? getItemQuantity(product.id) : 0;
  const cartItemId = product ? getItemCartId(product.id) : null;

  useEffect(() => {
    if (product) {
      reviewApi
        .getProductReviews(product.id)
        .then((res) => {
          if (res?.data) setReviews(res.data);
        })
        .catch((err) => {
          logger.warn('ProductDetailModal', 'Failed to fetch reviews', err);
        });

      catalogApi
        .getRelatedProducts(product.id, 4)
        .then((res) => {
          if (res?.data) setRelatedProducts(res.data);
        })
        .catch((err) => {
          logger.warn('ProductDetailModal', 'Failed to fetch related products', err);
        });
    }
  }, [product]);

  if (!product) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('LOGIN');
      return;
    }

    const valResult = validateSchema(reviewSchema, {
      rating: newRating,
      comment: newComment,
    });

    if (!valResult.isValid) {
      addToast(Object.values(valResult.errors)[0], 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview({
        productId: product.id,
        rating: newRating,
        comment: newComment,
      });
      if (res?.data) {
        setReviews([res.data, ...reviews]);
        setNewComment('');
        setNewRating(5);
        addToast('Review submitted successfully!', 'success');
      }
    } catch (err) {
      logger.error('ProductDetailModal', 'Failed to submit review', err);
      addToast('Failed to post review. You may have already reviewed this product.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div
        className={`${modalStyles.cardScrollable} glass-card`}
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={modalStyles.closeButtonAbsolute}
          aria-label="Close product details modal"
        >
          <X size={20} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px',
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
              {product.brand || 'QuickCart Direct'}
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '4px 0 8px' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
              {product.unitQuantity}
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#fef3c7',
                  color: '#d97706',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                }}
              >
                <Star size={14} fill="#d97706" /> {product.rating || '4.8'}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                ({reviews.length} verified ratings)
              </span>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}
            >
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                ₹{product.price || product.sellingPrice}
              </span>
              {product.mrp && product.mrp > (product.price || product.sellingPrice) && (
                <>
                  <span
                    style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}
                  >
                    ₹{product.mrp}
                  </span>
                  <span
                    className="badge badge-discount"
                    style={{ fontSize: '0.8rem', padding: '3px 8px' }}
                  >
                    {product.discountPercentage ||
                      Math.round(
                        ((product.mrp - (product.price || product.sellingPrice)) / product.mrp) *
                          100
                      )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <div style={{ marginTop: 'auto' }}>
              {quantity > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#059669',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: '#ffffff',
                    width: '160px',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(cartItemId, quantity - 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <Minus size={18} />
                  </button>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItemId, quantity + 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product.id, 1)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px' }}>
            Description
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
            {product.description ||
              'Freshly procured premium quality items packaged under strict hygienic standards.'}
          </p>
        </div>

        <ProductNutritionalTable highlights={product.nutritionalHighlights} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            background: '#ecfdf5',
            padding: '10px 14px',
            borderRadius: '12px',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <Clock size={16} /> Delivery in 10-15 mins from your nearest dark store.
        </div>

        <RelatedProductsRow relatedProducts={relatedProducts} />

        <ProductReviewList
          reviews={reviews}
          user={user}
          newRating={newRating}
          setNewRating={setNewRating}
          newComment={newComment}
          setNewComment={setNewComment}
          submittingReview={submittingReview}
          onReviewSubmit={handleReviewSubmit}
          onOpenAuthModal={() => openAuthModal('LOGIN')}
        />
      </div>
    </div>
  );
};

ProductDetailModal.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    unitQuantity: PropTypes.string,
    price: PropTypes.number,
    sellingPrice: PropTypes.number,
    mrp: PropTypes.number,
    discountPercentage: PropTypes.number,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imageUrl: PropTypes.string,
    description: PropTypes.string,
    nutritionalHighlights: PropTypes.array,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ProductDetailModal;

import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, Truck, ShieldCheck, Clock, MessageSquare, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { catalogApi, reviewApi } from '../services/api';
import { useToast } from '../context/ToastContext';

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
          console.error('Failed to fetch reviews:', err);
        });

      catalogApi
        .getRelatedProducts(product.id, 4)
        .then((res) => {
          if (res?.data) setRelatedProducts(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch related products:', err);
        });
    }
  }, [product]);

  if (!product) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!newComment.trim()) {
      addToast('Please enter your review feedback', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewApi.addReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      if (res?.data) {
        setReviews([res.data, ...reviews]);
        setNewComment('');
        addToast('Thank you! Your review has been published.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          borderRadius: '24px',
          background: '#ffffff',
          overflowY: 'auto',
          position: 'relative',
          padding: '28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={20} color="#64748b" />
        </button>

        {/* Top Product Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '20px',
              overflow: 'hidden',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span className="badge badge-delivery" style={{ marginBottom: '8px' }}>
              ⚡ Delivered in 10-15 Mins
            </span>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              {product.brand}
            </div>
            <h2
              style={{
                fontSize: '1.4rem',
                color: '#0f172a',
                margin: '4px 0 8px',
                lineHeight: '1.3',
              }}
            >
              {product.name}
            </h2>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                <Star size={14} fill="#059669" /> {product.rating}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {reviews.length} Verified Customer Reviews
              </span>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
              Unit: <strong>{product.unitQuantity}</strong>
            </div>

            {/* Price & Action */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                    ₹{product.sellingPrice}
                  </span>
                  {product.mrp > product.sellingPrice && (
                    <span
                      style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}
                    >
                      MRP ₹{product.mrp}
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="badge badge-discount">{product.discountPercentage}% OFF</span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  (Inclusive of all taxes)
                </div>
              </div>

              {quantity > 0 ? (
                <div className="qty-stepper" style={{ padding: '6px 10px' }}>
                  <button onClick={() => cartItemId && updateQuantity(cartItemId, quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: '1.1rem', padding: '0 14px' }}>{quantity}</span>
                  <button onClick={() => cartItemId && updateQuantity(cartItemId, quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product, 1)}
                  className="btn btn-primary btn-lg"
                  style={{ padding: '10px 28px' }}
                >
                  + Add to Cart
                </button>
              )}
            </div>

            {/* Guarantees */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '0.8rem',
                color: '#475569',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#059669" /> 10-15 Min Express fulfillment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#059669" /> 100% Quality handpicked
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '8px' }}>
            Product Details & Description
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
            {product.description ||
              'Premium quality fresh groceries and daily essentials sourced directly to bring maximum freshness and value.'}
          </p>
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h4
              style={{
                fontSize: '1.1rem',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MessageSquare size={18} color="#059669" /> Customer Reviews & Ratings (
              {reviews.length})
            </h4>
          </div>

          {/* Add Review Form */}
          <form
            onSubmit={handleReviewSubmit}
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              Rate & Review this product
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
            >
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Star
                    size={22}
                    fill={star <= newRating ? '#f59e0b' : 'none'}
                    color={star <= newRating ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback (freshness, packaging, taste)..."
                className="input-control"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary"
                style={{ padding: '0 20px' }}
              >
                <Send size={16} /> {submittingReview ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Existing Reviews List */}
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#059669',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {r.userName?.charAt(0) || 'U'}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                        {r.userName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= r.rating ? '#f59e0b' : 'none'}
                          color={s <= r.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.4' }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: '0.84rem',
                color: '#94a3b8',
                textAlign: 'center',
                padding: '16px',
              }}
            >
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

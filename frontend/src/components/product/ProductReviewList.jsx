import React from 'react';
import PropTypes from 'prop-types';
import { Star, MessageSquare, Send } from 'lucide-react';

const ProductReviewList = ({
  reviews = [],
  user = null,
  newRating = 5,
  setNewRating = () => {},
  newComment = '',
  setNewComment = () => {},
  submittingReview = false,
  onReviewSubmit = () => {},
  onOpenAuthModal = () => {},
}) => {
  return (
    <div style={{ marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
      <h4
        style={{
          fontSize: '1.05rem',
          color: '#0f172a',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <MessageSquare size={18} color="#059669" /> Customer Verified Reviews ({reviews.length})
      </h4>

      {/* Review Submission Box */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #f1f5f9',
        }}
      >
        {user ? (
          <form onSubmit={onReviewSubmit}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                Your Rating:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Star
                      size={18}
                      fill={star <= newRating ? '#f59e0b' : 'none'}
                      color={star <= newRating ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Share your experience with this item..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingReview}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} /> Submit
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
              Sign in to leave a verified review for this grocery item.
            </p>
            <button onClick={onOpenAuthModal} className="btn btn-outline btn-sm">
              Sign In to Review
            </button>
          </div>
        )}
      </div>

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reviews.length === 0 ? (
          <p
            style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '16px' }}
          >
            No reviews yet. Be the first to share your feedback!
          </p>
        ) : (
          reviews.map((r, i) => (
            <div
              key={r.id || i}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>
                  {r.userName || r.userFullName || 'Verified Shopper'}
                </span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(r.rating || 5)].map((_, idx) => (
                    <Star key={idx} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                {r.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

ProductReviewList.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  newRating: PropTypes.number,
  setNewRating: PropTypes.func,
  newComment: PropTypes.string,
  setNewComment: PropTypes.func,
  submittingReview: PropTypes.bool,
  onReviewSubmit: PropTypes.func,
  onOpenAuthModal: PropTypes.func,
};

export default ProductReviewList;

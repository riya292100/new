import React from 'react';
import PropTypes from 'prop-types';
import { Star, Send } from 'lucide-react';

const RestaurantReviewForm = ({
  user,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  submittingReview,
  onSubmit,
  onOpenAuth,
}) => {
  if (!user) {
    return (
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '20px',
          border: '1px solid #f1f5f9',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '8px' }}>
          Sign in to leave a verified dining review.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth('LOGIN')}
          className="btn btn-outline btn-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '20px',
        border: '1px solid #f1f5f9',
      }}
    >
      <form onSubmit={onSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
            Your Rating:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Rate ${s} stars`}
                onClick={() => setNewRating(s)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <Star
                  size={20}
                  fill={s <= newRating ? '#f59e0b' : 'none'}
                  color={s <= newRating ? '#f59e0b' : '#cbd5e1'}
                />
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input-control"
            placeholder="Share details of your dining experience..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submittingReview}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={14} /> Post Review
          </button>
        </div>
      </form>
    </div>
  );
};

RestaurantReviewForm.propTypes = {
  user: PropTypes.object,
  newRating: PropTypes.number.isRequired,
  setNewRating: PropTypes.func.isRequired,
  newComment: PropTypes.string.isRequired,
  setNewComment: PropTypes.func.isRequired,
  submittingReview: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onOpenAuth: PropTypes.func.isRequired,
};

export default RestaurantReviewForm;

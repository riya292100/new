import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const RestaurantReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <p
        style={{
          color: '#94a3b8',
          fontSize: '0.88rem',
          textAlign: 'center',
          padding: '16px',
        }}
      >
        No reviews yet for this restaurant. Be the first to review!
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {reviews.map((r) => (
        <div
          key={r.id || `${r.userName}-${r.comment}`}
          style={{
            padding: '14px',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{r.userName}</strong>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(r.rating || 5)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
};

RestaurantReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userName: PropTypes.string,
      rating: PropTypes.number,
      comment: PropTypes.string,
    })
  ),
};

export default RestaurantReviewList;

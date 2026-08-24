import React from 'react';
import PropTypes from 'prop-types';

const FreeDeliveryProgressBar = ({ freeDeliveryUnlocked, itemTotal }) => {
  const progress = freeDeliveryUnlocked ? 100 : Math.min(100, (itemTotal / 199) * 100);
  const remaining = Math.max(0, 199 - itemTotal);

  return (
    <div
      style={{
        background: '#ecfdf5',
        padding: '12px 20px',
        borderBottom: '1px solid #d1fae5',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: '#065f46',
        }}
      >
        {freeDeliveryUnlocked ? (
          <span>🎉 Congratulations! FREE delivery unlocked</span>
        ) : (
          <span>Add ₹{remaining.toFixed(0)} more for FREE Delivery</span>
        )}
        <span>{progress.toFixed(0)}%</span>
      </div>
      <div
        style={{
          height: '6px',
          background: '#a7f3d0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#059669',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

FreeDeliveryProgressBar.propTypes = {
  freeDeliveryUnlocked: PropTypes.bool.isRequired,
  itemTotal: PropTypes.number.isRequired,
};

export default FreeDeliveryProgressBar;

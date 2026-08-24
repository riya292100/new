import React from 'react';
import PropTypes from 'prop-types';
import { Tag, Sparkles } from 'lucide-react';

const CartBillSummary = ({
  cart,
  appliedCoupon,
  onRemoveCoupon,
  onOpenCouponModal,
  finalPayableAmount,
}) => {
  return (
    <div>
      {/* Coupon Bar */}
      <div style={{ marginBottom: '14px' }}>
        {appliedCoupon ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.82rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#065f46',
                fontWeight: '700',
              }}
            >
              <Sparkles size={16} color="#059669" />
              <span>
                '{appliedCoupon.code}' applied (-₹{appliedCoupon.discountAmount})
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenCouponModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fffbeb',
              border: '1px dashed #f59e0b',
              borderRadius: '10px',
              padding: '9px 14px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#b45309',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} /> Have a coupon code?
            </div>
            <span>View Offers ➔</span>
          </button>
        )}
      </div>

      {/* Bill Details */}
      <div
        style={{
          fontSize: '0.82rem',
          color: '#64748b',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Item Total</span>
          <span>₹{cart.itemTotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Delivery Fee</span>
          <span>
            {cart.deliveryFee === 0 ? (
              <strong style={{ color: '#059669' }}>FREE</strong>
            ) : (
              `₹${cart.deliveryFee}`
            )}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Platform & Handling Fee</span>
          <span>₹{cart.platformFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Taxes & GST (5%)</span>
          <span>₹{cart.taxAmount}</span>
        </div>
        {appliedCoupon && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#059669',
              fontWeight: '700',
            }}
          >
            <span>Coupon Discount</span>
            <span>-₹{appliedCoupon.discountAmount}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '8px',
            fontSize: '1rem',
            fontWeight: '800',
            color: '#0f172a',
          }}
        >
          <span>To Pay</span>
          <span>₹{finalPayableAmount}</span>
        </div>
      </div>
    </div>
  );
};

CartBillSummary.propTypes = {
  cart: PropTypes.shape({
    itemTotal: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number,
    platformFee: PropTypes.number,
    taxAmount: PropTypes.number,
  }).isRequired,
  appliedCoupon: PropTypes.shape({
    code: PropTypes.string,
    discountAmount: PropTypes.number,
  }),
  onRemoveCoupon: PropTypes.func.isRequired,
  onOpenCouponModal: PropTypes.func.isRequired,
  finalPayableAmount: PropTypes.number.isRequired,
};

export default CartBillSummary;

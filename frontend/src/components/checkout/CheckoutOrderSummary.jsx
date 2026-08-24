import React from 'react';
import PropTypes from 'prop-types';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';

const CheckoutOrderSummary = ({
  cart,
  appliedCoupon,
  removeCoupon,
  setCouponModalOpen,
  selectedTip,
  setSelectedTip,
  finalPayableAmount,
  placingOrder,
  onPlaceOrder,
}) => {
  const TIP_OPTIONS = [0, 10, 20, 30, 50];

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>
        Order Summary ({cart?.totalItems || 0} items)
      </h3>

      {/* Applied Coupon / Promo */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1.5px dashed #10b981',
          borderRadius: '14px',
          padding: '14px',
        }}
      >
        {appliedCoupon ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '0.9rem' }}>
                🎉 Code {appliedCoupon.code} Applied
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                Saving ₹{cart.discountAmount} on this order
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCouponModalOpen(true)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#059669',
              fontWeight: '700',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} /> Apply Promo Coupon
            </span>
            <Sparkles size={16} color="#fbbf24" />
          </button>
        )}
      </div>

      {/* Rider Tip */}
      <div>
        <div
          style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}
        >
          🚴 Express Delivery Partner Tip
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {TIP_OPTIONS.map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => setSelectedTip(tip)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                border: selectedTip === tip ? '2px solid #059669' : '1px solid #e2e8f0',
                background: selectedTip === tip ? '#ecfdf5' : '#ffffff',
                color: selectedTip === tip ? '#059669' : '#64748b',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {tip === 0 ? 'No Tip' : `₹${tip}`}
            </button>
          ))}
        </div>
      </div>

      {/* Bill Breakdown */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.88rem',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Item Total</span>
          <span>₹{cart?.totalPrice || 0}</span>
        </div>
        {cart?.discountAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#059669',
              fontWeight: '600',
            }}
          >
            <span>Coupon Discount</span>
            <span>-₹{cart.discountAmount}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Delivery Fee</span>
          <span>
            {cart?.deliveryFee === 0 ? (
              <strong style={{ color: '#059669' }}>FREE</strong>
            ) : (
              `₹${cart?.deliveryFee}`
            )}
          </span>
        </div>
        {selectedTip > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Delivery Tip</span>
            <span>₹{selectedTip}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #0f172a',
            paddingTop: '12px',
            marginTop: '4px',
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>To Pay</span>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#059669' }}>
            ₹{((finalPayableAmount || cart?.finalPrice || 0) + selectedTip).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={placingOrder || !cart?.items?.length}
        className="btn btn-primary btn-block btn-lg"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)',
        }}
      >
        {placingOrder ? 'Confirming Order...' : 'Place Express Order'}
        {!placingOrder && <ArrowRight size={18} />}
      </button>
    </div>
  );
};

CheckoutOrderSummary.propTypes = {
  cart: PropTypes.shape({
    totalItems: PropTypes.number,
    totalPrice: PropTypes.number,
    discountAmount: PropTypes.number,
    deliveryFee: PropTypes.number,
    finalPrice: PropTypes.number,
    items: PropTypes.array,
  }),
  appliedCoupon: PropTypes.shape({
    code: PropTypes.string,
    discountAmount: PropTypes.number,
  }),
  removeCoupon: PropTypes.func.isRequired,
  setCouponModalOpen: PropTypes.func.isRequired,
  selectedTip: PropTypes.number.isRequired,
  setSelectedTip: PropTypes.func.isRequired,
  finalPayableAmount: PropTypes.number,
  placingOrder: PropTypes.bool,
  onPlaceOrder: PropTypes.func.isRequired,
};

CheckoutOrderSummary.defaultProps = {
  cart: null,
  appliedCoupon: null,
  finalPayableAmount: 0,
  placingOrder: false,
};

export default CheckoutOrderSummary;

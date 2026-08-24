import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Tag, CheckCircle2, XCircle } from 'lucide-react';

const AdminCouponManager = ({
  coupons,
  showCouponModal,
  setShowCouponModal,
  couponForm,
  setCouponForm,
  onCreateCoupon,
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
          Active Promo Discounts ({coupons.length})
        </h3>
        <button
          onClick={() => setShowCouponModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            style={{
              border: '1.5px dashed #10b981',
              borderRadius: '16px',
              padding: '18px',
              background: '#f0fdf4',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  color: '#065f46',
                  letterSpacing: '1px',
                }}
              >
                {coupon.code}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: coupon.active ? '#dcfce7' : '#fee2e2',
                  color: coupon.active ? '#15803d' : '#b91c1c',
                }}
              >
                {coupon.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#374151' }}>{coupon.description}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669' }}>
              {coupon.discountType === 'PERCENTAGE'
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} FLAT OFF`}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#6b7280',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '6px',
                marginTop: '4px',
              }}
            >
              Min Order: ₹{coupon.minOrderValue} • Max Discount: ₹{coupon.maxDiscountAmount}
            </div>
          </div>
        ))}
      </div>

      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '24px',
              padding: '28px',
              background: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '16px' }}>
              Create New Promo Code
            </h3>
            <form
              onSubmit={onCreateCoupon}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="FRESH50"
                  className="input-control"
                  style={{ textTransform: 'uppercase', fontWeight: '700' }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="50% OFF on first 3 orders"
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="input-control"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        minOrderValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-control"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        maxDiscountAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-control"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

AdminCouponManager.propTypes = {
  coupons: PropTypes.array.isRequired,
  showCouponModal: PropTypes.bool.isRequired,
  setShowCouponModal: PropTypes.func.isRequired,
  couponForm: PropTypes.object.isRequired,
  setCouponForm: PropTypes.func.isRequired,
  onCreateCoupon: PropTypes.func.isRequired,
};

export default AdminCouponManager;

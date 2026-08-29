import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Copy, Sparkles, Percent } from 'lucide-react';
import { couponApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { validateSchema, couponSchema } from '../utils/validation';
import logger from '../utils/logger';

const CouponModal = () => {
  const { couponModalOpen, setCouponModalOpen, applyCoupon, appliedCoupon } = useCart();
  const [coupons, setCoupons] = useState([]);
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    if (couponModalOpen) {
      couponApi
        .getActiveCoupons()
        .then((res) => {
          if (res?.data) setCoupons(res.data);
        })
        .catch((err) => {
          logger.error('CouponModal', 'Failed to fetch available coupons', err);
        });
    }
  }, [couponModalOpen]);

  if (!couponModalOpen) return null;

  const handleCustomApply = (e) => {
    e.preventDefault();
    const cleanCode = customCode.trim().toUpperCase();
    const valResult = validateSchema(couponSchema, { code: cleanCode });
    if (valResult.isValid) {
      applyCoupon(cleanCode);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setCouponModalOpen(false)}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '24px',
          padding: '24px',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Tag size={20} color="#059669" /> Apply Promo Coupon
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Select from available offers to get instant savings
            </p>
          </div>
          <button
            onClick={() => setCouponModalOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Enter Code Manual Input */}
        <form
          onSubmit={handleCustomApply}
          style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
        >
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="ENTER PROMO CODE (e.g. WELCOME50)"
            className="input-control"
            style={{ fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
            Apply
          </button>
        </form>

        {/* Available Coupons List */}
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Available Offers ({coupons.length})
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {coupons.map((c) => {
            const isApplied = appliedCoupon?.code === c.code;
            return (
              <div
                key={c.id}
                style={{
                  border: isApplied ? '2px solid #059669' : '1px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '16px',
                  background: isApplied ? '#ecfdf5' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {c.code}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669' }}>
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} FLAT OFF`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.3' }}>
                    {c.description}
                  </p>
                  {c.minOrderValue > 0 && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                      Min order: ₹{c.minOrderValue}{' '}
                      {c.maxDiscountAmount ? `• Max savings: ₹${c.maxDiscountAmount}` : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => applyCoupon(c.code)}
                  className={`btn ${isApplied ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  style={{ flexShrink: 0, padding: '6px 14px' }}
                >
                  {isApplied ? <Check size={14} /> : 'Apply'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CouponModal;

import React from 'react';
import { X, ShoppingBag, Plus, Minus, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeItem,
    appliedCoupon,
    removeCoupon,
    setCouponModalOpen,
    finalPayableAmount,
  } = useCart();

  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  if (!cartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    if (!user) {
      openAuthModal('login');
    } else {
      navigate('/checkout');
    }
  };

  const freeDeliveryProgress = cart.freeDeliveryUnlocked
    ? 100
    : Math.min(100, (cart.itemTotal / 199) * 100);

  return (
    <div className="drawer-overlay" onClick={() => setCartDrawerOpen(false)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#059669" />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>My Cart</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} • Fast 15-min delivery
              </span>
            </div>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
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

        {/* Free Delivery Milestone Progress */}
        <div
          style={{ background: '#ecfdf5', padding: '12px 20px', borderBottom: '1px solid #d1fae5' }}
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
            {cart.freeDeliveryUnlocked ? (
              <span>🎉 Congratulations! FREE delivery unlocked</span>
            ) : (
              <span>
                Add ₹{Math.max(0, 199 - cart.itemTotal).toFixed(0)} more for FREE Delivery
              </span>
            )}
            <span>₹199</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#a7f3d0',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${freeDeliveryProgress}%`,
                height: '100%',
                background: '#059669',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.items && cart.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        lineHeight: '1.2',
                      }}
                    >
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 4px' }}>
                      {item.unitQuantity}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                        ₹{item.unitPrice * item.quantity}
                      </span>
                      {item.mrp > item.unitPrice && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            textDecoration: 'line-through',
                          }}
                        >
                          ₹{item.mrp * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="qty-stepper">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8',
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '6px' }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Add fresh vegetables, dairy, snacks & essentials to start order
              </p>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
              >
                Browse Groceries
              </button>
            </div>
          )}
        </div>

        {/* Bill Summary & Sticky Checkout Footer */}
        {cart.items && cart.items.length > 0 && (
          <div
            style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '16px 20px' }}
          >
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
                    onClick={removeCoupon}
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
                  onClick={() => setCouponModalOpen(true)}
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

            {/* Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="btn btn-primary btn-block btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>₹{finalPayableAmount}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>TOTAL PAYABLE</div>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

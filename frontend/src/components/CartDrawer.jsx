import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import FreeDeliveryProgressBar from './cart/FreeDeliveryProgressBar';
import CartItemRow from './cart/CartItemRow';
import CartBillSummary from './cart/CartBillSummary';

const CartDrawer = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
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
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>My Cart</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} • Fast 15-min delivery
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close cart drawer"
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
        <FreeDeliveryProgressBar
          freeDeliveryUnlocked={cart.freeDeliveryUnlocked}
          itemTotal={cart.itemTotal}
        />

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.items && cart.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} />
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
                type="button"
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
            style={{
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              padding: '16px 20px',
            }}
          >
            <CartBillSummary
              cart={cart}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={removeCoupon}
              onOpenCouponModal={() => setCouponModalOpen(true)}
              finalPayableAmount={finalPayableAmount}
            />

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="btn btn-primary btn-block btn-lg"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '12px',
              }}
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

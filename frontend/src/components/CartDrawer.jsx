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
        <div className="qc-drawer-header">
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
            className="qc-modal-close-btn"
            style={{ position: 'static' }}
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
            <div className="qc-drawer-empty-state">
              <div className="qc-drawer-empty-icon">
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
          <div className="qc-drawer-footer">
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

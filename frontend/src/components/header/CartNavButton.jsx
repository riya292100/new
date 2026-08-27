import React from 'react';
import PropTypes from 'prop-types';
import { ShoppingBag } from 'lucide-react';

const CartNavButton = ({ totalItems, totalPrice, onOpenCart }) => {
  return (
    <button
      onClick={onOpenCart}
      className="btn btn-primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
      }}
      aria-label="View Shopping Cart"
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <ShoppingBag size={18} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: '800',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #059669',
            }}
          >
            {totalItems}
          </span>
        )}
      </div>
      <span style={{ fontWeight: '700' }}>{totalItems > 0 ? `₹${totalPrice}` : 'My Cart'}</span>
    </button>
  );
};

CartNavButton.propTypes = {
  totalItems: PropTypes.number,
  totalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onOpenCart: PropTypes.func.isRequired,
};

export default CartNavButton;

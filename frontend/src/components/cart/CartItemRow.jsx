import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus } from 'lucide-react';

const CartItemRow = ({ item, onUpdateQuantity }) => {
  const name = item.productName || item.name;
  const image = item.productImage || item.imageUrl || '/placeholder.png';
  const unit = item.unitQuantity || item.unit;
  const price = item.unitPrice ?? item.price;
  const mrp = item.mrp;
  const totalItemPrice = price * item.quantity;
  const totalItemMrp = mrp ? mrp * item.quantity : null;

  return (
    <div
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
        src={image}
        alt={name}
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
          {name}
        </div>
        {unit && (
          <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 4px' }}>{unit}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{totalItemPrice}
          </span>
          {totalItemMrp && totalItemMrp > totalItemPrice && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textDecoration: 'line-through',
              }}
            >
              ₹{totalItemMrp}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="qty-stepper">
        <button
          type="button"
          aria-label={`Decrease ${name} quantity`}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Minus size={13} />
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          aria-label={`Increase ${name} quantity`}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};

CartItemRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    productName: PropTypes.string,
    unit: PropTypes.string,
    unitQuantity: PropTypes.string,
    price: PropTypes.number,
    unitPrice: PropTypes.number,
    mrp: PropTypes.number,
    quantity: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    productImage: PropTypes.string,
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
};

export default CartItemRow;

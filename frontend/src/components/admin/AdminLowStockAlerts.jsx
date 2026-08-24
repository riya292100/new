import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Plus } from 'lucide-react';

const AdminLowStockAlerts = ({ lowStockProducts, onRestock }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <AlertCircle size={22} color="#ef4444" />
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
          Critical Low Stock Inventory ({lowStockProducts.length})
        </h3>
      </div>

      {lowStockProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#059669',
            background: '#ecfdf5',
            borderRadius: '16px',
          }}
        >
          <strong>All items healthy!</strong> No products are below their minimum threshold.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lowStockProducts.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fecaca',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={p.imageUrl}
                  alt=""
                  style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#991b1b' }}>
                    Current Stock: <strong>{p.stockQuantity}</strong> (Threshold:{' '}
                    {p.lowStockThreshold})
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRestock(p.id, 50)}
                className="btn btn-sm"
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} /> Restock +50
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AdminLowStockAlerts.propTypes = {
  lowStockProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      stockQuantity: PropTypes.number,
      lowStockThreshold: PropTypes.number,
      imageUrl: PropTypes.string,
    })
  ),
  onRestock: PropTypes.func.isRequired,
};

AdminLowStockAlerts.defaultProps = {
  lowStockProducts: [],
};

export default AdminLowStockAlerts;

import React from 'react';
import { Bike } from 'lucide-react';

const EmptyOrdersState = () => {
  return (
    <div
      data-testid="empty-orders-state"
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
      }}
    >
      <Bike size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>
        No active deliveries assigned
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
        New orders placed in your delivery radius will pop up here instantly.
      </p>
    </div>
  );
};

export default EmptyOrdersState;

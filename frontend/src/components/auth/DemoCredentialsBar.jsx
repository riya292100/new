import React from 'react';
import PropTypes from 'prop-types';
import { User, Bike, Shield } from 'lucide-react';

const DemoCredentialsBar = ({ onQuickFill }) => {
  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#94a3b8',
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '0.5px',
        }}
      >
        Quick Demo 1-Click Login:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onQuickFill('customer')}
          className="btn btn-outline btn-xs"
          style={{
            fontSize: '0.72rem',
            padding: '6px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <User size={12} /> Customer
        </button>
        <button
          type="button"
          onClick={() => onQuickFill('driver')}
          className="btn btn-outline btn-xs"
          style={{
            fontSize: '0.72rem',
            padding: '6px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Bike size={12} /> Driver
        </button>
        <button
          type="button"
          onClick={() => onQuickFill('admin')}
          className="btn btn-outline btn-xs"
          style={{
            fontSize: '0.72rem',
            padding: '6px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Shield size={12} /> Admin
        </button>
      </div>
    </div>
  );
};

DemoCredentialsBar.propTypes = {
  onQuickFill: PropTypes.func.isRequired,
};

export default DemoCredentialsBar;

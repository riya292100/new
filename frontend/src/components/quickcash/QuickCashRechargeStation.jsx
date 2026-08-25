import React from 'react';
import PropTypes from 'prop-types';
import { Gift } from 'lucide-react';

export default function QuickCashRechargeStation({ user, addingFunds, onAddFunds, onOpenAuth }) {
  const rechargeOptions = [
    { amt: 100, label: 'Welcome Bonus' },
    { amt: 250, label: 'Weekend Perk' },
    { amt: 500, label: 'High Roller VIP' },
  ];

  return (
    <div className="quickcash-card">
      <div className="quickcash-card-header" style={{ color: '#065f46' }}>
        <Gift size={24} color="#059669" />
        <h3 className="quickcash-card-title">1-Click Demo Recharge</h3>
      </div>
      <p className="quickcash-card-subtitle">
        Instantly add demo QuickCash credits to experience checkout redemption and live ledger
        updates!
      </p>

      <div className="quickcash-recharge-grid">
        {rechargeOptions.map(({ amt, label }) => (
          <button
            key={amt}
            type="button"
            disabled={addingFunds}
            onClick={() => onAddFunds(amt)}
            className="quickcash-recharge-btn"
          >
            <div className="quickcash-recharge-amount">+₹{amt}</div>
            <div className="quickcash-recharge-label">{label}</div>
          </button>
        ))}
      </div>

      {!user && (
        <div className="quickcash-auth-prompt">
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Sign in to sync your balance to your cloud account
          </span>
          <button
            type="button"
            onClick={onOpenAuth}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}

QuickCashRechargeStation.propTypes = {
  user: PropTypes.object,
  addingFunds: PropTypes.bool,
  onAddFunds: PropTypes.func.isRequired,
  onOpenAuth: PropTypes.func,
};

import React from 'react';
import PropTypes from 'prop-types';
import { Percent } from 'lucide-react';

export default function QuickCashCalculator({ orderAmount, onOrderAmountChange, walletBalance }) {
  const projectedCashback = (orderAmount * 0.05).toFixed(2);
  const maxRedeem = Math.min(orderAmount, Number(walletBalance || 0)).toFixed(2);
  const netPayable = Math.max(0, orderAmount - maxRedeem).toFixed(2);

  return (
    <div className="quickcash-card">
      <div className="quickcash-card-header" style={{ color: '#0f172a' }}>
        <Percent size={24} color="#059669" />
        <h3 className="quickcash-card-title">Cashback & Savings Calculator</h3>
      </div>
      <p className="quickcash-card-subtitle" style={{ marginBottom: '16px' }}>
        Simulate your grocery or fashion cart and see instant cashback & discount calculations:
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="quickcash-calc-slider" className="quickcash-calc-slider-label">
          Estimated Order Amount: ₹{orderAmount}
        </label>
        <input
          id="quickcash-calc-slider"
          type="range"
          min="200"
          max="5000"
          step="100"
          value={orderAmount}
          onChange={(e) => onOrderAmountChange(Number(e.target.value))}
          className="quickcash-calc-slider"
        />
      </div>

      <div className="quickcash-calc-result-box">
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
            EARN 5% CASHBACK
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#059669' }}>
            +₹{projectedCashback}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
            QUICKCASH REDEEM
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#d97706' }}>
            -₹{maxRedeem}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
            NET PAYABLE
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
            ₹{netPayable}
          </div>
        </div>
      </div>
    </div>
  );
}

QuickCashCalculator.propTypes = {
  orderAmount: PropTypes.number.isRequired,
  onOrderAmountChange: PropTypes.func.isRequired,
  walletBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

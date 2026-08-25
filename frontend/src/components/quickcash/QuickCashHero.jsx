import React from 'react';
import PropTypes from 'prop-types';

export default function QuickCashHero({ wallet }) {
  const balance = Number(wallet?.balance || 0).toFixed(2);
  const tierName = wallet?.tierName || 'Silver Member (5%)';
  const totalEarned = Number(wallet?.totalEarned || 0).toFixed(2);
  const progressPct = Math.min(100, Math.max(15, wallet?.tierProgressPercentage || 20));

  return (
    <div className="quickcash-hero">
      <div className="quickcash-hero-glow" />

      <div className="quickcash-hero-content">
        <div>
          <div className="quickcash-pill">
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            <span className="quickcash-pill-text">QuickCash Loyalty & Rewards Hub</span>
          </div>
          <h1 className="quickcash-title">Earn 5% Instant Cashback on Every Order</h1>
          <p className="quickcash-desc">
            1 QuickCash = ₹1 INR. Redeem 100% of your wallet balance on groceries, fresh bakery,
            clothing, and dining table reservations with zero blackout dates.
          </p>
        </div>

        {/* Available Balance Card */}
        <div className="quickcash-balance-card">
          <div className="quickcash-balance-label">AVAILABLE QUICKCASH BALANCE</div>
          <div className="quickcash-balance-amount">₹{balance}</div>

          <div className="quickcash-tier-badge">
            <span>⭐ {tierName}</span>
          </div>
        </div>
      </div>

      {/* Tier Progress Section */}
      <div className="quickcash-progress-section">
        <div className="quickcash-progress-meta">
          <span>
            Tier Progress: <strong>{tierName}</strong>
          </span>
          <span>
            Total Cashback Earned: <strong>₹{totalEarned}</strong>
          </span>
        </div>
        <div className="quickcash-progress-track">
          <div className="quickcash-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}

QuickCashHero.propTypes = {
  wallet: PropTypes.shape({
    balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    tierName: PropTypes.string,
    totalEarned: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    tierProgressPercentage: PropTypes.number,
  }),
};

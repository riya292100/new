import React from 'react';
import PropTypes from 'prop-types';

const DriverStatsGrid = ({ profile }) => {
  return (
    <div data-testid="driver-stats-grid" className="qc-stat-grid">
      <div className="qc-stat-tile">
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Total Deliveries
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            {profile?.totalDeliveries || 142}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600' }}>
            ⚡ 100% on-time rate
          </div>
        </div>
      </div>

      <div className="qc-stat-tile">
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Partner Rating
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', margin: '4px 0' }}>
            ⭐ {profile?.rating || '4.9'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Top Tier Express Driver</div>
        </div>
      </div>

      <div className="qc-stat-tile">
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            Vehicle & License
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: '800',
              color: '#0f172a',
              margin: '8px 0 4px',
            }}
          >
            {profile?.vehicleNumber || 'DL-01-QC-8821'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {profile?.vehicleType || 'HERO_ELECTRIC_NYX'}
          </div>
        </div>
      </div>
    </div>
  );
};

DriverStatsGrid.propTypes = {
  profile: PropTypes.shape({
    totalDeliveries: PropTypes.number,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    vehicleNumber: PropTypes.string,
    vehicleType: PropTypes.string,
  }),
};

export default DriverStatsGrid;

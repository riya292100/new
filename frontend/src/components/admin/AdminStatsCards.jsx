import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, ShoppingCart, AlertCircle, Users, Package } from 'lucide-react';

const AdminStatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
            Total Revenue
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{stats.totalRevenue || 0}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingCart size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
            Total Orders
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
            {stats.totalOrders || 0}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
            Low Stock Items
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ef4444' }}>
            {stats.lowStockProductsCount || 0}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#faf5ff',
            color: '#9333ea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Users size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
            Total Customers
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
            {stats.totalUsers || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

AdminStatsCards.propTypes = {
  stats: PropTypes.shape({
    totalRevenue: PropTypes.number,
    totalOrders: PropTypes.number,
    lowStockProductsCount: PropTypes.number,
    totalUsers: PropTypes.number,
  }),
};

AdminStatsCards.defaultProps = {
  stats: null,
};

export default AdminStatsCards;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bike, ShoppingBag, UserCheck, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

const RoleSwitcher = () => {
  const { user, switchDemoRole, isAdmin, isDeliveryPartner } = useAuth();

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        fontSize: '0.8rem',
        padding: '6px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '0.72rem',
          }}
        >
          ⚡ INSTANT DEMO MODE
        </span>
        <span style={{ color: '#94a3b8' }}>
          Logged in as: <strong style={{ color: '#f8fafc' }}>{user?.fullName || 'Guest'}</strong>
          {isAdmin && ' (Admin)'}
          {isDeliveryPartner && ' (Delivery Partner)'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Switch View:</span>
        <button
          onClick={() => switchDemoRole('CUSTOMER')}
          style={{
            background: !isAdmin && !isDeliveryPartner ? '#059669' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '3px 9px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ShoppingBag size={12} /> Customer
        </button>

        <button
          onClick={() => switchDemoRole('DELIVERY')}
          style={{
            background: isDeliveryPartner ? '#f59e0b' : 'rgba(255,255,255,0.08)',
            color: isDeliveryPartner ? '#0f172a' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '3px 9px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Bike size={12} /> Partner App
        </button>

        <Link
          to="/clothes"
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '6px',
            padding: '3px 9px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Shirt size={12} /> Clothes Shopping
        </Link>

        <button
          onClick={() => switchDemoRole('ADMIN')}
          style={{
            background: isAdmin ? '#6366f1' : 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '3px 9px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Shield size={12} /> Admin Portal
        </button>

        {isAdmin && (
          <Link
            to="/admin"
            style={{
              color: '#818cf8',
              textDecoration: 'none',
              fontWeight: '700',
              marginLeft: '4px',
            }}
          >
            Open Admin ➔
          </Link>
        )}

        {isDeliveryPartner && (
          <Link
            to="/delivery-partner"
            style={{
              color: '#fbbf24',
              textDecoration: 'none',
              fontWeight: '700',
              marginLeft: '4px',
            }}
          >
            Open Driver Portal ➔
          </Link>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;

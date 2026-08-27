import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { User, LogOut, Package, Shield, Bike, Utensils, ChevronDown } from 'lucide-react';

const dropdownLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  color: '#334155',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: '600',
  borderRadius: '8px',
};

const UserMenuDropdown = ({ user, logout, openAuthModal, isAdmin, isDeliveryPartner }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="btn btn-outline"
        style={{ padding: '7px 16px', fontSize: '0.88rem' }}
      >
        Sign In
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '6px 12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '0.88rem',
          fontWeight: '600',
          color: '#0f172a',
        }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <User size={18} color="#059669" />
        )}
        <span>{user.fullName?.split(' ')[0] || user.email?.split('@')[0]}</span>
        <ChevronDown size={14} color="#64748b" />
      </button>

      {userDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '210px',
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 10px 25px -3px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            padding: '8px',
            zIndex: 1000,
          }}
          onMouseLeave={() => setUserDropdownOpen(false)}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '0.8rem',
              color: '#64748b',
            }}
          >
            Signed in as <br />
            <strong style={{ color: '#0f172a' }}>{user.email}</strong>
          </div>

          <Link
            to="/profile"
            onClick={() => setUserDropdownOpen(false)}
            style={dropdownLinkStyle}
          >
            <User size={15} color="#059669" /> My Profile
          </Link>

          <Link
            to="/orders"
            onClick={() => setUserDropdownOpen(false)}
            style={dropdownLinkStyle}
          >
            <Package size={15} color="#059669" /> Order History
          </Link>

          <Link
            to="/bookings"
            onClick={() => setUserDropdownOpen(false)}
            style={dropdownLinkStyle}
          >
            <Utensils size={15} color="#059669" /> Table Bookings
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setUserDropdownOpen(false)}
              style={{ ...dropdownLinkStyle, color: '#7c3aed' }}
            >
              <Shield size={15} color="#7c3aed" /> Admin Dashboard
            </Link>
          )}

          {isDeliveryPartner && (
            <Link
              to="/delivery-partner"
              onClick={() => setUserDropdownOpen(false)}
              style={{ ...dropdownLinkStyle, color: '#ea580c' }}
            >
              <Bike size={15} color="#ea580c" /> Rider Portal
            </Link>
          )}

          <button
            onClick={() => {
              setUserDropdownOpen(false);
              logout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              color: '#dc2626',
              background: 'transparent',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              marginTop: '4px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <LogOut size={15} color="#dc2626" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

UserMenuDropdown.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    fullName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  logout: PropTypes.func.isRequired,
  openAuthModal: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  isDeliveryPartner: PropTypes.bool,
};

export default UserMenuDropdown;

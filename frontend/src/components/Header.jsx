import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  ChevronDown,
  ShoppingBag,
  User,
  LogOut,
  Package,
  Shield,
  Bike,
} from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { selectedLocation, setLocationModalOpen } = useLocation();
  const { cart, setCartDrawerOpen } = useCart();
  const { user, logout, openAuthModal, isAdmin, isDeliveryPartner } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '16px',
        }}
      >
        {/* Brand & Location Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <Link
            to="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Zap size={22} fill="#ffffff" />
            </div>
            <div>
              <span
                className="brand-font"
                style={{
                  fontSize: '1.45rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                }}
              >
                Quick<span style={{ color: '#059669' }}>Cart</span>
              </span>
              <span
                className="badge badge-delivery"
                style={{
                  display: 'block',
                  padding: '1px 6px',
                  fontSize: '0.62rem',
                  marginTop: '-2px',
                }}
              >
                ⚡ 12-15 MINS
              </span>
            </div>
          </Link>

          {/* Location Picker Trigger */}
          <div
            onClick={() => setLocationModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              maxWidth: '220px',
              transition: 'background 0.15s',
            }}
          >
            <MapPin size={16} color="#059669" style={{ flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Delivery in 15 mins
              </div>
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selectedLocation?.streetAddress
                  ? `${selectedLocation.label}: ${selectedLocation.streetAddress}`
                  : 'Select Location'}
              </div>
            </div>
            <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
          </div>
        </div>

        {/* Center: Search Autocomplete */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchAutocomplete />
        </div>

        {/* Right Actions: User Profile & Cart Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {user ? (
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
                <span>{user.fullName?.split(' ')[0]}</span>
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
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      color: '#334155',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      borderRadius: '8px',
                    }}
                  >
                    <Package size={16} /> My Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      color: '#334155',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      borderRadius: '8px',
                    }}
                  >
                    <User size={16} /> Profile & Addresses
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                      }}
                    >
                      <Shield size={16} /> Admin Dashboard
                    </Link>
                  )}

                  {isDeliveryPartner && (
                    <Link
                      to="/delivery-partner"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        color: '#d97706',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                      }}
                    >
                      <Bike size={16} /> Driver App
                    </Link>
                  )}

                  <div
                    style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}
                  >
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        color: '#ef4444',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn btn-outline"
              style={{ fontSize: '0.88rem', padding: '8px 16px' }}
            >
              <User size={16} /> Login
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            <ShoppingBag size={18} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                lineHeight: 1.1,
              }}
            >
              <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                {cart?.totalItems || 0} {cart?.totalItems === 1 ? 'item' : 'items'}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>
                ₹{cart?.grandTotal || 0}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

import PropTypes from 'prop-types';

Header.propTypes = {};

export default Header;

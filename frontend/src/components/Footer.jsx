import React from 'react';
import { Zap, Clock, ShieldCheck, Truck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        paddingTop: '48px',
        paddingBottom: '32px',
        marginTop: '60px',
      }}
    >
      <div className="container">
        {/* Value Props */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            paddingBottom: '40px',
            borderBottom: '1px solid #1e293b',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                flexShrink: 0,
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>10–15 Mins Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Superfast local fulfillment nodes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>Best Price & Quality</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Handpicked & fresh guarantee
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                flexShrink: 0,
              }}
            >
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>Free Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                On all grocery orders above ₹199
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} color="#ffffff" fill="#ffffff" />
              </div>
              <span className="brand-font" style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                QuickCart
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.6' }}>
              QuickCart is your neighborhood instant grocery delivery app delivering over 5,000+
              daily essentials in minutes.
            </p>
          </div>

          <div>
            <h5
              style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Categories
            </h5>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#94a3b8',
              }}
            >
              <li>
                <Link
                  to="/category/fruits-vegetables"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link
                  to="/category/dairy-breakfast"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Dairy & Breakfast
                </Link>
              </li>
              <li>
                <Link
                  to="/category/snacks-munchies"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Snacks & Munchies
                </Link>
              </li>
              <li>
                <Link to="/category/beverages" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Beverages & Juices
                </Link>
              </li>
              <li>
                <Link
                  to="/category/instant-food"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Instant Food
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5
              style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Company & Portals
            </h5>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#94a3b8',
              }}
            >
              <li>
                <Link
                  to="/admin"
                  style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/delivery-partner"
                  style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600' }}
                >
                  Delivery Partner App
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Saved Addresses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5
              style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Delivery Hours
            </h5>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.6' }}>
              Open 7 days a week: <strong>6:00 AM – 2:00 AM</strong>
              <br />
              Lightning fast delivery within 10–30 minutes across prime city zones.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #1e293b',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          © {new Date().getFullYear()} QuickCart Technologies Inc. Built with Spring Boot 3 + MySQL
          + React.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

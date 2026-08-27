import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const BrandLogo = () => {
  return (
    <Link
      to="/"
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
      aria-label="QuickCart Home"
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
  );
};

export default BrandLogo;

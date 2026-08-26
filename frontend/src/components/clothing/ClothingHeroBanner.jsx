import React from 'react';
import { Zap, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const ClothingHeroBanner = () => {
  return (
    <div
      data-testid="clothing-hero-banner"
      className="glass-card"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)',
        borderRadius: '24px',
        padding: '36px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
        <div
          data-testid="clothing-instant-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '14px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
          }}
        >
          <Zap size={15} fill="#34d399" /> INSTANT 15-MINUTE FASHION & APPAREL
        </div>

        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: '900',
            lineHeight: '1.2',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          Trending Clothes & Daily Apparel Delivered in{' '}
          <span style={{ color: '#34d399' }}>15 Mins</span>
        </h1>

        <p
          style={{
            fontSize: '0.96rem',
            color: '#94a3b8',
            lineHeight: '1.5',
            marginBottom: '20px',
          }}
        >
          Discover everyday cotton t-shirts, stretch denim, casual shirts, flowy dresses, and ethnic
          wear with instant doorstep delivery and 7-day hassle-free exchanges.
        </p>

        {/* Quick Stats Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#34d399" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>⚡ 15-Min Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} color="#34d399" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>7-Day Doorstep Returns</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#34d399" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>100% Genuine Brands</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingHeroBanner;

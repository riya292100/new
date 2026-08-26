import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const DEFAULT_PROMO_BANNERS = [
  {
    id: 1,
    title: 'Superfast 10–15 Min Delivery',
    subtitle: 'Daily essentials, fresh vegetables & dairy delivered at lightning speed',
    badge: '⚡ LIGHTNING FAST',
    bg: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    cta: 'Shop Now',
    link: '/category/all',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: '⚡ 15-Min Instant Clothes & Fashion',
    subtitle: 'Cotton t-shirts, stretch denim, casual shirts & ethnic wear delivered instantly',
    badge: '👔 INSTANT APPAREL',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #059669 100%)',
    cta: 'Shop Clothes',
    link: '/clothes',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Fresh Mangoes & Summer Fruits',
    subtitle: 'Handpicked Alphonso, Safeda & exotic fruits up to 30% OFF',
    badge: '🥭 SEASON SPECIAL',
    bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    cta: 'Explore Fruits',
    link: '/category/fruits-vegetables',
    image:
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Midnight Munchies & Beverages',
    subtitle: 'Chips, cold drinks, artisanal cookies & ice-creams delivered till 2 AM',
    badge: '🌙 NIGHT OWL DEALS',
    bg: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    cta: 'Order Snacks',
    link: '/category/snacks-munchies',
    image:
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  },
];

const HeroPromoBanner = ({ banners = DEFAULT_PROMO_BANNERS, interval = 4500 }) => {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [banners, interval]);

  if (!banners || banners.length === 0) return null;
  const banner = banners[activeBanner] || banners[0];

  return (
    <div
      data-testid="hero-promo-banner"
      style={{
        borderRadius: '24px',
        background: banner.bg,
        color: '#ffffff',
        padding: '36px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)',
        minHeight: '230px',
      }}
    >
      <div style={{ maxWidth: '520px', zIndex: 2 }}>
        <span
          data-testid="promo-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          {banner.badge}
        </span>
        <h1
          style={{
            fontSize: '2.1rem',
            lineHeight: '1.15',
            marginBottom: '8px',
            color: '#ffffff',
          }}
        >
          {banner.title}
        </h1>
        <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5', marginBottom: '20px' }}>
          {banner.subtitle}
        </p>
        <Link to={banner.link} className="btn btn-accent btn-lg" style={{ fontWeight: '800' }}>
          {banner.cta} <ArrowRight size={18} />
        </Link>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={banner.image}
          alt={banner.title}
          style={{
            width: '260px',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '18px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
            border: '3px solid rgba(255,255,255,0.4)',
          }}
        />
      </div>

      {/* Carousel Indicators */}
      {banners.length > 1 && (
        <div
          data-testid="banner-indicators"
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '32px',
            display: 'flex',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setActiveBanner(idx)}
              style={{
                width: activeBanner === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: activeBanner === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

HeroPromoBanner.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string,
      subtitle: PropTypes.string,
      badge: PropTypes.string,
      bg: PropTypes.string,
      cta: PropTypes.string,
      link: PropTypes.string,
      image: PropTypes.string,
    })
  ),
  interval: PropTypes.number,
};

export default HeroPromoBanner;

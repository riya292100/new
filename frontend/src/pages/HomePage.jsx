import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ShieldCheck, Tag, ArrowRight, Sparkles, Flame, ThumbsUp } from 'lucide-react';
import logger from '../utils/logger';
import { catalogApi, categoryApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

const PROMO_BANNERS = [
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
    id: 3,
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

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, dealsRes] = await Promise.all([
          catalogApi.getCategories().catch(() => null),
          catalogApi.getFeaturedProducts().catch(() => null),
          catalogApi.getDailyDeals().catch(() => null),
        ]);

        const loadedCats = catRes?.data || (Array.isArray(catRes) ? catRes : null) || [];
        const loadedFeat = featRes?.data || (Array.isArray(featRes) ? featRes : null) || [];
        const loadedDeals = dealsRes?.data || (Array.isArray(dealsRes) ? dealsRes : null) || [];

        setCategories(loadedCats.length > 0 ? loadedCats : FALLBACK_CATEGORIES);
        setFeaturedProducts(
          loadedFeat.length > 0 ? loadedFeat : FALLBACK_PRODUCTS.filter((p) => p.isFeatured)
        );
        setDailyDeals(
          loadedDeals.length > 0 ? loadedDeals : FALLBACK_PRODUCTS.filter((p) => p.isDeal)
        );
      } catch (err) {
        logger.warn('HomePage', 'Failed to load homepage data, using demo fallback', err);
        setCategories(FALLBACK_CATEGORIES);
        setFeaturedProducts(FALLBACK_PRODUCTS.filter((p) => p.isFeatured));
        setDailyDeals(FALLBACK_PRODUCTS.filter((p) => p.isDeal));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto banner rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = PROMO_BANNERS[activeBanner];

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      {/* Hero Promotional Banner */}
      <div
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
            alt=""
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
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '32px',
            display: 'flex',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {PROMO_BANNERS.map((_, idx) => (
            <button
              key={idx}
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
      </div>

      {/* 10-30 Minute Delivery Guarantee Strip */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '36px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Zap size={22} fill="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Instant Delivery in 10–30 Minutes
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Fresh stock dispatched from local micro-warehouses near you
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: '#334155',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#059669" /> Free Delivery over ₹199
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#059669" /> 100% Quality Guarantee
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <CategoryCarousel categories={categories} />

      {/* Deal of the Day Section */}
      {dailyDeals.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={20} color="#f59e0b" />
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Deals of the Day</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Unbeatable limited-time discounts on daily groceries
              </p>
            </div>
            <Link
              to="/category/all?deal=true"
              style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: '#059669',
                textDecoration: 'none',
              }}
            >
              View All Deals ➔
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '16px',
            }}
          >
            {dailyDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Best Sellers / Recommended Section */}
      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThumbsUp size={18} color="#059669" />
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Trending & Best Sellers</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Top ordered essentials by neighborhood customers
              </p>
            </div>
            <Link
              to="/category/all"
              style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: '#059669',
                textDecoration: 'none',
              }}
            >
              Explore All ➔
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '16px',
            }}
          >
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default HomePage;

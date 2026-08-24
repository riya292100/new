import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Clock,
  ShieldCheck,
  Tag,
  ArrowRight,
  Sparkles,
  Flame,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  Truck,
  RotateCcw,
  CreditCard,
  Percent,
} from 'lucide-react';
import logger from '../utils/logger';
import { catalogApi, pincodeApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

const PROMO_BANNERS = [
  {
    id: 1,
    title: '⚡ 1-Hour SuperFast Pan-India Delivery',
    subtitle:
      'Flagship 5G Smartphones, Laptops, Wireless Audio & Essentials at your door in under 60 mins',
    badge: '⚡ SUPERFAST EXPRESS',
    bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #0d9488 100%)',
    cta: 'Explore Flagship 5G',
    link: '/category/mobiles-tablets',
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Mega Electronics & Audio Carnival',
    subtitle: 'Up to 70% OFF on boAt, Sony ANC Headphones, Noise Smartwatches & Apple MacBooks',
    badge: '🎧 AUDIO CARNIVAL',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)',
    cta: 'Shop Electronics',
    link: '/category/electronics-audio',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Smart Home & Kitchen Revolution',
    subtitle:
      'Philips Digital Air Fryers, Inverter Appliances & Cookware with instant dark-store dispatch',
    badge: '🍳 HOME ESSENTIALS',
    bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
    cta: 'Upgrade Your Home',
    link: '/category/home-kitchen',
    image:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  },
];

const BRANDS = [
  { name: 'Apple', logo: '🍎', desc: 'iPhones, MacBooks & iPads' },
  { name: 'Samsung', logo: '🌌', desc: 'Galaxy AI & OLED Displays' },
  { name: 'boAt', logo: '⛵', desc: 'True Wireless & ANC Audio' },
  { name: 'Sony', logo: '🎵', desc: 'Industry-leading Sound' },
  { name: "Levi's", logo: '👖', desc: 'Iconic Denim Fit' },
  { name: 'Philips', logo: '💡', desc: 'Smart Air Fryers & Grooming' },
  { name: 'Decathlon', logo: '🏃', desc: 'Sports & Active Fitness' },
  { name: 'Amul', logo: '🥛', desc: 'Fresh Dairy Staples' },
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pincode quick checker
  const [checkPin, setCheckPin] = useState('110001');
  const [pinResult, setPinResult] = useState({
    city: 'New Delhi',
    isOneHourAvailable: true,
    estimatedEta: '45 - 60 minutes',
    hubName: 'QuickCart Express Hub #01 - Connaught Place',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          catalogApi.getCategories().catch(() => null),
          catalogApi.getProducts().catch(() => null),
        ]);

        const loadedCats = catRes?.data || (Array.isArray(catRes) ? catRes : null) || [];
        const loadedProds = prodRes?.data || (Array.isArray(prodRes) ? prodRes : null) || [];

        setCategories(loadedCats.length > 0 ? loadedCats : FALLBACK_CATEGORIES);
        setProducts(loadedProds.length > 0 ? loadedProds : FALLBACK_PRODUCTS);
      } catch (err) {
        logger.warn('HomePage', 'Failed to load homepage data, using demo fallback', err);
        setCategories(FALLBACK_CATEGORIES);
        setProducts(FALLBACK_PRODUCTS);
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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!checkPin || checkPin.length !== 6) return;
    try {
      const res = await pincodeApi.check(checkPin);
      if (res?.data) {
        setPinResult(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const banner = PROMO_BANNERS[activeBanner];

  const mobiles = products.filter(
    (p) =>
      p.category?.slug === 'mobiles-tablets' ||
      p.categoryId === 1 ||
      p.brand === 'Apple' ||
      p.brand === 'Samsung'
  );
  const electronics = products.filter(
    (p) =>
      p.category?.slug === 'electronics-audio' ||
      p.category?.slug === 'computers-accessories' ||
      p.brand === 'boAt' ||
      p.brand === 'Sony'
  );
  const lifestyle = products.filter(
    (p) =>
      p.category?.slug === 'fashion-apparel' ||
      p.category?.slug === 'home-kitchen' ||
      p.category?.slug === 'groceries-essentials'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. Hero Promotional Carousel Banner */}
      <div
        className="rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden transition-all duration-700 min-h-[340px] flex items-center border border-white/10"
        style={{ background: banner.bg }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider border border-white/30">
              <Zap className="w-3.5 h-3.5 fill-current" /> {banner.badge}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
              {banner.title}
            </h1>

            <p className="text-white/90 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              {banner.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={banner.link}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-extrabold text-sm rounded-2xl shadow-xl hover:bg-amber-300 hover:text-gray-950 transition-all hover:scale-105 active:scale-95"
              >
                {banner.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-white/80 bg-black/20 backdrop-blur px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-amber-300" /> Pan-India 45-60m Dispatch
              </div>
            </div>
          </div>

          <div className="hidden md:flex md:col-span-5 justify-center items-center">
            <div className="relative group">
              <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 transform group-hover:scale-105 transition-transform duration-500">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {PROMO_BANNERS.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setActiveBanner(idx)}
              className={`h-2 rounded-full transition-all ${
                activeBanner === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Instant 1-Hour Delivery Pincode Checker Bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                Pan-India 1-Hour SuperFast Delivery Engine
              </div>
              <div className="text-sm font-bold text-gray-900">
                Check delivery speed & express dark-store hub for your pincode
              </div>
            </div>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-48">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit PIN"
                value={checkPin}
                onChange={(e) => setCheckPin(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              Verify Speed
            </button>
          </form>

          {pinResult && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {pinResult.city}:{' '}
                <strong className="text-emerald-700">
                  {pinResult.isOneHourAvailable
                    ? '⚡ 1-Hour Express Available'
                    : '📦 2-3 Days Standard'}
                </strong>{' '}
                ({pinResult.estimatedEta})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Marketplace Categories Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" /> Explore All Categories
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              Popular Marketplace Categories
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-500 p-3 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-50 mb-2 relative">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-current text-amber-500" /> 1-Hr Delivery
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Best Sellers: Mobiles & 5G Flagships */}
      {mobiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600">
                <Zap className="w-3.5 h-3.5 fill-current" /> 1-Hour SuperFast Express
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Flagship Mobiles & Tablets
              </h2>
            </div>
            <Link
              to="/category/mobiles-tablets"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mobiles.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Electronics, Audio & Computers */}
      {electronics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                <Flame className="w-3.5 h-3.5 fill-current" /> Trending Deals
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Electronics, Headphones & Laptops
              </h2>
            </div>
            <Link
              to="/category/electronics-audio"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {electronics.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Top Brands Showcase */}
      <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" /> 100% Genuine Brand Assured
          </div>
          <h2 className="text-2xl font-black text-gray-900">Top Brands On QuickCart</h2>
          <p className="text-xs text-gray-500 mt-1">
            Direct from official manufacturers and verified distributors
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BRANDS.map((b) => (
            <div
              key={b.name}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all hover:scale-105"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                {b.logo}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">{b.name}</div>
                <div className="text-[11px] text-gray-500 line-clamp-1">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Marketplace Trust & Benefits Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-gray-900">1-Hour SuperFast</div>
            <div className="text-xs text-gray-500">Live across 50+ Indian cities</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-gray-900">100% Genuine</div>
            <div className="text-xs text-gray-500">Brand warranty & verified sellers</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-gray-900">7-Day Easy Returns</div>
            <div className="text-xs text-gray-500">Instant door-step pickup & refund</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-gray-900">Flexible Payments</div>
            <div className="text-xs text-gray-500">UPI, Cards, NetBanking & COD</div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default HomePage;

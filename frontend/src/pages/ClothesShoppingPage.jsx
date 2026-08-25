import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Shirt,
  Sparkles,
  Filter,
  ArrowUpDown,
  Search,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
} from 'lucide-react';
import ClothCard from '../components/clothing/ClothCard';
import ClothDetailModal from '../components/clothing/ClothDetailModal';
import { productApi } from '../services/api';
import { FALLBACK_CLOTHES } from '../utils/demoConfig';
import logger from '../utils/logger';

const DEPARTMENTS = ['All', "Men's Wear", "Women's Wear", 'Unisex'];
const GARMENT_TYPES = [
  'All Types',
  'T-Shirts',
  'Jeans',
  'Shirts',
  'Dresses',
  'Activewear',
  'Hoodies',
  'Ethnic Wear',
  'Trousers',
];
const SIZES = ['All Sizes', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36'];

const ClothesShoppingPage = () => {
  const [clothes, setClothes] = useState(FALLBACK_CLOTHES);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedGarmentType, setSelectedGarmentType] = useState('All Types');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchClothes = async () => {
      try {
        setLoading(true);
        // Try fetching category products from backend if category exists
        const res = await productApi.getProducts({ category: 'clothes-fashion', size: 50 });
        if (isMounted && res?.data?.content && res.data.content.length > 0) {
          // Merge with fallback clothes metadata for richer attributes
          const backendItems = res.data.content.map((p) => {
            const match = FALLBACK_CLOTHES.find((f) => f.slug === p.slug);
            return {
              ...p,
              department: match?.department || 'Unisex',
              garmentType: match?.garmentType || 'Apparel',
              sizes: match?.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
              colors: match?.colors || ['Black', 'Navy', 'Grey'],
              fabric: match?.fabric || '100% Breathable Cotton',
              fit: match?.fit || 'Regular Fit',
            };
          });
          setClothes(backendItems);
        } else if (isMounted) {
          setClothes(FALLBACK_CLOTHES);
        }
      } catch (err) {
        logger.warn(
          'ClothesShoppingPage',
          'Failed to fetch clothes from API, using demo catalog',
          err
        );
        if (isMounted) setClothes(FALLBACK_CLOTHES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClothes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort clothes
  const filteredClothes = useMemo(() => {
    return clothes
      .filter((item) => {
        // Department Filter
        if (selectedDepartment === "Men's Wear" && item.department !== 'Men') return false;
        if (selectedDepartment === "Women's Wear" && item.department !== 'Women') return false;
        if (selectedDepartment === 'Unisex' && item.department !== 'Unisex') return false;

        // Garment Type Filter
        if (selectedGarmentType !== 'All Types') {
          const typeLower = selectedGarmentType.toLowerCase();
          const matchName = item.name.toLowerCase().includes(typeLower);
          const matchType = item.garmentType?.toLowerCase() === typeLower;
          if (!matchName && !matchType) return false;
        }

        // Size Filter
        if (selectedSize !== 'All Sizes') {
          const hasSize =
            item.sizes?.includes(selectedSize) ||
            (item.unitQuantity && item.unitQuantity.includes(selectedSize));
          if (!hasSize) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            item.name?.toLowerCase().includes(q) ||
            item.brand?.toLowerCase().includes(q) ||
            item.fabric?.toLowerCase().includes(q) ||
            item.garmentType?.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.sellingPrice ?? a.price ?? 0;
        const priceB = b.sellingPrice ?? b.price ?? 0;
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
        return 0; // default featured
      });
  }, [clothes, selectedDepartment, selectedGarmentType, selectedSize, searchQuery, sortBy]);

  return (
    <div className="container" style={{ padding: '24px 16px', maxWidth: '1240px' }}>
      {/* Hero Banner */}
      <div
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
            Discover everyday cotton t-shirts, stretch denim, casual shirts, flowy dresses, and
            ethnic wear with instant doorstep delivery and 7-day hassle-free exchanges.
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

      {/* Filter Control Bar */}
      <div
        className="glass-card"
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px 20px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Department Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: '14px',
          }}
        >
          <span
            style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', marginRight: '4px' }}
          >
            DEPARTMENT:
          </span>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                  background: isSelected ? '#ecfdf5' : '#f8fafc',
                  color: isSelected ? '#065f46' : '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Garment Type & Size Filter Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Garment Type Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              flex: 1,
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>TYPE:</span>
            {GARMENT_TYPES.map((type) => {
              const isSelected = selectedGarmentType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedGarmentType(type)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: isSelected ? '1px solid #059669' : '1px solid #e2e8f0',
                    background: isSelected ? '#059669' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Size Filter Dropdown / Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>SIZE:</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">✨ Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated (★)</option>
                <option value="discount">Biggest Savings (%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
          Available Apparel & Clothes{' '}
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
            ({filteredClothes.length} items)
          </span>
        </h2>

        {(selectedDepartment !== 'All' ||
          selectedGarmentType !== 'All Types' ||
          selectedSize !== 'All Sizes' ||
          searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedDepartment('All');
              setSelectedGarmentType('All Types');
              setSelectedSize('All Sizes');
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Clothing Grid */}
      {filteredClothes.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredClothes.map((item) => (
            <ClothCard
              key={item.id}
              product={item}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Shirt size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
            No clothing items match your filters
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
            Try choosing a different size, department, or reset your filters to see all available
            apparel.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDepartment('All');
              setSelectedGarmentType('All Types');
              setSelectedSize('All Sizes');
              setSearchQuery('');
            }}
            className="btn btn-primary"
          >
            Show All Clothes
          </button>
        </div>
      )}

      {/* Detailed Product Modal */}
      {selectedProduct && (
        <ClothDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default ClothesShoppingPage;

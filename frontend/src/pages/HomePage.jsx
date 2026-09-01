import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ThumbsUp } from 'lucide-react';
import logger from '../utils/logger';
import { catalogApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS, FALLBACK_CLOTHES } from '../utils/demoConfig';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import ClothDetailModal from '../components/clothing/ClothDetailModal';
import HeroPromoBanner, { DEFAULT_PROMO_BANNERS } from '../components/home/HeroPromoBanner';
import DeliveryGuaranteeStrip from '../components/home/DeliveryGuaranteeStrip';
import InstantFashionBanner from '../components/home/InstantFashionBanner';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, dealsRes] = await Promise.all([
          catalogApi.getCategories().catch((err) => {
            logger.error('HomePage', 'getCategories failed', err);
            return null;
          }),
          catalogApi.getFeaturedProducts().catch((err) => {
            logger.error('HomePage', 'getFeaturedProducts failed', err);
            return null;
          }),
          catalogApi.getDailyDeals().catch((err) => {
            logger.error('HomePage', 'getDailyDeals failed', err);
            return null;
          }),
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
        logger.error('HomePage', 'Failed to load homepage data, using demo fallback', err);
        setCategories(FALLBACK_CATEGORIES);
        setFeaturedProducts(FALLBACK_PRODUCTS.filter((p) => p.isFeatured));
        setDailyDeals(FALLBACK_PRODUCTS.filter((p) => p.isDeal));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      {/* Hero Promotional Banner */}
      <HeroPromoBanner banners={DEFAULT_PROMO_BANNERS} />

      {/* 10-30 Minute Delivery Guarantee Strip */}
      <DeliveryGuaranteeStrip />

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

      {/* Clothes & Fashion Showcase Section */}
      <InstantFashionBanner
        clothes={FALLBACK_CLOTHES}
        onSelectCloth={(cloth) => setSelectedCloth(cloth)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Cloth Detail Modal */}
      {selectedCloth && (
        <ClothDetailModal product={selectedCloth} onClose={() => setSelectedCloth(null)} />
      )}
    </div>
  );
};

export default HomePage;

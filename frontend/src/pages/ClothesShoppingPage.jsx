import React, { useState, useEffect, useMemo } from 'react';
import { Shirt } from 'lucide-react';
import ClothCard from '../components/clothing/ClothCard';
import ClothDetailModal from '../components/clothing/ClothDetailModal';
import ClothingHeroBanner from '../components/clothing/ClothingHeroBanner';
import ClothingFilterBar from '../components/clothing/ClothingFilterBar';
import { productApi } from '../services/api';
import { FALLBACK_CLOTHES } from '../utils/demoConfig';
import logger from '../utils/logger';

const ClothesShoppingPage = () => {
  const [clothes, setClothes] = useState(FALLBACK_CLOTHES);
  const [, setLoading] = useState(true);
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
        const res = await productApi.getProducts({ category: 'clothes-fashion', size: 50 });
        if (isMounted && res?.data?.content && res.data.content.length > 0) {
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
        if (selectedDepartment === "Men's Wear" && item.department !== 'Men') return false;
        if (selectedDepartment === "Women's Wear" && item.department !== 'Women') return false;
        if (selectedDepartment === 'Unisex' && item.department !== 'Unisex') return false;

        if (selectedGarmentType !== 'All Types') {
          const typeLower = selectedGarmentType.toLowerCase();
          const matchName = item.name.toLowerCase().includes(typeLower);
          const matchType = item.garmentType?.toLowerCase() === typeLower;
          if (!matchName && !matchType) return false;
        }

        if (selectedSize !== 'All Sizes') {
          const hasSize =
            item.sizes?.includes(selectedSize) ||
            (item.unitQuantity && item.unitQuantity.includes(selectedSize));
          if (!hasSize) return false;
        }

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
        return 0;
      });
  }, [clothes, selectedDepartment, selectedGarmentType, selectedSize, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedDepartment('All');
    setSelectedGarmentType('All Types');
    setSelectedSize('All Sizes');
    setSearchQuery('');
  };

  return (
    <div className="container" style={{ padding: '24px 16px', maxWidth: '1240px' }}>
      {/* Hero Banner */}
      <ClothingHeroBanner />

      {/* Filter Control Bar */}
      <ClothingFilterBar
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        selectedGarmentType={selectedGarmentType}
        onSelectGarmentType={setSelectedGarmentType}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
      />

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
            onClick={handleResetFilters}
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
          <button type="button" onClick={handleResetFilters} className="btn btn-primary">
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

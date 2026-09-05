import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { ArrowUpDown } from 'lucide-react';
import { useCategoryProducts } from '../hooks/useCategoryProducts';
import '../styles/categoryPage.css';

const CategoryPage = () => {
  const { addToast } = useToast();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const isDeal = searchParams.get('deal');

  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('ASC');

  const {
    categories,
    currentCategory,
    filteredProducts,
    brands,
    selectedBrand,
    setSelectedBrand,
    selectedProduct,
    setSelectedProduct,
    loading,
  } = useCategoryProducts({
    slug,
    searchQuery,
    isDeal,
    sortBy,
    sortDirection,
    onError: (msg) => addToast(msg, 'error'),
  });

  return (
    <div className="container category-page-container">
      {/* Category Header */}
      <div className="category-header">
        <h1 className="category-title">
          {currentCategory?.name || 'Browse Groceries'}
        </h1>
        <p className="category-subtitle">
          {currentCategory?.description || 'Fast 10-30 min delivery'} • {filteredProducts.length}{' '}
          items available
        </p>
      </div>

      {/* Category Horizontal Quick Filter Chips */}
      <div className="category-chips-bar">
        <Link
          to="/category/all"
          className={`category-chip ${!slug || slug === 'all' ? 'active' : ''}`}
        >
          All Items
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className={`category-chip ${slug === c.slug ? 'active' : ''}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}
      >
        {/* Brand Filter */}
        {brands.length > 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Brand:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {brands.slice(0, 6).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: selectedBrand === b ? '#ecfdf5' : '#f8fafc',
                    color: selectedBrand === b ? '#059669' : '#475569',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span
            style={{
              fontSize: '0.82rem',
              color: '#64748b',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ArrowUpDown size={14} /> Sort:
          </span>
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('-');
              setSortBy(sb);
              setSortDirection(sd);
            }}
            className="input-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="id-ASC">Recommended</option>
            <option value="sellingPrice-ASC">Price: Low to High</option>
            <option value="sellingPrice-DESC">Price: High to Low</option>
            <option value="rating-DESC">Highest Rated</option>
            <option value="discountPercentage-DESC">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
            No products found
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
            Try selecting a different category or clearing filters
          </p>
          <Link to="/category/all" className="btn btn-primary">
            View All Products
          </Link>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default CategoryPage;

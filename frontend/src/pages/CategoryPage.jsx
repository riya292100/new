import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { catalogApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { Filter, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const isDeal = searchParams.get('deal');

  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    catalogApi.getCategories().then((res) => {
      if (res?.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (searchQuery) {
          const res = await catalogApi.searchProducts(searchQuery);
          if (res?.data) {
            setProducts(res.data);
            setCurrentCategory({
              name: `Search: "${searchQuery}"`,
              description: `Matching products for ${searchQuery}`,
            });
          }
        } else if (slug && slug !== 'all') {
          const catRes = await catalogApi.getCategoryBySlug(slug);
          if (catRes?.data) {
            setCurrentCategory(catRes.data);
            const prodRes = await catalogApi.getProducts({
              categoryId: catRes.data.id,
              sortBy,
              sortDirection,
              size: 50,
            });
            if (prodRes?.data?.content) {
              setProducts(prodRes.data.content);
            }
          }
        } else {
          setCurrentCategory({
            name: isDeal ? 'Deals of the Day' : 'All Groceries & Essentials',
            description: 'Browse full instant delivery catalog',
          });
          const res = isDeal
            ? await catalogApi.getDailyDeals()
            : await catalogApi.getProducts({ size: 50, sortBy, sortDirection });
          if (res?.data?.content) {
            setProducts(res.data.content);
          } else if (Array.isArray(res?.data)) {
            setProducts(res.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, searchQuery, isDeal, sortBy, sortDirection]);

  // Extract unique brands for filtering
  const brands = ['ALL', ...new Set(products.map((p) => p.brand).filter(Boolean))];
  const filteredProducts =
    selectedBrand === 'ALL' ? products : products.filter((p) => p.brand === selectedBrand);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Category Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '4px' }}>
          {currentCategory?.name || 'Browse Groceries'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {currentCategory?.description || 'Fast 10-30 min delivery'} • {filteredProducts.length}{' '}
          items available
        </p>
      </div>

      {/* Category Horizontal Quick Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        <Link
          to="/category/all"
          style={{
            whiteSpace: 'nowrap',
            padding: '8px 16px',
            borderRadius: '9999px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '700',
            background: !slug || slug === 'all' ? '#059669' : '#ffffff',
            color: !slug || slug === 'all' ? '#ffffff' : '#334155',
            border: '1px solid #e2e8f0',
            transition: 'all 0.15s',
          }}
        >
          All Items
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            style={{
              whiteSpace: 'nowrap',
              padding: '8px 16px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: slug === c.slug ? '#059669' : '#ffffff',
              color: slug === c.slug ? '#ffffff' : '#334155',
              border: '1px solid #e2e8f0',
              transition: 'all 0.15s',
            }}
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

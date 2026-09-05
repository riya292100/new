import { useState, useEffect, useCallback, useMemo } from 'react';
import { catalogApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';
import logger from '../utils/logger';

/**
 * Custom hook to manage category products fetching, search filtering,
 * brand extraction, and error handling with graceful fallback.
 */
export const useCategoryProducts = ({
  slug,
  searchQuery,
  isDeal,
  sortBy = 'id',
  sortDirection = 'ASC',
  onError,
} = {}) => {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch all categories once
  useEffect(() => {
    let isMounted = true;
    catalogApi
      .getCategories()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          logger.error('useCategoryProducts', 'getCategories failed, using fallback', err);
          setCategories(FALLBACK_CATEGORIES);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products based on category, search, or deals
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (searchQuery) {
        const res = await catalogApi.searchProducts(searchQuery).catch((err) => {
          logger.error('useCategoryProducts', 'searchProducts failed', err);
          return null;
        });
        const found = res?.data || (Array.isArray(res) ? res : null);
        if (found && found.length > 0) {
          setProducts(found);
        } else {
          const matches = FALLBACK_PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setProducts(matches.length > 0 ? matches : FALLBACK_PRODUCTS);
        }
        setCurrentCategory({
          name: `Search: "${searchQuery}"`,
          description: `Matching products for ${searchQuery}`,
        });
      } else if (slug && slug !== 'all') {
        const catRes = await catalogApi.getCategoryBySlug(slug).catch((err) => {
          logger.error('useCategoryProducts', 'getCategoryBySlug failed', err);
          return null;
        });
        const currentCat = catRes?.data ||
          FALLBACK_CATEGORIES.find((c) => c.slug === slug) || {
            id: 1,
            name: slug.replace('-', ' '),
            description: 'Fresh groceries',
          };
        setCurrentCategory(currentCat);

        const prodRes = await catalogApi
          .getProducts({
            categoryId: currentCat.id,
            sortBy,
            sortDirection,
            size: 50,
          })
          .catch((err) => {
            logger.error('useCategoryProducts', 'getProducts for category failed', err);
            return null;
          });

        const catProds =
          prodRes?.data?.content || (Array.isArray(prodRes?.data) ? prodRes.data : null);

        if (catProds && catProds.length > 0) {
          setProducts(catProds);
        } else {
          const fallbackFiltered = FALLBACK_PRODUCTS.filter(
            (p) => p.categorySlug === slug || p.categoryId === currentCat.id
          );
          setProducts(fallbackFiltered.length > 0 ? fallbackFiltered : FALLBACK_PRODUCTS);
        }
      } else {
        setCurrentCategory({
          name: isDeal ? 'Deals of the Day' : 'All Groceries & Essentials',
          description: 'Browse full instant delivery catalog',
        });
        const res = isDeal
          ? await catalogApi.getDailyDeals().catch((err) => {
              logger.error('useCategoryProducts', 'getDailyDeals failed', err);
              return null;
            })
          : await catalogApi.getProducts({ size: 50, sortBy, sortDirection }).catch((err) => {
              logger.error('useCategoryProducts', 'getProducts failed', err);
              return null;
            });

        const allProds = res?.data?.content || (Array.isArray(res?.data) ? res.data : null);

        if (allProds && allProds.length > 0) {
          setProducts(allProds);
        } else {
          if (!res && onError) onError('Failed to load products');
          setProducts(isDeal ? FALLBACK_PRODUCTS.filter((p) => p.isDeal) : FALLBACK_PRODUCTS);
        }
      }
    } catch (err) {
      logger.error('useCategoryProducts', 'Error fetching category products, using fallback', err);
      if (onError) onError('Failed to load products');
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [slug, searchQuery, isDeal, sortBy, sortDirection, onError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract unique brands for filtering
  const brands = useMemo(() => {
    return ['ALL', ...new Set(products.map((p) => p.brand).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return selectedBrand === 'ALL'
      ? products
      : products.filter((p) => p.brand === selectedBrand);
  }, [products, selectedBrand]);

  return {
    categories,
    currentCategory,
    products,
    filteredProducts,
    brands,
    selectedBrand,
    setSelectedBrand,
    selectedProduct,
    setSelectedProduct,
    loading,
    refetch: fetchProducts,
  };
};

export default useCategoryProducts;

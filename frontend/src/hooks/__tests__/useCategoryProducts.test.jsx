import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCategoryProducts } from '../useCategoryProducts';
import { catalogApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  catalogApi: {
    getCategories: vi.fn(),
    getProducts: vi.fn(),
    getCategoryBySlug: vi.fn(),
    searchProducts: vi.fn(),
    getDailyDeals: vi.fn(),
  },
}));

describe('useCategoryProducts hook', () => {
  const mockCategories = [
    { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    { id: 2, name: 'Dairy & Breakfast', slug: 'dairy-breakfast' },
  ];

  const mockProducts = [
    {
      id: 101,
      name: 'Fresh Apples',
      brand: 'FarmFresh',
      categoryId: 1,
      categorySlug: 'fruits-vegetables',
      sellingPrice: 120,
    },
    {
      id: 102,
      name: 'Organic Milk',
      brand: 'Amul',
      categoryId: 2,
      categorySlug: 'dairy-breakfast',
      sellingPrice: 32,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    catalogApi.getCategories.mockResolvedValue({ data: mockCategories });
    catalogApi.getProducts.mockResolvedValue({ data: { content: mockProducts } });
    catalogApi.getCategoryBySlug.mockResolvedValue({ data: mockCategories[0] });
    catalogApi.searchProducts.mockResolvedValue({ data: [mockProducts[0]] });
    catalogApi.getDailyDeals.mockResolvedValue({ data: [mockProducts[0]] });
  });

  it('fetches categories and all products when slug is empty or all', async () => {
    const { result } = renderHook(() => useCategoryProducts({ slug: 'all' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories.length).toBe(mockCategories.length);
    expect(result.current.products.length).toBe(mockProducts.length);
    expect(result.current.brands).toContain('FarmFresh');
    expect(result.current.brands).toContain('Amul');
  });

  it('filters by category slug when specific slug is provided', async () => {
    const { result } = renderHook(() =>
      useCategoryProducts({ slug: 'fruits-vegetables' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(catalogApi.getCategoryBySlug).toHaveBeenCalledWith('fruits-vegetables');
    expect(result.current.currentCategory?.slug).toBe('fruits-vegetables');
  });

  it('filters by brand when setSelectedBrand is called', async () => {
    const { result } = renderHook(() => useCategoryProducts({ slug: 'all' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedBrand('FarmFresh');
    });

    expect(result.current.filteredProducts.length).toBe(1);
    expect(result.current.filteredProducts[0].name).toBe('Fresh Apples');
  });

  it('handles search query parameter properly', async () => {
    const { result } = renderHook(() =>
      useCategoryProducts({ searchQuery: 'Apples' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(catalogApi.searchProducts).toHaveBeenCalledWith('Apples');
    expect(result.current.currentCategory?.name).toContain('Apples');
  });

  it('falls back to demo data gracefully if API rejects', async () => {
    catalogApi.getCategories.mockRejectedValue(new Error('Network error'));
    catalogApi.getProducts.mockRejectedValue(new Error('Network error'));

    const onError = vi.fn();
    const { result } = renderHook(() => useCategoryProducts({ slug: 'all', onError }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products.length).toBeGreaterThan(0);
    expect(onError).toHaveBeenCalledWith('Failed to load products');
  });
});

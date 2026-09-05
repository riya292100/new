import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminDashboardData, DEFAULT_ADMIN_STATS } from '../useAdminDashboardData';
import { adminApi, catalogApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  adminApi: {
    getDashboardStats: vi.fn(),
    getAllCoupons: vi.fn(),
    getLowStockProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    createCoupon: vi.fn(),
    restockProduct: vi.fn(),
  },
  catalogApi: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

describe('useAdminDashboardData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getDashboardStats.mockResolvedValue({
      data: { ...DEFAULT_ADMIN_STATS, totalOrders: 1500 },
    });
    catalogApi.getProducts.mockResolvedValue({
      data: { content: [{ id: 1, name: 'Milk', sellingPrice: 30, stockQuantity: 50 }] },
    });
    catalogApi.getCategories.mockResolvedValue({
      data: [{ id: 1, name: 'Dairy', slug: 'dairy' }],
    });
    adminApi.getAllCoupons.mockResolvedValue({
      data: [{ id: 1, code: 'SAVE10', discountValue: 10 }],
    });
    adminApi.getLowStockProducts.mockResolvedValue({
      data: [],
    });
  });

  it('fetches all dashboard datasets on initial mount', async () => {
    const { result } = renderHook(() => useAdminDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.totalOrders).toBe(1500);
    expect(result.current.products.length).toBe(1);
    expect(result.current.categories.length).toBe(1);
    expect(result.current.coupons.length).toBe(1);
  });

  it('saves new product successfully via adminApi.createProduct', async () => {
    adminApi.createProduct.mockResolvedValue({ data: { success: true } });
    const onToast = vi.fn();
    const { result } = renderHook(() => useAdminDashboardData({ onToast }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let res;
    await act(async () => {
      res = await result.current.saveProduct({ name: 'Bread', sellingPrice: 25 });
    });

    expect(adminApi.createProduct).toHaveBeenCalledWith({ name: 'Bread', sellingPrice: 25 });
    expect(onToast).toHaveBeenCalledWith('Product created successfully', 'success');
    expect(res.success).toBe(true);
  });

  it('updates existing product successfully via adminApi.updateProduct', async () => {
    adminApi.updateProduct.mockResolvedValue({ data: { success: true } });
    const onToast = vi.fn();
    const { result } = renderHook(() => useAdminDashboardData({ onToast }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProduct({ name: 'Milk 1L' }, { id: 1 });
    });

    expect(adminApi.updateProduct).toHaveBeenCalledWith(1, { name: 'Milk 1L' });
    expect(onToast).toHaveBeenCalledWith('Product updated successfully', 'success');
  });

  it('deletes product and updates list', async () => {
    adminApi.deleteProduct.mockResolvedValue({ data: { success: true } });
    const onToast = vi.fn();
    const { result } = renderHook(() => useAdminDashboardData({ onToast }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteProduct(1);
    });

    expect(adminApi.deleteProduct).toHaveBeenCalledWith(1);
    expect(onToast).toHaveBeenCalledWith('Product deleted', 'info');
  });

  it('creates coupon successfully', async () => {
    adminApi.createCoupon.mockResolvedValue({ data: { success: true } });
    const onToast = vi.fn();
    const { result } = renderHook(() => useAdminDashboardData({ onToast }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createCoupon({ code: 'DEAL50', discountValue: 50 });
    });

    expect(adminApi.createCoupon).toHaveBeenCalled();
    expect(onToast).toHaveBeenCalledWith('Coupon created successfully', 'success');
  });

  it('falls back to local mutation when saveProduct fails', async () => {
    adminApi.createProduct.mockRejectedValue(new Error('Server unavailable'));
    const onToast = vi.fn();
    const { result } = renderHook(() => useAdminDashboardData({ onToast }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let res;
    await act(async () => {
      res = await result.current.saveProduct({ name: 'Fresh Apples', sellingPrice: 50 });
    });

    expect(res.isFallback).toBe(true);
    expect(result.current.products.some((p) => p.name === 'Fresh Apples')).toBe(true);
    expect(onToast).toHaveBeenCalledWith(
      'Product created successfully (local demo sync)',
      'success'
    );
  });
});

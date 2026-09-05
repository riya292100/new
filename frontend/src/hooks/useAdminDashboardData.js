import { useState, useEffect, useCallback } from 'react';
import { adminApi, catalogApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';
import logger from '../utils/logger';

export const DEFAULT_ADMIN_STATS = {
  totalOrders: 1482,
  totalRevenue: 439200,
  activeCouriers: 18,
  lowStockCount: 3,
  deliveredToday: 164,
  averageDeliveryTimeMinutes: 11.4,
  activeCustomers: 890,
};

export const DEFAULT_COUPONS = [
  {
    id: 1,
    code: 'WELCOME50',
    description: '50% off up to ₹100 on first grocery order',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    minOrderValue: 150,
    maxDiscountAmount: 100,
    timesUsed: 142,
    active: true,
  },
  {
    id: 2,
    code: 'QUICK100',
    description: 'Flat ₹100 off on orders above ₹499',
    discountType: 'FLAT',
    discountValue: 100,
    minOrderValue: 499,
    maxDiscountAmount: 100,
    timesUsed: 89,
    active: true,
  },
  {
    id: 3,
    code: 'SUPERFRESH',
    description: '20% off on fresh fruits and veggies',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 250,
    maxDiscountAmount: 75,
    timesUsed: 310,
    active: true,
  },
];

export const useAdminDashboardData = ({ onToast } = {}) => {
  const [stats, setStats] = useState(DEFAULT_ADMIN_STATS);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [lowStockProducts, setLowStockProducts] = useState(
    FALLBACK_PRODUCTS.filter((p) => (p.stockQuantity ?? 50) <= 35)
  );
  const [loading, setLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      let statsFailed = false;
      const [statsRes, prodRes, catRes, coupRes, lowRes] = await Promise.all([
        adminApi.getDashboardStats().catch((err) => {
          logger.error('AdminDashboard', 'getDashboardStats failed', err);
          statsFailed = true;
          return null;
        }),
        catalogApi.getProducts({ size: 100 }).catch((err) => {
          logger.error('AdminDashboard', 'getProducts failed', err);
          return null;
        }),
        catalogApi.getCategories().catch((err) => {
          logger.error('AdminDashboard', 'getCategories failed', err);
          return null;
        }),
        adminApi.getAllCoupons().catch((err) => {
          logger.error('AdminDashboard', 'getAllCoupons failed', err);
          return null;
        }),
        adminApi.getLowStockProducts().catch((err) => {
          logger.error('AdminDashboard', 'getLowStockProducts failed', err);
          return null;
        }),
      ]);

      if (statsFailed || !statsRes?.data) {
        if (onToast) onToast('Failed to load dashboard data', 'error');
      }

      if (statsRes?.data) setStats(statsRes.data);
      if (prodRes?.data?.content && prodRes.data.content.length > 0) {
        setProducts(prodRes.data.content);
      }
      if (catRes?.data && catRes.data.length > 0) setCategories(catRes.data);
      if (coupRes?.data && coupRes.data.length > 0) setCoupons(coupRes.data);
      if (lowRes?.data && lowRes.data.length > 0) {
        setLowStockProducts(lowRes.data);
      }
    } catch (err) {
      logger.error('useAdminDashboardData', 'fetch failed', err);
      if (onToast) onToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const saveProduct = async (productForm, editingProduct = null) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productForm);
        if (onToast) onToast('Product updated successfully', 'success');
      } else {
        await adminApi.createProduct(productForm);
        if (onToast) onToast('Product created successfully', 'success');
      }
      await fetchAllData();
      return { success: true };
    } catch (err) {
      logger.error('useAdminDashboardData', 'saveProduct failed, using fallback', err);
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p))
        );
        if (onToast) onToast('Product updated successfully (local demo sync)', 'success');
      } else {
        const newProd = {
          ...productForm,
          id: Date.now(),
          sellingPrice: Number(productForm.sellingPrice) || 99,
          price: Number(productForm.sellingPrice) || 99,
          mrp: Number(productForm.mrp) || 120,
        };
        setProducts((prev) => [newProd, ...prev]);
        if (onToast) onToast('Product created successfully (local demo sync)', 'success');
      }
      return { success: true, isFallback: true };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await adminApi.deleteProduct(id);
      if (onToast) onToast('Product deleted', 'info');
      await fetchAllData();
      return { success: true };
    } catch (err) {
      logger.error('useAdminDashboardData', 'deleteProduct failed, using fallback', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (onToast) onToast('Product deleted', 'info');
      return { success: true, isFallback: true };
    }
  };

  const createCoupon = async (couponForm) => {
    try {
      await adminApi.createCoupon(couponForm);
      if (onToast) onToast('Coupon created successfully', 'success');
      await fetchAllData();
      return { success: true };
    } catch (err) {
      logger.error('useAdminDashboardData', 'createCoupon failed, using fallback', err);
      const newCoupon = {
        ...couponForm,
        id: Date.now(),
        timesUsed: 0,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      if (onToast) onToast('Coupon created successfully (local demo sync)', 'success');
      return { success: true, isFallback: true };
    }
  };

  const restockProduct = async (productId, quantity) => {
    try {
      await adminApi.restockProduct(productId, quantity);
      if (onToast) onToast(`Restocked +${quantity} units!`, 'success');
      await fetchAllData();
      return { success: true };
    } catch (err) {
      logger.error('useAdminDashboardData', 'restockProduct failed, using fallback', err);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stockQuantity: (p.stockQuantity || 0) + quantity, inStock: true }
            : p
        )
      );
      setLowStockProducts((prev) => prev.filter((p) => p.id !== productId));
      if (onToast) onToast(`Restocked +${quantity} units!`, 'success');
      return { success: true, isFallback: true };
    }
  };

  return {
    stats,
    products,
    categories,
    coupons,
    lowStockProducts,
    loading,
    fetchAllData,
    saveProduct,
    deleteProduct,
    createCoupon,
    restockProduct,
    setProducts,
    setCoupons,
  };
};

export default useAdminDashboardData;

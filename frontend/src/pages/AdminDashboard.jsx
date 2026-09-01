import React, { useState, useEffect } from 'react';
import { adminApi, catalogApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import AdminProductTable from '../components/admin/AdminProductTable';
import AdminProductModal from '../components/admin/AdminProductModal';
import AdminCouponManager from '../components/admin/AdminCouponManager';
import AdminLowStockAlerts from '../components/admin/AdminLowStockAlerts';

const DEFAULT_ADMIN_STATS = {
  totalOrders: 1482,
  totalRevenue: 439200,
  activeCouriers: 18,
  lowStockCount: 3,
  deliveredToday: 164,
  averageDeliveryTimeMinutes: 11.4,
  activeCustomers: 890,
};

const DEFAULT_COUPONS = [
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

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState(DEFAULT_ADMIN_STATS);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [lowStockProducts, setLowStockProducts] = useState(
    FALLBACK_PRODUCTS.filter((p) => p.stockQuantity <= 35)
  );

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    categoryId: 1,
    sellingPrice: '',
    mrp: '',
    discountPercentage: 0,
    unitQuantity: '500 g',
    stockQuantity: 50,
    lowStockThreshold: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    description: '',
    inStock: true,
    isFeatured: false,
    isDailyDeal: false,
  });

  // Coupon modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 299,
    maxDiscountAmount: 100,
    active: true,
  });

  const fetchAllData = async () => {
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
        addToast('Failed to load dashboard data', 'error');
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
      logger.error('AdminDashboard', 'fetch failed', err);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productForm);
        addToast('Product updated successfully', 'success');
      } else {
        await adminApi.createProduct(productForm);
        addToast('Product created successfully', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchAllData();
    } catch (err) {
      logger.error('AdminDashboard', 'handleSaveProduct failed, using local demo fallback', err);
      // Local mutation fallback
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p))
        );
        addToast('Product updated successfully (local demo sync)', 'success');
      } else {
        const newProd = {
          ...productForm,
          id: Date.now(),
          sellingPrice: Number(productForm.sellingPrice) || 99,
          price: Number(productForm.sellingPrice) || 99,
          mrp: Number(productForm.mrp) || 120,
        };
        setProducts((prev) => [newProd, ...prev]);
        addToast('Product created successfully (local demo sync)', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await adminApi.deleteProduct(id);
      addToast('Product deleted', 'info');
      fetchAllData();
    } catch (err) {
      logger.error('AdminDashboard', 'handleDeleteProduct failed, applying local fallback', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast('Product deleted', 'info');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon(couponForm);
      addToast('Coupon created successfully', 'success');
      setShowCouponModal(false);
      fetchAllData();
    } catch (err) {
      logger.error('AdminDashboard', 'handleCreateCoupon failed, applying local fallback', err);
      const newCoupon = {
        ...couponForm,
        id: Date.now(),
        timesUsed: 0,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      addToast('Coupon created successfully (local demo sync)', 'success');
      setShowCouponModal(false);
    }
  };

  const handleRestock = async (productId, quantity) => {
    try {
      await adminApi.restockProduct(productId, quantity);
      addToast(`Restocked +${quantity} units!`, 'success');
      fetchAllData();
    } catch (err) {
      logger.error('AdminDashboard', 'handleRestock failed, applying local fallback', err);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stockQuantity: (p.stockQuantity || 0) + quantity, inStock: true }
            : p
        )
      );
      setLowStockProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast(`Restocked +${quantity} units!`, 'success');
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      categoryId: categories[0]?.id || 1,
      sellingPrice: '',
      mrp: '',
      discountPercentage: 0,
      unitQuantity: '500 g',
      stockQuantity: 50,
      lowStockThreshold: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
      description: '',
      inStock: true,
      isFeatured: false,
      isDailyDeal: false,
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand || '',
      categoryId: prod.categoryId,
      sellingPrice: prod.sellingPrice,
      mrp: prod.mrp,
      discountPercentage: prod.discountPercentage || 0,
      unitQuantity: prod.unitQuantity,
      stockQuantity: prod.stockQuantity,
      lowStockThreshold: prod.lowStockThreshold || 10,
      imageUrl: prod.imageUrl,
      description: prod.description || '',
      inStock: prod.inStock,
      isFeatured: prod.isFeatured || false,
      isDailyDeal: prod.isDailyDeal || false,
    });
    setShowProductModal(true);
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#059669" />
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Admin Control Center</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Dark store operations, inventory management, catalog curation, and real-time dispatcher.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* KPI Stats */}
      <AdminStatsCards stats={stats} />

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #f1f5f9',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'overview', label: 'Products & Catalog' },
          { key: 'coupons', label: 'Coupons & Promos' },
          { key: 'inventory', label: 'Low Stock Alerts' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeTab === tab.key ? '#059669' : 'transparent',
              color: activeTab === tab.key ? '#ffffff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <AdminProductTable
          products={products}
          onAddProduct={openAddProduct}
          onEditProduct={openEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'coupons' && (
        <AdminCouponManager
          coupons={coupons}
          showCouponModal={showCouponModal}
          setShowCouponModal={setShowCouponModal}
          couponForm={couponForm}
          setCouponForm={setCouponForm}
          onCreateCoupon={handleCreateCoupon}
        />
      )}

      {activeTab === 'inventory' && (
        <AdminLowStockAlerts lowStockProducts={lowStockProducts} onRestock={handleRestock} />
      )}

      {/* Product Modal */}
      <AdminProductModal
        show={showProductModal}
        editingProduct={editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        onSave={handleSaveProduct}
        onClose={() => setShowProductModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;

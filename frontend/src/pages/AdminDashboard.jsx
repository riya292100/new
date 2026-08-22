import React, { useState, useEffect } from 'react';
import { adminApi, catalogApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import AdminProductTable from '../components/admin/AdminProductTable';
import AdminProductModal from '../components/admin/AdminProductModal';
import AdminCouponManager from '../components/admin/AdminCouponManager';
import AdminLowStockAlerts from '../components/admin/AdminLowStockAlerts';

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

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
      const [statsRes, prodRes, catRes, coupRes, lowRes] = await Promise.all([
        adminApi.getDashboardStats(),
        catalogApi.getProducts({ size: 100 }),
        catalogApi.getCategories(),
        adminApi.getAllCoupons(),
        adminApi.getLowStockProducts(),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (prodRes?.data?.content) setProducts(prodRes.data.content);
      if (catRes?.data) setCategories(catRes.data);
      if (coupRes?.data) setCoupons(coupRes.data);
      if (lowRes?.data) setLowStockProducts(lowRes.data);
    } catch (err) {
      addToast('Failed to sync admin data', 'error');
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
      addToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await adminApi.deleteProduct(id);
      addToast('Product deleted', 'info');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
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
      addToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleRestock = async (productId, quantity) => {
    try {
      await adminApi.restockProduct(productId, quantity);
      addToast(`Restocked +${quantity} units!`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Restock failed', 'error');
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

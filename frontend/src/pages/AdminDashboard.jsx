import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import AdminProductTable from '../components/admin/AdminProductTable';
import AdminProductModal from '../components/admin/AdminProductModal';
import AdminCouponManager from '../components/admin/AdminCouponManager';
import AdminLowStockAlerts from '../components/admin/AdminLowStockAlerts';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const {
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
  } = useAdminDashboardData({
    onToast: (msg, type) => addToast(msg, type),
  });

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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    await saveProduct(productForm, editingProduct);
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    await deleteProduct(id);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    await createCoupon(couponForm);
    setShowCouponModal(false);
  };

  const handleRestock = async (productId, quantity) => {
    await restockProduct(productId, quantity);
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
    <div className="container admin-dashboard-container">
      {/* Top Bar */}
      <div className="admin-header-card">
        <div className="admin-header-title-group">
          <div className="admin-header-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="admin-header-h1">Admin Control Center</h1>
            <p className="admin-header-sub">
              Dark store operations, inventory management, catalog curation, and real-time dispatcher.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          className="admin-refresh-btn"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* KPI Stats */}
      <AdminStatsCards stats={stats} />

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        {[
          { key: 'overview', label: 'Products & Catalog' },
          { key: 'coupons', label: 'Coupons & Promos' },
          { key: 'inventory', label: 'Low Stock Alerts' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
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

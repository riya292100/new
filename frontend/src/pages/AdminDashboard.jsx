import React, { useState, useEffect } from 'react';
import { adminApi, catalogApi, couponApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp, ShoppingCart, AlertCircle, Users, Package,
  Plus, Edit, Trash2, Tag, ShieldCheck, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories, orders, coupons, inventory
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);

  // Product modal
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
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    description: '',
    inStock: true,
    isFeatured: false,
    isDailyDeal: false,
  });

  // Coupon modal
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
      const [statsRes, prodRes, catRes, ordRes, coupRes, lowRes, partRes] = await Promise.all([
        adminApi.getDashboardStats(),
        catalogApi.getProducts({ size: 100 }),
        catalogApi.getCategories(),
        adminApi.getAllOrders(),
        adminApi.getAllCoupons(),
        adminApi.getLowStockProducts(),
        adminApi.getDeliveryPartners(),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (prodRes?.data?.content) setProducts(prodRes.data.content);
      if (catRes?.data) setCategories(catRes.data);
      if (ordRes?.data) setOrders(ordRes.data);
      if (coupRes?.data) setCoupons(coupRes.data);
      if (lowRes?.data) setLowStockProducts(lowRes.data);
      if (partRes?.data) setDeliveryPartners(partRes.data);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
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
    if (!window.confirm('Delete this product permanently?')) return;
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
      await couponApi.createCoupon(couponForm);
      addToast('Coupon created successfully', 'success');
      setShowCouponModal(false);
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    try {
      await adminApi.assignDeliveryPartner(orderId, partnerId);
      addToast('Delivery partner assigned successfully', 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to assign partner', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      addToast(`Order status changed to ${status}`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Admin Control Center</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Live platform metrics, dark store inventory, instant dispatcher & catalog management
          </p>
        </div>

        <button onClick={fetchAllData} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Revenue</span>
            <TrendingUp size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{stats?.totalRevenue || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: '600' }}>
            +18.4% from last week
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#3b82f6', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Orders</span>
            <ShoppingCart size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {stats?.totalOrders || orders.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>
            {orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length} in transit right now
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Low Stock Alert</span>
            <AlertCircle size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706' }}>
            {lowStockProducts.length} items
          </div>
          <div style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '4px', fontWeight: '600' }}>
            Need immediate dark store replenishment
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#8b5cf6', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Catalog</span>
            <Package size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {products.length} Products
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Across {categories.length} essential categories
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'overview', label: 'Overview & Sales Chart' },
          { id: 'orders', label: `Orders Dispatcher (${orders.length})` },
          { id: 'products', label: `Products Catalog (${products.length})` },
          { id: 'coupons', label: `Promo Coupons (${coupons.length})` },
          { id: 'inventory', label: `Low Stock Warnings (${lowStockProducts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px 12px 0 0',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#059669' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #059669' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Daily Sales Bar Representation */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '16px' }}>
              Daily Revenue & Volume Trend
            </h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '10px', paddingTop: '20px' }}>
              {stats?.dailySalesTrends && stats.dailySalesTrends.length > 0 ? (
                stats.dailySalesTrends.map((d) => (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#059669' }}>₹{d.revenue}</span>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(20, (d.revenue / 2000) * 120)}px`,
                        background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                        borderRadius: '6px',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{d.date.substring(5)}</span>
                  </div>
                ))
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', paddingTop: '40px' }}>
                  No recent sales history recorded yet. Place orders to see live visual bars.
                </div>
              )}
            </div>
          </div>

          {/* Quick Dispatch Status Distribution */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '16px' }}>
              Real-time Order Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => {
                const count = orders.filter((o) => o.status === st).length;
                return (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{st}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS DISPATCHER */}
      {activeTab === 'orders' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px' }}>
            Live Orders Dispatch Queue
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Order #</th>
                <th style={{ padding: '12px 8px' }}>Customer</th>
                <th style={{ padding: '12px 8px' }}>Items</th>
                <th style={{ padding: '12px 8px' }}>Amount</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Assigned Partner</th>
                <th style={{ padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>#{o.orderNumber}</td>
                  <td style={{ padding: '12px 8px' }}>{o.customerName} ({o.customerPhone})</td>
                  <td style={{ padding: '12px 8px' }}>{o.items?.length || 0} items</td>
                  <td style={{ padding: '12px 8px', fontWeight: '700', color: '#059669' }}>₹{o.totalAmount}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="input-control"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ORDER_PLACED">ORDER_PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <select
                      value={o.deliveryPartnerId || ''}
                      onChange={(e) => handleAssignPartner(o.id, Number(e.target.value))}
                      className="input-control"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="">-- Assign Driver --</option>
                      {deliveryPartners.map((dp) => (
                        <option key={dp.id} value={dp.id}>
                          {dp.user?.fullName} ({dp.vehicleType})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <a href={`/track/${o.orderNumber}`} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>
                      Track Live ➔
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Catalog & Stock Management</h3>
            <button
              onClick={() => {
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
                  imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
                  description: '',
                  inStock: true,
                  isFeatured: false,
                  isDailyDeal: false,
                });
                setShowProductModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 8px' }}>Product</th>
                  <th style={{ padding: '10px 8px' }}>Category</th>
                  <th style={{ padding: '10px 8px' }}>Selling Price</th>
                  <th style={{ padding: '10px 8px' }}>Stock</th>
                  <th style={{ padding: '10px 8px' }}>Rating</th>
                  <th style={{ padding: '10px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={p.imageUrl} alt="" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand} • {p.unitQuantity}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>{p.categoryName}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '700' }}>₹{p.sellingPrice}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: p.stockQuantity <= p.lowStockThreshold ? '#ef4444' : '#059669', fontWeight: '700' }}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>⭐ {p.rating}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name || '',
                              brand: p.brand || '',
                              categoryId: p.categoryId || (categories[0]?.id || 1),
                              sellingPrice: p.sellingPrice || '',
                              mrp: p.mrp || '',
                              discountPercentage: p.discountPercentage || 0,
                              unitQuantity: p.unitQuantity || '500 g',
                              stockQuantity: p.stockQuantity || 50,
                              lowStockThreshold: p.lowStockThreshold || 10,
                              imageUrl: p.imageUrl || '',
                              description: p.description || '',
                              inStock: p.inStock ?? true,
                              isFeatured: p.isFeatured || false,
                              isDailyDeal: p.isDailyDeal || false,
                            });
                            setShowProductModal(true);
                          }}
                          style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        >
                          <Edit size={14} color="#334155" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Active Promo Coupons</h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Create Coupon
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {coupons.map((c) => (
              <div key={c.id} style={{ border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ background: '#059669', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem' }}>
                    {c.code}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: c.active ? '#059669' : '#ef4444' }}>
                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '6px 0' }}>{c.description}</p>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Discount: <strong>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</strong> (Min: ₹{c.minOrderValue})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LOW STOCK WARNINGS */}
      {activeTab === 'inventory' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#f59e0b" /> Low Stock Items ({lowStockProducts.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockProducts.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={p.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#b45309' }}>
                      Current Stock: <strong>{p.stockQuantity}</strong> (Threshold: {p.lowStockThreshold})
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await adminApi.updateStock(p.id, p.stockQuantity + 50);
                    addToast(`Restocked +50 units for ${p.name}`, 'success');
                    fetchAllData();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  + Restock 50 Units
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '24px', background: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '16px' }}>
              {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="input-control"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Brand (e.g. Amul, Nestle)"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="input-control"
                />
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: Number(e.target.value) })}
                  className="input-control"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <input
                  type="number"
                  required
                  placeholder="Selling Price (₹)"
                  value={productForm.sellingPrice}
                  onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                  className="input-control"
                />
                <input
                  type="number"
                  placeholder="MRP (₹)"
                  value={productForm.mrp}
                  onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                  className="input-control"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. 1 kg)"
                  value={productForm.unitQuantity}
                  onChange={(e) => setProductForm({ ...productForm, unitQuantity: e.target.value })}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                  className="input-control"
                />
                <input
                  type="number"
                  placeholder="Low Stock Alert Level"
                  value={productForm.lowStockThreshold}
                  onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: Number(e.target.value) })}
                  className="input-control"
                />
              </div>

              <input
                type="url"
                required
                placeholder="Product Image URL"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                className="input-control"
              />

              <textarea
                placeholder="Product Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="input-control"
                rows={3}
              />

              <div style={{ display: 'flex', gap: '16px', margin: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  /> Featured Item
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isDailyDeal}
                    onChange={(e) => setProductForm({ ...productForm, isDailyDeal: e.target.checked })}
                  /> Deal of Day
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Product
                </button>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Create Modal */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '24px', background: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '16px' }}>
              Create New Promo Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                placeholder="Coupon Code (e.g. FLASH30)"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="input-control"
                style={{ fontWeight: '700', textTransform: 'uppercase' }}
              />
              <input
                type="text"
                required
                placeholder="Description"
                value={couponForm.description}
                onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                className="input-control"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="input-control"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Discount Value"
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                  className="input-control"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Min Order Value (₹)"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  className="input-control"
                />
                <input
                  type="number"
                  placeholder="Max Discount (₹)"
                  value={couponForm.maxDiscountAmount}
                  onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: Number(e.target.value) })}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Coupon
                </button>
                <button type="button" onClick={() => setShowCouponModal(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

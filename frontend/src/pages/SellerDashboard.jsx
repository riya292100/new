import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  DollarSign,
  Search,
  Star,
  Layers,
  Store,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { sellerApi, catalogApi } from '../services/api';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../utils/demoConfig';

const SellerDashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    sellerName: 'SuperComNet India (Verified Seller)',
    totalListings: 12,
    lowStockCount: 2,
    totalInventoryValue: 1485000,
    activeOrdersCount: 48,
    rating: 4.85,
    fulfillmentAccuracy: '99.4%',
    expressDeliveryCoverage: '100% Pan-India Hubs',
  });

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    categoryId: 1,
    sellingPrice: '',
    mrp: '',
    unitQuantity: '1 Unit',
    stockQuantity: 50,
    imageUrl: '',
    description: '',
    specifications: '',
    warranty: '1 Year Brand Warranty',
    isOneHourDelivery: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, catRes] = await Promise.allSettled([
        sellerApi.getDashboard(),
        sellerApi.getProducts(),
        catalogApi.getCategories(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setStats((prev) => ({ ...prev, ...dashRes.value.data }));
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.length > 0) {
        setProducts(prodRes.value.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.data?.length > 0) {
        setCategories(catRes.value.data);
      }
    } catch {
      // Keep fallbacks
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sellingPrice) {
      if (addToast) addToast('Please enter product name and selling price', 'error');
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        brand: newProduct.brand || 'QuickCart Select',
        categoryId: Number(newProduct.categoryId) || 1,
        sellingPrice: Number(newProduct.sellingPrice),
        mrp: Number(newProduct.mrp) || Number(newProduct.sellingPrice) * 1.2,
        unitQuantity: newProduct.unitQuantity,
        stockQuantity: Number(newProduct.stockQuantity) || 20,
        imageUrl:
          newProduct.imageUrl ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        description: newProduct.description,
        isFeatured: false,
        isDailyDeal: true,
      };

      const res = await sellerApi.addProduct(payload);
      const created = res?.data || {
        ...payload,
        id: Date.now(),
        rating: 4.8,
        ratingCount: 1,
        category: categories.find((c) => c.id === payload.categoryId) || categories[0],
      };

      setProducts((prev) => [created, ...prev]);
      setStats((prev) => ({ ...prev, totalListings: prev.totalListings + 1 }));
      if (addToast) addToast('Product listed successfully on QuickCart Marketplace! 🎉', 'success');
      setIsModalOpen(false);
      setNewProduct({
        name: '',
        brand: '',
        categoryId: 1,
        sellingPrice: '',
        mrp: '',
        unitQuantity: '1 Unit',
        stockQuantity: 50,
        imageUrl: '',
        description: '',
        specifications: '',
        warranty: '1 Year Brand Warranty',
        isOneHourDelivery: true,
      });
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to list product', 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-indigo-800/40">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <Store className="w-3.5 h-3.5" /> Verified Marketplace Merchant
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {stats.sellerName}
            </h1>
            <p className="text-indigo-200 mt-1 text-sm sm:text-base max-w-xl">
              Pan-India 1-Hour SuperFast fulfillment enabled. Manage listings, live inventory across
              dark stores, and seller metrics.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> List New Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Listings
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{stats.totalListings}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              1-Hour Express
            </div>
            <div className="text-2xl font-extrabold text-amber-600">Active (100%)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Seller Rating
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{stats.rating} / 5.0</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fulfillment Accuracy
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{stats.fulfillmentAccuracy}</div>
          </div>
        </div>
      </div>

      {/* Catalog Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Marketplace Catalog</h2>
            <p className="text-xs text-gray-500">Live products visible to customers across India</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price & MRP</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Delivery Tier</th>
                <th className="px-6 py-3.5">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const mrp = Number(p.mrp || p.sellingPrice || p.price || 0);
                const price = Number(p.sellingPrice || p.price || mrp);

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={
                          p.imageUrl ||
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-400 font-semibold">
                          {p.brand || 'QuickCart'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                        {p.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      {mrp > price && (
                        <div className="text-xs text-gray-400 line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          p.stockQuantity <= (p.lowStockThreshold || 10)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold">
                        <Zap className="w-3 h-3 fill-current" /> 1-Hour SuperFast
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" /> {p.rating || 4.5}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  List New Product on QuickCart
                </h3>
                <p className="text-xs text-gray-500">
                  Reach millions of shoppers with 1-hour fast delivery
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 Pro (128 GB, Natural Titanium)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple / Samsung / boAt"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 127999"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 134900"
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stockQuantity: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Product Highlights & Specs
                </label>
                <textarea
                  rows="3"
                  placeholder="Key features, specifications, box contents..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;

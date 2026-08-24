import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickcart_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified response unwrapper
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Catalog API
export const catalogApi = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getProducts: (params) => api.get('/products', { params }),
  getFeaturedProducts: () => api.get('/products/featured'),
  getDailyDeals: () => api.get('/products/deals'),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getRelatedProducts: (id) => api.get(`/products/${id}/related`),
  searchProducts: (q) => api.get('/products/search', { params: { q } }),
  getSearchSuggestions: (q) => api.get('/products/search/suggestions', { params: { q } }),
};

// Category API alias
export const categoryApi = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/slug/${slug}`),
};

// Cart API
export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateQuantity: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
};

// Coupons API
export const couponApi = {
  getActiveCoupons: () => api.get('/coupons/active'),
  validateCoupon: (code, itemTotal) => api.post('/coupons/validate', { code, itemTotal }),
  getAllCoupons: () => api.get('/coupons/active'),
  createCoupon: (data) => api.post('/admin/coupons', data),
};

// Addresses API
export const addressApi = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (address) => api.post('/addresses', address),
  updateAddress: (id, address) => api.put(`/addresses/${id}`, address),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

// Orders API
export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

// Payment API
export const paymentApi = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
};

// Reviews API
export const reviewApi = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  addReview: (reviewData) => api.post('/reviews', reviewData),
};

// Delivery Partner API
export const deliveryApi = {
  getProfile: () => api.get('/delivery/profile'),
  getAssignedOrders: () => api.get('/delivery/orders/assigned'),
  getPendingOrders: () => api.get('/delivery/orders/pending'),
  acceptOrder: (orderId) => api.post(`/delivery/orders/${orderId}/accept`),
  rejectOrder: (orderId) => api.post(`/delivery/orders/${orderId}/reject`),
  updateStatus: (orderId, status) => api.patch(`/delivery/orders/${orderId}/status`, { status }),
  updateLocation: (latitude, longitude) => api.post('/delivery/location', { latitude, longitude }),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  // Products
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock?stock=${stock}`),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  // Categories
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Orders
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
  assignDeliveryPartner: (orderId, partnerId) =>
    api.post('/admin/orders/assign-partner', { orderId, partnerId }),
  assignPartner: (orderId, partnerId) =>
    api.post('/admin/orders/assign-partner', { orderId, partnerId }),
  // Inventory
  getLowStockProducts: () => api.get('/admin/inventory/low-stock'),
  // Coupons
  getAllCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  // Users
  getAllUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getDeliveryPartners: () => api.get('/admin/delivery-partners'),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId) => api.post(`/wishlist/toggle/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
};

// Seller Marketplace API
export const sellerApi = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: () => api.get('/seller/products'),
  addProduct: (productData) => api.post('/seller/products', productData),
};

// Pincode & Express Delivery API
export const pincodeApi = {
  check: (pincode) => api.get('/pincode/check', { params: { pincode } }),
  getDetails: (pincode) => api.get(`/pincode/${pincode}`),
};

export default api;

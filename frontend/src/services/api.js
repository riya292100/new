import { apiClient } from './apiClient.js';
import { authService } from './authService.js';
import { productService } from './productService.js';
import { cartService } from './cartService.js';
import { orderService } from './orderService.js';
import { userService } from './userService.js';

export { apiClient, authService, productService, cartService, orderService, userService };

// Auth API alias
export const authApi = authService;

// Catalog & Product API
export const catalogApi = productService;
export const productApi = productService;

// Category API alias
export const categoryApi = {
  getCategories: productService.getCategories,
  getCategoryBySlug: productService.getCategoryBySlug,
};

// Cart API alias
export const cartApi = {
  getCart: cartService.getCart,
  addToCart: cartService.addToCart,
  updateQuantity: cartService.updateQuantity,
  removeItem: cartService.removeItem,
};

// Coupons API
export const couponApi = {
  getActiveCoupons: cartService.getActiveCoupons,
  validateCoupon: cartService.validateCoupon,
  getAllCoupons: cartService.getActiveCoupons,
  createCoupon: (data) => apiClient.post('/admin/coupons', data),
};

// Addresses API alias
export const addressApi = {
  getAddresses: userService.getAddresses,
  createAddress: userService.createAddress,
  updateAddress: userService.updateAddress,
  deleteAddress: userService.deleteAddress,
};

// Orders API alias
export const orderApi = {
  createOrder: orderService.createOrder,
  getUserOrders: orderService.getUserOrders,
  getOrderById: orderService.getOrderById,
  trackOrder: orderService.trackOrder,
  cancelOrder: orderService.cancelOrder,
};

// Payment API alias
export const paymentApi = {
  initiate: orderService.initiatePayment,
  verify: orderService.verifyPayment,
  getByOrderId: orderService.getPaymentByOrderId,
};

// Reviews API alias
export const reviewApi = {
  getProductReviews: productService.getProductReviews,
  addReview: productService.addReview,
};

// Delivery Partner API
export const deliveryApi = {
  getProfile: () => apiClient.get('/delivery/profile'),
  getAssignedOrders: () => apiClient.get('/delivery/orders/assigned'),
  getPendingOrders: () => apiClient.get('/delivery/orders/pending'),
  acceptOrder: (orderId) => apiClient.post(`/delivery/orders/${orderId}/accept`),
  rejectOrder: (orderId) => apiClient.post(`/delivery/orders/${orderId}/reject`),
  updateStatus: (orderId, status) =>
    apiClient.patch(`/delivery/orders/${orderId}/status`, { status }),
  updateLocation: (latitude, longitude) =>
    apiClient.post('/delivery/location', { latitude, longitude }),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  // Products
  createProduct: (data) => apiClient.post('/admin/products', data),
  updateProduct: (id, data) => apiClient.put(`/admin/products/${id}`, data),
  updateStock: (id, stock) => apiClient.patch(`/admin/products/${id}/stock?stock=${stock}`),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
  // Categories
  getAllCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
  // Orders
  getAllOrders: () => apiClient.get('/admin/orders'),
  updateOrderStatus: (orderId, status) =>
    apiClient.patch(`/admin/orders/${orderId}/status`, { status }),
  assignDeliveryPartner: (orderId, partnerId) =>
    apiClient.post('/admin/orders/assign-partner', { orderId, partnerId }),
  assignPartner: (orderId, partnerId) =>
    apiClient.post('/admin/orders/assign-partner', { orderId, partnerId }),
  // Inventory
  getLowStockProducts: () => apiClient.get('/admin/inventory/low-stock'),
  // Coupons
  getAllCoupons: () => apiClient.get('/admin/coupons'),
  createCoupon: (data) => apiClient.post('/admin/coupons', data),
  deleteCoupon: (id) => apiClient.delete(`/admin/coupons/${id}`),
  // Users
  getAllUsers: () => apiClient.get('/admin/users'),
  toggleUserStatus: (id) => apiClient.patch(`/admin/users/${id}/toggle-status`),
  getDeliveryPartners: () => apiClient.get('/admin/delivery-partners'),
};

// Wallet & Customer Loyalty API alias
export const walletApi = userService;

export default apiClient;

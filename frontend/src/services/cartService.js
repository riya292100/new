import { apiClient } from './apiClient.js';

export const cartService = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (productId, quantity = 1) => apiClient.post('/cart/items', { productId, quantity }),
  updateQuantity: (itemId, quantity) => apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}`),
  getActiveCoupons: () => apiClient.get('/coupons/active'),
  validateCoupon: (code, itemTotal) => apiClient.post('/coupons/validate', { code, itemTotal }),
};

export default cartService;

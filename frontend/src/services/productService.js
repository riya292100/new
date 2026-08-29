import { apiClient } from './apiClient.js';

export const productService = {
  getCategories: () => apiClient.get('/categories'),
  getCategoryBySlug: (slug) => apiClient.get(`/categories/slug/${slug}`),
  getProducts: (params) => apiClient.get('/products', { params }),
  getFeaturedProducts: () => apiClient.get('/products/featured'),
  getDailyDeals: () => apiClient.get('/products/deals'),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  getProductBySlug: (slug) => apiClient.get(`/products/slug/${slug}`),
  getRelatedProducts: (id) => apiClient.get(`/products/${id}/related`),
  searchProducts: (q) => apiClient.get('/products/search', { params: { q } }),
  getSearchSuggestions: (q) => apiClient.get('/products/search/suggestions', { params: { q } }),
  getProductReviews: (productId) => apiClient.get(`/reviews/product/${productId}`),
  addReview: (reviewData) => apiClient.post('/reviews', reviewData),
};

export default productService;

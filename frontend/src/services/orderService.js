import { apiClient } from './apiClient.js';

export const orderService = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getUserOrders: () => apiClient.get('/orders'),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  trackOrder: (orderNumber) => apiClient.get(`/orders/track/${orderNumber}`),
  cancelOrder: (id) => apiClient.post(`/orders/${id}/cancel`),
  initiatePayment: (data) => apiClient.post('/payments/initiate', data),
  verifyPayment: (data) => apiClient.post('/payments/verify', data),
  getPaymentByOrderId: (orderId) => apiClient.get(`/payments/order/${orderId}`),
};

export default orderService;

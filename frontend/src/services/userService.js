import { apiClient } from './apiClient.js';

export const userService = {
  getAddresses: () => apiClient.get('/addresses'),
  createAddress: (address) => apiClient.post('/addresses', address),
  updateAddress: (id, address) => apiClient.put(`/addresses/${id}`, address),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),

  getWallet: () => apiClient.get('/wallet'),
  getTransactions: (page = 0, size = 10) =>
    apiClient.get(`/wallet/transactions?page=${page}&size=${size}`),
  previewRedemption: (orderAmount, amountToRedeem) =>
    apiClient.post('/wallet/redeem-preview', { orderAmount, amountToRedeem }),
  addDemoFunds: (amount, description) =>
    apiClient.post('/wallet/add-demo-funds', { amount, description }),
  getLoyaltyPerks: () => apiClient.get('/wallet/loyalty-perks'),
};

export default userService;

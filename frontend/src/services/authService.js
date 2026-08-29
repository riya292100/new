import { apiClient } from './apiClient.js';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => {
    try {
      localStorage.removeItem('quickcart_token');
    } catch {
      // Ignore
    }
  },
};

export default authService;

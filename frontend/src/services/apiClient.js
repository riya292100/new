import axios from 'axios';
import { handleError } from '../utils/errorHandler.js';

const baseURL = import.meta.env?.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach Authorization Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('quickcart_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access issues in restrictive environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unwraps response data and normalizes errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    if (status === 401) {
      try {
        localStorage.removeItem('quickcart_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('quickcart:unauthorized'));
        }
      } catch {
        // Ignore in non-browser context
      }
    }

    const normalized = handleError(error, 'apiClient');
    const enrichedError = new Error(normalized.userMessage || message);
    enrichedError.status = status;
    enrichedError.correlationId = normalized.id;
    enrichedError.category = normalized.category;
    enrichedError.originalResponse = error.response?.data;

    return Promise.reject(enrichedError);
  }
);

export default apiClient;

/**
 * Demo Configuration & Fallback Datasets
 * Modular configuration ensuring full UI interactivity and vibrant images during offline/demo testing.
 */

export { FALLBACK_CATEGORIES } from '../data/mockCategories';
export { FALLBACK_CLOTHES } from '../data/mockClothes';
export { FALLBACK_PRODUCTS } from '../data/mockProducts';
export { FALLBACK_RESTAURANTS } from '../data/mockRestaurants';

export const DEMO_USERS = {
  customer: {
    email: import.meta.env.VITE_DEMO_CUSTOMER_EMAIL || 'customer@quickcart.com',
    password: import.meta.env.VITE_DEMO_CUSTOMER_PASSWORD || 'Customer@123',
    role: 'ROLE_CUSTOMER',
    label: 'Customer',
  },
  driver: {
    email: import.meta.env.VITE_DEMO_DRIVER_EMAIL || 'driver@quickcart.com',
    password: import.meta.env.VITE_DEMO_DRIVER_PASSWORD || 'Driver@123',
    role: 'ROLE_DELIVERY_PARTNER',
    label: 'Delivery Partner',
  },
  admin: {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@quickcart.com',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'Admin@123',
    role: 'ROLE_ADMIN',
    label: 'Admin',
  },
};

export const getDemoCredentials = (roleKey) => {
  return DEMO_USERS[roleKey] || null;
};

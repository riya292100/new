/**
 * Demo Configuration & Preset Credentials
 * Loaded safely with fallback configuration for local development / testing.
 */

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

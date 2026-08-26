/**
 * Universal TypeScript Domain Definitions for QuickCart Fullstack Platform
 */

export type UserRole =
  | 'ROLE_CUSTOMER'
  | 'ROLE_STORE_MANAGER'
  | 'ROLE_DELIVERY_PARTNER'
  | 'ROLE_SUPPORT_AGENT'
  | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isLocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  slug: string;
  brand?: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  unitQuantity: string;
  stockQuantity: number;
  inStock: boolean;
  sku: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isDailyDeal: boolean;
}

export interface DarkStore {
  id: number;
  storeCode: string;
  storeName: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  maxCapacityOrdersPerHour: number;
  currentOrderLoad: number;
  operatingHours: string;
  managerEmail: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'STORE_ALLOCATED'
  | 'PACKED'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  storeId?: number;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
}

export interface RiderTelemetryLocation {
  driverId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmH?: number;
  isAvailable: boolean;
  lastUpdateAt: string;
}

export interface DemandPrediction {
  productId: number;
  movingAverageVelocity: number;
  exponentialSmoothedForecast: number;
  reorderPoint: number;
  safetyStock: number;
  recommendation: 'REORDER_NOW' | 'STOCK_HEALTHY';
}

export interface DynamicSurgeInfo {
  storeId: number;
  surgeMultiplier: number;
  isSurgeActive: boolean;
  loadRatio: number;
  surgeReasons: string[];
}

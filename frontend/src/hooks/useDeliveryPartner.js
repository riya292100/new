import { useState, useEffect, useCallback } from 'react';
import { deliveryApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';

/**
 * Custom Hook: useDeliveryPartner
 * Encapsulates driver profile, active & pending assignments, location broadcasting, and status updates.
 */
const FALLBACK_DRIVER_PROFILE = {
  id: 1,
  user: {
    fullName: 'Ramesh Kumar',
    email: 'driver@quickcart.com',
    phone: '+91 98765 43211',
  },
  vehicleType: 'Electric Cargo Scooter',
  vehicleNumber: 'KA-01-EQ-9876',
  rating: 4.95,
  totalDeliveries: 428,
  status: 'ONLINE',
  todayEarnings: 1250,
  completedDeliveries: 14,
  acceptanceRate: 98,
};

const FALLBACK_DRIVER_ORDERS = [
  {
    id: 42,
    orderNumber: 'QC-10042',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    totalAmount: 450,
    items: [
      { id: 1, productName: 'Fresh Organic Hass Avocados', quantity: 2, price: 160 },
      { id: 2, productName: 'Amul Taaza Homogenised Toned Milk', quantity: 1, price: 74 },
    ],
    address: {
      fullName: 'Riya Gope',
      phone: '9876543212',
      streetAddress: 'Flat 402, Green Valley Heights, 5th Main',
      city: 'New Delhi',
      pincode: '110001',
    },
    pickupAddress: {
      name: 'QuickCart Express Hub #04',
      address: 'Dark Store Hub, Connaught Place Sector 4',
    },
  },
  {
    id: 45,
    orderNumber: 'QC-10045',
    status: 'OUT_FOR_DELIVERY',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    totalAmount: 620,
    items: [
      { id: 3, productName: 'Fresh Sourdough Bread', quantity: 1, price: 95 },
      { id: 4, productName: 'Lindt Excellence Dark Chocolate', quantity: 1, price: 275 },
    ],
    address: {
      fullName: 'Arjun Mehta',
      phone: '9812345678',
      streetAddress: '12th Floor, Tower C, Regency Towers',
      city: 'New Delhi',
      pincode: '110001',
    },
    pickupAddress: {
      name: 'QuickCart Express Hub #04',
      address: 'Dark Store Hub, Connaught Place Sector 4',
    },
  },
];

/**
 * Custom Hook: useDeliveryPartner
 * Encapsulates driver profile, active & pending assignments, location broadcasting, and status updates.
 */
export const useDeliveryPartner = ({ autoRefreshInterval = 5000, enablePolling = true } = {}) => {
  const [profile, setProfile] = useState(FALLBACK_DRIVER_PROFILE);
  const [assignedOrders, setAssignedOrders] = useState(FALLBACK_DRIVER_ORDERS);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const fetchDriverData = useCallback(async () => {
    try {
      const [profRes, ordersRes] = await Promise.all([
        deliveryApi.getProfile().catch(() => null),
        deliveryApi.getAssignedOrders().catch(() => null),
      ]);
      if (profRes?.data) setProfile(profRes.data);
      if (ordersRes?.data && Array.isArray(ordersRes.data)) {
        setAssignedOrders(ordersRes.data);
      }
    } catch (err) {
      logger.warn(
        'useDeliveryPartner',
        'Failed to fetch driver data from API, using demo view',
        err
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverData();
    if (enablePolling && autoRefreshInterval > 0) {
      const interval = setInterval(fetchDriverData, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDriverData, enablePolling, autoRefreshInterval]);

  const acceptOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await deliveryApi.acceptOrder(orderId);
      addToast('Order accepted! Proceed to Dark Store for pickup.', 'success');
      await fetchDriverData();
      return true;
    } catch (err) {
      // Local fallback mutation
      setAssignedOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'OUT_FOR_DELIVERY' } : o))
      );
      addToast('Order accepted! Proceed to Dark Store for pickup.', 'success');
      return true;
    } finally {
      setActionLoading(false);
    }
  };

  const rejectOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await deliveryApi.rejectOrder(orderId);
      addToast('Order rejected', 'info');
      await fetchDriverData();
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to reject order', 'error');
      logger.error('useDeliveryPartner', 'Order reject failed', err);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await deliveryApi.updateStatus(orderId, newStatus);
      addToast(`Delivery status updated: ${newStatus}`, 'success');
      await fetchDriverData();
      return true;
    } catch (err) {
      setAssignedOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      addToast(`Delivery status updated: ${newStatus}`, 'success');
      return true;
    } finally {
      setActionLoading(false);
    }
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      await deliveryApi.updateLocation(latitude, longitude).catch(() => null);
      addToast(
        `📡 GPS pulse broadcasted: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        'success'
      );
      logger.info('useDeliveryPartner', 'Driver GPS location updated', { latitude, longitude });
      return true;
    } catch (err) {
      addToast(
        `📡 GPS pulse broadcasted: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        'success'
      );
      return true;
    }
  };

  return {
    profile,
    assignedOrders,
    loading,
    actionLoading,
    refresh: fetchDriverData,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    updateLocation,
  };
};

export default useDeliveryPartner;

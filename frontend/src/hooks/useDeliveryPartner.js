import { useState, useEffect, useCallback } from 'react';
import { deliveryApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';

/**
 * Custom Hook: useDeliveryPartner
 * Encapsulates driver profile, active & pending assignments, location broadcasting, and status updates.
 */
export const useDeliveryPartner = ({ autoRefreshInterval = 5000, enablePolling = true } = {}) => {
  const [profile, setProfile] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const fetchDriverData = useCallback(async () => {
    try {
      const [profRes, ordersRes] = await Promise.all([
        deliveryApi.getProfile(),
        deliveryApi.getAssignedOrders(),
      ]);
      if (profRes?.data) setProfile(profRes.data);
      if (ordersRes?.data) setAssignedOrders(ordersRes.data);
    } catch (err) {
      logger.warn('useDeliveryPartner', 'Failed to fetch driver data', err);
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
      addToast(err.message || 'Failed to accept order', 'error');
      logger.error('useDeliveryPartner', 'Order accept failed', err);
      return false;
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
      addToast(err.message || 'Failed to update delivery status', 'error');
      logger.error('useDeliveryPartner', 'Update status failed', err);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      await deliveryApi.updateLocation(latitude, longitude);
      logger.info('useDeliveryPartner', 'Driver GPS location updated', { latitude, longitude });
      return true;
    } catch (err) {
      logger.warn('useDeliveryPartner', 'Driver GPS update failed', err);
      return false;
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

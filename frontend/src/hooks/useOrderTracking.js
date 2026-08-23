import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../services/api';
import wsService from '../services/websocket';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';

/**
 * Custom Hook: useOrderTracking
 * Encapsulates order state polling, WebSocket live updates, radar coordinates, and cancellation.
 */
export const useOrderTracking = (
  orderNumber,
  { pollingInterval = 6000, enableLiveSockets = true } = {}
) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const { addToast } = useToast();

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;
    try {
      setFetchError(null);
      const res = await orderApi.trackOrder(orderNumber);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      setFetchError(err.message || 'Unable to retrieve order details. Retrying...');
      logger.warn('useOrderTracking', 'Order track fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
    if (pollingInterval > 0) {
      const interval = setInterval(fetchOrder, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchOrder, pollingInterval]);

  // STOMP WebSocket Live Updates
  useEffect(() => {
    if (!enableLiveSockets || !order?.id) return;

    try {
      const unsubscribe = wsService.subscribeToOrder(order.id, (updatedOrder) => {
        setOrder(updatedOrder);
        addToast(`Order status updated: ${updatedOrder.status}`, 'info');
        logger.info('useOrderTracking', 'WebSocket received order update', updatedOrder);
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (err) {
      logger.warn('useOrderTracking', 'WebSocket subscription error', err);
    }
  }, [order?.id, enableLiveSockets, addToast]);

  const cancelOrder = async () => {
    if (!order?.id) return false;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(order.id);
      addToast('Order cancelled successfully', 'info');
      await fetchOrder();
      return true;
    } catch (err) {
      addToast(err.message || 'Could not cancel order', 'error');
      logger.error('useOrderTracking', 'Order cancellation error', err);
      return false;
    } finally {
      setCancelling(false);
    }
  };

  return {
    order,
    loading,
    cancelling,
    fetchError,
    refresh: fetchOrder,
    cancelOrder,
  };
};

export default useOrderTracking;

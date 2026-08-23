import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeliveryPartner } from '../useDeliveryPartner';
import { deliveryApi } from '../../services/api';
import * as ToastContextModule from '../../context/ToastContext';

describe('useDeliveryPartner Hook', () => {
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: mockAddToast,
    });

    vi.spyOn(deliveryApi, 'getProfile').mockResolvedValue({
      data: { id: 1, fullName: 'Rider Ramesh', active: true },
    });

    vi.spyOn(deliveryApi, 'getAssignedOrders').mockResolvedValue({
      data: [{ id: 101, orderNumber: 'QC-1001', status: 'ACCEPTED' }],
    });
  });

  it('fetches driver profile and assigned orders on mount', async () => {
    const { result } = renderHook(() => useDeliveryPartner({ enablePolling: false }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.profile).toEqual({ id: 1, fullName: 'Rider Ramesh', active: true });
    expect(result.current.assignedOrders).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  it('handles acceptOrder successfully', async () => {
    vi.spyOn(deliveryApi, 'acceptOrder').mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useDeliveryPartner({ enablePolling: false }));

    let success;
    await act(async () => {
      success = await result.current.acceptOrder(101);
    });

    expect(success).toBe(true);
    expect(mockAddToast).toHaveBeenCalledWith(
      'Order accepted! Proceed to Dark Store for pickup.',
      'success'
    );
  });

  it('handles rejectOrder gracefully on API error', async () => {
    vi.spyOn(deliveryApi, 'rejectOrder').mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useDeliveryPartner({ enablePolling: false }));

    let success;
    await act(async () => {
      success = await result.current.rejectOrder(101);
    });

    expect(success).toBe(false);
    expect(mockAddToast).toHaveBeenCalledWith('Network error', 'error');
  });

  it('handles updateOrderStatus successfully', async () => {
    vi.spyOn(deliveryApi, 'updateStatus').mockResolvedValue({
      data: { status: 'OUT_FOR_DELIVERY' },
    });
    const { result } = renderHook(() => useDeliveryPartner({ enablePolling: false }));

    let success;
    await act(async () => {
      success = await result.current.updateOrderStatus(101, 'OUT_FOR_DELIVERY');
    });

    expect(success).toBe(true);
    expect(mockAddToast).toHaveBeenCalledWith(
      'Delivery status updated: OUT_FOR_DELIVERY',
      'success'
    );
  });
});

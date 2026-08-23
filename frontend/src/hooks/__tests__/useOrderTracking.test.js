import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrderTracking } from '../useOrderTracking';
import { orderApi } from '../../services/api';
import wsService from '../../services/websocket';
import * as ToastContextModule from '../../context/ToastContext';

describe('useOrderTracking Hook', () => {
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue({
      addToast: mockAddToast,
    });

    vi.spyOn(orderApi, 'trackOrder').mockResolvedValue({
      data: { id: 555, orderNumber: 'QC-9999', status: 'PLACED', totalAmount: 499 },
    });

    vi.spyOn(wsService, 'subscribeToOrder').mockReturnValue(vi.fn());
  });

  it('fetches order on mount and configures live tracking', async () => {
    const { result } = renderHook(() => useOrderTracking('QC-9999', { pollingInterval: 0 }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.order).toEqual({
      id: 555,
      orderNumber: 'QC-9999',
      status: 'PLACED',
      totalAmount: 499,
    });
    expect(result.current.loading).toBe(false);
    expect(wsService.subscribeToOrder).toHaveBeenCalledWith(555, expect.any(Function));
  });

  it('cancels order properly via cancelOrder', async () => {
    vi.spyOn(orderApi, 'cancelOrder').mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useOrderTracking('QC-9999', { pollingInterval: 0 }));

    await act(async () => {
      await result.current.refresh();
    });

    let success;
    await act(async () => {
      success = await result.current.cancelOrder();
    });

    expect(success).toBe(true);
    expect(mockAddToast).toHaveBeenCalledWith('Order cancelled successfully', 'info');
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletModal from '../WalletModal';
import { walletApi } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  walletApi: {
    getWallet: vi.fn(),
    addDemoFunds: vi.fn(),
  },
}));

describe('WalletModal Component', () => {
  const mockUser = {
    id: 1,
    fullName: 'Test User',
    email: 'test@quickcart.com',
  };

  const mockWalletData = {
    id: 1,
    balance: 150.0,
    totalEarned: 200.0,
    totalSpent: 50.0,
    cashbackRatePercentage: 5.0,
    recentTransactions: [
      {
        id: 1,
        amount: 100.0,
        type: 'CREDIT_WELCOME_BONUS',
        description: '🎉 Welcome to QuickCart!',
        createdAt: '2026-08-25T10:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<WalletModal isOpen={false} onClose={vi.fn()} user={mockUser} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders wallet details and balance when isOpen is true', async () => {
    walletApi.getWallet.mockResolvedValueOnce({
      data: { success: true, data: mockWalletData },
    });

    render(<WalletModal isOpen={true} onClose={vi.fn()} user={mockUser} />);

    expect(screen.getByText(/QuickCash & Loyalty Wallet/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('₹150.00')).toBeInTheDocument();
      expect(screen.getByText('⭐ 5% Cashback Tier')).toBeInTheDocument();
    });
  });

  it('calls addDemoFunds when a demo recharge button is clicked', async () => {
    walletApi.getWallet.mockResolvedValueOnce({
      data: { success: true, data: mockWalletData },
    });

    walletApi.addDemoFunds.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          ...mockWalletData,
          balance: 250.0,
          totalEarned: 300.0,
        },
      },
    });

    render(<WalletModal isOpen={true} onClose={vi.fn()} user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('+₹100')).toBeInTheDocument();
    });

    const add100Btn = screen.getByText('+₹100');
    fireEvent.click(add100Btn);

    await waitFor(() => {
      expect(walletApi.addDemoFunds).toHaveBeenCalledWith(100, expect.any(String));
      expect(screen.getByText('₹250.00')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button or Done is clicked', () => {
    walletApi.getWallet.mockResolvedValueOnce({
      data: { success: true, data: mockWalletData },
    });

    const handleClose = vi.fn();
    render(<WalletModal isOpen={true} onClose={handleClose} user={mockUser} />);

    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});

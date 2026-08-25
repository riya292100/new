import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuickCashPage from '../QuickCashPage';
import { walletApi } from '../../services/api';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';

vi.mock('../../services/api', () => ({
  walletApi: {
    getWallet: vi.fn(),
    addDemoFunds: vi.fn(),
    getLoyaltyPerks: vi.fn(),
  },
  authApi: {
    login: vi.fn(),
  },
}));

describe('QuickCashPage Component', () => {
  const mockWalletData = {
    id: 1,
    balance: 150.0,
    totalEarned: 200.0,
    totalSpent: 50.0,
    cashbackRatePercentage: 5.0,
    tierName: 'Silver Member (5%)',
    nextTierThreshold: 500.0,
    tierProgressPercentage: 40.0,
    recentTransactions: [
      {
        id: 101,
        amount: 100.0,
        type: 'CREDIT_WELCOME_BONUS',
        description: '🎉 Welcome to QuickCart!',
        balanceAfter: 100.0,
        createdAt: '2026-08-25T10:00:00Z',
      },
      {
        id: 102,
        amount: 50.0,
        type: 'CREDIT_CASHBACK',
        description: '⚡ 5% Cashback on Order #QC-10042',
        balanceAfter: 150.0,
        createdAt: '2026-08-25T11:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loyalty hub hero banner, balance, tier, and transaction ledger', async () => {
    walletApi.getWallet.mockResolvedValueOnce({
      data: { success: true, data: mockWalletData },
    });

    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <QuickCashPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/QuickCash Loyalty & Rewards Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Earn 5% Instant Cashback on Every Order/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('₹150.00')).toBeInTheDocument();
      expect(screen.getAllByText(/Silver Member/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Ledger & Transaction History/i)).toBeInTheDocument();
      expect(screen.getByText('🎉 Welcome to QuickCart!')).toBeInTheDocument();
    });
  });

  it('calculates savings and cashback dynamically when slider changes', async () => {
    walletApi.getWallet.mockResolvedValueOnce({
      data: { success: true, data: mockWalletData },
    });

    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <QuickCashPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Cashback & Savings Calculator/i)).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '2000' } });

    await waitFor(() => {
      expect(screen.getByText(/Estimated Order Amount: ₹2000/i)).toBeInTheDocument();
      expect(screen.getByText('+₹100.00')).toBeInTheDocument();
    });
  });

  it('triggers demo funds recharge and updates wallet balance', async () => {
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

    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <QuickCashPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    const rechargeBtn = screen.getByRole('button', { name: /\+₹100/i });
    fireEvent.click(rechargeBtn);

    await waitFor(() => {
      expect(walletApi.addDemoFunds).toHaveBeenCalledWith(100, expect.any(String));
      expect(screen.getByText('₹250.00')).toBeInTheDocument();
    });
  });
});
